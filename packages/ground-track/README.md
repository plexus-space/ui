# @plexusui/ground-track

Primitive-based satellite ground track overlay component for aerospace applications.

## Installation

```bash
npm install @plexusui/ground-track
```

## Peer Dependencies

```bash
npm install react react-dom three @react-three/fiber @react-three/drei
```

## Usage

### Basic Ground Track

```tsx
import { Canvas } from "@react-three/fiber";
import { GroundTrack } from "@plexusui/ground-track";

const trackPoints = [
  { latitude: 0, longitude: 0 },
  { latitude: 10, longitude: 20 },
  { latitude: 20, longitude: 40 },
  { latitude: 30, longitude: 60 },
];

export default function App() {
  return (
    <Canvas>
      <GroundTrack points={trackPoints} planetRadius={6371} />
    </Canvas>
  );
}
```

### With Markers and Animation

```tsx
<GroundTrack
  points={satelliteTrack}
  planetRadius={6371}
  color="#ffff00"
  showMarkers
  markerColor="#ff0000"
  animated
  animationSpeed={0.01}
/>
```

### Generate Track from Orbital Elements

```tsx
import { GroundTrackUtils } from "@plexusui/ground-track";

const trackPoints = GroundTrackUtils.generateFromOrbit(
  7000, // semi-major axis (km)
  51.6, // inclination (degrees)
  100, // number of points
  6371 // Earth radius
);

<GroundTrack points={trackPoints} />;
```

## API Reference

### GroundTrack

Main composed component for ground track visualization.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `points` | `GroundTrackPoint[]` | required | Array of lat/lon coordinates |
| `planetRadius` | `number` | 6371 | Planet radius in km |
| `offset` | `number` | 10 | Offset above surface in km |
| `color` | `string` | `"#ffff00"` | Track line color |
| `lineWidth` | `number` | 3 | Line width |
| `showMarkers` | `boolean` | `false` | Show markers at each point |
| `markerSize` | `number` | 50 | Marker sphere size |
| `markerColor` | `string` | `"#ffffff"` | Marker color |
| `splitAtDateLine` | `boolean` | `true` | Auto-split at date line |
| `animated` | `boolean` | `false` | Enable animation |
| `animationSpeed` | `number` | 0.01 | Animation speed |

### GroundTrackPoint

```ts
interface GroundTrackPoint {
  latitude: number; // -90 to 90
  longitude: number; // -180 to 180
  timestamp?: number;
  altitude?: number; // km
}
```

### GroundTrackUtils

Utility functions for ground track operations:

```tsx
import { GroundTrackUtils } from "@plexusui/ground-track";

// Convert Cartesian to lat/lon
const { latitude, longitude } = GroundTrackUtils.cartesianToLatLon(
  position,
  radius
);

// Convert lat/lon to Cartesian
const vector = GroundTrackUtils.latLonToCartesian(lat, lon, radius);

// Generate track from orbit
const points = GroundTrackUtils.generateFromOrbit(
  semiMajorAxis,
  inclination,
  steps
);

// Filter by time range
const filtered = GroundTrackUtils.filterByTimeRange(points, start, end);

// Validate point
const valid = GroundTrackUtils.validatePoint(point);
```

## Examples

### ISS Ground Track

```tsx
const issTrack = GroundTrackUtils.generateFromOrbit(
  6771, // ~400km altitude
  51.6, // ISS inclination
  200
);

<GroundTrack
  points={issTrack}
  planetRadius={6371}
  color="#00ff00"
  showMarkers
/>;
```

### Polar Orbit

```tsx
const polarTrack = GroundTrackUtils.generateFromOrbit(
  7000,
  90, // polar inclination
  150
);

<GroundTrack points={polarTrack} color="#00ffff" />;
```

### Multiple Passes with Time Filtering

```tsx
const allPasses = getHistoricalTrackData();
const last24Hours = Date.now() - 24 * 60 * 60 * 1000;

const recentTrack = GroundTrackUtils.filterByTimeRange(
  allPasses,
  last24Hours,
  Date.now()
);

<GroundTrack points={recentTrack} animated />;
```

## License

MIT
