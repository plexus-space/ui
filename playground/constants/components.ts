export type ComponentTier = "free" | "pro";

export interface Component {
  id: string;
  name: string;
  category: string;
  description?: string;
  textures: string[];
  tier?: ComponentTier;
}

export const components: Component[] = [
  {
    id: "waveform-monitor",
    name: "Waveform Monitor",
    category: "charts",
    tier: "free",
    description:
      "High-performance multi-trace waveform display for real-time sensor data. Perfect for medical vitals (ECG, SpO2), aerospace telemetry, and defense applications. Renders 10,000+ points per trace at 60fps using WebGPU acceleration.",
    textures: [],
  },
];
