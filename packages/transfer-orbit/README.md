# @plexusui/transfer-orbit

Primitive-based Hohmann and bi-elliptic transfer orbit visualization component for aerospace applications.

## Installation

```bash
npm install @plexusui/transfer-orbit
```

## Peer Dependencies

```bash
npm install react react-dom three @react-three/fiber @react-three/drei
```

## Usage

### Hohmann Transfer

```tsx
import { Canvas } from "@react-three/fiber";
import { TransferOrbit } from "@plexusui/transfer-orbit";

export default function App() {
  return (
    <Canvas>
      <TransferOrbit
        config={{
          initialRadius: 7000, // LEO (~400km altitude)
          finalRadius: 42164, // GEO
          type: "hohmann",
        }}
        showBurns
      />
    </Canvas>
  );
}
```

### Bi-Elliptic Transfer

```tsx
<TransferOrbit
  config={{
    initialRadius: 7000,
    finalRadius: 42164,
    type: "bi-elliptic",
    intermediateRadius: 60000,
  }}
  showBurns
  showLabels
/>
```

### Compare Transfer Efficiency

```tsx
import { TransferOrbitUtils } from "@plexusui/transfer-orbit";

const comparison = TransferOrbitUtils.compareTransfers(
  7000, // initial radius
  42164, // final radius
  60000 // intermediate radius for bi-elliptic
);

console.log(`Hohmann Δv: ${comparison.hohmann} m/s`);
console.log(`Bi-elliptic Δv: ${comparison.biElliptic} m/s`);
console.log(`Recommended: ${comparison.recommendation}`);
```

## API Reference

### TransferOrbit

Main composed component for transfer orbit visualization.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `TransferOrbitConfig` | required | Transfer configuration |
| `segments` | `number` | 128 | Number of segments for smoothness |
| `initialColor` | `string` | `"#00ff00"` | Initial orbit color |
| `finalColor` | `string` | `"#0000ff"` | Final orbit color |
| `transferColor` | `string` | `"#ffff00"` | Transfer orbit color |
| `burnColor` | `string` | `"#ff0000"` | Burn marker color |
| `showBurns` | `boolean` | `false` | Show burn markers |
| `burnSize` | `number` | 200 | Burn marker size |
| `showLabels` | `boolean` | `false` | Show labels |
| `lineWidth` | `number` | 2 | Line width |

### TransferOrbitConfig

```ts
interface TransferOrbitConfig {
  initialRadius: number; // km
  finalRadius: number; // km
  type?: "hohmann" | "bi-elliptic";
  intermediateRadius?: number; // km (for bi-elliptic)
  mu?: number; // gravitational parameter (default: Earth's 398600 km³/s²)
}
```

### TransferOrbitData

```ts
interface TransferOrbitData {
  initialOrbit: THREE.Vector3[];
  finalOrbit: THREE.Vector3[];
  transferPaths: THREE.Vector3[][];
  burns: {
    position: THREE.Vector3;
    deltaV: number; // m/s
    label: string;
  }[];
  totalDeltaV: number; // m/s
  transferTime: number; // seconds
}
```

### TransferOrbitUtils

Utility functions for transfer orbit calculations:

```tsx
import { TransferOrbitUtils } from "@plexusui/transfer-orbit";

// Calculate Hohmann delta-V
const dvHohmann = TransferOrbitUtils.calculateHohmannDeltaV(7000, 42164);

// Calculate bi-elliptic delta-V
const dvBiElliptic = TransferOrbitUtils.calculateBiEllipticDeltaV(
  7000,
  42164,
  60000
);

// Compare transfers
const comparison = TransferOrbitUtils.compareTransfers(7000, 42164, 60000);

// Calculate optimal intermediate radius
const rb = TransferOrbitUtils.calculateOptimalIntermediateRadius(7000, 42164);

// Calculate orbital velocity
const v = TransferOrbitUtils.orbitalVelocity(7000, 398600);

// Generate full transfer data
const data = TransferOrbitUtils.generateTransferData({
  initialRadius: 7000,
  finalRadius: 42164,
  type: "hohmann",
});
```

## Examples

### LEO to GEO Transfer (Hohmann)

```tsx
<TransferOrbit
  config={{
    initialRadius: 6771, // ~400km altitude
    finalRadius: 42164, // GEO
    type: "hohmann",
  }}
  initialColor="#00ff00"
  finalColor="#0000ff"
  transferColor="#ffff00"
  showBurns
/>
```

**Result:**
- Burn 1: ~2,440 m/s
- Burn 2: ~1,470 m/s
- Total Δv: ~3,910 m/s
- Transfer time: ~5.25 hours

### LEO to Lunar Transfer (Bi-Elliptic)

```tsx
<TransferOrbit
  config={{
    initialRadius: 6771,
    finalRadius: 384400, // Lunar distance
    type: "bi-elliptic",
    intermediateRadius: 500000,
  }}
  showBurns
  showLabels
/>
```

### Interplanetary Transfer

```tsx
// Mars transfer (simplified)
<TransferOrbit
  config={{
    initialRadius: 149600, // Earth orbit (scaled)
    finalRadius: 227900, // Mars orbit (scaled)
    type: "hohmann",
    mu: 132712000000, // Sun's gravitational parameter
  }}
/>
```

### Dynamic Transfer Visualization

```tsx
function DynamicTransfer() {
  const [radius, setRadius] = useState(20000);

  return (
    <>
      <input
        type="range"
        min="10000"
        max="50000"
        value={radius}
        onChange={(e) => setRadius(Number(e.target.value))}
      />
      <Canvas>
        <TransferOrbit
          config={{
            initialRadius: 7000,
            finalRadius: radius,
            type: "hohmann",
          }}
          showBurns
        />
      </Canvas>
    </>
  );
}
```

## Transfer Types

### Hohmann Transfer

The **most fuel-efficient** two-impulse transfer between coplanar circular orbits. Uses two burns:

1. At periapsis of initial orbit (prograde)
2. At apoapsis of transfer orbit (prograde)

**Use when:** Minimizing delta-V for moderate orbit changes.

### Bi-Elliptic Transfer

A **three-impulse** transfer that can be more efficient than Hohmann for large orbit ratio changes (typically > 11.94). Uses three burns:

1. At periapsis of initial orbit (prograde)
2. At apoapsis of first transfer orbit (retrograde)
3. At periapsis of second transfer orbit (retrograde)

**Use when:** Final orbit radius >> initial orbit radius (large transfers).

## Physics

### Hohmann Delta-V

```
Δv₁ = √(μ/r₁) × (√(2r₂/(r₁+r₂)) - 1)
Δv₂ = √(μ/r₂) × (1 - √(2r₁/(r₁+r₂)))
Total Δv = Δv₁ + Δv₂
```

### Transfer Time

```
t = π × √(a³/μ)
where a = (r₁ + r₂) / 2
```

## Best Practices

1. **Use Hohmann for most transfers** - It's simpler and more efficient for orbit ratio < 12
2. **Consider bi-elliptic for very large changes** - Can save delta-V when going to high orbits
3. **Account for plane changes** - This component assumes coplanar orbits
4. **Use realistic gravitational parameters** - Default is Earth (398600 km³/s²)

## License

MIT
