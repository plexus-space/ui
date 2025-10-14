# Plexus UI

> **"Radix UI for Aerospace Visualization"** - Primitive-first, WebGPU-powered React components for HUD interfaces and real-time sensor fusion. Built for defense, aerospace, and autonomous systems.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**What makes us unique:**

- 🎯 **HUD & Tactical Interfaces** - The only web-based component library for heads-up displays, targeting systems, and radar scopes
- 🔬 **Sensor Fusion Visualization** - Real-time multi-sensor overlay (LiDAR + thermal + radar + RGB) with WebGPU acceleration
- ⚡ **WebGPU Primitives** - 4 core GPU-accelerated building blocks (1M+ points @ 60fps)
- 🎨 **Copy-Paste Philosophy** - You own the code, not install npm packages
- 🧩 **Shadcn-Style Composability** - Dot notation API (`HUD.PitchLadder`, `SensorFusion.ThermalOverlay`)

---

## 🎯 What We're Building

### Phase 1: HUD & Tactical Interfaces (Q1-Q2 2025)

**Market Gap:** ZERO web-based HUD component libraries exist. Only Unity/Unreal assets and proprietary military systems.

```tsx
<HUD.Root width={1920} height={1080}>
  <HUD.HeadingTape heading={245} range={45} showCardinals />
  <HUD.PitchLadder pitch={15} roll={-5} fov={60} />
  <HUD.Reticle target={[lat, lon, alt]} range={12500} lockState="tracking" />
  <HUD.CornerBrackets state="locked" animated />
  <HUD.CoordinateOverlay position={[lat, lon, alt]} format="dms" />
</HUD.Root>
```

**Use Cases:**

- Military training simulators
- Aerospace mission control dashboards
- Drone operator interfaces (UAV ground control stations)
- Defense contractor proposals/demos

### Phase 2: Sensor Fusion Visualization (Q3-Q4 2025)

**Market Gap:** Sensor fusion algorithms exist (MATLAB, Python), but ZERO visualization libraries.

```tsx
<SensorFusion.Root>
  <SensorFusion.Canvas width={1920} height={1080}>
    <SensorFusion.LidarLayer points={lidarPoints} colorBy="range" />
    <SensorFusion.ThermalOverlay
      thermal={thermalImage}
      palette="whiteHot"
      opacity={0.6}
    />
    <SensorFusion.RadarContacts contacts={radarTracks} showVelocity />
    <SensorFusion.ObjectDetection
      boxes={aiDetections}
      showLabels
      showConfidence
    />
    <SensorFusion.VideoLayer
      stream={rgbVideo}
      opacity={0.3}
      blendMode="overlay"
    />
  </SensorFusion.Canvas>
</SensorFusion.Root>
```

**Use Cases:**

- Autonomous vehicle perception dashboards
- Defense surveillance systems
- Drone multi-sensor payloads (thermal + LiDAR drones)
- Industrial inspection
- Search & rescue operations

---

## ✨ Current Features (Phase 0: Foundation)

### WebGPU Rendering Primitives

**TRUE GPU Compute Shaders - 10x Faster than WebGL**

- ⚡ **WebGPULineRenderer** - 1M+ points @ 60fps (telemetry, waveforms)
- ⚡ **WebGPUPointCloud** - 100k+ points @ 60fps (LiDAR, scatter plots, particles)
- ⚡ **WebGPUMeshRenderer** - 100k+ triangles @ 60fps (terrain, CAD models)
- ⚡ **WebGPUVectorField** - 100k+ vectors @ 60fps (CFD, flow visualization)

### Math & Physics Primitives

- 🧮 **Vector/Matrix Math** - vec3, vec4, 4x4 transforms
- 🌍 **Coordinate Systems** - ECI ↔ ECEF ↔ Geodetic ↔ UTM
- 🔬 **Physics Engine** - Euler, Verlet, RK4 integrators
- 🛰️ **Orbital Mechanics** - Kepler solvers, state vectors, elements (useful for HUD data)
- 📏 **Units System** - Type-safe dimensional analysis
- ✅ **Validation** - NaN/Infinity handling, bounds checking

### Demo Components (Show Performance)

- 📊 **LineChart** - WebGPU auto-switching @ 5k points, 1M points @ 60fps

---

## 🚀 Quick Start

```bash
# Initialize your project (one time)
npx @plexusui/cli init

# Add WebGPU primitives
npx @plexusui/cli add line-renderer point-cloud

# Add demo chart
npx @plexusui/cli add line-chart

# Coming soon: HUD components (Q1-Q2 2025)
npx @plexusui/cli add hud-heading-tape hud-pitch-ladder hud-reticle
```

Components are **copied** to your project (you own the code!):

```tsx
import { WebGPULineRenderer } from "@/components/plexusui/primitives/webgpu/line-renderer";
import { LineChart } from "@/components/plexusui/line-chart";

// 1M points @ 60fps with WebGPU
<LineChart.Root series={[{ name: "Telemetry", data: largeDataset }]} />;
```

---

## 💡 Why Copy Instead of Install?

Inspired by shadcn/ui:

- ✅ **Full control** - Modify components to fit your exact needs
- ✅ **No version lock-in** - Update on your own schedule
- ✅ **Bundle optimization** - Only ship what you use
- ✅ **Easier debugging** - Component code is right in your project
- ✅ **No black boxes** - See exactly how WebGPU rendering works

---

## 📦 Available Components

### WebGPU Primitives (Production Ready)

**Core building blocks - zero dependencies, composable:**

### Demo Charts

- `line-chart` - Multi-series with WebGPU acceleration (1M+ points @ 60fps)

### Coming Soon: HUD Components (Q1-Q2 2025)

- `hud-root` - Container with responsive scaling
- `hud-heading-tape` - Infinite scrolling compass
- `hud-pitch-ladder` - Artificial horizon with roll
- `hud-reticle` - Targeting crosshair with lock-on states
- `hud-corner-brackets` - F-16/F-35 style lock-on (animated)
- `hud-coordinate-overlay` - Lat/lon/alt display (DMS, decimal, MGRS)
- `hud-range-finder` - Distance with unit conversion
- `hud-radar-scope` - PPI display with rotating sweep

### Coming Soon: Sensor Fusion (Q3-Q4 2025)

- `sensor-fusion-root` - Coordinate system manager
- `sensor-fusion-canvas` - WebGPU multi-layer renderer
- `sensor-fusion-lidar-layer` - 3D point cloud
- `sensor-fusion-thermal-overlay` - False-color thermal with LUTs
- `sensor-fusion-radar-contacts` - Track-level fusion display
- `sensor-fusion-object-detection` - AI bounding boxes
- `sensor-fusion-video-layer` - RGB/IR video with GPU decode

---

## 🎯 Who Is This For?

**Target Users:**

- 🛡️ Defense contractors building web dashboards
- 🚀 Aerospace companies (mission control, flight dynamics)
- 🤖 Autonomous vehicle teams (perception debugging)
- 🛸 Drone operators (UAV ground control stations)
- 🎮 Training simulator developers

**Not For:**

- Generic business dashboards (use Recharts, Victory, etc.)
- Map/geospatial viz (use Cesium, deck.gl, Mapbox)
- Academic/educational math viz (use Desmos, Manim)

---

## 🏗️ Architecture Philosophy

### Primitive-First Design

Everything builds from **4 core WebGPU primitives**:

```
┌─────────────────────────────────────────────────┐
│  Domain Components (Aerospace-Specific)         │
│  HUD.PitchLadder, SensorFusion.ThermalOverlay  │
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

### Why This Matters

- **Visx** is primitive-first but D3/SVG (not GPU-accelerated)
- **Three.js/Babylon.js** aren't primitive-focused (full scene graphs)
- **We're the only "Radix UI for WebGPU visualization"**

---

## 🎨 Rendering Strategy

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

**Detection is automatic:**

```tsx
<LineChart.Root series={data}>
  {/* Auto-detects and falls back */}
</LineChart.Root>
```

---

## 📥 Installation

### Prerequisites

```bash
# Required for all components
npm install react react-dom

# Required for 3D components (future Earth/terrain demos)
npm install three @react-three/fiber @react-three/drei
```

### Add Components

```bash
# Initialize (one time setup)
npx @plexusui/cli init

# Add WebGPU primitives
npx @plexusui/cli add line-renderer point-cloud

# Add chart
npx @plexusui/cli add line-chart

```

---

## 🏗️ Repository Structure

```
packages/
├── components/             # Source components (copied by CLI)
│   ├── primitives/
│   │   ├── webgpu/        # WebGPU rendering primitives
│   │   ├── math/          # Vector/matrix/coordinate utils
│   │   └── physics/       # Physics engine, orbital mechanics
│   ├── line-chart.tsx     # Demo: WebGPU line chart (1M+ points @ 60fps)
│   └── colormaps.ts       # Scientific colormaps
│
├── cli/                    # CLI tool (published to npm)
│   └── src/registry/      # Component registry
│
└── playground/            # Demo application (Next.js 15)
```

---

## 🎨 Playground

See all components in action:

```bash
git clone https://github.com/plexus-space/ui.git
cd ui
npm install
npm run dev
```

Open http://localhost:3000

---

## 📊 Performance Targets

| Component          | Dataset Size       | Target              | Status     |
| ------------------ | ------------------ | ------------------- | ---------- |
| **LineChart**      | 1M points          | ✅ 60fps (WebGPU)   | Complete   |
| **PointCloud**     | 100k points        | ✅ 60fps (WebGPU)   | Complete   |
| **VectorField**    | 100k vectors       | ✅ 60fps (WebGPU)   | Complete   |
| **RadarScope**     | 100+ contacts      | 🎯 60fps (Canvas2D) | Q2 2025    |
| **SensorFusion**   | 4 layers real-time | 🎯 60fps (WebGPU)   | Q3-Q4 2025 |
| **ThermalOverlay** | 1920x1080 @ 30Hz   | 🎯 30fps (WebGPU)   | Q3-Q4 2025 |

**Key Optimizations:**

- ✅ Compute shaders for decimation (10x faster than CPU)
- ✅ Spatial indexing on GPU (O(1) hover)
- ✅ Zero-copy buffer updates

---

## 📚 Documentation

- [Roadmap](./ROADMAP.md) - Full vision, market analysis, component details
- [Examples](./playground/examples/) - Usage examples for all components
- API Reference (coming soon)
- Video tutorials (coming soon)

---

## 🤝 Contributing

We welcome contributions! To add a new component:

1. Create component in `packages/components/`
2. Add to CLI registry in `packages/cli/src/registry/index.ts`
3. Add example to `playground/examples/`
4. Submit a PR

---

## 💰 Monetization

### Open Source (MIT License)

- WebGPU primitives
- Math/physics utilities
- Demo charts
- Basic HUD components

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

**Why premium pricing works:**

- Defense contractors have budget authority
- Aerospace companies pay for specialized tools
- No open-source alternatives exist for HUD/sensor fusion

---

## 📄 License

MIT © Plexus Aerospace

**Core primitives and foundation:** MIT License (open source)

**Advanced components:** Pro/Enterprise licenses (coming Q2 2025)

---

## 🎯 Positioning

**"Radix UI for Aerospace Visualization"**

We're **NOT** competing with:

- Cesium/deck.gl (geospatial - billion-dollar ecosystems)
- Recharts/Victory (generic charts - commoditized)
- STK/GMAT (orbital mechanics software - enterprise)

We **ARE** the only library for:

- HUD & tactical interfaces (web-based)
- Real-time sensor fusion visualization
- Primitive-first WebGPU aerospace components

**Revenue Target:** $10M+ ARR by 2027 through defense/aerospace enterprise licenses.

---

## 🚀 Roadmap Summary

- **Q1-Q2 2025:** HUD & Tactical Interfaces (10-12 components)
- **Q2-Q3 2025:** Tactical Displays (5 components)
- **Q3-Q4 2025:** Sensor Fusion Visualization (8 components)
- **2026 Q1:** Advanced Sensors (5 components)
- **2026 Q2+:** Polish, documentation, examples

See [ROADMAP.md](./ROADMAP.md) for detailed plans, market analysis, and component specifications.
