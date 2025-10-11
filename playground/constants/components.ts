export const components = [
  {
    id: "earth",
    name: "Earth",
    category: "Planetary Bodies",
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
    textures: ["/flat-mars.jpg"],
  },
  {
    id: "mercury",
    name: "Mercury",
    category: "Planetary Bodies",
    textures: ["/flat-mercury.png"],
  },
  {
    id: "venus",
    name: "Venus",
    category: "Planetary Bodies",
    textures: ["/flat-venus.jpg"],
  },
  {
    id: "moon",
    name: "Moon",
    category: "Planetary Bodies",
    textures: ["/moon.jpg"],
  },
  {
    id: "jupiter",
    name: "Jupiter",
    category: "Planetary Bodies",
    textures: ["/flat-jupiter.jpg"],
  },
  {
    id: "saturn",
    name: "Saturn",
    category: "Planetary Bodies",
    textures: ["/saturnmap.jpg"],
  },
  {
    id: "uranus",
    name: "Uranus",
    category: "Planetary Bodies",
    textures: ["/flat-uranus.jpg"],
  },
  {
    id: "neptune",
    name: "Neptune",
    category: "Planetary Bodies",
    textures: ["/flat-neptune.jpg"],
  },
  {
    id: "orbital-path",
    name: "Orbital Path",
    category: "Orbital Mechanics",
    description:
      "Draw elliptical orbits around planets using real Keplerian orbital elements. Essential for visualizing satellite trajectories.",
    textures: [],
  },
  {
    id: "line-chart",
    name: "Line Chart",
    category: "Charts",
    description:
      "High-performance line chart with multi-series support, real-time streaming, zoom/pan interactions, and GPU-accelerated rendering for large datasets.",
    textures: [],
  },

  {
    id: "polar-plot",
    name: "Polar Plot",
    category: "Charts",
    description:
      "Polar coordinate visualization supporting radar charts, rose diagrams, and orbit phase plots. Ideal for directional data and cyclic patterns.",
    textures: [],
  },
  {
    id: "heatmap",
    name: "Heatmap",
    category: "Charts",
    description:
      "2D heatmap with perceptually uniform colormaps, customizable bins, and scientific color scales. Perfect for density visualization and correlation matrices.",
    textures: [],
  },

  {
    id: "gantt-chart",
    name: "Gantt Chart",
    category: "Charts",
    description:
      "Mission timeline and task scheduling visualization with resource allocation, priority levels, and interactive timeline views. Perfect for satellite pass planning.",
    textures: [],
  },
  {
    id: "scatter-plot",
    name: "Scatter Plot",
    category: "Charts",
    description:
      "2D scatter plot for visualizing point clouds, correlations, and distributions. Supports clustering, regression lines, and interactive tooltips for data exploration.",
    textures: [],
  },
  {
    id: "bar-chart",
    name: "Bar Chart",
    category: "Charts",
    description:
      "Versatile bar chart supporting both vertical and horizontal orientations. Features grouped and stacked modes for multi-series data visualization with interactive tooltips.",
    textures: [],
  },
  {
    id: "histogram",
    name: "Histogram",
    category: "Charts",
    description:
      "Distribution analysis chart with automatic binning, statistical overlays (mean, median), and support for both count and density modes. Perfect for analyzing data distributions and frequency patterns.",
    textures: [],
  },
];
