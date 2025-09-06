import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import log from "encore.dev/log";
import { analyzeImage, analyzeBatch } from "./analyzer";
import { getRecentDetections } from "./database";
import { ImageAnalysisRequest, PollutionDetection } from "./types";

// CronJob that runs every hour to analyze new images
const _ = new CronJob("pollution-analyzer", {
  title: "Hourly pollution detection analysis",
  schedule: "0 * * * *", // Every hour
  endpoint: analyzeNewImages,
});

// Internal endpoint called by cronjob
export const analyzeNewImages = api(
  { expose: false },
  async (): Promise<{ analyzed: number; detections: number }> => {
    log.info("Starting scheduled pollution analysis");
    
    const result = await analyzeBatch(50); // Analyze up to 50 images per hour
    
    return {
      analyzed: result.analyzed,
      detections: result.detections
    };
  }
);

// Manual trigger for immediate analysis
export const triggerAnalysis = api(
  { expose: true, method: "POST", path: "/pollution-detector/analyze", auth: false },
  async (req: { limit?: number }): Promise<{ 
    message: string; 
    analyzed: number; 
    detections: number;
    jobId: string;
  }> => {
    log.info("Manual analysis triggered", { limit: req.limit });
    
    const result = await analyzeBatch(req.limit || 10);
    
    return {
      message: "Analysis completed",
      analyzed: result.analyzed,
      detections: result.detections,
      jobId: result.jobId
    };
  }
);

// Analyze a specific image
export const analyzeSingleImage = api(
  { expose: true, method: "POST", path: "/pollution-detector/analyze-image", auth: false },
  async (req: ImageAnalysisRequest): Promise<{
    detected: boolean;
    detectionId?: string;
  }> => {
    log.info("Single image analysis requested", { imageId: req.imageId });
    
    const result = await analyzeImage(
      req.imageId,
      req.areaId,
      req.objectKey,
      req.tileX,
      req.tileY,
      req.target,
      req.bbox
    );
    
    return result;
  }
);

// Get recent pollution detections
interface GetDetectionsResponse {
  detections: PollutionDetection[];
  summary: {
    total: number;
    oil: number;
    plastic: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export const getDetections = api(
  { expose: true, method: "GET", path: "/pollution-detector/detections", auth: false },
  async (req: { limit?: number }): Promise<GetDetectionsResponse> => {
    const detections = await getRecentDetections(req.limit || 50);
    
    // Calculate summary statistics
    const summary = {
      total: detections.length,
      oil: detections.filter(d => d.pollutionType === 'oil').length,
      plastic: detections.filter(d => d.pollutionType === 'plastic').length,
      critical: detections.filter(d => d.severity === 'critical').length,
      high: detections.filter(d => d.severity === 'high').length,
      medium: detections.filter(d => d.severity === 'medium').length,
      low: detections.filter(d => d.severity === 'low').length,
    };
    
    return {
      detections,
      summary
    };
  }
);

// Get detection by ID
interface GetDetectionResponse {
  found: boolean;
  detection?: PollutionDetection;
}

export const getDetectionById = api(
  { expose: true, method: "GET", path: "/pollution-detector/detections/:id", auth: false },
  async (req: { id: string }): Promise<GetDetectionResponse> => {
    // This would need to be implemented in database.ts
    // For now, returning not found
    log.info("Detection requested", { id: req.id });
    return {
      found: false
    };
  }
);

// Get aggregated detections grouped by area
interface AggregatedDetection {
  areaId: string;
  areaName: string;
  centerLat: number;
  centerLon: number;
  detectionCount: number;
  maxSeverity: 'low' | 'medium' | 'high' | 'critical';
  totalAreaKm2: number;
  pollutionTypes: string[];
  avgConfidence: number;
  latestDetection: Date;
  imageIds: string[];
}

export const getAggregatedDetections = api(
  { expose: true, method: "GET", path: "/pollution-detector/aggregated", auth: false },
  async (): Promise<{ detections: AggregatedDetection[] }> => {
    const { getAggregatedDetections } = await import("./database");
    const detections = await getAggregatedDetections();
    return { detections };
  }
);

// Get all detections for a specific area
interface AreaDetectionsResponse {
  detections: PollutionDetection[];
  images: Array<{
    imageId: string;
    objectKey: string;
    tileX: number;
    tileY: number;
    detectedAt: Date;
  }>;
}

export const getDetectionsByArea = api(
  { expose: true, method: "GET", path: "/pollution-detector/areas/:areaId/detections", auth: false },
  async (req: { areaId: string }): Promise<AreaDetectionsResponse> => {
    log.info("getDetectionsByArea called", { areaId: req.areaId });
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.areaId)) {
      log.warn("Invalid UUID format", { areaId: req.areaId });
      // Return empty result for invalid UUID
      return {
        detections: [],
        images: []
      };
    }
    
    const { getDetectionsByArea } = await import("./database");
    const result = await getDetectionsByArea(req.areaId);
    return result;
  }
);