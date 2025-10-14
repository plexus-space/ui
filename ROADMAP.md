# Plexus UI Roadmap

> **Vision:** The definitive primitive-first, WebGPU-powered component library for deeptech: medical, aerospace HUD interfaces and real-time sensor fusion visualization. Built for defense, aerospace, healthcare and autonomous systems.

## Guiding Principles

1. **Primitive-First Architecture** - core WebGPU primitives, everything else composes
2. **Aerospace Domain Expertise** - HUD, sensor fusion, tactical interfaces, mission control
3. **WebGPU-Accelerated Performance** - 100k+ points @ 60fps, real-time multi-sensor rendering
4. **Shadcn-Style Composability** - Dot notation API (`HUD.PitchLadder`, `SensorFusion.ThermalOverlay`)
5. **Copy-Paste Philosophy** - Components you own and customize (not npm dependencies)
6. **TypeScript Native** - Full type safety with dimensional analysis
7. **Beautiful by Default** - Inspired by military/aerospace UI design language

---

## Phase 0: Foundation ✅ (Complete)

### ✅ WebGPU Rendering Primitives

**TRUE GPU Compute Shaders - 10x Faster than WebGL**

- [x] **WebGPULineRenderer** - 1M+ points @ 60fps (telemetry, waveforms, ground tracks)
- [x] **WebGPUPointCloud** - 100k+ points @ 60fps (LiDAR, scatter plots, particles)
- [x] **WebGPUMeshRenderer** - 100k+ triangles @ 60fps (terrain, CAD models)
- [x] **WebGPUVectorField** - 100k+ vectors @ 60fps (CFD, magnetic fields)

### ✅ Math & Physics Primitives

- [x] **Vector/Matrix Math** - vec3, vec4, 4x4 transforms
- [x] **Coordinate Systems** - ECI ↔ ECEF ↔ Geodetic ↔ UTM
- [x] **Physics Engine** - Euler, Verlet, RK4 integrators
- [x] **Orbital Mechanics** - Kepler solvers, state vectors, elements
- [x] **Units System** - Type-safe dimensional analysis
- [x] **Validation** - NaN/Infinity handling, bounds checking

### ✅ Demo Components (Show Performance)

- [x] **LineChart** - WebGPU auto-switching @ 5k points, 1M points @ 60fps (validates WebGPU infrastructure)

---

## Phase 1: HUD & Tactical Interfaces

> **Market Analysis:** ZERO web-based component libraries exist. Only Unity/Unreal assets ($49) and proprietary military systems. Defense contractors and aerospace companies building web dashboards have no open-source options.

### HUD Core Elements (SVG-Based)

**Architecture:** SVG with transforms, CSS animations, no canvas complexity

```tsx
<HUD.Root width={1920} height={1080}>
  <HUD.HeadingTape heading={245} range={45} showCardinals />
  <HUD.PitchLadder pitch={15} roll={-5} fov={60} />
  <HUD.Reticle target={[lat, lon, alt]} range={12500} lockState="tracking" />
  <HUD.CornerBrackets state="locked" animated />
  <HUD.CoordinateOverlay position={[lat, lon, alt]} format="dms" />
  <HUD.RangeFinder range={12500} unit="meters" label="TARGET" />
</HUD.Root>
```

**Components to Build:**

- [ ] **HUD.Root** - Canvas/SVG container with responsive scaling
- [ ] **HUD.HeadingTape** - Infinite scrolling compass with runway markers
- [ ] **HUD.PitchLadder** - Artificial horizon with flight director
- [ ] **HUD.Reticle** - Targeting crosshair with range/bearing data
- [ ] **HUD.CornerBrackets** - F-16/F-35 style lock-on brackets (animated)
- [ ] **HUD.CoordinateOverlay** - Lat/lon/alt display (DMS, decimal, MGRS)
- [ ] **HUD.RangeFinder** - Distance display with unit conversion
- [ ] **HUD.VelocityVector** - Flight path marker
- [ ] **HUD.AltitudeTape** - Vertical tape with ground/terrain warnings
- [ ] **HUD.SpeedTape** - Vertical tape with airspeed/groundspeed

**Use Cases:**

- Military training simulators
- Aerospace mission control dashboards
- Drone operator interfaces
- Defense contractor proposals/demos
- UAV ground control stations

**Deliverable:** Complete HUD component library and demo in playground that uses user camera.

---

## Phase 2: Tactical Displays

### Radar & Sonar Interfaces

```tsx
<HUD.RadarScope
  contacts={radarContacts}
  sweepAngle={0}
  range={50000}
  rangeRings={[10000, 25000, 50000]}
  mode="ppi" // Plan Position Indicator
/>

<HUD.SonarDisplay
  contacts={acousticContacts}
  bearingRange={180}
  timeWindow={300}
  colorMap="acoustic"
/>
```

**Components to Build:**

- [ ] **HUD.RadarScope** - PPI display with rotating sweep, bearing lines
- [ ] **HUD.SonarDisplay** - Waterfall-style bearing vs. time
- [ ] **HUD.SituationDisplay** - Blue Force Tracker (IFF markers, velocity vectors)
- [ ] **HUD.ThreatRing** - Weapon range circles with threat level
- [ ] **HUD.IFFMarker** - Friend/Foe identification symbology

**Architecture:** Canvas2D or WebGPU for 100+ contacts

**Deliverable:** 5 tactical display components

---

## Phase 3: Sensor Fusion Visualization

> **Market Analysis:** Sensor fusion algorithms exist (MATLAB, Python), but ZERO visualization libraries. Autonomous vehicles, defense surveillance, and industrial inspection all need this. $100B+ TAM across autonomous, aerospace, and defense sectors.

### Multi-Sensor Overlay

**Architecture:** WebGPU-powered layered rendering with blend modes

```tsx
<SensorFusion.Root>
  <SensorFusion.Canvas width={1920} height={1080}>
    {/* Base layer: LiDAR point cloud */}
    <SensorFusion.LidarLayer
      points={lidarPoints}
      colorBy="range"
      pointSize={2}
    />

    {/* Overlay: Thermal camera */}
    <SensorFusion.ThermalOverlay
      thermal={thermalImage}
      palette="whiteHot" // or blackHot, ironbow, rainbow
      opacity={0.6}
      minTemp={0}
      maxTemp={100}
    />

    {/* Overlay: Radar tracks */}
    <SensorFusion.RadarContacts
      contacts={radarTracks}
      showVelocity
      showUncertainty
    />

    {/* Overlay: AI detections */}
    <SensorFusion.ObjectDetection
      boxes={aiDetections}
      showLabels
      showConfidence
    />

    {/* Overlay: RGB video */}
    <SensorFusion.VideoLayer
      stream={rgbVideo}
      opacity={0.3}
      blendMode="overlay"
    />
  </SensorFusion.Canvas>
</SensorFusion.Root>
```

**Components to Build:**

- [ ] **SensorFusion.Root** - Coordinate system manager, time synchronization
- [ ] **SensorFusion.Canvas** - WebGPU-powered multi-layer renderer
- [ ] **SensorFusion.LidarLayer** - 3D point cloud (use WebGPUPointCloud primitive)
- [ ] **SensorFusion.ThermalOverlay** - False-color thermal imaging with LUTs
- [ ] **SensorFusion.RadarContacts** - Track-level fusion display
- [ ] **SensorFusion.ObjectDetection** - Bounding boxes with labels/confidence
- [ ] **SensorFusion.VideoLayer** - RGB/IR video with GPU decode
- [ ] **SensorFusion.TrackHistory** - Historical path with fade (trails)

**WebGPU Features:**

- Real-time coordinate transforms (sensor → world frame)
- GPU-based color mapping (thermal palettes)
- Multi-layer compositing with blend modes
- Spatial indexing for fast hover/selection
- Zero-copy buffer updates

**Use Cases:**

- Autonomous vehicle perception dashboards
- Defense surveillance systems
- Drone multi-sensor payloads
- Industrial inspection (thermal + LiDAR drones)
- Search & rescue operations

**Deliverable:** 8 sensor fusion components

---

## Phase 4: Sensor Processing & Overlays (2026 Q1)

### Advanced Sensor Visualization

```tsx
{
  /* Night vision with gain control */
}
<SensorFusion.NightVisionOverlay mode="greenHot" gain={1.5} autoGain />;

{
  /* 3D radiometric mapping */
}
<SensorFusion.RadiometricMap
  lidarPoints={points}
  thermalData={thermal}
  colorBy="temperature"
/>;

{
  /* Real-time FFT for RF signals */
}
<SensorFusion.SpectrumAnalyzer
  rfData={rfSignal}
  fftSize={8192}
  colorMap="inferno"
  realTime
/>;
```

**Components to Build:**

- [ ] **SensorFusion.NightVisionOverlay** - Green/white hot with gain
- [ ] **SensorFusion.RadiometricMap** - 3D thermal point cloud
- [ ] **SensorFusion.SpectrumAnalyzer** - Real-time FFT with GPU compute
- [ ] **SensorFusion.ImagingRadar** - SAR/ISAR visualization
- [ ] **SensorFusion.FusionAlgorithm** - Kalman filter visualization

**Deliverable:** 5 advanced sensor components

---

## Phase 5: Polish, DevEx, Documentation (2026 Q2+)

### Developer Experience

- [ ] Documentation site with live demos (Docusaurus or Nextra)
- [ ] Storybook for component exploration
- [ ] Performance benchmarks (WebGPU vs WebGL vs CPU)
- [ ] Example gallery (aerospace/defense use cases)
- [ ] Video tutorials (HUD setup, sensor fusion)

### Examples & Templates

- [ ] UAV Ground Control Station template
- [ ] Military trainer HUD template
- [ ] Autonomous vehicle perception dashboard
- [ ] Multi-sensor fusion demo (LiDAR + thermal + radar)
- [ ] Air traffic control display

### Performance Tooling

- [ ] WebGPU DevTools integration
- [ ] Frame time profiler
- [ ] Memory usage tracker
- [ ] Component performance analyzer

---

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│  Domain Components (Aerospace-Specific)         │
│  HUD.PitchLadder, SensorFusion.ThermalOverlay  │
│  HUD.RadarScope, SensorFusion.LidarLayer       │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  Demo Components (Show Performance)             │
│  LineChart (1M points @ 60fps)                  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  WebGPU Primitives (Building Blocks)           │
│  WebGPULineRenderer, WebGPUPointCloud          │
│  WebGPUMeshRenderer, WebGPUVectorField         │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  WebGPU Core (Low-Level GPU Abstractions)      │
│  Device, Buffers, Pipelines, Compute Shaders   │
└─────────────────────────────────────────────────┘
```

**Key Principle:** Domain components compose primitives. Primitives are zero-dependency.

---

## Performance Targets

| Component          | Dataset Size       | Target              | Use Case                  |
| ------------------ | ------------------ | ------------------- | ------------------------- |
| **LineChart**      | 1M points          | ✅ 60fps (WebGPU)   | Telemetry waveforms       |
| **PointCloud**     | 100k points        | ✅ 60fps (WebGPU)   | LiDAR visualization       |
| **VectorField**    | 100k vectors       | ✅ 60fps (WebGPU)   | CFD flow viz              |
| **RadarScope**     | 100+ contacts      | 🎯 60fps (Canvas2D) | Air traffic control       |
| **SensorFusion**   | 4 layers real-time | 🎯 60fps (WebGPU)   | Autonomous perception     |
| **ThermalOverlay** | 1920x1080 @ 30Hz   | 🎯 30fps (WebGPU)   | Real-time thermal imaging |

**Optimizations:**

- ✅ Compute shaders for decimation (10x faster)
- ✅ Spatial indexing on GPU (O(1) hover)
- ✅ Zero-copy buffer updates
- 🎯 GPU color mapping (thermal palettes)
- 🎯 Multi-layer compositing
- 🎯 Real-time FFT on GPU

---

## Browser Support Strategy

### Automatic Fallback Chain

```
WebGPU (if available)
    ↓
WebGL2 (Three.js)
    ↓
Canvas2D (< 1k elements)
    ↓
SVG (< 100 elements)
```

**WebGPU Support:**

- ✅ Chrome 113+ (2023)
- ✅ Edge 113+ (2023)
- ✅ Firefox 115+ (experimental flag)
- ✅ Safari 18+ (macOS Sonoma)

**Detection:**

```typescript
if ("gpu" in navigator) {
  // Use WebGPU
} else if ("WebGL2RenderingContext" in window) {
  // Use Three.js (WebGL2)
} else {
  // Use Canvas2D/SVG
}
```

---

## Target Component Count

**Current:** ~11 components
**Q4 2025 Target:** ~34 components
**2026 Target:** ~44 components

**Distribution:**

- **WebGPU Primitives:** 4 (Line, Point, Mesh, VectorField)
- **Math/Physics Utils:** 8 (Vectors, Matrices, Coordinates, Units, Validation, Constants, Colormaps)
- **Demo Charts:** 1 (LineChart - validates WebGPU performance)
- **HUD Core:** 10 (HeadingTape, PitchLadder, Reticle, CornerBrackets, CoordinateOverlay, RangeFinder, VelocityVector, AltitudeTape, SpeedTape)
- **Tactical Displays:** 5 (RadarScope, SonarDisplay, SituationDisplay, ThreatRing, IFFMarker)
- **Sensor Fusion:** 8 (LidarLayer, ThermalOverlay, RadarContacts, ObjectDetection, VideoLayer, TrackHistory)
- **Advanced Sensors:** 5 (NightVision, RadiometricMap, SpectrumAnalyzer, ImagingRadar, FusionAlgorithm)
- **Support:** 2-4 (Legend, Tooltip, Export, Timestamp)

**Focus:** Quality over quantity. Every component must be:

1. GPU-accelerated (where applicable)
2. Primitive-based (composable)
3. Aerospace-relevant (domain-specific)
4. Production-ready (tested, documented)

---

## Success Metrics

### Technical Performance

- ✅ 1M points @ 60fps (LineChart)
- 🎯 100k points @ 60fps (LiDAR point cloud)
- 🎯 4-layer sensor fusion @ 60fps
- 🎯 Real-time thermal imaging @ 30fps

### Adoption

- **Target Users:** Aerospace companies, defense contractors, autonomous vehicle teams, drone operators
- **Use Cases:** Mission control dashboards, UAV ground stations, training simulators, perception debugging
- **Differentiation:** Only primitive-first, WebGPU-powered aerospace visualization library

### Developer Experience

- Composable API (shadcn-style)
- Full TypeScript support
- Automatic WebGPU/WebGL fallback
- Copy-paste component installation
- Live examples for all components

---

## Monetization Strategy

### Open Source Core (MIT License)

- WebGPU primitives
- Math/physics utilities
- Demo charts (LineChart only - validates performance)
- Basic HUD components (HeadingTape, PitchLadder, Reticle)

### Pro License ($5k/year per developer)

- All HUD components
- All sensor fusion components
- Advanced tactical displays
- Priority support

### Enterprise ($50k+/year)

- Custom sensor integrations
- On-premise deployment
- White-label branding
- Dedicated support engineer
- SLA guarantees

**Why This Works:**

- Defense contractors have budget authority
- Aerospace companies pay for specialized tools
- No open-source expectations for niche aerospace software
- High perceived value (looks expensive/complex)

---

## Next Steps (Immediate)

### Q1 2025: HUD Core (3 months)

1. Build HUD.Root container with responsive scaling
2. Implement HeadingTape with infinite scroll
3. Implement PitchLadder with roll rotation
4. Build Reticle with lock-on states
5. Add CornerBrackets with CSS animations
6. Documentation site with live demos

### Q2 2025: Tactical Displays (3 months)

1. RadarScope with PPI display
2. SituationDisplay with IFF markers
3. Coordinate/range overlays
4. AltitudeTape and SpeedTape
5. Example: UAV ground control station

### Q3 2025: Sensor Fusion Foundation (3 months)

1. SensorFusion.Root architecture
2. LidarLayer (WebGPUPointCloud)
3. ThermalOverlay with color LUTs
4. Multi-layer compositing
5. Example: Autonomous perception dashboard

### Q4 2025: Sensor Fusion Complete (3 months)

1. RadarContacts with track history
2. ObjectDetection with AI boxes
3. VideoLayer with GPU decode
4. Example: Multi-sensor fusion demo

---

## Why This Strategy Wins

### 1. **Completely Unserved Market**

- No web-based HUD component libraries exist
- No sensor fusion visualization libraries exist
- Defense/aerospace building web dashboards have zero options

### 2. **High Technical Moat**

- WebGPU expertise is rare
- Domain knowledge (aerospace/defense) is rare
- Combination is nearly unique

### 3. **Premium Pricing**

- Defense contractors pay $$$
- Aerospace companies pay $$$
- Can charge 10x more than generic chart libraries

### 4. **Primitive-First Differentiation**

- Visx is primitive-first but SVG (not GPU)
- Three.js/Babylon.js aren't primitive-focused
- We're the only "Radix UI for WebGPU visualization"

### 5. **Clear GTM Path**

- Target: Defense contractors, aerospace startups, drone companies
- Demo at: I/ITSEC, AUVSI XPONENTIAL, DefenseNews conferences
- Case studies: Autonomous vehicle companies, training simulators

---

## What We're NOT Building

### ❌ Dropped Entirely:

1. **Planet components** (Venus, Mars, Jupiter, etc.) - Already deleted
   - Reason: Niche use case, Cesium does this better
2. **Full terrain visualization** - Cesium/deck.gl dominate
3. **Generic orbital mechanics GUI** - STK is the standard
4. **Standard 2D chart library** - Market is commoditized

### ✅ Keeping Minimal (as foundation/demos):

1. **LineChart only** - Validates WebGPU infrastructure works (1M points @ 60fps), not a product
2. **Physics/orbital primitives** - Could be useful for HUD data (altitude, velocity, etc.)
3. **Math utilities** - Foundation for coordinate transforms in sensor fusion

**Note:** Generic heatmap removed - domain-specific `SensorFusion.ThermalOverlay` (Phase 3) is the real product for defense/aerospace thermal imaging needs.

---

**The Goal:** The definitive component library for aerospace HUD interfaces and real-time sensor fusion visualization. Primitive-first, WebGPU-powered, composable React components for defense, aerospace, and autonomous systems.

**Positioning:** "Radix UI for Aerospace Visualization"

**Revenue Target:** $10M+ ARR by 2027 through enterprise licenses to defense contractors and aerospace companies.
