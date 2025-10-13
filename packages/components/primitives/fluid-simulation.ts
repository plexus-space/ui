/**
 * Fluid Simulation Primitives
 *
 * Composable fluid dynamics system using SPH and Lattice Boltzmann methods.
 * Enables blood flow, aerodynamics, and general CFD visualizations.
 *
 * Methods:
 * - SPH (Smoothed Particle Hydrodynamics) - Lagrangian particle-based
 * - Lattice Boltzmann Method (LBM) - Eulerian grid-based
 *
 * @reference Monaghan, J.J. (2005). "Smoothed particle hydrodynamics"
 * @reference Chen, S. & Doolen, G.D. (1998). "Lattice Boltzmann Method for Fluid Flows"
 * @reference Müller, M. et al. (2003). "Particle-Based Fluid Simulation for Interactive Applications" (SIGGRAPH)
 */

import { Vec3, Vec2, vec3, vec2 } from "./physics";

// ============================================================================
// SPH - Smoothed Particle Hydrodynamics
// ============================================================================

/**
 * SPH Particle State
 */
export interface SPHParticle {
  /** Position in space */
  position: Vec3;
  /** Velocity */
  velocity: Vec3;
  /** Acceleration (computed each step) */
  acceleration: Vec3;
  /** Density */
  density: number;
  /** Pressure */
  pressure: number;
  /** Mass */
  mass: number;
  /** Color/scalar field value (for visualization) */
  color?: number;
}

/**
 * SPH Particle State (2D variant)
 */
export interface SPHParticle2D {
  position: Vec2;
  velocity: Vec2;
  acceleration: Vec2;
  density: number;
  pressure: number;
  mass: number;
  color?: number;
}

/**
 * SPH Simulation Parameters
 */
export interface SPHParameters {
  /** Smoothing radius (kernel support) */
  smoothingRadius: number;
  /** Rest density */
  restDensity: number;
  /** Gas constant (stiffness) */
  gasConstant: number;
  /** Viscosity coefficient */
  viscosity: number;
  /** Gravity */
  gravity: Vec3;
  /** Time step */
  dt: number;
  /** Surface tension coefficient */
  surfaceTension?: number;
}

/**
 * SPH Kernel Functions
 *
 * Poly6 kernel for density and pressure.
 * Spiky kernel for pressure gradient.
 * Viscosity kernel for viscosity forces.
 *
 * @reference Müller et al. (2003)
 */

/**
 * Poly6 kernel for density calculation
 * W(r, h) = (315 / (64πh⁹)) * (h² - r²)³  for r < h
 */
function kernelPoly6(r: number, h: number): number {
  if (r >= h || r < 0) return 0;
  const coeff = 315.0 / (64.0 * Math.PI * Math.pow(h, 9));
  const diff = h * h - r * r;
  return coeff * diff * diff * diff;
}

/**
 * Spiky kernel gradient for pressure forces
 * ∇W(r, h) = -(45 / (πh⁶)) * (h - r)² * (r̂)
 */
function kernelSpikyGradient(r: Vec3, h: number): Vec3 {
  const rMag = vec3.magnitude(r);
  if (rMag >= h || rMag < 1e-6) return vec3.zero();

  const coeff = -45.0 / (Math.PI * Math.pow(h, 6));
  const diff = h - rMag;
  const factor = coeff * diff * diff / rMag;

  return vec3.mul(r, factor);
}

/**
 * Viscosity kernel Laplacian
 * ∇²W(r, h) = (45 / (πh⁶)) * (h - r)
 */
function kernelViscosityLaplacian(r: number, h: number): number {
  if (r >= h || r < 0) return 0;
  const coeff = 45.0 / (Math.PI * Math.pow(h, 6));
  return coeff * (h - r);
}

/**
 * Compute density for all particles
 */
export function computeSPHDensity(
  particles: SPHParticle[],
  h: number
): void {
  for (let i = 0; i < particles.length; i++) {
    let density = 0;

    for (let j = 0; j < particles.length; j++) {
      const r = vec3.sub(particles[j].position, particles[i].position);
      const rMag = vec3.magnitude(r);

      if (rMag < h) {
        density += particles[j].mass * kernelPoly6(rMag, h);
      }
    }

    particles[i].density = density;
  }
}

/**
 * Compute pressure using equation of state
 * P = k(ρ - ρ₀)
 */
export function computeSPHPressure(
  particles: SPHParticle[],
  restDensity: number,
  gasConstant: number
): void {
  for (const particle of particles) {
    // Tait equation of state (more stable than ideal gas)
    particle.pressure = gasConstant * (particle.density - restDensity);

    // Prevent negative pressure (causes particle clustering)
    if (particle.pressure < 0) {
      particle.pressure = 0;
    }
  }
}

/**
 * Compute forces for all particles
 */
export function computeSPHForces(
  particles: SPHParticle[],
  params: SPHParameters
): void {
  const h = params.smoothingRadius;

  for (let i = 0; i < particles.length; i++) {
    let pressureForce = vec3.zero();
    let viscosityForce = vec3.zero();

    for (let j = 0; j < particles.length; j++) {
      if (i === j) continue;

      const r = vec3.sub(particles[j].position, particles[i].position);
      const rMag = vec3.magnitude(r);

      if (rMag < h && rMag > 1e-6) {
        // Pressure force (symmetric formulation)
        const pressureTerm =
          (particles[i].pressure / (particles[i].density * particles[i].density) +
           particles[j].pressure / (particles[j].density * particles[j].density));

        const gradW = kernelSpikyGradient(r, h);
        pressureForce = vec3.add(
          pressureForce,
          vec3.mul(gradW, -particles[j].mass * pressureTerm)
        );

        // Viscosity force
        const velocityDiff = vec3.sub(particles[j].velocity, particles[i].velocity);
        const laplacianW = kernelViscosityLaplacian(rMag, h);
        viscosityForce = vec3.add(
          viscosityForce,
          vec3.mul(
            velocityDiff,
            params.viscosity * (particles[j].mass / particles[j].density) * laplacianW
          )
        );
      }
    }

    // Total acceleration
    const gravityForce = vec3.mul(params.gravity, particles[i].mass);
    const totalForce = vec3.add(vec3.add(pressureForce, viscosityForce), gravityForce);
    particles[i].acceleration = vec3.div(totalForce, particles[i].mass);
  }
}

/**
 * Integrate particle positions using semi-implicit Euler
 */
export function integrateSPH(
  particles: SPHParticle[],
  dt: number
): void {
  for (const particle of particles) {
    // Update velocity
    particle.velocity = vec3.add(
      particle.velocity,
      vec3.mul(particle.acceleration, dt)
    );

    // Update position
    particle.position = vec3.add(
      particle.position,
      vec3.mul(particle.velocity, dt)
    );
  }
}

/**
 * Handle boundary conditions (simple box collision)
 */
export function applySPHBoundaries(
  particles: SPHParticle[],
  bounds: { min: Vec3; max: Vec3 },
  damping = 0.5
): void {
  for (const particle of particles) {
    // Check each axis
    for (let axis = 0; axis < 3; axis++) {
      if (particle.position[axis] < bounds.min[axis]) {
        particle.position = [
          ...particle.position.slice(0, axis),
          bounds.min[axis],
          ...particle.position.slice(axis + 1),
        ] as Vec3;
        particle.velocity = [
          ...particle.velocity.slice(0, axis),
          -particle.velocity[axis] * damping,
          ...particle.velocity.slice(axis + 1),
        ] as Vec3;
      } else if (particle.position[axis] > bounds.max[axis]) {
        particle.position = [
          ...particle.position.slice(0, axis),
          bounds.max[axis],
          ...particle.position.slice(axis + 1),
        ] as Vec3;
        particle.velocity = [
          ...particle.velocity.slice(0, axis),
          -particle.velocity[axis] * damping,
          ...particle.velocity.slice(axis + 1),
        ] as Vec3;
      }
    }
  }
}

/**
 * Single SPH simulation step
 */
export function stepSPH(
  particles: SPHParticle[],
  params: SPHParameters,
  bounds?: { min: Vec3; max: Vec3 }
): void {
  // 1. Compute density
  computeSPHDensity(particles, params.smoothingRadius);

  // 2. Compute pressure
  computeSPHPressure(particles, params.restDensity, params.gasConstant);

  // 3. Compute forces
  computeSPHForces(particles, params);

  // 4. Integrate
  integrateSPH(particles, params.dt);

  // 5. Apply boundaries
  if (bounds) {
    applySPHBoundaries(particles, bounds);
  }
}

// ============================================================================
// Lattice Boltzmann Method (LBM)
// ============================================================================

/**
 * LBM Grid Cell (D2Q9 lattice for 2D)
 *
 * 9 velocity directions in 2D:
 * 6 7 8
 * 3 4 5
 * 0 1 2
 */
export interface LBMCell {
  /** Particle distribution functions (9 directions for D2Q9) */
  f: number[];
  /** Equilibrium distribution */
  feq: number[];
  /** Macroscopic density */
  density: number;
  /** Macroscopic velocity */
  velocity: Vec2;
  /** Is this a solid boundary? */
  solid: boolean;
}

/**
 * LBM Simulation Parameters
 */
export interface LBMParameters {
  /** Grid width */
  width: number;
  /** Grid height */
  height: number;
  /** Relaxation time (τ) */
  tau: number;
  /** Kinematic viscosity (ν = (τ - 0.5) / 3) */
  viscosity: number;
  /** Inlet velocity */
  inletVelocity: Vec2;
}

/**
 * D2Q9 lattice velocities
 */
const D2Q9_VELOCITIES: Vec2[] = [
  [-1, -1], [0, -1], [1, -1],  // Bottom row
  [-1,  0], [0,  0], [1,  0],  // Middle row
  [-1,  1], [0,  1], [1,  1],  // Top row
];

/**
 * D2Q9 lattice weights
 */
const D2Q9_WEIGHTS = [
  1/36, 1/9, 1/36,  // Bottom row
  1/9,  4/9, 1/9,   // Middle row
  1/36, 1/9, 1/36,  // Top row
];

/**
 * Initialize LBM grid
 */
export function createLBMGrid(params: LBMParameters): LBMCell[][] {
  const grid: LBMCell[][] = [];

  for (let y = 0; y < params.height; y++) {
    grid[y] = [];
    for (let x = 0; x < params.width; x++) {
      const cell: LBMCell = {
        f: new Array(9).fill(0),
        feq: new Array(9).fill(0),
        density: 1.0,
        velocity: [0, 0],
        solid: false,
      };

      // Initialize with equilibrium
      computeLBMEquilibrium(cell);
      cell.f = [...cell.feq];

      grid[y][x] = cell;
    }
  }

  return grid;
}

/**
 * Compute equilibrium distribution
 * f_eq = w_i * ρ * (1 + 3(e_i · u) + 9/2(e_i · u)² - 3/2(u · u))
 */
export function computeLBMEquilibrium(cell: LBMCell): void {
  const rho = cell.density;
  const ux = cell.velocity[0];
  const uy = cell.velocity[1];
  const usqr = ux * ux + uy * uy;

  for (let i = 0; i < 9; i++) {
    const ei = D2Q9_VELOCITIES[i];
    const eidotu = ei[0] * ux + ei[1] * uy;

    cell.feq[i] = D2Q9_WEIGHTS[i] * rho * (
      1 +
      3 * eidotu +
      4.5 * eidotu * eidotu -
      1.5 * usqr
    );
  }
}

/**
 * Compute macroscopic quantities from distribution functions
 */
export function computeLBMMacroscopic(cell: LBMCell): void {
  // Density
  cell.density = cell.f.reduce((sum, fi) => sum + fi, 0);

  // Velocity
  let ux = 0;
  let uy = 0;
  for (let i = 0; i < 9; i++) {
    ux += cell.f[i] * D2Q9_VELOCITIES[i][0];
    uy += cell.f[i] * D2Q9_VELOCITIES[i][1];
  }

  if (cell.density > 1e-10) {
    cell.velocity = [ux / cell.density, uy / cell.density];
  } else {
    cell.velocity = [0, 0];
  }
}

/**
 * Collision step (BGK approximation)
 * f_i^new = f_i + (f_i^eq - f_i) / τ
 */
export function collisionStepLBM(
  grid: LBMCell[][],
  tau: number
): void {
  const omega = 1.0 / tau;

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];

      if (cell.solid) continue;

      // Compute equilibrium
      computeLBMEquilibrium(cell);

      // Collision (BGK)
      for (let i = 0; i < 9; i++) {
        cell.f[i] += omega * (cell.feq[i] - cell.f[i]);
      }
    }
  }
}

/**
 * Streaming step (propagate to neighbors)
 */
export function streamingStepLBM(grid: LBMCell[][]): void {
  const height = grid.length;
  const width = grid[0].length;

  // Create temporary grid
  const tempF: number[][][] = [];
  for (let y = 0; y < height; y++) {
    tempF[y] = [];
    for (let x = 0; x < width; x++) {
      tempF[y][x] = [...grid[y][x].f];
    }
  }

  // Stream to neighbors
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x].solid) continue;

      for (let i = 0; i < 9; i++) {
        const ei = D2Q9_VELOCITIES[i];
        const nx = x + ei[0];
        const ny = y + ei[1];

        // Periodic boundary conditions
        const nxWrapped = (nx + width) % width;
        const nyWrapped = (ny + height) % height;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (!grid[ny][nx].solid) {
            grid[ny][nx].f[i] = tempF[y][x][i];
          } else {
            // Bounce-back for solid boundaries
            const opposite = 8 - i;
            grid[y][x].f[opposite] = tempF[y][x][i];
          }
        }
      }
    }
  }

  // Update macroscopic quantities
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!grid[y][x].solid) {
        computeLBMMacroscopic(grid[y][x]);
      }
    }
  }
}

/**
 * Single LBM simulation step
 */
export function stepLBM(
  grid: LBMCell[][],
  params: LBMParameters
): void {
  // 1. Collision
  collisionStepLBM(grid, params.tau);

  // 2. Streaming
  streamingStepLBM(grid);
}

/**
 * Apply inlet boundary condition
 */
export function applyLBMInlet(
  grid: LBMCell[][],
  x: number,
  velocity: Vec2
): void {
  for (let y = 0; y < grid.length; y++) {
    const cell = grid[y][x];
    cell.velocity = velocity;
    cell.density = 1.0;
    computeLBMEquilibrium(cell);
    cell.f = [...cell.feq];
  }
}

/**
 * Apply outlet boundary condition
 */
export function applyLBMOutlet(
  grid: LBMCell[][],
  x: number
): void {
  for (let y = 0; y < grid.length; y++) {
    // Copy from neighbor
    if (x > 0) {
      grid[y][x].f = [...grid[y][x - 1].f];
      computeLBMMacroscopic(grid[y][x]);
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create SPH particles in a grid
 */
export function createSPHParticleGrid(
  bounds: { min: Vec3; max: Vec3 },
  spacing: number,
  mass: number
): SPHParticle[] {
  const particles: SPHParticle[] = [];

  for (let x = bounds.min[0]; x <= bounds.max[0]; x += spacing) {
    for (let y = bounds.min[1]; y <= bounds.max[1]; y += spacing) {
      for (let z = bounds.min[2]; z <= bounds.max[2]; z += spacing) {
        particles.push({
          position: [x, y, z],
          velocity: vec3.zero(),
          acceleration: vec3.zero(),
          density: 0,
          pressure: 0,
          mass,
        });
      }
    }
  }

  return particles;
}

/**
 * Get recommended SPH parameters for water simulation
 */
export function waterSPHParameters(particleSpacing: number): SPHParameters {
  return {
    smoothingRadius: particleSpacing * 2.0,
    restDensity: 1000.0, // kg/m³ (water)
    gasConstant: 200.0,
    viscosity: 0.001,
    gravity: [0, -9.81, 0],
    dt: 0.001,
    surfaceTension: 0.0728, // N/m (water)
  };
}

/**
 * Get recommended LBM parameters for low-speed flow
 */
export function airflowLBMParameters(
  width: number,
  height: number,
  reynoldsNumber = 100
): LBMParameters {
  const tau = 0.6; // Relaxation time
  const viscosity = (tau - 0.5) / 3.0;
  const inletSpeed = 0.05; // Lattice units

  return {
    width,
    height,
    tau,
    viscosity,
    inletVelocity: [inletSpeed, 0],
  };
}
