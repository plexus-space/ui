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
    dependencies: ["react", "three"],
    category: "lib",
  },

  // ============================================================================
  // 3D Planetary Components
  // ============================================================================
  earth: {
    name: "earth",
    type: "components:ui",
    description: "Earth with rotation, atmosphere, and clouds",
    files: [`${BASE_URL}/earth.tsx`],
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    registryDependencies: ["sphere"],
    category: "3d",
  },
  mars: {
    name: "mars",
    type: "components:ui",
    description: "Mars with surface features",
    files: [`${BASE_URL}/mars.tsx`],
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    registryDependencies: ["sphere"],
    category: "3d",
  },
  mercury: {
    name: "mercury",
    type: "components:ui",
    description: "Mercury visualization",
    files: [`${BASE_URL}/mercury.tsx`],
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    registryDependencies: ["sphere"],
    category: "3d",
  },
  venus: {
    name: "venus",
    type: "components:ui",
    description: "Venus with atmosphere",
    files: [`${BASE_URL}/venus.tsx`],
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    registryDependencies: ["sphere"],
    category: "3d",
  },
  moon: {
    name: "moon",
    type: "components:ui",
    description: "Earth's Moon",
    files: [`${BASE_URL}/moon.tsx`],
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    registryDependencies: ["sphere"],
    category: "3d",
  },
  jupiter: {
    name: "jupiter",
    type: "components:ui",
    description: "Jupiter with atmospheric bands",
    files: [`${BASE_URL}/jupiter.tsx`],
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    registryDependencies: ["sphere"],
    category: "3d",
  },
  saturn: {
    name: "saturn",
    type: "components:ui",
    description: "Saturn with rings",
    files: [`${BASE_URL}/saturn.tsx`],
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    registryDependencies: ["sphere"],
    category: "3d",
  },
  uranus: {
    name: "uranus",
    type: "components:ui",
    description: "Uranus with rings",
    files: [`${BASE_URL}/uranus.tsx`],
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    registryDependencies: ["sphere"],
    category: "3d",
  },
  neptune: {
    name: "neptune",
    type: "components:ui",
    description: "Neptune with atmospheric features",
    files: [`${BASE_URL}/neptune.tsx`],
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    registryDependencies: ["sphere"],
    category: "3d",
  },

  // ============================================================================
  // Orbital Mechanics
  // ============================================================================

  // ============================================================================
  // Chart Components
  // ============================================================================
  "line-chart": {
    name: "line-chart",
    type: "components:chart",
    description: "Multi-series line chart with zoom and real-time support",
    files: [
      `${BASE_URL}/line-chart.tsx`,
      `${BASE_URL}/canvas-renderer.tsx`,
      `${BASE_URL}/chart-legend.tsx`,
      `${BASE_URL}/chart-tooltip.tsx`,
      `${BASE_URL}/chart-export.ts`,
      `${BASE_URL}/decimation.ts`,
    ],
    dependencies: ["react"],
    registryDependencies: ["lib"],
    category: "charts",
  },

  heatmap: {
    name: "heatmap",
    type: "components:chart",
    description: "2D heatmap with scientific colormaps",
    files: [
      `${BASE_URL}/heatmap.tsx`,
      `${BASE_URL}/colormaps.ts`,
      `${BASE_URL}/chart-export.ts`,
    ],
    dependencies: ["react"],
    registryDependencies: ["lib"],
    category: "charts",
  },

  "gantt-chart": {
    name: "gantt-chart",
    type: "components:chart",
    description: "Gantt chart for mission planning and timelines",
    files: [`${BASE_URL}/gantt-chart.tsx`],
    dependencies: ["react", "date-fns"],
    registryDependencies: ["lib"],
    category: "charts",
  },

  "scatter-plot": {
    name: "scatter-plot",
    type: "components:chart",
    description: "2D/3D scatter plot with clustering and regression analysis",
    files: [`${BASE_URL}/scatter-plot.tsx`],
    dependencies: ["react"],
    registryDependencies: ["lib"],
    category: "charts",
  },

  "box-plot": {
    name: "box-plot",
    type: "components:chart",
    description:
      "Statistical distribution with quartiles, whiskers, and outliers",
    files: [`${BASE_URL}/box-plot.tsx`],
    dependencies: ["react"],
    registryDependencies: ["lib"],
    category: "charts",
  },
  spectrogram: {
    name: "spectrogram",
    type: "components:chart",
    description:
      "Time-frequency representation with color-coded magnitude visualization",
    files: [`${BASE_URL}/spectrogram.tsx`],
    dependencies: ["react"],
    registryDependencies: ["lib"],
    category: "charts",
  },

  "waterfall-plot": {
    name: "waterfall-plot",
    type: "components:chart",
    description:
      "3D spectral analysis visualization with stacked waterfall lines color-coded by position",
    files: [`${BASE_URL}/waterfall-plot.tsx`],
    dependencies: ["react"],
    registryDependencies: ["lib"],
    category: "charts",
  },

  // ============================================================================
  // Primitives (Low-level building blocks - minimal dependencies)
  // ============================================================================
  sphere: {
    name: "sphere",
    type: "components:primitive",
    description:
      "Base sphere primitive with texture support (Sphere, Atmosphere, Clouds, Ring)",
    files: [`${BASE_URL}/primitives/sphere.tsx`],
    dependencies: ["react", "@react-three/fiber", "three"],
    registryDependencies: [], // Primitives are standalone
    category: "primitives",
  },
  animation: {
    name: "animation",
    type: "components:primitive",
    description: "Spring physics, easing functions, and animation helpers",
    files: [`${BASE_URL}/primitives/animation.ts`],
    dependencies: [],
    registryDependencies: [], // Pure utilities
    category: "primitives",
  },
  "animation-presets": {
    name: "animation-presets",
    type: "components:primitive",
    description:
      "Ready-to-use animation presets for orbital, camera, data, and UI animations",
    files: [`${BASE_URL}/primitives/animation-presets.ts`],
    dependencies: [],
    registryDependencies: ["animation"],
    category: "primitives",
  },
  physics: {
    name: "physics",
    type: "components:primitive",
    description:
      "Physics engine with integrators (Euler, Verlet, RK4) and forces",
    files: [`${BASE_URL}/primitives/physics.ts`],
    dependencies: [],
    registryDependencies: [], // Pure utilities
    category: "primitives",
  },
  "wasm-physics": {
    name: "wasm-physics",
    type: "components:primitive",
    description:
      "WebAssembly-accelerated physics for N-body simulations and collision detection",
    files: [`${BASE_URL}/primitives/wasm-physics.ts`],
    dependencies: [],
    registryDependencies: ["physics"],
    category: "primitives",
  },

  "coordinate-systems": {
    name: "coordinate-systems",
    type: "components:primitive",
    description:
      "Universal coordinate transforms (ECI, ECEF, Geodetic, ENU, UTM) with WGS84",
    files: [`${BASE_URL}/primitives/coordinate-systems.ts`],
    dependencies: [],
    registryDependencies: [],
    category: "primitives",
  },
  "orbital-mechanics": {
    name: "orbital-mechanics",
    type: "components:primitive",
    description: "Kepler's equation solver and orbital element conversions",
    files: [`${BASE_URL}/primitives/orbital-mechanics.ts`],
    dependencies: [],
    registryDependencies: ["physics", "coordinate-systems"],
    category: "primitives",
  },
  validation: {
    name: "validation",
    type: "components:primitive",
    description: "Input validation utilities for vectors and numeric values",
    files: [`${BASE_URL}/primitives/validation.ts`],
    dependencies: [],
    registryDependencies: [],
    category: "primitives",
  },
  "gpu-renderer": {
    name: "gpu-renderer",
    type: "components:primitive",
    description: "GPU-accelerated rendering with WebGPU",
    files: [
      `${BASE_URL}/primitives/gpu-renderer.tsx`,
      `${BASE_URL}/primitives/gpu-compute.tsx`,
      `${BASE_URL}/primitives/gpu-line-renderer.tsx`,
    ],
    dependencies: ["react", "three"],
    registryDependencies: [],
    category: "primitives",
  },
  "gpu-large-dataset": {
    name: "gpu-large-dataset",
    type: "components:primitive",
    description:
      "GPU-optimized rendering for millions of particles and large datasets",
    files: [`${BASE_URL}/primitives/gpu-large-dataset.tsx`],
    dependencies: ["react"],
    registryDependencies: ["gpu-renderer"],
    category: "primitives",
  },
  "visual-effects": {
    name: "visual-effects",
    type: "components:primitive",
    description: "Visual effects (bloom, glow, atmospheric scattering)",
    files: [`${BASE_URL}/primitives/visual-effects.tsx`],
    dependencies: ["react", "@react-three/fiber", "three"],
    registryDependencies: [],
    category: "primitives",
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
