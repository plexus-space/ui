/**
 * Animation Primitives
 *
 * Spring physics and easing functions for smooth, natural animations.
 * Inspired by Framer Motion and React Spring.
 *
 * @reference Hooke's Law: F = -kx
 * @reference Critical damping: c = 2√(km)
 */

// ============================================================================
// Spring Physics
// ============================================================================

export interface SpringConfig {
  /** Stiffness (higher = faster) */
  stiffness: number;
  /** Damping (higher = less oscillation) */
  damping: number;
  /** Mass (higher = slower) */
  mass: number;
  /** Initial velocity */
  velocity?: number;
  /** Rest threshold */
  restThreshold?: number;
}

/**
 * Preset spring configurations
 */
export const SPRING_PRESETS = {
  /** Gentle, smooth animation */
  gentle: { stiffness: 100, damping: 20, mass: 1 },
  /** Slightly bouncy */
  wobbly: { stiffness: 180, damping: 12, mass: 1 },
  /** Quick and snappy */
  stiff: { stiffness: 300, damping: 30, mass: 1 },
  /** Very slow and smooth */
  slow: { stiffness: 50, damping: 20, mass: 1 },
  /** Bouncy animation */
  bouncy: { stiffness: 300, damping: 10, mass: 1 },
  /** Critically damped (no overshoot) */
  smooth: { stiffness: 170, damping: 26, mass: 1 },
};

export interface SpringState {
  value: number;
  velocity: number;
  target: number;
}

/**
 * Update spring state by one frame
 *
 * Uses semi-implicit Euler integration for numerical stability.
 *
 * @param state - Current spring state
 * @param config - Spring configuration
 * @param dt - Time step (seconds)
 * @returns Updated state
 */
export function updateSpring(
  state: SpringState,
  config: SpringConfig,
  dt: number = 1 / 60
): SpringState {
  const { stiffness, damping, mass } = config;
  const restThreshold = config.restThreshold ?? 0.001;

  // Spring force: F = -k * (x - target)
  const springForce = -stiffness * (state.value - state.target);

  // Damping force: F = -c * v
  const dampingForce = -damping * state.velocity;

  // Total force
  const force = springForce + dampingForce;

  // Acceleration: a = F / m
  const acceleration = force / mass;

  // Update velocity (semi-implicit Euler)
  const velocity = state.velocity + acceleration * dt;

  // Update position
  const value = state.value + velocity * dt;

  // Check if at rest
  const atRest =
    Math.abs(value - state.target) < restThreshold &&
    Math.abs(velocity) < restThreshold;

  return {
    value: atRest ? state.target : value,
    velocity: atRest ? 0 : velocity,
    target: state.target,
  };
}

/**
 * Check if spring is at rest
 */
export function isSpringAtRest(state: SpringState, threshold: number = 0.001): boolean {
  return (
    Math.abs(state.value - state.target) < threshold &&
    Math.abs(state.velocity) < threshold
  );
}

// ============================================================================
// Easing Functions
// ============================================================================

/**
 * Standard easing functions
 *
 * All functions map [0, 1] -> [0, 1]
 */
export const easing = {
  /** Linear interpolation (no easing) */
  linear: (t: number): number => t,

  /** Quadratic ease in */
  easeInQuad: (t: number): number => t * t,

  /** Quadratic ease out */
  easeOutQuad: (t: number): number => t * (2 - t),

  /** Quadratic ease in-out */
  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  /** Cubic ease in */
  easeInCubic: (t: number): number => t * t * t,

  /** Cubic ease out */
  easeOutCubic: (t: number): number => --t * t * t + 1,

  /** Cubic ease in-out */
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  /** Elastic ease out (bouncy) */
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  /** Back ease out (overshoot) */
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  /** Bounce ease out */
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },

  /** Exponential ease out */
  easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  /** Circular ease in-out */
  easeInOutCirc: (t: number): number =>
    t < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
};

export type EasingFunction = keyof typeof easing;

/**
 * Interpolate between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Interpolate with easing
 */
export function easedLerp(
  start: number,
  end: number,
  t: number,
  easingFn: EasingFunction = "easeOutCubic"
): number {
  return lerp(start, end, easing[easingFn](t));
}

// ============================================================================
// Bezier Curves
// ============================================================================

/**
 * Cubic Bezier curve
 *
 * Used for smooth animation paths.
 *
 * @param t - Time parameter [0, 1]
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @returns Interpolated value
 */
export function cubicBezier(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
}

/**
 * CSS cubic-bezier compatible easing
 */
export function cssEasing(x1: number, y1: number, x2: number, y2: number) {
  return (t: number): number => {
    // Approximate using 20 iterations
    let start = 0;
    let end = 1;
    let mid = 0.5;

    for (let i = 0; i < 20; i++) {
      const x = cubicBezier(mid, 0, x1, x2, 1);
      if (Math.abs(x - t) < 0.001) break;

      if (x < t) {
        start = mid;
      } else {
        end = mid;
      }
      mid = (start + end) / 2;
    }

    return cubicBezier(mid, 0, y1, y2, 1);
  };
}

// ============================================================================
// Timing & Sequencing
// ============================================================================

export interface TimingOptions {
  duration: number;
  delay?: number;
  easing?: EasingFunction;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

/**
 * Simple tween animation
 *
 * @param from - Start value
 * @param to - End value
 * @param options - Timing options
 * @returns Cancel function
 */
export function tween(from: number, to: number, options: TimingOptions): () => void {
  const { duration, delay = 0, easing: easingFn = "easeOutCubic", onUpdate, onComplete } = options;

  let startTime: number | null = null;
  let rafId: number;
  let cancelled = false;

  function animate(currentTime: number) {
    if (cancelled) return;

    if (!startTime) {
      startTime = currentTime + delay;
    }

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    if (progress < 0) {
      rafId = requestAnimationFrame(animate);
      return;
    }

    const value = easedLerp(from, to, progress, easingFn);
    onUpdate?.(value);

    if (progress < 1) {
      rafId = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  }

  rafId = requestAnimationFrame(animate);

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
}

/**
 * Stagger multiple animations
 *
 * @param animations - Array of animation functions
 * @param stagger - Delay between each animation (ms)
 */
export function stagger(animations: (() => () => void)[], stagger: number): () => void {
  const cancels: (() => void)[] = [];

  animations.forEach((anim, i) => {
    setTimeout(() => {
      cancels.push(anim());
    }, i * stagger);
  });

  return () => {
    cancels.forEach((cancel) => cancel());
  };
}

// ============================================================================
// React Hooks (optional)
// ============================================================================

/**
 * Use spring animation in React
 *
 * @example
 * ```tsx
 * const [spring, setTarget] = useSpring(0, SPRING_PRESETS.gentle);
 * // setTarget(100) will smoothly animate to 100
 * ```
 */
export function createSpringHook() {
  return function useSpring(
    initialValue: number,
    config: SpringConfig = SPRING_PRESETS.gentle
  ): [SpringState, (target: number) => void] {
    // Implementation would use React.useState and React.useEffect
    // Placeholder for now - this is a TypeScript file
    throw new Error("Use in React component file");
  };
}
