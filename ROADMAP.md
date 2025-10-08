# Plexus UI Roadmap

> Building a shadcn-style component library for aerospace & physics visualization

## Vision

Create a **primitive-based component library** where developers copy code into their projects rather than installing packages. Each component follows a three-tier architecture (Root � Scene � Composed) for maximum flexibility and customization.

---

## Phase 1: Foundation & Architecture  (Complete)

### Core Infrastructure

- [x] Monorepo setup with workspaces (`cli`, `playground`)
- [x] Component directory structure
- [x] Primitives system (`primitives/`)
  - [x] GPU rendering primitives
  - [x] Physics engine
  - [x] Animation system
  - [x] 3D mesh primitives (Sphere, Atmosphere, Clouds, Ring)
- [x] TypeScript configuration

### CLI Tool (Like shadcn)

- [x] `@plexusui/cli init` - Initialize project
- [x] `@plexusui/cli add` - Copy components to user's project
- [x] Component registry system
- [x] Dependency detection

---

## Phase 2: Component Library - 3D Planetary  (Complete)

### Planetary Bodies (3D)

Done

### Orbital Mechanics

Done

---

## Phase 3: Component Library - 2D Charts

### Chart Components

- [x] Chart primitives
  - [x] Canvas renderer
  - [x] Chart legend
  - [x] Chart tooltip
  - [x] Chart export utilities
  - [x] Colormaps (14 scientific colormaps)
  - [x] Data decimation (LTTB, MinMax)
- [x] **Line Chart** (Priority 1)
  - [x] Multi-series support
  - [x] Real-time data streaming
  - [x] Zoom/pan interactions
  - [x] GPU-accelerated rendering for large datasets
  - [x] Export to PNG/SVG
- [x] **XY Plot/Scatter** (Priority 1)
  - [x] Multiple datasets
  - [x] Custom markers (6 shapes: circle, square, diamond, triangle, cross, plus)
  - [x] Trendlines (linear regression)
  - [x] Bubble chart support (size scaling)
- [x] **Polar Plot** (Priority 2)
  - [x] Radar charts
  - [x] Rose diagrams
  - [x] Orbit phase plots
  - [x] Antenna radiation patterns
- [x] **Heatmap** (Priority 2)
  - [x] 2D density visualization
  - [x] Custom colormaps (14 perceptually uniform options)
  - [x] Terrain/elevation maps
  - [x] Correlation matrices
- [x] **Histogram** (Priority 3)
  - [x] Distribution analysis
  - [x] Multiple series (stacked, overlapping, grouped)
  - [x] Bin customization (auto with Sturges' formula)
  - [x] Bimodal detection
- [ ] **Gantt Chart** (Priority 3)
  - [ ] Mission timeline visualization
  - [ ] Task dependencies
  - [ ] Resource allocation
  - [ ] Satellite pass planning

### Chart Features

- [x] Interactive tooltips
- [x] Legend with toggle series
- [x] Axis configuration (linear, log, time)
- [x] Grid customization
- [x] Dark/light theme support
- [x] Responsive sizing
- [x] Export utilities (PNG, SVG, CSV)

---

## Phase 4: Playground & Documentation =� (In Progress)

### Playground App

- [x] Next.js 15 setup with Turbopack
- [x] Dark/light theme toggle
- [x] Component registry
- [ ] **Component showcase pages**
  - [ ] Individual component pages (`/earth`, `/mars`, etc.)
  - [ ] Live preview with Three.js canvas
  - [ ] Interactive code editor
  - [ ] Props documentation table
  - [ ] Copy code button
  - [ ] Live prop controls
- [ ] **Homepage**
  - [ ] Component grid/list
  - [ ] Category filtering (3D, Charts, Primitives)
  - [ ] Search functionality
- [ ] **Navigation**
  - [ ] Sidebar with component tree
  - [ ] Breadcrumbs
  - [ ] Mobile responsive menu

### Documentation

- [ ] Getting started guide
- [ ] Installation instructions per component
- [ ] API reference (auto-generated from TypeScript)
- [ ] Usage examples
- [ ] Best practices
- [ ] Migration guides
- [ ] FAQ

---

## Phase 5: Advanced 3D Components =� (Planned)

### Spacecraft & Hardware

- [ ] Generic spacecraft model component
- [ ] Solar panel arrays
- [ ] Antenna dishes
- [ ] Thruster visualization with particle effects
- [ ] Sensor field-of-view (FOV) cones

### Orbital Mechanics Advanced

- [ ] Lagrange point visualization
- [ ] Hohmann transfer trajectories
- [ ] Bi-elliptic transfers
- [ ] Gravity assist trajectories
- [ ] Orbit propagation with SGP4/SDP4

### Reference Frames & Coordinates

- [ ] Coordinate frame axes (ECI, ECEF, LVLH, etc.)
- [ ] Ground station positions
- [ ] Ground track visualization
- [ ] Coverage area visualization
- [ ] Celestial sphere & constellations

### Advanced Effects

- [ ] Lens flare
- [ ] Bloom/glow effects
- [ ] Motion blur
- [ ] Depth of field
- [ ] Particle systems (exhaust, debris)

---

## Phase 6: Data Visualization & Telemetry =� (Planned)

### Time Series Components

- [ ] Real-time telemetry graphs
- [ ] Multi-axis plots
- [ ] Event markers
- [ ] Data downsampling for performance
- [ ] WebGL-accelerated rendering

### Mission Planning Tools

- [ ] Timeline/Gantt charts
- [ ] Resource allocation graphs
- [ ] Contact windows visualization
- [ ] Delta-V budget charts

### 3D Data Visualization

- [ ] Volumetric rendering
- [ ] Vector field visualization
- [ ] Isosurface rendering
- [ ] Point cloud visualization

---

## Phase 7: Scientific Accuracy & Precision =� (Planned)

### High-Precision Math Library

- [ ] Newton-Raphson solvers
- [ ] Kepler equation solver (high precision)
- [ ] Lambert's problem solver
- [ ] Two-body propagation
- [ ] Perturbation models (J2, atmospheric drag)

### Reference Data

- [ ] Planetary ephemeris data
- [ ] Real orbital elements for satellites
- [ ] Ground station network data
- [ ] Texture/elevation data pipelines

### Validation

- [ ] Unit tests for all orbital math
- [ ] Visual regression tests
- [ ] Performance benchmarks
- [ ] Compare against GMAT/STK outputs

---

## Phase 8: Developer Experience =� (Planned)

### CLI Enhancements

- [ ] `plexusui update` - Update components
- [ ] `plexusui diff` - Show changes between versions
- [ ] `plexusui list` - List installed components
- [ ] `plexusui remove` - Remove components
- [ ] Template scaffolding (new project)
- [ ] Component dependencies auto-resolution

### Build Tools

- [ ] ESLint plugin for Plexus UI best practices
- [ ] Prettier config
- [ ] VSCode extension (snippets, autocomplete)
- [ ] Storybook integration option

### Testing Utils

- [ ] Testing utilities for R3F components
- [ ] Mock data generators
- [ ] Visual testing helpers

---

## Phase 9: Community & Ecosystem =� (Planned)

### Templates & Examples

- [ ] Mission planning dashboard template
- [ ] Satellite tracker template
- [ ] Orbital mechanics calculator
- [ ] Space mission simulator
- [ ] Educational astronomy app

### Integrations

- [ ] Cesium.js integration guide
- [ ] Leaflet integration for ground tracks
- [ ] D3.js integration for charts
- [ ] WebGPU renderer option

### Community

- [ ] Contributing guide
- [ ] Component request system
- [ ] Community showcase gallery
- [ ] Discord/forum
- [ ] Blog with tutorials

---

## Phase 10: Performance & Optimization =� (Planned)

### Rendering Performance

- [ ] Level-of-detail (LOD) systems
- [ ] Frustum culling optimizations
- [ ] Instanced rendering for large datasets
- [ ] WebGPU renderer (in addition to WebGL)
- [ ] Occlusion culling

### Data Performance

- [ ] Web Workers for physics calculations
- [ ] WASM modules for heavy math
- [ ] Progressive data loading
- [ ] Streaming large datasets

### Bundle Size

- [ ] Tree-shaking optimizations
- [ ] Minimize texture sizes
- [ ] Optional heavy dependencies
- [ ] Code splitting strategies

---

## Phase 11: Mobile & Accessibility =� (Planned)

### Mobile Support

- [ ] Touch gesture controls
- [ ] Mobile-optimized rendering
- [ ] Responsive layouts
- [ ] PWA support

### Accessibility

- [ ] Keyboard navigation
- [ ] Screen reader support for data
- [ ] High contrast themes
- [ ] Reduced motion support
- [ ] WCAG 2.1 AA compliance

---

## Current Priorities (Q4 2025)

### Immediate (Next 2 Weeks)

1. **Complete Line Chart component** - Most requested chart type
2. **Build individual component showcase pages** - Users need to see components in action
3. **Add live code editor to playground** - Enable interactive experimentation
4. **Fix chart-tooltip.tsx** - Resolve any issues with tooltip positioning/rendering

### Short-term (1-2 Months)

1. **Complete XY Plot and Polar Plot charts**
2. **Add props documentation table generator**
3. **Implement component search and filtering**
4. **Create "Getting Started" tutorial**
5. **Add 3-5 complete examples to playground**

### Medium-term (3-6 Months)

1. **Build advanced orbital mechanics components**
2. **Add spacecraft and hardware models**
3. **Implement high-precision math library**
4. **Create mission planning template**
5. **VSCode extension with snippets**

---

## Success Metrics

- **Developer Adoption**: GitHub stars, npm downloads, Discord members
- **Component Usage**: Most copied components, feature requests
- **Performance**: Render FPS, bundle size, load time
- **Documentation**: Page views, time on page, search queries
- **Community**: PRs, issues, discussions, showcase submissions

---

## Tech Stack

### Core

- React 19
- TypeScript 5
- Next.js 15 (playground)
- Turbopack (dev/build)

### 3D Graphics

- Three.js
- React Three Fiber (R3F)
- React Three Drei (helpers)

### 2D Charts

- Canvas API
- WebGL (for large datasets)
- Custom rendering layer

### UI/Styling

- Tailwind CSS 4
- CSS Variables for theming
- Dark/light mode

### Build Tools

- npm workspaces (monorepo)
- TypeScript compiler
- ESLint
- Prettier

### CLI

- Commander.js
- Prompts
- Chalk
- Ora (spinners)

---

## Design Principles

1. **Copy, don't install** - Users own the code
2. **Primitives-first** - Build complex from simple
3. **Scientific accuracy** - Real math, real physics
4. **Performance matters** - Optimize for 60fps
5. **TypeScript native** - Full type safety
6. **Zero magic** - Transparent, understandable code
7. **Dark mode first** - Beautiful in both themes
8. **Accessibility** - Usable by everyone
9. **Mobile-friendly** - Works on all devices
10. **Documentation-driven** - If it's not documented, it doesn't exist

---

## Open Questions

- [ ] Should we support WebGPU in addition to WebGL? Yes
- [ ] Do we need a separate `@plexusui/math` package for heavy calculations? Yes
- [ ] Should components ship with default textures or require users to provide them? No
- [ ] Do we want animation/timeline controls at the primitive level? Yes
- [ ] Should we create a separate `@plexusui/data` package for reference datasets? No

---
