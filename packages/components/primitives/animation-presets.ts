/**
 * Animation Presets Library
 *
 * Ready-to-use animation presets for common aerospace and scientific visualizations.
 * Built on top of the animation primitives with carefully tuned parameters.
 *
 * @example
 * ```tsx
 * import { orbitPresets, cameraPresets } from './primitives/animation-presets';
 *
 * // Smooth orbital insertion
 * applyAnimationPreset(satellite, orbitPresets.insertion);
 * ```
 */

import { SpringConfig, SPRING_PRESETS, EasingFunction } from "./animation";

// ============================================================================
// Orbital Motion Presets
// ============================================================================

export interface OrbitAnimationPreset {
  name: string;
  description: string;
  spring: SpringConfig;
  duration?: number;
  easing?: EasingFunction;
}

export const orbitPresets: Record<string, OrbitAnimationPreset> = {
  /** Smooth orbital insertion maneuver */
  insertion: {
    name: "Orbital Insertion",
    description: "Smooth transition into stable orbit",
    spring: {
      stiffness: 80,
      damping: 18,
      mass: 1.2,
    },
    duration: 3000,
    easing: "easeOutCubic",
  },

  /** Transfer orbit (Hohmann-like) */
  transfer: {
    name: "Transfer Orbit",
    description: "Efficient transfer between orbits",
    spring: {
      stiffness: 120,
      damping: 22,
      mass: 1.0,
    },
    duration: 4000,
    easing: "easeInOutCubic",
  },

  /** Rapid orbital adjustment */
  adjustment: {
    name: "Orbital Adjustment",
    description: "Quick course correction",
    spring: {
      stiffness: 200,
      damping: 25,
      mass: 0.8,
    },
    duration: 1500,
    easing: "easeOutQuad",
  },

  /** Atmospheric entry */
  entry: {
    name: "Atmospheric Entry",
    description: "Controlled descent through atmosphere",
    spring: {
      stiffness: 150,
      damping: 30,
      mass: 1.5,
    },
    duration: 2500,
    easing: "easeInCubic",
  },

  /** Landing sequence */
  landing: {
    name: "Landing",
    description: "Final approach and touchdown",
    spring: {
      stiffness: 60,
      damping: 28,
      mass: 2.0,
    },
    duration: 3500,
    easing: "easeOutBack",
  },

  /** Escape velocity */
  escape: {
    name: "Escape",
    description: "Leaving planetary influence",
    spring: {
      stiffness: 180,
      damping: 15,
      mass: 0.9,
    },
    duration: 2000,
    easing: "easeOutExpo",
  },
};

// ============================================================================
// Camera Animation Presets
// ============================================================================

export interface CameraAnimationPreset {
  name: string;
  description: string;
  spring: SpringConfig;
  damping: number;
}

export const cameraPresets: Record<string, CameraAnimationPreset> = {
  /** Smooth follow-cam */
  follow: {
    name: "Follow Camera",
    description: "Smooth tracking of moving object",
    spring: {
      stiffness: 100,
      damping: 20,
      mass: 1.0,
    },
    damping: 0.05,
  },

  /** Cinematic pan */
  cinematicPan: {
    name: "Cinematic Pan",
    description: "Smooth, professional camera movement",
    spring: {
      stiffness: 60,
      damping: 18,
      mass: 1.5,
    },
    damping: 0.08,
  },

  /** Quick snap */
  snap: {
    name: "Snap To",
    description: "Fast camera reposition",
    spring: {
      stiffness: 250,
      damping: 28,
      mass: 0.8,
    },
    damping: 0.03,
  },

  /** Orbit view */
  orbit: {
    name: "Orbital View",
    description: "Smooth orbital camera motion",
    spring: {
      stiffness: 90,
      damping: 20,
      mass: 1.2,
    },
    damping: 0.06,
  },

  /** First-person look */
  firstPerson: {
    name: "First Person",
    description: "Responsive first-person camera",
    spring: {
      stiffness: 200,
      damping: 22,
      mass: 0.9,
    },
    damping: 0.04,
  },
};

// ============================================================================
// Data Visualization Presets
// ============================================================================

export interface DataAnimationPreset {
  name: string;
  description: string;
  duration: number;
  easing: EasingFunction;
  stagger?: number;
}

export const dataPresets: Record<string, DataAnimationPreset> = {
  /** Smooth data entry */
  enter: {
    name: "Data Enter",
    description: "Elements smoothly enter view",
    duration: 600,
    easing: "easeOutCubic",
    stagger: 30,
  },

  /** Data exit */
  exit: {
    name: "Data Exit",
    description: "Elements fade and exit",
    duration: 400,
    easing: "easeInQuad",
    stagger: 20,
  },

  /** Value update */
  update: {
    name: "Value Update",
    description: "Smooth transition between values",
    duration: 500,
    easing: "easeInOutCubic",
  },

  /** Highlight effect */
  highlight: {
    name: "Highlight",
    description: "Draw attention to element",
    duration: 300,
    easing: "easeOutBack",
  },

  /** Chart axis animation */
  axis: {
    name: "Axis Animation",
    description: "Smooth axis transitions",
    duration: 800,
    easing: "easeOutExpo",
  },

  /** Loading skeleton */
  skeleton: {
    name: "Skeleton Loading",
    description: "Pulsing loading animation",
    duration: 1200,
    easing: "easeInOutQuad",
  },
};

// ============================================================================
// Particle System Presets
// ============================================================================

export interface ParticleAnimationPreset {
  name: string;
  description: string;
  spring: SpringConfig;
  initialVelocity: [number, number, number];
  lifetime: number;
}

export const particlePresets: Record<string, ParticleAnimationPreset> = {
  /** Rocket exhaust plume */
  exhaust: {
    name: "Exhaust Plume",
    description: "High-velocity particle stream",
    spring: {
      stiffness: 50,
      damping: 8,
      mass: 0.5,
    },
    initialVelocity: [0, -10, 0],
    lifetime: 2000,
  },

  /** Debris field */
  debris: {
    name: "Debris Field",
    description: "Scattered particles with drag",
    spring: {
      stiffness: 30,
      damping: 12,
      mass: 1.0,
    },
    initialVelocity: [2, 2, 2],
    lifetime: 5000,
  },

  /** Star field parallax */
  stars: {
    name: "Star Field",
    description: "Background star motion",
    spring: {
      stiffness: 20,
      damping: 15,
      mass: 0.3,
    },
    initialVelocity: [0, 0, -1],
    lifetime: Infinity,
  },

  /** Explosion particles */
  explosion: {
    name: "Explosion",
    description: "Rapid radial expansion",
    spring: {
      stiffness: 300,
      damping: 5,
      mass: 0.4,
    },
    initialVelocity: [5, 5, 5],
    lifetime: 1500,
  },

  /** Dust cloud */
  dust: {
    name: "Dust Cloud",
    description: "Slow-moving particles",
    spring: {
      stiffness: 15,
      damping: 20,
      mass: 0.8,
    },
    initialVelocity: [0.5, 0.5, 0.5],
    lifetime: 8000,
  },
};

// ============================================================================
// UI Transition Presets
// ============================================================================

export interface UITransitionPreset {
  name: string;
  description: string;
  duration: number;
  easing: EasingFunction;
  delay?: number;
}

export const uiPresets: Record<string, UITransitionPreset> = {
  /** Modal/dialog appearance */
  modal: {
    name: "Modal",
    description: "Smooth modal entrance",
    duration: 250,
    easing: "easeOutCubic",
  },

  /** Dropdown menu */
  dropdown: {
    name: "Dropdown",
    description: "Quick dropdown expansion",
    duration: 150,
    easing: "easeOutQuad",
  },

  /** Tooltip appearance */
  tooltip: {
    name: "Tooltip",
    description: "Instant tooltip display",
    duration: 100,
    easing: "easeOutQuad",
  },

  /** Sidebar slide */
  sidebar: {
    name: "Sidebar",
    description: "Smooth sidebar transition",
    duration: 300,
    easing: "easeInOutCubic",
  },

  /** Page transition */
  page: {
    name: "Page Transition",
    description: "Full page transition",
    duration: 400,
    easing: "easeInOutCubic",
  },

  /** Accordion expand */
  accordion: {
    name: "Accordion",
    description: "Smooth content expansion",
    duration: 200,
    easing: "easeOutQuad",
  },
};

// ============================================================================
// Physics-Based Presets
// ============================================================================

export interface PhysicsPreset {
  name: string;
  description: string;
  spring: SpringConfig;
  gravity?: number;
  drag?: number;
}

export const physicsPresets: Record<string, PhysicsPreset> = {
  /** Zero gravity environment */
  zeroG: {
    name: "Zero Gravity",
    description: "Space physics simulation",
    spring: {
      stiffness: 40,
      damping: 5,
      mass: 1.0,
    },
    gravity: 0,
    drag: 0.01,
  },

  /** Earth gravity */
  earth: {
    name: "Earth Gravity",
    description: "Standard Earth physics",
    spring: {
      stiffness: 100,
      damping: 15,
      mass: 1.0,
    },
    gravity: 9.81,
    drag: 0.1,
  },

  /** Moon gravity */
  moon: {
    name: "Moon Gravity",
    description: "Lunar surface physics",
    spring: {
      stiffness: 80,
      damping: 12,
      mass: 1.0,
    },
    gravity: 1.62,
    drag: 0.05,
  },

  /** Mars gravity */
  mars: {
    name: "Mars Gravity",
    description: "Martian surface physics",
    spring: {
      stiffness: 90,
      damping: 13,
      mass: 1.0,
    },
    gravity: 3.71,
    drag: 0.08,
  },

  /** Underwater */
  underwater: {
    name: "Underwater",
    description: "High drag environment",
    spring: {
      stiffness: 60,
      damping: 30,
      mass: 1.0,
    },
    gravity: 9.81,
    drag: 0.8,
  },
};

// ============================================================================
// Preset Application Helpers
// ============================================================================

/**
 * Get complete preset by name and category
 */
export function getPreset(
  category: "orbit" | "camera" | "data" | "particle" | "ui" | "physics",
  name: string
): any {
  const presets = {
    orbit: orbitPresets,
    camera: cameraPresets,
    data: dataPresets,
    particle: particlePresets,
    ui: uiPresets,
    physics: physicsPresets,
  };

  return presets[category][name];
}

/**
 * List all presets in a category
 */
export function listPresets(
  category: "orbit" | "camera" | "data" | "particle" | "ui" | "physics"
): string[] {
  const presets = {
    orbit: orbitPresets,
    camera: cameraPresets,
    data: dataPresets,
    particle: particlePresets,
    ui: uiPresets,
    physics: physicsPresets,
  };

  return Object.keys(presets[category]);
}

/**
 * Create custom preset by blending two presets
 */
export function blendPresets(
  preset1: OrbitAnimationPreset | CameraAnimationPreset,
  preset2: OrbitAnimationPreset | CameraAnimationPreset,
  ratio: number = 0.5
): OrbitAnimationPreset | CameraAnimationPreset {
  const r1 = ratio;
  const r2 = 1 - ratio;

  return {
    name: `${preset1.name} + ${preset2.name}`,
    description: `Blend of ${preset1.name} and ${preset2.name}`,
    spring: {
      stiffness: preset1.spring.stiffness * r1 + preset2.spring.stiffness * r2,
      damping: preset1.spring.damping * r1 + preset2.spring.damping * r2,
      mass: preset1.spring.mass * r1 + preset2.spring.mass * r2,
    },
    ...("duration" in preset1 &&
      "duration" in preset2 && {
        duration: (preset1.duration || 0) * r1 + (preset2.duration || 0) * r2,
      }),
  } as any;
}

// ============================================================================
// Animation Sequence Builder
// ============================================================================

export interface AnimationStep {
  preset: string;
  category: "orbit" | "camera" | "data" | "particle" | "ui" | "physics";
  delay?: number;
  onComplete?: () => void;
}

export interface AnimationSequence {
  name: string;
  steps: AnimationStep[];
}

/**
 * Common animation sequences
 */
export const sequences: Record<string, AnimationSequence> = {
  /** Complete launch sequence */
  launch: {
    name: "Launch Sequence",
    steps: [
      { preset: "earth", category: "physics", delay: 0 },
      { preset: "escape", category: "orbit", delay: 1000 },
      { preset: "insertion", category: "orbit", delay: 4000 },
      { preset: "orbit", category: "camera", delay: 4500 },
    ],
  },

  /** Data loading sequence */
  dataLoad: {
    name: "Data Loading",
    steps: [
      { preset: "skeleton", category: "data", delay: 0 },
      { preset: "enter", category: "data", delay: 1000 },
      { preset: "axis", category: "data", delay: 1200 },
    ],
  },

  /** Orbital maneuver */
  maneuver: {
    name: "Orbital Maneuver",
    steps: [
      { preset: "adjustment", category: "orbit", delay: 0 },
      { preset: "transfer", category: "orbit", delay: 2000 },
      { preset: "insertion", category: "orbit", delay: 6000 },
    ],
  },

  /** Camera tour */
  tour: {
    name: "Camera Tour",
    steps: [
      { preset: "cinematicPan", category: "camera", delay: 0 },
      { preset: "orbit", category: "camera", delay: 3000 },
      { preset: "snap", category: "camera", delay: 6000 },
    ],
  },
};

/**
 * Execute animation sequence
 */
export function executeSequence(
  sequence: AnimationSequence,
  onStepComplete?: (step: number) => void
): () => void {
  const timeouts: NodeJS.Timeout[] = [];

  sequence.steps.forEach((step, index) => {
    const timeout = setTimeout(() => {
      // Execute animation (implementation depends on animation system)
      console.info(`Executing step ${index}: ${step.preset}`);
      step.onComplete?.();
      onStepComplete?.(index);
    }, step.delay || 0);

    timeouts.push(timeout);
  });

  // Return cleanup function
  return () => {
    timeouts.forEach((timeout) => clearTimeout(timeout));
  };
}
