export interface ComponentConfig {
  name: string;
  type: "components:ui" | "components:primitive" | "components:chart" | "components:lib";
  description?: string;
  files: string[];
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  category?: "3d" | "charts" | "primitives" | "orbital" | "lib";
}

export interface Registry {
  [key: string]: ComponentConfig;
}
