"use client";

import * as React from "react";
import type { Vec3 } from "./physics";
import { validateVec3 } from "./validation";

/**
 * MARKER - Rendering Primitive
 *
 * Simple 3D marker for satellites, waypoints, particles, etc.
 * Pure rendering primitive - composes with data from hooks.
 *
 * **Shadcn Philosophy:**
 * - ONE JOB: Render a marker at a position
 * - COMPOSABLE: Works with any data source
 * - REUSABLE: Satellites, particles, waypoints, annotations
 *
 * **Usage:**
 * ```tsx
 * const { satellites } = useOrbitalPropagation({ ... });
 *
 * return satellites.map(sat => (
 *   <Marker
 *     key={sat.id}
 *     position={sat.position}
 *     size={200}
 *     color={sat.color}
 *   />
 * ));
 * ```
 */

export interface MarkerProps {
  /**
   * Position in 3D space (kilometers for orbital mechanics)
   * @example [6778, 0, 0] // ISS orbit altitude
   */
  position: Vec3;
  /**
   * Marker size (kilometers for orbital mechanics scale)
   * @default 100
   * @example 200 // Typical satellite marker
   */
  size?: number;
  /** Color (any CSS color) */
  color?: string;
  /** Opacity (0-1) */
  opacity?: number;
  /** Emissive (glow effect) */
  emissive?: boolean;
  /** Segments (higher = smoother sphere) */
  segments?: number;
}

/**
 * Marker Primitive Component
 *
 * Renders a simple sphere marker at a position.
 */
export const Marker: React.FC<MarkerProps> = ({
  position,
  size = 100,
  color = "#ffffff",
  opacity = 1,
  emissive = true,
  segments = 8,
}) => {
  // Validate position
  if (!validateVec3(position, "Marker position")) {
    return null;
  }

  return (
    <mesh position={position as [number, number, number]}>
      <sphereGeometry args={[size, segments, segments]} />
      <meshBasicMaterial
        color={color}
        opacity={opacity}
        transparent={opacity < 1}
        toneMapped={!emissive}
      />
    </mesh>
  );
};

Marker.displayName = "Marker";
