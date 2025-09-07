-- Table for storing pollution detections
CREATE TABLE pollution_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL,
    area_id UUID NOT NULL,
    tile_x INTEGER NOT NULL,
    tile_y INTEGER NOT NULL,
    pollution_type TEXT NOT NULL CHECK (pollution_type IN ('oil', 'plastic')),
    confidence DOUBLE PRECISION NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    estimated_area_km2 DOUBLE PRECISION,
    description TEXT NOT NULL,
    affected_regions JSONB,
    bbox_min_lat DOUBLE PRECISION NOT NULL,
    bbox_min_lon DOUBLE PRECISION NOT NULL,
    bbox_max_lat DOUBLE PRECISION NOT NULL,
    bbox_max_lon DOUBLE PRECISION NOT NULL,
    recommendations TEXT[],
    detected_at TIMESTAMP DEFAULT NOW(),
    verified BOOLEAN DEFAULT false,
    verified_by TEXT,
    verified_at TIMESTAMP,
    false_positive BOOLEAN DEFAULT false,
    notes TEXT
);

-- Indexes for better query performance
CREATE INDEX idx_pollution_detections_area_id ON pollution_detections(area_id);
CREATE INDEX idx_pollution_detections_pollution_type ON pollution_detections(pollution_type);
CREATE INDEX idx_pollution_detections_severity ON pollution_detections(severity);
CREATE INDEX idx_pollution_detections_detected_at ON pollution_detections(detected_at DESC);
CREATE INDEX idx_pollution_detections_confidence ON pollution_detections(confidence DESC);
CREATE INDEX idx_pollution_detections_verified ON pollution_detections(verified);

-- Table for tracking analysis jobs
CREATE TABLE analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    total_images INTEGER NOT NULL,
    analyzed_images INTEGER DEFAULT 0,
    detections_found INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    error_message TEXT
);

-- Analysis history for each image
CREATE TABLE image_analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL,
    area_id UUID NOT NULL,
    object_key TEXT NOT NULL,
    analyzed_at TIMESTAMP DEFAULT NOW(),
    pollution_detected BOOLEAN NOT NULL,
    analysis_result JSONB,
    job_id UUID REFERENCES analysis_jobs(id)
);

CREATE INDEX idx_image_analysis_history_image_id ON image_analysis_history(image_id);
CREATE INDEX idx_image_analysis_history_analyzed_at ON image_analysis_history(analyzed_at DESC);