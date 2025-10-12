# Plexus UI Roadmap

> **Vision:** Components for deep tech, physics, and engineering. Beautiful, primitive-based building blocks for engineers across all disciplines.

## Guiding Principles

1. **Universal Engineering Tools** - Components that work across mechanical, electrical, chemical, aerospace, civil, robotics, and more
2. **Primitive-First Architecture** - Every component built from composable primitives
3. **Beautiful by Default** - Crafted, polished interfaces inspired by the best technical tools
4. **Scientific Accuracy** - Peer-reviewed algorithms, cited sources, correct math
5. **Performance Obsessed** - GPU acceleration, WebAssembly, optimal rendering
6. **TypeScript Native** - Full type safety with proper generics

## Phase 2: Scientific Charts & Analysis ✓ (Completed)

- [x] **Waterfall Plot** - 3D spectral analysis over time
- [x] **Spectrogram** - Time-frequency representation

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

## Phase 3: Network & System Architecture

- [ ] Node Graph Editor - Visual programming/system design
- [ ] Dataflow Visualizer - Signal routing between subsystems
- [ ] State Machine Diagram - Interactive FSM visualization
- [ ] Dependency Graph - System interdependencies
- [ ] Pipeline Monitor - Data processing stages

## Phase 4: Flight Dynamics & Astrodynamics

> **Goal:** STK-level accuracy for Earth and lunar mission analysis. Physics-based simulation with validated propagators, environmental models, and mission planning tools.

### Orbital Mechanics & Propagation

- [ ] **Orbit Propagator** - Multiple propagators (SGP4, J2, high-fidelity w/ perturbations)
- [ ] **Two-Body Problem** - Keplerian orbits with classical orbital elements
- [ ] **Orbital Elements Display** - Interactive visualization (a, e, i, Ω, ω, ν)
- [ ] **Ground Track Plotter** - Satellite path over Earth/Moon surface
- [ ] **3D Orbit Visualizer** - Real-time orbit animation with celestial bodies
- [ ] **Orbit Perturbations** - J2-J6, drag, SRP, third-body (Sun/Moon)
- [ ] **N-Body Simulator** - Multi-body gravitational interactions

### Trajectory Design & Optimization

- [ ] **Hohmann Transfer** - Optimal two-impulse orbital transfer
- [ ] **Bi-Elliptic Transfer** - Three-impulse high-altitude transfers
- [ ] **Lambert Solver** - Time-constrained trajectory between positions
- [ ] **Porkchop Plotter** - ΔV and flight time contours for transfers
- [ ] **Launch Window Calculator** - Optimal launch opportunities
- [ ] **Trajectory Optimizer** - Low-thrust spiral transfers, gradient methods
- [ ] **Gravity Assist Planner** - Swing-by trajectory design
- [ ] **Interplanetary Trajectories** - Earth-Moon transfers, L-point orbits
- [ ] **Landing Trajectory** - Powered descent guidance (lunar landing)

### Attitude Dynamics & Control

- [ ] **Attitude Visualizer** - 3D spacecraft orientation (quaternions/Euler)
- [ ] **Torque-Free Motion** - Rigid body dynamics, polhode/herpolhode
- [ ] **Gravity Gradient** - Torque from non-uniform gravity field
- [ ] **Momentum Exchange** - Reaction wheels, control moment gyros
- [ ] **Magnetic Torquers** - Dipole interaction with planetary field
- [ ] **Spin Stabilization** - Gyroscopic stability visualization
- [ ] **Three-Axis Stabilization** - Active control with actuators
- [ ] **Attitude Determination** - Sensor fusion (sun, star tracker, magnetometer)

### Ground Systems & Coverage

- [ ] **Ground Station Access** - Visibility windows and contact times
- [ ] **Coverage Analyzer** - Area coverage over time (swath, footprint)
- [ ] **Sensor FOV Projector** - Camera/instrument field of view on surface
- [ ] **Communication Link Budget** - RF link analysis with pointing
- [ ] **Constellation Designer** - Multi-satellite coverage optimization
- [ ] **Ground Track Repeat** - Sun-synchronous and repeat orbits
- [ ] **Station Keeping** - Orbit maintenance maneuver planning

### Environmental Models

- [ ] **Gravity Models** - EGM2008 (Earth), GRAIL (Moon) spherical harmonics
- [ ] **Atmospheric Density** - NRLMSISE-00, exponential models with drag
- [ ] **Solar Radiation Pressure** - Surface area, reflectivity, eclipse modeling
- [ ] **Magnetic Field** - IGRF, WMM for Earth; lunar magnetic anomalies
- [ ] **Eclipse Calculator** - Umbra/penumbra with cylindrical/conical shadow
- [ ] **Solar/Lunar Position** - High-precision ephemeris (JPL DE440)
- [ ] **Coordinate Frames** - ECI, ECEF, LVLH, RSW transformations

### Mission Analysis Tools

- [ ] **ΔV Budget Calculator** - Mission velocity requirements breakdown
- [ ] **Orbital Lifetime** - Decay prediction with atmospheric drag
- [ ] **Encounter Analyzer** - Close approach detection and geometry
- [ ] **Event Finder** - Apoapsis, periapsis, equator crossing, eclipse events
- [ ] **Access Reports** - Tabular visibility data with azimuth/elevation
- [ ] **Maneuver Planner** - Burn timing, direction, magnitude optimizer
- [ ] **Orbit Determination** - Least-squares fitting from observations

---

## Phase 5: Simulation & Dynamics

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

### Mechanical Systems

- [ ] **Robot Kinematics** - Forward/inverse kinematics, Denavit-Hartenberg parameters
- [ ] Constraint-based Physics - Joints, motors, limits (useful for mechanisms)
- [ ] Soft Body Dynamics - Deformable objects, cloth, cables

---

## Phase 6: Control Systems & Signals

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

## Phase 7: Sensor & Instrumentation

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

- [ ] Radar Display - PPI (Plan Position Indicator) scope, range-doppler
- [ ] Sonar Waterfall - Acoustic returns over time
- [ ] Thermal Camera View - False color temperature mapping

## Phase 8: Interactive Controls & UI

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

## Phase 9: Advanced Geometry & CAD

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

## Phase 10: Math & Algebra

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

## Phase 11: Developer Experience (Ongoing)

### Documentation Site

- [ ] **Interactive Playground** - CodeSandbox-style editor
- [ ] **Component API Explorer** - Auto-generated docs
- [ ] **Physics Explainers** - Educational content
- [ ] **Use Case Gallery** - Real-world examples
- [ ] **Performance Benchmarks** - Component performance data

### Testing & Quality

- [ ] **Accessibility Audit** - WCAG 2.1 AA compliance
- [ ] **Performance Profiler** - Frame rate monitoring
