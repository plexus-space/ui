export interface ComponentConfig {
  name: string;
  type: "components:ui" | "components:primitive" | "components:chart";
  description?: string;
  files: string[];
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  category?: "3d" | "charts" | "primitives" | "orbital";
}

export interface Registry {
  [key: string]: ComponentConfig;
}
