export interface ImageAnalysisRequest {
  imageId: string;
  areaId: string;
  objectKey: string;
  tileX: number;
  tileY: number;
  target: 'oil' | 'plastic';
  bbox: {
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
  };
}

export interface DetectionResult {
  detected: boolean;
  confidence: number;
  pollutionType: 'oil' | 'plastic' | 'none';
  estimatedAreaKm2?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRegions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface PollutionDetection {
  id: string;
  imageId: string;
  areaId: string;
  tileX: number;
  tileY: number;
  pollutionType: 'oil' | 'plastic';
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedAreaKm2: number;
  description: string;
  affectedRegions: any;
  bbox: {
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
  };
  detectedAt: Date;
  verified: boolean;
}

export interface ClaudeAnalysisResponse {
  analysis: {
    pollution_detected: boolean;
    pollution_type: 'oil' | 'plastic' | 'none';
    confidence_score: number;
    severity_level: 'low' | 'medium' | 'high' | 'critical';
    estimated_area_km2: number;
    description: string;
    affected_regions: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
    recommendations: string[];
  };
}