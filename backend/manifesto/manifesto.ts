import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { secret } from "encore.dev/config";
import { manifestoDB } from "./db";
import { createProposalTranslations } from "./translations";
import type { ManifestoVersion, ManifestoProposal, CreateProposalRequest, VoteRequest } from "./types";
import { clerkClient } from "../auth/auth";

// Define secret at module level
const clerkSecretKey = secret("ClerkSecretKey");

// Get current manifesto
export const getCurrent = api(
  { expose: true, method: "GET", path: "/manifesto/current" },
  async (): Promise<{ manifesto: ManifestoVersion }> => {
    const manifesto = await manifestoDB.queryRow<ManifestoVersion>`
      SELECT id, version_number, content, author_id, author_name, created_at, is_current, proposal_id
      FROM manifesto_versions
      WHERE is_current = true
      LIMIT 1
    `;

    if (!manifesto) {
      throw APIError.notFound("No current manifesto found");
    }

    return { manifesto };
  }
);

// Get all versions history
export const getHistory = api(
  { expose: true, method: "GET", path: "/manifesto/history" },
  async (): Promise<{ versions: ManifestoVersion[] }> => {
    const versions: ManifestoVersion[] = [];
    
    const rows = await manifestoDB.query<ManifestoVersion>`
      SELECT id, version_number, content, author_id, author_name, created_at, is_current, proposal_id
      FROM manifesto_versions
      ORDER BY version_number DESC
    `;

    for await (const row of rows) {
      versions.push(row);
    }

    return { versions };
  }
);

// Get specific version
export const getVersion = api(
  { expose: true, method: "GET", path: "/manifesto/version/:id" },
  async ({ id }: { id: string }): Promise<{ version: ManifestoVersion }> => {
    const versionId = parseInt(id);
    
    const version = await manifestoDB.queryRow<ManifestoVersion>`
      SELECT id, version_number, content, author_id, author_name, created_at, is_current, proposal_id
      FROM manifesto_versions
      WHERE id = ${versionId}
    `;

    if (!version) {
      throw APIError.notFound("Version not found");
    }

    return { version };
  }
);

// Get all proposals
export const getProposals = api(
  { expose: true, method: "GET", path: "/manifesto/proposals" },
  async ({ status }: { status?: string }): Promise<{ proposals: ManifestoProposal[] }> => {
    const proposals: ManifestoProposal[] = [];
    
    let query;
    if (status) {
      query = manifestoDB.query<ManifestoProposal>`
        SELECT id, title, description, new_content, previous_version_id, author_id, author_name,
               status, votes_yes, votes_no, votes_abstain, created_at, expires_at, approved_at, rejected_at
        FROM manifesto_proposals
        WHERE status = ${status}
        ORDER BY created_at DESC
      `;
    } else {
      query = manifestoDB.query<ManifestoProposal>`
        SELECT id, title, description, new_content, previous_version_id, author_id, author_name,
               status, votes_yes, votes_no, votes_abstain, created_at, expires_at, approved_at, rejected_at
        FROM manifesto_proposals
        ORDER BY created_at DESC
      `;
    }

    for await (const row of query) {
      proposals.push(row);
    }

    return { proposals };
  }
);

// Get specific proposal
export const getProposal = api(
  { expose: true, method: "GET", path: "/manifesto/proposal/:id" },
  async ({ id }: { id: string }): Promise<{ proposal: ManifestoProposal }> => {
    const proposalId = parseInt(id);
    
    const proposal = await manifestoDB.queryRow<ManifestoProposal>`
      SELECT id, title, description, new_content, previous_version_id, author_id, author_name,
             status, votes_yes, votes_no, votes_abstain, created_at, expires_at, approved_at, rejected_at
      FROM manifesto_proposals
      WHERE id = ${proposalId}
    `;

    if (!proposal) {
      throw APIError.notFound("Proposal not found");
    }

    return { proposal };
  }
);

// Create new proposal
export const createProposal = api(
  { expose: true, auth: true, method: "POST", path: "/manifesto/proposal" },
  async (req: CreateProposalRequest): Promise<{ proposal: ManifestoProposal }> => {
    // Get authenticated user data from Clerk
    const authData = getAuthData();
    
    if (!authData) {
      throw APIError.unauthenticated("Authentication required to create manifesto proposals");
    }

    // Get user details from Clerk
    const user = await clerkClient.users.getUser(authData.userID);
    console.log(user)
    // Use the real user name from Clerk
    const userName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.username || user.emailAddresses?.[0]?.emailAddress || "Unknown User";

    // Get current version
    const currentVersion = await manifestoDB.queryRow<{ id: number }>`
      SELECT id FROM manifesto_versions WHERE is_current = true LIMIT 1
    `;

    if (!currentVersion) {
      throw APIError.internal("No current manifesto version found");
    }

    // Create proposal with 60 days expiration
    const proposal = await manifestoDB.queryRow<ManifestoProposal>`
      INSERT INTO manifesto_proposals (
        title, description, new_content, previous_version_id, 
        author_id, author_name, expires_at
      ) VALUES (
        ${req.title}, 
        ${req.description}, 
        ${req.new_content},
        ${currentVersion.id},
        ${authData.userID},
        ${userName},
        NOW() + INTERVAL '60 days'
      )
      RETURNING id, title, description, new_content, previous_version_id, author_id, author_name,
                status, votes_yes, votes_no, votes_abstain, created_at, expires_at, approved_at, rejected_at
    `;

    if (!proposal) {
      throw APIError.internal("Failed to create proposal");
    }

    // Create translations for the proposal
    try {
      await createProposalTranslations({
        proposalId: proposal.id,
        title: req.title,
        description: req.description,
        newContent: req.new_content
      });
    } catch (error) {
      console.error("Failed to create proposal translations:", error);
      // Don't fail the whole operation if translations fail
    }

    return { proposal };
  }
);

// Vote on proposal
export const voteOnProposal = api(
  { expose: true, method: "POST", path: "/manifesto/vote" },
  async (req: VoteRequest): Promise<{ success: boolean }> => {
    // Check if proposal exists and is still in voting
    const proposal = await manifestoDB.queryRow<{ id: number; status: string }>`
      SELECT id, status FROM manifesto_proposals 
      WHERE id = ${req.proposal_id} AND status = 'voting'
    `;

    if (!proposal) {
      throw APIError.notFound("Proposal not found or voting has ended");
    }

    // Insert or update vote
    await manifestoDB.exec`
      INSERT INTO manifesto_votes (proposal_id, user_id, vote_type)
      VALUES (${req.proposal_id}, ${req.user_id}, ${req.vote_type})
      ON CONFLICT (proposal_id, user_id) 
      DO UPDATE SET vote_type = ${req.vote_type}, created_at = NOW()
    `;

    // Update vote counts
    await manifestoDB.exec`
      UPDATE manifesto_proposals
      SET 
        votes_yes = (SELECT COUNT(*) FROM manifesto_votes WHERE proposal_id = ${req.proposal_id} AND vote_type = 'yes'),
        votes_no = (SELECT COUNT(*) FROM manifesto_votes WHERE proposal_id = ${req.proposal_id} AND vote_type = 'no'),
        votes_abstain = (SELECT COUNT(*) FROM manifesto_votes WHERE proposal_id = ${req.proposal_id} AND vote_type = 'abstain')
      WHERE id = ${req.proposal_id}
    `;

    return { success: true };
  }
);

// Get user's vote for a proposal
export const getUserVote = api(
  { expose: true, method: "GET", path: "/manifesto/vote/:proposalId/:userId" },
  async ({ proposalId, userId }: { proposalId: string; userId: string }): Promise<{ vote: string | null }> => {
    const propId = parseInt(proposalId);
    
    const vote = await manifestoDB.queryRow<{ vote_type: string }>`
      SELECT vote_type FROM manifesto_votes
      WHERE proposal_id = ${propId} AND user_id = ${userId}
    `;

    return { vote: vote?.vote_type || null };
  }
);