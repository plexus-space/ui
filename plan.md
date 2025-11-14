# Component Library Roadmap

## Vision

Building WebGPU-powered visualization primitives for deep tech and physical systems: aerospace, medical devices, robotics, industrial automation, hardware engineering, and scientific computing.

## Design Principles

- **Cross-domain primitives**: Components work across hardware, medical, aerospace, industrial
- **Composability**: All components expose primitive APIs for custom composition
- **Performance**: WebGPU-first with WebGL2 fallback, targeting 100k+ data points at 60fps
- **Production-ready**: Consistent patterns, TypeScript, comprehensive examples

---

## Production Components (16)

### Charts (6 components)

- **Line Chart** - Multi-series time-series, streaming support, 100k+ points (WebGPU + WebGL2)
- **Scatter Chart** - Point clouds, variable sizes, alpha blending (WebGPU + WebGL2)
- **Bar Chart** - Grouped/stacked, horizontal/vertical, categorical (WebGPU + WebGL2)
- **Area Chart** - Filled regions, stacked series (WebGPU + WebGL2)
- **Histogram** - Distribution analysis, automatic binning (Sturges/Scott/Freedman-Diaconis), normal curve overlay (WebGPU + WebGL2 via BarChart)
- **Gantt Chart** - Infinite scroll, zoom, drag-to-pan, timezone-aware, live time marker (SVG - intentional architectural choice)

### Sensors & Analysis (4 components)

- **Heatmap Chart** - 2D grid color mapping, scientific color scales, legends (WebGPU + WebGL2)
- **Radar Chart** - Polar plots, animated sweep, ATC-style display (WebGPU + WebGL2)
- **Waterfall/Spectrogram Chart** - Time-frequency visualization, STFT, built-in FFT, Hann windowing, dB/log/linear modes (Canvas2D)
- **Control Chart (SPC)** - Statistical process control, Western Electric rules (1-4), UCL/LCL, zones A/B/C (WebGPU + WebGL2 via LineChart)

### Instruments (2 components)

- **Gauge** - Circular/semi-circular/linear, zones, needles, ticks (WebGPU + WebGL2)
- **Attitude Indicator** - Aviation artificial horizon, pitch/roll (WebGPU + WebGL2)

### Data Display (2 components)

- **Status Grid** - KPI dashboard with inline sparklines (WebGL only)
- **Data Grid** - Virtual scrolling, sortable columns, 100k+ rows (Hybrid GPU + DOM)

### 3D Visualization (1 component - beta)

- **3D Model Viewer** - Multi-format (STL/OBJ/PLY/GLTF/GLB), vertex data overlay, real-time heatmap updates (Three.js + react-three-fiber)

**Total: 16 production components, ~17,000+ lines of code**

**Rendering Architecture Summary:**
- 11 components: Dual WebGPU + WebGL2 rendering (including Histogram via BarChart, Control Chart via LineChart)
- 1 component: WebGL2 only (Status Grid)
- 1 component: Canvas2D (Waterfall Chart - texture-based rendering)
- 1 component: Hybrid GPU + DOM (Data Grid - for text quality)
- 1 component: SVG (Gantt Chart - for DOM layout benefits)
- 1 component: Three.js (3D Model Viewer - industry standard for 3D)

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

---

## Deprioritized Components

### Point Cloud Viewer (Removed December 2024)

**Rationale**: Overlaps significantly with 3D Model Viewer vertex data overlay capability. The 3D Model Viewer can handle point cloud visualization through vertices with appropriate rendering modes. Removed to reduce maintenance burden and avoid API surface duplication.

### Vector Field Visualization (Removed December 2024)

**Rationale**: Niche use case with limited cross-domain applicability. Better served by custom WebGPU implementations when needed. May be reconsidered as a future specialized component if demand materializes.

---

### Tier 2 - Frequency & Spectral Analysis

#### 5. Waterfall / Spectrogram Chart ⭐

**Status**: ✅ **IMPLEMENTED** (January 2025)
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

**Implemented Features** (packages/components/charts/waterfall-chart.tsx):

- ✅ Canvas2D texture-based rendering
- ✅ Built-in Cooley-Tukey FFT implementation (no external dependencies)
- ✅ STFT (Short-Time Fourier Transform) with configurable FFT size and hop size
- ✅ Hann window function to reduce spectral leakage
- ✅ Multiple color scales (viridis, plasma, inferno, turbo, cool, warm, grayscale)
- ✅ Three intensity modes: linear, logarithmic, dB (decibel)
- ✅ Linear and logarithmic frequency scales
- ✅ Auto-scrolling for real-time streaming
- ✅ Helper functions: generateSignal(), generateChirp(), stft()
- ✅ Comprehensive examples: multi-tone, chirp sweep, AM/FM signals

**Future Enhancements**:

- WebGPU compute shader for FFT (performance optimization)
- Frequency markers and annotations
- Peak detection and tracking
- Time cursors with spectrum snapshot
- SNR indicators

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

#### 11. Control Chart (Statistical Process Control) ⭐

**Status**: ✅ **IMPLEMENTED** (January 2025)
**Category**: `analysis`
**Complexity**: Medium

**Description**: SPC charts with Western Electric rules detection for manufacturing quality control

**Key Features**:

- Control limits (UCL/LCL) at ±3 sigma
- Warning limits at ±2 sigma
- Zones A, B, C visualization
- Western Electric rules 1-4 detection
- Automatic out-of-control violation alerts
- Customizable control limits (engineering specs or calculated from data)

**Implemented Features** (packages/components/charts/control-chart.tsx):

- ✅ SVG overlay on LineChart for control limits
- ✅ Western Electric Rule 1: One point beyond 3-sigma
- ✅ Western Electric Rule 2: 2 out of 3 consecutive points beyond 2-sigma
- ✅ Western Electric Rule 3: 4 out of 5 consecutive points beyond 1-sigma
- ✅ Western Electric Rule 4: 8 consecutive points on same side of mean
- ✅ Zone highlighting (A/B/C with color coding)
- ✅ Violation markers and callbacks
- ✅ Helper functions: calculateControlLimits(), generateSPCData()
- ✅ Comprehensive examples: stable process, drift detection, outliers

**Use Cases**:

- Manufacturing quality control
- Levey-Jennings charts (medical lab QC)
- Process monitoring and validation
- Out-of-control detection

#### 12. Histogram Chart ⭐

**Status**: ✅ **IMPLEMENTED** (January 2025)
**Category**: `charts`
**Complexity**: Low-Medium

**Description**: Distribution visualization with automatic binning methods

**Implemented Features** (packages/components/charts/histogram-chart.tsx):

- ✅ Automatic binning with 4 methods: Sturges, Scott, Freedman-Diaconis, sqrt
- ✅ Manual bin count override
- ✅ Three display modes: count, density, frequency
- ✅ Normal distribution curve overlay (SVG)
- ✅ Leverages BarChart WebGPU/WebGL2 rendering
- ✅ Helper functions: generateNormalData(), generateUniformData(), generateExponentialData()
- ✅ Statistical utilities: calculateStdDev(), calculateIQR()
- ✅ Comprehensive examples: normal, uniform, exponential distributions

**Use Cases**:

- Data distribution analysis
- Quality control tolerance analysis
- Experiment results visualization
- Measurement statistics
- Scientific computing

#### 13. Anomaly Detection Visualization

**Status**: Deferred
**Category**: `analysis` / `sensors`
**Complexity**: Medium-High

**Description**: Real-time anomaly highlighting on time-series and sensor data

**Note**: Control Chart component (implemented above) provides Western Electric rules-based anomaly detection for SPC use cases. Additional ML-based anomaly detection can be added later.

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

## Implementation Timeline

### Completed (December 2024)

- ✅ 3D Model Viewer with Data Overlay (Beta - using Three.js)
- ✅ Gantt Chart (Stable - SVG architecture)
- ✅ All 13 core components production-ready
- ✅ Buffer reuse optimization across all WebGPU renderers
- ✅ Shared color-scales library with 8 scientific colormaps

### Completed (January 2025)

- ✅ **Histogram Chart** - Distribution analysis with automatic binning (4 methods)
- ✅ **Control Chart (SPC)** - Statistical process control with Western Electric rules
- ✅ **Waterfall/Spectrogram Chart** - Time-frequency visualization with built-in FFT
- **Total: 16 production components** (up from 13)

### Q1 2025 (Planned - Remaining)

- Performance benchmarking suite (automated FPS testing)
- API documentation site
- Component interaction layer (click/selection handlers - deferred, requires touching all 13+ charts)
- Additional examples and use case documentation

### Q2 2025 (Planned)

- Anomaly Detection Visualization
- Map / Geo Overlay
- Enhanced 3D Model Viewer (cross-section planes, measurement tools)

### Q3 2025 (Planned)

- Network Graph / Topology Viewer
- Sankey / Flow Diagram
- Compute shader optimizations (FFT for waterfall)

### Q4 2025 (Planned)

- Advanced analytics components (based on user demand)
- WebGPU compute shader framework
- Mobile optimization pass

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
7. ✅ Registry updated with all 13 production components
8. ✅ Gantt Chart production deployment
9. ✅ Removed redundant components (Point Cloud, Vector Field)

**Completed (January 2025):**

1. ✅ **Histogram Chart** - Distribution analysis (ROI 6.0, highest ROI component)
2. ✅ **Control Chart (SPC)** - Statistical process control (ROI 4.6, critical for manufacturing)
3. ✅ **Waterfall/Spectrogram Chart** - Time-frequency analysis (ROI 4.0, most requested across markets)
4. ✅ **Registry updated** with 16 production components
5. ✅ **Comprehensive playground examples** for all 3 new components
6. ✅ **Built-in FFT utilities** (no external dependencies)
7. ✅ **Histogram binning utilities** added to lib/data-utils.ts

**Immediate priorities (Q1 2025 - Remaining):**

1. **Performance benchmarking suite** - Automated FPS testing with varying dataset sizes
2. **API documentation site** - Interactive examples and component gallery
3. **Component showcase** - Production examples from aerospace/medical/industrial domains
4. **Interaction layer** (Deferred - requires modifying all charts, high risk)
5. **Additional use case examples** - Real-world demos for each market segment

**Questions to resolve:**

- ✅ 3D model formats: STL, OBJ, PLY, GLTF/GLB all supported
- ✅ External dependencies: three.js + react-three-fiber approved for 3D
- Licensing for component library? (MIT, Apache 2.0?)
- Compute shader compatibility? (WebGPU only or polyfill for WebGL2?)
- Should other components (DataGrid, Gantt) also support WebGPU where practical?
