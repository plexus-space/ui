# Component Library Roadmap

## Vision

Building WebGPU-powered visualization primitives for deep tech and physical systems: aerospace, medical devices, robotics, industrial automation, hardware engineering, and scientific computing.

## Design Principles

- **Cross-domain primitives**: Components work across hardware, medical, aerospace, industrial
- **Composability**: All components expose primitive APIs for custom composition
- **Performance**: WebGPU-first with WebGL2 fallback, targeting 100k+ data points at 60fps
- **Production-ready**: Consistent patterns, TypeScript, comprehensive examples

---

## Implemented Components (12)

### Charts

- **Line Chart** - Multi-series time-series, streaming support, 100k+ points
- **Scatter Chart** - Point clouds, variable sizes, alpha blending
- **Bar Chart** - Grouped/stacked, horizontal/vertical, categorical
- **Area Chart** - Filled regions, stacked series

### Sensors & Analysis

- **Heatmap Chart** - 2D grid color mapping, custom scales, legends
- **Radar Chart** - Polar plots, animated sweep, multi-series

### Instruments

- **Gauge** - Circular/semi-circular/linear, zones, needles, ticks
- **Attitude Indicator** - Aviation artificial horizon, pitch/roll

### Data Display

- **Status Grid** - KPI dashboard with inline sparklines
- **Data Grid** - Virtual scrolling, sortable columns, 100k+ rows

### 3D Visualization

- **3D Model Viewer** - Multi-format (STL/OBJ/PLY/GLTF/GLB), vertex data overlay, real-time updates

### Planning & Scheduling

- **Gantt Chart** - Infinite scroll, zoom, drag-to-pan, timezone-aware, live time marker

**Total: ~15,000+ lines of production code**

---

## Roadmap

### Tier 1 - 3D Data Overlays (Highest Priority)

#### 1. 3D Model Viewer with Data Overlay ⭐⭐⭐

**Status**: ✅ **IMPLEMENTED**
**Category**: `3d`
**Complexity**: Advanced

**Description**: Load and display 3D models with real-time data visualization overlays

**Key Features**:

- Load 3D meshes (GLB/GLTF, OBJ, STL formats)
- Apply heatmap textures/vertex colors from sensor data
- Camera controls (orbit, pan, zoom, perspective/orthographic)
- Cross-section planes (slice through model)
- Measurement tools (distance, angle, area)
- Lighting (PBR materials, shadows)
- Annotations and labels

**Use Cases**:

- Temperature/stress on PCB or spacecraft components
- Blood flow/oxygen saturation on organs and anatomy
- Structural analysis on mechanical parts
- Radiation/thermal exposure on equipment
- Defect detection on manufactured parts

**Performance Targets**:

- 1M+ triangles at 60fps
- Real-time data updates (1kHz)
- Smooth camera controls

**Implemented Features** (packages/components/charts/3d-model-viewer.tsx):

- ✅ Multi-format support: STL, OBJ, PLY, GLTF/GLB
- ✅ Vertex-based data overlay (per-vertex color mapping)
- ✅ Spatial data functions (calculate values from x/y/z positions)
- ✅ Real-time animated data updates (heartbeat example)
- ✅ Multiple color maps (viridis, plasma, inferno, jet, grayscale)
- ✅ Orbit controls (drag, zoom, pan)
- ✅ Optional grid and axes
- ✅ Auto-centering and bounding box calculation
- ✅ Built on react-three-fiber + three.js (industry standard)
- ✅ Comprehensive examples in playground

**Deferred for Future Enhancement**:

- Cross-section planes (slice through model)
- Measurement tools (distance, angle, area)
- PBR material support enhancement
- Texture-based heatmap overlays (currently uses vertex colors)

---

#### 2. Point Cloud Viewer

**Status**: Planned
**Category**: `3d`
**Complexity**: Advanced

**Description**: Display and interact with millions of 3D points with attributes

**Key Features**:

- Display 1M+ points with instanced rendering
- Color by any attribute (intensity, classification, custom data)
- Variable point sizes and shapes (square, circle, sphere)
- Filtering by attribute ranges
- Camera controls (orbit, pan, zoom)
- Point picking and selection
- Octree spatial indexing for performance

**Use Cases**:

- LIDAR scans (terrain, buildings, infrastructure)
- CT/MRI voxel data (medical volumetric imaging)
- Particle simulations (physics, chemistry, molecular dynamics)
- Sensor network positions in 3D space
- Astronomical data (star catalogs, galaxy surveys)

**Performance Targets**:

- 10M+ points at 60fps
- Interactive filtering without lag
- Smooth camera controls

**Implementation Notes**:

- Instanced rendering for points
- WebGPU compute shaders for filtering
- Octree for frustum culling
- Level-of-detail (LOD) by distance

---

#### 3. Vector Field Visualization

**Status**: Planned
**Category**: `3d` / `analysis`
**Complexity**: Advanced

**Description**: Visualize directional data with arrows, streamlines, or line integral convolution

**Key Features**:

- 2D and 3D vector field rendering
- Arrows (scaled by magnitude, color-coded)
- Streamlines (particle tracing along field)
- Line Integral Convolution (LIC) for dense fields
- Animated flow particles
- Configurable density and spacing

**Use Cases**:

- Fluid dynamics (CFD airflow, blood flow, ocean currents)
- Electromagnetic fields (E-field, B-field, antenna radiation)
- Force vectors on structures (stress, strain)
- Wind patterns, thermal gradients
- Gradient fields in optimization

**Performance Targets**:

- 100k+ arrows at 60fps
- Smooth streamline animation
- Real-time field updates

**Implementation Notes**:

- Instanced arrow rendering
- Compute shaders for particle tracing
- LIC via texture-space convolution
- Runge-Kutta integration for streamlines

---

### Tier 2 - Frequency & Spectral Analysis

#### 5. Waterfall / Spectrogram Chart

**Status**: Planned
**Category**: `sensors` / `analysis`
**Complexity**: Medium-High

**Description**: Time vs frequency visualization with color-coded intensity

**Key Features**:

- Time on X-axis, frequency on Y-axis, intensity as color
- Scrolling/rolling display (oldest data drops off)
- Logarithmic or linear frequency scale
- Custom color scales (viridis, jet, grayscale)
- Frequency resolution control
- dB scale or linear magnitude

**Use Cases**:

- RF spectrum analysis (SDR, radio, wireless)
- Vibration analysis (mechanical, structural)
- Audio processing (music, speech, acoustics)
- Seismic data (earthquake monitoring)
- Bio-signals (EMG, EEG frequency content)

**Performance Targets**:

- 1024 FFT bins at 60fps
- Smooth scrolling
- Real-time updates (streaming mode)

**Implementation Notes**:

- WebGPU compute shader for FFT (or use CPU FFT library)
- Texture-based rendering (one row per time slice)
- Circular buffer for scrolling
- GPU texture updates

---

### Tier 3 - Geospatial & Topology

#### 7. Map / Geo Overlay

**Status**: Planned
**Category**: `geo`
**Complexity**: Medium-High

**Description**: Geographic data visualization with custom projections

**Key Features**:

- Lat/lon to screen space conversion
- Zoom/pan with Web Mercator projection
- Polyline paths (flight paths, routes)
- Markers and labels
- Heatmap overlay (density, sensor data)
- Vector tiles or raster tiles background
- Custom projections (Lambert, Albers, etc.)

**Use Cases**:

- Drone/aircraft flight paths
- Sensor network deployment maps
- Vehicle tracking (GPS traces)
- Satellite ground tracks
- Weather data overlays

**Performance Targets**:

- 100k+ points/polylines at 60fps
- Smooth zoom/pan

**Implementation Notes**:

- WebGPU for vector rendering
- Tile fetching and caching
- Projection math (proj4js or custom)
- LOD for markers at different zoom levels

---

#### 8. Network Graph / Topology Viewer

**Status**: Planned
**Category**: `graphs`
**Complexity**: High

**Description**: Node-edge diagrams with physics-based or hierarchical layout

**Key Features**:

- Force-directed layout (D3-force or custom)
- Hierarchical tree layouts
- Node shapes, sizes, colors, icons
- Edge thickness and color by weight
- Zoom/pan with node clustering at scales
- Interactive node dragging
- Search and highlighting

**Use Cases**:

- System architecture (hardware components, subsystems)
- Dependency graphs (software, data pipelines)
- Neural network architectures
- Supply chain networks
- Fault trees and failure analysis

**Performance Targets**:

- 10k+ nodes, 50k+ edges at 60fps
- Smooth layout animation

**Implementation Notes**:

- WebGPU for rendering (instanced nodes, batched edges)
- CPU or GPU compute for force simulation
- Spatial indexing for picking
- WebWorker for layout computation

---

#### 9. Sankey / Flow Diagram

**Status**: Planned
**Category**: `charts`
**Complexity**: Medium

**Description**: Visualize flows and transfers between nodes

**Key Features**:

- Curved paths between nodes
- Width proportional to flow magnitude
- Gradient colors along paths
- Interactive highlighting on hover
- Multi-level hierarchies
- Conservation validation (in = out)

**Use Cases**:

- Power distribution in systems
- Fluid/gas flow in pipes and manifolds
- Data pipeline throughput
- Material flow in manufacturing
- Energy balance diagrams

**Performance Targets**:

- 100+ nodes, 500+ flows at 60fps
- Smooth animations

**Implementation Notes**:

- Bézier curve generation for paths
- WebGPU for gradient-filled paths
- Layout algorithm (minimize crossings)
- Conservation checks

---

### Tier 4 - Specialized Components

#### 10. Gantt Chart ⭐

**Status**: Planned
**Category**: `charts` / `planning`
**Complexity**: Medium

**Description**: Project timeline visualization with tasks, dependencies, and milestones

**Key Features**:

- Horizontal timeline with task bars
- Task dependencies (arrows between bars)
- Milestones (diamonds)
- Progress tracking (% complete bars)
- Grouping and hierarchy (collapsible sections)
- Today marker and date grid
- Drag-and-drop task rescheduling
- Critical path highlighting

**Use Cases**:

- Mission planning and scheduling
- Project timelines (development, construction)
- Manufacturing schedules
- Maintenance planning
- Resource allocation over time

**Performance Targets**:

- 1000+ tasks at 60fps
- Smooth scrolling and zooming

**Implementation Notes**:

- Reuse bar-chart rendering
- Custom layout for dependencies
- WebGPU for bar rendering
- HTML overlay for text labels

---

#### 11. Anomaly Detection Visualization

**Status**: Planned
**Category**: `analysis` / `sensors`
**Complexity**: Medium-High

**Description**: Real-time anomaly highlighting on time-series and sensor data

**Key Features**:

- Threshold-based detection (upper/lower bounds)
- Statistical anomalies (z-score, IQR, Grubbs test)
- ML-based anomaly scores (external model integration)
- Anomaly markers and annotations
- Confidence intervals and bands
- Alert zones with color coding
- Historical anomaly timeline

**Use Cases**:

- Sensor fault detection (temperature, pressure, vibration)
- Quality control (out-of-spec measurements)
- Network monitoring (latency spikes, packet loss)
- Financial anomalies (fraud detection)
- Predictive maintenance (early failure detection)

**Performance Targets**:

- Real-time detection on 100k+ points
- Low-latency anomaly highlighting

**Implementation Notes**:

- Integrate with existing line-chart
- Compute shaders for statistical tests
- External ML model integration (ONNX Runtime)
- Configurable detection algorithms

## Category Organization

```
charts/              # Line, Scatter, Bar, Area, Gantt
sensors/             # Heatmap, Radar, Waterfall, Anomaly Detection
instruments/         # Gauge, Attitude Indicator
3d/                  # 3D Model Viewer, Point Cloud, Vector Field, Cross-Section
geo/                 # Map Overlay
graphs/              # Network Graph, System Dependency Intelligence
analysis/            # FFT Spectrum, Anomaly Detection
configuration/       # Rules Engine UI
data-display/        # Status Grid, Data Grid
```

---

## Implementation Timeline (Suggested)

### Q1 2025

- 3D Model Viewer with Data Overlay
- Point Cloud Viewer
- Gantt Chart

### Q2 2025

- Vector Field Visualization
- Waterfall / Spectrogram Chart
- Anomaly Detection Visualization

### Q3 2025

- Cross-Section / Slice Viewer

### Q4 2025

- Map / Geo Overlay
- Network Graph
- FFT Spectrum Analyzer

## Performance Optimization Strategy

### ✅ Buffer Reuse Optimization (COMPLETED - December 2024)

**Status**: All WebGPU renderers now implement persistent buffer reuse

**Implemented in**:

- ✅ line-chart.tsx - Grid and line buffers
- ✅ bar-chart.tsx - Bar rendering buffers
- ✅ heatmap-chart.tsx - Cell rendering buffers
- ✅ scatter-chart.tsx - Grid and scatter point buffers
- ✅ area-chart.tsx - Grid, area fill, and line buffers
- ✅ gauge.tsx - Already implemented
- ✅ radar-chart.tsx - Already implemented
- ✅ attitude-indicator.tsx - Already implemented

**Pattern Used** (1.5x growth factor):

```typescript
// Persistent buffers declared in renderer closure
const buffers = {
  position: null as GPUBuffer | null,
  color: null as GPUBuffer | null,
};

// In onRender: Create or resize only when needed
if (
  !buffers.position ||
  buffers.position.size < positionData.byteLength * 1.5
) {
  buffers.position?.destroy();
  buffers.position = device.createBuffer({
    size: Math.ceil(positionData.byteLength * 1.5),
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
}
device.queue.writeBuffer(buffers.position, 0, positionData);

// In onDestroy: Clean up all buffers
buffers.position?.destroy();
buffers.color?.destroy();
```

**Impact**:

- Eliminates per-frame buffer allocation and GC pressure
- Critical for streaming scenarios (EEG, telemetry, real-time data)
- Smoother 60fps performance with large datasets
- Reduced memory churn during animations

### Compute Shader Opportunities

- Data preprocessing (downsampling, filtering)
- FFT for spectral analysis
- Physics simulations (force-directed graphs)
- Particle systems
- Volume rendering

### Testing & Benchmarking

- Automated FPS testing with varying dataset sizes
- Memory leak detection (buffer cleanup)
- Visual regression tests (WebGPU vs WebGL2 parity)
- Cross-browser compatibility

---

## Registry Schema Improvements

Add metadata to track roadmap components:

```json
{
  "components": {
    "3d-model-viewer": {
      "name": "3d-model-viewer",
      "version": "0.0.0",
      "displayName": "3D Model Viewer",
      "category": "3d",
      "status": "planned",
      "complexity": "advanced",
      "description": "Load 3D models with real-time data overlay",
      "plannedFeatures": [
        "GLB/GLTF/OBJ/STL support",
        "Heatmap texture overlays",
        "Cross-section planes",
        "Camera controls",
        "Measurement tools"
      ],
      "useCase": "Hardware thermal analysis, medical anatomy visualization",
      "estimatedCompletionQ": "2025-Q1",
      "tier": "free"
    }
  },
  "roadmap": {
    "2025-Q1": ["3d-model-viewer", "point-cloud-viewer", "gantt-chart"],
    "2025-Q2": ["vector-field-viz", "waterfall-chart", "anomaly-detection"],
    "2025-Q3": ["cross-section-viewer", "system-dependency", "rules-engine"],
    "2025-Q4": ["map-overlay", "network-graph", "fft-spectrum"]
  }
}
```

---

## Success Criteria

For each component:

1. Follows existing architecture patterns (base-chart.tsx structure)
2. WebGPU + WebGL2 dual rendering with visual parity
3. Meets performance targets (documented in component spec)
4. 2-4 working examples across different domains
5. Primitive composition works (Root, Canvas, primitives)
6. Added to registry and playground
7. Clean, documented, type-safe TypeScript code
8. No WebGPU API misuse or false performance claims

---

## Next Steps

**Completed (December 2024):**

1. ✅ Finalize roadmap and categories
2. ✅ 3D Model Viewer implementation (highest value)
3. ✅ Buffer reuse optimization across all WebGPU renderers
4. ✅ Shared color scale primitive (lib/color-scales.ts)
5. ✅ Architectural deviation documentation (Gantt, DataGrid)
6. ✅ Heatmap refactored to use shared color scales

**Immediate priorities:**

1. Update registry.json with 3D Model Viewer and Gantt Chart
2. Add performance benchmarks (automated FPS testing)
3. Create API documentation site
4. Consider refactoring 3D Model Viewer to use shared color scales

**Questions to resolve:**

- ✅ 3D model formats: STL, OBJ, PLY, GLTF/GLB all supported
- ✅ External dependencies: three.js + react-three-fiber approved for 3D
- Licensing for component library? (MIT, Apache 2.0?)
- Compute shader compatibility? (WebGPU only or polyfill for WebGL2?)
- Should other components (DataGrid, Gantt) also support WebGPU where practical?
