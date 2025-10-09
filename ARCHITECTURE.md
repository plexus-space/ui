# Plexus UI Architecture

## Overview

Plexus UI follows a **shadcn-like architecture** where components are copied to the user's project rather than installed as npm packages. This provides maximum flexibility and customization.

The project is a **monorepo** with three main sections:

1. **packages/components/** - Source components that get copied by the CLI
2. **packages/cli/** - Published npm package that manages component installation
3. **playground/** - Next.js demo application showcasing all components

## Directory Structure

```
ui-aerospace/
├── packages/
│   ├── components/           # Source components (copied by CLI)
│   │   ├── lib/             # Shared utilities (auto-installed with components)
│   │   │   ├── index.ts              # Barrel export
│   │   │   ├── plexusui-utils.ts     # Consolidated utilities file
│   │   │   ├── astronomical-constants.ts
│   │   │   ├── chart-utils.ts
│   │   │   ├── three-utils.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── primitives/      # Low-level building blocks
│   │   │   ├── index.ts              # Barrel export for all primitives
│   │   │   ├── sphere.tsx            # Sphere, Atmosphere, Clouds, Ring
│   │   │   ├── animation.ts          # Spring physics, easing functions
│   │   │   ├── animation-presets.ts  # Ready-to-use animation presets
│   │   │   ├── physics.ts            # Physics integrators, force functions
│   │   │   ├── wasm-physics.ts       # WebAssembly-accelerated physics
│   │   │   ├── gpu-renderer.tsx      # WebGPU rendering
│   │   │   ├── gpu-compute.tsx       # GPU compute pipelines
│   │   │   ├── gpu-line-renderer.tsx # GPU-accelerated line rendering
│   │   │   ├── gpu-large-dataset.tsx # GPU rendering for large datasets
│   │   │   └── visual-effects.tsx    # Bloom, glow, atmospheric effects
│   │   │
│   │   ├── earth.tsx        # Layer 3: High-level planetary components
│   │   ├── mars.tsx
│   │   ├── mercury.tsx
│   │   ├── venus.tsx
│   │   ├── moon.tsx
│   │   ├── jupiter.tsx
│   │   ├── saturn.tsx
│   │   ├── uranus.tsx
│   │   ├── neptune.tsx
│   │   ├── orbital-path.tsx
│   │   │
│   │   ├── line-chart.tsx   # Chart components
│   │   ├── polar-plot.tsx
│   │   ├── heatmap.tsx
│   │   ├── gantt-chart.tsx
│   │   │
│   │   ├── canvas-renderer.tsx    # Chart support files
│   │   ├── chart-legend.tsx
│   │   ├── chart-tooltip.tsx
│   │   ├── chart-export.ts
│   │   ├── decimation.ts
│   │   ├── colormaps.ts
│   │   │
│   │   └── package.json     # Metadata only
│   │
│   └── cli/                 # CLI tool (published to npm)
│       ├── src/
│       │   ├── index.ts     # CLI entry point with commander
│       │   ├── commands/
│       │   │   ├── init.ts          # Initialize project
│       │   │   ├── add.ts           # Add components (with dependency resolution)
│       │   │   ├── list.ts          # List available components
│       │   │   └── diff.ts          # Check for updates
│       │   └── registry/
│       │       ├── schema.ts        # Registry type definitions
│       │       └── index.ts         # Component registry with all metadata
│       ├── dist/            # Built output
│       └── package.json     # Published as @plexusui/cli
│
├── playground/              # Next.js 15 demo app (not published)
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── ...
│   ├── components/         # UI components for demo app
│   │   ├── plexusui/      # Installed Plexus UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── sidenav.tsx
│   │   ├── top-nav.tsx
│   │   └── ...
│   ├── public/            # Static assets (textures, images)
│   ├── components.json    # Plexus UI configuration
│   └── package.json
│
├── ARCHITECTURE.md        # This file
├── README.md
├── package.json          # Root package (workspace config)
└── tsconfig.json
```

## Architecture Layers

### Layer 1: Shared Utilities (`lib/`)

**Purpose**: Framework-agnostic utility functions, constants, and helpers
**Location**: `packages/components/lib/`
**Key file**: `plexusui-utils.ts` (consolidated utilities)

The lib layer consolidates all utilities into a single file for easier copying:

```typescript
// plexusui-utils.ts contains:
// 1. General utilities (cn, clamp, lerp, mapRange, degToRad)
// 2. Chart utilities (getDomain, createScale, getTicks, formatValue)
// 3. Astronomical constants (EARTH_RADIUS_KM, MARS_MASS_KG, etc.)
// 4. Three.js utilities (STANDARD_GL_CONFIG, createPlanetMaterial)
```

**Files**:
- `plexusui-utils.ts` - Main utilities file (auto-copied with components)
- `index.ts` - Barrel export: `export * from "./plexusui-utils"`
- Additional specialized files (astronomical-constants.ts, chart-utils.ts, etc.)

**Dependencies**: React, Three.js (minimal)
**Used by**: All components and primitives
**Registry behavior**: Auto-installed as a dependency when any component is added

### Layer 2: Primitives (`primitives/`)

**Purpose**: Low-level, reusable React/Three.js building blocks
**Location**: `packages/components/primitives/`
**Dependencies**: React, Three.js, @react-three/fiber
**Registry dependencies**: None (standalone) or other primitives only

**Primitives are composable, reusable building blocks:**

#### 3D Primitives
- **sphere.tsx** - `Sphere`, `Atmosphere`, `Clouds`, `Ring` components
  - Base for all planetary visualizations
  - Composable architecture (Atmosphere + Clouds nest inside Sphere)

#### Animation & Physics
- **animation.ts** - Spring physics (`updateSpring`, `SPRING_PRESETS`), easing functions
- **animation-presets.ts** - Pre-configured animations (orbit, camera, particle, UI)
- **physics.ts** - Physics engine (Euler, Verlet, RK4 integrators), force functions
- **wasm-physics.ts** - WebAssembly acceleration for N-body and collision detection

#### GPU Rendering
- **gpu-renderer.tsx** - WebGPU rendering (`GPURenderer`, `useGPURenderer`)
- **gpu-compute.tsx** - GPU compute pipelines (FFT, convolution)
- **gpu-line-renderer.tsx** - GPU-accelerated line and scatter rendering
- **gpu-large-dataset.tsx** - Optimized rendering for millions of particles
- **visual-effects.tsx** - Post-processing effects (bloom, glow, atmospheric scattering)

**Key principle**: Primitives are standalone and don't depend on lib (except via imports in user code).

### Layer 3: High-Level Components

**Purpose**: Complete, ready-to-use components built from primitives + lib
**Location**: `packages/components/*.tsx` (root level)
**Dependencies**: React, Three.js, R3F, `lib/`, `primitives/`
**Used by**: End users

#### Component Pattern - Composable API

All components follow a **dot-notation composable pattern** using `Object.assign`:

```tsx
// earth.tsx structure
const EarthRoot = forwardRef<HTMLDivElement, EarthRootProps>(...) => {
  // Context provider
  return <EarthContext.Provider>{children}</EarthContext.Provider>
}

const EarthCanvas = forwardRef<HTMLDivElement, EarthCanvasProps>(...) => {
  // Three.js Canvas wrapper
}

const EarthGlobe = forwardRef<any, EarthGlobeProps>(...) => {
  const ctx = useEarth();
  return <Sphere {...ctx} />; // Uses primitive
}

const EarthAtmosphere = forwardRef<any, EarthAtmosphereProps>(...) => {
  return <Atmosphere {...props} />;
}

// Export as composable object
export const Earth = Object.assign(EarthRoot, {
  Root: EarthRoot,
  Canvas: EarthCanvas,
  Controls: EarthControls,
  Globe: EarthGlobe,
  Atmosphere: EarthAtmosphere,
  Clouds: EarthClouds,
  Axis: EarthAxis,
});
```

**Usage**:
```tsx
<Earth timeScale={1} brightness={1.2}>
  <Earth.Canvas cameraPosition={[0, 5, 20]}>
    <Earth.Controls />
    <Earth.Globe>
      <Earth.Atmosphere />
      <Earth.Clouds />
    </Earth.Globe>
  </Earth.Canvas>
</Earth>
```

#### 3D Planetary Components
- **earth.tsx** - Earth with rotation, atmosphere, clouds
- **mars.tsx, mercury.tsx, venus.tsx, moon.tsx** - Inner planets
- **jupiter.tsx, saturn.tsx, uranus.tsx, neptune.tsx** - Outer planets
- **orbital-path.tsx** - Keplerian orbital visualization

**Common dependencies**: `["sphere", "lib"]`

#### Chart Components
- **line-chart.tsx** - Multi-series line chart with zoom and real-time support
- **polar-plot.tsx** - Polar/radar plots for radiation patterns
- **heatmap.tsx** - 2D heatmap with scientific colormaps
- **gantt-chart.tsx** - Timeline charts for mission planning

**Chart support files** (shared by multiple charts):
- `canvas-renderer.tsx` - Canvas-based rendering
- `chart-legend.tsx` - Chart legend component
- `chart-tooltip.tsx` - Interactive tooltips
- `chart-export.ts` - Export to PNG/SVG/CSV
- `decimation.ts` - Data decimation for performance
- `colormaps.ts` - Scientific colormaps (viridis, plasma, etc.)

**Common dependencies**: `["lib"]` (no 3D dependencies)

## CLI Architecture

### Published Package: @plexusui/cli

**Entry point**: `packages/cli/src/index.ts`
**Binary**: `plexusui` (via package.json bin field)
**Framework**: Commander.js for CLI
**Version**: Published to npm (currently v0.0.14)

### Commands

1. **init** - Initialize project
   - Creates `components.json` config file
   - Detects project structure (Next.js app/pages router, React)
   - Sets up component installation path

2. **add [components...]** - Add components with automatic dependency resolution
   - Downloads from GitHub (raw.githubusercontent.com)
   - Resolves registry dependencies recursively
   - Organizes files into correct directories (lib/, primitives/, root)
   - Shows npm install commands for peer dependencies
   - Skips lib if already installed

3. **list [--category]** - List available components
   - Categories: 3d, charts, orbital, primitives, lib
   - Shows component descriptions and categories

4. **diff <component>** - Check if component has updates
   - Compares local version with remote

### Component Registry

**Location**: `packages/cli/src/registry/index.ts`

The registry is the **single source of truth** for all components:

```typescript
export const registry: Registry = {
  lib: {
    name: "lib",
    type: "components:lib",
    description: "Shared utility functions, constants, helpers, and theme system",
    files: [
      `${BASE_URL}/lib/plexusui-utils.ts`,
      `${BASE_URL}/lib/index.ts`,
    ],
    dependencies: ["react", "three"],
    category: "lib",
  },

  sphere: {
    name: "sphere",
    type: "components:primitive",
    description: "Base sphere primitive with texture support",
    files: [`${BASE_URL}/primitives/sphere.tsx`],
    dependencies: ["react", "@react-three/fiber", "three"],
    registryDependencies: [], // Primitives are standalone
    category: "primitives",
  },

  earth: {
    name: "earth",
    type: "components:ui",
    description: "Earth with rotation, atmosphere, and clouds",
    files: [`${BASE_URL}/earth.tsx`],
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    registryDependencies: ["sphere", "lib"], // Auto-installs dependencies
    category: "3d",
  },

  "line-chart": {
    name: "line-chart",
    type: "components:chart",
    files: [
      `${BASE_URL}/line-chart.tsx`,
      `${BASE_URL}/canvas-renderer.tsx`,
      `${BASE_URL}/chart-legend.tsx`,
      `${BASE_URL}/chart-tooltip.tsx`,
      `${BASE_URL}/chart-export.ts`,
      `${BASE_URL}/decimation.ts`,
    ],
    dependencies: ["react"],
    registryDependencies: ["lib"],
    category: "charts",
  },
};
```

### Dependency Resolution

The CLI automatically resolves dependencies using a **recursive algorithm**:

```typescript
// User runs:
npx @plexusui/cli add earth

// CLI resolves and installs:
1. lib/ (registry dependency from earth)
   - lib/plexusui-utils.ts
   - lib/index.ts

2. primitives/sphere.tsx (registry dependency from earth)

3. earth.tsx (requested component)

// Shows npm install command:
npm install react @react-three/fiber @react-three/drei three
```

**Dependency rules**:
- **Layer 1 (lib)**: No registry dependencies
- **Layer 2 (primitives)**: No registry dependencies or other primitives only
- **Layer 3 (components)**: May depend on lib + primitives + other components

### File Organization

The CLI organizes downloaded files based on URL patterns:

```typescript
if (fileUrl.includes("/lib/")) {
  destPath = path.join(componentsDir, "lib", filename);
} else if (fileUrl.includes("/primitives/")) {
  destPath = path.join(componentsDir, "primitives", filename);
} else {
  destPath = path.join(componentsDir, filename);
}
```

Result:
```
components/plexusui/
├── lib/
│   ├── plexusui-utils.ts
│   └── index.ts
├── primitives/
│   ├── sphere.tsx
│   ├── animation.ts
│   └── ...
├── earth.tsx
├── mars.tsx
└── ...
```

## Playground (Demo Application)

**Framework**: Next.js 15 with App Router
**Features**: Turbopack, Server Components, Tailwind CSS v4
**Purpose**: Showcase all Plexus UI components

### Key Features

1. **Component Installation**
   - Uses CLI to install components to `playground/components/plexusui/`
   - Configured via `components.json`

2. **Demo Pages**
   - Each component has a dedicated demo page
   - Interactive controls for component props
   - Code examples with copy-to-clipboard

3. **Shared UI**
   - Navigation (TopNav, Sidenav)
   - Theme toggle (dark/light mode)
   - Component preview containers
   - Code playgrounds

4. **Dependencies**
   - Next.js 15.5.4
   - React 19.1.0
   - Tailwind CSS v4
   - @react-three/fiber + @react-three/drei
   - Radix UI primitives
   - Framer Motion

### Directory Structure

```
playground/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Home page
│   ├── providers.tsx   # Theme provider
│   └── ...             # Demo pages
├── components/
│   ├── plexusui/      # Installed Plexus components (via CLI)
│   ├── ui/            # shadcn/ui components
│   ├── sidenav.tsx    # Navigation
│   ├── top-nav.tsx
│   └── ...
└── public/            # Textures, images
```

## Monorepo Configuration

**Package manager**: npm workspaces
**Root package.json**:

```json
{
  "workspaces": [
    "packages/*",
    "playground"
  ],
  "scripts": {
    "dev": "npm run dev -w @plexusui/playground",
    "build:cli": "npm run build -w @plexusui/cli",
    "publish": "npm run build:cli && npm publish -w @plexusui/cli --access public"
  }
}
```

**Workspace structure**:
- `packages/cli` - `@plexusui/cli` (published to npm)
- `packages/components` - Source components (NOT published, copied by CLI)
- `playground` - `@plexusui/playground` (private, demo only)

## Component Development Workflow

### Adding a New Component

1. **Create component file** in `packages/components/`
   ```bash
   # For a new planet
   packages/components/pluto.tsx
   ```

2. **Import dependencies from lib and primitives**
   ```tsx
   import { Sphere, Atmosphere } from "./primitives/sphere";
   import { PLUTO_RADIUS_KM, kmToSceneUnits } from "./lib";
   ```

3. **Register in CLI** (`packages/cli/src/registry/index.ts`)
   ```typescript
   pluto: {
     name: "pluto",
     type: "components:ui",
     description: "Pluto with New Horizons textures",
     files: [`${BASE_URL}/pluto.tsx`],
     dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
     registryDependencies: ["sphere", "lib"],
     category: "3d",
   }
   ```

4. **Add to playground** for testing
   ```bash
   cd playground
   npx @plexusui/cli add pluto
   ```

5. **Build and publish CLI**
   ```bash
   npm run build:cli
   npm run publish
   ```

### Adding Utilities to lib

If you need a new shared utility:

1. Add to `packages/components/lib/plexusui-utils.ts`
2. Export from `packages/components/lib/index.ts`
3. The lib is automatically updated when users run `add` command

## Benefits of This Architecture

### 1. Copy Instead of Install
- Users own the code completely
- No version lock-in
- Full customization freedom
- Easy debugging (code is local)

### 2. Automatic Dependency Resolution
- CLI handles all component dependencies
- Users don't need to track what depends on what
- Consistent file organization

### 3. DRY Principles
- Shared utilities in lib/ (single source of truth)
- Primitives are reusable building blocks
- No duplicate code across components

### 4. Monorepo Organization
- Single repo for all components, CLI, and playground
- Easy to maintain and update
- Consistent versioning

### 5. Bundle Optimization
- Only copy what you use
- Tree-shakeable utilities
- No unused code

### 6. Scientific Accuracy
- Centralized astronomical constants
- Peer-reviewed algorithms
- Real astrodynamics math

## TypeScript Support

All components are fully typed:

```typescript
export interface EarthRootProps {
  dayMapUrl?: string;
  radius?: number;
  timeScale?: number;
  brightness?: number;
  children?: React.ReactNode;
}

export const Earth: React.ForwardRefExoticComponent<EarthRootProps> & {
  Root: typeof EarthRoot;
  Canvas: typeof EarthCanvas;
  Globe: typeof EarthGlobe;
  Atmosphere: typeof EarthAtmosphere;
  Clouds: typeof EarthClouds;
  Controls: typeof EarthControls;
  Axis: typeof EarthAxis;
};
```

## Publishing Workflow

Only the CLI is published to npm:

```bash
# Build CLI
npm run build:cli

# Publish to npm
npm run publish

# Or manually
cd packages/cli
npm run build
npm publish --access public
```

Components are **never published to npm** - they are downloaded directly from GitHub by the CLI.

## Key Differences from Initial Documentation

1. **Consolidated lib** - All utilities in `plexusui-utils.ts` instead of separate files
2. **Composable API** - Components use dot-notation (`Earth.Globe`) via `Object.assign`
3. **Context pattern** - Each component has a context provider for shared state
4. **Chart support files** - Shared files like `canvas-renderer.tsx` used by multiple charts
5. **Monorepo structure** - Clear separation of CLI, components, and playground
6. **Next.js 15 playground** - Uses App Router, React 19, Tailwind v4
7. **File organization in CLI** - Automatically organizes lib/, primitives/, and components
8. **Registry as source of truth** - All component metadata in one place
