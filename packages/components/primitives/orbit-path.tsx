"use client";

import * as React from "react";
import { Line } from "@react-three/drei";
import type { Vec3 } from "./physics";
import { computeOrbitPath } from "./orbital-mechanics";
import type { InitialOrbit } from "../../hooks/use-orbital-propagation";
import { EARTH_MU } from "../../hooks/use-orbital-propagation";

/**
 * ORBIT PATH - Rendering Primitive
 *
 * Renders static analytical orbit path (ellipse in 3D).
 * Pure rendering primitive - composes with orbital data.
 *
 * **Shadcn Philosophy:**
 * - ONE JOB: Render a static orbit ellipse
 * - COMPOSABLE: Works with orbital elements
 * - REUSABLE: Any Keplerian orbit (satellites, planets, asteroids)
 *
 * **Usage:**
 * ```tsx
 * <OrbitPath
 *   orbit={{
 *     semiMajorAxis: 6778,
 *     eccentricity: 0.0003,
 *     inclination: 51.6,
 *   }}
 *   color="#00ff00"
 *   opacity={0.3}
 * />
 * ```
 */

export interface OrbitPathProps {
  /** Orbital elements */
  orbit: InitialOrbit;
  /** Number of points around orbit */
  segments?: number;
  /** Line color */
  color?: string;
  /** Line width */
  lineWidth?: number;
  /** Opacity */
  opacity?: number;
}


/**
 * OrbitPath Primitive Component
 *
 * Renders a static analytical orbit ellipse.
 */
export const OrbitPath: React.FC<OrbitPathProps> = ({
  orbit,
  segments = 360,
  color = "#00ff00",
  lineWidth = 1,
  opacity = 0.3,
}) => {
  // Memoize orbit path computation (depend on actual values, not object identity)
  const points = React.useMemo(() => {
    return computeOrbitPath(orbit, segments, EARTH_MU);
  }, [
    orbit.semiMajorAxis,
    orbit.eccentricity,
    orbit.inclination,
    orbit.longitudeOfAscendingNode,
    orbit.argumentOfPeriapsis,
    segments,
  ]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      opacity={opacity}
      transparent
    />
  );
};

OrbitPath.displayName = "OrbitPath";
