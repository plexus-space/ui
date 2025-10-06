# Plexus UI Aerospace - Component Setup Guide

> **For AI Agents & Developers**: This guide explains how to add new components to the Plexus UI monorepo. Follow this pattern to ensure consistency across all packages.

## Architecture Overview

This is a **primitive-based component library** for aerospace and physics visualization. Components follow a three-tier architecture:

```
Root Primitive (lowest level - just the mesh/element)
    ↓
Scene Primitive (adds Canvas/styling/container)
    ↓
Composed Component (pre-configured, ready to use)
```

### Component Categories

There are **TWO distinct types** of components:

**1. Planetary Components** (3D using React Three Fiber):
- Planetary bodies (Earth, Mars, Mercury, Venus, Moon, Jupiter, Saturn, Uranus, Neptune)
- Uses Three.js, @react-three/fiber, @react-three/drei
- Renders in WebGL Canvas
- Examples: Earth, Mars, Jupiter

**2. Chart Components** (2D using HTML/CSS/SVG):
- Timeline charts, graphs, plots, and data visualizations
- Uses standard React with HTML/CSS/SVG (NO Three.js)
- Renders in regular DOM
- Examples: Gantt, TelemetryGraph, OrbitPlot

**3. Other Visual Components** (3D using React Three Fiber):
- Orbital paths, spacecraft, vectors, FOV cones, etc.
- Uses Three.js like planetary components
- Examples: OrbitalPath, VectorArrow, FieldOfView

---

## Creating a New Component Package

### Step 1: Package Structure

```bash
packages/
└── [component-name]/
    ├── package.json
    ├── tsconfig.json
    ├── README.md
    ├── [component-name].tsx     # Main file
    ├── dist/                     # Build output (generated)
    └── primitives/               # Optional: for complex components
        └── *.tsx
```

### Step 2: Package Configuration

**File: `packages/[component-name]/package.json`**

```json
{
  "name": "@plexusui/[component-name]",
  "version": "0.0.1",
  "description": "Primitive-based [description] component for aerospace applications",
  "main": "./dist/[component-name].js",
  "types": "./dist/[component-name].d.ts",
  "exports": {
    ".": {
      "import": "./dist/[component-name].js",
      "types": "./dist/[component-name].d.ts"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "[component-name]",
    "aerospace",
    "ui",
    "react",
    "primitives"
  ],
  "license": "MIT",
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.25",
    "@types/react-dom": "^18.3.7",
    "typescript": "^5.4.5"
  }
}
```

**For 3D Components, add:**
```json
"peerDependencies": {
  "@react-three/drei": ">=9.0.0",
  "@react-three/fiber": ">=8.0.0",
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0",
  "three": ">=0.160.0"
},
"devDependencies": {
  "@types/three": "^0.160.0"
}
```

---

**File: `packages/[component-name]/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["./**/*.ts", "./**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Step 3: Component Implementation Patterns

Choose the pattern based on your component type:

---

## Pattern A: 3D Planetary Components (React Three Fiber)

**Use this for:** Earth, Mars, Jupiter, and other planetary bodies

**Dependencies needed:**

```tsx
"use client";

import { Suspense, memo, useRef, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Constants - Real astronomical data
// ============================================================================

/**
 * [Planet]'s radius in scene units (kilometers)
 */
export const [PLANET]_RADIUS = 1234; // actual value

export const [PLANET]_ROTATION_PERIOD = 1.0; // in Earth days
export const [PLANET]_ORBITAL_PERIOD = 365; // in Earth days
export const [PLANET]_DIAMETER_KM = 2468;
export const [PLANET]_REAL_RADIUS_KM = 1234;

// ============================================================================
// Internal Mesh Component
// ============================================================================

interface [Planet]SphereInternalProps {
  radius: number;
  textureUrl?: string;
  enableRotation: boolean;
  brightness: number;
}

const [Planet]SphereInternal = memo(function [Planet]SphereInternal({
  radius,
  textureUrl,
  enableRotation,
  brightness,
}: [Planet]SphereInternalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;

  useFrame(() => {
    if (!enableRotation || !meshRef.current) return;
    meshRef.current.rotation.y += 0.001; // adjust based on rotation period
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 64, 32]} />
      {texture ? (
        <meshPhongMaterial map={texture} shininess={5} />
      ) : (
        <meshPhongMaterial color="#cccccc" />
      )}
    </mesh>
  );
});

// ============================================================================
// PRIMITIVES
// ============================================================================

export interface [Planet]SphereRootProps {
  radius?: number;
  textureUrl?: string;
  enableRotation?: boolean;
  brightness?: number;
}

/**
 * [Planet]SphereRoot - The base sphere primitive component
 *
 * Use this when you want full control over the scene (Canvas, lights, controls).
 */
export const [Planet]SphereRoot = forwardRef<THREE.Group, [Planet]SphereRootProps>(
  (
    {
      radius = [PLANET]_RADIUS,
      textureUrl,
      enableRotation = false,
      brightness = 1.2,
    },
    ref
  ) => {
    return (
      <group ref={ref}>
        <[Planet]SphereInternal
          radius={radius}
          textureUrl={textureUrl}
          enableRotation={enableRotation}
          brightness={brightness}
        />
      </group>
    );
  }
);

[Planet]SphereRoot.displayName = "[Planet]SphereRoot";

// ============================================================================

export interface [Planet]SceneProps {
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  minDistance?: number;
  maxDistance?: number;
  brightness?: number;
  children?: React.ReactNode;
}

/**
 * [Planet]Scene - The Three.js scene primitive
 *
 * Provides Canvas, lights, camera, and controls. Add your own content as children.
 */
export const [Planet]Scene = forwardRef<HTMLDivElement, [Planet]SceneProps>(
  (
    {
      cameraPosition = [0, 0, 15000],
      cameraFov = 45,
      minDistance = 7000,
      maxDistance = 50000,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="relative h-full w-full">
        <Canvas
          camera={{ position: cameraPosition, fov: cameraFov }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={[0, 0, 0]} />
          <Suspense fallback={null}>
            <ambientLight intensity={0.8 * brightness} />
            <directionalLight position={[5, 3, 5]} intensity={1.5 * brightness} />

            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={minDistance}
              maxDistance={maxDistance}
            />

            {children}
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

[Planet]Scene.displayName = "[Planet]Scene";

// ============================================================================
// COMPOSED COMPONENT
// ============================================================================

export interface [Planet]Props {
  textureUrl?: string;
  brightness?: number;
  enableRotation?: boolean;
  cameraPosition?: [number, number, number];
  children?: React.ReactNode;
}

/**
 * [Planet] - The main composed component
 *
 * Fully pre-configured and ready to use. Just drop it in!
 */
const [Planet]Component = forwardRef<HTMLDivElement, [Planet]Props>(
  (
    {
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      cameraPosition = [0, 0, 15000],
      children,
    },
    ref
  ) => {
    return (
      <[Planet]Scene
        ref={ref}
        cameraPosition={cameraPosition}
        brightness={brightness}
      >
        <[Planet]SphereRoot
          radius={[PLANET]_RADIUS}
          textureUrl={textureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
        />
        {children}
      </[Planet]Scene>
    );
  }
);

[Planet]Component.displayName = "[Planet]";

export const [Planet] = memo([Planet]Component);
```

---

## Pattern B: 2D Chart Components (HTML/CSS/SVG)

**Use this for:** Gantt charts, telemetry graphs, plots, timelines, etc.

**Dependencies needed:**
```json
"peerDependencies": {
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0"
}
```

**NO Three.js dependencies!** These are pure DOM components.

**Template:**

```tsx
"use client";

import { memo, forwardRef } from "react";

// ============================================================================
// Types
// ============================================================================

export interface [Chart]DataPoint {
  id: string;
  value: number;
  timestamp?: number;
  label?: string;
}

// ============================================================================
// PRIMITIVES
// ============================================================================

export interface [Chart]RootProps {
  data: [Chart]DataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

/**
 * [Chart]Root - The base rendering primitive
 *
 * Renders just the chart element without container styling.
 */
export const [Chart]Root = memo(
  forwardRef<HTMLDivElement, [Chart]RootProps>(
    ({ data, width = 600, height = 400, color = "bg-blue-500" }, ref) => {
      return (
        <div ref={ref} style={{ width, height }}>
          {/* Chart rendering logic */}
        </div>
      );
    }
  )
);

[Chart]Root.displayName = "[Chart]Root";

// ============================================================================

export interface [Chart]SceneProps {
  title?: string;
  controls?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * [Chart]Scene - Container with styling
 *
 * Wraps chart content with consistent dark theme styling.
 */
export const [Chart]Scene = forwardRef<HTMLDivElement, [Chart]SceneProps>(
  ({ title = "Chart", controls, children, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-black border border-gray-900 rounded-lg overflow-hidden ${className}`}
      >
        <div className="p-3 border-b border-gray-900 flex justify-between items-center">
          <h3 className="text-xs font-medium text-gray-200">{title}</h3>
          {controls}
        </div>
        <div className="p-3 relative">{children}</div>
      </div>
    );
  }
);

[Chart]Scene.displayName = "[Chart]Scene";

// ============================================================================
// COMPOSED COMPONENT
// ============================================================================

export interface [Chart]Props {
  data: [Chart]DataPoint[];
  title?: string;
  width?: number;
  height?: number;
  controls?: React.ReactNode;
}

/**
 * [Chart] - The main composed component
 */
const [Chart]Component = forwardRef<HTMLDivElement, [Chart]Props>(
  ({ data, title = "Chart", width, height, controls }, ref) => {
    return (
      <[Chart]Scene ref={ref} title={title} controls={controls}>
        <[Chart]Root data={data} width={width} height={height} />
      </[Chart]Scene>
    );
  }
);

[Chart]Component.displayName = "[Chart]";

export const [Chart] = memo([Chart]Component);

/**
 * [Chart]Utils - Utility functions for the chart
 */
export const [Chart]Utils = {
  // Add helper functions here
  formatValue: (value: number) => value.toFixed(2),
};
```

---

## Pattern C: 3D Visual Components (React Three Fiber)

**Use this for:** Orbital paths, spacecraft models, vectors, FOV cones, coordinate frames, etc.

**Dependencies:** Same as Pattern A (Three.js + R3F)

**Template:** Similar to Pattern A, but without planet-specific constants. Focus on:
- Geometric primitives (lines, cones, arrows, etc.)
- Dynamic positioning based on orbital mechanics
- Interactive elements (hover states, click handlers)
- Animation loops with `useFrame`

**Example structure:**
```tsx
"use client";

import { memo, useRef, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ============================================================================
// PRIMITIVES
// ============================================================================

export interface OrbitalPathRootProps {
  semiMajorAxis: number;
  eccentricity: number;
  segments?: number;
  color?: string;
}

export const OrbitalPathRoot = forwardRef<THREE.Group, OrbitalPathRootProps>(
  ({ semiMajorAxis, eccentricity, segments = 128, color = "#00ff00" }, ref) => {
    // Calculate orbital path vertices
    const points = useMemo(() => {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const r = (semiMajorAxis * (1 - eccentricity ** 2)) / (1 + eccentricity * Math.cos(theta));
        pts.push(new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta)));
      }
      return pts;
    }, [semiMajorAxis, eccentricity, segments]);

    return (
      <group ref={ref}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} />
        </line>
      </group>
    );
  }
);
```

---

### Step 4: Add to Root Package.json Scripts

**File: `package.json` (root)**

Add build and publish scripts:

```json
"scripts": {
  "build:[component-name]": "npm run build -w @plexusui/[component-name]",
  "publish:[component-name]": "npm run build:[component-name] && npm publish -w @plexusui/[component-name] --access public"
}
```

---

### Step 5: Add to CLI

**File: `packages/cli/src/commands/add.ts`**

Add to `AVAILABLE_COMPONENTS` array:

```ts
const AVAILABLE_COMPONENTS = [
  'earth',
  'mars',
  // ... existing
  '[component-name]', // ADD THIS
];
```

---

### Step 6: Add to Showcase

**File: `showcase/package.json`**

```json
"dependencies": {
  "@plexusui/[component-name]": "*"
}
```

**File: `showcase/app/page.tsx` and `showcase/app/[component]/page.tsx`**

Add to the `components` array:

```tsx
const components = [
  // ... existing
  {
    id: "[component-name]",
    name: "[ComponentName]",
    package: "@plexusui/[component-name]",
    textures: ["/texture.jpg"] // if applicable
  },
];
```

---

## Component Type Checklist

### For Planetary (3D) Components

**Required:**
- [ ] Export `[NAME]_RADIUS` constant (in km)
- [ ] Export `[NAME]_ROTATION_PERIOD` (in Earth days)
- [ ] Export `[NAME]_ORBITAL_PERIOD` (in Earth days)
- [ ] Export `[NAME]_DIAMETER_KM`
- [ ] Export `[NAME]_REAL_RADIUS_KM`
- [ ] Implement `[Name]SphereRoot` primitive (just the mesh)
- [ ] Implement `[Name]Scene` primitive (Canvas + lights + controls)
- [ ] Implement composed `[Name]` component (fully configured)
- [ ] Use `useLoader(THREE.TextureLoader, url)` for textures
- [ ] Use `useFrame` for rotation animation
- [ ] Add `forwardRef<THREE.Group>` for Root, `forwardRef<HTMLDivElement>` for Scene
- [ ] Memoize all components with `memo()`
- [ ] Add `"use client"` directive at top of file
- [ ] Add comprehensive JSDoc with examples
- [ ] Handle optional textures (show color fallback)

**Dependencies:**
```json
{
  "peerDependencies": {
    "@react-three/drei": ">=9.0.0",
    "@react-three/fiber": ">=8.0.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0",
    "three": ">=0.160.0"
  }
}
```

---

### For Chart (2D) Components

**Required:**
- [ ] Define data interfaces/types (e.g., `GanttTask`, `DataPoint`)
- [ ] Implement `[Name]Root` primitive (core rendering logic)
- [ ] Implement `[Name]Scene` container (dark theme wrapper)
- [ ] Implement composed `[Name]` component (fully configured)
- [ ] Use Tailwind dark theme classes (`bg-black`, `border-gray-900`, `text-gray-200`)
- [ ] Add `forwardRef<HTMLDivElement>` for all components
- [ ] Memoize all components with `memo()`
- [ ] Add `"use client"` directive at top of file
- [ ] Export utility functions as `[Name]Utils` object
- [ ] Add comprehensive JSDoc with examples
- [ ] Support custom formatters where applicable

**Dependencies:**
```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

**NO Three.js!** These are pure DOM components.

---

### For Other Visual (3D) Components

**Required:**
- [ ] Implement `[Name]Root` primitive (core Three.js mesh/geometry)
- [ ] Export relevant constants (e.g., default sizes, colors)
- [ ] Use `useFrame` if animation is needed
- [ ] Add `forwardRef<THREE.Group>` support
- [ ] Memoize components
- [ ] Add `"use client"` directive
- [ ] Handle dynamic properties (orbital elements, positions, etc.)
- [ ] Optimize geometry creation with `useMemo`

**Dependencies:** Same as planetary components (Three.js + R3F)

**Note:** These components typically DON'T need a `Scene` wrapper since they're meant to be used inside existing Canvas contexts.

---

## File Naming Conventions

- **Package folders**: lowercase with hyphens (`orbital-path`)
- **Main file**: matches package name (`orbital-path.tsx`)
- **Component names**: PascalCase (`OrbitalPath`, `OrbitalPathRoot`)
- **Constant exports**: SCREAMING_SNAKE_CASE (`ORBITAL_PERIOD`)
- **Interface names**: PascalCase with props suffix (`OrbitalPathProps`)

---

## Documentation Standards

Every component must have:

1. **File header comment** explaining what the component does
2. **JSDoc for all exports** with `@param`, `@returns`, `@example`
3. **Inline comments** for complex logic
4. **README.md** with installation and usage examples

---

## Testing After Creation

```bash
# Build the component
npm run build:[component-name]

# Build all packages
npm run build

# Run showcase to verify
npm run showcase:dev
```

---

## Publishing Workflow

```bash
# 1. Build the component
npm run build:[component-name]

# 2. Test in showcase
npm run showcase:dev

# 3. Publish to npm
npm run publish:[component-name]
```

---

## Quick Reference: Component Hierarchy

```
@plexusui/[component]
├── [Component]Root          → Lowest level (mesh/element only)
│   ↓ compose with...
├── [Component]Scene         → Mid level (+ Canvas/Container)
│   ↓ compose with...
└── [Component]              → High level (fully configured)
```

**When to use which:**

- **Root**: Building custom scenes, maximum control
- **Scene**: Pre-configured scene, add custom meshes
- **Composed**: Drop-in ready, minimal config

---

## Common Patterns

### Texture Loading (3D)
```tsx
const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
```

### Animation Loop (3D)
```tsx
useFrame(() => {
  if (!enableRotation || !meshRef.current) return;
  meshRef.current.rotation.y += 0.001;
});
```

### Dark Theme Styling (2D)
```tsx
className="bg-black border border-gray-900 text-gray-200"
```

### Forward Refs
```tsx
export const Component = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <div ref={ref}>...</div>;
});

Component.displayName = "Component";
```

---

## Example: Complete Workflow

```bash
# 1. Create package structure
mkdir -p packages/orbital-path

# 2. Create files
touch packages/orbital-path/package.json
touch packages/orbital-path/tsconfig.json
touch packages/orbital-path/orbital-path.tsx
touch packages/orbital-path/README.md

# 3. Implement component (follow templates above)

# 4. Add to root scripts
# Edit package.json (root)

# 5. Add to CLI
# Edit packages/cli/src/commands/add.ts

# 6. Add to showcase
# Edit showcase/package.json and showcase/app/page.tsx

# 7. Build
npm run build:orbital-path

# 8. Test
npm run showcase:dev

# 9. Publish
npm run publish:orbital-path
```

---

## Need Help?

- Review existing components: `packages/earth/` or `packages/gantt/`
- Check showcase examples: `showcase/app/[component]/page.tsx`
- See primitive patterns: `packages/gantt/primitives/`

---

**Last Updated**: October 2025
**Maintainer**: Plexus UI Team
