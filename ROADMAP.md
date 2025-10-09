# Plexus UI Roadmap

> **Vision:** The shadcn for deep tech, physics, and engineering. Beautiful, primitive-based building blocks for engineers across all disciplines.

---

## Guiding Principles

1. **Universal Engineering Tools** - Components that work across mechanical, electrical, chemical, aerospace, civil, robotics, and more
2. **Primitive-First Architecture** - Every component built from composable primitives
3. **Beautiful by Default** - Crafted, polished interfaces inspired by the best technical tools
4. **Scientific Accuracy** - Peer-reviewed algorithms, cited sources, correct math
5. **Copy, Don't Install** - Maintain shadcn's philosophy of code ownership
6. **Performance Obsessed** - GPU acceleration, WebAssembly, optimal rendering
7. **TypeScript Native** - Full type safety with proper generics

---

## Phase 1: Foundation & Data Visualization (Current → Q1 2026)

### Core Primitives ✓ (Completed)

- [x] Sphere with texture support
- [x] Animation system (spring physics, easing)
- [x] Physics integrators (Euler, Verlet, RK4)
- [x] GPU rendering & compute
- [x] Visual effects (bloom, glow, atmosphere)

### Chart Components ✓ (Completed)

- [x] Line Chart (multi-series, zoom, real-time)
- [x] Polar Plot (radiation patterns, directional data)
- [x] Heatmap (2D scalar fields)
- [x] Gantt Chart (timelines, schedules)

### Enhance Existing Charts

- [ ] **Scatter Plot** - 2D/3D point clouds with clustering
- [ ] **Bar Chart** - Horizontal/vertical with stacking
- [ ] **Histogram** - Distribution analysis with bins
- [ ] **Box Plot** - Statistical distribution visualization
- [ ] **Violin Plot** - Probability density visualization

---

## Phase 2: Scientific Charts & Analysis (Q1-Q2 2026)

### Frequency Domain Analysis

- [ ] **Bode Plot** - Frequency response (magnitude + phase)
- [ ] **Nyquist Plot** - Stability analysis for control systems
- [ ] **Waterfall Plot** - 3D spectral analysis over time
- [ ] **Spectrogram** - Time-frequency representation

### Statistical & Distribution

- [ ] **Probability Plot** - QQ plots, probability distributions
- [ ] **Contour Plot** - 2D level sets and gradients
- [ ] **Cumulative Distribution** - CDF visualization
- [ ] **Residual Plot** - Error analysis and diagnostics

### Engineering-Specific

- [ ] **Smith Chart** - RF impedance matching
- [ ] **Moody Chart** - Friction factor for pipe flow
- [ ] **Psychrometric Chart** - Air properties for HVAC
- [ ] **Phase Diagram** - Material phase transitions

---

## Phase 3: 3D Visualization Primitives (Q2-Q3 2026)

### 3D Plotting & Fields

- [ ] **Surface Plot** - 3D function visualization (z = f(x,y))
- [ ] **Isosurface Renderer** - 3D scalar field level sets
- [ ] **Vector Field** - 2D/3D arrow fields (velocity, force, gradient)
- [ ] **Streamline Renderer** - Flow visualization
- [ ] **Volume Renderer** - Volumetric data (medical imaging, CFD)

### Geometric Primitives

- [ ] **Mesh Renderer** - Import/display STL, OBJ files
- [ ] **Point Cloud** - LiDAR, scanning data
- [ ] **Parametric Surfaces** - Torus, Klein bottle, custom equations
- [ ] **Constructive Solid Geometry** - Boolean operations on 3D shapes

### Annotations & Measurements

- [ ] **3D Axis System** - Coordinate frames with labels
- [ ] **Dimension Lines** - Engineering drawing style measurements
- [ ] **Annotation Labels** - Callouts and markers in 3D space
- [ ] **Grid Planes** - Reference planes (XY, YZ, XZ)

---

## Phase 4: Simulation & Dynamics (Q3-Q4 2026)

### Physics Simulation

- [ ] **Rigid Body Simulator** - 6-DOF dynamics with collision
- [ ] **Spring-Mass-Damper** - Interactive mechanical systems
- [ ] **Pendulum Variants** - Simple, double, spherical, chaotic
- [ ] **Particle System** - N-body simulation with forces

### Fluid & Thermal

- [ ] **Particle Flow** - 2D fluid simulation with obstacles
- [ ] **Heat Transfer** - Conduction, convection, radiation visualization
- [ ] **Shock Wave Visualizer** - Supersonic flow patterns
- [ ] **Temperature Field** - Thermal distribution over geometry

### Material Behavior

- [ ] **Stress-Strain Visualizer** - Material testing curves
- [ ] **Deformation Simulator** - FEA-style displacement
- [ ] **Fatigue Curve** - S-N diagrams for material life
- [ ] **Phase Transformation** - Material state changes

---

## Phase 5: Control Systems & Signals (Q4 2026 → Q1 2027)

### Control Theory

- [ ] **PID Controller Widget** - Interactive tuning (Kp, Ki, Kd)
- [ ] **Root Locus Plotter** - Pole-zero movement visualization
- [ ] **State Space Visualizer** - Phase portraits and trajectories
- [ ] **Block Diagram Editor** - Visual control system design
- [ ] **Transfer Function Display** - Pole-zero maps

### Signal Processing

- [ ] **Oscilloscope** - Time-domain waveform display
- [ ] **Spectrum Analyzer** - FFT with peak detection
- [ ] **Filter Designer** - IIR/FIR filter visualization
- [ ] **Correlation Plot** - Auto/cross-correlation
- [ ] **Convolution Visualizer** - Interactive convolution demo

### Adaptive & Optimal Control

- [ ] **Kalman Filter Simulator** - State estimation with noise
- [ ] **LQR Visualizer** - Optimal control trajectories
- [ ] **MPC Planner** - Model predictive control
- [ ] **Adaptive Control Demo** - MRAC, L1 adaptive

---

## Phase 6: Sensor & Instrumentation (Q1-Q2 2027)

### Sensor Visualizations

- [ ] **IMU Display** - Accelerometer + gyroscope + magnetometer
- [ ] **Attitude Indicator** - Artificial horizon (roll, pitch, yaw)
- [ ] **Compass Rose** - Heading display with cardinal directions
- [ ] **Altimeter** - Barometric altitude with tape display
- [ ] **Variometer** - Vertical speed indicator

### Position & Navigation

- [ ] **GPS Constellation View** - Satellite visibility and DOP
- [ ] **Ground Track Plotter** - Position on 2D map
- [ ] **Trajectory Overlay** - Path on geographic projection

### Scientific Instruments

- [ ] **Spectrometer** - Wavelength vs intensity
- [ ] **Chromatography** - Separation peaks over time
- [ ] **Oscilloscope (Analog Style)** - Vintage CRT aesthetic
- [ ] **Multimeter Display** - Digital/analog hybrid

### Point Cloud & Scanning

- [ ] **LiDAR Renderer** - Real-time point cloud streaming
- [ ] **SLAM Visualizer** - Simultaneous localization and mapping
- [ ] **Depth Map** - Distance to surface visualization

---

## Phase 7: Interactive Controls & UI (Q2-Q3 2027)

### Sliders & Inputs

- [ ] **Engineering Slider** - Unit-aware with precision control
- [ ] **Dual Slider** - Range selection
- [ ] **Radial Slider** - Circular/arc-based input
- [ ] **Joystick** - 2D input control

### Dials & Gauges

- [ ] **Gauge** - Circular gauge (pressure, temperature, speed)
- [ ] **Linear Gauge** - Bar/thermometer style
- [ ] **LED Array** - Binary/level indicators
- [ ] **Seven-Segment Display** - Retro numeric display

### Panels & Layouts

- [ ] **Instrument Panel** - Aviation-style layout
- [ ] **Mission Control Dashboard** - Multi-widget container
- [ ] **Split Timeline** - Synchronized multi-track timelines
- [ ] **Tabbed Data View** - Technical data tables with sorting

---

## Phase 8: Advanced Geometry & CAD (Q3-Q4 2027)

### CAD Primitives

- [ ] **Sketch Editor** - 2D constraint-based drawing
- [ ] **Extrude/Revolve** - 2D to 3D operations
- [ ] **Fillet/Chamfer** - Edge modifications
- [ ] **Pattern Tools** - Linear/circular patterns

### Assembly & Constraints

- [ ] **Exploded View** - Animated assembly breakdown
- [ ] **Kinematic Chain** - Linked joints and members
- [ ] **Constraint Solver** - Geometric constraint satisfaction

### Analysis Overlays

- [ ] **FEA Overlay** - Stress/displacement on mesh
- [ ] **Modal Analysis** - Vibration mode shapes
- [ ] **CFD Streamlines** - Flow over imported geometry

---

## Phase 9: Math & Algebra (Q4 2027 → Q1 2028)

### Equation Visualization

- [ ] **Function Plotter** - 2D/3D parametric equations
- [ ] **Implicit Surface** - F(x,y,z) = 0 visualization
- [ ] **Complex Function** - Domain coloring for complex analysis
- [ ] **Taylor Series** - Approximation animation

### Linear Algebra

- [ ] **Matrix Visualizer** - Transform visualization
- [ ] **Eigenvalue Display** - Eigenvectors in 2D/3D
- [ ] **SVD Visualizer** - Singular value decomposition
- [ ] **Linear Transform** - Interactive matrix operations

### Calculus

- [ ] **Derivative Visualizer** - Tangent lines and slopes
- [ ] **Integral Visualizer** - Area under curve
- [ ] **Gradient Field** - Direction of steepest ascent
- [ ] **Divergence/Curl** - Vector calculus operators

---

## Phase 10: Developer Experience (Ongoing)

### Enhanced CLI

- [ ] **Fuzzy Search** - Find components by keywords
- [ ] **Dependency Graph** - Visualize component relationships
- [ ] **Update Manager** - Diff and update components
- [ ] **Theme Generator** - Create custom color schemes
- [ ] **Component Wizard** - Interactive component creation

### Documentation Site

- [ ] **Interactive Playground** - CodeSandbox-style editor
- [ ] **Component API Explorer** - Auto-generated docs
- [ ] **Physics Explainers** - Educational content
- [ ] **Use Case Gallery** - Real-world examples
- [ ] **Performance Benchmarks** - Component performance data

### Testing & Quality

- [ ] **Accessibility Audit** - WCAG 2.1 AA compliance
- [ ] **Performance Profiler** - Frame rate monitoring

---

## Phase 11: Ecosystem & Integrations

### Templates & Starters

- [ ] **Mission Control Dashboard** - Multi-panel layout
- [ ] **Robotics Dashboard** - Robot state visualization
- [ ] **Flight Simulator HUD** - Head-up display
- [ ] **Laboratory Data Logger** - Scientific data collection
- [ ] **Manufacturing Monitor** - Production line status

### External Integrations

- [ ] **Python Bridge** - NumPy/SciPy via WebSocket
- [ ] **MATLAB Gateway** - Import data from MATLAB
- [ ] **ROS Integration** - Robot Operating System topics
- [ ] **Unity/Unreal Export** - Game engine compatibility
- [ ] **CAD Import** - STEP, IGES file support

### Advanced Features

- [ ] **Real-time Collaboration** - Multi-user editing
- [ ] **WebXR Support** - VR/AR visualization
- [ ] **Offline Mode** - Service worker caching
- [ ] **Mobile Optimized** - Touch-friendly controls
