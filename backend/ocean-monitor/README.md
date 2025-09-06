# Ocean Monitor Service

An autonomous microservice for monitoring ocean pollution using satellite imagery from Sentinel Hub. The service automatically scans predefined ocean areas daily to detect oil spills and plastic debris.

## Overview

This service leverages Sentinel-1 (radar) and Sentinel-2 (optical) satellite data to monitor ocean health. It operates autonomously through scheduled cron jobs, systematically capturing and storing satellite imagery for pollution detection.

## Key Features

- **Autonomous Operation**: Daily cron job executes at 2 AM UTC without human intervention
- **Multi-target Detection**: Supports both oil spill (Sentinel-1) and plastic debris (Sentinel-2) detection
- **Area Coverage Algorithm**: Intelligent tiling system to cover large ocean areas
- **Progress Tracking**: Database-backed session management for scan operations
- **Duplicate Prevention**: Avoids rescanning areas within 24-hour windows

## Architecture

### Core Components

1. **Scanner Module** (`scanner.ts`)
   - Cron job orchestration
   - Tile processing pipeline
   - Session management

2. **Tile Calculator** (`tile-calculator.ts`)
   - Bounding box calculations
   - Tile grid generation
   - Geographic coordinate handling

3. **Sentinel Capture** (`sentinel-capture.ts`)
   - Sentinel Hub API integration
   - Evalscript implementations for oil/plastic detection
   - Image retrieval and buffering

4. **Storage Layer**
   - Encore Object Storage for image persistence
   - PostgreSQL for metadata and tracking

## Tiling Algorithm

### Strategy

The service implements a grid-based tiling algorithm to systematically cover large ocean areas:

1. **Area Definition**: Each scan area is defined by:
   - Center point (latitude, longitude)
   - Radius in kilometers
   - Target type (oil or plastic)

2. **Bounding Box Calculation**:
   ```
   ΔLat = radius_km / 111.32
   ΔLon = radius_km / (111.32 * cos(center_lat))
   ```

3. **Tile Generation**:
   - Each tile covers ~1km² (0.009° x 0.009°)
   - Tiles are arranged in a grid pattern
   - Grid dimensions: `ceil(area_width / tile_size) × ceil(area_height / tile_size)`

4. **Systematic Coverage**:
   - Tiles are processed left-to-right, bottom-to-top
   - Each tile is uniquely identified by (x, y) coordinates
   - Overlap is minimized while ensuring complete coverage

### Example

For a 10km radius area around Rio de Janeiro:
- Center: -22.8°, -43.15°
- Generates ~400 tiles (20x20 grid)
- Each tile: 512x512 pixels
- Total coverage: ~314 km²

## Detection Methods

### Oil Spill Detection (Sentinel-1)

Uses SAR (Synthetic Aperture Radar) data with dual polarization (VV/VH):
- Converts to decibel scale for better contrast
- Oil appears as dark patches due to dampened sea surface roughness
- Works in all weather conditions and day/night

### Plastic Debris Detection (Sentinel-2)

Implements Floating Debris Index (FDI) algorithm:
- Uses Red (B04), NIR (B08), and SWIR (B11) bands
- Calculates baseline NIR absorption
- Positive FDI values indicate floating materials
- Requires clear sky conditions (max 40% cloud cover)

## Database Schema

### Tables

1. **scan_areas**: Monitoring area definitions
   - Geographic boundaries
   - Target type and priority
   - Active/inactive status

2. **scan_sessions**: Tracking scan operations
   - Start/completion times
   - Tile progress counters
   - Success/failure status

3. **captured_images**: Image metadata
   - Tile coordinates
   - Object storage keys
   - Detection scores (future enhancement)

## Workflow

### Daily Scan Process

1. **Initialization** (2:00 AM UTC)
   - Authenticate with Sentinel Hub
   - Query active scan areas from database
   - Sort by priority

2. **Area Processing**
   - Check for recent scans (24-hour window)
   - Generate tile grid for area
   - Create scan session record

3. **Tile Capture**
   - Request satellite imagery for tile bbox
   - Apply detection evalscript
   - Upload to object storage
   - Record in database

4. **Session Completion**
   - Update progress metrics
   - Mark session as completed/failed
   - Log statistics

### Error Handling

- **Partial Failures**: Continues processing if <50% tiles fail
- **Rate Limiting**: 2-second delay between areas
- **Session Recovery**: Tracks progress for potential resumption
- **Duplicate Prevention**: Unique constraint on (area, tile, date)

## API Endpoints

### Internal (Cron-triggered)
- `scanOceans()`: Main scanning function called by cron job

### Public APIs
- `POST /ocean-monitor/trigger-scan`: Manual scan trigger (testing)
- `GET /ocean-monitor/areas`: List all monitoring areas
- `GET /ocean-monitor/areas/:id/status`: Check scan status
- `POST /ocean-monitor/areas`: Add new monitoring area
- `GET /ocean-monitor/images/*`: Download captured images

## Configuration

### Encore Secrets Setup
```bash
# Configure Sentinel Hub credentials as Encore secrets
encore secret set --type local SENTINELHUB_CLIENT_ID
encore secret set --type local SENTINELHUB_CLIENT_SECRET
```

For production:
```bash
encore secret set --type prod SENTINELHUB_CLIENT_ID
encore secret set --type prod SENTINELHUB_CLIENT_SECRET
```

### Default Monitoring Areas

The service comes preconfigured with key Brazilian coastal areas:

1. **Guanabara Bay**: Oil and plastic monitoring (10km radius)
2. **Copacabana Beach**: Plastic debris focus (5km radius)
3. **Angra dos Reis**: Oil spill monitoring (15km radius)

## Storage Structure

Images are stored with the following key pattern:
```
ocean-monitor/{target}/{area_id}/{date}/tile_{x}_{y}.png
```

Example:
```
ocean-monitor/plastic/area-123/2024-01-15/tile_5_10.png
```

## Performance Considerations

- **Tile Size**: 512x512 pixels balances detail vs. API calls
- **Parallel Processing**: Currently sequential, could be parallelized
- **Rate Limits**: Respects Sentinel Hub API limits
- **Storage**: ~250KB per tile, ~100MB per 10km radius area

## Future Enhancements

1. **ML Integration**: Automatic detection scoring using trained models
2. **Alert System**: Notifications for high pollution detections
3. **Adaptive Scanning**: Increase frequency for high-risk areas
4. **Resolution Modes**: Variable tile sizes based on requirements
5. **Historical Analysis**: Trend detection and change monitoring
6. **Public Dashboard**: Visualization of scan results

## Development

### Quick Start

1. **Start the Encore service**:
```bash
encore run
```

2. **Set up Sentinel Hub credentials**:
```bash
encore secret set --type local SENTINELHUB_CLIENT_ID
encore secret set --type local SENTINELHUB_CLIENT_SECRET
```

3. **Trigger a manual scan** (for testing):
```bash
curl -X POST http://localhost:4000/ocean-monitor/trigger-scan
```

### Testing Rio de Janeiro Areas

The service comes pre-configured with Rio de Janeiro coastal monitoring. To test:

```bash
# 1. View all configured areas (includes Rio de Janeiro)
curl http://localhost:4000/ocean-monitor/areas

# 2. Trigger immediate scan of all areas
curl -X POST http://localhost:4000/ocean-monitor/trigger-scan

# 3. Check scan status for a specific area
# First get the area ID from the list, then:
curl http://localhost:4000/ocean-monitor/areas/{area-id}/status
```

### Adding New Rio de Janeiro Areas

```bash
# Example: Add Ipanema Beach monitoring
curl -X POST http://localhost:4000/ocean-monitor/areas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Praia de Ipanema - Plástico",
    "centerLat": -22.987,
    "centerLon": -43.205,
    "radiusKm": 3,
    "target": "plastic",
    "priority": 1
  }'

# Example: Add Santos Port for oil monitoring
curl -X POST http://localhost:4000/ocean-monitor/areas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Porto de Santos - Óleo",
    "centerLat": -23.9,
    "centerLon": -46.3,
    "radiusKm": 8,
    "target": "oil",
    "priority": 1
  }'
```

### Monitoring Progress

Watch the Encore logs to see the scanning progress:
```bash
# The logs will show:
# - Areas being processed
# - Tiles being generated and captured
# - Images being stored
# - Session completion status
```

### Downloading Captured Images

After a scan completes, you can download the captured images:
```bash
# Get list of images for an area
curl http://localhost:4000/ocean-monitor/areas/{area-id}/status

# Download a specific image
curl http://localhost:4000/ocean-monitor/images/{object-key} -o image.png
```

## License

Part of the OceanGuard initiative for ocean health monitoring.