export interface ManifestoVersion {
  id: number;
  version_number: number;
  content: string;
  author_id: string;
  author_name: string;
  created_at: Date;
  is_current: boolean;
  proposal_id?: number;
}

export interface ManifestoProposal {
  id: number;
  title: string;
  description: string;
  new_content: string;
  previous_version_id: number;
  author_id: string;
  author_name: string;
  status: 'voting' | 'approved' | 'rejected' | 'expired';
  votes_yes: number;
  votes_no: number;
  votes_abstain: number;
  created_at: Date;
  expires_at: Date;
  approved_at?: Date;
  rejected_at?: Date;
}

export interface ManifestoVote {
  id: number;
  proposal_id: number;
  user_id: string;
  vote_type: 'yes' | 'no' | 'abstain';
  created_at: Date;
}

export interface CreateProposalRequest {
  title: string;
  description: string;
  new_content: string;
  author_id: string;
  author_name: string;
}

export interface VoteRequest {
  proposal_id: number;
  user_id: string;
  vote_type: 'yes' | 'no' | 'abstain';
}

export interface ManifestoDiff {
  previous_content: string;
  new_content: string;
  changes: Array<{
    type: 'add' | 'remove' | 'modify';
    line: number;
    content: string;
  }>;
}

export interface ManifestoVersionWithTranslations {
  id: number;
  version_number: number;
  content: string;
  author_id: string;
  author_name: string;
  created_at: Date;
  is_current: boolean;
  language?: string;
  translations?: Record<string, string>;
}

export interface ProposalWithTranslations {
  id: number;
  title: string;
  description: string;
  new_content: string;
  author_id: string;
  author_name: string;
  status: string;
  votes_yes: number;
  votes_no: number;
  votes_abstain: number;
  created_at: Date;
  expires_at: Date;
  language: string;
}