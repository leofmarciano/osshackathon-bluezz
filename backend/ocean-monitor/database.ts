import { SQLDatabase } from "encore.dev/storage/sqldb";
import log from "encore.dev/log";
import { ScanArea, CapturedImage, ScanSession } from "./types";

const db = new SQLDatabase("ocean-monitor", {
  migrations: "./migrations",
});

export async function getActiveScanAreas(): Promise<ScanArea[]> {
  const rows = await db.query<{
    id: string;
    name: string;
    center_lat: number;
    center_lon: number;
    radius_km: number;
    bbox_min_lat: number;
    bbox_min_lon: number;
    bbox_max_lat: number;
    bbox_max_lon: number;
    target: 'oil' | 'plastic';
    priority: number;
    active: boolean;
  }>`
    SELECT id, name, center_lat, center_lon, radius_km,
           bbox_min_lat, bbox_min_lon, bbox_max_lat, bbox_max_lon,
           target, priority, active
    FROM scan_areas
    WHERE active = true
    ORDER BY priority ASC
  `;

  const areas: ScanArea[] = [];
  for await (const row of rows) {
    areas.push({
      id: row.id,
      name: row.name,
      center: {
        lat: row.center_lat,
        lon: row.center_lon,
      },
      radiusKm: row.radius_km,
      bbox: {
        minLat: row.bbox_min_lat,
        minLon: row.bbox_min_lon,
        maxLat: row.bbox_max_lat,
        maxLon: row.bbox_max_lon,
      },
      target: row.target,
      priority: row.priority,
      active: row.active,
    });
  }

  return areas;
}

export async function createScanSession(
  areaId: string,
  totalTiles: number
): Promise<string> {
  const result = await db.queryRow<{ id: string }>`
    INSERT INTO scan_sessions (area_id, total_tiles, status)
    VALUES (${areaId}, ${totalTiles}, 'running')
    RETURNING id
  `;
  
  return result!.id;
}

export async function updateScanSession(
  sessionId: string,
  processedTiles: number,
  status?: 'completed' | 'failed',
  errorMessage?: string
): Promise<void> {
  if (status === 'completed') {
    await db.exec`
      UPDATE scan_sessions
      SET processed_tiles = ${processedTiles},
          status = ${status},
          completed_at = NOW()
      WHERE id = ${sessionId}
    `;
  } else if (status === 'failed') {
    await db.exec`
      UPDATE scan_sessions
      SET processed_tiles = ${processedTiles},
          status = ${status},
          error_message = ${errorMessage},
          completed_at = NOW()
      WHERE id = ${sessionId}
    `;
  } else {
    await db.exec`
      UPDATE scan_sessions
      SET processed_tiles = ${processedTiles}
      WHERE id = ${sessionId}
    `;
  }
}

export async function saveCapturedImage(
  image: Omit<CapturedImage, 'id' | 'capturedAt'>,
  sessionId: string
): Promise<void> {
  await db.exec`
    INSERT INTO captured_images (
      area_id, session_id, tile_x, tile_y,
      bbox_min_lat, bbox_min_lon, bbox_max_lat, bbox_max_lon,
      target, object_key, cloud_coverage, detection_score
    ) VALUES (
      ${image.areaId}, ${sessionId}, ${image.tileX}, ${image.tileY},
      ${image.bbox.minLat}, ${image.bbox.minLon}, ${image.bbox.maxLat}, ${image.bbox.maxLon},
      ${image.target}, ${image.objectKey},
      ${image.metadata?.cloudCoverage}, ${image.metadata?.detectionScore}
    )
    ON CONFLICT (area_id, tile_x, tile_y, captured_at) DO NOTHING
  `;
}

export async function hasRecentScan(areaId: string, hoursAgo: number): Promise<boolean> {
  log.info("hasRecentScan called", { areaId, hoursAgo });
  
  try {
    const result = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM scan_sessions
      WHERE area_id = ${areaId}
        AND status = 'completed'
        AND completed_at > NOW() - INTERVAL '24 hours'
    `;
    
    log.info("hasRecentScan result", { result, areaId });
    return result ? result.count > 0 : false;
  } catch (error) {
    log.error("hasRecentScan SQL error", { error: String(error), areaId, hoursAgo });
    throw error;
  }
}

export async function createScanArea(area: {
  name: string;
  centerLat: number;
  centerLon: number;
  radiusKm: number;
  bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number };
  target: 'oil' | 'plastic';
  priority: number;
}): Promise<string> {
  const result = await db.queryRow<{ id: string }>`
    INSERT INTO scan_areas (
      name, center_lat, center_lon, radius_km,
      bbox_min_lat, bbox_min_lon, bbox_max_lat, bbox_max_lon,
      target, priority, active
    ) VALUES (
      ${area.name}, ${area.centerLat}, ${area.centerLon}, ${area.radiusKm},
      ${area.bbox.minLat}, ${area.bbox.minLon}, ${area.bbox.maxLat}, ${area.bbox.maxLon},
      ${area.target}, ${area.priority}, true
    )
    RETURNING id
  `;
  
  return result!.id;
}

export async function getAreaScanStats(areaId: string): Promise<{
  lastScanned: Date | null;
  totalImages: number;
}> {
  log.info("getAreaScanStats called", { areaId });
  
  try {
    const lastScanResult = await db.queryRow<{ completed_at: Date | null }>`
      SELECT completed_at
      FROM scan_sessions
      WHERE area_id = ${areaId}
        AND status = 'completed'
      ORDER BY completed_at DESC
      LIMIT 1
    `;
    
    log.info("lastScanResult", { lastScanResult, areaId });
    
    const imageCountResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM captured_images
      WHERE area_id = ${areaId}
    `;
    
    log.info("imageCountResult", { imageCountResult, areaId });
    
    const finalResult = {
      lastScanned: lastScanResult?.completed_at || null,
      totalImages: imageCountResult?.count || 0
    };
    
    log.info("getAreaScanStats returning", { finalResult, areaId });
    return finalResult;
  } catch (error) {
    log.error("getAreaScanStats SQL error", { error: String(error), areaId });
    throw error;
  }
}

export async function getCapturedImagesByArea(
  areaId: string,
  limit: number
): Promise<Array<{
  id: string;
  objectKey: string;
  tileX: number;
  tileY: number;
  capturedAt: Date;
}>> {
  const rows = await db.query<{
    id: string;
    object_key: string;
    tile_x: number;
    tile_y: number;
    captured_at: Date;
  }>`
    SELECT id, object_key, tile_x, tile_y, captured_at
    FROM captured_images
    WHERE area_id = ${areaId}
    ORDER BY captured_at DESC
    LIMIT ${limit}
  `;
  
  const images = [];
  for await (const row of rows) {
    images.push({
      id: row.id,
      objectKey: row.object_key,
      tileX: row.tile_x,
      tileY: row.tile_y,
      capturedAt: row.captured_at
    });
  }
  
  return images;
}

// Get all unanalyzed images for pollution detection
export async function getAllUnanalyzedImages(limit: number): Promise<Array<{
  id: string;
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
}>> {
  const rows = await db.query<{
    id: string;
    area_id: string;
    object_key: string;
    tile_x: number;
    tile_y: number;
    target: 'oil' | 'plastic';
    bbox_min_lat: number;
    bbox_min_lon: number;
    bbox_max_lat: number;
    bbox_max_lon: number;
  }>`
    SELECT id, area_id, object_key, tile_x, tile_y, target,
           bbox_min_lat, bbox_min_lon, bbox_max_lat, bbox_max_lon
    FROM captured_images
    ORDER BY captured_at DESC
    LIMIT ${limit}
  `;
  
  const images = [];
  for await (const row of rows) {
    images.push({
      id: row.id,
      areaId: row.area_id,
      objectKey: row.object_key,
      tileX: row.tile_x,
      tileY: row.tile_y,
      target: row.target,
      bbox: {
        minLat: row.bbox_min_lat,
        minLon: row.bbox_min_lon,
        maxLat: row.bbox_max_lat,
        maxLon: row.bbox_max_lon
      }
    });
  }
  
  return images;
}