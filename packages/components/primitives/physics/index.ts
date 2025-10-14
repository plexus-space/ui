/**
 * Physics Engine - Backwards Compatibility Re-exports
 *
 * Maintains backwards compatibility with old `import from './physics'` syntax
 * while organizing code into modular files.
 *
 * **New imports (preferred):**
 * ```typescript
 * import { vec3 } from './math/vectors'
 * import { integrateRK4 } from './physics/integrators'
 * import { gravity } from './physics/forces'
 * import { stateToOrbitalElements } from './physics/orbital'
 * ```
 *
 * **Old imports (still work):**
 * ```typescript
 * import { vec3, integrateRK4, gravity } from './physics'
 * ```
 *
 * @deprecated Use direct imports from submodules instead
 */

// ============================================================================
// Re-export vectors from math (backwards compatibility)
// ============================================================================

export { vec3, vec2, type Vec3, type Vec2 } from "../math/vectors";

// ============================================================================
// Re-export types
// ============================================================================

export type {
  PhysicsState,
  PhysicsState2D,
  ForceFunction,
  ForceFunction2D,
  OrbitalElements,
} from "./types";

// ============================================================================
// Re-export forces
// ============================================================================

export { gravity, drag, spring, damping, constant, combine } from "./forces";

// ============================================================================
// Re-export integrators
// ============================================================================

export {
  integrateEuler,
  integrateVerlet,
  integrateRK4,
} from "./integrators";

// ============================================================================
// Re-export orbital mechanics
// ============================================================================

export {
  stateToOrbitalElements,
  orbitalEnergy,
  orbitalPeriod,
  angularMomentum,
  visVivaVelocity,
} from "./orbital";
