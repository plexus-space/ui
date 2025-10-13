# Plexus UI Roadmap

> **Vision:** Components for deep tech, physics, and engineering. Beautiful, primitive-based building blocks for engineers across all disciplines.

## Guiding Principles

1. **Universal Engineering Tools** - Components that work across mechanical, electrical, chemical, aerospace, civil, robotics, and more
2. **Primitive-First Architecture** - Every component built from composable primitives
3. **Beautiful by Default** - Crafted, polished interfaces inspired by the best technical tools
4. **Scientific Accuracy** - Peer-reviewed algorithms, cited sources, correct math
5. **Performance Obsessed** - GPU acceleration, WebAssembly, optimal rendering
6. **TypeScript Native** - Full type safety with proper generics
7. **Simple at the core** - Fully functional but always as simple as possible

---

## Phase 0: Foundation - Shared Primitives (Ongoing)

> **The Secret Sauce:** Every component—from ECG waveforms to orbital paths—is built from the same GPU-accelerated primitives. This enables unprecedented cross-domain composition.

### Core Rendering Primitives

- [x] **Line Renderer** - GPU-accelerated polylines (used by: ECG, orbits, terrain contours, waveforms)
- [x] **Mesh Renderer** - 3D geometry (used by: planets, anatomy, terrain, organs)
- [x] **Point Cloud** - Particle rendering (used by: scatter plots, LiDAR, stars, molecular)
- [x] **Heatmap Canvas** - 2D color mapping (used by: thermal imaging, medical imaging, spectrograms)
- [x] **Volume Renderer** - 3D scalar fields (medical CT/MRI, atmospheric density, CFD results)
- [x] **Vector Field Renderer** - Arrow fields (fluid flow, forces, gradients, magnetic fields)

### Physics & Simulation

- [x] **Physics Engine** - Euler, Verlet, RK4 integrators
- [x] **WebAssembly Physics** - High-performance N-body, collision detection
- [ ] **Fluid Simulation** - SPH, Lattice Boltzmann for blood flow, aerodynamics
- [ ] **Rigid Body Dynamics** - 6-DOF for spacecraft, surgical robots, mechanical systems

### Data Pipeline

- [x] **Time Series Buffer** - Circular buffers with GPU upload (vital signs, telemetry, sensor data)
- [x] **Decimation** - LOD for large datasets (works across all chart types)
- [x] **Streaming Protocol** - WebSocket/WebRTC for real-time data (works for medical + aerospace)
- [x] **Data Interpolation** - Spline, cubic, linear (universal for all time-series)

### Animation System

- [x] **Spring Physics** - Natural motion (UI transitions, camera moves)
- [x] **Easing Functions** - CSS-compatible timing
- [x] **Animation Presets** - Ready-to-use sequences for orbital, UI, data animations

### Coordinate Systems

- [x] **Universal Transforms** - Convert between any reference frame
  - ECI ↔ ECEF ↔ Geodetic (aerospace)
  - Patient ↔ World ↔ Image (medical - placeholder)
  - Local ↔ UTM ↔ Geographic (geospatial)
- [ ] **Units System** - Type-safe dimensional analysis (meters, feet, nm, parsecs)

### GPU Acceleration

- [x] **Compute Shaders** - Physics, FFT, image processing on GPU
- [x] **Instanced Rendering** - 1000s of identical objects in one draw call

**Why This Matters:** An ECG component and an orbital path use the **same line renderer**. A thermal camera and a spectrogram use the **same heatmap canvas**. A skeleton and a spacecraft use the **same mesh renderer**. This is what makes the library unique—true cross-domain primitives.

**The Innovation:** Same `<VectorField>` for surgical forces AND aerodynamic forces. Same `<TerrainMap>` for helicopter flight AND underwater drones. Same `<LineChart>` for ECG AND orbital telemetry. This is your competitive advantage.

---

## Phase 1: Planets ✓ (Completed)

## Phase 2: Scientific Charts & Analysis ✓ (Completed)

## Phase 2.6: Geospatial & Terrain Visualization

> **Goal:** High-performance terrain rendering for aerospace, defense, and earth sciences. From your Laguna Beach terrain example.

### Terrain Rendering

- [ ] **3D Elevation Map** - DEM/DTM rendering from height data with texture mapping
- [ ] **Topographic Contours** - Elevation lines on 3D terrain with adaptive LOD
- [ ] **Path Overlay** - Routes on 3D surface
- [ ] **Satellite Texture** - High-resolution imagery draped over terrain
- [ ] **Viewshed Analysis** - Line-of-sight visibility calculations
- [ ] **Slope/Aspect Visualization** - Terrain gradient with color coding
- [ ] **Elevation Profile** - Cross-section along path with interactive scrubbing

### GIS Components

- [ ] **Map Projections** - Mercator, UTM, geographic coordinate transformations
- [ ] **Coordinate Display** - Lat/long, MGRS, UTM with precision control
- [ ] **Distance Measurement** - Great circle, geodesic distance calculations
- [ ] **Area Calculation** - Polygon area on curved Earth surface
- [ ] **Geofencing** - Boundary visualization and containment checking

---

## Phase 2.7: HUD & Tactical Interfaces

> **Goal:** Military/aerospace-grade heads-up displays.

### HUD Elements

- [ ] **Corner Brackets** - Tactical frame UI with animated states
- [ ] **Targeting Reticle** - Crosshairs with range/bearing/elevation
- [ ] **Heading Tape** - Cardinal direction scrolling tape indicator
- [ ] **Pitch Ladder** - Flight director style attitude reference
- [ ] **Range Finder Display** - Distance with unit conversion and precision
- [ ] **Coordinate Overlay** - Lat/long with precision formatting

### Tactical Displays

- [ ] **Radar Scope** - PPI display with contacts, bearing, range rings
- [ ] **Sonar Display** - Active/passive acoustic with bearing time history
- [ ] **Situation Awareness** - Blue force tracking with IFF markers
- [ ] **Target Tracking** - Multiple contact management with TMA
- [ ] **Threat Assessment** - Priority-based contact sorting and display

### Sensor Overlays

- [ ] **Thermal Imaging** - False color temperature mapping with palettes
- [ ] **Night Vision Overlay** - Green/white hot rendering modes
- [ ] **LiDAR Point Cloud** - Real-time 3D point rendering

---

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

## Phase 4: Flight Dynamics & Astrodynamics

> **Goal:** STK-level accuracy for Earth and lunar mission analysis. Physics-based simulation with validated propagators, environmental models, and mission planning tools.

### Orbital Mechanics & Propagation

- [x] **Orbit Propagator** - Multiple propagators (SGP4, J2, high-fidelity w/ perturbations)
- [ ] **Two-Body Problem** - Keplerian orbits with classical orbital elements
- [x] **Ground Track Plotter** - Satellite path over Earth/Moon surface
- [ ] **N-Body Simulator** - Multi-body gravitational interactions

### Trajectory Design & Optimization

- [x] **Hohmann Transfer** - Optimal two-impulse orbital transfer
- [ ] **Lambert Solver** - Time-constrained trajectory between positions
- [ ] **Launch Window Calculator** - Optimal launch opportunities
- [ ] **Trajectory Optimizer** - Low-thrust spiral transfers, gradient methods
- [ ] **Gravity Assist Planner** - Swing-by trajectory design
- [ ] **Interplanetary Trajectories** - Earth-Moon transfers, L-point orbits
- [ ] **Landing Trajectory** - Powered descent guidance (lunar landing) you will need to use the earth and moon component and make sure it is to scale

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

- [ ] **Rigid Body Simulator** - 6-DOF dynambeics with collision
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

- [ ] **Component API Explorer** - Auto-generated docs
- [ ] **Physics Explainers** - Educational content
- [ ] **Use Case Gallery** - Real-world examples
- [ ] **Performance Benchmarks** - Component performance data

### Testing & Quality

- [ ] **Performance Profiler** - Frame rate monitoring
