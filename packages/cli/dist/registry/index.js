const BASE_URL =
  "https://raw.githubusercontent.com/plexus-space/ui/main/packages/components";
export const registry = {
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
  // ============================================================================
  // WebGPU Primitives (Low-level GPU-accelerated building blocks)
  // ============================================================================

  // ============================================================================
  // Math & Physics Utilities
  // ============================================================================
  "math-vectors": {
    name: "math-vectors",
    type: "components:primitive",
    description: "Vector math utilities (vec2, vec3, vec4 operations)",
    files: [`${BASE_URL}/primitives/math/vectors.ts`],
    dependencies: [],
    registryDependencies: [],
    category: "primitives",
  },
  "math-matrices": {
    name: "math-matrices",
    type: "components:primitive",
    description: "Matrix math utilities (4x4 transforms, projections)",
    files: [`${BASE_URL}/primitives/math/matrices.ts`],
    dependencies: [],
    registryDependencies: [],
    category: "primitives",
  },
  "math-coordinates": {
    name: "math-coordinates",
    type: "components:primitive",
    description: "Coordinate system transforms (ECI, ECEF, Geodetic, UTM)",
    files: [`${BASE_URL}/primitives/math/coordinates.ts`],
    dependencies: [],
    registryDependencies: [],
    category: "primitives",
  },
  "math-units": {
    name: "math-units",
    type: "components:primitive",
    description: "Type-safe dimensional analysis and unit conversions",
    files: [`${BASE_URL}/primitives/math/units.ts`],
    dependencies: [],
    registryDependencies: [],
    category: "primitives",
  },
  validation: {
    name: "validation",
    type: "components:primitive",
    description:
      "Input validation utilities for vectors, numeric values, and bounds checking",
    files: [`${BASE_URL}/primitives/validation.ts`],
    dependencies: [],
    registryDependencies: [],
    category: "primitives",
  },
  constants: {
    name: "constants",
    type: "components:primitive",
    description:
      "Physical constants (gravitational parameters, planetary radii, etc.)",
    files: [`${BASE_URL}/primitives/constants.ts`],
    dependencies: [],
    registryDependencies: [],
    category: "primitives",
  },
  colormaps: {
    name: "colormaps",
    type: "components:primitive",
    description:
      "Scientific colormaps (viridis, plasma, inferno, turbo, thermal)",
    files: [`${BASE_URL}/colormaps.ts`],
    dependencies: [],
    registryDependencies: [],
    category: "primitives",
  },
};
export function getComponent(name) {
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
export function getComponentsByCategory(category) {
  // CLI only returns free tier components
  return Object.values(registry).filter(
    (c) => c.category === category && c.tier !== "pro"
  );
}
// Internal function for playground - returns all components including pro
export function getAllComponentsInternal() {
  return Object.values(registry);
}
