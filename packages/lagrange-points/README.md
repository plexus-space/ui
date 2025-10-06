# @plexusui/lagrange-points

Primitive-based Lagrange point (L1-L5) equilibrium point visualization component for multi-body systems.

## Installation

```bash
npm install @plexusui/lagrange-points
```

## Peer Dependencies

```bash
npm install react react-dom three @react-three/fiber @react-three/drei
```

## Usage

### Basic Lagrange Points

```tsx
import { Canvas } from "@react-three/fiber";
import { LaGrangePoints } from "@plexusui/lagrange-points";

export default function App() {
  return (
    <Canvas>
      <LaGrangePoints
        system={{
          primaryMass: 5.972e24, // Earth
          secondaryMass: 7.342e22, // Moon
          distance: 384400, // km
        }}
      />
    </Canvas>
  );
}
```

### Using Presets

```tsx
import { LaGrangePoints, LaGrangePointsUtils } from "@plexusui/lagrange-points";

<LaGrangePoints
  system={LaGrangePointsUtils.EarthMoonSystem()}
  showStability
  showConnectionLines
/>;
```

### High-Precision Mode

For exact Lagrange point positions (Newton-Raphson solver):

```tsx
<LaGrangePoints
  system={LaGrangePointsUtils.SunEarthSystem()}
  highPrecision  // ← Exact positions (machine precision)
  showPoints={["L1", "L2"]}
/>
```

**Accuracy comparison:**
- Default mode: ~1% error for μ < 0.1 (fast, good for visualization)
- High precision: < 1e-10 error (exact, suitable for analysis)

### Showing Specific Points

```tsx
<LaGrangePoints
  system={LaGrangePointsUtils.SunEarthSystem()}
  showPoints={["L1", "L2"]} // Only show L1 and L2
  showLabels
/>
```

### JWST at Sun-Earth L2

```tsx
<LaGrangePoints
  system={LaGrangePointsUtils.JWSTSystem()}
  showPoints={["L2"]}
  pointSize={500}
  showConnectionLines
/>
```

## API Reference

### LaGrangePoints

Main composed component for Lagrange point visualization.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `system` | `TwoBodySystem` | required | Two-body system configuration |
| `showPoints` | `LagrangePointType[]` | all | Which points to show |
| `pointSize` | `number` | 200 | Point marker size |
| `showLabels` | `boolean` | `true` | Show labels |
| `showStability` | `boolean` | `false` | Show stability indicators |
| `showConnectionLines` | `boolean` | `false` | Show lines to bodies |
| `colors` | `Partial<Record<...>>` | defaults | Custom colors |
| `showPrimaryBody` | `boolean` | `true` | Show primary body |
| `showSecondaryBody` | `boolean` | `true` | Show secondary body |
| `primaryBodySize` | `number` | 1000 | Primary body size |
| `secondaryBodySize` | `number` | 500 | Secondary body size |
| `primaryBodyColor` | `string` | `"#0000ff"` | Primary body color |
| `secondaryBodyColor` | `string` | `"#888888"` | Secondary body color |
| `highPrecision` | `boolean` | `false` | Use Newton-Raphson solver |

### TwoBodySystem

```ts
interface TwoBodySystem {
  primaryMass: number; // kg
  secondaryMass: number; // kg
  distance: number; // km
  primaryPosition?: THREE.Vector3 | [number, number, number];
  secondaryPosition?: THREE.Vector3 | [number, number, number];
}
```

### LagrangePointType

```ts
type LagrangePointType = "L1" | "L2" | "L3" | "L4" | "L5";
```

### LagrangePointData

```ts
interface LagrangePointData {
  type: LagrangePointType;
  position: THREE.Vector3;
  stable: boolean;
  distanceFromPrimary: number; // km
  distanceFromSecondary: number; // km
}
```

### LaGrangePointsUtils

Utility functions and presets:

```tsx
import { LaGrangePointsUtils } from "@plexusui/lagrange-points";

// Calculate all points for a system
const points = LaGrangePointsUtils.calculateAllPoints(system);

// Calculate mass ratio
const mu = LaGrangePointsUtils.calculateMassRatio(m1, m2);

// Check stability
const stable = LaGrangePointsUtils.isStable("L4"); // true

// Get point color
const color = LaGrangePointsUtils.getPointColor("L1"); // "#ff0000"

// System presets
const earthMoon = LaGrangePointsUtils.EarthMoonSystem();
const sunEarth = LaGrangePointsUtils.SunEarthSystem();
const jwst = LaGrangePointsUtils.JWSTSystem();
```

## Examples

### Earth-Moon System

```tsx
<LaGrangePoints
  system={{
    primaryMass: 5.972e24,
    secondaryMass: 7.342e22,
    distance: 384400,
  }}
  showStability
  showLabels
/>
```

**Notable objects:**
- L1: Gateway lunar station (proposed)
- L2: Communication satellites
- L4/L5: Kordylewski clouds (dust)

### Sun-Earth System

```tsx
<LaGrangePoints
  system={{
    primaryMass: 1.989e30,
    secondaryMass: 5.972e24,
    distance: 149600000,
  }}
  showPoints={["L1", "L2"]}
/>
```

**Notable objects:**
- L1: SOHO, WIND, ACE satellites
- L2: JWST, Planck, Herschel, Gaia

### Custom System

```tsx
<LaGrangePoints
  system={{
    primaryMass: 1e30,
    secondaryMass: 1e27,
    distance: 1000000,
  }}
  colors={{
    L4: "#ff00ff",
    L5: "#00ffff",
  }}
  showStability
/>
```

## Lagrange Points Explained

### Stability

**Stable (L4, L5):**
- Form equilateral triangles with the two bodies
- Objects naturally stay near these points
- Known as "Trojan points"
- Color-coded: L4 (green), L5 (cyan)

**Unstable (L1, L2, L3):**
- Require active station-keeping
- Objects drift away without correction
- Useful for telescopes and solar monitoring
- Color-coded: L1 (red), L2 (orange), L3 (yellow)

### Positions

- **L1**: Between bodies, closer to smaller mass
- **L2**: Beyond smaller body, away from larger
- **L3**: Opposite smaller body from larger
- **L4**: 60° ahead of smaller body in its orbit
- **L5**: 60° behind smaller body in its orbit

### Applications

**L1:**
- Solar observatories (SOHO, WIND)
- Early warning for space weather

**L2:**
- Deep space telescopes (JWST, Planck)
- Minimal interference from Earth/Sun

**L3:**
- Hypothetical monitoring of Sun's far side

**L4/L5:**
- Natural collection points for asteroids
- Trojan asteroids in Jupiter-Sun system
- Proposed space stations

## Default Colors

- **L1**: `#ff0000` (red)
- **L2**: `#ff9900` (orange)
- **L3**: `#ffff00` (yellow)
- **L4**: `#00ff00` (green)
- **L5**: `#00ffff` (cyan)

## Physics Notes

Mass ratio: `μ = m₂ / (m₁ + m₂)`

**Approximate distances from primary** (first-order expansion):
- L1: `d × (μ/3)^(1/3)` ⚠️ ~1% accuracy for μ < 0.1
- L2: `d × (1 + (μ/3)^(1/3))` ⚠️ ~1% accuracy for μ < 0.1
- L3: `d × (1 + 5μ/12)` ⚠️ approximate
- L4/L5: `d` (exact - equilateral triangle)

**Note**: L1, L2, L3 exact positions require solving quintic equations numerically. These approximations are suitable for visualization but not mission planning.

## License

MIT
