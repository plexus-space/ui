"use client";

/**
 * OrbitPath - Analytical Keplerian Orbit Visualization
 *
 * Renders orbital paths from classical orbital elements.
 * Uses analytical equations (no numerical integration needed).
 *
 * **Features:**
 * - Keplerian element input (a, e, i, Ω, ω, ν)
 * - Automatic path calculation
 * - Elliptical, parabolic, and hyperbolic orbits
 * - Customizable appearance
 *
 * @example
 * ```tsx
 * <OrbitPath
 *   semiMajorAxis={7000}         // km
 *   eccentricity={0.05}          // 0 = circle, <1 = ellipse
 *   inclination={51.6}           // degrees
 *   longitudeOfAscendingNode={0} // degrees
 *   argumentOfPeriapsis={0}      // degrees
 *   color="#00ffff"
 *   segments={256}
 * />
 * ```
 */

import * as React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Types
// ============================================================================

export interface OrbitPathProps extends Omit<React.ComponentProps<typeof Line>, "points"> {
  /**
   * Semi-major axis (km)
   * For elliptical orbits: average of periapsis and apoapsis distances
   */
  semiMajorAxis: number;

  /**
   * Eccentricity (dimensionless)
   * - 0 = perfect circle
   * - 0 < e < 1 = ellipse
   * - e = 1 = parabola
   * - e > 1 = hyperbola
   */
  eccentricity?: number;

  /**
   * Inclination (degrees)
   * Angle between orbital plane and reference plane (typically equator)
   * @default 0
   */
  inclination?: number;

  /**
   * Longitude of ascending node (degrees)
   * Angle from reference direction to ascending node
   * @default 0
   */
  longitudeOfAscendingNode?: number;

  /**
   * Argument of periapsis (degrees)
   * Angle from ascending node to periapsis
   * @default 0
   */
  argumentOfPeriapsis?: number;

  /**
   * Number of segments for smooth curve
   * @default 128
   * @range 32-512
   */
  segments?: number;

  /**
   * Line color
   * @default "#00ffff"
   */
  color?: string | number;

  /**
   * Line width
   * @default 2
   */
  lineWidth?: number;

  /**
   * Show direction arrows
   * @default false
   */
  showDirection?: boolean;

  /**
   * Show periapsis/apoapsis markers
   * @default false
   */
  showApsides?: boolean;
}

// ============================================================================
// Orbital Mechanics Functions
// ============================================================================

/**
 * Calculate position on orbit at true anomaly
 * @param a Semi-major axis (km)
 * @param e Eccentricity
 * @param nu True anomaly (radians)
 * @returns Position in orbital plane [x, y, 0]
 */
function orbitPosition(a: number, e: number, nu: number): [number, number, number] {
  // Orbital radius at true anomaly
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

  // Position in orbital plane (periapsis at x-axis)
  const x = r * Math.cos(nu);
  const y = r * Math.sin(nu);

  return [x, y, 0];
}

/**
 * Create rotation matrix for orbital plane
 * @param i Inclination (radians)
 * @param Omega Longitude of ascending node (radians)
 * @param omega Argument of periapsis (radians)
 * @returns Rotation matrix
 */
function orbitalRotationMatrix(
  i: number,
  Omega: number,
  omega: number
): THREE.Matrix4 {
  const matrix = new THREE.Matrix4();

  // Rotate by argument of periapsis (around Z)
  matrix.makeRotationZ(omega);

  // Rotate by inclination (around X)
  const inclMatrix = new THREE.Matrix4().makeRotationX(i);
  matrix.premultiply(inclMatrix);

  // Rotate by longitude of ascending node (around Z)
  const raanMatrix = new THREE.Matrix4().makeRotationZ(Omega);
  matrix.premultiply(raanMatrix);

  return matrix;
}

// ============================================================================
// Component
// ============================================================================

export const OrbitPath = React.forwardRef<THREE.Line, OrbitPathProps>(
  (
    {
      semiMajorAxis,
      eccentricity = 0,
      inclination = 0,
      longitudeOfAscendingNode = 0,
      argumentOfPeriapsis = 0,
      segments = 128,
      color = "#00ffff",
      lineWidth = 2,
      showDirection = false,
      showApsides = false,
      ...props
    },
    ref
  ) => {
    // Convert angles to radians
    const i = (inclination * Math.PI) / 180;
    const Omega = (longitudeOfAscendingNode * Math.PI) / 180;
    const omega = (argumentOfPeriapsis * Math.PI) / 180;

    // Validate inputs
    if (semiMajorAxis <= 0) {
      console.error("OrbitPath: semiMajorAxis must be positive");
      return null;
    }

    if (eccentricity < 0) {
      console.error("OrbitPath: eccentricity must be non-negative");
      return null;
    }

    if (eccentricity >= 1) {
      console.warn(
        "OrbitPath: Parabolic (e=1) and hyperbolic (e>1) orbits not fully supported yet"
      );
    }

    // Calculate orbit points
    const points = React.useMemo(() => {
      const pts: THREE.Vector3[] = [];

      // Create rotation matrix
      const rotMatrix = orbitalRotationMatrix(i, Omega, omega);

      // Generate points along orbit
      // For ellipses, sweep full 2π
      // For parabolas/hyperbolas, limit sweep angle
      const maxAngle = eccentricity < 1 ? 2 * Math.PI : Math.PI * 0.95;

      for (let seg = 0; seg <= segments; seg++) {
        const nu = (seg / segments) * maxAngle;
        const [x, y, z] = orbitPosition(semiMajorAxis, eccentricity, nu);

        const point = new THREE.Vector3(x, y, z);
        point.applyMatrix4(rotMatrix);
        pts.push(point);
      }

      return pts;
    }, [semiMajorAxis, eccentricity, i, Omega, omega, segments]);

    // Calculate periapsis and apoapsis positions
    const apsides = React.useMemo(() => {
      if (!showApsides || eccentricity >= 1) return null;

      const rotMatrix = orbitalRotationMatrix(i, Omega, omega);

      // Periapsis (nu = 0)
      const [xp, yp, zp] = orbitPosition(semiMajorAxis, eccentricity, 0);
      const periapsis = new THREE.Vector3(xp, yp, zp);
      periapsis.applyMatrix4(rotMatrix);

      // Apoapsis (nu = π)
      const [xa, ya, za] = orbitPosition(semiMajorAxis, eccentricity, Math.PI);
      const apoapsis = new THREE.Vector3(xa, ya, za);
      apoapsis.applyMatrix4(rotMatrix);

      return { periapsis, apoapsis };
    }, [semiMajorAxis, eccentricity, i, Omega, omega, showApsides]);

    return (
      <group>
        {/* Main orbit path */}
        <Line
          ref={ref}
          points={points}
          color={color}
          lineWidth={lineWidth}
          {...props}
        />

        {/* Periapsis marker */}
        {apsides && (
          <>
            <mesh position={apsides.periapsis}>
              <sphereGeometry args={[semiMajorAxis * 0.02, 16, 16]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>

            {/* Apoapsis marker */}
            <mesh position={apsides.apoapsis}>
              <sphereGeometry args={[semiMajorAxis * 0.02, 16, 16]} />
              <meshBasicMaterial color="#0000ff" />
            </mesh>
          </>
        )}

        {/* Direction arrows (optional) */}
        {showDirection && points.length > 10 && (
          <>
            {[
              Math.floor(points.length * 0.25),
              Math.floor(points.length * 0.5),
              Math.floor(points.length * 0.75),
            ].map((idx) => {
              const p1 = points[idx];
              const p2 = points[Math.min(idx + 1, points.length - 1)];
              const direction = new THREE.Vector3()
                .subVectors(p2, p1)
                .normalize();

              return (
                <arrowHelper
                  key={idx}
                  args={[
                    direction,
                    p1,
                    semiMajorAxis * 0.1,
                    color,
                    semiMajorAxis * 0.05,
                    semiMajorAxis * 0.05,
                  ]}
                />
              );
            })}
          </>
        )}
      </group>
    );
  }
);

OrbitPath.displayName = "OrbitPath";
