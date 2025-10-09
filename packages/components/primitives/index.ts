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

// WebGPU Rendering
export {
  GPURenderer,
  useGPURenderer,
  createComputePipeline,
  createBufferWithData,
  readBuffer,
  type GPURendererContext,
  type GPURendererProps,
} from "./gpu-renderer";

export {
  useGPUFFT,
  useGPUConvolution,
  type GPUComputeFFTProps,
} from "./gpu-compute";

export {
  GPULineRenderer,
  GPUScatterRenderer,
  type GPULineRendererProps,
  type GPUScatterRendererProps,
  type Point as GPUPoint,
} from "./gpu-line-renderer";

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
