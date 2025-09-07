export interface BoundingBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface ScanArea {
  id: string;
  name: string;
  center: {
    lat: number;
    lon: number;
  };
  radiusKm: number;
  bbox: BoundingBox;
  target: 'oil' | 'plastic';
  priority: number;
  active: boolean;
}

export interface Tile {
  x: number;
  y: number;
  bbox: BoundingBox;
}

export interface CapturedImage {
  id: string;
  areaId: string;
  tileX: number;
  tileY: number;
  bbox: BoundingBox;
  target: 'oil' | 'plastic';
  objectKey: string;
  capturedAt: Date;
  metadata?: {
    cloudCoverage?: number;
    detectionScore?: number;
  };
}

export interface ScanSession {
  id: string;
  areaId: string;
  startedAt: Date;
  completedAt?: Date;
  totalTiles: number;
  processedTiles: number;
  status: 'running' | 'completed' | 'failed';
}