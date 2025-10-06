# @plexus/earth

Primitive-based Earth visualization component.

## Installation

```bash
npm install @plexus/earth
```

### Peer Dependencies

```bash
npm install @react-three/fiber @react-three/drei react react-dom three
```

## Quick Start

```tsx
import { Earth } from "@plexus/earth";

function App() {
  return (
    <Earth
      dayMapUrl="/textures/earth-day.jpg"
      cloudsMapUrl="/textures/earth-clouds.jpg"
      enableRotation={true}
    />
  );
}
```

## API

### Earth (Composed Component)

The main pre-configured component with sensible defaults.

**Props:**

- `dayMapUrl?: string` - Earth day texture (default: `/day.jpg`)
- `bumpMapUrl?: string` - Bump map for surface detail (default: `/bump.jpg`)
- `cloudsMapUrl?: string` - Cloud layer texture (default: `/clouds.jpg`)
- `normalMapUrl?: string` - Normal map for advanced lighting
- `brightness?: number` - Overall scene brightness (default: `1.2`)
- `enableRotation?: boolean` - Auto-rotate the Earth (default: `false`)
- `cameraPosition?: [number, number, number]` - Camera position (default: `[0, 0, 15000]`)
- `cameraFov?: number` - Camera field of view (default: `45`)
- `minDistance?: number` - Min zoom distance (default: `7000`)
- `maxDistance?: number` - Max zoom distance (default: `50000`)
- `children?: React.ReactNode` - Custom content to render in the scene

**Example:**

```tsx
<Earth
  dayMapUrl="/earth.jpg"
  enableRotation={true}
  brightness={1.5}
  cameraPosition={[0, 0, 20000]}
/>
```

### EarthScene (Scene Primitive)

Canvas with lights and controls - use when you want to customize what's rendered.

**Props:**

- `cameraPosition?: [number, number, number]`
- `cameraFov?: number`
- `minDistance?: number`
- `maxDistance?: number`
- `brightness?: number`
- `children?: React.ReactNode`

**Example:**

```tsx
import { EarthScene, EarthSphereRoot } from "@plexus/earth";

function CustomEarth() {
  return (
    <EarthScene brightness={1.5}>
      <EarthSphereRoot textureUrl="/custom.jpg" />
      {/* Add satellites, markers, etc. */}
      <mesh position={[8000, 0, 0]}>
        <sphereGeometry args={[200, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </EarthScene>
  );
}
```

### EarthSphereRoot (Root Primitive)

Just the Earth sphere - use when you want complete control over the scene.

**Props:**

- `radius?: number` - Sphere radius (default: `EARTH_RADIUS = 6371`)
- `textureUrl?: string` - Main texture
- `bumpMapUrl?: string` - Bump map
- `cloudsMapUrl?: string` - Clouds texture
- `normalMapUrl?: string` - Normal map
- `brightness?: number`
- `enableRotation?: boolean`
- `emissiveColor?: string` - Emissive color (default: `"#111111"`)
- `shininess?: number` - Material shininess (default: `5`)
- `bumpScale?: number` - Bump map intensity (default: `0.05`)

**Example:**

```tsx
import { Canvas } from "@react-three/fiber";
import { EarthSphereRoot, EARTH_RADIUS } from "@plexus/earth";

function App() {
  return (
    <Canvas>
      <ambientLight />
      <EarthSphereRoot
        radius={EARTH_RADIUS}
        textureUrl="/earth.jpg"
        enableRotation={true}
      />
    </Canvas>
  );
}
```

## Constants

```tsx
import {
  EARTH_RADIUS, // 6371 (scene units)
  EARTH_REAL_RADIUS_KM, // 6371 km
  EARTH_ROTATION_PERIOD, // 1 Earth day
  EARTH_ORBITAL_PERIOD, // 365.25 Earth days
  EARTH_DIAMETER_KM, // 12742 km
  EARTH_AXIAL_TILT, // 23.4397° (obliquity of the ecliptic)
  ASTRONOMICAL_UNIT_KM, // 149597870.7 km (Earth-Sun distance)
} from "@plexus/earth";
```

## Utility Functions

### calculateSunPosition

Calculate astronomically accurate Sun position based on day of year.

```tsx
import { calculateSunPosition } from "@plexus/earth";

// Position Sun for summer solstice (June 21, day 172)
const sunPos = calculateSunPosition(172);

<Earth sunPosition={sunPos} />
```

### calculateRotationSpeed

Create time-lapse effects with accurate rotation speeds.

```tsx
import { calculateRotationSpeed } from "@plexus/earth";

// 1 Earth day passes every real second (86400x speed)
const speed = calculateRotationSpeed(86400);

<Earth rotationSpeed={speed} enableRotation={true} />
```

## Textures

You'll need Earth textures. High-quality free textures are available from:

- [NASA Visible Earth](https://visibleearth.nasa.gov/)
- [Solar System Scope](https://www.solarsystemscope.com/textures/)

Recommended texture sizes:

- Day map: 4096x2048 or 8192x4096
- Clouds: 2048x1024
- Bump map: 2048x1024

## Examples

### Realistic Earth with Accurate Rotation and Sun Position

```tsx
import { Earth, calculateSunPosition } from "@plexus/earth";

function RealisticEarth() {
  // Current day of year (e.g., March 20 = vernal equinox)
  const dayOfYear = 79;
  const sunPos = calculateSunPosition(dayOfYear);

  return (
    <Earth
      dayMapUrl="/textures/earth-day.jpg"
      cloudsMapUrl="/textures/earth-clouds.jpg"
      enableRotation={true}
      sunPosition={sunPos}
      brightness={1.3}
      // Uses realistic 24-hour rotation by default
      // Uses accurate 23.4397° axial tilt by default
    />
  );
}
```

### Time-Lapse Earth (Fast Rotation)

```tsx
import { Earth, calculateRotationSpeed } from "@plexus/earth";

function TimeLapseEarth() {
  // Speed up rotation: 1 day per second (86400x real-time)
  const fastRotation = calculateRotationSpeed(86400);

  return (
    <Earth
      dayMapUrl="/textures/earth-day.jpg"
      enableRotation={true}
      rotationSpeed={fastRotation}
    />
  );
}
```

### Seasonal Sun Positions

```tsx
import { Earth, calculateSunPosition } from "@plexus/earth";

function SeasonalEarth() {
  // Summer solstice: June 21 (day 172)
  // Winter solstice: December 21 (day 355)
  // Vernal equinox: March 20 (day 79)
  // Autumnal equinox: September 23 (day 266)

  const summerSun = calculateSunPosition(172);

  return (
    <Earth
      dayMapUrl="/textures/earth-day.jpg"
      sunPosition={summerSun}
      enableRotation={true}
    />
  );
}
```

### Rotating Earth with Clouds

```tsx
<Earth
  dayMapUrl="/textures/earth-day.jpg"
  cloudsMapUrl="/textures/earth-clouds.jpg"
  enableRotation={true}
  brightness={1.3}
/>
```

### Earth with Custom Markers

```tsx
import { EarthScene, EarthSphereRoot } from "@plexus/earth";

function EarthWithMarkers() {
  return (
    <EarthScene>
      <EarthSphereRoot />
      {/* Marker over New York */}
      <mesh position={[4000, 3000, 2000]}>
        <sphereGeometry args={[100, 16, 16]} />
        <meshStandardMaterial color="red" emissive="red" />
      </mesh>
    </EarthScene>
  );
}
```

### Multiple Earths

```tsx
import { Canvas } from "@react-three/fiber";
import { EarthSphereRoot } from "@plexus/earth";

function MultipleEarths() {
  return (
    <Canvas>
      <ambientLight />
      <EarthSphereRoot radius={3000} position={[-5000, 0, 0]} />
      <EarthSphereRoot radius={3000} position={[5000, 0, 0]} />
    </Canvas>
  );
}
```

## TypeScript

Fully typed with TypeScript. All props and exports are typed.

```tsx
import type {
  EarthProps,
  EarthSceneProps,
  EarthSphereRootProps,
} from "@plexus/earth";
```

## License

MIT

---

Part of [@plexus/ui-aerospace](https://github.com/yourusername/ui-aerospace) - Primitive-based aerospace components
