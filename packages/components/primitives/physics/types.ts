/**
 * Physics Types
 *
 * Type definitions for physics simulations.
 */

import type { Vec2, Vec3 } from "../math/vectors";

// ============================================================================
// Physics State
// ============================================================================

/**
 * 3D Physics state
 *
 * Complete state description for a particle in 3D space.
 */
export interface PhysicsState {
  position: Vec3;
  velocity: Vec3;
  acceleration: Vec3;
  mass: number;
  time: number;
}

/**
 * 2D Physics state
 *
 * Complete state description for a particle in 2D space.
 */
export interface PhysicsState2D {
  position: Vec2;
  velocity: Vec2;
  acceleration: Vec2;
  mass: number;
  time: number;
}

// ============================================================================
// Force Functions
// ============================================================================

/**
 * Force function type (3D)
 *
 * Takes a physics state and returns a force vector.
 * Pure function for composability.
 */
export type ForceFunction = (state: PhysicsState) => Vec3;

/**
 * Force function type (2D)
 *
 * Takes a 2D physics state and returns a 2D force vector.
 * Pure function for composability.
 */
export type ForceFunction2D = (state: PhysicsState2D) => Vec2;

// ============================================================================
// Orbital Elements
// ============================================================================

/**
 * Classical orbital elements (Keplerian elements)
 *
 * Complete description of an orbit using 6 parameters.
 *
 * @reference Vallado, D. A. (2013). Fundamentals of Astrodynamics and Applications
 */
export interface OrbitalElements {
  /**
   * Semi-major axis (km)
   * - For elliptical orbits: average of periapsis and apoapsis
   * - For circular orbits: equals orbital radius
   */
  semiMajorAxis: number;

  /**
   * Eccentricity (dimensionless)
   * - 0 = circular
   * - 0 < e < 1 = elliptical
   * - e = 1 = parabolic
   * - e > 1 = hyperbolic
   */
  eccentricity: number;

  /**
   * Inclination (radians)
   * Angle between orbital plane and reference plane
   * Range: [0, π]
   */
  inclination: number;

  /**
   * Longitude of ascending node (RAAN) (radians)
   * Angle from reference direction to ascending node
   * Range: [0, 2π]
   */
  longitudeAscendingNode: number;

  /**
   * Argument of periapsis (radians)
   * Angle from ascending node to periapsis
   * Range: [0, 2π]
   */
  argumentOfPeriapsis: number;

  /**
   * True anomaly (radians)
   * Angle from periapsis to current position
   * Range: [0, 2π]
   */
  trueAnomaly: number;
}
