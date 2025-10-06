# Plexus UI Aerospace

> Primitive-based aerospace & physics component library with scientific accuracy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Plexus UI is a React component library for aerospace visualization, designed with the same philosophy as [shadcn/ui](https://ui.shadcn.com): **primitives-first**, **composable**, and **easy to use**.

## ✨ Features

- 🌍 **High-quality planetary visualizations** - Earth, Mars, Jupiter, Saturn, and more
- 🛸 **Scientific orbital mechanics** - Real astrodynamics math, not approximations
- 📊 **Charts & timelines** - Gantt charts, telemetry graphs, mission planning tools
- 🎯 **High-precision mode** - Optional Newton-Raphson solvers for exact calculations
- 🧩 **Primitives pattern** - Build complex scenes from simple building blocks
- ⚡ **Performance focused** - Optimized Three.js rendering with React Three Fiber

## 🚀 Quick Start

```bash
# Install a component
npm install @plexusui/earth

# Or use the CLI
npx @plexusui/cli add earth mars orbital-path
```

```tsx
import { Canvas } from '@react-three/fiber';
import { Earth } from '@plexusui/earth';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <Earth enableRotation />
      </Canvas>
    </div>
  );
}
```

## 📦 Component Categories

### 🌍 Planetary Bodies (3D)

High-quality planetary visualizations with real textures and rotation:

- `@plexusui/earth` - Earth with configurable rotation and textures
- `@plexusui/mars` - Mars with surface features
- `@plexusui/mercury`, `@plexusui/venus`, `@plexusui/moon`
- `@plexusui/jupiter`, `@plexusui/saturn`, `@plexusui/uranus`, `@plexusui/neptune`

### 🛸 Orbital Mechanics (3D)

Scientifically accurate orbital visualization using real astrodynamics equations:

- `@plexusui/orbital-path` - Elliptical orbits with Keplerian elements
- `@plexusui/ground-track` - Satellite ground paths on planetary surfaces
- `@plexusui/trajectory` - Flight paths with waypoints and burn markers
- `@plexusui/transfer-orbit` - Hohmann & bi-elliptic transfers
- `@plexusui/lagrange-points` - L1-L5 equilibrium points

**💡 All orbital components support optional high-precision mode!**

### 📊 Charts & Timelines (2D)

Data visualization for mission planning:

- `@plexusui/gantt` - Timeline charts for mission planning

### 🔧 Utilities

- `@plexusui/orbital-math` - High-precision orbital mechanics math library
- `@plexusui/cli` - Command-line tool for installing components

## 🎯 Scientific Accuracy

Plexus UI uses real orbital mechanics equations from aerospace textbooks:

### ✅ Exact Math (Always)
- Keplerian orbital elements (vis-viva equation)
- Hohmann & bi-elliptic transfers
- State vector conversions
- Kepler's laws

### ⚙️ High-Precision Mode (Optional)
```tsx
// Default: Fast approximation (~1% error)
<LaGrangePoints system={earthMoon} />

// High-precision: Newton-Raphson solver (< 1e-10 error)
<LaGrangePoints system={earthMoon} highPrecision />
```

**When to use high-precision:**
- Research and analysis
- Mission planning studies
- When you need exact positions

**When approximations are fine:**
- Interactive dashboards
- Educational visualizations
- Game development

### 📚 Algorithm Sources

All algorithms based on peer-reviewed aerospace textbooks:
- **Vallado, D.A.** - "Fundamentals of Astrodynamics and Applications" (4th ed.)
- **Curtis, H.D.** - "Orbital Mechanics for Engineering Students" (4th ed.)
- **Battin, R.H.** - "An Introduction to the Mathematics and Methods of Astrodynamics"

## 🧱 The Primitives Pattern

Every component follows a **three-tier architecture** for maximum flexibility:

```tsx
// 1. Root - Just the mesh/geometry (lowest level)
<OrbitalPathRoot elements={keplerianElements} />

// 2. Scene - Adds Canvas, lights, controls (mid level)
<OrbitalPathScene>
  <OrbitalPathRoot elements={orbit1} />
  <OrbitalPathRoot elements={orbit2} />
</OrbitalPathScene>

// 3. Composed - Fully configured (highest level - just use it!)
<OrbitalPath elements={keplerianElements} showApoapsis showPeriapsis />
```

**Use Root when:** Building custom scenes with full control
**Use Scene when:** You want pre-configured lighting but custom meshes
**Use Composed when:** You just want it to work (recommended)

## 💡 Examples

### Earth with ISS Orbit

```tsx
import { Canvas } from '@react-three/fiber';
import { EarthScene, EarthSphereRoot } from '@plexusui/earth';
import { OrbitalPathRoot } from '@plexusui/orbital-path';

function ISSVisualization() {
  const issOrbit = {
    semiMajorAxis: 6771,  // km
    eccentricity: 0.0001,
    inclination: 51.6,    // degrees
    longitudeOfAscendingNode: 0,
    argumentOfPeriapsis: 0,
  };

  return (
    <EarthScene>
      <EarthSphereRoot enableRotation />
      <OrbitalPathRoot elements={issOrbit} color="#00ff00" />
    </EarthScene>
  );
}
```

### Lagrange Points (High Precision)

```tsx
import { Canvas } from '@react-three/fiber';
import { LaGrangePoints, LaGrangePointsUtils } from '@plexusui/lagrange-points';

function JWSTLocation() {
  return (
    <Canvas>
      <LaGrangePoints
        system={LaGrangePointsUtils.SunEarthSystem()}
        showPoints={['L2']}  // JWST is at Sun-Earth L2
        highPrecision        // Exact position
        showLabels
      />
    </Canvas>
  );
}
```

### Hohmann Transfer with Math Utilities

```tsx
import { TransferOrbit } from '@plexusui/transfer-orbit';
import { OrbitalMath } from '@plexusui/orbital-math';

function LEOtoGEO() {
  // Calculate exact delta-V requirement
  const { dv1, dv2, total } = OrbitalMath.calculateHohmannDeltaV(
    6771,   // LEO
    42164   // GEO
  );

  console.log(`Total Δv: ${total} m/s`);  // 3909.4 m/s

  return (
    <Canvas>
      <TransferOrbit
        config={{
          initialRadius: 6771,
          finalRadius: 42164,
          type: 'hohmann'
        }}
        showBurns
      />
    </Canvas>
  );
}
```

## 🔬 Using @plexusui/orbital-math Directly

For custom calculations without UI components:

```typescript
import { OrbitalMath } from '@plexusui/orbital-math';

// Solve Kepler's equation
const E = OrbitalMath.solveKeplerEquation(1.5, 0.3);

// Exact Lagrange point positions
const l1 = OrbitalMath.solveL1Position(0.012);  // Earth-Moon

// Convert elements to position & velocity
const state = OrbitalMath.elementsToStateVector({
  a: 7000,
  e: 0.01,
  i: 0.9,
  Omega: 1.2,
  omega: 0.5,
  nu: 2.0
});

console.log(state.position);  // [x, y, z] km
console.log(state.velocity);  // [vx, vy, vz] km/s
```

## ⚡ Performance

| Operation | Time | Accuracy |
|-----------|------|----------|
| Kepler's Equation | ~0.01ms | < 1e-14 |
| L1 Position Solver | ~0.02ms | < 1e-10 |
| State Vector Conv | ~0.005ms | Exact |
| Hohmann Delta-V | ~0.003ms | Exact |

All solvers converge in 3-6 iterations.

## 📥 Installation

### Individual Components

```bash
npm install @plexusui/earth
npm install @plexusui/orbital-path
npm install @plexusui/orbital-math
```

### Using the CLI

```bash
# Install CLI globally
npm install -g @plexusui/cli

# Add components to your project
plexus add earth mars orbital-path lagrange-points

# Or use npx
npx @plexusui/cli add earth orbital-path
```

## 🔗 Peer Dependencies

All 3D components require:

```bash
npm install react react-dom three @react-three/fiber @react-three/drei
```

Chart components only need:

```bash
npm install react react-dom
```

## 🏗️ Monorepo Structure

```
packages/
├── earth/              # Earth component
├── mars/               # Mars component
├── orbital-path/       # Orbital path component
├── lagrange-points/    # Lagrange points component
├── orbital-math/       # Math utilities (no React deps)
├── cli/                # CLI tool
└── ...

showcase/               # Demo application
```

## 🗺️ Roadmap

See [COMPONENT_ROADMAP.md](COMPONENT_ROADMAP.md) for planned components.

**Completed:**
- ✅ All planetary bodies (Earth through Neptune)
- ✅ Core orbital mechanics (OrbitalPath, GroundTrack, Trajectory, TransferOrbit, LaGrangePoints)
- ✅ High-precision math library
- ✅ Gantt charts

**Next up:**
- 🔄 Coordinate frames & reference systems
- 🔄 Spacecraft models
- 🔄 Sensor FOV visualization
- 🔄 Telemetry graphs

## ⚠️ Limitations & Scope

### NOT Suitable For:
- ❌ Flight-certified spacecraft software
- ❌ Real-time spacecraft navigation
- ❌ Perturbation modeling (J2, atmospheric drag)
- ❌ N-body propagation

### Perfect For:
- ✅ Educational visualizations
- ✅ Mission concept studies
- ✅ Interactive dashboards
- ✅ Game development
- ✅ Research tools
- ✅ Preliminary mission planning

**For production spacecraft software, use:**
- [GMAT](https://software.nasa.gov/software/GSC-17177-1) (NASA)
- [STK](https://www.agi.com/products/stk) (AGI)
- [NAIF SPICE](https://naif.jpl.nasa.gov/naif/) (JPL)

## 🎨 Showcase

Visit the showcase to see all components in action and try the interactive demos:

```bash
git clone https://github.com/yourusername/ui-aerospace.git
cd ui-aerospace
npm install
npm run showcase:dev
```

Then open http://localhost:3000

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding New Components

Follow the [Component Setup Guide](COMPONENT_SETUP_GUIDE.md) to ensure consistency:

1. Create package in `packages/[component-name]/`
2. Implement Root → Scene → Composed pattern
3. Add to CLI and showcase
4. Write comprehensive README with examples

## 📄 License

MIT © Plexus UI Team

## 🙏 Credits

- Inspired by [shadcn/ui](https://ui.shadcn.com)
- Powered by [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- Math based on aerospace textbooks by Vallado, Curtis, and Battin
- Planetary textures from [NASA](https://nasa.gov) and [Solar System Scope](https://www.solarsystemscope.com/)
