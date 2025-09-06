import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import log from "encore.dev/log";
import { oceanImages } from "./storage";
import { 
  getActiveScanAreas, 
  createScanSession, 
  updateScanSession, 
  saveCapturedImage,
  hasRecentScan 
} from "./database";
import { generateTiles, getTileKey } from "./tile-calculator";
import { authenticateSentinelHub, captureSatelliteImage } from "./sentinel-capture";
import { Tile } from "./types";



// API endpoint called by the cronjob
export const scanOceans = api(
  { expose: false }, // Internal endpoint, not exposed publicly
  async (): Promise<{ scannedAreas: number; totalImages: number }> => {
    log.info("Starting daily ocean monitoring scan");
    
    let scannedAreas = 0;
    let totalImages = 0;

    try {
      // Authenticate with Sentinel Hub once
      await authenticateSentinelHub();
      
      // Get all active scan areas
      const areas = await getActiveScanAreas();
      log.info("Found active scan areas", { count: areas.length });

      for (const area of areas) {
        // Skip if area was scanned recently (within 24 hours)
        if (await hasRecentScan(area.id, 24)) {
          log.info("Skipping recently scanned area", { 
            areaId: area.id, 
            name: area.name 
          });
          continue;
        }

        log.info("Processing scan area", { 
          areaId: area.id, 
          name: area.name,
          target: area.target 
        });

        // Generate tiles for this area
        const tiles = generateTiles(area.bbox);
        log.info("Generated tiles for area", { 
          areaId: area.id, 
          tileCount: tiles.length 
        });

        // Create scan session
        const sessionId = await createScanSession(area.id, tiles.length);
        let processedTiles = 0;
        let failedTiles = 0;

        // Process each tile
        for (const tile of tiles) {
          try {
            await processTile(area.id, area.target, tile, sessionId);
            processedTiles++;
            totalImages++;
            
            // Update session progress every 10 tiles
            if (processedTiles % 10 === 0) {
              await updateScanSession(sessionId, processedTiles);
            }
          } catch (error) {
            log.error("Failed to process tile", { 
              areaId: area.id,
              tile: { x: tile.x, y: tile.y },
              error: String(error)
            });
            failedTiles++;
            
            // If too many failures, mark session as failed
            if (failedTiles > tiles.length * 0.5) {
              await updateScanSession(
                sessionId, 
                processedTiles, 
                'failed',
                `Too many tile failures: ${failedTiles}/${tiles.length}`
              );
              break;
            }
          }
        }

        // Mark session as completed if not failed
        if (failedTiles <= tiles.length * 0.5) {
          await updateScanSession(sessionId, processedTiles, 'completed');
          scannedAreas++;
        }

        log.info("Completed scanning area", {
          areaId: area.id,
          name: area.name,
          processedTiles,
          failedTiles
        });

        // Add delay between areas to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      log.error("Ocean scanning failed", { error: String(error) });
      throw error;
    }

    log.info("Daily ocean monitoring scan completed", {
      scannedAreas,
      totalImages
    });

    return { scannedAreas, totalImages };
  }
);

async function processTile(
  areaId: string,
  target: 'oil' | 'plastic',
  tile: Tile,
  sessionId: string
): Promise<void> {
  try {
    // Capture image from Sentinel Hub
    const imageBuffer = await captureSatelliteImage(tile.bbox, target);
    
    // Generate object key
    const objectKey = getTileKey(areaId, tile, target);
    
    // Upload to object storage
    await oceanImages.upload(objectKey, imageBuffer, {
      contentType: "image/png",
    });
    
    // Save metadata to database
    await saveCapturedImage({
      areaId,
      tileX: tile.x,
      tileY: tile.y,
      bbox: tile.bbox,
      target,
      objectKey,
      metadata: {
        // These could be calculated from image analysis in the future
        cloudCoverage: undefined,
        detectionScore: undefined,
      }
    }, sessionId);
    
    log.debug("Tile processed successfully", { 
      areaId, 
      tile: { x: tile.x, y: tile.y },
      objectKey 
    });
  } catch (error) {
    log.error("Failed to process tile", {
      areaId,
      tile: { x: tile.x, y: tile.y },
      error: String(error)
    });
    throw error;
  }
}

// Manual trigger endpoint for testing
export const triggerScan = api(
  { expose: true, method: "POST", path: "/ocean-monitor/trigger-scan", auth: false },
  async (): Promise<{ message: string; result: { scannedAreas: number; totalImages: number } }> => {
    log.info("Manual scan triggered");
    const result = await scanOceans();
    return {
      message: "Ocean scan completed",
      result
    };
  }
);


// CronJob that runs every day at 2 AM UTC
const _ = new CronJob("ocean-scanner", {
  title: "Daily ocean monitoring scan",
  schedule: "0 2 * * *", // Every day at 2 AM UTC
  endpoint: scanOceans,
});