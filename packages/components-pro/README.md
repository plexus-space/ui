# Plexus UI Pro Components

Advanced aerospace and scientific visualization components for mission-critical applications.

## Components

### Orbital Mechanics & Propagation

- **OrbitTransferPlanner** - Hohmann transfer calculations and visualization
- For real-time orbit propagation, use the primitive-first architecture:
  - `useOrbitalPropagation` hook (in `@plexusui/hooks`)
  - `Marker`, `OrbitPath`, `Trail` primitives (in `@plexusui/components/primitives`)

### Network & System Architecture

- **NodeGraphEditor** - Interactive node-based graph editor for visual programming
- **DataflowVisualizer** - Dataflow and system architecture visualization

## Installation

These components are part of the Plexus UI Pro tier and are available in the playground.

## Usage

```tsx
// Orbital mechanics - primitive-first architecture
import { useOrbitalPropagation } from "@plexusui/hooks/use-orbital-propagation";
import { Marker, OrbitPath, Trail } from "@plexusui/components/primitives";

// Orbit transfers
import { OrbitTransferPlanner } from "@plexusui/components-pro/orbit-transfer-planner";

// Node graph editor
import { NodeGraphEditor } from "@plexusui/components-pro/node-graph-editor";
```

## Documentation

Full documentation and examples are available in the playground at `/orbit-propagator` and `/orbit-transfer-planner`.

For migration from the deprecated `OrbitPropagator` component, see [MIGRATION.md](../../MIGRATION.md).

## License

Proprietary - Part of Plexus UI Pro
