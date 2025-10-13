/**
 * Plexus UI Primitives - Minimal Building Blocks
 *
 * **Philosophy: Less is more**
 * - 6 rendering primitives (all GPU-accelerated)
 * - Core physics & math utilities
 * - Zero bloat, zero dependencies on unused code
 *
 * **The 6 Building Blocks:**
 * 1. LineRenderer - GPU lines (orbits, trajectories, waveforms)
 * 2. Marker - Billboards (satellites, waypoints)
 * 3. Trail - Streaming trails (satellite paths)
 * 4. OrbitPath - Analytical orbits (Keplerian)
 * 5. Sphere - Planets & celestial bodies
 * 6. Clouds - Atmospheric effects
 *
 * Everything else has been removed. Build what you need from these blocks.
 */

// ============================================================================
// 🎨 RENDERING PRIMITIVES (The 6 Core)
// ============================================================================

/**
 * LineRenderer - GPU-accelerated polylines
 * 100k+ points at 60fps, zero-copy updates, LOD
 */
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

/**
 * Marker - Simple billboards
 * Lightweight, emissive, always faces camera
 */
export { Marker, type MarkerProps } from "./marker";

/**
 * Trail - Streaming trails
 * GPU-accelerated via LineRenderer, circular buffer
 */
export { Trail, type TrailProps } from "./trail";

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
} from "./sphere";

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
  type Vec3,
  type Vec2,
  type PhysicsState,
  type PhysicsState2D,
  type ForceFunction,
  type ForceFunction2D,
  type OrbitalElements,
} from "./physics";

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
} from "./units";

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

// ============================================================================
// That's it. Build everything else from these blocks.
// ============================================================================
//
// For animations: Use Framer Motion, react-spring, or Three.js tweens
// For easing: Use CSS transitions or animation libraries
