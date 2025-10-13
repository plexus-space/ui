/**
 * Orbital Mechanics Utilities
 *
 * Shared functions for Keplerian orbital mechanics.
 * Implements analytical solutions for two-body problem.
 *
 * @reference Vallado, D. A. (2013). Fundamentals of Astrodynamics and Applications (4th ed.)
 * @reference Curtis, H. D. (2013). Orbital Mechanics for Engineering Students (3rd ed.)
 *
 * @example
 * ```tsx
 * import { computePositionAtAnomaly, solveKeplersEquation } from './orbital-mechanics';
 *
 * const { position, velocity } = computePositionAtAnomaly(orbit, trueAnomaly, EARTH_MU);
 * ```
 */

import type { Vec3 } from "./physics";

// ============================================================================
// Types
// ============================================================================

/**
 * Orbital elements for Keplerian orbit
 */
export interface OrbitalElements {
  /** Semi-major axis (km) */
  semiMajorAxis: number;
  /** Eccentricity (0-1 for elliptical orbits) */
  eccentricity: number;
  /** Inclination (degrees) */
  inclination: number;
  /** Longitude of ascending node (degrees) */
  longitudeOfAscendingNode?: number;
  /** Argument of periapsis (degrees) */
  argumentOfPeriapsis?: number;
  /** True anomaly (degrees) */
  trueAnomaly?: number;
}

// ============================================================================
// Kepler's Equation Solver
// ============================================================================

/**
 * Solve Kepler's equation using Newton-Raphson iteration
 *
 * Kepler's Equation: M = E - e*sin(E)
 * where M = mean anomaly, E = eccentric anomaly, e = eccentricity
 *
 * @param M - Mean anomaly (radians)
 * @param e - Eccentricity
 * @param tolerance - Convergence tolerance (default: 1e-8)
 * @param maxIterations - Maximum Newton-Raphson iterations (default: 10)
 * @returns Eccentric anomaly (radians)
 *
 * @reference Vallado, D. A. (2013). Fundamentals of Astrodynamics, Algorithm 2
 */
export function solveKeplersEquation(
  M: number,
  e: number,
  tolerance: number = 1e-8,
  maxIterations: number = 10
): number {
  // Initial guess (good for all eccentricities)
  let E = M + (e * Math.sin(M)) / (1 - Math.sin(M + e) + Math.sin(M));

  // Newton-Raphson iteration
  for (let i = 0; i < maxIterations; i++) {
    const f = E - e * Math.sin(E) - M; // Kepler's equation
    const fPrime = 1 - e * Math.cos(E); // Derivative

    const delta = f / fPrime;
    E = E - delta;

    if (Math.abs(delta) < tolerance) {
      break;
    }
  }

  return E;
}

// ============================================================================
// Anomaly Conversions
// ============================================================================

/**
 * Convert eccentric anomaly to true anomaly
 *
 * @param E - Eccentric anomaly (radians)
 * @param e - Eccentricity
 * @returns True anomaly (radians)
 *
 * @reference Vallado, D. A. (2013). Algorithm 4
 */
export function eccentricToTrueAnomaly(E: number, e: number): number {
  // ν = 2 * atan2(√(1+e)*sin(E/2), √(1-e)*cos(E/2))
  const sqrtFactor1 = Math.sqrt(1 + e);
  const sqrtFactor2 = Math.sqrt(1 - e);
  return (
    2 * Math.atan2(sqrtFactor1 * Math.sin(E / 2), sqrtFactor2 * Math.cos(E / 2))
  );
}

/**
 * Convert true anomaly to eccentric anomaly
 *
 * @param nu - True anomaly (radians)
 * @param e - Eccentricity
 * @returns Eccentric anomaly (radians)
 */
export function trueToEccentricAnomaly(nu: number, e: number): number {
  // E = 2 * atan2(√(1-e)*sin(ν/2), √(1+e)*cos(ν/2))
  const sqrtFactor1 = Math.sqrt(1 - e);
  const sqrtFactor2 = Math.sqrt(1 + e);
  return (
    2 *
    Math.atan2(sqrtFactor1 * Math.sin(nu / 2), sqrtFactor2 * Math.cos(nu / 2))
  );
}

/**
 * Convert mean anomaly to true anomaly
 *
 * @param M - Mean anomaly (radians)
 * @param e - Eccentricity
 * @returns True anomaly (radians)
 */
export function meanToTrueAnomaly(M: number, e: number): number {
  // Handle circular orbit (e ≈ 0)
  if (e < 1e-8) {
    return M;
  }

  // Solve Kepler's equation for eccentric anomaly
  const E = solveKeplersEquation(M, e);

  // Convert to true anomaly
  return eccentricToTrueAnomaly(E, e);
}

/**
 * Convert true anomaly to mean anomaly
 *
 * @param nu - True anomaly (radians)
 * @param e - Eccentricity
 * @returns Mean anomaly (radians)
 */
export function trueToMeanAnomaly(nu: number, e: number): number {
  // Handle circular orbit (e ≈ 0)
  if (e < 1e-8) {
    return nu;
  }

  // Convert to eccentric anomaly
  const E = trueToEccentricAnomaly(nu, e);

  // Convert to mean anomaly using Kepler's equation: M = E - e*sin(E)
  return E - e * Math.sin(E);
}

// ============================================================================
// Perifocal to ECI Rotation Matrix
// ============================================================================

/**
 * Create rotation matrix from perifocal to ECI frame
 *
 * Implements 3-1-3 Euler angle rotation: R3(-Ω) * R1(-i) * R3(-ω)
 *
 * @param Omega - Longitude of ascending node (radians)
 * @param i - Inclination (radians)
 * @param omega - Argument of periapsis (radians)
 * @returns Rotation matrix as 3x3 array [r11-r33]
 *
 * @reference Vallado, D. A. (2013). Eq. 2-52
 * @reference Curtis, H. D. (2013). Eq. 4.49
 */
export function createPerifocalToECIMatrix(
  Omega: number,
  i: number,
  omega: number
): number[][] {
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosi = Math.cos(i);
  const sini = Math.sin(i);
  const cosomega = Math.cos(omega);
  const sinomega = Math.sin(omega);

  // Precompute rotation matrix elements for efficiency (Vallado Eq. 2-52)
  const r11 = cosOmega * cosomega - sinOmega * sinomega * cosi;
  const r12 = -cosOmega * sinomega - sinOmega * cosomega * cosi;
  const r13 = sinOmega * sini;

  const r21 = sinOmega * cosomega + cosOmega * sinomega * cosi;
  const r22 = -sinOmega * sinomega + cosOmega * cosomega * cosi;
  const r23 = -cosOmega * sini;

  const r31 = sinomega * sini;
  const r32 = cosomega * sini;
  const r33 = cosi;

  return [
    [r11, r12, r13],
    [r21, r22, r23],
    [r31, r32, r33],
  ];
}

/**
 * Transform vector from perifocal to ECI frame
 *
 * @param v - Vector in perifocal frame [x, y, z]
 * @param matrix - Rotation matrix from createPerifocalToECIMatrix
 * @returns Vector in ECI frame [x, y, z]
 */
export function transformPerifocalToECI(v: Vec3, matrix: number[][]): Vec3 {
  return [
    matrix[0][0] * v[0] + matrix[0][1] * v[1] + matrix[0][2] * v[2],
    matrix[1][0] * v[0] + matrix[1][1] * v[1] + matrix[1][2] * v[2],
    matrix[2][0] * v[0] + matrix[2][1] * v[1] + matrix[2][2] * v[2],
  ];
}

// ============================================================================
// Position and Velocity Calculation
// ============================================================================

/**
 * Compute position and velocity at a specific true anomaly (analytical solution)
 *
 * This is MUCH faster than numerical integration because it's a direct
 * closed-form calculation. No integration needed.
 *
 * @param elements - Orbital elements
 * @param trueAnomaly - True anomaly in radians
 * @param mu - Gravitational parameter (km³/s²)
 * @returns Position (km) and velocity (km/s) in ECI frame
 *
 * @reference Curtis, H. D. (2013). Algorithm 4.5
 */
export function computePositionAtAnomaly(
  elements: OrbitalElements,
  trueAnomaly: number,
  mu: number
): { position: Vec3; velocity: Vec3 } {
  const { semiMajorAxis: a, eccentricity: e } = elements;

  // Convert angles to radians
  const i = ((elements.inclination || 0) * Math.PI) / 180;
  const Omega = ((elements.longitudeOfAscendingNode || 0) * Math.PI) / 180;
  const omega = ((elements.argumentOfPeriapsis || 0) * Math.PI) / 180;

  // Orbital radius at true anomaly
  const p = a * (1 - e * e); // semi-latus rectum
  const r = p / (1 + e * Math.cos(trueAnomaly));

  // Position in perifocal frame
  const posPerifocal: Vec3 = [
    r * Math.cos(trueAnomaly),
    r * Math.sin(trueAnomaly),
    0,
  ];

  // Velocity in perifocal frame
  const h = Math.sqrt(mu * p); // specific angular momentum
  const vPerifocal: Vec3 = [
    -(mu / h) * Math.sin(trueAnomaly),
    (mu / h) * (e + Math.cos(trueAnomaly)),
    0,
  ];

  // Create rotation matrix
  const matrix = createPerifocalToECIMatrix(Omega, i, omega);

  // Transform to ECI frame
  const position = transformPerifocalToECI(posPerifocal, matrix);
  const velocity = transformPerifocalToECI(vPerifocal, matrix);

  return { position, velocity };
}

/**
 * Pre-compute entire orbit path (analytical)
 *
 * Generates smooth orbit path using closed-form solutions.
 * This is computed ONCE and reused, making it extremely fast.
 *
 * @param elements - Orbital elements
 * @param numPoints - Number of points around orbit (default: 360)
 * @param mu - Gravitational parameter (km³/s²)
 * @returns Array of positions around the orbit
 */
export function computeOrbitPath(
  elements: OrbitalElements,
  numPoints: number = 360,
  mu: number
): Vec3[] {
  const path: Vec3[] = [];

  for (let i = 0; i < numPoints; i++) {
    const trueAnomaly = (i / numPoints) * 2 * Math.PI;
    const { position } = computePositionAtAnomaly(elements, trueAnomaly, mu);
    path.push(position);
  }

  // Close the loop
  if (numPoints > 0) {
    path.push(path[0]);
  }

  return path;
}
