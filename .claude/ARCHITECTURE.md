# Plexus UI Architecture

## Philosophy

Plexus UI is a **primitive-first, WebGPU-powered component library** for mission-critical, real-time physical system visualization. We follow these core principles:

### 1. Primitive-First Design

Components are built in layers:
- **Layer 1: GPU Primitives** - Low-level WebGPU rendering primitives
- **Layer 2: Chart Components** - High-level composable components built on primitives
- **Layer 3: User Applications** - Custom compositions using our components

### 2. Copy, Don't Install

Following shadcn's model:
- Components are **copied into user projects**, not installed as dependencies
- Users own the code and can customize freely
- Distribution via CLI tool, not npm registry
- Zero lock-in, maximum flexibility

### 3. Performance First

- WebGPU acceleration for datasets >5k points
- Graceful fallback to Canvas2D/SVG
- Target: 1M+ points @ 60fps
- Zero-copy buffer updates where possible

---

## Component API Pattern

All Plexus UI components follow a **dual API pattern**: simple by default, composable when needed.

### Pattern: Simple + Composable API

Every component must provide:

1. **Default Export** - All-in-one component (simple API)
2. **Primitive Exports** - Composable building blocks (advanced API)

### Example Structure

```typescript
// ============================================================================
// Simple API - Default export for 95% of use cases
// ============================================================================
export const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(
  (props, ref) => {
    return (
      <ComponentNameRoot {...props} ref={ref}>
        <ComponentNameContainer>
          <ComponentNameViewport>
            <ComponentNameContent />
          </ComponentNameViewport>
        </ComponentNameContainer>
      </ComponentNameRoot>
    );
  }
) as typeof ComponentNameRoot & {
  Root: typeof ComponentNameRoot;
  Container: typeof ComponentNameContainer;
  Viewport: typeof ComponentNameViewport;
  Content: typeof ComponentNameContent;
};

// ============================================================================
// Composable API - Attach primitives for advanced use cases
// ============================================================================
ComponentName.Root = ComponentNameRoot;
ComponentName.Container = ComponentNameContainer;
ComponentName.Viewport = ComponentNameViewport;
ComponentName.Content = ComponentNameContent;
```

### Usage Examples

**Simple (Recommended):**
```tsx
<GanttChart tasks={tasks} timezone="UTC" />
```

**Composable (Advanced):**
```tsx
<GanttChart.Root tasks={tasks} timezone="UTC">
  <CustomHeader />
  <GanttChart.Container>
    <GanttChart.Viewport>
      <GanttChart.Grid />
      <GanttChart.Tasks />
    </GanttChart.Viewport>
  </GanttChart.Container>
</GanttChart.Root>
```

---

## Directory Structure

```
packages/components/
├── lib/                           # Shared foundation
│   ├── types.ts                   # Shared TypeScript types
│   ├── utils.ts                   # Shared utility functions
│   └── index.ts                   # Public API exports
├── primitives/                    # Low-level GPU primitives
│   ├── webgpu/
│   │   ├── device.ts             # WebGPU device manager
│   │   ├── buffer-manager.ts     # GPU buffer management
│   │   ├── line-renderer.tsx     # Line rendering primitive
│   │   ├── point-cloud.tsx       # Point cloud primitive
│   │   ├── msdf-text-renderer.tsx
│   │   ├── shape-2d-renderer.tsx
│   │   ├── unified-waveform-renderer.tsx
│   │   └── shaders/              # WGSL shader files
│   ├── validation.ts             # Input validation
│   └── index.ts                  # Primitive exports
├── charts/                        # High-level chart components
│   ├── waveform-monitor.tsx
│   ├── gantt-chart.tsx
│   └── line-chart.tsx
└── registry.json                  # Single source of truth for component registry
```

### Naming Conventions

- **Primitives:** `WebGPU*` prefix (e.g., `WebGPULineRenderer`)
- **Components:** Descriptive names (e.g., `WaveformMonitor`, `GanttChart`)
- **Utilities:** Verb-based (e.g., `cn`, `clamp`, `formatDate`)
- **Types:** Descriptive (e.g., `RGB`, `RGBA`, `Domain2D`, `Margin`)

---

## Shared Types

All components use shared type definitions from `lib/types.ts`:

```typescript
// Colors
export type RGB = readonly [number, number, number];
export type RGBA = readonly [number, number, number, number];

// Domains
export type Domain1D = readonly [number, number];
export type Domain2D = readonly [min: number, max: number];

// Layout
export type Margin = {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
};

// Common props
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
}
```

### Why Shared Types?

- **Consistency** - Components compose naturally
- **Interoperability** - Easy to pass data between components
- **Documentation** - Single source of truth for API contracts

---

## Shared Utilities

All components import utilities from `lib/utils.ts`:

```typescript
import { cn, clamp, formatDate } from "@plexusui/components/lib/utils";
```

### Required Utilities

- `cn()` - Classname concatenation (tailwind-merge)
- `clamp(value, min, max)` - Numeric clamping
- `isValidNumber()` - NaN/Infinity checking
- `formatDate()` - Consistent date formatting

### Rules

- **NO utility duplication inside components**
- If you need a utility, add it to `lib/utils.ts`
- Keep utilities pure and well-tested

---

## Component Registry

Single source of truth: `packages/components/registry.json`

### Registry Format

```json
{
  "components": {
    "gantt-chart": {
      "name": "gantt-chart",
      "category": "charts",
      "description": "Mission timeline and task scheduling",
      "files": [
        "charts/gantt-chart.tsx"
      ],
      "dependencies": ["react", "date-fns"],
      "registryDependencies": ["lib"],
      "tier": "free"
    }
  }
}
```

### Registry Consumers

- **CLI** (`packages/cli`) - Reads to install components
- **Playground** (`playground/constants`) - Reads to display examples
- **Documentation** - Single source for component metadata

### Adding Components

1. Build the component in `packages/components/charts/`
2. Add entry to `registry.json`
3. Add example to `playground/examples/`
4. Test via CLI: `plexusui add your-component`

---

## File Organization Rules

### 1. Component Files

Each component is **one file** containing:
- Types and interfaces
- Context (if needed)
- Primitive components (Root, Container, etc.)
- Default export with attached primitives
- No external dependencies except:
  - React
  - Shared types from `lib/types.ts`
  - Shared utils from `lib/utils.ts`
  - GPU primitives from `primitives/`

### 2. No Utility Duplication

❌ **Bad:**
```typescript
// Inside gantt-chart.tsx
function cn(...classes) { ... }
```

✅ **Good:**
```typescript
// At top of gantt-chart.tsx
import { cn } from "../lib/utils";
```

### 3. No Type Duplication

❌ **Bad:**
```typescript
// Multiple components defining their own color types
type Color = [number, number, number];
```

✅ **Good:**
```typescript
import type { RGB } from "../lib/types";
```

---

## Component Checklist

Before shipping a component, ensure it follows these standards:

### API Design
- [ ] Provides both simple and composable APIs
- [ ] Default export is the simple all-in-one component
- [ ] Primitives attached to default export
- [ ] Uses `forwardRef` for DOM access
- [ ] TypeScript props properly documented with JSDoc

### Code Quality
- [ ] No duplicated utilities (imports from `lib/utils.ts`)
- [ ] No duplicated types (imports from `lib/types.ts`)
- [ ] Follows naming conventions
- [ ] Proper error handling
- [ ] Input validation for safety-critical use cases

### Documentation
- [ ] Added to `registry.json`
- [ ] Example in `playground/examples/`
- [ ] API reference in `playground/examples/api/`
- [ ] JSDoc comments on all public props
- [ ] Usage examples in component file header

### Testing
- [ ] Manually tested in playground
- [ ] Tested via CLI installation
- [ ] Works in both light and dark themes
- [ ] Responsive/handles container resizing
- [ ] Handles edge cases (empty data, invalid input)

---

## Performance Guidelines

### WebGPU Thresholds

Components should automatically switch rendering strategies:

- **<100 points:** SVG/DOM (simplest, most accessible)
- **100-5,000 points:** Canvas2D (good balance)
- **>5,000 points:** WebGPU (maximum performance)

### Memory Management

- Use singleton device manager (`getWebGPUDevice()`)
- Clean up GPU resources in `useEffect` cleanup
- Implement buffer pooling for frequent updates
- Avoid creating new buffers every frame

### Optimization Checklist

- [ ] Memoize expensive calculations with `useMemo`
- [ ] Memoize child components with `React.memo`
- [ ] Debounce resize handlers
- [ ] Use `requestAnimationFrame` for animations
- [ ] Implement virtual scrolling for >1000 items

---

## Import Path Standards

### For Components

Components should import using relative paths:
```typescript
import { cn } from "../lib/utils";
import type { RGB, Margin } from "../lib/types";
import { WebGPULineRenderer } from "../primitives/webgpu/line-renderer";
```

### For Playground

Playground can use workspace aliases:
```typescript
import { GanttChart } from "@plexusui/components/charts/gantt-chart";
```

### For Users (via CLI)

After installation, users import from their local copy:
```typescript
import { GanttChart } from "@/components/plexusui/gantt-chart";
```

---

## CLI Distribution

### How It Works

1. User runs: `plexusui add gantt-chart`
2. CLI reads `registry.json`
3. Downloads component file(s) from GitHub
4. Resolves `registryDependencies` (e.g., `lib`)
5. Copies to `components/plexusui/` in user's project
6. Shows npm install instructions for peer dependencies

### Component Requirements

For CLI compatibility:
- Components must be in `registry.json`
- File paths must be correct (relative to `packages/components/`)
- Dependencies must be accurate
- Must work standalone (no monorepo-specific imports)

---

## Version Strategy

### Versioning

- **CLI** (`@plexusui/cli`): Semantic versioning, published to npm
- **Components**: No version numbers (users own the code)
- **Breaking Changes**: New CLI version + migration guide

### Updating Components

Users update components by:
1. Run `plexusui diff gantt-chart` to see changes
2. Run `plexusui add gantt-chart --force` to overwrite
3. Manually merge custom changes

---

## Browser Support

### Minimum Requirements

- **WebGPU:** Chrome/Edge 113+, Safari 18+
- **Fallback:** Any modern browser with Canvas2D
- **Mobile:** iOS Safari 18+, Chrome Android 113+

### Feature Detection

Components must gracefully degrade:
```typescript
const supportsWebGPU = await isWebGPUAvailable();
if (supportsWebGPU && dataSize > 5000) {
  return <WebGPURenderer />;
} else {
  return <CanvasFallback />;
}
```

---

## Security & Compliance

### Input Validation

All user input must be validated:
- Check for NaN/Infinity in numeric inputs
- Clamp colors to [0, 1] range
- Validate array lengths
- Sanitize text for XSS

### Safety-Critical Use Cases

For medical/aerospace applications:
- Implement dimensional analysis (typed units)
- Add runtime bounds checking
- Log validation failures
- Provide error boundaries

---

## Migration Guide

### Migrating Existing Components

To update a component to follow these patterns:

1. **Extract utilities** - Move duplicated code to `lib/utils.ts`
2. **Extract types** - Move to `lib/types.ts`
3. **Implement dual API** - Add simple + composable pattern
4. **Update imports** - Use relative paths
5. **Add to registry** - Update `registry.json`
6. **Test** - Verify in playground and via CLI

### Example: Waveform Monitor

Before: Simple wrapper only
After: Simple + composable primitives following GanttChart pattern

---

## Questions & Decisions

### When to create a new primitive?

Create a primitive if:
- It's reusable across multiple components
- It encapsulates WebGPU/Canvas logic
- It has clear, focused responsibility

Don't create a primitive if:
- It's only used in one component
- It's mostly layout/styling
- It's too high-level

### When to add a dependency?

Add dependencies sparingly:
- Must provide significant value
- Must be actively maintained
- Must be small (<50kb)
- Prefer peer dependencies over direct deps

### When to break backwards compatibility?

Only for:
- Security fixes
- Critical bugs
- Major architectural improvements

Always provide:
- Migration guide
- Codemod if possible
- Deprecation warnings before removal

---

## Contributing

When adding new components:

1. Read this document thoroughly
2. Follow the component checklist
3. Test in both playground and via CLI
4. Update registry.json
5. Add example and API reference
6. Submit PR with before/after examples

---

## Resources

- [WebGPU Spec](https://www.w3.org/TR/webgpu/)
- [shadcn/ui Philosophy](https://ui.shadcn.com/docs)
- [Radix UI Composition](https://www.radix-ui.com/primitives/docs/guides/composition)
- [WebGPU Samples](https://webgpu.github.io/webgpu-samples/)
