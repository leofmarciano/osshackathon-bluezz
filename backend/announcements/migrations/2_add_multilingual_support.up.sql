-- Add multilingual support for announcements
ALTER TABLE announcements 
ADD COLUMN default_language VARCHAR(5) DEFAULT 'pt' NOT NULL;

CREATE TABLE announcement_translations (
  id BIGSERIAL PRIMARY KEY,
  announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(announcement_id, language)
);

CREATE INDEX idx_announcement_translations_announcement_id ON announcement_translations(announcement_id);
CREATE INDEX idx_announcement_translations_language ON announcement_translations(language);

-- Insert default translations for existing announcements
INSERT INTO announcement_translations (announcement_id, language, title, description, content)
SELECT id, 'pt', title, description, content 
FROM announcements
WHERE published = true;
