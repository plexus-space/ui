# Plexus UI

> The foundation for all future human-computer interaction for physical systems.

A primitive-first, WebGPU-accelerated component library for physical systems.

## Why Plexus UI?

**For Physical Systems:** Standard web UI libraries optimize for forms, dashboards, and CRUD apps. Plexus UI is built for real-time physical system visualization: medical devices, aircraft HUDs, autonomous vehicle perception, and defense systems.

**GPU-Accelerated:** WebGPU and WebGL2 rendering pipelines for smooth 60fps visualization. Handle 100k+ data points in real-time. Zero-copy buffer updates for streaming sensor data.

**Primitive-First Architecture:** You get the core WebGPU primitives and control the data pipeline. Maximum performance for deep-tech use cases. No black-box abstractions.

## Installation

```bash
npx @plexusui/cli init
npx @plexusui/cli add line-chart
```

## Use Cases

- **Medical:** Surgical displays, patient monitoring, medical imaging
- **Aerospace:** Aircraft HUDs, mission control, flight simulation
- **Defense:** Radar displays, tactical maps, sensor fusion
- **Autonomous Vehicles:** Perception dashboards, sensor visualization
- **Industrial:** Vibration analysis, predictive maintenance, RF monitoring

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
2. **Composable Components** - Built on primitives
3. **Your Application** - Control data pipeline and rendering loop

This gives you maximum performance and control for mission-critical applications.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

Built with care. Inspired by UI design and real-time systems engineering.

---

**Questions?** Open an issue or reach out to [@annschulte](https://github.com/annschulte)
