"use client";

import { memo, useMemo, forwardRef } from "react";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

// Extend THREE types for R3F
extend(THREE);

// ============================================================================
// Types & Interfaces
// ============================================================================

export type LagrangePointType = "L1" | "L2" | "L3" | "L4" | "L5";

/**
 * Configuration for a two-body system
 */
export interface TwoBodySystem {
  /** Primary body mass (kg) */
  primaryMass: number;
  /** Secondary body mass (kg) */
  secondaryMass: number;
  /** Distance between bodies (km) */
  distance: number;
  /** Primary body position (defaults to origin) */
  primaryPosition?: THREE.Vector3 | [number, number, number];
  /** Secondary body position (calculated if not provided) */
  secondaryPosition?: THREE.Vector3 | [number, number, number];
}

/**
 * Lagrange point data
 */
export interface LagrangePointData {
  /** Point type */
  type: LagrangePointType;
  /** Position in 3D space */
  position: THREE.Vector3;
  /** Stability (true for L4/L5, false for L1/L2/L3) */
  stable: boolean;
  /** Distance from primary body (km) */
  distanceFromPrimary: number;
  /** Distance from secondary body (km) */
  distanceFromSecondary: number;
}

// ============================================================================
// Constants
// ============================================================================

export const L1_COLOR = "#ff0000";
export const L2_COLOR = "#ff9900";
export const L3_COLOR = "#ffff00";
export const L4_COLOR = "#00ff00";
export const L5_COLOR = "#00ffff";
export const DEFAULT_POINT_SIZE = 200;
export const DEFAULT_SHOW_LABELS = true;

// ============================================================================
// Utilities
// ============================================================================

/**
 * Convert position to Vector3
 */
function toVector3(
  pos?: THREE.Vector3 | [number, number, number]
): THREE.Vector3 {
  if (!pos) return new THREE.Vector3(0, 0, 0);
  return Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;
}

/**
 * Calculate mass ratio
 */
function calculateMassRatio(m1: number, m2: number): number {
  return m2 / (m1 + m2);
}

/**
 * Calculate L1 position (between bodies, closer to smaller)
 *
 * ⚠️ APPROXIMATION: Uses first-order expansion of exact solution.
 * Accurate to ~1% for small mass ratios (μ < 0.1).
 * For exact positions, use highPrecision mode or @plexusui/orbital-math.
 */
function calculateL1(
  primaryPos: THREE.Vector3,
  secondaryPos: THREE.Vector3,
  mu: number,
  distance: number,
  highPrecision: boolean = false
): THREE.Vector3 {
  let r: number;

  if (highPrecision) {
    // High-precision solver (Newton-Raphson)
    r = solveL1PositionExact(mu) * distance;
  } else {
    // First-order approximation: r ≈ d × (μ/3)^(1/3)
    r = distance * Math.pow(mu / 3, 1 / 3);
  }

  const direction = secondaryPos.clone().sub(primaryPos).normalize();
  return primaryPos.clone().add(direction.multiplyScalar(r));
}

/**
 * Newton-Raphson solver for L1 (high-precision)
 * Returns normalized distance from barycenter
 */
function solveL1PositionExact(mu: number, tolerance = 1e-10): number {
  let r = 1 - Math.pow(mu / 3, 1 / 3); // initial guess

  for (let i = 0; i < 50; i++) {
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

  return r;
}

/**
 * Calculate L2 position (beyond smaller body)
 */
function calculateL2(
  primaryPos: THREE.Vector3,
  secondaryPos: THREE.Vector3,
  mu: number,
  distance: number,
  highPrecision: boolean = false
): THREE.Vector3 {
  let r: number;

  if (highPrecision) {
    r = solveL2PositionExact(mu) * distance;
  } else {
    r = distance * (1 + Math.pow(mu / 3, 1 / 3));
  }

  const direction = secondaryPos.clone().sub(primaryPos).normalize();
  return primaryPos.clone().add(direction.multiplyScalar(r));
}

function solveL2PositionExact(mu: number, tolerance = 1e-10): number {
  let r = 1 + Math.pow(mu / 3, 1 / 3);

  for (let i = 0; i < 50; i++) {
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

  return r;
}

/**
 * Calculate L3 position (opposite smaller body)
 */
function calculateL3(
  primaryPos: THREE.Vector3,
  secondaryPos: THREE.Vector3,
  mu: number,
  distance: number,
  highPrecision: boolean = false
): THREE.Vector3 {
  let r: number;

  if (highPrecision) {
    r = Math.abs(solveL3PositionExact(mu)) * distance;
  } else {
    r = distance * (1 + 5 * mu / 12);
  }

  const direction = secondaryPos.clone().sub(primaryPos).normalize().negate();
  return primaryPos.clone().add(direction.multiplyScalar(r));
}

function solveL3PositionExact(mu: number, tolerance = 1e-10): number {
  let r = -1 - 5 * mu / 12;

  for (let i = 0; i < 50; i++) {
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

  return r;
}

/**
 * Calculate L4 position (60° ahead in orbit)
 */
function calculateL4(
  primaryPos: THREE.Vector3,
  secondaryPos: THREE.Vector3,
  distance: number
): THREE.Vector3 {
  const center = primaryPos
    .clone()
    .add(secondaryPos.clone().sub(primaryPos).multiplyScalar(0.5));
  const direction = secondaryPos.clone().sub(primaryPos);
  const angle = Math.PI / 3; // 60 degrees

  const x =
    direction.x * Math.cos(angle) -
    direction.z * Math.sin(angle);
  const z =
    direction.x * Math.sin(angle) +
    direction.z * Math.cos(angle);

  return new THREE.Vector3(
    primaryPos.x + x,
    primaryPos.y,
    primaryPos.z + z
  );
}

/**
 * Calculate L5 position (60° behind in orbit)
 */
function calculateL5(
  primaryPos: THREE.Vector3,
  secondaryPos: THREE.Vector3,
  distance: number
): THREE.Vector3 {
  const center = primaryPos
    .clone()
    .add(secondaryPos.clone().sub(primaryPos).multiplyScalar(0.5));
  const direction = secondaryPos.clone().sub(primaryPos);
  const angle = -Math.PI / 3; // -60 degrees

  const x =
    direction.x * Math.cos(angle) -
    direction.z * Math.sin(angle);
  const z =
    direction.x * Math.sin(angle) +
    direction.z * Math.cos(angle);

  return new THREE.Vector3(
    primaryPos.x + x,
    primaryPos.y,
    primaryPos.z + z
  );
}

/**
 * Calculate all Lagrange points for a two-body system
 */
function calculateAllLagrangePoints(
  system: TwoBodySystem,
  highPrecision: boolean = false
): LagrangePointData[] {
  const primaryPos = toVector3(system.primaryPosition);
  const secondaryPos = system.secondaryPosition
    ? toVector3(system.secondaryPosition)
    : new THREE.Vector3(system.distance, 0, 0);

  const mu = calculateMassRatio(system.primaryMass, system.secondaryMass);
  const d = system.distance;

  const points: LagrangePointData[] = [];

  // L1
  const l1Pos = calculateL1(primaryPos, secondaryPos, mu, d, highPrecision);
  points.push({
    type: "L1",
    position: l1Pos,
    stable: false,
    distanceFromPrimary: l1Pos.distanceTo(primaryPos),
    distanceFromSecondary: l1Pos.distanceTo(secondaryPos),
  });

  // L2
  const l2Pos = calculateL2(primaryPos, secondaryPos, mu, d, highPrecision);
  points.push({
    type: "L2",
    position: l2Pos,
    stable: false,
    distanceFromPrimary: l2Pos.distanceTo(primaryPos),
    distanceFromSecondary: l2Pos.distanceTo(secondaryPos),
  });

  // L3
  const l3Pos = calculateL3(primaryPos, secondaryPos, mu, d, highPrecision);
  points.push({
    type: "L3",
    position: l3Pos,
    stable: false,
    distanceFromPrimary: l3Pos.distanceTo(primaryPos),
    distanceFromSecondary: l3Pos.distanceTo(secondaryPos),
  });

  // L4
  const l4Pos = calculateL4(primaryPos, secondaryPos, d);
  points.push({
    type: "L4",
    position: l4Pos,
    stable: true,
    distanceFromPrimary: l4Pos.distanceTo(primaryPos),
    distanceFromSecondary: l4Pos.distanceTo(secondaryPos),
  });

  // L5
  const l5Pos = calculateL5(primaryPos, secondaryPos, d);
  points.push({
    type: "L5",
    position: l5Pos,
    stable: true,
    distanceFromPrimary: l5Pos.distanceTo(primaryPos),
    distanceFromSecondary: l5Pos.distanceTo(secondaryPos),
  });

  return points;
}

/**
 * Get color for Lagrange point
 */
function getPointColor(type: LagrangePointType): string {
  switch (type) {
    case "L1":
      return L1_COLOR;
    case "L2":
      return L2_COLOR;
    case "L3":
      return L3_COLOR;
    case "L4":
      return L4_COLOR;
    case "L5":
      return L5_COLOR;
  }
}

// ============================================================================
// PRIMITIVES
// ============================================================================

export interface LaGrangePointsRootProps {
  /** Two-body system configuration */
  system: TwoBodySystem;
  /** Which points to show (defaults to all) */
  showPoints?: LagrangePointType[];
  /** Point marker size */
  pointSize?: number;
  /** Show labels */
  showLabels?: boolean;
  /** Show stability indicators */
  showStability?: boolean;
  /** Show connecting lines to bodies */
  showConnectionLines?: boolean;
  /** Custom colors for points */
  colors?: Partial<Record<LagrangePointType, string>>;
  /** Show primary body marker */
  showPrimaryBody?: boolean;
  /** Show secondary body marker */
  showSecondaryBody?: boolean;
  /** Primary body size */
  primaryBodySize?: number;
  /** Secondary body size */
  secondaryBodySize?: number;
  /** Primary body color */
  primaryBodyColor?: string;
  /** Secondary body color */
  secondaryBodyColor?: string;
  /** Use high-precision Newton-Raphson solver (default: false) */
  highPrecision?: boolean;
}

/**
 * LaGrangePointsRoot - The base Lagrange points primitive component
 *
 * Renders L1-L5 Lagrange points for a two-body system.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <LaGrangePointsRoot
 *     system={{
 *       primaryMass: 5.972e24, // Earth
 *       secondaryMass: 7.342e22, // Moon
 *       distance: 384400, // km
 *     }}
 *     showPoints={["L1", "L2", "L4", "L5"]}
 *     showLabels
 *   />
 * </Canvas>
 * ```
 */
export const LaGrangePointsRoot = memo(
  forwardRef<THREE.Group, LaGrangePointsRootProps>(
    (
      {
        system,
        showPoints,
        pointSize = DEFAULT_POINT_SIZE,
        showLabels = DEFAULT_SHOW_LABELS,
        showStability = false,
        showConnectionLines = false,
        colors = {},
        showPrimaryBody = true,
        showSecondaryBody = true,
        primaryBodySize = 1000,
        secondaryBodySize = 500,
        primaryBodyColor = "#0000ff",
        secondaryBodyColor = "#888888",
        highPrecision = false,
      },
      ref
    ) => {
      // Calculate all Lagrange points
      const lagrangePoints = useMemo(
        () => calculateAllLagrangePoints(system, highPrecision),
        [system, highPrecision]
      );

      // Filter points to show
      const visiblePoints = useMemo(() => {
        if (!showPoints) return lagrangePoints;
        return lagrangePoints.filter((p) => showPoints.includes(p.type));
      }, [lagrangePoints, showPoints]);

      // Body positions
      const primaryPos = toVector3(system.primaryPosition);
      const secondaryPos = system.secondaryPosition
        ? toVector3(system.secondaryPosition)
        : new THREE.Vector3(system.distance, 0, 0);

      return (
        <group ref={ref}>
          {/* Primary body */}
          {showPrimaryBody && (
            <mesh position={primaryPos}>
              <sphereGeometry args={[primaryBodySize, 32, 32]} />
              <meshBasicMaterial color={primaryBodyColor} />
            </mesh>
          )}

          {/* Secondary body */}
          {showSecondaryBody && (
            <mesh position={secondaryPos}>
              <sphereGeometry args={[secondaryBodySize, 32, 32]} />
              <meshBasicMaterial color={secondaryBodyColor} />
            </mesh>
          )}

          {/* Lagrange points */}
          {visiblePoints.map((point) => {
            const color = colors[point.type] || getPointColor(point.type);

            return (
              <group key={point.type}>
                {/* Point marker */}
                <mesh position={point.position}>
                  <sphereGeometry args={[pointSize, 16, 16]} />
                  <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={point.stable ? 0.9 : 0.7}
                  />
                </mesh>

                {/* Stability indicator (ring for stable points) */}
                {showStability && point.stable && (
                  <mesh position={point.position} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[pointSize * 1.5, pointSize * 0.1, 16, 32]} />
                    <meshBasicMaterial color={color} transparent opacity={0.5} />
                  </mesh>
                )}

                {/* Connection lines */}
                {showConnectionLines && (
                  <>
                    <line>
                      <bufferGeometry>
                        <bufferAttribute
                          attach="attributes-position"
                          count={2}
                          array={
                            new Float32Array([
                              point.position.x,
                              point.position.y,
                              point.position.z,
                              primaryPos.x,
                              primaryPos.y,
                              primaryPos.z,
                            ])
                          }
                          itemSize={3}
                        />
                      </bufferGeometry>
                      <lineBasicMaterial
                        color={color}
                        transparent
                        opacity={0.3}
                      />
                    </line>
                    <line>
                      <bufferGeometry>
                        <bufferAttribute
                          attach="attributes-position"
                          count={2}
                          array={
                            new Float32Array([
                              point.position.x,
                              point.position.y,
                              point.position.z,
                              secondaryPos.x,
                              secondaryPos.y,
                              secondaryPos.z,
                            ])
                          }
                          itemSize={3}
                        />
                      </bufferGeometry>
                      <lineBasicMaterial
                        color={color}
                        transparent
                        opacity={0.3}
                      />
                    </line>
                  </>
                )}
              </group>
            );
          })}
        </group>
      );
    }
  )
);

LaGrangePointsRoot.displayName = "LaGrangePointsRoot";

// ============================================================================
// COMPOSED COMPONENT
// ============================================================================

export interface LaGrangePointsProps extends LaGrangePointsRootProps {
  /** Additional children to render */
  children?: React.ReactNode;
}

/**
 * LaGrangePoints - Lagrange point visualization component
 *
 * A primitive-based component for visualizing L1-L5 equilibrium points in
 * two-body orbital systems. Highlights stable vs unstable points.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <LaGrangePoints
 *     system={{
 *       primaryMass: 5.972e24, // Earth
 *       secondaryMass: 7.342e22, // Moon
 *       distance: 384400,
 *     }}
 *     showStability
 *     showConnectionLines
 *   />
 * </Canvas>
 * ```
 */
const LaGrangePointsComponent = forwardRef<THREE.Group, LaGrangePointsProps>(
  (props, ref) => {
    return (
      <LaGrangePointsRoot ref={ref} {...props} />
    );
  }
);

LaGrangePointsComponent.displayName = "LaGrangePoints";

export const LaGrangePoints = memo(LaGrangePointsComponent);

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Utility functions for Lagrange point calculations
 */
export const LaGrangePointsUtils = {
  /**
   * Calculate all Lagrange points
   */
  calculateAllPoints: calculateAllLagrangePoints,

  /**
   * Calculate mass ratio
   */
  calculateMassRatio,

  /**
   * Check if point is stable
   */
  isStable: (type: LagrangePointType): boolean => {
    return type === "L4" || type === "L5";
  },

  /**
   * Get point color
   */
  getPointColor,

  /**
   * Earth-Moon system preset
   */
  EarthMoonSystem: (): TwoBodySystem => ({
    primaryMass: 5.972e24, // Earth mass (kg)
    secondaryMass: 7.342e22, // Moon mass (kg)
    distance: 384400, // km
  }),

  /**
   * Sun-Earth system preset
   */
  SunEarthSystem: (): TwoBodySystem => ({
    primaryMass: 1.989e30, // Sun mass (kg)
    secondaryMass: 5.972e24, // Earth mass (kg)
    distance: 149600000, // km (1 AU)
  }),

  /**
   * Earth-Sun L2 (JWST location) preset
   */
  JWSTSystem: (): TwoBodySystem => ({
    primaryMass: 1.989e30,
    secondaryMass: 5.972e24,
    distance: 149600000,
  }),

  /**
   * Convert position to Vector3
   */
  toVector3,
};
