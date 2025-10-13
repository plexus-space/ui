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

// Validation Utilities
export {
  isValidVec3,
  isValidVec2,
  isValidNumber,
  validateVec3,
  validateVec2,
  validateNumber,
  sanitizeVec3,
  sanitizeVec2,
  clamp,
} from "./validation";

// Orbital Mechanics
export {
  solveKeplersEquation,
  eccentricToTrueAnomaly,
  trueToEccentricAnomaly,
  meanToTrueAnomaly,
  trueToMeanAnomaly,
  createPerifocalToECIMatrix,
  transformPerifocalToECI,
  computePositionAtAnomaly,
  computeOrbitPath,
  type OrbitalElements as OrbitalElementsBase,
} from "./orbital-mechanics";

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

// GPU Line Renderer
export {
  LineRenderer,
  ThickLineRenderer,
  useLineBuffer,
  type LineRendererProps,
  type LineRendererHandle,
  type ThickLineRendererProps,
  type Point3D,
  type UseLineBufferOptions,
  type UseLineBufferReturn,
} from "./gpu-line-renderer";

// Orbital Mechanics Primitives
export {
  Trail,
  type TrailProps,
} from "./trail";

export {
  Marker,
  type MarkerProps,
} from "./marker";

export {
  OrbitPath,
  type OrbitPathProps,
} from "./orbit-path";

// Point Cloud Renderer
export {
  PointCloud,
  LODPointCloud,
  generateColormap,
  type PointCloudProps,
  type PointCloudHandle,
  type LODPointCloudProps,
} from "./point-cloud";

// Mesh Loader
export {
  MeshLoader,
  InstancedMeshLoader,
  MeshWithOutline,
  type MeshLoaderProps,
  type MeshLoaderHandle,
  type InstancedMeshLoaderProps,
  type MeshWithOutlineProps,
} from "./mesh-loader";

// Vector Field Renderer
export {
  VectorField,
  Streamlines,
  QuiverPlot,
  type VectorFieldProps,
  type VectorFieldHandle,
  type StreamlinesProps,
  type QuiverPlotProps,
} from "./vector-field";

// Volume Renderer
export {
  VolumeRenderer,
  SliceViewer,
  type VolumeRendererProps,
  type VolumeRendererHandle,
  type TransferFunctionPoint,
  type SliceViewerProps,
} from "./volume-renderer";

// Visual Effects
export {
  GlowEffect,
  StarField,
  LensFlare,
  MotionTrail,
  ParticleEmitter,
  StyledGrid,
  type GlowEffectProps,
  type StarFieldProps,
  type LensFlareProps,
  type MotionTrailProps,
  type ParticleEmitterProps,
  type StyledGridProps,
} from "./visual-effects";

// Data Pipeline
export {
  createTimeSeriesBuffer,
  createDataStream,
  createTimeSynchronizer,
  createRealTimeStats,
  interpolateLinear,
  interpolateCubic,
  interpolateSpline,
  resampleData,
  type TimeSeriesBufferInstance,
  type DataStreamInstance,
  type DataStreamOptions,
  type TimeSynchronizerInstance,
  type RealTimeStatsInstance,
} from "./data-pipeline";

// Coordinate Systems
export {
  geodeticToECEF,
  ecefToGeodetic,
  eciToECEF,
  ecefToECI,
  geodeticToECI,
  eciToGeodetic,
  ecefToENU,
  enuToECEF,
  geodeticToUTM,
  utmToGeodetic,
  calculateGMST,
  greatCircleDistance,
  calculateAzimuth,
  calculateElevation,
  convertCoordinates,
  WGS84,
  EARTH_ROTATION_RATE,
  J2000_EPOCH,
  type Vector3D,
  type GeodeticCoordinates,
  type ECEFCoordinates,
  type ECICoordinates,
  type ENUCoordinates,
  type UTMCoordinates,
  type CoordinateSystem,
  type Coordinates,
} from "./coordinate-systems";

// GPU Compute
export {
  createGPUFFT,
  createGPUConvolution,
  KERNELS,
  useGPUFFT,
  useGPUConvolution,
  type GPUFFTInstance,
  type GPUConvolutionInstance,
} from "./gpu-compute";
