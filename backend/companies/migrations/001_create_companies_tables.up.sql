-- Create companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ngo', 'company')),
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    
    -- Contact information
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    website VARCHAR(255),
    
    -- Location
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    
    -- Mission & Impact
    description TEXT NOT NULL,
    mission TEXT NOT NULL,
    impact TEXT NOT NULL,
    target_audience VARCHAR(500),
    
    -- Metadata
    owner_id VARCHAR(255) NOT NULL, -- User who created the company
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_non_profit BOOLEAN DEFAULT FALSE,
    
    -- Voting
    voting_start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    voting_end_date TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    votes_yes INTEGER DEFAULT 0,
    votes_no INTEGER DEFAULT 0,
    votes_abstain INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_category ON companies(category);
CREATE INDEX idx_companies_type ON companies(type);

-- Create company documents table
CREATE TABLE company_documents (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('legal', 'financial', 'reports', 'certificates', 'other')),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for documents
CREATE INDEX idx_company_documents_company ON company_documents(company_id);
CREATE INDEX idx_company_documents_type ON company_documents(document_type);

-- Create company images table
CREATE TABLE company_images (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) DEFAULT 'general', -- logo, team, activity, etc.
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for images
CREATE INDEX idx_company_images_company ON company_images(company_id);

-- Create company votes table to track individual votes
CREATE TABLE company_votes (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('yes', 'no', 'abstain')),
    voted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, user_id) -- One vote per user per company
);

-- Create index for votes
CREATE INDEX idx_company_votes_company ON company_votes(company_id);
CREATE INDEX idx_company_votes_user ON company_votes(user_id);

-- Create company profile table for additional profile information
CREATE TABLE company_profiles (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    presentation TEXT, -- Markdown presentation
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    social_media JSONB, -- Store social media links as JSON
    team_members JSONB, -- Store team information as JSON
    statistics JSONB, -- Store various statistics as JSON
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id)
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON company_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();