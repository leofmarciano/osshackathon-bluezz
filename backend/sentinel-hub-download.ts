import 'dotenv/config';
import { writeFileSync } from 'fs';
import {
  BBox,
  CRS_EPSG4326,
  MimeTypes,
  ApiType,
  S1GRDAWSEULayer,
  S2L2ALayer,
  AcquisitionMode,
  Polarization,
  Resolution,
  MosaickingOrder,
  setAuthToken,
  requestAuthToken
} from '@sentinel-hub/sentinelhub-js';

/**
 * Downloads satellite imagery from Sentinel Hub using sentinelhub-js
 * Auth: uses provided access token or CLIENT_ID/CLIENT_SECRET env vars
 * @param outputPath - Path where to save the image (default: './oceano.png')
 */
async function downloadSentinelHubImage(
  outputPath: string = './oceano.png'
): Promise<void> {
  const s1Evalscript = `//VERSION=3
function setup() {
  return {
    input: ["VV", "VH"],
    output: { bands: 3 }
  };
}
function evaluatePixel(sample) {
  function toDb(linear) {
    return Math.max(0, Math.log(linear) * 0.21714724095 + 1);
  }
  let vvDb = toDb(sample.VV);
  let vhDb = toDb(sample.VH);
  return [vvDb, vhDb, vvDb / (vhDb + 0.0001)];
}`;

  // Floating Debris Index (FDI) for plastic detection with Sentinel-2
  // Uses bands: B04 (Red ~665nm), B08 (NIR ~842nm), B11 (SWIR ~1610nm)
  const s2EvalscriptFDI = `//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "B11"],
    output: { bands: 3 }
  };
}
function evaluatePixel(s) {
  const red = s.B04;
  const nir = s.B08; // 842nm
  const swir = s.B11; // 1610nm
  // Linear baseline interpolation for NIR between RED and SWIR:
  const factor = (0.842 - 0.665) / (1.610 - 0.665);
  const nirBaseline = red + (swir - red) * factor;
  const fdi = nir - nirBaseline;
  // Simple visualization: map positive FDI to cyan, negatives to dark
  const v = Math.max(0, fdi * 5.0); // scale for visibility
  return [0, v, v];
}`;

  // Choose target: 'oil' (Sentinel-1) or 'plastic' (Sentinel-2)
  const target = (process.env.TARGET || 'oil').toLowerCase();

  // Build appropriate layer
  const layer = target === 'plastic'
    ? new S2L2ALayer({
        evalscript: s2EvalscriptFDI,
        title: 'S2 L2A FDI (floating debris index)',
        description: 'Sentinel-2 FDI to highlight floating plastic debris',
        maxCloudCoverPercent: 40,
        mosaickingOrder: MosaickingOrder.MOST_RECENT,
      })
    : new S1GRDAWSEULayer({
        evalscript: s1Evalscript,
        title: 'S1 GRD IW (custom evalscript)',
        description: 'Sentinel-1 GRD dual-pol with dB conversion',
        acquisitionMode: AcquisitionMode.IW,
        polarization: Polarization.DV,
        resolution: Resolution.HIGH,
        orthorectify: true,
        mosaickingOrder: MosaickingOrder.MOST_RECENT,
      });

  // Define spatial and temporal parameters
  const bbox = new BBox(CRS_EPSG4326, -50.0, -10.0, -49.0, -9.0);
  const now = new Date();
  const fromTimeDynamic = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // últimos 90 dias
  const getMapParams = {
    bbox,
    fromTime: fromTimeDynamic,
    toTime: now,
    width: 512,
    height: 512,
    format: MimeTypes.PNG,
    outputResponseId: 'default',
  } as const;

  try {
    console.log(`Fetching image via sentinelhub-js (target=${target})...`);
    const img: any = await layer.getMap(getMapParams, ApiType.PROCESSING);
    let imageBuffer: Buffer;
    if (Buffer.isBuffer(img)) {
      imageBuffer = img as Buffer;
    } else if (img instanceof ArrayBuffer) {
      imageBuffer = Buffer.from(img);
    } else if (img && typeof img.arrayBuffer === 'function') {
      imageBuffer = Buffer.from(await img.arrayBuffer());
    } else {
      throw new Error('Unsupported image type returned by getMap()');
    }
    writeFileSync(outputPath, imageBuffer);
    console.log(`✅ Image saved successfully to: ${outputPath}`);
    console.log(`📊 Image size: ${imageBuffer.length} bytes`);
  } catch (error) {
    console.error('❌ Error downloading image:', error);
    throw error;
  }
}

async function authenticate(maybeAccessToken?: string): Promise<void> {
  if (maybeAccessToken) {
    setAuthToken(maybeAccessToken);
    return;
  }
  const clientId = process.env.SENTINELHUB_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = process.env.SENTINELHUB_CLIENT_SECRET || process.env.CLIENT_SECRET;
  if (clientId && clientSecret) {
    const authToken = await requestAuthToken(clientId, clientSecret);
    setAuthToken(authToken);
    return;
  }
  throw new Error('Authentication required: provide SENTINEL_HUB_ACCESS_TOKEN or SENTINELHUB_CLIENT_ID and SENTINELHUB_CLIENT_SECRET');
}

/**
 * Main function to run the script
 */
async function main() {
  // Auth via token or CLIENT_ID/CLIENT_SECRET
  const accessToken = process.env.SENTINEL_HUB_ACCESS_TOKEN || process.argv[2];
  try {
    await authenticate(accessToken);
  } catch (e) {
    console.error(String(e));
    console.log('Usage:');
    console.log('  SENTINEL_HUB_ACCESS_TOKEN=... bun run sentinel-hub-download.ts [outputPath]');
    console.log('    or');
    console.log('  SENTINELHUB_CLIENT_ID=... SENTINELHUB_CLIENT_SECRET=... bun run sentinel-hub-download.ts [outputPath]');
    process.exit(1);
  }

  const outputPath = (accessToken && process.argv[3]) || (!accessToken && process.argv[2]) || './oceano.png';
  
  try {
    await downloadSentinelHubImage(outputPath);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.main) {
  main();
}

export { downloadSentinelHubImage };
