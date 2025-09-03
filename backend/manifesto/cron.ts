import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";
import { manifestoDB } from "./db";
import { createManifestoTranslations } from "./translations";

// Cron job to check and process expired proposals every hour
const _ = new CronJob("process-expired-proposals", {
  title: "Process Expired Manifesto Proposals",
  every: "1h",
  endpoint: checkExpiredProposals,
});

// API endpoint called by the cron job
export const checkExpiredProposals = api(
  { expose: false },
  async (): Promise<{ processed: number }> => {
    let processed = 0;

    // Get all expired proposals still in voting status
    const expiredProposals = await manifestoDB.query<{
      id: number;
      votes_yes: number;
      votes_no: number;
      votes_abstain: number;
      new_content: string;
      title: string;
    }>`
      SELECT id, votes_yes, votes_no, votes_abstain, new_content, title
      FROM manifesto_proposals
      WHERE status = 'voting' AND expires_at < NOW()
    `;

    for await (const proposal of expiredProposals) {
      const totalVotes = proposal.votes_yes + proposal.votes_no + proposal.votes_abstain;
      
      // Check if proposal has majority (more than 50% yes votes)
      if (totalVotes > 0 && proposal.votes_yes > (proposal.votes_no + proposal.votes_abstain)) {
        // Approve the proposal
        await manifestoDB.exec`
          UPDATE manifesto_proposals
          SET status = 'approved', approved_at = NOW()
          WHERE id = ${proposal.id}
        `;

        // Get the next version number
        const maxVersion = await manifestoDB.queryRow<{ max_version: number }>`
          SELECT MAX(version_number) as max_version FROM manifesto_versions
        `;

        const nextVersion = (maxVersion?.max_version || 0) + 1;

        // Set current version to false
        await manifestoDB.exec`
          UPDATE manifesto_versions SET is_current = false WHERE is_current = true
        `;

        // Create new manifesto version
        const newVersion = await manifestoDB.queryRow<{ id: number }>`
          INSERT INTO manifesto_versions (
            version_number, content, author_id, author_name, is_current, proposal_id
          ) VALUES (
            ${nextVersion},
            ${proposal.new_content},
            'system',
            'Approved by Community Vote',
            true,
            ${proposal.id}
          )
          RETURNING id
        `;

        // Create translations for the new version
        if (newVersion) {
          try {
            await createManifestoTranslations({
              versionId: newVersion.id,
              content: proposal.new_content
            });
          } catch (error) {
            console.error("Failed to create manifesto translations:", error);
          }
        }

        console.log(`Proposal ${proposal.id} approved and new manifesto version created`);
      } else {
        // Reject the proposal
        await manifestoDB.exec`
          UPDATE manifesto_proposals
          SET status = 'rejected', rejected_at = NOW()
          WHERE id = ${proposal.id}
        `;

        console.log(`Proposal ${proposal.id} rejected due to insufficient votes`);
      }

      processed++;
    }

    return { processed };
  }
);

// Cron job to expire old proposals (older than 60 days) - runs daily
const __ = new CronJob("expire-old-proposals", {
  title: "Expire Old Manifesto Proposals",
  every: "24h",
  endpoint: expireOldProposals,
});

export const expireOldProposals = api(
  { expose: false },
  async (): Promise<{ expired: number }> => {
    // Mark proposals as expired if they've been in voting for more than 60 days
    const result = await manifestoDB.exec`
      UPDATE manifesto_proposals
      SET status = 'expired'
      WHERE status = 'voting' AND created_at < NOW() - INTERVAL '60 days'
    `;

    return { expired: 0 }; // Note: exec doesn't return affected rows count in Encore
  }
);