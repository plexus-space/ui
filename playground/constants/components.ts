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
    id: "line-chart",
    name: "Line Chart",
    category: "Charts",
    tier: "free",
    description:
      "High-performance line chart with multi-series support, real-time streaming, zoom/pan interactions, and GPU-accelerated rendering for large datasets.",
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
];
