import { api } from "encore.dev/api";
import log from "encore.dev/log";
import { oceanImages } from "./storage";
import { 
  getActiveScanAreas,
  hasRecentScan,
  createScanArea,
  getAreaScanStats,
  getCapturedImagesByArea,
  getAllUnanalyzedImages
} from "./database";
import { 
  calculateBoundingBoxFromCenter,
  generateTiles 
} from "./tile-calculator";
import { ScanArea } from "./types";

// Add new scan area
interface AddAreaRequest {
  name: string;
  centerLat: number;
  centerLon: number;
  radiusKm: number;
  target: 'oil' | 'plastic';
  priority?: number;
}

interface AddAreaResponse {
  areaId: string;
  tilesCount: number;
}

export const addScanArea = api(
  { expose: true, method: "POST", path: "/ocean-monitor/areas", auth: false },
  async (req: AddAreaRequest): Promise<AddAreaResponse> => {
    const bbox = calculateBoundingBoxFromCenter(
      req.centerLat,
      req.centerLon,
      req.radiusKm
    );
    
    const tiles = generateTiles(bbox);
    
    // Insert new scan area into database
    const areaId = await createScanArea({
      name: req.name,
      centerLat: req.centerLat,
      centerLon: req.centerLon,
      radiusKm: req.radiusKm,
      bbox,
      target: req.target,
      priority: req.priority || 1
    });
    
    return {
      areaId,
      tilesCount: tiles.length
    };
  }
);

// Get all scan areas
interface ListAreasResponse {
  areas: ScanArea[];
}

export const listScanAreas = api(
  { expose: true, method: "GET", path: "/ocean-monitor/areas", auth: false },
  async (): Promise<ListAreasResponse> => {
    const areas = await getActiveScanAreas();
    return { areas };
  }
);

// Get scan status for an area
interface ScanStatusParams {
  areaId: string;
}

interface ScanStatusResponse {
  areaId: string;
  lastScanned?: string;
  hasRecentScan: boolean;
  totalImages: number;
}

export const getScanStatus = api(
  { expose: true, method: "GET", path: "/ocean-monitor/areas/:areaId/status" },
  async (params: ScanStatusParams): Promise<ScanStatusResponse> => {
    log.info("getScanStatus called", { 
      params: params,
      paramsType: typeof params,
      paramsKeys: Object.keys(params || {})
    });
    
    const { areaId } = params;
    log.info("Extracted areaId", { areaId });
    
    try {
      // Check if area has recent scan
      log.info("Calling hasRecentScan", { areaId });
      const hasRecent = await hasRecentScan(areaId, 24);
      log.info("hasRecentScan result", { hasRecent });
      
      // Get area statistics
      log.info("Calling getAreaScanStats", { areaId });
      const stats = await getAreaScanStats(areaId);
      log.info("getAreaScanStats result", { stats });
      
      // Build response
      const response: ScanStatusResponse = {
        areaId: areaId,
        lastScanned: stats.lastScanned ? stats.lastScanned.toISOString() : undefined,
        hasRecentScan: hasRecent,
        totalImages: stats.totalImages
      };
      
      log.info("Returning response", { response });
      return response;
    } catch (error) {
      log.error("Error in getScanStatus", { error: String(error), areaId });
      throw error;
    }
  }
);

// NEW: Get unanalyzed images for pollution detection
interface GetUnanalyzedImagesResponse {
  images: Array<{
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
  }>;
}

export const getUnanalyzedImages = api(
  { expose: false, method: "GET", path: "/ocean-monitor/unanalyzed-images" },
  async (req: { limit?: number }): Promise<GetUnanalyzedImagesResponse> => {
    const images = await getAllUnanalyzedImages(req.limit || 100);
    return { images };
  }
);

// Download captured image
export const downloadImage = api.raw(
  { expose: true, method: "GET", path: "/ocean-monitor/images/*objectKey", auth: false },
  async (req, resp) => {
    // Extract objectKey from the URL path
    const pathParts = req.url?.split('/ocean-monitor/images/');
    if (!pathParts || pathParts.length < 2) {
      resp.writeHead(400, { 'Content-Type': 'application/json' });
      resp.end(JSON.stringify({ error: 'Invalid object key' }));
      return;
    }
    
    const objectKey = decodeURIComponent(pathParts[1]);
    
    try {
      const imageData = await oceanImages.download(objectKey);
      resp.writeHead(200, { 
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400'
      });
      resp.end(imageData);
    } catch (error) {
      resp.writeHead(404, { 'Content-Type': 'application/json' });
      resp.end(JSON.stringify({ error: 'Image not found' }));
    }
  }
);