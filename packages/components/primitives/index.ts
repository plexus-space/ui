/**
 * Plexus UI Primitives
 *
 * Core building blocks for aerospace and physics visualizations.
 * Import from this barrel file for convenience.
 *
 * @example
 * ```tsx
 * import { Sphere, Atmosphere, useGPURenderer, vec3 } from './primitives';
 * ```
 */

// 3D Primitives
export {
  Sphere,
  Atmosphere,
  Clouds,
  Ring,
  type SphereProps,
  type AtmosphereProps,
  type CloudsProps,
  type RingProps,
} from "./sphere";

// Physics Engine
export {
  vec3,
  vec2,
  gravity,
  drag,
  spring,
  damping,
  constant,
  combine,
  integrateEuler,
  integrateVerlet,
  integrateRK4,
  stateToOrbitalElements,
  orbitalEnergy,
  orbitalPeriod,
  type Vec3,
  type Vec2,
  type PhysicsState,
  type PhysicsState2D,
  type ForceFunction,
  type ForceFunction2D,
  type OrbitalElements,
} from "./physics";

// Animation System
export {
  updateSpring,
  isSpringAtRest,
  SPRING_PRESETS,
  easing,
  lerp,
  easedLerp,
  cubicBezier,
  cssEasing,
  tween,
  stagger,
  type SpringConfig,
  type SpringState,
  type EasingFunction,
  type TimingOptions,
} from "./animation";

// Animation Presets
export {
  orbitPresets,
  cameraPresets,
  dataPresets,
  particlePresets,
  uiPresets,
  physicsPresets,
  sequences,
  getPreset,
  listPresets,
  blendPresets,
  executeSequence,
  type OrbitAnimationPreset,
  type CameraAnimationPreset,
  type DataAnimationPreset,
  type ParticleAnimationPreset,
  type UITransitionPreset,
  type PhysicsPreset,
  type AnimationStep,
  type AnimationSequence,
} from "./animation-presets";

// WebAssembly Physics
export {
  createWASMPhysics,
  supportsWASM,
  isWASMLoaded,
  simulateNBody,
  detectCollisions,
  benchmarkPhysics,
  type WASMPhysicsModule,
} from "./wasm-physics";

// Chart Primitives - Heatmap
export {
  Heatmap,
  type HeatmapCell,
  type CellShape,
  type HeatmapRootProps,
} from "../heatmap";

// Chart Primitives - Polar Plot
export {
  PolarPlot,
  type PolarPoint,
  type PolarSeries,
  type PolarAxis,
  type PolarVariant,
  type PolarPlotRootProps,
} from "../polar-plot";
