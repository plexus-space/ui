# Plexus UI Architecture

## Overview

Plexus UI follows a **shadcn-like architecture** where components are copied to the user's project rather than installed as npm packages. This provides maximum flexibility and customization.

The architecture is organized into **three distinct layers**:

1. **lib/** - Pure utility functions and constants (framework-agnostic when possible)
2. **primitives/** - Low-level, reusable building blocks (React/Three.js components)
3. **components/** - High-level, composed UI components (built from primitives + lib)

## Directory Structure

```
packages/
├── components/           # Source components (copied by CLI)
│   ├── lib/             # Layer 1: Shared utilities (DRY principle)
│   │   ├── index.ts              # Barrel export
│   │   ├── utils.ts              # General utilities (cn, lerp, clamp, degToRad)
│   │   ├── chart-utils.ts        # Chart utilities (scales, domains, formatting)
│   │   ├── astronomical-constants.ts  # Scientific constants & calculations
│   │   └── three-utils.ts        # Three.js/R3F configurations & helpers
│   │
│   ├── primitives/      # Layer 2: Reusable building blocks
│   │   ├── index.ts              # Barrel export for all primitives
│   │   ├── sphere.tsx            # Sphere, Atmosphere, Clouds, Ring
│   │   ├── animation.ts          # Spring physics, easing, tweens
│   │   ├── physics.ts            # Integrators (Euler, Verlet, RK4), forces
│   │   ├── gpu-renderer.tsx      # WebGPU rendering
│   │   ├── gpu-compute.tsx       # GPU compute pipelines
│   │   ├── gpu-line-renderer.tsx # GPU-accelerated line rendering
│   │   └── visual-effects.tsx    # Bloom, glow, atmospheric effects
│   │
│   └── [components]     # Layer 3: High-level components
│       ├── earth.tsx            # Uses: lib + sphere primitive
│       ├── mars.tsx             # Uses: lib + sphere primitive
│       ├── line-chart.tsx       # Uses: lib (chart-utils)
│       └── solar-system.tsx     # Uses: lib + multiple planet components
│
└── cli/                 # CLI tool (published to npm)
    ├── src/
    │   ├── commands/
    │   │   ├── init.ts
    │   │   ├── add.ts           # Auto-resolves dependencies
    │   │   ├── list.ts          # List by category
    │   │   └── diff.ts          # Check for updates
    │   └── registry/    # Component registry
    │       ├── schema.ts
    │       └── index.ts         # Defines all components + dependencies
    └── package.json
```

## Three-Layer Architecture

Plexus UI strictly separates concerns into three layers:

### Layer 1: **lib/** (Foundation)

**Purpose**: Pure utility functions, constants, and helpers
**Dependencies**: Minimal (React only for hooks)
**Used by**: Primitives and Components
**Exports**: Functions, constants, types

```typescript
// ✅ Belongs in lib/
- Mathematical utilities (lerp, clamp, mapRange)
- Unit conversions (degToRad, kmToSceneUnits)
- Scientific constants (EARTH_RADIUS_KM, GRAVITATIONAL_CONSTANT)
- Chart helpers (getDomain, createScale, formatValue)
- Three.js configs (STANDARD_GL_CONFIG, createPlanetMaterial)
```

### Layer 2: **primitives/** (Building Blocks)

**Purpose**: Low-level, reusable React/Three.js components
**Dependencies**: React, Three.js, R3F (no lib dependency)
**Used by**: Components
**Exports**: React components, TypeScript utilities

```typescript
// ✅ Belongs in primitives/
- Sphere, Atmosphere, Clouds, Ring (3D primitives)
- Spring physics, easing functions (animation.ts)
- Physics integrators, force functions (physics.ts)
- GPU rendering utilities (gpu-renderer.tsx)
- Visual effects (bloom, glow)
```

**Key principle**: Primitives are standalone and framework-specific. They should NOT import from `lib/`.

### Layer 3: **components/** (Composed UI)

**Purpose**: High-level, domain-specific components
**Dependencies**: React, Three.js, R3F, **lib/**, **primitives/**
**Used by**: End users
**Exports**: React components with context APIs

```typescript
// ✅ Belongs in components/
- Earth, Mars, Jupiter (uses lib + sphere primitive)
- LineChart (uses lib/chart-utils)
- SolarSystem (composes multiple planet components)
```

**Key principle**: Components import from both `lib/` and `primitives/` to compose rich UIs.

---

## Component Architecture Details

### 1. **Shared Utilities (`lib/`)**

All components depend on shared utilities to keep code DRY:

#### `utils.ts` - General Utilities

- `cn()` - Class name utility
- `clamp()`, `lerp()`, `mapRange()` - Math helpers
- `degToRad()`, `radToDeg()` - Unit conversions

#### `chart-utils.ts` - Chart Utilities

- `getDomain()` - Calculate data domains
- `createScale()` - Create linear/log scales
- `getTicks()` - Generate axis ticks
- `formatValue()`, `formatTime()` - Formatting
- `generateSmoothPath()` - Spline generation
- `linearRegression()` - Statistical functions
- `useResizeObserver()` - React hook

#### `astronomical-constants.ts` - Scientific Constants

- Planetary data (radius, mass, rotation period, etc.)
- Orbital parameters (semi-major axis, eccentricity)
- Universal constants (G, c, AU)
- Utility functions (`kmToSceneUnits()`, `calculateRotationSpeed()`)

#### `three-utils.ts` - Three.js Utilities

- Standard configurations (camera, controls, lighting)
- Material creators (`createPlanetMaterial()`)
- Geometry helpers (`createSphereGeometry()`)
- Shader utilities (`createAtmosphereShader()`)

### 2. **Primitives (`primitives/`)**

Low-level reusable building blocks:

- **`sphere.tsx`** - Base sphere with textures (used by all planets)
- **`animation.ts`** - Spring physics, easing functions
- **`physics.ts`** - Orbital mechanics, force calculations
- **`gpu-renderer.tsx`** - WebGPU acceleration

### 3. **Components**

High-level components built from primitives:

#### 3D Planetary Components

- **Dependencies**: `lib`, `sphere` primitive, Three.js stack
- **Pattern**: Context provider + composable sub-components
- **Example**: Earth, Mars, Jupiter

#### Chart Components

- **Dependencies**: `lib`, chart utilities
- **Pattern**: React context + SVG/Canvas rendering
- **Example**: LineChart, Heatmap

## Dependency Resolution

The CLI automatically resolves dependencies following the 3-layer architecture:

```typescript
// User runs:
npx @plexusui/cli add earth

// CLI automatically installs:
1. lib/ (Layer 1 - foundation utilities)
   - utils.ts, chart-utils.ts, astronomical-constants.ts, three-utils.ts
2. primitives/sphere.tsx (Layer 2 - building block)
   - Sphere, Atmosphere, Clouds, Ring components
3. earth.tsx (Layer 3 - final component)

// And shows required npm packages:
npm install react @react-three/fiber @react-three/drei three
```

### Registry Dependency Graph

The dependency graph strictly follows the layered architecture:

```
Layer 3 (Components)
    ↓
earth.tsx
├── lib/ (Layer 1)
│   ├── utils.ts (degToRad, cn, lerp, clamp)
│   ├── astronomical-constants.ts (EARTH_RADIUS_KM, calculateRotationSpeed)
│   └── three-utils.ts (STANDARD_GL_CONFIG)
└── sphere (Layer 2)
    └── primitives/sphere.tsx (standalone, no lib dependency)

line-chart.tsx
└── lib/ (Layer 1)
    ├── utils.ts (cn)
    └── chart-utils.ts (getDomain, createScale, formatValue, getTicks)

solar-system.tsx
├── lib/ (Layer 1)
├── earth, mars, jupiter, saturn, ... (Layer 3, which bring their own deps)
└── (transitively gets all planet primitives)
```

**Dependency Rules:**

- **Layer 1 (lib)**: No registry dependencies (foundation)
- **Layer 2 (primitives)**: No registry dependencies (standalone building blocks)
- **Layer 3 (components)**: May depend on lib + primitives + other components

## Component Pattern

All components follow this structure, respecting the 3-layer architecture:

```tsx
// ============================================================================
// Layer 3 Component Example: earth.tsx
// ============================================================================

// 1. Framework imports
import * as React from "react";
import { Canvas } from "@react-three/fiber";

// 2. Import from Layer 1 (lib)
import {
  EARTH_RADIUS_KM,
  EARTH_ROTATION_PERIOD_SECONDS,
  EARTH_AXIAL_TILT_DEG,
  kmToSceneUnits,
  calculateRotationSpeed,
  degToRad,
} from "./lib/plexus";

// 3. Import from Layer 2 (primitives)
import { Sphere, Atmosphere, Clouds } from "./primitives/sphere";

// 4. Types
export interface EarthProps {
  dayMapUrl?: string;
  enableRotation?: boolean;
  timeScale?: number;
}

// 5. Context (for complex components)
const EarthContext = React.createContext<EarthContext | null>(null);

// 6. Root component
export const Earth = React.forwardRef<HTMLDivElement, EarthProps>(
  (props, ref) => {
    // ✅ Uses lib utilities (Layer 1)
    const radius = kmToSceneUnits(EARTH_RADIUS_KM);
    const rotationSpeed = calculateRotationSpeed(
      EARTH_ROTATION_PERIOD_SECONDS,
      props.timeScale
    );
    const axialTilt = [0, 0, degToRad(EARTH_AXIAL_TILT_DEG)];

    return (
      <EarthContext.Provider value={contextValue}>
        <div ref={ref}>{props.children}</div>
      </EarthContext.Provider>
    );
  }
);

// 7. Sub-components
export const EarthGlobe = () => {
  const ctx = useContext(EarthContext);
  // ✅ Uses primitive (Layer 2)
  return (
    <Sphere
      radius={ctx.radius}
      rotationSpeed={ctx.rotationSpeed}
      rotation={ctx.axialTilt}
    >
      <Atmosphere color="#4488ff" />
    </Sphere>
  );
};
```

## DRY Principles Applied

### Before (Duplicated Code)

```tsx
// earth.tsx
function formatValue(value: number): string {
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  // ...
}

// mars.tsx
function formatValue(value: number): string {
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  // ... DUPLICATED!
}
```

### After (Shared Utility)

```tsx
// lib/chart-utils.ts
export function formatValue(value: number): string {
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  // ...
}

// earth.tsx
import { formatValue } from "./lib";

// mars.tsx
import { formatValue } from "./lib";
```

## Adding New Components

When adding a new component:

1. **Identify shared functionality** - Can it use existing utilities?
2. **Update `lib/` if needed** - Add new shared functions
3. **Create component** - In `packages/components/`
4. **Register in CLI** - Add to `packages/cli/src/registry/index.ts`
5. **Specify dependencies**:
   - `dependencies`: npm packages
   - `registryDependencies`: other plexus components (auto-installed)

Example registry entry:

```typescript
"new-planet": {
  name: "new-planet",
  type: "components:ui",
  description: "Description here",
  files: [`${BASE_URL}/new-planet.tsx`],
  dependencies: ["react", "@react-three/fiber", "three"],
  registryDependencies: ["sphere", "lib"],  // Auto-resolves
  category: "3d",
}
```

## CLI Commands

```bash
# List all components
npx @plexusui/cli list
npx @plexusui/cli list --category charts

# Add components (auto-resolves dependencies)
npx @plexusui/cli add earth mars

# Check for updates
npx @plexusui/cli diff earth

# Initialize project
npx @plexusui/cli init
```

## Benefits

### 1. **DRY Code**

- Utilities shared across all components
- No duplicate functions
- Single source of truth for constants

### 2. **Automatic Dependency Resolution**

- CLI handles component dependencies
- Users get exactly what they need
- No manual tracking required

### 3. **Maintainability**

- Update utilities in one place
- All components benefit
- Easier to add features

### 4. **Bundle Optimization**

- Only copy what you use
- Tree-shakeable utilities
- No unused code

### 5. **Scientific Accuracy**

- Centralized astronomical constants
- Peer-reviewed values
- Easy to update/verify

## TypeScript Support

All utilities are fully typed:

```typescript
const point: Point = { x: 10, y: 20 };
const radius: number = EARTH_RADIUS_KM; // Type-safe!
```
