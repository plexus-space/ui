/**
 * Force Functions
 *
 * Composable force system for physics simulations.
 * Pure functions that can be combined to create complex force fields.
 *
 * @reference Hairer, E., Nørsett, S.P. & Wanner, G. (1993). Solving Ordinary Differential Equations I
 * @reference Witkin, A. & Baraff, D. (2001). Physically Based Modeling: Principles and Practice
 */

import { vec3 } from "../math/vectors";
import type { Vec3 } from "../math/vectors";
import type { ForceFunction } from "./types";

// ============================================================================
// Force Functions
// ============================================================================

/**
 * Gravitational force (Newton's law of universal gravitation)
 *
 * F = -GMm/r² * r̂
 *
 * Creates an attractive force toward a central body.
 * Used for orbital mechanics and celestial simulations.
 *
 * @param G - Gravitational constant (6.67430e-11 m³/(kg·s²) for SI units)
 * @param M - Mass of central body (kg)
 * @param center - Position of central body (default: origin)
 * @returns Force function
 *
 * @example
 * // Earth gravity (SI units)
 * const G = 6.67430e-11;
 * const M = 5.972e24; // Earth mass
 * const earthGravity = gravity(G, M, [0, 0, 0]);
 *
 * @example
 * // Simplified units (km, km/s, s)
 * const mu = 398600.4418; // Earth's gravitational parameter (km³/s²)
 * const earthGravity = gravity(1, mu, [0, 0, 0]);
 */
export function gravity(
  G: number,
  M: number,
  center: Vec3 = [0, 0, 0]
): ForceFunction {
  return (state) => {
    const r = vec3.sub(state.position, center);
    const rMag = vec3.magnitude(r);
    if (rMag < 1e-10) return vec3.zero();

    const rHat = vec3.normalize(r);
    const forceMag = -(G * M * state.mass) / (rMag * rMag);
    return vec3.mul(rHat, forceMag);
  };
}

/**
 * Drag force (atmosphere, fluid resistance)
 *
 * F = -½ρv²CdA * v̂
 *
 * Creates a force opposing motion through a fluid.
 * Quadratic drag model for turbulent flow (Re > 1000).
 *
 * @param density - Fluid density (kg/m³)
 * @param dragCoefficient - Cd (dimensionless, typically 0.1-2.0)
 * @param area - Cross-sectional area (m²)
 * @returns Force function
 *
 * @example
 * // Atmospheric drag at sea level
 * const rho = 1.225; // kg/m³
 * const Cd = 0.47; // Sphere
 * const A = Math.PI * 0.1 * 0.1; // 10cm radius
 * const atmosphericDrag = drag(rho, Cd, A);
 */
export function drag(
  density: number,
  dragCoefficient: number,
  area: number
): ForceFunction {
  const k = 0.5 * density * dragCoefficient * area;
  return (state) => {
    const vMag = vec3.magnitude(state.velocity);
    if (vMag < 1e-10) return vec3.zero();

    const vHat = vec3.normalize(state.velocity);
    const forceMag = -k * vMag * vMag;
    return vec3.mul(vHat, forceMag);
  };
}

/**
 * Spring force (Hooke's law)
 *
 * F = -k(x - x₀)
 *
 * Creates a restoring force proportional to displacement.
 * Used for elastic systems and oscillators.
 *
 * @param k - Spring constant (N/m)
 * @param restLength - Equilibrium length (m)
 * @param anchor - Anchor point (m)
 * @returns Force function
 *
 * @example
 * // Simple spring oscillator
 * const k = 100; // N/m
 * const restLength = 1.0; // m
 * const anchor = [0, 0, 0];
 * const springForce = spring(k, restLength, anchor);
 */
export function spring(
  k: number,
  restLength: number,
  anchor: Vec3
): ForceFunction {
  return (state) => {
    const displacement = vec3.sub(state.position, anchor);
    const distance = vec3.magnitude(displacement);
    if (distance < 1e-10) return vec3.zero();

    const direction = vec3.normalize(displacement);
    const extension = distance - restLength;
    return vec3.mul(direction, -k * extension);
  };
}

/**
 * Damping force (viscous friction)
 *
 * F = -cv
 *
 * Creates a force opposing velocity (linear drag).
 * Used for energy dissipation and stability.
 *
 * @param c - Damping coefficient (N·s/m)
 * @returns Force function
 *
 * @example
 * // Critical damping for spring system
 * const k = 100; // N/m
 * const m = 1.0; // kg
 * const c = 2 * Math.sqrt(k * m); // Critical damping
 * const dampingForce = damping(c);
 */
export function damping(c: number): ForceFunction {
  return (state) => vec3.mul(state.velocity, -c);
}

/**
 * Constant force (thrust, uniform field)
 *
 * F = constant
 *
 * Creates a constant force vector.
 * Used for thrust, uniform gravity fields, wind.
 *
 * @param force - Force vector (N)
 * @returns Force function
 *
 * @example
 * // Uniform gravity (Earth surface)
 * const g = 9.81; // m/s²
 * const m = 1.0; // kg
 * const gravityForce = constant([0, 0, -m * g]);
 *
 * @example
 * // Rocket thrust
 * const thrust = 1000; // N
 * const thrustForce = constant([0, 0, thrust]);
 */
export function constant(force: Vec3): ForceFunction {
  return () => force;
}

/**
 * Combine multiple forces
 *
 * Creates a composite force function that sums all input forces.
 * Supports arbitrary number of forces.
 *
 * @param forces - Force functions to combine
 * @returns Combined force function
 *
 * @example
 * // Orbital mechanics with drag
 * const forces = combine(
 *   gravity(1, 398600.4418), // Earth gravity
 *   drag(1e-12, 2.2, 10.0),  // Atmospheric drag
 *   damping(0.01)            // Numerical stability
 * );
 */
export function combine(...forces: ForceFunction[]): ForceFunction {
  return (state) => {
    return forces.reduce(
      (acc, force) => vec3.add(acc, force(state)),
      vec3.zero()
    );
  };
}
