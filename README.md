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
```

### Add Components

```bash
npx @plexusui/cli add auto-dashboard
npx @plexusui/cli add waterfall-chart
npx @plexusui/cli add control-chart
```

### Use Natural Language

```tsx
import { AutoDashboard } from "@/components/lib/auto-dashboard";

export default function Dashboard() {
  return (
    <AutoDashboard
      query="Show me vibration FFT with bearing fault detection"
      dataSource={{
        type: "websocket",
        url: "ws://localhost:8080/sensors",
      }}
      onAlert={(alert) => console.log(alert)}
    />
  );
}
```

**That's it.** The dashboard auto-generates, connects to your data, and starts detecting anomalies.

---

## Features

### 🎨 16 GPU-Accelerated Components

```bash
# Time series & signals
npx @plexusui/cli add line-chart
npx @plexusui/cli add waterfall-chart
npx @plexusui/cli add control-chart

# Statistical & quality
npx @plexusui/cli add histogram
npx @plexusui/cli add scatter-plot
npx @plexusui/cli add heatmap-chart

# Aerospace & defense
npx @plexusui/cli add attitude-indicator
npx @plexusui/cli add compass-rose
npx @plexusui/cli add 3d-model-viewer

# Industrial & monitoring
npx @plexusui/cli add gauge
npx @plexusui/cli add status-grid
npx @plexusui/cli add gantt
```

**All components:**

- Render 100k+ points at 60fps
- Zero-copy buffer updates
- Automatic axis scaling
- Dark mode support
- TypeScript + React

### 🤖 AI-Powered Dashboard Generation

```tsx
// Describe your dashboard in plain English
<AutoDashboard
  query="Monitor motor temperature, vibration, and speed with alerts if temperature exceeds 80°C"
  dataSource={{ type: "serial", port: "/dev/ttyUSB0", baudRate: 115200 }}
/>
```

Plexus UI automatically:

- ✅ Parses your intent (temperature, vibration, speed)
- ✅ Selects appropriate charts (line, gauge, status)
- ✅ Generates responsive layout
- ✅ Connects to your data source
- ✅ Sets up alert rules (temp > 80°C)

### 🔌 Universal Data Connectors

Connect to any data source:

```tsx
// WebSocket (most common)
dataSource={{ type: "websocket", url: "ws://localhost:8080" }}

// Serial / USB (embedded systems)
dataSource={{ type: "serial", port: "/dev/ttyUSB0", baudRate: 115200 }}

// HTTP Polling (REST APIs)
dataSource={{ type: "http", url: "https://api.example.com/sensors", interval: 1000 }}

// Server-Sent Events (SSE)
dataSource={{ type: "sse", url: "https://api.example.com/stream" }}

// Simulation (demos)
dataSource={{ type: "simulation", generator: () => ({ value: Math.random() }) }}
```

All connectors support:

- Automatic reconnection
- Backpressure handling
- Error recovery
- Connection status indicators

### 🧠 Built-In Intelligence (Free Tier)

#### Rules Engine

```tsx
import { SimpleRulesEngine } from "@/components/lib/rules-engine";

const engine = new SimpleRulesEngine();

engine.addRule({
  id: "high-temp",
  metricId: "temperature",
  condition: "greater_than",
  threshold: 80,
  severity: "critical",
  message: "Motor overheating",
});

engine.evaluate({ temperature: 85 });
// → { triggered: true, severity: "critical", message: "Motor overheating" }
```

**Free features:**

- Threshold rules (>, <, =, between, outside)
- Multiple metrics
- Custom severity levels
- Alert throttling

#### Anomaly Detection

```tsx
import { StatisticalAnomalyDetector } from "@/components/lib/anomaly-detection";

const detector = new StatisticalAnomalyDetector();

detector.addDataPoint({ temperature: 85 });
// → { type: "spike", severity: "high", confidence: 0.95 }
```

**Free features:**

- Spike detection (Z-score)
- Drift detection (sliding window)
- Flatline detection (sensor failures)
- Statistical confidence scores

#### Root Cause Analysis

```tsx
import { BasicRootCauseAnalyzer } from "@/components/lib/root-cause-analysis";

const analyzer = new BasicRootCauseAnalyzer();

const rootCause = analyzer.analyze(
  { type: "spike", metricId: "vibration" },
  { temperature: 85, speed: 3600, vibration: 12 }
);
// → {
//   primary: { cause: "bearing_fault", confidence: 0.85 },
//   recommendation: "Inspect bearing for wear. Check lubrication."
// }
```

**Free features:**

- Temporal correlation
- Domain-specific patterns (bearing faults, sensor failures)
- Confidence scoring
- Actionable recommendations

---

## Use Cases

### 🏭 Industrial IoT

**Predictive Maintenance Dashboard**

- Vibration FFT analysis (bearing fault detection)
- Temperature trends with anomaly alerts
- Motor speed monitoring
- Automated failure diagnosis

```tsx
<AutoDashboard
  query="Monitor CNC machine vibration with bearing fault detection and temperature alerts"
  dataSource={{ type: "websocket", url: "ws://factory.local:8080/cnc-01" }}
/>
```

### ✈️ Aerospace

**Flight Test Monitoring**

- Attitude indicator (pitch/roll/yaw)
- Airspeed, altitude, vertical speed
- Engine parameters (EGT, RPM, fuel flow)
- G-force visualization

```tsx
<AutoDashboard
  query="Show aircraft attitude, airspeed, altitude, and engine parameters"
  dataSource={{ type: "serial", port: "/dev/ttyUSB0", baudRate: 115200 }}
/>
```

### 🤖 Robotics

**Robot Telemetry Dashboard**

- Joint positions and velocities
- Battery voltage and current
- IMU data (accelerometer, gyroscope)
- 3D robot model with real-time pose

```tsx
<AutoDashboard
  query="Display robot joint positions, battery status, and 3D model"
  dataSource={{ type: "websocket", url: "ws://robot.local:9090" }}
/>
```

### 🏥 Medical Devices

**Patient Monitoring**

- ECG waveform (real-time)
- Heart rate, SpO2, blood pressure
- Alert rules for abnormal vitals
- Historical trend analysis

```tsx
<AutoDashboard
  query="Monitor ECG, heart rate, SpO2 with alerts for abnormal values"
  dataSource={{ type: "websocket", url: "ws://monitor.local:3000" }}
/>
```

### 🚗 Automotive

**Vehicle CAN Bus Dashboard**

- Engine RPM, coolant temp, throttle position
- Battery voltage, fuel level
- Error code detection
- OBD-II diagnostics

```tsx
<AutoDashboard
  query="Show engine RPM, temperature, battery voltage from CAN bus"
  dataSource={{ type: "serial", port: "/dev/ttyUSB0", baudRate: 500000 }}
/>
```

---

## Architecture

Plexus UI is built on three layers:

### 1. GPU Rendering (WebGPU + WebGL2)

All charts use dual rendering:

- **WebGPU** for modern browsers (Chrome 113+, Edge 113+)
- **WebGL2** fallback for older browsers
- Zero-copy buffer updates for streaming data
- Instanced rendering for 100k+ points

### 2. React Components (shadcn-style)

```tsx
// Copy components into your project
npx @plexusui/cli add waterfall-chart

// Import and use
import { WaterfallChart } from "@/components/charts/waterfall-chart"

<WaterfallChart
  data={fftData}
  width={800}
  height={600}
  colormap="viridis"
/>
```

**No NPM dependencies.** Components are copied into your codebase for full control.

### 3. Intelligence Layer

```tsx
// All intelligence features work standalone
import {
  SimpleRulesEngine,
  StatisticalAnomalyDetector,
  BasicRootCauseAnalyzer,
} from "@/components/lib";

// Or use the integrated auto-dashboard
import { AutoDashboard } from "@/components/lib/auto-dashboard";
```

## Contributing

We love contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Quick ways to contribute:**

- ⭐ Star this repo
- 🐛 Report bugs via [GitHub Issues](https://github.com/annschulte/plexus-ui/issues)
- 💡 Request features via [Discussions](https://github.com/annschulte/plexus-ui/discussions)
- 📝 Improve documentation
- 🎨 Build example dashboards

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Built With Plexus UI

**Share your project!** Open a PR to add your project here.

<!-- Coming soon: showcase of real-world projects -->

---

**Made with Care**

Questions? Reach out to [@annschulte](https://github.com/annschulte)
