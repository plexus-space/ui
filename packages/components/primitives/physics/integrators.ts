/**
 * Numerical Integrators
 *
 * Time-stepping algorithms for solving ordinary differential equations (ODEs).
 * Used to evolve physics simulations forward in time.
 *
 * @reference Hairer, E., Nørsett, S.P. & Wanner, G. (1993). Solving Ordinary Differential Equations I
 * @reference Press, W. H., et al. (2007). Numerical Recipes: The Art of Scientific Computing
 */

import { vec3 } from "../math/vectors";
import type { Vec3 } from "../math/vectors";
import type { PhysicsState, ForceFunction } from "./types";

// ============================================================================
// Numerical Integrators
// ============================================================================

/**
 * Semi-implicit Euler method (Symplectic Euler)
 *
 * A simple first-order integrator with good stability properties.
 * Updates velocity first, then position using the new velocity.
 *
 * **Pros:**
 * - Fast and simple
 * - Symplectic (conserves energy better than explicit Euler)
 * - Good for stiff systems (springs, constraints)
 * - Stable for orbital mechanics
 *
 * **Cons:**
 * - First-order accuracy (error ~ O(dt))
 * - Can drift over very long simulations
 *
 * **Best for:**
 * - Real-time simulations
 * - Spring systems and constraints
 * - Orbital mechanics (when coupled with small timesteps)
 *
 * @param state - Current physics state
 * @param forces - Force function
 * @param dt - Timestep (seconds)
 * @returns New physics state
 *
 * @reference Hairer et al. (1993), Chapter II.1
 *
 * @example
 * const forces = combine(gravity(1, 398600.4418), drag(1e-12, 2.2, 10));
 * let state = { position: [7000, 0, 0], velocity: [0, 7.5, 0], mass: 1000, time: 0 };
 * state = integrateEuler(state, forces, 0.1);
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

  // Then update position using new velocity
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
 * Verlet integration (Störmer-Verlet)
 *
 * A second-order symplectic integrator that stores position history.
 * Excellent energy conservation and time-reversibility.
 *
 * **Pros:**
 * - Second-order accuracy (error ~ O(dt²))
 * - Symplectic and time-reversible
 * - Excellent energy conservation
 * - No velocity drift
 *
 * **Cons:**
 * - Requires storing previous position
 * - Velocity calculation is approximate
 * - Harder to implement constraints
 *
 * **Best for:**
 * - Long-term orbital mechanics
 * - Molecular dynamics
 * - Systems where energy conservation is critical
 *
 * @param state - Current physics state
 * @param prevPosition - Position at previous timestep
 * @param forces - Force function
 * @param dt - Timestep (seconds)
 * @returns New state and previous position (for next iteration)
 *
 * @reference Verlet, L. (1967). "Computer experiments on classical fluids"
 *
 * @example
 * const forces = gravity(1, 398600.4418);
 * let state = { position: [7000, 0, 0], velocity: [0, 7.5, 0], mass: 1000, time: 0 };
 * let prevPosition = vec3.sub(state.position, vec3.mul(state.velocity, dt));
 *
 * const result = integrateVerlet(state, prevPosition, forces, dt);
 * state = result.state;
 * prevPosition = result.prevPosition;
 */
export function integrateVerlet(
  state: PhysicsState,
  prevPosition: Vec3,
  forces: ForceFunction,
  dt: number
): { state: PhysicsState; prevPosition: Vec3 } {
  const force = forces(state);
  const acceleration = vec3.div(force, state.mass);

  // Verlet position update: x(t+dt) = 2*x(t) - x(t-dt) + a(t)*dt²
  const position = vec3.add(
    vec3.add(vec3.mul(state.position, 2), vec3.mul(prevPosition, -1)),
    vec3.mul(acceleration, dt * dt)
  );

  // Velocity from finite difference: v(t) = (x(t+dt) - x(t-dt)) / (2*dt)
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
 * A fourth-order explicit integrator with excellent accuracy.
 * Industry standard for high-precision simulations.
 *
 * **Pros:**
 * - Fourth-order accuracy (error ~ O(dt⁴))
 * - Very accurate for smooth systems
 * - No history needed
 * - Well-tested and reliable
 *
 * **Cons:**
 * - Slower (4 force evaluations per step)
 * - Not symplectic (energy drift over long times)
 * - Overkill for simple systems
 *
 * **Best for:**
 * - High-precision trajectory calculations
 * - Smooth, well-behaved systems
 * - Short to medium duration simulations
 * - Scientific computing where accuracy matters
 *
 * @param state - Current physics state
 * @param forces - Force function
 * @param dt - Timestep (seconds)
 * @returns New physics state
 *
 * @reference Runge, C. (1895). "Über die numerische Auflösung von Differentialgleichungen"
 * @reference Kutta, W. (1901). "Beitrag zur näherungsweisen Integration totaler Differentialgleichungen"
 *
 * @example
 * const forces = combine(gravity(1, 398600.4418), drag(1e-12, 2.2, 10));
 * let state = { position: [7000, 0, 0], velocity: [0, 7.5, 0], mass: 1000, time: 0 };
 * state = integrateRK4(state, forces, 1.0); // Can use larger timesteps than Euler
 */
export function integrateRK4(
  state: PhysicsState,
  forces: ForceFunction,
  dt: number
): PhysicsState {
  /**
   * Helper function to evaluate derivatives at intermediate points
   *
   * @param s - Current state
   * @param dv - Velocity derivative (acceleration)
   * @param dx - Position derivative (velocity)
   * @param dt - Time offset
   * @returns Derivatives at intermediate point
   */
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

  // Four RK4 evaluations
  const k1 = evaluate(state, vec3.zero(), vec3.zero(), 0);
  const k2 = evaluate(state, k1.acceleration, k1.velocity, dt / 2);
  const k3 = evaluate(state, k2.acceleration, k2.velocity, dt / 2);
  const k4 = evaluate(state, k3.acceleration, k3.velocity, dt);

  // Weighted average of derivatives
  // acceleration = (k1 + 2*k2 + 2*k3 + k4) / 6
  const acceleration = vec3.div(
    vec3.add(
      vec3.add(k1.acceleration, vec3.mul(k2.acceleration, 2)),
      vec3.add(vec3.mul(k3.acceleration, 2), k4.acceleration)
    ),
    6
  );

  // Update velocity
  const velocity = vec3.add(state.velocity, vec3.mul(acceleration, dt));

  // Update position using weighted average of velocities
  // position = position + (k1.v + 2*k2.v + 2*k3.v + k4.v) / 6 * dt
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
