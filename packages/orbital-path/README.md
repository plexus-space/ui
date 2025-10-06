# @plexusui/orbital-path

Primitive-based elliptical orbit visualization component with Keplerian elements for aerospace applications.

## Installation

```bash
npm install @plexusui/orbital-path
```

## Peer Dependencies

This component requires the following peer dependencies:

```bash
npm install react react-dom three @react-three/fiber @react-three/drei
```

## Usage

### Basic Orbit

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitalPath } from "@plexusui/orbital-path";

export default function App() {
  return (
    <Canvas>
      <OrbitalPath
        elements={{
          semiMajorAxis: 10000,
          eccentricity: 0.3,
        }}
      />
    </Canvas>
  );
}
```

### With Full Keplerian Elements

```tsx
<OrbitalPath
  elements={{
    semiMajorAxis: 10000, // km
    eccentricity: 0.3,
    inclination: 23.5, // degrees
    longitudeOfAscendingNode: 45, // degrees
    argumentOfPeriapsis: 90, // degrees
  }}
  color="#00ff00"
  showApoapsis
  showPeriapsis
/>
```

### Using Primitives

```tsx
import { OrbitalPathRoot } from "@plexusui/orbital-path";

<Canvas>
  <ambientLight />
  <OrbitalPathRoot
    elements={{
      semiMajorAxis: 8000,
      eccentricity: 0.2,
    }}
    segments={256}
    color="#ff00ff"
  />
</Canvas>
```

## Keplerian Elements

The component uses classical Keplerian orbital elements:

- **semiMajorAxis** (a): Half the longest diameter of the ellipse (km)
- **eccentricity** (e): Shape of the orbit (0 = circular, < 1 = elliptical)
- **inclination** (i): Tilt of orbital plane relative to reference (degrees)
- **longitudeOfAscendingNode** (Ω): Rotation of ascending node (degrees)
- **argumentOfPeriapsis** (ω): Rotation within orbital plane (degrees)
- **trueAnomaly** (ν): Position of satellite along orbit (degrees)

## API Reference

### OrbitalPath

Main composed component for orbital path visualization.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `elements` | `KeplerianElements` | required | Keplerian orbital elements |
| `segments` | `number` | 128 | Number of segments for path smoothness |
| `color` | `string` | `"#00ff00"` | Path line color |
| `lineWidth` | `number` | 2 | Line width |
| `showApoapsis` | `boolean` | `false` | Show apoapsis marker |
| `showPeriapsis` | `boolean` | `false` | Show periapsis marker |
| `apoapsisColor` | `string` | `"#ff0000"` | Apoapsis marker color |
| `periapsisColor` | `string` | `"#0000ff"` | Periapsis marker color |
| `markerSize` | `number` | 100 | Marker sphere size |

### OrbitalPathRoot

Base primitive for custom scenes.

Same props as `OrbitalPath`, use within your own `<Canvas>` setup.

### OrbitalPathUtils

Utility functions for orbital calculations:

```tsx
import { OrbitalPathUtils } from "@plexusui/orbital-path";

// Calculate orbital period
const period = OrbitalPathUtils.calculateOrbitalPeriod(10000);

// Calculate apoapsis and periapsis
const { apoapsis, periapsis } = OrbitalPathUtils.calculateApsides(10000, 0.3);

// Create circular orbit
const circular = OrbitalPathUtils.circularOrbit(8000);

// Validate elements
const valid = OrbitalPathUtils.validateElements(elements);
```

## Examples

### Low Earth Orbit (LEO)

```tsx
<OrbitalPath
  elements={{
    semiMajorAxis: 6771, // ~400km altitude
    eccentricity: 0.0005,
    inclination: 51.6, // ISS inclination
  }}
/>
```

### Geostationary Orbit (GEO)

```tsx
<OrbitalPath
  elements={{
    semiMajorAxis: 42164, // GEO altitude
    eccentricity: 0,
    inclination: 0,
  }}
/>
```

### Highly Elliptical Orbit (HEO)

```tsx
<OrbitalPath
  elements={{
    semiMajorAxis: 26554,
    eccentricity: 0.7,
    inclination: 63.4, // Molniya orbit
    argumentOfPeriapsis: 270,
  }}
  showApoapsis
  showPeriapsis
/>
```

## License

MIT
