/**
 * Vector Math - 2D and 3D Vectors
 *
 * Immutable vector operations for physics simulations and geometric calculations.
 * All operations return new vectors (no mutations).
 *
 * @reference Dunn, F. & Parberry, I. (2011). 3D Math Primer for Graphics and Game Development
 */

// ============================================================================
// Types
// ============================================================================

/**
 * 3D Vector (immutable)
 *
 * Readonly array to prevent accidental mutations.
 * All vec3 operations return new vectors.
 */
export type Vec3 = readonly [number, number, number];

/**
 * 2D Vector (immutable)
 *
 * Readonly array to prevent accidental mutations.
 * All vec2 operations return new vectors.
 */
export type Vec2 = readonly [number, number];

// ============================================================================
// Vec3 Operations
// ============================================================================

export const vec3 = {
  /**
   * Create a new Vec3
   */
  create: (x: number, y: number, z: number): Vec3 => [x, y, z],

  /**
   * Create zero vector
   */
  zero: (): Vec3 => [0, 0, 0],

  /**
   * Vector addition
   */
  add: (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],

  /**
   * Vector subtraction
   */
  sub: (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],

  /**
   * Scalar multiplication
   */
  mul: (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s],

  /**
   * Scalar division
   */
  div: (a: Vec3, s: number): Vec3 => [a[0] / s, a[1] / s, a[2] / s],

  /**
   * Dot product
   */
  dot: (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],

  /**
   * Cross product
   */
  cross: (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ],

  /**
   * Vector magnitude (length)
   */
  magnitude: (a: Vec3): number =>
    Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]),

  /**
   * Squared magnitude (faster, avoid sqrt when comparing)
   */
  magnitudeSquared: (a: Vec3): number =>
    a[0] * a[0] + a[1] * a[1] + a[2] * a[2],

  /**
   * Normalize vector (unit vector)
   */
  normalize: (a: Vec3): Vec3 => {
    const mag = vec3.magnitude(a);
    return mag > 0 ? vec3.div(a, mag) : [0, 0, 0];
  },

  /**
   * Distance between two points
   */
  distance: (a: Vec3, b: Vec3): number => vec3.magnitude(vec3.sub(b, a)),

  /**
   * Squared distance (faster, avoid sqrt)
   */
  distanceSquared: (a: Vec3, b: Vec3): number =>
    vec3.magnitudeSquared(vec3.sub(b, a)),

  /**
   * Linear interpolation between two vectors
   * @param t Interpolation factor (0 = a, 1 = b)
   */
  lerp: (a: Vec3, b: Vec3, t: number): Vec3 => {
    const t1 = 1 - t;
    return [
      t1 * a[0] + t * b[0],
      t1 * a[1] + t * b[1],
      t1 * a[2] + t * b[2],
    ];
  },

  /**
   * Negate vector
   */
  negate: (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]],

  /**
   * Component-wise multiplication
   */
  componentMul: (a: Vec3, b: Vec3): Vec3 => [
    a[0] * b[0],
    a[1] * b[1],
    a[2] * b[2],
  ],

  /**
   * Component-wise division
   */
  componentDiv: (a: Vec3, b: Vec3): Vec3 => [
    a[0] / b[0],
    a[1] / b[1],
    a[2] / b[2],
  ],

  /**
   * Angle between two vectors (radians)
   */
  angle: (a: Vec3, b: Vec3): number => {
    const dot = vec3.dot(a, b);
    const magA = vec3.magnitude(a);
    const magB = vec3.magnitude(b);
    return Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB))));
  },

  /**
   * Project vector a onto vector b
   */
  project: (a: Vec3, b: Vec3): Vec3 => {
    const scale = vec3.dot(a, b) / vec3.dot(b, b);
    return vec3.mul(b, scale);
  },

  /**
   * Reflect vector a across normal n
   */
  reflect: (a: Vec3, n: Vec3): Vec3 => {
    const scale = 2 * vec3.dot(a, n);
    return vec3.sub(a, vec3.mul(n, scale));
  },

  /**
   * Check if two vectors are approximately equal
   */
  equals: (a: Vec3, b: Vec3, epsilon = 1e-10): boolean => {
    return (
      Math.abs(a[0] - b[0]) < epsilon &&
      Math.abs(a[1] - b[1]) < epsilon &&
      Math.abs(a[2] - b[2]) < epsilon
    );
  },

  /**
   * Convert to array (for WebGPU/Three.js)
   */
  toArray: (a: Vec3): [number, number, number] => [a[0], a[1], a[2]],

  /**
   * Convert to string for debugging
   */
  toString: (a: Vec3): string =>
    `[${a[0].toFixed(3)}, ${a[1].toFixed(3)}, ${a[2].toFixed(3)}]`,
};

// ============================================================================
// Vec2 Operations
// ============================================================================

export const vec2 = {
  /**
   * Create a new Vec2
   */
  create: (x: number, y: number): Vec2 => [x, y],

  /**
   * Create zero vector
   */
  zero: (): Vec2 => [0, 0],

  /**
   * Vector addition
   */
  add: (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]],

  /**
   * Vector subtraction
   */
  sub: (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]],

  /**
   * Scalar multiplication
   */
  mul: (a: Vec2, s: number): Vec2 => [a[0] * s, a[1] * s],

  /**
   * Scalar division
   */
  div: (a: Vec2, s: number): Vec2 => [a[0] / s, a[1] / s],

  /**
   * Dot product
   */
  dot: (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1],

  /**
   * 2D cross product (returns scalar z-component)
   */
  cross: (a: Vec2, b: Vec2): number => a[0] * b[1] - a[1] * b[0],

  /**
   * Vector magnitude (length)
   */
  magnitude: (a: Vec2): number => Math.sqrt(a[0] * a[0] + a[1] * a[1]),

  /**
   * Squared magnitude (faster, avoid sqrt)
   */
  magnitudeSquared: (a: Vec2): number => a[0] * a[0] + a[1] * a[1],

  /**
   * Normalize vector (unit vector)
   */
  normalize: (a: Vec2): Vec2 => {
    const mag = vec2.magnitude(a);
    return mag > 0 ? vec2.div(a, mag) : [0, 0];
  },

  /**
   * Distance between two points
   */
  distance: (a: Vec2, b: Vec2): number => vec2.magnitude(vec2.sub(b, a)),

  /**
   * Squared distance (faster, avoid sqrt)
   */
  distanceSquared: (a: Vec2, b: Vec2): number =>
    vec2.magnitudeSquared(vec2.sub(b, a)),

  /**
   * Linear interpolation between two vectors
   * @param t Interpolation factor (0 = a, 1 = b)
   */
  lerp: (a: Vec2, b: Vec2, t: number): Vec2 => {
    const t1 = 1 - t;
    return [t1 * a[0] + t * b[0], t1 * a[1] + t * b[1]];
  },

  /**
   * Negate vector
   */
  negate: (a: Vec2): Vec2 => [-a[0], -a[1]],

  /**
   * Rotate vector by angle (radians)
   */
  rotate: (a: Vec2, angle: number): Vec2 => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [a[0] * cos - a[1] * sin, a[0] * sin + a[1] * cos];
  },

  /**
   * Perpendicular vector (90° counter-clockwise)
   */
  perpendicular: (a: Vec2): Vec2 => [-a[1], a[0]],

  /**
   * Angle of vector from X-axis (radians)
   */
  angle: (a: Vec2): number => Math.atan2(a[1], a[0]),

  /**
   * Angle between two vectors (radians)
   */
  angleBetween: (a: Vec2, b: Vec2): number => {
    const dot = vec2.dot(a, b);
    const magA = vec2.magnitude(a);
    const magB = vec2.magnitude(b);
    return Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB))));
  },

  /**
   * Project vector a onto vector b
   */
  project: (a: Vec2, b: Vec2): Vec2 => {
    const scale = vec2.dot(a, b) / vec2.dot(b, b);
    return vec2.mul(b, scale);
  },

  /**
   * Reflect vector a across normal n
   */
  reflect: (a: Vec2, n: Vec2): Vec2 => {
    const scale = 2 * vec2.dot(a, n);
    return vec2.sub(a, vec2.mul(n, scale));
  },

  /**
   * Check if two vectors are approximately equal
   */
  equals: (a: Vec2, b: Vec2, epsilon = 1e-10): boolean => {
    return Math.abs(a[0] - b[0]) < epsilon && Math.abs(a[1] - b[1]) < epsilon;
  },

  /**
   * Convert to array (for WebGPU/Three.js)
   */
  toArray: (a: Vec2): [number, number] => [a[0], a[1]],

  /**
   * Convert to string for debugging
   */
  toString: (a: Vec2): string => `[${a[0].toFixed(3)}, ${a[1].toFixed(3)}]`,
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  const t = (value - fromMin) / (fromMax - fromMin);
  return lerp(toMin, toMax, t);
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}
