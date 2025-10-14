/**
 * Orbital Mechanics Helpers
 *
 * Utilities for analyzing and converting between orbital representations.
 * Implements classical Keplerian orbital mechanics.
 *
 * @reference Vallado, D. A. (2013). Fundamentals of Astrodynamics and Applications, 4th ed.
 * @reference Curtis, H. D. (2014). Orbital Mechanics for Engineering Students, 3rd ed.
 */

import { vec3 } from "../math/vectors";
import type { Vec3 } from "../math/vectors";
import type { PhysicsState, OrbitalElements } from "./types";

// ============================================================================
// Orbital Elements Conversion
// ============================================================================

/**
 * Convert Cartesian state vector to classical orbital elements
 *
 * Transforms position and velocity vectors into the 6 Keplerian elements.
 * Handles special cases for circular, equatorial, and circular equatorial orbits.
 * Uses robust numerical methods to avoid singularities.
 *
 * **Singularities handled:**
 * - Circular orbits (e ≈ 0): Use argument of latitude instead of true anomaly
 * - Equatorial orbits (i ≈ 0): Use longitude of periapsis instead of RAAN + ω
 * - Circular equatorial: Use true longitude
 *
 * @param position - Position vector (km)
 * @param velocity - Velocity vector (km/s)
 * @param mu - Gravitational parameter (km³/s²) - typically 398600.4418 for Earth
 * @returns Orbital elements
 *
 * @reference Vallado (2013), Algorithm 9: RV2COE
 *
 * @example
 * // ISS-like orbit
 * const position = [6678, 0, 0]; // km
 * const velocity = [0, 7.5, 0.5]; // km/s
 * const mu = 398600.4418; // Earth
 * const elements = stateToOrbitalElements(position, velocity, mu);
 * console.log(`a=${elements.semiMajorAxis}, e=${elements.eccentricity}, i=${elements.inclination * 180 / Math.PI}°`);
 */
export function stateToOrbitalElements(
  position: Vec3,
  velocity: Vec3,
  mu: number
): OrbitalElements {
  const TOL = 1e-8; // Tolerance for singularity detection

  const r = vec3.magnitude(position);
  const v = vec3.magnitude(velocity);

  // Angular momentum vector h = r × v
  const h = vec3.cross(position, velocity);
  const hMag = vec3.magnitude(h);

  // Node vector n = K × h (points toward ascending node)
  const K: Vec3 = [0, 0, 1];
  const n = vec3.cross(K, h);
  const nMag = vec3.magnitude(n);

  // Eccentricity vector e = (v × h)/μ - r̂
  const e_vec = vec3.sub(
    vec3.mul(vec3.cross(velocity, h), 1 / mu),
    vec3.div(position, r)
  );
  const eccentricity = vec3.magnitude(e_vec);

  // Specific orbital energy ε = v²/2 - μ/r
  const energy = (v * v) / 2 - mu / r;

  // Semi-major axis a = -μ/(2ε)
  // For parabolic/hyperbolic orbits (ε ≥ 0), use current radius
  const semiMajorAxis = Math.abs(energy) > TOL ? -mu / (2 * energy) : r;

  // Inclination i = arccos(hz / |h|)
  // Clamp to [-1, 1] to avoid numerical issues with acos
  const cosI = Math.max(-1, Math.min(1, h[2] / hMag));
  const inclination = Math.acos(cosI);

  // Detect special cases
  const isCircular = eccentricity < TOL;
  const isEquatorial =
    Math.abs(inclination) < TOL || Math.abs(inclination - Math.PI) < TOL;

  // Longitude of ascending node (RAAN) Ω
  let longitudeAscendingNode = 0;
  if (!isEquatorial && nMag > TOL) {
    // Standard case: inclined orbit
    const cosOmega = Math.max(-1, Math.min(1, n[0] / nMag));
    longitudeAscendingNode = Math.acos(cosOmega);
    // Quadrant check: if ny < 0, Ω is in [π, 2π]
    if (n[1] < 0) {
      longitudeAscendingNode = 2 * Math.PI - longitudeAscendingNode;
    }
  }

  // Argument of periapsis ω
  let argumentOfPeriapsis = 0;
  if (!isCircular) {
    if (!isEquatorial && nMag > TOL) {
      // Standard case: eccentric + inclined orbit
      // ω = arccos(n · e / (|n| |e|))
      const cosOmega_arg = Math.max(
        -1,
        Math.min(1, vec3.dot(n, e_vec) / (nMag * eccentricity))
      );
      argumentOfPeriapsis = Math.acos(cosOmega_arg);
      // Quadrant check: if ez < 0, ω is in [π, 2π]
      if (e_vec[2] < 0) {
        argumentOfPeriapsis = 2 * Math.PI - argumentOfPeriapsis;
      }
    } else {
      // Equatorial eccentric orbit: use longitude of periapsis
      // ω_true = arccos(ex / |e|)
      const cosOmega_arg = Math.max(-1, Math.min(1, e_vec[0] / eccentricity));
      argumentOfPeriapsis = Math.acos(cosOmega_arg);
      // Quadrant check: if ey < 0, ω is in [π, 2π]
      if (e_vec[1] < 0) {
        argumentOfPeriapsis = 2 * Math.PI - argumentOfPeriapsis;
      }
    }
  }

  // True anomaly ν
  let trueAnomaly = 0;
  if (!isCircular) {
    // Eccentric orbit: ν = arccos(e · r / (|e| |r|))
    const cosNu = Math.max(
      -1,
      Math.min(1, vec3.dot(e_vec, position) / (eccentricity * r))
    );
    trueAnomaly = Math.acos(cosNu);
    // Quadrant check: if r · v < 0, satellite is past apoapsis
    if (vec3.dot(position, velocity) < 0) {
      trueAnomaly = 2 * Math.PI - trueAnomaly;
    }
  } else {
    // Circular orbit: use argument of latitude
    if (!isEquatorial && nMag > TOL) {
      // Circular inclined: u = arccos(n · r / (|n| |r|))
      const cosU = Math.max(
        -1,
        Math.min(1, vec3.dot(n, position) / (nMag * r))
      );
      trueAnomaly = Math.acos(cosU);
      // Quadrant check: if rz < 0, u is in [π, 2π]
      if (position[2] < 0) {
        trueAnomaly = 2 * Math.PI - trueAnomaly;
      }
    } else {
      // Circular equatorial: use true longitude
      // λ_true = arccos(rx / |r|)
      const cosL = Math.max(-1, Math.min(1, position[0] / r));
      trueAnomaly = Math.acos(cosL);
      // Quadrant check: if ry < 0, λ is in [π, 2π]
      if (position[1] < 0) {
        trueAnomaly = 2 * Math.PI - trueAnomaly;
      }
    }
  }

  return {
    semiMajorAxis,
    eccentricity,
    inclination,
    longitudeAscendingNode,
    argumentOfPeriapsis,
    trueAnomaly,
  };
}

// ============================================================================
// Orbital Energy & Period
// ============================================================================

/**
 * Calculate specific orbital energy
 *
 * ε = v²/2 - μ/r
 *
 * The vis-viva equation relates orbital energy to position and velocity.
 * Constant for all points on a given orbit (conservation of energy).
 *
 * @param state - Physics state
 * @param mu - Gravitational parameter (km³/s²)
 * @returns Specific orbital energy (km²/s²)
 *
 * Energy interpretation:
 * - ε < 0: Bound elliptical orbit
 * - ε = 0: Parabolic escape trajectory
 * - ε > 0: Hyperbolic escape trajectory
 *
 * @example
 * const state = { position: [7000, 0, 0], velocity: [0, 7.5, 0], mass: 1000, time: 0 };
 * const energy = orbitalEnergy(state, 398600.4418);
 * if (energy < 0) console.log("Bound orbit");
 */
export function orbitalEnergy(state: PhysicsState, mu: number): number {
  const r = vec3.magnitude(state.position);
  const v = vec3.magnitude(state.velocity);
  return (v * v) / 2 - mu / r;
}

/**
 * Calculate orbital period for elliptical orbit
 *
 * T = 2π√(a³/μ)
 *
 * Kepler's third law relates period to semi-major axis.
 * Only valid for bound elliptical orbits (a > 0).
 *
 * @param semiMajorAxis - Semi-major axis (km)
 * @param mu - Gravitational parameter (km³/s²)
 * @returns Orbital period (seconds)
 *
 * @example
 * // ISS orbital period
 * const a = 6778; // km
 * const mu = 398600.4418; // Earth
 * const T = orbitalPeriod(a, mu);
 * console.log(`Period: ${(T / 60).toFixed(1)} minutes`); // ~92 minutes
 *
 * @example
 * // Geostationary orbit
 * const a_geo = 42164; // km
 * const T_geo = orbitalPeriod(a_geo, mu);
 * console.log(`Period: ${(T_geo / 3600).toFixed(1)} hours`); // 24 hours
 */
export function orbitalPeriod(semiMajorAxis: number, mu: number): number {
  return 2 * Math.PI * Math.sqrt((semiMajorAxis ** 3) / mu);
}

/**
 * Calculate orbital angular momentum magnitude
 *
 * h = |r × v|
 *
 * Conserved quantity for unperturbed Keplerian orbits.
 *
 * @param position - Position vector (km)
 * @param velocity - Velocity vector (km/s)
 * @returns Angular momentum magnitude (km²/s)
 *
 * @example
 * const h = angularMomentum([7000, 0, 0], [0, 7.5, 0]);
 * console.log(`h = ${h} km²/s`);
 */
export function angularMomentum(position: Vec3, velocity: Vec3): number {
  return vec3.magnitude(vec3.cross(position, velocity));
}

/**
 * Calculate vis-viva velocity at a given radius
 *
 * v = √(μ(2/r - 1/a))
 *
 * Calculates orbital velocity at any point on an ellipse.
 *
 * @param r - Current orbital radius (km)
 * @param a - Semi-major axis (km)
 * @param mu - Gravitational parameter (km³/s²)
 * @returns Orbital speed (km/s)
 *
 * @example
 * // Velocity at periapsis of ISS orbit
 * const r_p = 6378 + 400; // 400km altitude
 * const a = 6778; // semi-major axis
 * const v_p = visVivaVelocity(r_p, a, 398600.4418);
 * console.log(`Periapsis velocity: ${v_p.toFixed(2)} km/s`);
 */
export function visVivaVelocity(r: number, a: number, mu: number): number {
  return Math.sqrt(mu * (2 / r - 1 / a));
}
