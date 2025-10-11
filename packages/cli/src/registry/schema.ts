export type ComponentTier = "free" | "pro";

export interface ComponentConfig {
  name: string;
  type: "components:ui" | "components:primitive" | "components:chart" | "components:lib";
  description?: string;
  files: string[];
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  category?: "3d" | "charts" | "primitives" | "orbital" | "lib";
  tier?: ComponentTier; // defaults to "free"
}

export interface Registry {
  [key: string]: ComponentConfig;
}
