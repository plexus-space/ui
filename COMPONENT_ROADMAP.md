# Plexus UI Aerospace - Component Roadmap

> A comprehensive list of components needed for a complete aerospace & physics UI system.

## Current Status

### ✅ Implemented

- **Planetary Bodies**: Earth, Mars, Mercury, Venus, Moon, Jupiter, Saturn, Uranus, Neptune
- **Charts**: Gantt (Timeline visualization)
- **Infrastructure**: CLI tool, Showcase app, Monorepo structure

---

## Recommended Components

### 🌍 Visual Components (3D with React Three Fiber)

#### Orbital Mechanics

- [x] **OrbitalPath** - Elliptical orbit visualization with Keplerian elements
- [x] **GroundTrack** - Satellite ground path overlay on planetary surface
- [x] **Trajectory** - Flight path with waypoints and burn markers
- [x] **TransferOrbit** - Hohmann/bi-elliptic transfer visualization
- [x] **LaGrangePoints** - L1-L5 equilibrium points in multi-body systems

#### Coordinate Systems & Reference Frames

- [ ] **CoordinateFrame** - XYZ axes with labels and grid planes
- [ ] **InertialFrame** - ECI/ECEF reference frame visualization
- [ ] **OrbitingFrame** - Rotating reference frame (e.g., Hill frame)
- [ ] **AttitudeIndicator** - 3D spacecraft orientation display
- [ ] **Gimbal** - 3-axis rotation visualization
- [ ] **GroundMarker** - launch site, ground station, landing site

---

### 📊 Chart Components (2D with HTML/CSS)

#### Orbital Analysis

- [ ] **OrbitPlot** - 2D orbital elements plot (a, e, i, Ω, ω, ν)
- [ ] **PorkchopPlot** - Launch window analysis (C3 vs departure/arrival)
- [ ] **PhaseAnglePlot** - Planetary alignment for transfers
- [ ] **GroundTrackChart** - 2D Mercator ground track map
- [ ] **ApsisChart** - Apogee/perigee history over time

#### Telemetry & Monitoring

- [ ] **TelemetryGraph** - Real-time multi-line time-series data
- [ ] **ParameterStrip** - Scrolling parameter history (like oscilloscope)
- [ ] **HistogramChart** - Distribution analysis
- [ ] **ScatterPlot** - Correlation analysis between parameters
- [ ] **HeatmapChart** - 2D density visualization

#### Visibility & Communication

- [ ] **HorizonPlot** - Satellite visibility periods (AOS/LOS)
- [ ] **AccessTimeline** - Communication window timeline
- [ ] **DopplerChart** - Frequency shift over pass
- [ ] **SignalStrengthChart** - RSSI/SNR over time
- [ ] **LinkBudgetChart** - Communication link margins

#### Spectrum & Signal

- [ ] **WaterfallPlot** - Frequency vs time spectrogram
- [ ] **SpectrumAnalyzer** - FFT frequency domain display
- [ ] **ConstellationDiagram** - IQ signal constellation
- [ ] **PolarPlot** - Antenna/radar polar visualization
- [ ] **EyeDiagram** - Signal quality visualization

#### Navigation & Attitude

- [ ] **AttitudeTimeline** - Euler angles/quaternions over time
- [ ] **GyroPlot** - Angular rate history
- [ ] **AccelerometerPlot** - Linear acceleration history
- [ ] **EphemerisPlot** - Position/velocity state vectors

---

### 🎛️ Control & HUD Components

#### Status & Indicators

- [ ] **StatusPanel** - Multi-parameter system health grid
- [ ] **ProgressRing** - Circular progress indicator
- [ ] **AlertBanner** - Warning/caution/advisory messages
- [ ] **ThrottleGauge** - Engine throttle percentage
- [ ] **BatteryIndicator** - Power level with charging state
- [ ] **TemperatureGauge** - Thermal state indicator
- [ ] **SignalIndicator** - Communication link quality

---
