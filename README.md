# Plexus UI

> GPU-accelerated component library for physical systems.

A primitive-first, WebGPU-accelerated component library for real-time visualization of physical systems.

## Why Plexus UI?

**For Physical Systems:** Standard web UI libraries optimize for forms, dashboards, and CRUD apps. Plexus UI is built for real-time physical system visualization: medical devices, aircraft HUDs, robotics, and industrial monitoring.

**GPU-Accelerated:** WebGPU and WebGL2 rendering pipelines for smooth 60fps visualization. Handle 100k+ data points in real-time. Zero-copy buffer updates for streaming sensor data.

**Primitive-First Architecture:** You get the core rendering primitives and control the data pipeline. Maximum performance for deep-tech use cases. No black-box abstractions.

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/annschulte/plexus-ui.git
cd plexus-ui
npm install

# Run playground with demos
cd playground
npm run dev
```

Open http://localhost:3000 to see live demos.

---

## Features

**All components:**

- ✅ Render 100k+ points at 60fps
- ✅ Zero-copy buffer updates
- ✅ Automatic axis scaling
- ✅ Dark mode support
- ✅ TypeScript + React

### 🔌 Real-Time Data Connectors

**Connect to Raspberry Pi sensors in 2 clicks:**

```tsx
import { useRaspberryPi } from "@plexusui/components/lib/connectors";
import { LineChart } from "@plexusui/components/charts";

function SensorDashboard() {
  // Step 1: Connect to your Pi
  const { data, status } = useRaspberryPi("raspberrypi.local");

  // Step 2: Visualize
  return (
    <LineChart series={[{ name: "Temperature", data: data?.temperature }]} />
  );
}
```

**What's included:**

- ✅ **WebSocketConnector** - Real-time streaming (WebSocket)
- ✅ **HTTPConnector** - Polling REST APIs
- ✅ **RaspberryPiConnector** - Super-simple Pi integration
- ✅ **React Hooks** - `useRaspberryPi`, `useWebSocket`, `useHTTP`
- ✅ **Auto-reconnect** - Built-in connection management
- ✅ **TypeScript** - Fully typed data streams

**Coming soon:**

- 🚧 **MAVLinkConnector** - Drones (PX4, ArduPilot)
- 🚧 **SerialConnector** - USB/Serial devices (Arduino, embedded)
- 🚧 **MQTTConnector** - IoT telemetry

**[→ Full Documentation](./packages/components/lib/connectors/README.md)**

### 🎬 Smooth Animations

**Spring-based animations for data transitions (no dependencies):**

```tsx
import { useAnimatedData } from "@plexusui/components/lib/animations";
import { LineChart } from "@plexusui/components/charts";

function AnimatedChart() {
  const [rawData, setRawData] = useState(sensorData);

  // Smooth spring animation on data updates
  const animatedData = useAnimatedData(rawData, {
    stiffness: 170,
    damping: 26,
  });

  return <LineChart series={[{ name: "Sensor", data: animatedData }]} />;
}
```

**What's included:**

- ✅ **useSpring** - Animate single values
- ✅ **useAnimatedData** - Animate entire datasets
- ✅ **useStaggeredSpring** - Staggered animations
- ✅ **Custom easing** - Linear, quad, cubic, custom functions
- ✅ **Zero dependencies** - Pure TypeScript/React

### 📦 Bundle Optimization

**3D components are code-split by default:**

```tsx
// ✅ Good: Only loads 2D charts (~50KB)
import { LineChart, BarChart } from "@plexusui/components/charts";

// ✅ Good: Only loads Three.js when needed
import { PointCloudViewer } from "@plexusui/components/charts/3d";

// ❌ Bad: Loads everything including Three.js (~500KB)
// (This is now prevented - 3D components are in separate entry)
```

**Bundle sizes:**

- 2D Charts only: ~50-80KB gzipped
- 3D Charts: +~400KB (Three.js)
- Connectors: +~5KB

---

## Component Examples

### Line Chart - Streaming ECG

```tsx
import { LineChart } from "@plexusui/components/charts/line-chart";

<LineChart
  series={[
    {
      name: "Heart Rate",
      color: "#ef4444",
      data: heartRateData, // Array of {x, y} points
    },
  ]}
  width={800}
  height={400}
  showGrid
  showAxes
  timeAxis
  yAxis={{ domain: [50, 110], label: "BPM" }}
/>;
```

### Attitude Indicator - Aviation Display

```tsx
import { AttitudeIndicator } from "@plexusui/components/charts/attitude-indicator";

<AttitudeIndicator
  pitch={pitchDegrees}
  roll={rollDegrees}
  showSlipSkid
  width={400}
  height={400}
/>;
```

### Chart Minimap - Navigate Large Datasets

```tsx
import {
  ChartMinimap,
  MinimapContainer,
  LineChart,
  BarChart,
} from "@plexusui/components/charts";

const [visibleRange, setVisibleRange] = useState({
  start: oneYearAgo,
  end: now,
});

<MinimapContainer
  gap={20}
  minimap={
    <ChartMinimap
      series={fullDataset}
      visibleRange={visibleRange}
      fullRange={{ min: dataStart, max: dataEnd }}
      onRangeChange={(start, end) => setVisibleRange({ start, end })}
      ChartComponent={LineChart.Root}
      CanvasComponent={LineChart.Canvas}
      formatLabel={(timestamp) => new Date(timestamp).toLocaleDateString()}
      height={100}
      maxPoints={500}
      downsampleMethod="minmax"
    />
  }
>
  <BarChart series={filteredData} width="100%" height={400} showTooltip />
</MinimapContainer>;
```

**Features:**

- Automatic downsampling (LTTB or MinMax algorithms)
- Draggable range selector with handles
- Works with any chart type (Line, Bar, Scatter, etc.)
- Date/value labels on selection boundaries
- Smooth 60fps interaction

---

## Use Cases

### 🏭 Industrial IoT

**Predictive Maintenance Dashboard**

- Vibration FFT analysis
- Temperature trends monitoring
- Motor speed tracking
- Real-time alerts

Components: Line Chart,

### ✈️ Aerospace

**Flight Test Monitoring**

- Attitude indicator (pitch/roll/yaw)
- Airspeed, altitude displays
- Engine parameters
- G-force visualization

Components: Attitude Indicator, Line Charts

### 🤖 Robotics

**Robot Telemetry Dashboard**

- Joint positions and velocities
- Battery monitoring
- IMU data visualization
- Sensor arrays

Components: Bar Charts, Line Charts, Heatmaps

### 🏥 Medical Devices

**Patient Monitoring**

- ECG waveform streaming
- Heart rate, SpO2, blood pressure
- Vital signs tracking
- Historical trends

Components: Line Charts,

### 🚗 Automotive

**Vehicle Diagnostics**

- Engine RPM, temperature
- Battery voltage, fuel level
- CAN bus data visualization
- Error monitoring

Components: Bar Charts, Line Charts

---

## Architecture

### GPU Rendering (WebGPU + WebGL2)

All charts use dual rendering:

- **WebGPU** for modern browsers (Chrome 113+, Edge 113+)
- **WebGL2** fallback for older browsers
- Zero-copy buffer updates for streaming data
- Instanced rendering for 100k+ points

### React Components

Components are designed to be copied into your project:

```tsx
import { LineChart } from "@plexusui/components/charts/line-chart";
// Use them in your app
<LineChart series={data} width={800} height={400} />;
```

**Benefits:**

- Full control over the code
- No NPM dependency issues
- Customize as needed
- Copy only what you use

### Technology Stack

- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS + Radix UI
- **Rendering**: Three.js + react-three-fiber
- **Language**: TypeScript
- **Build**: Turborepo monorepo

---

## Project Structure

```
plexus-ui/
├── packages/
│   ├── components/          # All chart components
│   │   ├── charts/          # Individual chart components
│   │   └── lib/             # Utilities, connectors, color scales
│   └── cli/                 # CLI tool (coming soon)
│
└── playground/              # Interactive demos
    ├── app/                 # Next.js app with 4 dashboards
    ├── examples/            # 17 individual component examples
    └── components/          # Demo UI components
```

---

## Playground Demos

The playground includes 6 interactive dashboards showcasing real-time streaming data:

1. **Live Audio** - Real-time microphone input with GPU-accelerated FFT spectrogram, frequency analysis, and statistical aggregation
2. **Motion Detection** - Camera-based motion heatmap with 20x20 grid tracking and historical analysis
3. **Device Tilt** - Real-time gyroscope/accelerometer data visualized with aviation attitude indicator
4. **Health Monitoring** - ECG, EEG, vital signs simulation
5. **Robotics** - Motor speeds, battery cells, sensor arrays
6. **Energy Management** - Power consumption, solar generation

Plus 17 individual component examples in `/examples/*`.

---

## Component Library

### Available Components (16 total)

**Charts:**

- Line Chart
- Scatter Chart
- Bar Chart
- Area Chart
- Histogram Chart
- Heatmap Chart
- Radar Chart

**Instruments:**

- Attitude Indicator

**Data Display:**

- Data Grid
- Gantt Chart

**3D Visualization:**

- 3D Model Viewer
- Point Cloud Viewer

### Shared Utilities

- Color scales (viridis, plasma, inferno, turbo, etc.)
- Data utilities (LTTB downsampling, FFT, binning)
- Point cloud loaders (XYZ, PCD, LAS)
- Timezone utilities

---

## Contributing

We love contributions!

**Quick ways to contribute:**

- ⭐ Star this repo
- 🐛 Report bugs via [GitHub Issues](https://github.com/annschulte/plexus-ui/issues)
- 💡 Request features via [Discussions](https://github.com/annschulte/plexus-ui/discussions)
- 📝 Improve documentation
- 🎨 Build example dashboards
- 🔧 Submit PRs for bug fixes or new components

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Built With Plexus UI

**Share your project!** Open a PR to add your project here.

<!-- Coming soon: showcase of real-world projects -->

---

## Roadmap

**Next up:**

- 🚧 CLI tool for easy component installation
- 🚧 More data connectors (WebSocket, MAVLink, Serial)
- 🚧 Additional chart types (polar, sankey, treemap)
- 🚧 Mobile/touch optimization
- 🚧 Accessibility improvements

**Future:**

- Plugin system for custom renderers
- Theme customization UI
- Real-time collaboration features
- Cloud deployment templates

---

**Made with Care**

Questions? Reach out to [@annschulte](https://github.com/annschulte)
