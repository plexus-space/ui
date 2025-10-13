"use client";

import { useRef, useMemo, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Vector Field Renderer
 *
 * GPU-accelerated rendering of vector fields using instanced arrow geometry.
 * Used by: Fluid flow, forces, magnetic fields, gradients, wind patterns, blood flow.
 *
 * Features:
 * - GPU instanced rendering for 10k+ vectors
 * - Color mapping by magnitude
 * - Streamline mode for flow visualization
 * - Arrow, cone, or line representation
 * - Length scaling by magnitude
 *
 * @example
 * ```tsx
 * // Aerodynamic forces on spacecraft
 * <VectorField
 *   origins={[
 *     [0, 0, 0],
 *     [1, 0, 0],
 *     [2, 0, 0]
 *   ]}
 *   directions={[
 *     [0, 1, 0.5],
 *     [0, 0.8, 0.6],
 *     [0, 1.2, 0.3]
 *   ]}
 *   colorByMagnitude
 *   colormap={["#0000ff", "#00ffff", "#ffff00", "#ff0000"]}
 * />
 *
 * // Surgical instrument forces (same primitive!)
 * <VectorField
 *   origins={instrumentPositions}
 *   directions={forceVectors}
 *   style="arrow"
 *   scale={0.1}
 * />
 * ```
 */

export interface VectorFieldProps {
  /** Origin points for vectors [x, y, z][] */
  origins: number[][];

  /** Direction vectors [dx, dy, dz][] (will be normalized) */
  directions?: number[][];

  /** Magnitudes (optional, computed from directions if not provided) */
  magnitudes?: number[];

  /** Vector style */
  style?: "arrow" | "cone" | "line";

  /** Scale factor for vector length */
  scale?: number;

  /** Normalize all vectors to same length */
  normalize?: boolean;

  /** Color (single or per vector) */
  color?: THREE.ColorRepresentation | THREE.ColorRepresentation[];

  /** Color by magnitude */
  colorByMagnitude?: boolean;

  /** Colormap for magnitude-based coloring */
  colormap?: THREE.ColorRepresentation[];

  /** Minimum magnitude for colormap */
  minMagnitude?: number;

  /** Maximum magnitude for colormap */
  maxMagnitude?: number;

  /** Arrow head size (relative to shaft) */
  arrowHeadSize?: number;

  /** Arrow shaft radius */
  shaftRadius?: number;

  /** Opacity */
  opacity?: number;

  /** Use additive blending */
  additive?: boolean;
}

export interface VectorFieldHandle {
  /** Update vector field */
  update: (
    origins: number[][],
    directions?: number[][],
    magnitudes?: number[]
  ) => void;

  /** Get current vector count */
  getVectorCount: () => number;
}

/**
 * Vector Field Component
 */
export const VectorField = forwardRef<VectorFieldHandle, VectorFieldProps>(
  (
    {
      origins,
      directions,
      magnitudes: providedMagnitudes,
      style = "arrow",
      scale = 1.0,
      normalize = false,
      color = 0x00ffff,
      colorByMagnitude = false,
      colormap = ["#0000ff", "#00ffff", "#ffff00", "#ff0000"],
      minMagnitude,
      maxMagnitude,
      arrowHeadSize = 0.2,
      shaftRadius = 0.02,
      opacity = 1.0,
      additive = false,
    },
    ref
  ) => {
    const groupRef = useRef<THREE.Group>(null);
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
    const needsUpdate = useRef(true);

    const originsBuffer = useRef<number[][]>(origins);
    const directionsBuffer = useRef<number[][]>(directions || []);
    const magnitudesBuffer = useRef<number[]>(providedMagnitudes || []);

    // Calculate magnitudes from directions if not provided
    const computedMagnitudes = useMemo(() => {
      if (providedMagnitudes) return providedMagnitudes;

      return (directions || []).map((dir) =>
        Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2)
      );
    }, [directions, providedMagnitudes]);

    // Colormap conversion
    const colormapColors = useMemo(() => {
      return colormap.map((c) => new THREE.Color(c));
    }, [colormap]);

    // Min/max magnitudes for colormap
    const [minMag, maxMag] = useMemo(() => {
      if (minMagnitude !== undefined && maxMagnitude !== undefined) {
        return [minMagnitude, maxMagnitude];
      }

      const mags = computedMagnitudes.length > 0 ? computedMagnitudes : [0, 1];
      return [Math.min(...mags), Math.max(...mags)];
    }, [computedMagnitudes, minMagnitude, maxMagnitude]);

    // Get color from magnitude
    const getColorFromMagnitude = useCallback(
      (magnitude: number): THREE.Color => {
        const t = (magnitude - minMag) / (maxMag - minMag || 1);
        const clampedT = Math.max(0, Math.min(1, t));

        const segmentIndex = Math.floor(clampedT * (colormapColors.length - 1));
        const segmentT = (clampedT * (colormapColors.length - 1)) % 1;

        const color = new THREE.Color().lerpColors(
          colormapColors[segmentIndex],
          colormapColors[Math.min(segmentIndex + 1, colormapColors.length - 1)],
          segmentT
        );

        return color;
      },
      [minMag, maxMag, colormapColors]
    );

    // Create arrow geometry (shaft + cone head)
    const arrowGeometry = useMemo(() => {
      const shaftGeometry = new THREE.CylinderGeometry(
        shaftRadius,
        shaftRadius,
        1 - arrowHeadSize,
        8
      );
      shaftGeometry.translate(0, (1 - arrowHeadSize) / 2, 0);

      const coneGeometry = new THREE.ConeGeometry(
        shaftRadius * 3,
        arrowHeadSize,
        8
      );
      coneGeometry.translate(0, 1 - arrowHeadSize / 2, 0);

      const mergedGeometry = mergeGeometries([
        shaftGeometry,
        coneGeometry,
      ]);

      return mergedGeometry || new THREE.BufferGeometry();
    }, [shaftRadius, arrowHeadSize]);

    // Create cone geometry (for cone style)
    const coneGeometry = useMemo(() => {
      return new THREE.ConeGeometry(shaftRadius * 3, 1, 8);
    }, [shaftRadius]);

    // Select geometry based on style
    const geometry = useMemo(() => {
      switch (style) {
        case "arrow":
          return arrowGeometry;
        case "cone":
          return coneGeometry;
        case "line":
          return new THREE.CylinderGeometry(shaftRadius, shaftRadius, 1, 8);
        default:
          return arrowGeometry;
      }
    }, [style, arrowGeometry, coneGeometry, shaftRadius]);

    // Update instance transforms
    const updateInstances = useCallback(() => {
      if (!instancedMeshRef.current || originsBuffer.current.length === 0) return;

      const tempObject = new THREE.Object3D();
      const tempColor = new THREE.Color();

      originsBuffer.current.forEach((origin, i) => {
        const direction = directionsBuffer.current[i] || [0, 1, 0];
        const magnitude = magnitudesBuffer.current[i] || 1;

        // Position
        tempObject.position.set(origin[0], origin[1], origin[2]);

        // Rotation to align with direction
        const dir = new THREE.Vector3(direction[0], direction[1], direction[2]);
        if (normalize) {
          dir.normalize();
        }

        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          axis,
          dir.clone().normalize()
        );
        tempObject.quaternion.copy(quaternion);

        // Scale
        const length = normalize ? scale : magnitude * scale;
        tempObject.scale.set(1, length, 1);

        tempObject.updateMatrix();
        instancedMeshRef.current!.setMatrixAt(i, tempObject.matrix);

        // Color
        if (colorByMagnitude) {
          tempColor.copy(getColorFromMagnitude(magnitude));
        } else if (Array.isArray(color)) {
          tempColor.set(color[i] || color[0]);
        } else {
          tempColor.set(color);
        }

        instancedMeshRef.current!.setColorAt(i, tempColor);
      });

      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      if (instancedMeshRef.current.instanceColor) {
        instancedMeshRef.current.instanceColor.needsUpdate = true;
      }

      needsUpdate.current = false;
    }, [
      originsBuffer,
      directionsBuffer,
      magnitudesBuffer,
      normalize,
      scale,
      colorByMagnitude,
      getColorFromMagnitude,
      color,
    ]);

    // Initialize buffers
    useEffect(() => {
      originsBuffer.current = origins;
      directionsBuffer.current = directions || origins.map(() => [0, 1, 0]);
      magnitudesBuffer.current = computedMagnitudes;
      needsUpdate.current = true;
    }, [origins, directions, computedMagnitudes]);

    // Update on frame
    useFrame(() => {
      if (needsUpdate.current) {
        updateInstances();
      }
    });

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      update: (
        newOrigins: number[][],
        newDirections?: number[][],
        newMagnitudes?: number[]
      ) => {
        originsBuffer.current = newOrigins;
        directionsBuffer.current = newDirections || newOrigins.map(() => [0, 1, 0]);
        magnitudesBuffer.current =
          newMagnitudes ||
          (newDirections || []).map((dir) =>
            Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2)
          );
        needsUpdate.current = true;
      },
      getVectorCount: () => originsBuffer.current.length,
    }));

    const material = useMemo(() => {
      return new THREE.MeshBasicMaterial({
        transparent: opacity < 1 || additive,
        opacity,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        vertexColors: true,
      });
    }, [opacity, additive]);

    if (origins.length === 0) return null;

    return (
      <group ref={groupRef}>
        <instancedMesh
          ref={instancedMeshRef}
          args={[geometry, material, origins.length]}
        />
      </group>
    );
  }
);

VectorField.displayName = "VectorField";

/**
 * Streamlines
 *
 * Flow visualization using streamlines (following vector field).
 */
export interface StreamlinesProps {
  /** Seed points for streamlines */
  seeds: number[][];

  /** Vector field function: (position) => direction */
  vectorField: (position: [number, number, number]) => [number, number, number];

  /** Integration steps */
  steps?: number;

  /** Step size */
  stepSize?: number;

  /** Color */
  color?: THREE.ColorRepresentation;

  /** Line width */
  width?: number;

  /** Opacity */
  opacity?: number;
}

export function Streamlines({
  seeds,
  vectorField,
  steps = 100,
  stepSize = 0.1,
  color = 0x00ffff,
  width = 1,
  opacity = 1.0,
}: StreamlinesProps) {
  const streamlines = useMemo(() => {
    return seeds.map((seed) => {
      const line: number[][] = [seed];
      let currentPos = [...seed];

      for (let i = 0; i < steps; i++) {
        const direction = vectorField(currentPos as [number, number, number]);
        const magnitude = Math.sqrt(
          direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2
        );

        if (magnitude < 0.001) break; // Stop if vector is too small

        // Normalize and step
        const normalizedDir = direction.map((d) => (d / magnitude) * stepSize);

        currentPos = [
          currentPos[0] + normalizedDir[0],
          currentPos[1] + normalizedDir[1],
          currentPos[2] + normalizedDir[2],
        ];

        line.push([...currentPos]);
      }

      return line;
    });
  }, [seeds, vectorField, steps, stepSize]);

  return (
    <>
      {streamlines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={line.length}
              array={new Float32Array(line.flat())}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={color}
            linewidth={width}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </line>
      ))}
    </>
  );
}

/**
 * Quiver Plot (2D Vector Field)
 *
 * Grid-based vector field visualization (like matplotlib quiver).
 */
export interface QuiverPlotProps extends Omit<VectorFieldProps, "origins"> {
  /** X range [min, max] */
  xRange: [number, number];

  /** Y range [min, number] */
  yRange: [number, number];

  /** Z position (for 2D plot in 3D space) */
  z?: number;

  /** Grid resolution [nx, ny] */
  resolution: [number, number];

  /** Vector field function: (x, y) => [dx, dy] */
  vectorField: (x: number, y: number) => [number, number];
}

export function QuiverPlot({
  xRange,
  yRange,
  z = 0,
  resolution,
  vectorField,
  ...props
}: QuiverPlotProps) {
  const { origins, directions } = useMemo(() => {
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    const [nx, ny] = resolution;

    const origins: number[][] = [];
    const directions: number[][] = [];

    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const x = xMin + (i / (nx - 1)) * (xMax - xMin);
        const y = yMin + (j / (ny - 1)) * (yMax - yMin);

        origins.push([x, y, z]);

        const [dx, dy] = vectorField(x, y);
        directions.push([dx, dy, 0]);
      }
    }

    return { origins, directions };
  }, [xRange, yRange, z, resolution, vectorField]);

  return <VectorField origins={origins} directions={directions} {...props} />;
}
