CREATE TABLE donations (
  id BIGSERIAL PRIMARY KEY,
  announcement_id BIGINT NOT NULL,
  amount BIGINT NOT NULL, -- Amount in USD cents
  user_email TEXT NOT NULL,
  anonymized_email TEXT NOT NULL,
  polar_order_id TEXT,
  checkout_id TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donations_announcement_id ON donations(announcement_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_polar_order_id ON donations(polar_order_id);
CREATE INDEX idx_donations_checkout_id ON donations(checkout_id);
CREATE INDEX idx_donations_created_at ON donations(created_at);
