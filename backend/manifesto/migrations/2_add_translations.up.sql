-- Add translations table for manifesto versions
CREATE TABLE manifesto_translations (
    id BIGSERIAL PRIMARY KEY,
    version_id BIGINT REFERENCES manifesto_versions(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(version_id, language)
);

-- Add translations table for proposals
CREATE TABLE proposal_translations (
    id BIGSERIAL PRIMARY KEY,
    proposal_id BIGINT REFERENCES manifesto_proposals(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    new_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, language)
);

-- Indexes
CREATE INDEX idx_manifesto_translations_version ON manifesto_translations(version_id);
CREATE INDEX idx_manifesto_translations_language ON manifesto_translations(language);
CREATE INDEX idx_proposal_translations_proposal ON proposal_translations(proposal_id);
CREATE INDEX idx_proposal_translations_language ON proposal_translations(language);