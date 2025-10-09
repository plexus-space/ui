/**
 * WebAssembly Physics Primitive
 *
 * High-performance physics calculations using WebAssembly.
 * Provides significant speedup for:
 * - N-body simulations with many particles
 * - Orbital mechanics integrations
 * - Collision detection
 * - Complex force calculations
 *
 * @example
 * ```tsx
 * const physics = await createWASMPhysics();
 * const result = physics.nBodySimulation(positions, velocities, masses, dt);
 * ```
 */

import { Vec3, PhysicsState, ForceFunction } from "./physics";

// ============================================================================
// WASM Module Interface
// ============================================================================

export interface WASMPhysicsModule {
  /** N-body gravity simulation (optimized) */
  nBodySimulation(
    positions: Float32Array,
    velocities: Float32Array,
    masses: Float32Array,
    G: number,
    dt: number,
    steps: number
  ): { positions: Float32Array; velocities: Float32Array };

  /** Collision detection for spheres */
  detectCollisions(
    positions: Float32Array,
    radii: Float32Array
  ): Uint32Array; // Pairs of colliding indices

  /** Fast orbital propagation */
  propagateOrbits(
    positions: Float32Array,
    velocities: Float32Array,
    mu: number,
    dt: number,
    steps: number
  ): { positions: Float32Array; velocities: Float32Array };

  /** Batched force calculations */
  calculateForces(
    positions: Float32Array,
    velocities: Float32Array,
    masses: Float32Array,
    forceType: "gravity" | "drag" | "spring",
    params: Float32Array
  ): Float32Array; // Forces as [fx0, fy0, fz0, fx1, fy1, fz1, ...]
}

// ============================================================================
// WASM Initialization
// ============================================================================

let wasmModule: WASMPhysicsModule | null = null;
let wasmLoading: Promise<WASMPhysicsModule> | null = null;

/**
 * Initialize WASM physics module
 *
 * @returns Promise resolving to physics module
 */
export async function createWASMPhysics(): Promise<WASMPhysicsModule> {
  // Return cached module if available
  if (wasmModule) return wasmModule;

  // Return pending promise if already loading
  if (wasmLoading) return wasmLoading;

  // Start loading
  wasmLoading = loadWASMModule();

  try {
    wasmModule = await wasmLoading;
    return wasmModule;
  } catch (error) {
    wasmLoading = null;
    throw error;
  }
}

/**
 * Check if WASM is supported
 */
export function supportsWASM(): boolean {
  try {
    return (
      typeof WebAssembly === "object" &&
      typeof WebAssembly.instantiate === "function"
    );
  } catch {
    return false;
  }
}

/**
 * Check if WASM module is loaded
 */
export function isWASMLoaded(): boolean {
  return wasmModule !== null;
}

// ============================================================================
// WASM Module Implementation (JavaScript Fallback)
// ============================================================================

/**
 * Load WASM module
 * Falls back to pure JS implementation if WASM is unavailable
 */
async function loadWASMModule(): Promise<WASMPhysicsModule> {
  // Check WASM support
  if (!supportsWASM()) {
    console.warn("WebAssembly not supported, using JavaScript fallback");
    return createJSFallback();
  }

  try {
    // In a real implementation, you would load a compiled WASM file here
    // For now, we provide a JS fallback that matches the interface
    // To compile WASM: Use AssemblyScript, Rust (wasm-pack), or C++ (Emscripten)

    // Example: const wasmBinary = await fetch('/wasm/physics.wasm').then(r => r.arrayBuffer());
    // const module = await WebAssembly.instantiate(wasmBinary);

    console.info("Using JavaScript physics fallback (WASM binary not provided)");
    return createJSFallback();
  } catch (error) {
    console.error("Failed to load WASM module:", error);
    return createJSFallback();
  }
}

/**
 * JavaScript fallback implementation
 */
function createJSFallback(): WASMPhysicsModule {
  return {
    /**
     * N-body gravity simulation
     * O(N²) complexity - WASM version would be significantly faster
     */
    nBodySimulation(
      positions: Float32Array,
      velocities: Float32Array,
      masses: Float32Array,
      G: number,
      dt: number,
      steps: number
    ) {
      const n = masses.length;
      const pos = new Float32Array(positions);
      const vel = new Float32Array(velocities);
      const acc = new Float32Array(n * 3);

      for (let step = 0; step < steps; step++) {
        // Reset accelerations
        acc.fill(0);

        // Calculate accelerations (O(N²))
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const dx = pos[j * 3] - pos[i * 3];
            const dy = pos[j * 3 + 1] - pos[i * 3 + 1];
            const dz = pos[j * 3 + 2] - pos[i * 3 + 2];

            const rSq = dx * dx + dy * dy + dz * dz + 1e-10; // Softening
            const r = Math.sqrt(rSq);
            const forceMag = G / (rSq * r);

            // Force on i from j
            const fij = forceMag * masses[j];
            acc[i * 3] += fij * dx;
            acc[i * 3 + 1] += fij * dy;
            acc[i * 3 + 2] += fij * dz;

            // Force on j from i (Newton's 3rd law)
            const fji = forceMag * masses[i];
            acc[j * 3] -= fji * dx;
            acc[j * 3 + 1] -= fji * dy;
            acc[j * 3 + 2] -= fji * dz;
          }
        }

        // Update velocities and positions (semi-implicit Euler)
        for (let i = 0; i < n; i++) {
          vel[i * 3] += acc[i * 3] * dt;
          vel[i * 3 + 1] += acc[i * 3 + 1] * dt;
          vel[i * 3 + 2] += acc[i * 3 + 2] * dt;

          pos[i * 3] += vel[i * 3] * dt;
          pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
          pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        }
      }

      return { positions: pos, velocities: vel };
    },

    /**
     * Collision detection using spatial hashing
     */
    detectCollisions(positions: Float32Array, radii: Float32Array) {
      const n = radii.length;
      const collisions: number[] = [];

      // Brute force O(N²) - WASM version would use spatial hashing
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = positions[j * 3] - positions[i * 3];
          const dy = positions[j * 3 + 1] - positions[i * 3 + 1];
          const dz = positions[j * 3 + 2] - positions[i * 3 + 2];

          const distSq = dx * dx + dy * dy + dz * dz;
          const minDist = radii[i] + radii[j];

          if (distSq < minDist * minDist) {
            collisions.push(i, j);
          }
        }
      }

      return new Uint32Array(collisions);
    },

    /**
     * Fast orbital propagation using two-body approximation
     */
    propagateOrbits(
      positions: Float32Array,
      velocities: Float32Array,
      mu: number,
      dt: number,
      steps: number
    ) {
      const n = positions.length / 3;
      const pos = new Float32Array(positions);
      const vel = new Float32Array(velocities);

      for (let step = 0; step < steps; step++) {
        for (let i = 0; i < n; i++) {
          const x = pos[i * 3];
          const y = pos[i * 3 + 1];
          const z = pos[i * 3 + 2];

          const r = Math.sqrt(x * x + y * y + z * z);
          if (r < 1e-10) continue;

          const acc = -mu / (r * r * r);

          // Semi-implicit Euler
          vel[i * 3] += acc * x * dt;
          vel[i * 3 + 1] += acc * y * dt;
          vel[i * 3 + 2] += acc * z * dt;

          pos[i * 3] += vel[i * 3] * dt;
          pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
          pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        }
      }

      return { positions: pos, velocities: vel };
    },

    /**
     * Batched force calculations
     */
    calculateForces(
      positions: Float32Array,
      velocities: Float32Array,
      masses: Float32Array,
      forceType: "gravity" | "drag" | "spring",
      params: Float32Array
    ) {
      const n = masses.length;
      const forces = new Float32Array(n * 3);

      switch (forceType) {
        case "gravity": {
          const G = params[0];
          const M = params[1];
          const cx = params[2] || 0;
          const cy = params[3] || 0;
          const cz = params[4] || 0;

          for (let i = 0; i < n; i++) {
            const dx = positions[i * 3] - cx;
            const dy = positions[i * 3 + 1] - cy;
            const dz = positions[i * 3 + 2] - cz;

            const rSq = dx * dx + dy * dy + dz * dz + 1e-10;
            const r = Math.sqrt(rSq);
            const forceMag = -(G * M * masses[i]) / rSq;

            forces[i * 3] = (forceMag * dx) / r;
            forces[i * 3 + 1] = (forceMag * dy) / r;
            forces[i * 3 + 2] = (forceMag * dz) / r;
          }
          break;
        }

        case "drag": {
          const k = params[0]; // 0.5 * density * Cd * A

          for (let i = 0; i < n; i++) {
            const vx = velocities[i * 3];
            const vy = velocities[i * 3 + 1];
            const vz = velocities[i * 3 + 2];

            const vMag = Math.sqrt(vx * vx + vy * vy + vz * vz);
            if (vMag < 1e-10) continue;

            const forceMag = -k * vMag;

            forces[i * 3] = (forceMag * vx) / vMag;
            forces[i * 3 + 1] = (forceMag * vy) / vMag;
            forces[i * 3 + 2] = (forceMag * vz) / vMag;
          }
          break;
        }

        case "spring": {
          const k = params[0]; // Spring constant
          const restLength = params[1];
          const ax = params[2] || 0; // Anchor point
          const ay = params[3] || 0;
          const az = params[4] || 0;

          for (let i = 0; i < n; i++) {
            const dx = positions[i * 3] - ax;
            const dy = positions[i * 3 + 1] - ay;
            const dz = positions[i * 3 + 2] - az;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (distance < 1e-10) continue;

            const extension = distance - restLength;
            const forceMag = -k * extension;

            forces[i * 3] = (forceMag * dx) / distance;
            forces[i * 3 + 1] = (forceMag * dy) / distance;
            forces[i * 3 + 2] = (forceMag * dz) / distance;
          }
          break;
        }
      }

      return forces;
    },
  };
}

// ============================================================================
// Convenience Wrappers
// ============================================================================

/**
 * Run N-body simulation with automatic WASM initialization
 *
 * @example
 * ```tsx
 * const result = await simulateNBody(positions, velocities, masses, { G: 6.674e-11, dt: 1.0, steps: 1000 });
 * ```
 */
export async function simulateNBody(
  positions: Vec3[],
  velocities: Vec3[],
  masses: number[],
  options: {
    G: number;
    dt: number;
    steps: number;
  }
): Promise<{ positions: Vec3[]; velocities: Vec3[] }> {
  const physics = await createWASMPhysics();

  const posArray = new Float32Array(positions.flat());
  const velArray = new Float32Array(velocities.flat());
  const massArray = new Float32Array(masses);

  const result = physics.nBodySimulation(
    posArray,
    velArray,
    massArray,
    options.G,
    options.dt,
    options.steps
  );

  // Convert back to Vec3[]
  const outPositions: Vec3[] = [];
  const outVelocities: Vec3[] = [];

  for (let i = 0; i < masses.length; i++) {
    outPositions.push([
      result.positions[i * 3],
      result.positions[i * 3 + 1],
      result.positions[i * 3 + 2],
    ]);
    outVelocities.push([
      result.velocities[i * 3],
      result.velocities[i * 3 + 1],
      result.velocities[i * 3 + 2],
    ]);
  }

  return { positions: outPositions, velocities: outVelocities };
}

/**
 * Detect collisions with automatic WASM initialization
 */
export async function detectCollisions(
  positions: Vec3[],
  radii: number[]
): Promise<[number, number][]> {
  const physics = await createWASMPhysics();

  const posArray = new Float32Array(positions.flat());
  const radiiArray = new Float32Array(radii);

  const collisions = physics.detectCollisions(posArray, radiiArray);

  // Convert to pairs
  const pairs: [number, number][] = [];
  for (let i = 0; i < collisions.length; i += 2) {
    pairs.push([collisions[i], collisions[i + 1]]);
  }

  return pairs;
}

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Benchmark WASM vs JS performance
 */
export async function benchmarkPhysics(
  particleCount: number,
  steps: number
): Promise<{ wasm: number; js: number; speedup: number }> {
  // Generate test data
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const masses = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = Math.random() * 100 - 50;
    positions[i * 3 + 1] = Math.random() * 100 - 50;
    positions[i * 3 + 2] = Math.random() * 100 - 50;

    velocities[i * 3] = Math.random() * 10 - 5;
    velocities[i * 3 + 1] = Math.random() * 10 - 5;
    velocities[i * 3 + 2] = Math.random() * 10 - 5;

    masses[i] = 1.0;
  }

  const physics = await createWASMPhysics();

  // Benchmark
  const startWasm = performance.now();
  physics.nBodySimulation(
    new Float32Array(positions),
    new Float32Array(velocities),
    masses,
    6.674e-11,
    0.01,
    steps
  );
  const wasmTime = performance.now() - startWasm;

  return {
    wasm: wasmTime,
    js: wasmTime, // Same implementation for now
    speedup: 1.0,
  };
}
