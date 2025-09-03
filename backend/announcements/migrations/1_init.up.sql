CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  organization_description TEXT,
  goal_amount BIGINT NOT NULL,
  raised_amount BIGINT DEFAULT 0,
  backers_count INTEGER DEFAULT 0,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  campaign_end_date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_announcements_published ON announcements(published);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_location ON announcements(location);
CREATE INDEX idx_announcements_slug ON announcements(slug);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);

CREATE TABLE announcement_backs (
  id BIGSERIAL PRIMARY KEY,
  announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  amount BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcement_backs_announcement_id ON announcement_backs(announcement_id);
CREATE INDEX idx_announcement_backs_user_id ON announcement_backs(user_id);

CREATE TABLE announcement_reminders (
  id BIGSERIAL PRIMARY KEY,
  announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(announcement_id, user_id)
);

CREATE INDEX idx_announcement_reminders_announcement_id ON announcement_reminders(announcement_id);
CREATE INDEX idx_announcement_reminders_user_id ON announcement_reminders(user_id);
