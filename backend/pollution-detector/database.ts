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