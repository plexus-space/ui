# Component Template

This is the standardized template for creating new Plexus UI components. All components follow this architecture to ensure consistency, composability, and maintainability.

## Quick Checklist

When creating a new component, update these locations:

- [ ] **Component file** - `packages/components/my-component.tsx`
- [ ] **CLI Registry** - `packages/cli/src/registry/index.ts`
- [ ] **Test in playground** - `cd playground && npx @plexusui/cli add my-component`
- [ ] **Build and publish** - `npm run build:cli && npm run publish`

---

## Component Template

```tsx
"use client";

import * as React from "react";
import { cn } from "./lib"; // Import utilities as needed
// Import primitives if needed
// import { Sphere } from "./primitives/sphere";

// ============================================================================
// Types
// ============================================================================

export interface MyComponentRootProps {
  /** Description of the prop */
  someProp?: string;
  /** Numeric configuration */
  value?: number;
  /** Enable/disable feature */
  enabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface MyComponentSubProps {
  /** Sub-component specific prop */
  color?: string;
  size?: number;
}

// Add more prop interfaces for each sub-component

// ============================================================================
// Context
// ============================================================================

interface MyComponentContext {
  // Shared state and configuration accessible to all sub-components
  value: number;
  enabled: boolean;
  someProp?: string;
}

const MyComponentContext = React.createContext<MyComponentContext | null>(null);

function useMyComponent() {
  const ctx = React.useContext(MyComponentContext);
  if (!ctx) throw new Error("useMyComponent must be used within MyComponent.Root");
  return ctx;
}

// ============================================================================
// Utilities (Component-specific, not generic enough for lib)
// ============================================================================

function calculateSomething(value: number): number {
  // Component-specific logic that doesn't belong in lib
  return value * 2;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Root component - provides context for all child components
 *
 * This is the top-level component that wraps everything and provides
 * shared state via React Context.
 *
 * @example
 * ```tsx
 * <MyComponent someProp="value" enabled>
 *   <MyComponent.Sub />
 * </MyComponent>
 * ```
 */
const MyComponentRoot = React.forwardRef<HTMLDivElement, MyComponentRootProps>(
  (
    {
      someProp,
      value = 1,
      enabled = true,
      className,
      children,
    },
    ref
  ) => {
    // Memoize context value to prevent unnecessary re-renders
    const contextValue: MyComponentContext = React.useMemo(
      () => ({
        value,
        enabled,
        someProp,
      }),
      [value, enabled, someProp]
    );

    return (
      <MyComponentContext.Provider value={contextValue}>
        <div ref={ref} className={cn("my-component-root", className)}>
          {children}
        </div>
      </MyComponentContext.Provider>
    );
  }
);

MyComponentRoot.displayName = "MyComponent.Root";

/**
 * Sub-component - a composable piece of the component
 *
 * Consumes context from Root and renders part of the visualization.
 */
const MyComponentSub = React.forwardRef<HTMLDivElement, MyComponentSubProps>(
  (
    {
      color = "#64748b",
      size = 1,
    },
    ref
  ) => {
    const { value, enabled } = useMyComponent();

    if (!enabled) return null;

    return (
      <div ref={ref} style={{ color }}>
        {/* Render logic */}
      </div>
    );
  }
);

MyComponentSub.displayName = "MyComponent.Sub";

// Add more sub-components as needed...

// ============================================================================
// Exports
// ============================================================================

/**
 * MyComponent - Brief description of what this component does
 *
 * Longer description explaining the purpose, use cases, and any important
 * details about the component's behavior.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <MyComponent someProp="value">
 *   <MyComponent.Sub />
 * </MyComponent>
 * ```
 *
 * @example
 * Advanced usage:
 * ```tsx
 * <MyComponent someProp="custom" value={42}>
 *   <MyComponent.Sub color="#ff0000" size={2} />
 * </MyComponent>
 * ```
 */
export const MyComponent = Object.assign(MyComponentRoot, {
  Root: MyComponentRoot,
  Sub: MyComponentSub,
  // Add all sub-components here
});

// Export utility functions if useful to consumers
export { calculateSomething };
```

---

## Core Patterns

### 1. **Composable API with Object.assign**

All components use dot-notation via `Object.assign`:

```tsx
export const MyComponent = Object.assign(MyComponentRoot, {
  Root: MyComponentRoot,
  Sub: MyComponentSub,
  AnotherSub: MyComponentAnotherSub,
});
```

**Usage styles:**
```tsx
// Direct usage (Root is the default)
<MyComponent>
  <MyComponent.Sub />
</MyComponent>

// Explicit Root
<MyComponent.Root>
  <MyComponent.Sub />
</MyComponent.Root>
```

### 2. **Context Pattern**

Every component has:
- Context interface (`MyComponentContext`)
- Context created with `React.createContext`
- Custom hook that validates usage (`useMyComponent`)
- Memoized context value

```tsx
const contextValue = React.useMemo(
  () => ({ value, enabled }),
  [value, enabled]
);
```

### 3. **forwardRef for All Sub-Components**

```tsx
const MyComponentSub = React.forwardRef<HTMLDivElement, MyComponentSubProps>(
  (props, ref) => { /* ... */ }
);
```

### 4. **Display Names**

```tsx
MyComponentRoot.displayName = "MyComponent.Root";
MyComponentSub.displayName = "MyComponent.Sub";
```

### 5. **File Organization**

```tsx
// ============================================================================
// Types
// ============================================================================
// All interfaces and types

// ============================================================================
// Context
// ============================================================================
// Context definition and hook

// ============================================================================
// Utilities (Component-specific)
// ============================================================================
// Local helper functions

// ============================================================================
// Sub-Components
// ============================================================================
// All composable parts

// ============================================================================
// Exports
// ============================================================================
// Main export with Object.assign
```

### 6. **Props Conventions**

- Root props: Configuration + `children` + `className`
- Sub-component props: Specific to that part
- Extend HTML attributes when wrapping HTML elements:
  ```tsx
  export interface MyProps extends React.HTMLAttributes<HTMLDivElement> {
    customProp?: string;
  }
  ```
- Always destructure with defaults:
  ```tsx
  const MyComponent = ({ enabled = true, size = 1, ...props }) => { ... }
  ```

### 7. **TypeScript**

- All props strongly typed
- No `any` types (use `unknown` if needed)
- Context types are explicit
- Export types for consumers

---

## Registry Entry

Add to `packages/cli/src/registry/index.ts`:

```typescript
"my-component": {
  name: "my-component",
  type: "components:ui",  // or "components:chart", "components:primitive"
  description: "Brief one-line description",
  files: [
    `${BASE_URL}/my-component.tsx`,
    // Add support files if needed (e.g., shaders, utilities)
  ],
  dependencies: [
    "react",
    // Add npm packages the component needs
  ],
  registryDependencies: [
    "lib",
    // Add other components from registry this depends on
  ],
  category: "visualization", // "charts", "3d", "primitives", "controls", etc.
}
```

**Registry types:**
- `components:ui` - High-level components
- `components:chart` - Chart components
- `components:primitive` - Low-level primitives
- `components:lib` - Utility libraries

**Common categories:**
- `3d` - Three.js visualizations
- `charts` - 2D data visualization
- `primitives` - Building blocks
- `controls` - Interactive controls
- `visualization` - General visualizations
- `lib` - Utilities

---

## Component Variations

### 3D Components (Three.js/R3F)

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

const My3DComponent = React.forwardRef((props, ref) => {
  return (
    <div ref={ref}>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <Suspense fallback={null}>
          <ambientLight />
          {/* 3D content */}
        </Suspense>
      </Canvas>
    </div>
  );
});
```

**Registry dependencies:** `["react", "@react-three/fiber", "@react-three/drei", "three"]`

### 2D Chart Components (SVG)

```tsx
const MyChart = React.forwardRef(({ width = 800, height = 400 }, ref) => {
  return (
    <svg ref={ref} width={width} height={height}>
      {/* SVG elements */}
    </svg>
  );
});
```

**Registry dependencies:** `["react"]`

### Canvas-based Components

```tsx
const MyCanvasComponent = React.forwardRef((props, ref) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // Drawing logic
  }, []);

  return <canvas ref={canvasRef} />;
});
```

### Primitive Components (No Context)

Primitives can be simpler - no Context pattern needed:

```tsx
export interface MyPrimitiveProps {
  value: number;
  color?: string;
}

export const MyPrimitive = React.forwardRef<HTMLDivElement, MyPrimitiveProps>(
  ({ value, color = "#000" }, ref) => {
    return (
      <div ref={ref} style={{ color }}>
        {value}
      </div>
    );
  }
);

MyPrimitive.displayName = "MyPrimitive";

// No Object.assign needed for primitives
export { MyPrimitive };
```

---

## Examples from Codebase

**Study these for reference:**

- **3D Component with Context:** `packages/components/earth.tsx`
- **2D Chart Component:** `packages/components/line-chart.tsx`
- **Simple Primitive:** `packages/components/primitives/sphere.tsx`
- **Complex Multi-part:** `packages/components/gantt-chart.tsx`

---

## Testing Workflow

1. **Create component** in `packages/components/`
2. **Add registry entry** in `packages/cli/src/registry/index.ts`
3. **Test locally:**
   ```bash
   cd playground
   npx @plexusui/cli add my-component
   # Create a demo page in playground/app/
   npm run dev
   ```
4. **Verify:**
   - TypeScript compiles without errors
   - Component renders correctly
   - All sub-components work
   - Context hook throws error when used outside Root
   - Props are properly typed
5. **Build and publish:**
   ```bash
   npm run build:cli
   npm run publish
   ```

---

## Common Sub-Component Names

Use consistent naming across components:

- **Root** - Context provider
- **Container** - Layout wrapper
- **Viewport** - Rendering surface (SVG/Canvas/Three.js Canvas)
- **Controls** - Interactive controls (OrbitControls, etc.)
- **Grid** - Background grid
- **Axes** - Chart axes
- **Legend** - Data legend
- **Tooltip** - Interactive tooltip
- **Lines/Points/Bars** - Data visualizations
- **Interaction** - Mouse/touch event layer
- **Loading** - Loading state
- **Empty** - Empty state

---

## Documentation

Each component should have:

```tsx
/**
 * ComponentName - One-line description
 *
 * Longer explanation of what it does, when to use it, and key features.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <MyComponent value={10}>
 *   <MyComponent.Sub />
 * </MyComponent>
 * ```
 *
 * @example
 * Advanced:
 * ```tsx
 * <MyComponent value={42} enabled>
 *   <MyComponent.Sub color="#f00" />
 * </MyComponent>
 * ```
 */
```

---

## Final Checklist

Before submitting:

- [ ] Component follows template structure
- [ ] All sub-components use `forwardRef`
- [ ] All sub-components have `displayName`
- [ ] Context is typed and memoized (if used)
- [ ] Custom hook validates context usage (if used)
- [ ] Props have JSDoc comments
- [ ] Component exported with `Object.assign`
- [ ] Registry entry added with correct dependencies
- [ ] Works in playground
- [ ] No TypeScript errors
- [ ] Code formatted
