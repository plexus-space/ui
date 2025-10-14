# Plexus UI Roadmap

> **Vision:** The foundation for all future human-computer interaction for physical systems. A primitive-first, WebGPU-powered component library for medical, aerospace, and autonomous systems. Built for real-time sensor fusion, HUD interfaces, and mission-critical visualization.

## Guiding Principles

1. **Primitive-First Architecture** - core WebGPU primitives, everything else composes
2. **Physical Systems Expertise** - Medical, aerospace, defense HUD, sensor fusion, mission control
3. **WebGPU-Accelerated Performance** - 100k+ points @ 60fps, real-time multi-sensor rendering
4. **Deep-Tech Copy-Paste Philosophy** - You get the core WebGPU primitives and control the data pipeline and rendering loop. Maximum control for performance-critical use cases.
5. **TypeScript/Rust Native** - Full type safety with zero-copy buffer updates for guaranteed performance
6. **Beautiful by Default** - Inspired by military/aerospace UI design language
7. **Enterprise Ready** - Built for sensitive data, offline deployment, and compliance requirements

---

## Phase 0: Foundation ✅ (Complete)

### ✅ WebGPU Rendering Primitives

**TRUE GPU Compute Shaders - 10x Faster than WebGL**

- [x] **WebGPULineRenderer** - 1M+ points @ 60fps (telemetry, waveforms, ground tracks)
- [x] **WebGPUPointCloud** - 100k+ points @ 60fps (LiDAR, scatter plots, particles)
- [x] **WebGPUMeshRenderer** - 100k+ triangles @ 60fps (terrain, CAD models)

### ✅ Demo Components (Show Performance)

- [x] **LineChart** - WebGPU auto-switching @ 5k points, 1M points @ 60fps (validates WebGPU infrastructure)

---

## Phase 1: WebGPU Text Rendering & Core HUD Primitives

**Architecture:** 100% WebGPU-first. No SVG/CSS fallbacks. Build the hardest primitives first to validate the vision.

### Critical WebGPU Primitives

**Priority 1: Text Rendering (The Foundation)** ✅

- [x] **MSDFTextRender** - High-performance text rendering primitive ✅
  - GPU-accelerated glyph rendering @ 60fps
  - Dynamic text updates without CPU bottleneck
  - Subpixel rendering for readability
  - SDF (Signed Distance Field) font atlas for crisp text at any scale

**Priority 2: 2D Shape Primitives**

- [ ] **WebGPU2DRenderer** - Core 2D drawing primitive
  - Lines (horizontal, vertical, angled) with anti-aliasing
  - Circles and arcs (for heading tapes, reticles)
  - Rectangles and rounded rectangles
  - Polygons (for pitch ladder, velocity vector)
  - Instanced rendering for thousands of shapes @ 60fps

**Priority 3: Transform & Animation System**

- [ ] **WebGPUTransform** - GPU-accelerated transforms
  - 2D/3D rotations, translations, scales
  - Matrix operations in compute shaders
  - Batch transform updates
- [ ] **WebGPUAnimation** - Smooth interpolation system
  - Easing functions in shaders
  - Property animation (position, rotation, opacity)
  - Timeline-based animations

### Initial HUD Components (Built on Primitives)

Once the primitives are proven, build these components:

```tsx
<HUD.Root width={1920} height={1080} renderer="webgpu">
  <HUD.Text content="TARGET LOCKED" x={960} y={100} size={16} />
  <HUD.Reticle x={960} y={540} size={40} animated />
  <HUD.HeadingTape heading={245} range={45} />
  <HUD.CoordinateOverlay position={[lat, lon, alt]} format="dms" />
</HUD.Root>
```

- [x] **HUD.Root** - WebGPU canvas manager with coordinate systems ✅
- [x] **HUD.Text** - Text component (uses WebGPUTextRenderer) ✅
  - Multiple text styles (normal, outline, glow)
  - Text alignment (left, center, right)
  - Per-label color and opacity
  - Real-time text updates at 60fps
  - Performance: 1000+ labels in single draw call
- [ ] **HUD.Reticle** - Targeting crosshair (uses WebGPU2DRenderer)
- [ ] **HUD.HeadingTape** - Compass tape (uses WebGPUTextRenderer + WebGPU2DRenderer)
- [ ] **HUD.CoordinateOverlay** - Lat/lon/alt display (uses WebGPUTextRenderer)

**Success Criteria:** ✅

- ✅ Render 1000+ text labels @ 60fps
- ✅ Smooth animations with no jank
- ✅ Text remains readable at all zoom levels (SDF rendering)
- ✅ Zero-copy buffer updates for text content changes
- ✅ Multiple text styles (normal, outline, glow)
- ✅ Text alignment support (left, center, right)

**Use Cases:**

- Military training simulators
- Aerospace mission control dashboards
- Medical device interfaces (surgical displays)
- Drone operator interfaces

**Deliverable:** ✅ WebGPU text rendering primitive + 2 HUD components built on top (HUD.Root, HUD.Text). Live demo in playground showing performance with 1000+ labels. **See:** `/playground/examples/hud-text.tsx`

**Implementation Details:**

- SDF Font Atlas: 512x512 texture with full ASCII character set
- Distance Transform: 8-point Sequential Euclidean Distance Transform
- Rendering: Instanced draw calls (all text in single GPU pass)
- Font: Courier New monospace (critical for tactical displays)
- Shader Effects: Normal, outline (black border), glow (emphasis)
- Layout Engine: Automatic text positioning with alignment support

---

## Phase 2: Advanced WebGPU Building Blocks for Tactical Displays

**Architecture:** WebGPU primitives only. No Canvas2D fallback. Build reusable blocks that power multiple tactical displays.

### Core Primitives (Not Discrete Displays)

**Priority 1: Particle System Primitive**

Tactical displays need efficient rendering of hundreds of dynamic objects (contacts, tracks, markers). Build a general-purpose particle system instead of discrete components.

- [ ] **WebGPUParticleSystem** - High-performance 2D particle primitive
  - Instance-based rendering for 10,000+ particles @ 60fps
  - Per-particle properties (position, velocity, color, size, rotation)
  - GPU-based particle updates (compute shaders)
  - Spatial culling for performance
  - Alpha blending and additive blending modes
  - LOD system (distant particles = smaller/simpler)

**Priority 2: Polar Coordinate Primitive**

Radar and sonar displays use polar coordinates. Build a primitive that handles polar-to-screen transformations efficiently.

- [ ] **WebGPUPolarRenderer** - Polar coordinate system primitive
  - Polar grid rendering (range rings, bearing lines)
  - Polar-to-cartesian transform in vertex shader
  - Arc and sector rendering
  - Rotating sweep effect (for radar)
  - Bearing labels with WebGPUTextRenderer

**Priority 3: Trail/Path History Primitive**

Tracking systems need to show object history. Build a general-purpose trail renderer.

- [ ] **WebGPUTrailRenderer** - Historical path visualization
  - Polyline rendering with fade-out over time
  - Time-based alpha decay
  - Efficient ring buffer for path points
  - Configurable trail length and decay rate

### Example Tactical Components (Built from Primitives)

Once primitives are proven, these components become trivial:

```tsx
<TacticalDisplay.Root width={1920} height={1080}>
  {/* Radar scope uses PolarRenderer + ParticleSystem */}
  <TacticalDisplay.RadarScope
    contacts={radarContacts}
    range={50000}
    sweepAngle={currentSweep}
  />

  {/* Sonar uses PolarRenderer + custom shader */}
  <TacticalDisplay.SonarWaterfall
    contacts={acousticContacts}
    bearingRange={180}
  />
</TacticalDisplay.Root>
```

**Rust/WASM Integration:**

For performance-critical operations that don't fit WebGPU's model:

- [ ] **Rust WASM module** for spatial indexing (quad-tree, R-tree)
- [ ] **Rust WASM module** for contact correlation algorithms
- Zero-copy data transfer between WASM and WebGPU

**Success Criteria:**

- Render 1000+ radar contacts @ 60fps
- Smooth sweep animation with no stutter
- Sub-1ms contact position updates
- Trail history for 100+ objects simultaneously

**Use Cases:**

- Military radar displays
- Sonar operator consoles
- Air traffic control systems
- Maritime navigation interfaces

**Deliverable:** 3 core WebGPU primitives (Particle, Polar, Trail) + 2 tactical display components built from primitives. Performance benchmarks demonstrating 1000+ contacts @ 60fps.

---

## Phase 3: Sensor Fusion for Autonomous Vehicles (Focus: Single Use Case)

**Architecture:** Build sensor fusion primitives alongside the components. Develop for one use case: autonomous vehicle perception dashboards. This reduces risk and provides a path to real-world testing.

### Strategy: Develop Primitives + Components Together

Instead of building all primitives first (risky), develop primitives alongside their first use case. This ensures primitives are practical and properly scoped.

### Primitive 1: Color Mapping & Thermal Rendering

**Build this primitive alongside ThermalOverlay component:**

- [ ] **WebGPUColorMapper** - GPU-accelerated color LUT primitive
  - Upload 1D color lookup tables (LUTs) to GPU
  - Shader-based color mapping (value → RGB)
  - Pre-built palettes: whiteHot, blackHot, ironbow, rainbow, turbo
  - Custom palette support
  - Per-pixel value remapping in fragment shader

**Component built alongside:**

- [ ] **SensorFusion.ThermalOverlay** - First real use of ColorMapper
  - False-color thermal imaging
  - Temperature range normalization
  - Opacity control for layering

### Primitive 2: Coordinate Transform System

**Build this primitive alongside LidarLayer component:**

- [ ] **WebGPUCoordinateTransform** - Real-time coordinate transforms
  - Sensor frame → world frame transforms
  - 4x4 transformation matrices in uniform buffers
  - Batch transform for 100k+ points
  - Time-synchronized transforms (handle sensor lag)
  - TypeScript/Rust types for coordinate frames

**Component built alongside:**

- [ ] **SensorFusion.LidarLayer** - 3D point cloud for autonomous vehicles
  - Uses existing WebGPUPointCloud primitive
  - Integrates WebGPUCoordinateTransform
  - Color by range, intensity, or height
  - Point size LOD based on distance

### Primitive 3: Multi-Layer Compositor

**Build this primitive alongside the entire sensor fusion stack:**

- [ ] **WebGPULayerCompositor** - Multi-layer blending
  - Multiple render targets
  - Blend modes (overlay, additive, multiply, screen)
  - Per-layer opacity
  - Z-ordering for layers
  - Efficient GPU-based compositing

### Focused Component Set (Autonomous Vehicle Dashboard)

```tsx
<SensorFusion.Root
  coordinateFrame="vehicle" // ego-vehicle coordinate frame
  timeSync={currentTimestamp}
>
  <SensorFusion.Canvas width={1920} height={1080}>
    {/* Base layer: LiDAR */}
    <SensorFusion.LidarLayer
      points={lidarPoints}
      transform={lidarToVehicle}
      colorBy="height"
    />

    {/* Overlay: Camera with AI detections */}
    <SensorFusion.CameraLayer
      image={frontCamera}
      transform={cameraToVehicle}
      opacity={0.4}
    />

    {/* Overlay: AI bounding boxes */}
    <SensorFusion.DetectionBoxes
      detections={aiDetections}
      showLabels
      showConfidence
    />

    {/* Overlay: Planned path */}
    <SensorFusion.PathOverlay
      plannedPath={trajectoryPoints}
      color="green"
      width={2}
    />
  </SensorFusion.Canvas>
</SensorFusion.Root>
```

**TypeScript/Rust Integration:**

Critical for zero-copy performance:

- [ ] **Rust/TypeScript types** for coordinate frames (with dimensional analysis)
- [ ] **Zero-copy buffer updates** for sensor data streams
- [ ] **Rust WASM module** for transform calculations (if CPU-bound)

**Success Criteria:**

- 100k LiDAR points + camera overlay @ 60fps
- <5ms latency for new sensor data to screen
- Accurate coordinate transforms across 4+ sensors
- Smooth playback of recorded sensor data

**Target Use Case: Autonomous Vehicle Perception Dashboard**

Why this focus?

- Clear, high-value market
- Testable with public datasets (KITTI, nuScenes, Waymo Open)
- Entry point for real-world adoption
- Validates entire primitive stack

**Deliverable:**

- 3 core primitives (ColorMapper, CoordinateTransform, LayerCompositor)
- 4 sensor fusion components purpose-built for AV perception
- Demo using public autonomous vehicle dataset (KITTI or nuScenes)
- Performance benchmarks on real sensor data

---

## Phase 4: GPU Compute Shaders - Spectrum Analyzer

**Realistic Timeline:** Pushed back to allow 1-year development cycle after Phase 3. Re-evaluate scope based on Phase 1-3 learnings.

**Focus:** Single compute shader showcase - Real-time Spectrum Analyzer. This demonstrates WebGPU's compute shader capability (a major selling point) without over-committing.

### Priority: Real-Time Spectrum Analyzer

**Why this component?**

- Showcases WebGPU compute shaders (true GPU compute)
- Applicable across multiple domains (RF, audio, vibration, medical)
- Clear performance advantage over CPU FFT
- Validates GPU compute pipeline for future work

### Primitive: GPU-Accelerated FFT

- [ ] **WebGPUFFT** - Fast Fourier Transform compute shader primitive
  - Radix-2 FFT algorithm in compute shader
  - 8192-point FFT in <1ms
  - Windowing functions (Hamming, Hann, Blackman)
  - Real-time streaming data support
  - Zero-copy buffer updates

### Component: Spectrum Analyzer

```tsx
<SignalProcessing.SpectrumAnalyzer
  rfData={signalBuffer} // Float32Array of time-domain samples
  fftSize={8192} // FFT size (power of 2)
  sampleRate={100e6} // 100 MHz sample rate
  window="blackman" // Windowing function
  colorMap="inferno" // Color palette
  dBRange={[-120, 0]} // Display range in dB
  realTime // Enable streaming mode
/>
```

**Component features:**

- [ ] **SignalProcessing.SpectrumAnalyzer**
  - Waterfall display (time vs frequency)
  - Power spectral density plot
  - Peak detection and annotation
  - Configurable averaging
  - GPU-accelerated color mapping

**Success Criteria:**

- 8192-point FFT @ 60fps (streaming)
- <1ms FFT compute time
- Waterfall display with 100+ history lines
- Works with live data streams (SDR, audio interface)

**Use Cases:**

- Software-defined radio (SDR) applications
- RF spectrum monitoring
- Audio analysis and music visualization
- Vibration analysis (predictive maintenance)
- Medical signal processing (ECG, EEG)

**Stretch Goals (if time permits):**

- [ ] **SensorFusion.NightVisionOverlay** - Green/white hot with gain
- [ ] **SensorFusion.RadiometricMap** - 3D thermal point cloud

**Deliverable:**

- 1 core primitive: WebGPUFFT compute shader
- 1 advanced component: Real-time Spectrum Analyzer
- Live demo with SDR hardware or audio input
- Performance benchmarks vs CPU FFT libraries (FFTW, KissFFT)

---

## Enterprise Readiness & Compliance

**Architecture Note:** Deep-tech companies have unique requirements beyond performance. These must be addressed from the start.

### Data Security & Privacy

**Challenge:** Medical, defense, and autonomous vehicle applications handle sensitive data (patient records, classified information, sensor data).

**Solutions:**

- [ ] **No telemetry, no analytics** - Zero data leaves the client browser
- [ ] **No CDN dependencies** - All assets can be self-hosted
- [ ] **No external API calls** - Framework operates entirely offline
- [ ] **Subresource integrity** - All CDN scripts include SRI hashes
- [ ] **Content Security Policy** - Example CSP headers for deployment
- [ ] **Data encryption at rest** - Documentation for encrypted local storage
- [ ] **Audit logging** - Optional hooks for user action logging

### Offline & Local Deployment

**Challenge:** Defense and medical systems often run on air-gapped networks or require offline operation.

**Solutions:**

- [ ] **Fully offline-capable** - Framework works without internet connection
- [ ] **Self-contained builds** - Single bundle with all dependencies
- [ ] **Local WebGPU runtime** - No cloud compute dependencies
- [ ] **Electron support** - Desktop application packaging guide
- [ ] **Docker deployment** - Container images for local hosting
- [ ] **Installation package** - Offline installer with all assets

### Compliance & Certification

**Challenge:** Medical and defense applications require regulatory compliance (FDA, HIPAA, MIL-STD, DO-178C).

**Solutions:**

- [ ] **HIPAA compliance documentation** - Guide for healthcare deployments
  - PHI data handling guidelines
  - Encryption requirements
  - Audit trail implementation
  - Access control patterns
- [ ] **MIL-STD-882E safety documentation** - Guide for defense applications
  - Hazard analysis templates
  - Risk assessment procedures
  - Verification and validation plans
- [ ] **DO-178C documentation** (future) - For aerospace certification
  - Software life cycle data
  - Requirements traceability
  - Test coverage reports
- [ ] **FDA 21 CFR Part 11** (future) - For medical device software
  - Electronic signature support
  - Audit trail requirements
  - System validation guides

### Performance Guarantees

**Challenge:** Mission-critical systems need predictable, provable performance.

**Solutions:**

- [ ] **Performance benchmarks** - Published benchmarks for all primitives
  - Minimum: Intel Iris Xe, Apple M1, NVIDIA GTX 1650
  - Target: 60fps with specified data volumes
  - Graceful degradation for older hardware
- [ ] **TypeScript/Rust dimensional analysis** - Compile-time unit checking
  - Prevents unit confusion errors (Mars Climate Orbiter)
  - Enforces coordinate frame correctness
  - Type-safe sensor fusion
- [ ] **Zero-copy buffer updates** - Documented performance guarantees
  - Maximum latency from data → screen
  - Memory usage bounds
  - GPU memory management

### Testing & Validation

**Challenge:** Safety-critical systems need extensive testing.

**Solutions:**

- [ ] **Automated test suite** - 90%+ code coverage
- [ ] **Visual regression tests** - Screenshot comparison for rendering
- [ ] **Performance regression tests** - Automated performance monitoring
- [ ] **Fuzzing infrastructure** - Test with malformed data
- [ ] **Example validation plans** - Templates for customer validation

### Deployment Support

**Challenge:** Enterprises need support for deployment and integration.

**Solutions:**

- [ ] **Integration guides** - Examples for common frameworks (React, Vue, Svelte)
- [ ] **Embedding guide** - How to embed in native applications
- [ ] **Scaling guide** - Multi-monitor, high-DPI, ultra-wide displays
- [ ] **Browser compatibility matrix** - Tested browsers and versions
- [ ] **GPU compatibility list** - Tested GPUs with performance data
- [ ] **Troubleshooting guide** - Common issues and solutions

**Deliverable Timeline:** Enterprise features developed alongside Phases 1-4, documented in dedicated enterprise deployment guide.
