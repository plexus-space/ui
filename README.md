# Plexus UI

> The foundation for all future human-computer interaction for physical systems.

A primitive-first, WebGPU-powered component library for medical, aerospace, defense, and autonomous systems. Built for real-time sensor fusion, HUD interfaces, and mission-critical visualization.

## Why Plexus UI?

**For Physical Systems:** Standard web UI libraries optimize for forms, dashboards, and CRUD apps. Plexus UI is purpose-built for real-time physical system visualization: medical devices, aircraft HUDs, autonomous vehicle perception, and defense systems.

**WebGPU-First:** True GPU compute shaders deliver 10x performance over WebGL. Render 1M+ data points at 60fps. Handle real-time sensor fusion with zero-copy buffer updates.

**Primitive-First Architecture:** You get the core WebGPU primitives and control the data pipeline. Maximum performance for deep-tech use cases. No black-box abstractions.

**Enterprise Ready:** Built for sensitive data, offline deployment, and compliance requirements (HIPAA, MIL-STD, DO-178C).

## Features

- **High-Performance Primitives:**

  - `WebGPULineRenderer` - 1M+ points @ 60fps
  - `WebGPUPointCloud` - 100k+ points @ 60fps (LiDAR, sensor data)
  - `MsfdTextRender` - GPU-accelerated text rendering (coming soon)
  - `WebGPUFFT` - Real-time FFT compute shaders (coming soon)

- **Sensor Fusion Components:**

  - Multi-layer visualization (LiDAR + camera + thermal)
  - Real-time coordinate transforms
  - Zero-copy buffer updates for minimal latency

- **HUD & Tactical Displays:**

  - Text rendering, reticles, heading tapes
  - Radar and sonar displays
  - Polar coordinate systems

- **TypeScript/Rust Native:**
  - Full type safety with dimensional analysis
  - Prevents unit conversion errors
  - Zero-copy data pipelines

## Installation

```bash
npm install @plexusui/components
```

Or use the CLI to copy components directly into your project:

```bash
npx @plexusui/cli init
npx @plexusui/cli add line-chart
```

## Quick Start

```tsx
import { LineChart } from "@plexusui/components";

function App() {
  const data = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
    { x: 3, y: 4 },
  ];

  return (
    <LineChart.Root
      series={[{ name: "Series 1", data, color: "#3b82f6" }]}
      width={800}
      height={400}
    >
      <LineChart.Container>
        <LineChart.Viewport>
          <LineChart.Grid />
          <LineChart.Axes />
          <LineChart.Lines /> {/* Auto-switches to WebGPU at 5k+ points */}
          <LineChart.Tooltip />
          <LineChart.Interaction />
        </LineChart.Viewport>
      </LineChart.Container>
    </LineChart.Root>
  );
}
```

## Performance

Plexus UI automatically switches to WebGPU when your data exceeds performance thresholds:

- **LineChart:** Switches to WebGPU at 5,000 points
- **PointCloud:** WebGPU-only, 100k+ points @ 60fps
- **Sensor Fusion:** Multiple layers with 100k+ total points @ 60fps

Graceful fallback to SVG/Canvas2D for smaller datasets and older browsers.

## Use Cases

- **Medical:** Surgical displays, patient monitoring, medical imaging
- **Aerospace:** Aircraft HUDs, mission control, flight simulation
- **Defense:** Radar displays, tactical maps, sensor fusion
- **Autonomous Vehicles:** Perception dashboards, sensor visualization
- **Industrial:** Vibration analysis, predictive maintenance, RF monitoring

## Enterprise Features

- **Offline-Capable:** Runs on air-gapped networks
- **Self-Hostable:** No CDN dependencies
- **Secure:** Zero telemetry, zero external API calls
- **Compliant:** Documentation for HIPAA, MIL-STD, DO-178C
- **Tested:** 90%+ code coverage, visual regression tests

## Documentation

- [Roadmap](./ROADMAP.md) - Development roadmap and future features
- [Examples](./playground/examples/) - Example components
- [API Reference](./packages/components/) - Component documentation

## Development

```bash
# Install dependencies
npm install

# Start playground
npm run dev

# Build all packages
npm run build

# Run tests
npm test
```

## Architecture

Plexus UI follows a **primitive-first** architecture:

1. **Core WebGPU Primitives** - Low-level rendering primitives (text, shapes, particles)
2. **Composable Components** - Built on primitives, domain-specific (HUD, sensor fusion)
3. **Your Application** - Control data pipeline and rendering loop

This gives you maximum performance and control for mission-critical applications.

## Browser Support

- **Chrome/Edge:** 113+ (WebGPU stable)
- **Safari:** 18+ (WebGPU stable)
- **Firefox:** Experimental (behind flag)

Graceful fallback to Canvas2D/SVG for older browsers.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

Built with care for the deep-tech community. Inspired by military/aerospace UI design and real-time systems engineering.

---

**Questions?** Open an issue or reach out to [@annschulte](https://github.com/annschulte)
