# Plexus UI

> Primitive-based aerospace & physics component library with scientific accuracy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Plexus UI is a React component library for aerospace visualization, designed with: **copy the code, not install packages**.

## ✨ Features

- 🌍 **High-quality planetary visualizations** - Earth, Mars, Jupiter, Saturn, and more
- 🛸 **Scientific orbital mechanics** - Real astrodynamics math, not approximations
- 📊 **Charts & timelines** - Gantt charts for mission planning
- 🧩 **Primitives pattern** - Build complex scenes from simple building blocks
- ⚡ **Performance focused** - Optimized Three.js rendering with React Three Fiber
- 🎨 **You own the code** - Like shadcn, components are copied to your project

## 🚀 Quick Start

```bash
# Initialize your project (one time)
npx @plexusui/cli init

# Add components (copies source code to your project)
npx @plexusui/cli add earth mars orbital-path solar-system
```

This copies the component files to `/components/plexusui/` - you own the code and can customize it however you want!

```tsx
import { SolarSystem } from "@/components/plexusui/solar-system";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <SolarSystem showOrbitalPaths animationSpeed={10} />
    </div>
  );
}
```

## 💡 Why Copy Instead of Install?

I dont want to maintain them and I also want you to be able to:

- ✅ **Full control** - Modify components to fit your exact needs
- ✅ **No version lock-in** - Update on your own schedule
- ✅ **Bundle optimization** - Only ship what you use
- ✅ **Easier debugging** - Component code is right in your project

## 📦 Available Components

### 🌍 Planetary Bodies (3D)

High-quality planetary visualizations with real textures and rotation:

- `earth` - Earth with configurable rotation and textures
- `mars` - Mars with surface features
- `mercury`, `venus`, `moon`
- `jupiter`, `saturn`, `uranus`, `neptune`

### 🛸 Orbital Mechanics (3D)

Scientifically accurate orbital visualization using real astrodynamics equations:

- `orbital-path` - Elliptical orbits with Keplerian elements

**💡 All orbital components support optional high-precision mode!**

### 🌌 Solar System (3D)

Complete solar system visualization with astronomically accurate distances:

- `solar-system` - All 8 planets at correct relative distances with animated orbits

### 📊 Charts & Timelines (2D)

Data visualization for mission planning:

- `gantt` - Timeline charts for mission planning

### 📚 Algorithm Sources

All algorithms based on peer-reviewed aerospace textbooks:

- **Vallado, D.A.** - "Fundamentals of Astrodynamics and Applications" (4th ed.)
- **Curtis, H.D.** - "Orbital Mechanics for Engineering Students" (4th ed.)
- **Battin, R.H.** - "An Introduction to the Mathematics and Methods of Astrodynamics"

## 💡 Examples

### Solar System Overview

```tsx
import { SolarSystem } from "@/components/plexusui/solar-system";

function SolarSystemVisualization() {
  return (
    <SolarSystem
      showOrbitalPaths
      animationSpeed={50}
      planetSizeScale={5}
      brightness={1.2}
      cameraPosition={[0, 1000, 2000]}
    />
  );
}
```

### Earth with ISS Orbit

```tsx
import { EarthScene, EarthSphereRoot } from "@/components/plexusui/earth";
import { OrbitalPathRoot } from "@/components/plexusui/orbital-path";

function ISSVisualization() {
  const issOrbit = {
    semiMajorAxis: 6771, // km
    eccentricity: 0.0001,
    inclination: 51.6, // degrees
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

## 📥 Installation

### Prerequisites

Install peer dependencies first:

```bash
# For 3D components
npm install react react-dom three @react-three/fiber @react-three/drei

# For 2D components (charts)
npm install react react-dom
```

### Add Components

```bash
# Initialize (one time setup)
npx @plexusui/cli init

# Add components
npx @plexusui/cli add earth mars orbital-path

```

Components are copied to `components/ui/` and you can immediately start using them:

```tsx
import { Earth } from "@/components/ui/earth";
import { OrbitalPath } from "@/components/ui/orbital-path";
```

## 🏗️ Repository Structure

```
components/             # All component source files (copied by CLI)
├── earth.tsx
├── mars.tsx
├── jupiter.tsx
├── saturn.tsx
├── orbital-path.tsx
└── ...

packages/
└── cli/                # CLI tool (only package published to npm)

playground/               # Demo application
```

## 🎨 playground

See all components in action at the interactive playground:

```bash
git clone https://github.com/plexus-space/ui.git
cd ui
npm install
npm run dev
```

Then open http://localhost:3000

## 🤝 Contributing

We welcome contributions! To add a new component:

1. Create component in `packages/[component-name]/`
2. Add to CLI registry in `packages/cli/src/commands/add.ts`
3. Add to playground
4. Submit a PR

## 📄 License

MIT © Plexus Aerospace
