/**
 * Plexus UI Primitives - Minimal Building Blocks
 *
 * **Philosophy: Less is more**
 * - 4 WebGPU rendering primitives (true GPU acceleration)
 * - 6 Three.js primitives (for 3D scenes)
 * - Core physics & math utilities
 * - Zero bloat, zero dependencies on unused code
 *
 * **WebGPU Primitives (TRUE GPU Compute):**
 * 1. WebGPULineRenderer - 1M+ points @ 60fps (orbits, waveforms, telemetry)
 * 2. WebGPUPointCloud - 100k+ points @ 60fps (scatter, LiDAR, stars, particles)
 * 3. WebGPUMeshRenderer - 100k+ triangles @ 60fps (STL, terrain, CAD, FEA)
 * 4. WebGPUVectorField - 100k+ vectors @ 60fps (CFD, magnetic fields, flow)
 *
 * **Three.js Primitives (3D Scenes):**
 * 5. Marker - Billboards (satellites, waypoints)
 * 6. Trail - Streaming trails (satellite paths)
 * 7. Sphere - Planets & celestial bodies
 * 8. Atmosphere - Atmospheric glow
 * 9. Clouds - Cloud layers
 * 10. OrbitPath - Keplerian orbit visualization
 *
 * **Physics & Math:**
 * - Vector math (vec3, vec2 with 20+ operations)
 * - Matrix math (4x4 transformations for WebGPU)
 * - Coordinate transforms (ECI, ECEF, Geodetic, ENU)
 * - Integrators (Euler, Verlet, RK4)
 * - Forces (gravity, drag, spring, damping)
 * - Orbital mechanics (Kepler, state vectors, elements)
 * - Units system (type-safe dimensional analysis)
 * - Validation (NaN/Infinity handling, bounds checking)
 *
 * Everything else has been removed. Build what you need from these blocks.
 */

// ============================================================================
// 🚀 WEBGPU PRIMITIVES (True GPU Compute - Production Ready)
// ============================================================================

/**
 * WebGPU Line Renderer - TRUE GPU compute shaders
 * 1M+ points at 60fps, GPU decimation, spatial indexing
 */
export {
  WebGPULineRenderer,
  type WebGPULineRendererProps,
} from "./webgpu/line-renderer";

/**
 * WebGPU Device Manager
 * Initialize and manage WebGPU devices
 */
export {
  getWebGPUDevice,
  isWebGPUAvailable,
  getWebGPUSupportLevel,
  destroyWebGPUDevice,
  createCanvasContext,
  type WebGPUDeviceInfo,
  type WebGPUDeviceOptions,
  type WebGPUSupportLevel,
} from "./webgpu/device";

/**
 * WebGPU Buffer Manager
 * Efficient GPU buffer management
 */
export {
  BufferManager,
  createVertexBuffer,
  createUniformBuffer,
  createStorageBuffer,
  readBuffer,
  type BufferOptions,
  type BufferMetadata,
} from "./webgpu/buffer-manager";

/**
 * WebGPU Point Cloud - TRUE GPU rendering
 * 100k+ points at 60fps with per-point attributes
 * Use cases: Scatter plots, LiDAR, particles, stars, molecular viz
 */
export {
  WebGPUPointCloud,
  type WebGPUPointCloudProps,
  type Point,
} from "./webgpu/point-cloud";

/**
 * WebGPU Mesh Renderer - TRUE GPU rendering
 * 100k+ triangles at 60fps with lighting and textures
 * Use cases: STL/OBJ models, surface plots, terrain, FEA
 */
export {
  WebGPUMeshRenderer,
  type WebGPUMeshRendererProps,
} from "./webgpu/mesh-renderer";

/**
 * WebGPU Vector Field - TRUE GPU rendering
 * 100k+ vectors at 60fps with color mapping
 * Use cases: CFD, magnetic fields, flow visualization, gradients
 */
export {
  WebGPUVectorField,
  type WebGPUVectorFieldProps,
  type Vector,
} from "./webgpu/vector-field";

// ============================================================================
// 🌐 THREE.JS PRIMITIVES (3D Scenes)
// ============================================================================

/**
 * Marker - Simple billboards
 * Lightweight, emissive, always faces camera
 */
export { Marker, type MarkerProps } from "./three/marker";

/**
 * Trail - Streaming trails
 * GPU-accelerated via LineRenderer, circular buffer
 */
export { Trail, type TrailProps } from "./three/trail";

/**
 * Sphere - Planets & celestial bodies
 * Textures, normal maps, atmosphere shaders
 */
export {
  Sphere,
  Atmosphere,
  Clouds,
  Ring,
  type SphereProps,
  type AtmosphereProps,
  type CloudsProps,
  type RingProps,
} from "./three/sphere";

/**
 * OrbitPath - Keplerian orbit visualization
 * Analytical orbit rendering from classical elements
 */
export { OrbitPath, type OrbitPathProps } from "./three/orbit-path";

// ============================================================================
// 🧮 PHYSICS & MATH (Core Utilities)
// ============================================================================

/**
 * Physics Engine
 * Euler, Verlet, RK4 integrators with composable forces
 */
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
  angularMomentum,
  visVivaVelocity,
  type Vec3,
  type Vec2,
  type PhysicsState,
  type PhysicsState2D,
  type ForceFunction,
  type ForceFunction2D,
  type OrbitalElements,
} from "./physics";

/**
 * Matrix Math
 * 4x4 transformation matrices for WebGPU rendering
 */
export {
  mat4Identity,
  mat4Translate,
  mat4Scale,
  mat4RotateX,
  mat4RotateY,
  mat4RotateZ,
  mat4LookAt,
  mat4Perspective,
  mat4Orthographic,
  mat4Multiply,
  mat4Transpose,
  mat4Invert,
  mat3FromMat4,
  mat3NormalMatrix,
  mat4ToArray,
  mat3ToArray,
  type Mat4,
  type Mat3,
} from "./math/matrices";

/**
 * Coordinate System Transforms
 * ECI, ECEF, Geodetic, ENU conversions
 */
export {
  eciToEcef,
  ecefToEci,
  ecefToGeodetic,
  geodeticToEcef,
  ecefToEnu,
  enuToEcef,
  enuToAzElRange,
  greatCircleDistance,
  normalizeLongitude,
  clampLatitude,
  WGS84_A,
  WGS84_B,
  WGS84_F,
  WGS84_E2,
  EARTH_OMEGA,
  SECONDS_PER_DAY,
} from "./math/coordinates";

/**
 * Vector Math Utilities
 * Additional utilities from vectors.ts
 */
export {
  clamp as clampValue,
  lerp,
  mapRange,
  degToRad,
  radToDeg,
} from "./math/vectors";

/**
 * Units System
 * Type-safe dimensional analysis (meters, km, radians, etc.)
 */
export {
  // Length
  meters,
  kilometers,
  feet,
  miles,
  nauticalMiles,
  astronomicalUnits,
  toMeters,
  toKilometers,
  // Mass
  kilograms,
  grams,
  tonnes,
  pounds,
  toKilograms,
  // Time
  seconds,
  minutes,
  hours,
  days,
  years,
  toSeconds,
  // Velocity
  metersPerSecond,
  kilometersPerHour,
  milesPerHour,
  knots,
  toMetersPerSecond,
  // Angle
  radians,
  degrees,
  toRadians,
  toDegrees,
  // Types
  type Quantity,
  type Dimensions,
  type LengthDim,
  type MassDim,
  type TimeDim,
  type VelocityDim,
  type AngleDim,
} from "./math/units";

/**
 * Validation
 * Input sanitization, bounds checking, NaN/Infinity handling
 */
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

/**
 * Constants
 * Astronomical constants (G, Earth radius, etc.)
 */
export * from "./constants";

// ============================================================================
// That's it. Build everything else from these blocks.
// ============================================================================
//
// For animations: Use Framer Motion, react-spring, or Three.js tweens
// For easing: Use CSS transitions or animation libraries
//
// **Performance Notes:**
// - WebGPU primitives: Use for large datasets (>5k points/triangles)
// - Three.js primitives: Use for 3D scenes with cameras and lighting
// - Automatic fallback: WebGPU primitives will fallback to CPU if unavailable
