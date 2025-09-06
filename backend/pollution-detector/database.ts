import { SQLDatabase } from "encore.dev/storage/sqldb";
import log from "encore.dev/log";
import { PollutionDetection, ClaudeAnalysisResponse } from "./types";
import * as oceanMonitor from "../ocean-monitor/api";

const db = new SQLDatabase("pollution-detector", {
  migrations: "./migrations",
});

export async function savePollutionDetection(
  imageId: string,
  areaId: string,
  tileX: number,
  tileY: number,
  analysis: ClaudeAnalysisResponse["analysis"],
  bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number }
): Promise<string | null> {
  if (!analysis.pollution_detected) {
    return null;
  }

  const result = await db.queryRow<{ id: string }>`
    INSERT INTO pollution_detections (
      image_id, area_id, tile_x, tile_y,
      pollution_type, confidence, severity,
      estimated_area_km2, description, affected_regions,
      bbox_min_lat, bbox_min_lon, bbox_max_lat, bbox_max_lon,
      recommendations
    ) VALUES (
      ${imageId}, ${areaId}, ${tileX}, ${tileY},
      ${analysis.pollution_type}, ${analysis.confidence_score}, ${analysis.severity_level},
      ${analysis.estimated_area_km2}, ${analysis.description}, ${JSON.stringify(analysis.affected_regions)},
      ${bbox.minLat}, ${bbox.minLon}, ${bbox.maxLat}, ${bbox.maxLon},
      ${analysis.recommendations}
    )
    RETURNING id
  `;

  log.info("Pollution detection saved", {
    detectionId: result!.id,
    pollutionType: analysis.pollution_type,
    severity: analysis.severity_level,
    areaKm2: analysis.estimated_area_km2
  });

  return result!.id;
}

export async function saveAnalysisHistory(
  imageId: string,
  areaId: string,
  objectKey: string,
  analysis: ClaudeAnalysisResponse["analysis"],
  jobId?: string
): Promise<void> {
  await db.exec`
    INSERT INTO image_analysis_history (
      image_id, area_id, object_key,
      pollution_detected, analysis_result, job_id
    ) VALUES (
      ${imageId}, ${areaId}, ${objectKey},
      ${analysis.pollution_detected}, ${JSON.stringify(analysis)}, ${jobId}
    )
  `;
}

export async function getUnanalyzedImages(limit: number = 100): Promise<Array<{
  id: string;
  areaId: string;
  objectKey: string;
  tileX: number;
  tileY: number;
  target: 'oil' | 'plastic';
  bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number };
}>> {
  // Call ocean-monitor API to get images
  const response = await oceanMonitor.getUnanalyzedImages({ limit: limit * 2 });
  const allImages = response.images;
  
  // Get already analyzed images from our history
  const analyzedRows = db.query<{ image_id: string }>`
    SELECT DISTINCT image_id 
    FROM image_analysis_history
  `;
  
  const analyzedIds = new Set<string>();
  for await (const row of analyzedRows) {
    analyzedIds.add(row.image_id);
  }
  
  // Filter out already analyzed images
  const unanalyzedImages = allImages.filter((img: typeof allImages[0]) => !analyzedIds.has(img.id));
  
  // Return up to limit images
  return unanalyzedImages.slice(0, limit);
}

export async function createAnalysisJob(totalImages: number): Promise<string> {
  const result = await db.queryRow<{ id: string }>`
    INSERT INTO analysis_jobs (total_images, status)
    VALUES (${totalImages}, 'running')
    RETURNING id
  `;
  
  return result!.id;
}

export async function updateAnalysisJob(
  jobId: string,
  analyzedImages: number,
  detectionsFound: number,
  status?: 'completed' | 'failed',
  errorMessage?: string
): Promise<void> {
  if (status) {
    await db.exec`
      UPDATE analysis_jobs
      SET analyzed_images = ${analyzedImages},
          detections_found = ${detectionsFound},
          status = ${status},
          completed_at = NOW(),
          error_message = ${errorMessage}
      WHERE id = ${jobId}
    `;
  } else {
    await db.exec`
      UPDATE analysis_jobs
      SET analyzed_images = ${analyzedImages},
          detections_found = ${detectionsFound}
      WHERE id = ${jobId}
    `;
  }
}

export async function getRecentDetections(
  limit: number = 50
): Promise<PollutionDetection[]> {
  const rows = db.query<{
    id: string;
    image_id: string;
    area_id: string;
    tile_x: number;
    tile_y: number;
    pollution_type: 'oil' | 'plastic';
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    estimated_area_km2: number;
    description: string;
    affected_regions: any;
    bbox_min_lat: number;
    bbox_min_lon: number;
    bbox_max_lat: number;
    bbox_max_lon: number;
    detected_at: Date;
    verified: boolean;
  }>`
    SELECT * FROM pollution_detections
    ORDER BY detected_at DESC
    LIMIT ${limit}
  `;

  const detections: PollutionDetection[] = [];
  for await (const row of rows) {
    detections.push({
      id: row.id,
      imageId: row.image_id,
      areaId: row.area_id,
      tileX: row.tile_x,
      tileY: row.tile_y,
      pollutionType: row.pollution_type,
      confidence: row.confidence,
      severity: row.severity,
      estimatedAreaKm2: row.estimated_area_km2,
      description: row.description,
      affectedRegions: row.affected_regions,
      bbox: {
        minLat: row.bbox_min_lat,
        minLon: row.bbox_min_lon,
        maxLat: row.bbox_max_lat,
        maxLon: row.bbox_max_lon
      },
      detectedAt: row.detected_at,
      verified: row.verified
    });
  }

  return detections;
}

// Get aggregated detections grouped by area
export async function getAggregatedDetections(): Promise<Array<{
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
}>> {
  const rows = db.query<{
    area_id: string;
    detection_count: number;
    max_severity: 'low' | 'medium' | 'high' | 'critical';
    total_area_km2: number;
    pollution_types: string;
    avg_confidence: number;
    latest_detection: Date;
    image_ids: string;
    avg_lat: number;
    avg_lon: number;
  }>`
    SELECT 
      pd.area_id,
      COUNT(DISTINCT pd.id) as detection_count,
      MAX(CASE 
        WHEN pd.severity = 'critical' THEN 4
        WHEN pd.severity = 'high' THEN 3
        WHEN pd.severity = 'medium' THEN 2
        WHEN pd.severity = 'low' THEN 1
        ELSE 0
      END) as severity_rank,
      CASE MAX(CASE 
        WHEN pd.severity = 'critical' THEN 4
        WHEN pd.severity = 'high' THEN 3
        WHEN pd.severity = 'medium' THEN 2
        WHEN pd.severity = 'low' THEN 1
        ELSE 0
      END)
        WHEN 4 THEN 'critical'
        WHEN 3 THEN 'high'
        WHEN 2 THEN 'medium'
        WHEN 1 THEN 'low'
        ELSE 'low'
      END::text as max_severity,
      SUM(pd.estimated_area_km2) as total_area_km2,
      STRING_AGG(DISTINCT pd.pollution_type, ',') as pollution_types,
      AVG(pd.confidence) as avg_confidence,
      MAX(pd.detected_at) as latest_detection,
      STRING_AGG(DISTINCT pd.image_id::text, ',') as image_ids,
      AVG((pd.bbox_min_lat + pd.bbox_max_lat) / 2) as avg_lat,
      AVG((pd.bbox_min_lon + pd.bbox_max_lon) / 2) as avg_lon
    FROM pollution_detections pd
    WHERE pd.detected_at >= NOW() - INTERVAL '7 days'
    GROUP BY pd.area_id
    ORDER BY 
      MAX(CASE 
        WHEN pd.severity = 'critical' THEN 4
        WHEN pd.severity = 'high' THEN 3
        WHEN pd.severity = 'medium' THEN 2
        WHEN pd.severity = 'low' THEN 1
        ELSE 0
      END) DESC,
      COUNT(DISTINCT pd.id) DESC
  `;

  const aggregated = [];
  for await (const row of rows) {
    // Get area name from ocean-monitor
    const areaName = await getAreaName(row.area_id);
    
    aggregated.push({
      areaId: row.area_id,
      areaName: areaName || `Área ${row.area_id.slice(0, 8)}`,
      centerLat: row.avg_lat,
      centerLon: row.avg_lon,
      detectionCount: row.detection_count,
      maxSeverity: row.max_severity,
      totalAreaKm2: row.total_area_km2,
      pollutionTypes: row.pollution_types ? row.pollution_types.split(',') : [],
      avgConfidence: row.avg_confidence,
      latestDetection: row.latest_detection,
      imageIds: row.image_ids ? row.image_ids.split(',') : []
    });
  }

  return aggregated;
}

// Get area name from ocean-monitor database
async function getAreaName(areaId: string): Promise<string | null> {
  try {
    // This would call ocean-monitor API to get area details
    return null; // For now return null, will be implemented with API call
  } catch {
    return null;
  }
}

// Get all detections for a specific area
export async function getDetectionsByArea(areaId: string): Promise<{
  detections: PollutionDetection[];
  images: Array<{
    imageId: string;
    objectKey: string;
    tileX: number;
    tileY: number;
    detectedAt: Date;
  }>;
}> {
  const detectionsRows = db.query<{
    id: string;
    image_id: string;
    area_id: string;
    tile_x: number;
    tile_y: number;
    pollution_type: 'oil' | 'plastic';
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    estimated_area_km2: number;
    description: string;
    affected_regions: any;
    bbox_min_lat: number;
    bbox_min_lon: number;
    bbox_max_lat: number;
    bbox_max_lon: number;
    detected_at: Date;
    verified: boolean;
    recommendations: string[];
  }>`
    SELECT pd.*, pd.recommendations
    FROM pollution_detections pd
    WHERE pd.area_id = ${areaId}::uuid
    ORDER BY pd.detected_at DESC
  `;

  const detections: PollutionDetection[] = [];
  const imageIds = new Set<string>();
  
  for await (const row of detectionsRows) {
    imageIds.add(row.image_id);
    detections.push({
      id: row.id,
      imageId: row.image_id,
      areaId: row.area_id,
      tileX: row.tile_x,
      tileY: row.tile_y,
      pollutionType: row.pollution_type,
      confidence: row.confidence,
      severity: row.severity,
      estimatedAreaKm2: row.estimated_area_km2,
      description: row.description,
      affectedRegions: row.affected_regions,
      bbox: {
        minLat: row.bbox_min_lat,
        minLon: row.bbox_min_lon,
        maxLat: row.bbox_max_lat,
        maxLon: row.bbox_max_lon
      },
      detectedAt: row.detected_at,
      verified: row.verified
    });
  }

  // Get image details from analysis history
  const images = [];
  
  if (imageIds.size > 0) {
    const imageRows = db.query<{
      image_id: string;
      object_key: string;
      analyzed_at: Date;
    }>`
      SELECT DISTINCT image_id, object_key, analyzed_at
      FROM image_analysis_history
      WHERE image_id = ANY(${Array.from(imageIds)}::uuid[])
    `;

    for await (const row of imageRows) {
      const detection = detections.find(d => d.imageId === row.image_id);
      if (detection) {
        images.push({
          imageId: row.image_id,
          objectKey: row.object_key,
          tileX: detection.tileX,
          tileY: detection.tileY,
          detectedAt: row.analyzed_at
        });
      }
    }
  }

  return { detections, images };
}