"use client";

import * as React from "react";
import { LineRenderer, type LineRendererHandle } from "./gpu-line-renderer";
import { useFrame } from "@react-three/fiber";
import type { Vec3 } from "./physics";
import { isValidVec3 } from "./validation";

/**
 * TRAIL - Rendering Primitive
 *
 * GPU-accelerated streaming trail for satellite paths, particle traces, etc.
 * Pure rendering primitive - composes with data from hooks.
 *
 * **Shadcn Philosophy:**
 * - ONE JOB: Render a streaming trail
 * - COMPOSABLE: Works with any data source
 * - REUSABLE: ECG traces, satellite paths, particle systems
 *
 * **Usage:**
 * ```tsx
 * const { satellites } = useOrbitalPropagation({ ... });
 *
 * return satellites.map(sat => (
 *   <Trail
 *     key={sat.id}
 *     position={sat.position}
 *     maxLength={200}
 *     color={sat.color}
 *   />
 * ));
 * ```
 */

export interface TrailProps {
  /** Current position to add to trail */
  position: Vec3;
  /** Maximum trail length (number of points) */
  maxLength?: number;
  /** Trail color */
  color?: string;
  /** Line width */
  width?: number;
  /** Opacity */
  opacity?: number;
  /** Additive blending for glow effect */
  additive?: boolean;
  /** Update every N frames (1 = every frame, 2 = every other frame) */
  updateInterval?: number;
}

/**
 * Trail Primitive Component
 *
 * Renders a GPU-accelerated streaming trail.
 */
export const Trail: React.FC<TrailProps> = ({
  position,
  maxLength = 200,
  color = "#ffffff",
  width = 2,
  opacity = 0.9,
  additive = true,
  updateInterval = 1,
}) => {
  const lineRef = React.useRef<LineRendererHandle>(null);
  const frameCounter = React.useRef(0);

  useFrame(() => {
    frameCounter.current++;

    // Only update every N frames
    if (frameCounter.current % updateInterval !== 0) return;

    // Add point to trail (validate all components)
    if (lineRef.current && isValidVec3(position)) {
      lineRef.current.addPoint(position);
    }
  });

  return (
    <LineRenderer
      ref={lineRef}
      capacity={maxLength}
      streaming
      color={color}
      opacity={opacity}
      width={width}
      additive={additive}
    />
  );
};

Trail.displayName = "Trail";
