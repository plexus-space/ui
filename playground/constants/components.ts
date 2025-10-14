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
    id: "line-chart",
    name: "Line Chart",
    category: "Charts & Data Visualization",
    tier: "free",
    description:
      "High-performance line chart with multi-series support, real-time streaming, zoom/pan interactions, and GPU-accelerated rendering for large datasets (1M+ points @ 60fps).",
    textures: [],
  },
];
