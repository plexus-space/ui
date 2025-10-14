import { Registry } from "./schema.js";

const BASE_URL =
  "https://raw.githubusercontent.com/plexus-space/ui/main/packages/components";

export const registry: Registry = {
  // ============================================================================
  // Shared Library (Foundation - no dependencies)
  // ============================================================================
  lib: {
    name: "lib",
    type: "components:lib",
    description:
      "Shared utility functions, constants, helpers, and theme system",
    files: [`${BASE_URL}/lib/plexusui-utils.ts`, `${BASE_URL}/lib/index.ts`],
    dependencies: ["react"],
    category: "lib",
  },

  // ============================================================================
  // Chart Components
  // ============================================================================
  "line-chart": {
    name: "line-chart",
    type: "components:chart",
    description:
      "Multi-series line chart with WebGPU acceleration for large datasets (1M+ points @ 60fps)",
    files: [
      `${BASE_URL}/line-chart.tsx`,
      `${BASE_URL}/chart-legend.tsx`,
      `${BASE_URL}/chart-tooltip.tsx`,
    ],
    dependencies: ["react"],
    registryDependencies: ["lib"],
    category: "charts",
  },
};

export function getComponent(name: string) {
  const component = registry[name];
  // CLI only returns free tier components
  if (component && component.tier === "pro") {
    return undefined;
  }
  return component;
}

export function getAllComponents() {
  // CLI only returns free tier components
  return Object.values(registry).filter((c) => c.tier !== "pro");
}

export function getComponentsByCategory(category: string) {
  // CLI only returns free tier components
  return Object.values(registry).filter(
    (c) => c.category === category && c.tier !== "pro"
  );
}

// Internal function for playground - returns all components including pro
export function getAllComponentsInternal() {
  return Object.values(registry);
}
