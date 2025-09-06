import { secret } from "encore.dev/config";
import {
  BBox,
  CRS_EPSG4326,
  MimeTypes,
  ApiType,
  S1GRDAWSEULayer,
  S2L2ALayer,
  MosaickingOrder,
  AcquisitionMode,
  Polarization,
  Resolution,
  setAuthToken,
  requestAuthToken
} from '@sentinel-hub/sentinelhub-js';
import { BoundingBox } from './types';

// Encore secrets
const sentinelHubClientId = secret("SENTINELHUB_CLIENT_ID");
const sentinelHubClientSecret = secret("SENTINELHUB_CLIENT_SECRET");

// Evalscripts from the original file
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

const s2EvalscriptFDI = `//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "B11"],
    output: { bands: 3 }
  };
}
function evaluatePixel(s) {
  const red = s.B04;
  const nir = s.B08;
  const swir = s.B11;
  const factor = (0.842 - 0.665) / (1.610 - 0.665);
  const nirBaseline = red + (swir - red) * factor;
  const fdi = nir - nirBaseline;
  const v = Math.max(0, fdi * 5.0);
  return [0, v, v];
}`;

export async function authenticateSentinelHub(): Promise<void> {
  const clientId = sentinelHubClientId();
  const clientSecret = sentinelHubClientSecret();
  
  if (!clientId || !clientSecret) {
    throw new Error('Sentinel Hub authentication required: provide SENTINELHUB_CLIENT_ID and SENTINELHUB_CLIENT_SECRET secrets');
  }
  
  const authToken = await requestAuthToken(clientId, clientSecret);
  setAuthToken(authToken);
}

export async function captureSatelliteImage(
  bbox: BoundingBox,
  target: 'oil' | 'plastic'
): Promise<Buffer> {
  // Convert our BoundingBox to Sentinel Hub BBox
  const sentinelBbox = new BBox(
    CRS_EPSG4326,
    bbox.minLon,
    bbox.minLat,
    bbox.maxLon,
    bbox.maxLat
  );

  // Create appropriate layer based on target
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
        title: 'S1 GRD IW (oil spill detection)',
        description: 'Sentinel-1 GRD dual-pol for oil detection',
        acquisitionMode: AcquisitionMode.IW,
        polarization: Polarization.DV,
        resolution: Resolution.HIGH,
        orthorectify: true,
        mosaickingOrder: MosaickingOrder.MOST_RECENT,
      });

  // Time range: last 30 days for better data availability
  const now = new Date();
  const fromTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const getMapParams = {
    bbox: sentinelBbox,
    fromTime,
    toTime: now,
    width: 512,
    height: 512,
    format: MimeTypes.PNG,
    outputResponseId: 'default',
  } as const;

  try {
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
    
    return imageBuffer;
  } catch (error) {
    console.error(`Error capturing image for ${target}:`, error);
    throw error;
  }
}