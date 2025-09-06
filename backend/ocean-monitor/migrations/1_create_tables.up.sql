-- Scan areas to monitor
CREATE TABLE scan_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    center_lat DOUBLE PRECISION NOT NULL,
    center_lon DOUBLE PRECISION NOT NULL,
    radius_km DOUBLE PRECISION NOT NULL,
    bbox_min_lat DOUBLE PRECISION NOT NULL,
    bbox_min_lon DOUBLE PRECISION NOT NULL,
    bbox_max_lat DOUBLE PRECISION NOT NULL,
    bbox_max_lon DOUBLE PRECISION NOT NULL,
    target TEXT NOT NULL CHECK (target IN ('oil', 'plastic')),
    priority INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scan sessions tracking
CREATE TABLE scan_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID NOT NULL REFERENCES scan_areas(id),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    total_tiles INTEGER NOT NULL,
    processed_tiles INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    error_message TEXT
);

-- Captured images
CREATE TABLE captured_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID NOT NULL REFERENCES scan_areas(id),
    session_id UUID NOT NULL REFERENCES scan_sessions(id),
    tile_x INTEGER NOT NULL,
    tile_y INTEGER NOT NULL,
    bbox_min_lat DOUBLE PRECISION NOT NULL,
    bbox_min_lon DOUBLE PRECISION NOT NULL,
    bbox_max_lat DOUBLE PRECISION NOT NULL,
    bbox_max_lon DOUBLE PRECISION NOT NULL,
    target TEXT NOT NULL CHECK (target IN ('oil', 'plastic')),
    object_key TEXT NOT NULL,
    cloud_coverage DOUBLE PRECISION,
    detection_score DOUBLE PRECISION,
    captured_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(area_id, tile_x, tile_y, captured_at)
);

-- Index for faster queries
CREATE INDEX idx_scan_areas_active ON scan_areas(active);
CREATE INDEX idx_captured_images_area_date ON captured_images(area_id, captured_at);
CREATE INDEX idx_scan_sessions_area ON scan_sessions(area_id);

-- Insert default monitoring areas for Rio de Janeiro coast
INSERT INTO scan_areas (name, center_lat, center_lon, radius_km, bbox_min_lat, bbox_min_lon, bbox_max_lat, bbox_max_lon, target, priority, active)
VALUES 
    ('Baía de Guanabara - Óleo', -22.8, -43.15, 10, -22.89, -43.26, -22.71, -43.04, 'oil', 1, true),
    ('Baía de Guanabara - Plástico', -22.8, -43.15, 10, -22.89, -43.26, -22.71, -43.04, 'plastic', 1, true),
    ('Copacabana - Plástico', -22.97, -43.18, 5, -23.015, -43.225, -22.925, -43.135, 'plastic', 2, true),
    ('Angra dos Reis - Óleo', -23.0, -44.3, 15, -23.135, -44.465, -22.865, -44.135, 'oil', 2, true);