/**
 * Physics Engine Primitives
 *
 * Composable physics system for aerospace and scientific simulations.
 * Provides integrators, forces, and constraints as building blocks.
 *
 * Architecture:
 * - Pure functions for maximum performance
 * - Type-safe vector math
 * - Multiple integrators (Euler, Verlet, RK4)
 * - Composable force system
 *
 * @reference Hairer, E., Nørsett, S.P. & Wanner, G. (1993). Solving Ordinary Differential Equations I
 * @reference Witkin, A. & Baraff, D. (2001). Physically Based Modeling: Principles and Practice
 */

// ============================================================================
// Vector Math
// ============================================================================

export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

export const vec3 = {
  add: (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s],
  div: (a: Vec3, s: number): Vec3 => [a[0] / s, a[1] / s, a[2] / s],
  dot: (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ],
  magnitude: (a: Vec3): number => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]),
  normalize: (a: Vec3): Vec3 => {
    const mag = vec3.magnitude(a);
    return mag > 0 ? vec3.div(a, mag) : [0, 0, 0];
  },
  zero: (): Vec3 => [0, 0, 0],
};

export const vec2 = {
  add: (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]],
  sub: (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]],
  mul: (a: Vec2, s: number): Vec2 => [a[0] * s, a[1] * s],
  div: (a: Vec2, s: number): Vec2 => [a[0] / s, a[1] / s],
  dot: (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1],
  magnitude: (a: Vec2): number => Math.sqrt(a[0] * a[0] + a[1] * a[1]),
  normalize: (a: Vec2): Vec2 => {
    const mag = vec2.magnitude(a);
    return mag > 0 ? vec2.div(a, mag) : [0, 0];
  },
  zero: (): Vec2 => [0, 0],
};

// ============================================================================
// Physics State
// ============================================================================

export interface PhysicsState {
  position: Vec3;
  velocity: Vec3;
  acceleration: Vec3;
  mass: number;
  time: number;
}

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

export type ForceFunction = (state: PhysicsState) => Vec3;
export type ForceFunction2D = (state: PhysicsState2D) => Vec2;

/**
 * Gravitational force
 *
 * F = -GMm/r² * r̂
 *
 * @param G - Gravitational constant (6.67430e-11 for SI units)
 * @param M - Mass of central body
 * @param center - Position of central body
 */
export function gravity(G: number, M: number, center: Vec3 = [0, 0, 0]): ForceFunction {
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
 * Drag force (atmosphere, friction)
 *
 * F = -½ρv²CdA * v̂
 *
 * @param density - Fluid density (kg/m³)
 * @param dragCoefficient - Cd (dimensionless)
 * @param area - Cross-sectional area (m²)
 */
export function drag(density: number, dragCoefficient: number, area: number): ForceFunction {
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
 * @param k - Spring constant (N/m)
 * @param restLength - Equilibrium length
 * @param anchor - Anchor point
 */
export function spring(k: number, restLength: number, anchor: Vec3): ForceFunction {
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
 * @param c - Damping coefficient
 */
export function damping(c: number): ForceFunction {
  return (state) => vec3.mul(state.velocity, -c);
}

/**
 * Constant force (thrust, uniform field)
 */
export function constant(force: Vec3): ForceFunction {
  return () => force;
}

/**
 * Combine multiple forces
 */
export function combine(...forces: ForceFunction[]): ForceFunction {
  return (state) => {
    return forces.reduce((acc, force) => vec3.add(acc, force(state)), vec3.zero());
  };
}

// ============================================================================
// Numerical Integrators
// ============================================================================

/**
 * Semi-implicit Euler method (Symplectic Euler)
 *
 * Most stable for orbital mechanics and spring systems.
 * Good balance of speed and accuracy.
 *
 * @reference Hairer et al. (1993)
 */
export function integrateEuler(
  state: PhysicsState,
  forces: ForceFunction,
  dt: number
): PhysicsState {
  const force = forces(state);
  const acceleration = vec3.div(force, state.mass);

  // Update velocity first (semi-implicit)
  const velocity = vec3.add(state.velocity, vec3.mul(acceleration, dt));

  // Then update position
  const position = vec3.add(state.position, vec3.mul(velocity, dt));

  return {
    ...state,
    position,
    velocity,
    acceleration,
    time: state.time + dt,
  };
}

/**
 * Verlet integration
 *
 * Excellent for orbital mechanics and constrained systems.
 * Time-reversible and energy-conserving.
 *
 * @reference Verlet, L. (1967). "Computer experiments on classical fluids"
 */
export function integrateVerlet(
  state: PhysicsState,
  prevPosition: Vec3,
  forces: ForceFunction,
  dt: number
): { state: PhysicsState; prevPosition: Vec3 } {
  const force = forces(state);
  const acceleration = vec3.div(force, state.mass);

  // Verlet position update
  const position = vec3.add(
    vec3.add(vec3.mul(state.position, 2), vec3.mul(prevPosition, -1)),
    vec3.mul(acceleration, dt * dt)
  );

  // Velocity from positions
  const velocity = vec3.div(vec3.sub(position, prevPosition), 2 * dt);

  return {
    state: {
      ...state,
      position,
      velocity,
      acceleration,
      time: state.time + dt,
    },
    prevPosition: state.position,
  };
}

/**
 * Runge-Kutta 4th order (RK4)
 *
 * High accuracy, slower than Euler.
 * Best for smooth, well-behaved systems.
 *
 * @reference Runge, C. (1895). "Über die numerische Auflösung von Differentialgleichungen"
 */
export function integrateRK4(
  state: PhysicsState,
  forces: ForceFunction,
  dt: number
): PhysicsState {
  const evaluate = (s: PhysicsState, dv: Vec3, dx: Vec3, dt: number) => {
    const newState = {
      ...s,
      position: vec3.add(s.position, vec3.mul(dx, dt)),
      velocity: vec3.add(s.velocity, vec3.mul(dv, dt)),
    };
    const force = forces(newState);
    const acceleration = vec3.div(force, newState.mass);
    return { acceleration, velocity: newState.velocity };
  };

  const k1 = evaluate(state, vec3.zero(), vec3.zero(), 0);
  const k2 = evaluate(state, k1.acceleration, k1.velocity, dt / 2);
  const k3 = evaluate(state, k2.acceleration, k2.velocity, dt / 2);
  const k4 = evaluate(state, k3.acceleration, k3.velocity, dt);

  const acceleration = vec3.div(
    vec3.add(
      vec3.add(k1.acceleration, vec3.mul(k2.acceleration, 2)),
      vec3.add(vec3.mul(k3.acceleration, 2), k4.acceleration)
    ),
    6
  );

  const velocity = vec3.add(
    state.velocity,
    vec3.mul(acceleration, dt)
  );

  const position = vec3.add(
    state.position,
    vec3.mul(
      vec3.div(
        vec3.add(
          vec3.add(k1.velocity, vec3.mul(k2.velocity, 2)),
          vec3.add(vec3.mul(k3.velocity, 2), k4.velocity)
        ),
        6
      ),
      dt
    )
  );

  return {
    ...state,
    position,
    velocity,
    acceleration,
    time: state.time + dt,
  };
}

// ============================================================================
// Orbital Mechanics Helpers
// ============================================================================

/**
 * Calculate orbital elements from state vector
 */
export interface OrbitalElements {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  longitudeAscendingNode: number;
  argumentOfPeriapsis: number;
  trueAnomaly: number;
}

export function stateToOrbitalElements(
  position: Vec3,
  velocity: Vec3,
  mu: number
): OrbitalElements {
  const r = vec3.magnitude(position);
  const v = vec3.magnitude(velocity);

  // Angular momentum
  const h = vec3.cross(position, velocity);
  const hMag = vec3.magnitude(h);

  // Eccentricity vector
  const e = vec3.sub(
    vec3.mul(vec3.cross(velocity, h), 1 / mu),
    vec3.div(position, r)
  );
  const eccentricity = vec3.magnitude(e);

  // Semi-major axis
  const energy = (v * v) / 2 - mu / r;
  const semiMajorAxis = -mu / (2 * energy);

  // Inclination
  const inclination = Math.acos(h[2] / hMag);

  // Node vector
  const n = vec3.cross([0, 0, 1], h);
  const nMag = vec3.magnitude(n);

  // Longitude of ascending node
  let longitudeAscendingNode = 0;
  if (nMag > 1e-10) {
    longitudeAscendingNode = Math.acos(n[0] / nMag);
    if (n[1] < 0) longitudeAscendingNode = 2 * Math.PI - longitudeAscendingNode;
  }

  // Argument of periapsis
  let argumentOfPeriapsis = 0;
  if (nMag > 1e-10 && eccentricity > 1e-10) {
    argumentOfPeriapsis = Math.acos(vec3.dot(n, e) / (nMag * eccentricity));
    if (e[2] < 0) argumentOfPeriapsis = 2 * Math.PI - argumentOfPeriapsis;
  }

  // True anomaly
  let trueAnomaly = 0;
  if (eccentricity > 1e-10) {
    trueAnomaly = Math.acos(vec3.dot(e, position) / (eccentricity * r));
    if (vec3.dot(position, velocity) < 0) trueAnomaly = 2 * Math.PI - trueAnomaly;
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

/**
 * Calculate energy of orbit
 */
export function orbitalEnergy(state: PhysicsState, mu: number): number {
  const r = vec3.magnitude(state.position);
  const v = vec3.magnitude(state.velocity);
  return (v * v) / 2 - mu / r;
}

/**
 * Calculate period of elliptical orbit
 */
export function orbitalPeriod(semiMajorAxis: number, mu: number): number {
  return 2 * Math.PI * Math.sqrt((semiMajorAxis ** 3) / mu);
}
