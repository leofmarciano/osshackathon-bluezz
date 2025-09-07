import log from "encore.dev/log";
import { analyzeImageWithClaude } from "./claude-client";
import { 
  savePollutionDetection, 
  saveAnalysisHistory,
  getUnanalyzedImages,
  createAnalysisJob,
  updateAnalysisJob
} from "./database";
import { oceanImages } from "../ocean-monitor/storage";

export async function analyzeImage(
  imageId: string,
  areaId: string,
  objectKey: string,
  tileX: number,
  tileY: number,
  target: 'oil' | 'plastic',
  bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number },
  jobId?: string
): Promise<{ detected: boolean; detectionId?: string }> {
  try {
    log.info("Starting image analysis", { 
      imageId, 
      objectKey, 
      target,
      tile: { x: tileX, y: tileY }
    });

    // Download image from storage
    const imageBuffer = await oceanImages.download(objectKey);
    const imageBase64 = imageBuffer.toString('base64');

    // Analyze with Claude
    const analysis = await analyzeImageWithClaude(imageBase64, target, bbox);

    // Save analysis history
    await saveAnalysisHistory(imageId, areaId, objectKey, analysis.analysis, jobId);

    // If pollution detected, save detection
    let detectionId: string | null = null;
    if (analysis.analysis.pollution_detected) {
      detectionId = await savePollutionDetection(
        imageId,
        areaId,
        tileX,
        tileY,
        analysis.analysis,
        bbox
      );

      log.warn("🚨 Pollution detected!", {
        imageId,
        detectionId,
        type: analysis.analysis.pollution_type,
        severity: analysis.analysis.severity_level,
        confidence: analysis.analysis.confidence_score,
        areaKm2: analysis.analysis.estimated_area_km2
      });
    }

    return {
      detected: analysis.analysis.pollution_detected,
      detectionId: detectionId || undefined
    };
  } catch (error) {
    log.error("Failed to analyze image", {
      imageId,
      objectKey,
      error: String(error)
    });
    throw error;
  }
}

export async function analyzeBatch(limit: number = 10): Promise<{
  analyzed: number;
  detections: number;
  jobId: string;
}> {
  log.info("Starting batch analysis", { limit });

  // Get unanalyzed images
  const images = await getUnanalyzedImages(limit);
  
  if (images.length === 0) {
    log.info("No unanalyzed images found");
    return { analyzed: 0, detections: 0, jobId: "" };
  }

  // Create analysis job
  const jobId = await createAnalysisJob(images.length);
  let analyzed = 0;
  let detections = 0;

  for (const image of images) {
    try {
      const result = await analyzeImage(
        image.id,
        image.areaId,
        image.objectKey,
        image.tileX,
        image.tileY,
        image.target,
        image.bbox,
        jobId
      );

      analyzed++;
      if (result.detected) {
        detections++;
      }

      // Update job progress
      await updateAnalysisJob(jobId, analyzed, detections);

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      log.error("Failed to analyze image in batch", {
        imageId: image.id,
        error: String(error)
      });
    }
  }

  // Mark job as completed
  await updateAnalysisJob(jobId, analyzed, detections, 'completed');

  log.info("Batch analysis completed", {
    jobId,
    analyzed,
    detections,
    detectionRate: (detections / analyzed * 100).toFixed(1) + '%'
  });

  return { analyzed, detections, jobId };
}