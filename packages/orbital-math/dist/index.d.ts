/**
 * @plexusui/orbital-math
 *
 * High-precision orbital mechanics utilities
 * Based on Vallado's "Fundamentals of Astrodynamics and Applications"
 */
/** Gravitational parameter for Earth (km³/s²) */
export declare const MU_EARTH = 398600.4418;
/** Gravitational parameter for Sun (km³/s²) */
export declare const MU_SUN = 132712440018;
/** Gravitational parameter for Moon (km³/s²) */
export declare const MU_MOON = 4902.8;
/** Earth's radius (km) */
export declare const RADIUS_EARTH = 6378.137;
/** Convergence tolerance for iterative solvers */
export declare const EPSILON = 1e-10;
/** Maximum iterations for iterative solvers */
export declare const MAX_ITERATIONS = 50;
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
export declare function solveKeplerEquation(M: number, e: number, tolerance?: number): number;
/**
 * Convert eccentric anomaly to true anomaly
 *
 * @param E Eccentric anomaly (radians)
 * @param e Eccentricity
 * @returns True anomaly ν (radians)
 */
export declare function eccentricToTrueAnomaly(E: number, e: number): number;
/**
 * Convert mean anomaly to true anomaly
 *
 * @param M Mean anomaly (radians)
 * @param e Eccentricity
 * @returns True anomaly ν (radians)
 */
export declare function meanToTrueAnomaly(M: number, e: number): number;
/**
 * Convert true anomaly to eccentric anomaly
 *
 * @param nu True anomaly (radians)
 * @param e Eccentricity
 * @returns Eccentric anomaly E (radians)
 */
export declare function trueToEccentricAnomaly(nu: number, e: number): number;
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
export declare function solveL1Position(mu: number, tolerance?: number): number;
/**
 * Solve for L2 position using Newton-Raphson
 *
 * @param mu Mass ratio
 * @param tolerance Convergence tolerance
 * @returns Distance from barycenter (normalized)
 */
export declare function solveL2Position(mu: number, tolerance?: number): number;
/**
 * Solve for L3 position using Newton-Raphson
 *
 * @param mu Mass ratio
 * @param tolerance Convergence tolerance
 * @returns Distance from barycenter (normalized)
 */
export declare function solveL3Position(mu: number, tolerance?: number): number;
/**
 * Calculate orbital period from semi-major axis
 *
 * @param a Semi-major axis (km)
 * @param mu Gravitational parameter (km³/s²)
 * @returns Period (seconds)
 */
export declare function calculateOrbitalPeriod(a: number, mu?: number): number;
/**
 * Calculate mean motion (radians/second)
 *
 * @param a Semi-major axis (km)
 * @param mu Gravitational parameter (km³/s²)
 * @returns Mean motion n (rad/s)
 */
export declare function calculateMeanMotion(a: number, mu?: number): number;
/**
 * Calculate orbital velocity at given radius
 *
 * @param r Current radius (km)
 * @param a Semi-major axis (km)
 * @param mu Gravitational parameter (km³/s²)
 * @returns Velocity (km/s)
 */
export declare function calculateOrbitalVelocity(r: number, a: number, mu?: number): number;
/**
 * Calculate escape velocity at given radius
 *
 * @param r Radius (km)
 * @param mu Gravitational parameter (km³/s²)
 * @returns Escape velocity (km/s)
 */
export declare function calculateEscapeVelocity(r: number, mu?: number): number;
/**
 * Propagate orbit to given time using mean anomaly
 *
 * @param M0 Initial mean anomaly (radians)
 * @param n Mean motion (rad/s)
 * @param dt Time step (seconds)
 * @returns New mean anomaly (radians)
 */
export declare function propagateMeanAnomaly(M0: number, n: number, dt: number): number;
/**
 * Calculate position and velocity from orbital elements
 *
 * @param elements Keplerian elements
 * @returns {position, velocity} in km and km/s
 */
export interface KeplerianElements {
    a: number;
    e: number;
    i: number;
    Omega: number;
    omega: number;
    nu: number;
    mu?: number;
}
export interface StateVector {
    position: [number, number, number];
    velocity: [number, number, number];
}
export declare function elementsToStateVector(elements: KeplerianElements): StateVector;
/**
 * Calculate Hohmann transfer delta-V
 *
 * @param r1 Initial radius (km)
 * @param r2 Final radius (km)
 * @param mu Gravitational parameter (km³/s²)
 * @returns {dv1, dv2, total} in m/s
 */
export declare function calculateHohmannDeltaV(r1: number, r2: number, mu?: number): {
    dv1: number;
    dv2: number;
    total: number;
};
export declare const OrbitalMath: {
    MU_EARTH: number;
    MU_SUN: number;
    MU_MOON: number;
    RADIUS_EARTH: number;
    solveKeplerEquation: typeof solveKeplerEquation;
    meanToTrueAnomaly: typeof meanToTrueAnomaly;
    eccentricToTrueAnomaly: typeof eccentricToTrueAnomaly;
    trueToEccentricAnomaly: typeof trueToEccentricAnomaly;
    solveL1Position: typeof solveL1Position;
    solveL2Position: typeof solveL2Position;
    solveL3Position: typeof solveL3Position;
    calculateOrbitalPeriod: typeof calculateOrbitalPeriod;
    calculateMeanMotion: typeof calculateMeanMotion;
    calculateOrbitalVelocity: typeof calculateOrbitalVelocity;
    calculateEscapeVelocity: typeof calculateEscapeVelocity;
    propagateMeanAnomaly: typeof propagateMeanAnomaly;
    elementsToStateVector: typeof elementsToStateVector;
    calculateHohmannDeltaV: typeof calculateHohmannDeltaV;
};
export default OrbitalMath;
//# sourceMappingURL=index.d.ts.map