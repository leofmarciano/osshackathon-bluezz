import { BoundingBox, Tile } from './types';

// Each tile covers approximately 1km x 1km at the equator
const TILE_SIZE_DEGREES = 0.009; // ~1km

export function calculateBoundingBoxFromCenter(
  centerLat: number,
  centerLon: number,
  radiusKm: number
): BoundingBox {
  // Approximate degrees per km
  const kmPerDegreeLat = 111.32;
  const kmPerDegreeLon = 111.32 * Math.cos(centerLat * Math.PI / 180);
  
  const deltaLat = radiusKm / kmPerDegreeLat;
  const deltaLon = radiusKm / kmPerDegreeLon;
  
  return {
    minLat: centerLat - deltaLat,
    maxLat: centerLat + deltaLat,
    minLon: centerLon - deltaLon,
    maxLon: centerLon + deltaLon,
  };
}

export function generateTiles(bbox: BoundingBox): Tile[] {
  const tiles: Tile[] = [];
  
  const latRange = bbox.maxLat - bbox.minLat;
  const lonRange = bbox.maxLon - bbox.minLon;
  
  const tilesLat = Math.ceil(latRange / TILE_SIZE_DEGREES);
  const tilesLon = Math.ceil(lonRange / TILE_SIZE_DEGREES);
  
  for (let y = 0; y < tilesLat; y++) {
    for (let x = 0; x < tilesLon; x++) {
      const tileBbox: BoundingBox = {
        minLat: bbox.minLat + (y * TILE_SIZE_DEGREES),
        maxLat: Math.min(bbox.minLat + ((y + 1) * TILE_SIZE_DEGREES), bbox.maxLat),
        minLon: bbox.minLon + (x * TILE_SIZE_DEGREES),
        maxLon: Math.min(bbox.minLon + ((x + 1) * TILE_SIZE_DEGREES), bbox.maxLon),
      };
      
      tiles.push({ x, y, bbox: tileBbox });
    }
  }
  
  return tiles;
}

export function getTileKey(areaId: string, tile: Tile, target: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `ocean-monitor/${target}/${areaId}/${timestamp}/tile_${tile.x}_${tile.y}.png`;
}