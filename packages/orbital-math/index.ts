/**
 * @plexusui/orbital-math
 *
 * High-precision orbital mechanics utilities
 * Based on Vallado's "Fundamentals of Astrodynamics and Applications"
 */

// ============================================================================
// Constants
// ============================================================================

/** Gravitational parameter for Earth (km³/s²) */
export const MU_EARTH = 398600.4418;

/** Gravitational parameter for Sun (km³/s²) */
export const MU_SUN = 1.32712440018e11;

/** Gravitational parameter for Moon (km³/s²) */
export const MU_MOON = 4902.8;

/** Earth's radius (km) */
export const RADIUS_EARTH = 6378.137;

/** Convergence tolerance for iterative solvers */
export const EPSILON = 1e-10;

/** Maximum iterations for iterative solvers */
export const MAX_ITERATIONS = 50;

// ============================================================================
// Kepler's Equation Solvers
// ============================================================================

/**
 * Solve Kepler's equation: M = E - e·sin(E)
 * Using Newton-Raphson iteration
 *
 * @param M Mean anomaly (radians)
 * @param e Eccentricity
 * @param tolerance Convergence tolerance (default: 1e-10)
 * @returns Eccentric anomaly E (radians)
 *
 * Accuracy: Machine precision (~1e-14 radians)
 */
export function solveKeplerEquation(
  M: number,
  e: number,
  tolerance: number = EPSILON
): number {
  // Normalize M to [0, 2π]
  M = M % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;

  // Initial guess (smart starter from Vallado)
  let E: number;
  if (M < Math.PI) {
    E = M + e / 2;
  } else {
    E = M - e / 2;
  }

  // Newton-Raphson iteration
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const f = E - e * Math.sin(E) - M;
    const fPrime = 1 - e * Math.cos(E);
    const delta = f / fPrime;

    E = E - delta;

    if (Math.abs(delta) < tolerance) {
      return E;
    }
  }

  console.warn('Kepler equation did not converge');
  return E;
}

/**
 * Convert eccentric anomaly to true anomaly
 *
 * @param E Eccentric anomaly (radians)
 * @param e Eccentricity
 * @returns True anomaly ν (radians)
 */
export function eccentricToTrueAnomaly(E: number, e: number): number {
  const sinNu = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
  const cosNu = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  return Math.atan2(sinNu, cosNu);
}

/**
 * Convert mean anomaly to true anomaly
 *
 * @param M Mean anomaly (radians)
 * @param e Eccentricity
 * @returns True anomaly ν (radians)
 */
export function meanToTrueAnomaly(M: number, e: number): number {
  const E = solveKeplerEquation(M, e);
  return eccentricToTrueAnomaly(E, e);
}

/**
 * Convert true anomaly to eccentric anomaly
 *
 * @param nu True anomaly (radians)
 * @param e Eccentricity
 * @returns Eccentric anomaly E (radians)
 */
export function trueToEccentricAnomaly(nu: number, e: number): number {
  const cosE = (e + Math.cos(nu)) / (1 + e * Math.cos(nu));
  const sinE = (Math.sqrt(1 - e * e) * Math.sin(nu)) / (1 + e * Math.cos(nu));
  return Math.atan2(sinE, cosE);
}

// ============================================================================
// Lagrange Point Solvers
// ============================================================================

/**
 * Solve for L1 position using Newton-Raphson
 *
 * Solves: (1-μ)/(r+μ)² - μ/(r-1+μ)² - r = 0
 *
 * @param mu Mass ratio μ = m₂/(m₁+m₂)
 * @param tolerance Convergence tolerance
 * @returns Distance from barycenter (normalized to binary separation)
 *
 * Accuracy: Machine precision
 */
export function solveL1Position(
  mu: number,
  tolerance: number = EPSILON
): number {
  // Initial guess from first-order approximation
  let r = 1 - Math.pow(mu / 3, 1 / 3);

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const f = (1 - mu) / Math.pow(r + mu, 2) - mu / Math.pow(r - 1 + mu, 2) - r;
    const fPrime =
      -2 * (1 - mu) / Math.pow(r + mu, 3) +
      2 * mu / Math.pow(r - 1 + mu, 3) -
      1;

    const delta = f / fPrime;
    r = r - delta;

    if (Math.abs(delta) < tolerance) {
      return r;
    }
  }

  console.warn('L1 solver did not converge');
  return r;
}

/**
 * Solve for L2 position using Newton-Raphson
 *
 * @param mu Mass ratio
 * @param tolerance Convergence tolerance
 * @returns Distance from barycenter (normalized)
 */
export function solveL2Position(
  mu: number,
  tolerance: number = EPSILON
): number {
  // Initial guess
  let r = 1 + Math.pow(mu / 3, 1 / 3);

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const f = (1 - mu) / Math.pow(r + mu, 2) + mu / Math.pow(r - 1 + mu, 2) - r;
    const fPrime =
      -2 * (1 - mu) / Math.pow(r + mu, 3) -
      2 * mu / Math.pow(r - 1 + mu, 3) -
      1;

    const delta = f / fPrime;
    r = r - delta;

    if (Math.abs(delta) < tolerance) {
      return r;
    }
  }

  console.warn('L2 solver did not converge');
  return r;
}

/**
 * Solve for L3 position using Newton-Raphson
 *
 * @param mu Mass ratio
 * @param tolerance Convergence tolerance
 * @returns Distance from barycenter (normalized)
 */
export function solveL3Position(
  mu: number,
  tolerance: number = EPSILON
): number {
  // Initial guess
  let r = -1 - 5 * mu / 12;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const f = (1 - mu) / Math.pow(r + mu, 2) + mu / Math.pow(r - 1 + mu, 2) + r;
    const fPrime =
      -2 * (1 - mu) / Math.pow(r + mu, 3) -
      2 * mu / Math.pow(r - 1 + mu, 3) +
      1;

    const delta = f / fPrime;
    r = r - delta;

    if (Math.abs(delta) < tolerance) {
      return r;
    }
  }

  console.warn('L3 solver did not converge');
  return r;
}

// ============================================================================
// Orbital Elements Conversions
// ============================================================================

/**
 * Calculate orbital period from semi-major axis
 *
 * @param a Semi-major axis (km)
 * @param mu Gravitational parameter (km³/s²)
 * @returns Period (seconds)
 */
export function calculateOrbitalPeriod(a: number, mu: number = MU_EARTH): number {
  return 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu);
}

/**
 * Calculate mean motion (radians/second)
 *
 * @param a Semi-major axis (km)
 * @param mu Gravitational parameter (km³/s²)
 * @returns Mean motion n (rad/s)
 */
export function calculateMeanMotion(a: number, mu: number = MU_EARTH): number {
  return Math.sqrt(mu / Math.pow(a, 3));
}

/**
 * Calculate orbital velocity at given radius
 *
 * @param r Current radius (km)
 * @param a Semi-major axis (km)
 * @param mu Gravitational parameter (km³/s²)
 * @returns Velocity (km/s)
 */
export function calculateOrbitalVelocity(
  r: number,
  a: number,
  mu: number = MU_EARTH
): number {
  return Math.sqrt(mu * (2 / r - 1 / a));
}

/**
 * Calculate escape velocity at given radius
 *
 * @param r Radius (km)
 * @param mu Gravitational parameter (km³/s²)
 * @returns Escape velocity (km/s)
 */
export function calculateEscapeVelocity(r: number, mu: number = MU_EARTH): number {
  return Math.sqrt(2 * mu / r);
}

// ============================================================================
// Time & Position Propagation
// ============================================================================

/**
 * Propagate orbit to given time using mean anomaly
 *
 * @param M0 Initial mean anomaly (radians)
 * @param n Mean motion (rad/s)
 * @param dt Time step (seconds)
 * @returns New mean anomaly (radians)
 */
export function propagateMeanAnomaly(M0: number, n: number, dt: number): number {
  return (M0 + n * dt) % (2 * Math.PI);
}

/**
 * Calculate position and velocity from orbital elements
 *
 * @param elements Keplerian elements
 * @returns {position, velocity} in km and km/s
 */
export interface KeplerianElements {
  a: number; // semi-major axis (km)
  e: number; // eccentricity
  i: number; // inclination (rad)
  Omega: number; // RAAN (rad)
  omega: number; // argument of periapsis (rad)
  nu: number; // true anomaly (rad)
  mu?: number; // gravitational parameter (km³/s²)
}

export interface StateVector {
  position: [number, number, number];
  velocity: [number, number, number];
}

export function elementsToStateVector(elements: KeplerianElements): StateVector {
  const { a, e, i, Omega, omega, nu, mu = MU_EARTH } = elements;

  // Calculate in perifocal frame
  const p = a * (1 - e * e);
  const r = p / (1 + e * Math.cos(nu));

  const posP: [number, number, number] = [
    r * Math.cos(nu),
    r * Math.sin(nu),
    0
  ];

  const sqrtMuP = Math.sqrt(mu / p);
  const velP: [number, number, number] = [
    -sqrtMuP * Math.sin(nu),
    sqrtMuP * (e + Math.cos(nu)),
    0
  ];

  // Rotation matrices
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);

  // Perifocal to ECI transformation
  const R11 = cosOmega * cosW - sinOmega * sinW * cosI;
  const R12 = -cosOmega * sinW - sinOmega * cosW * cosI;
  const R21 = sinOmega * cosW + cosOmega * sinW * cosI;
  const R22 = -sinOmega * sinW + cosOmega * cosW * cosI;
  const R31 = sinW * sinI;
  const R32 = cosW * sinI;

  const position: [number, number, number] = [
    R11 * posP[0] + R12 * posP[1],
    R21 * posP[0] + R22 * posP[1],
    R31 * posP[0] + R32 * posP[1]
  ];

  const velocity: [number, number, number] = [
    R11 * velP[0] + R12 * velP[1],
    R21 * velP[0] + R22 * velP[1],
    R31 * velP[0] + R32 * velP[1]
  ];

  return { position, velocity };
}

// ============================================================================
// Delta-V Calculations
// ============================================================================

/**
 * Calculate Hohmann transfer delta-V
 *
 * @param r1 Initial radius (km)
 * @param r2 Final radius (km)
 * @param mu Gravitational parameter (km³/s²)
 * @returns {dv1, dv2, total} in m/s
 */
export function calculateHohmannDeltaV(
  r1: number,
  r2: number,
  mu: number = MU_EARTH
): { dv1: number; dv2: number; total: number } {
  const a_transfer = (r1 + r2) / 2;

  const v1_circular = Math.sqrt(mu / r1);
  const v2_circular = Math.sqrt(mu / r2);
  const v1_transfer = calculateOrbitalVelocity(r1, a_transfer, mu);
  const v2_transfer = calculateOrbitalVelocity(r2, a_transfer, mu);

  const dv1 = Math.abs(v1_transfer - v1_circular) * 1000; // to m/s
  const dv2 = Math.abs(v2_circular - v2_transfer) * 1000;

  return {
    dv1,
    dv2,
    total: dv1 + dv2
  };
}

// ============================================================================
// Exports
// ============================================================================

export const OrbitalMath = {
  // Constants
  MU_EARTH,
  MU_SUN,
  MU_MOON,
  RADIUS_EARTH,

  // Kepler solvers
  solveKeplerEquation,
  meanToTrueAnomaly,
  eccentricToTrueAnomaly,
  trueToEccentricAnomaly,

  // Lagrange solvers
  solveL1Position,
  solveL2Position,
  solveL3Position,

  // Orbital calculations
  calculateOrbitalPeriod,
  calculateMeanMotion,
  calculateOrbitalVelocity,
  calculateEscapeVelocity,

  // Propagation
  propagateMeanAnomaly,
  elementsToStateVector,

  // Delta-V
  calculateHohmannDeltaV,
};

export default OrbitalMath;
