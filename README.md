# Plexus UI

> The foundation for all future human-computer interaction for physical systems.

A primitive-first, WebGPU-powered component library for medical, aerospace, defense, and autonomous systems.

## Why Plexus UI?

**For Physical Systems:** Standard web UI libraries optimize for forms, dashboards, and CRUD apps. Plexus UI is purpose-built for real-time physical system visualization: medical devices, aircraft HUDs, autonomous vehicle perception, and defense systems.

**WebGPU-First:** True GPU compute shaders deliver 10x performance over WebGL. Render 1M+ data points at 60fps. Handle real-time sensor fusion with zero-copy buffer updates.

**Primitive-First Architecture:** You get the core WebGPU primitives and control the data pipeline. Maximum performance for deep-tech use cases. No black-box abstractions.

## Installation

```bash
npx @plexusui/cli init
npx @plexusui/cli add gantt-chart
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
2. **Composable Components** - Built on primitives, domain-specific (HUD, sensor fusion)
3. **Your Application** - Control data pipeline and rendering loop

This gives you maximum performance and control for mission-critical applications.

## Browser Support

- **Chrome/Edge:** 113+ (WebGPU stable)
- **Safari:** 18+ (WebGPU stable)
- **Firefox:** Experimental (behind flag)

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

Built with care for the deep-tech community. Inspired by UI design and real-time systems engineering.

---

**Questions?** Open an issue or reach out to [@annschulte](https://github.com/annschulte)
