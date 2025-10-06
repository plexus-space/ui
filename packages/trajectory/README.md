# @plexusui/trajectory

Primitive-based flight path visualization component with waypoints and burn markers for aerospace applications.

## Installation

```bash
npm install @plexusui/trajectory
```

## Peer Dependencies

```bash
npm install react react-dom three @react-three/fiber @react-three/drei
```

## Usage

### Basic Trajectory

```tsx
import { Canvas } from "@react-three/fiber";
import { Trajectory } from "@plexusui/trajectory";

const waypoints = [
  { position: [0, 0, 0] },
  { position: [1000, 500, 0] },
  { position: [2000, 1000, 500] },
  { position: [3000, 500, 1000] },
];

export default function App() {
  return (
    <Canvas>
      <Trajectory waypoints={waypoints} showWaypoints />
    </Canvas>
  );
}
```

### With Burn Markers

```tsx
const burns = [
  {
    position: [1000, 500, 0],
    deltaV: 250,
    type: "prograde",
    label: "Circularization",
  },
  {
    position: [3000, 500, 1000],
    deltaV: 180,
    type: "retrograde",
    label: "Deorbit",
  },
];

<Trajectory
  waypoints={waypoints}
  burns={burns}
  showWaypoints
  showBurns
  showDeltaVVectors
  smoothCurve
/>;
```

### Animated Trajectory

```tsx
const [progress, setProgress] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setProgress((p) => (p >= 1 ? 0 : p + 0.01));
  }, 50);
  return () => clearInterval(interval);
}, []);

<Trajectory
  waypoints={waypoints}
  animated
  animationProgress={progress}
/>;
```

## API Reference

### Trajectory

Main composed component for trajectory visualization.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `waypoints` | `Waypoint[]` | required | Waypoints defining the trajectory |
| `burns` | `BurnMarker[]` | `[]` | Burn/maneuver markers |
| `color` | `string` | `"#00ffff"` | Trajectory line color |
| `lineWidth` | `number` | 2 | Line width |
| `showWaypoints` | `boolean` | `false` | Show waypoint markers |
| `waypointSize` | `number` | 100 | Waypoint marker size |
| `waypointColor` | `string` | `"#ffffff"` | Waypoint color |
| `showBurns` | `boolean` | `false` | Show burn markers |
| `burnSize` | `number` | 150 | Burn marker size |
| `burnColor` | `string` | varies by type | Burn marker color |
| `showDeltaVVectors` | `boolean` | `false` | Show delta-V arrows |
| `deltaVScale` | `number` | 100 | Delta-V vector scale |
| `smoothCurve` | `boolean` | `true` | Use Catmull-Rom spline |
| `curveSegments` | `number` | 100 | Curve smoothness |
| `showLabels` | `boolean` | `false` | Show labels |
| `animated` | `boolean` | `false` | Enable animation |
| `animationProgress` | `number` | 1 | Animation progress (0-1) |

### Waypoint

```ts
interface Waypoint {
  position: THREE.Vector3 | [number, number, number];
  name?: string;
  timestamp?: number;
  velocity?: THREE.Vector3 | [number, number, number];
}
```

### BurnMarker

```ts
interface BurnMarker {
  position: THREE.Vector3 | [number, number, number];
  deltaV: number; // m/s
  direction?: THREE.Vector3 | [number, number, number];
  duration?: number; // seconds
  type?: "prograde" | "retrograde" | "normal" | "radial" | "custom";
  label?: string;
}
```

### TrajectoryUtils

Utility functions for trajectory operations:

```tsx
import { TrajectoryUtils } from "@plexusui/trajectory";

// Calculate total delta-V
const totalDV = TrajectoryUtils.calculateTotalDeltaV(burns);

// Calculate trajectory length
const length = TrajectoryUtils.calculateLength(waypoints);

// Calculate duration
const duration = TrajectoryUtils.calculateDuration(waypoints);

// Interpolate position
const position = TrajectoryUtils.interpolatePosition(waypoints, 0.5);

// Create Hohmann transfer
const transfer = TrajectoryUtils.createHohmannTransfer(7000, 42164, 50);

// Validate waypoint
const valid = TrajectoryUtils.validateWaypoint(waypoint);
```

## Examples

### Launch to Orbit

```tsx
const launchTrajectory = [
  { position: [6371, 0, 0], name: "Liftoff" },
  { position: [6471, 200, 100], name: "Pitch" },
  { position: [6671, 500, 300], name: "MECO" },
  { position: [6771, 400, 400], name: "Orbit" },
];

const burns = [
  { position: [6371, 0, 0], deltaV: 7800, type: "prograde" },
  { position: [6771, 400, 400], deltaV: 90, type: "prograde" },
];

<Trajectory
  waypoints={launchTrajectory}
  burns={burns}
  showWaypoints
  showBurns
  showLabels
/>;
```

### Hohmann Transfer

```tsx
import { TrajectoryUtils } from "@plexusui/trajectory";

const transfer = TrajectoryUtils.createHohmannTransfer(
  6771, // LEO radius
  42164, // GEO radius
  100
);

const burns = [
  { position: transfer[0].position, deltaV: 2440, type: "prograde" },
  {
    position: transfer[transfer.length - 1].position,
    deltaV: 1470,
    type: "prograde",
  },
];

<Trajectory waypoints={transfer} burns={burns} showBurns smoothCurve />;
```

### Rendezvous Maneuver

```tsx
const rendezvous = [
  { position: [7000, 0, 0], name: "Start" },
  { position: [7200, 500, 200], name: "Phasing" },
  { position: [7100, 800, 300], name: "Approach" },
  { position: [7000, 900, 350], name: "Docking" },
];

<Trajectory
  waypoints={rendezvous}
  showWaypoints
  showLabels
  color="#00ff00"
  smoothCurve
/>;
```

## Burn Type Colors

- **prograde**: `#00ff00` (green)
- **retrograde**: `#ff0000` (red)
- **normal**: `#0000ff` (blue)
- **radial**: `#ffff00` (yellow)
- **custom**: `#ff9900` (orange)

## License

MIT
