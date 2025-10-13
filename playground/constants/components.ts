export type ComponentTier = "free" | "pro";

export interface Component {
  id: string;
  name: string;
  category: string;
  description?: string;
  textures: string[];
  tier?: ComponentTier; // defaults to "free"
}

export const components: Component[] = [
  {
    id: "earth",
    name: "Earth",
    category: "Planetary Bodies",
    tier: "free",
    description:
      "Interactive 3D Earth with day/night textures, atmospheric glow, and cloud layers. Built with composable primitives following architecture for maximum flexibility.",
    textures: [
      "/day.jpg",
      "/night.jpg",
      "/clouds.jpg",
      "/bump.jpg",
      "/ocean.png",
    ],
  },
  {
    id: "mars",
    name: "Mars",
    category: "Planetary Bodies",
    tier: "free",
    textures: ["/flat-mars.jpg"],
  },
  {
    id: "mercury",
    name: "Mercury",
    category: "Planetary Bodies",
    tier: "free",
    textures: ["/flat-mercury.png"],
  },
  {
    id: "venus",
    name: "Venus",
    category: "Planetary Bodies",
    tier: "free",
    textures: ["/flat-venus.jpg"],
  },
  {
    id: "moon",
    name: "Moon",
    category: "Planetary Bodies",
    tier: "free",
    textures: ["/moon.jpg"],
  },
  {
    id: "jupiter",
    name: "Jupiter",
    category: "Planetary Bodies",
    tier: "free",
    textures: ["/flat-jupiter.jpg"],
  },
  {
    id: "saturn",
    name: "Saturn",
    category: "Planetary Bodies",
    tier: "free",
    textures: ["/saturnmap.jpg"],
  },
  {
    id: "uranus",
    name: "Uranus",
    category: "Planetary Bodies",
    tier: "free",
    textures: ["/flat-uranus.jpg"],
  },
  {
    id: "neptune",
    name: "Neptune",
    category: "Planetary Bodies",
    tier: "free",
    textures: ["/flat-neptune.jpg"],
  },

  {
    id: "orbit-propagator",
    name: "Orbit Propagator",
    category: "Orbital Mechanics",
    tier: "pro",
    description:
      "Real-time orbit propagation using composable primitives: useOrbitalPropagation hook + Marker, OrbitPath, and Trail primitives. Features J2 perturbation modeling, ground track visualization, and complete customization of rendering. Primitive-first architecture allows mixing and matching components for mission planning, constellation design, and spacecraft operations.",
    textures: [],
  },
  {
    id: "orbit-transfer-planner",
    name: "Orbit Transfer Planner",
    category: "Orbital Mechanics",
    tier: "pro",
    description:
      "Calculate and visualize Hohmann orbital transfers between circular orbits. Displays complete delta-V budget breakdown, transfer times, and burn locations. Shows initial orbit, transfer ellipse(s), and final orbit with scientifically accurate calculations. Includes automatic optimization for radius ratio thresholds. Perfect for mission planning and propulsion system sizing.",
    textures: [],
  },
  {
    id: "line-chart",
    name: "Line Chart",
    category: "Charts",
    tier: "free",
    description:
      "High-performance line chart with multi-series support, real-time streaming, zoom/pan interactions, and GPU-accelerated rendering for large datasets.",
    textures: [],
  },
  {
    id: "polar-plot",
    name: "Polar Plot",
    category: "Charts",
    tier: "free",
    description:
      "Polar coordinate visualization supporting radar charts, rose diagrams, and orbit phase plots. Ideal for directional data and cyclic patterns.",
    textures: [],
  },
  {
    id: "heatmap",
    name: "Heatmap",
    category: "Charts",
    tier: "free",
    description:
      "2D heatmap with perceptually uniform colormaps, customizable bins, and scientific color scales. Perfect for density visualization and correlation matrices.",
    textures: [],
  },
  {
    id: "gantt-chart",
    name: "Gantt Chart",
    category: "Charts",
    tier: "free",
    description:
      "Mission timeline and task scheduling visualization with resource allocation, priority levels, and interactive timeline views. Perfect for satellite pass planning.",
    textures: [],
  },
  {
    id: "scatter-plot",
    name: "Scatter Plot",
    category: "Charts",
    tier: "free",
    description:
      "2D scatter plot for visualizing point clouds, correlations, and distributions. Supports clustering, regression lines, and interactive tooltips for data exploration.",
    textures: [],
  },
  {
    id: "bar-chart",
    name: "Bar Chart",
    category: "Charts",
    tier: "free",
    description:
      "Versatile bar chart supporting both vertical and horizontal orientations. Features grouped and stacked modes for multi-series data visualization with interactive tooltips.",
    textures: [],
  },
  {
    id: "histogram",
    name: "Histogram",
    category: "Charts",
    tier: "free",
    description:
      "Distribution analysis chart with automatic binning, statistical overlays (mean, median), and support for both count and density modes. Perfect for analyzing data distributions and frequency patterns.",
    textures: [],
  },
  {
    id: "box-plot",
    name: "Box Plot",
    category: "Charts",
    tier: "free",
    description:
      "Statistical distribution visualization showing quartiles, median, whiskers, and outliers. Essential for comparing distributions across multiple categories with clear visual representation of spread and central tendency.",
    textures: [],
  },

  {
    id: "spectrogram",
    name: "Spectrogram",
    category: "Charts",
    tier: "free",
    description:
      "Time-frequency representation with color-coded magnitude visualization. Displays how the frequency content of a signal varies over time, essential for signal processing and audio analysis.",
    textures: [],
  },
  {
    id: "waterfall-plot",
    name: "Waterfall Plot",
    category: "Charts",
    tier: "free",
    description:
      "3D spectral analysis visualization with stacked waterfall lines color-coded by position. Essential for visualizing time-frequency data, emission spectra, and multi-dimensional signal analysis with proper depth perception.",
    textures: [],
  },
  {
    id: "node-graph-editor",
    name: "Node Graph Editor",
    category: "Network & System Architecture",
    tier: "pro",
    description:
      "Interactive node-based graph editor for visual programming, system design, and dataflow visualization. Features drag-and-drop node positioning, port-based connections, grid snapping, pan/zoom navigation. Perfect for designing control systems, signal processing pipelines, and mission workflows.",
    textures: [],
  },
  {
    id: "gpu-fluid-simulation",
    name: "GPU Fluid Simulation",
    category: "Physics Primitives",
    tier: "free",
    description:
      "Beautiful GPU-accelerated fluid simulation using WebGL shaders. Drag to create mesmerizing vortices and inject vibrant colors. Real-time Navier-Stokes equation solving with bloom effects, velocity advection, and pressure projection. Inspired by Pavel Dobryakov's stunning WebGL demo.",
    textures: [],
  },
  {
    id: "fluid-simulation",
    name: "SPH Fluid (Particles)",
    category: "Physics Primitives",
    tier: "free",
    description:
      "Real-time SPH (Smoothed Particle Hydrodynamics) fluid simulation demonstrating water behavior with particle-based physics. Features pressure forces, viscosity, gravity, and boundary collision. Perfect for understanding computational fluid dynamics and particle methods.",
    textures: [],
  },
  {
    id: "rigid-body",
    name: "Rigid Body Dynamics",
    category: "Physics Primitives",
    tier: "free",
    description:
      "6-DOF (six degrees of freedom) rigid body physics with quaternion-based rotation. Demonstrates spacecraft attitude control, asteroid collisions, torque application, and proper inertia tensor handling. No gimbal lock, smooth dynamics.",
    textures: [],
  },
];
