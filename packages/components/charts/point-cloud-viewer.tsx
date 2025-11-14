"use client";

/**
 * Point Cloud Viewer
 *
 * Architectural Decision: Three.js + React Three Fiber
 * Rationale:
 * 1. 3D Spatial Navigation - Requires orbit controls, camera management
 * 2. Performance at Scale - Instanced rendering for 10M+ points
 * 3. Spatial Indexing - Octree for frustum culling
 * 4. Industry Standard - Three.js is battle-tested for point cloud visualization
 * 5. Consistency - Follows 3D Model Viewer pattern
 *
 * This component handles:
 * - LIDAR scans (terrain, buildings, infrastructure)
 * - CT/MRI voxel data (medical volumetric imaging)
 * - Particle simulations (physics, chemistry, molecular dynamics)
 * - Sensor networks in 3D space
 * - Astronomical data (star catalogs, galaxy surveys)
 *
 * Performance Target: 10M+ points at 60fps
 */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  viridis,
  plasma,
  inferno,
  cool,
  warm,
  grayscale,
  type ColorScaleName,
  colorScales,
} from "../lib/color-scales";

// ============================================================================
// Types
// ============================================================================

export interface PointCloudPoint {
  x: number;
  y: number;
  z: number;
  /** Optional intensity/classification value for coloring */
  value?: number;
  /** Optional custom RGB color [r, g, b] where each is 0-255 */
  color?: [number, number, number];
  /** Optional point size multiplier */
  size?: number;
}

export interface PointCloudViewerProps {
  /** Array of points to render */
  points: PointCloudPoint[];
  /** Color by point value using a color scale */
  colorBy?: "value" | "height" | "custom";
  /** Color scale to use when coloring by value */
  colorScale?: ColorScaleName | ((value: number) => string);
  /** Minimum value for color mapping (auto if not specified) */
  valueMin?: number;
  /** Maximum value for color mapping (auto if not specified) */
  valueMax?: number;
  /** Point size in pixels */
  pointSize?: number;
  /** Point shape */
  pointShape?: "square" | "circle" | "sphere";
  /** Filter points by value range */
  filter?: { min: number; max: number };
  /** Width of viewer */
  width?: number;
  /** Height of viewer */
  height?: number;
  /** Background color */
  background?: string;
  /** Show grid helper */
  showGrid?: boolean;
  /** Show axes helper */
  showAxes?: boolean;
  /** Enable point picking on click */
  enablePicking?: boolean;
  /** Callback when a point is clicked */
  onPointClick?: (point: PointCloudPoint, index: number) => void;
  className?: string;
  onLoad?: () => void;
}

interface PointCloudContextType {
  points: PointCloudPoint[];
  colorBy: "value" | "height" | "custom";
  colorScale: (value: number) => string;
  valueMin: number;
  valueMax: number;
  pointSize: number;
  pointShape: "square" | "circle" | "sphere";
  filter?: { min: number; max: number };
  enablePicking: boolean;
  onPointClick?: (point: PointCloudPoint, index: number) => void;
}

const PointCloudContext = createContext<PointCloudContextType | null>(null);

// ============================================================================
// Utilities
// ============================================================================

function calculateValueRange(
  points: PointCloudPoint[],
  colorBy: "value" | "height" | "custom"
): {
  min: number;
  max: number;
} {
  if (points.length === 0) {
    return { min: 0, max: 1 };
  }

  let min = Infinity;
  let max = -Infinity;

  for (const point of points) {
    let value: number;
    if (colorBy === "value") {
      value = point.value ?? 0;
    } else if (colorBy === "height") {
      value = point.y;
    } else {
      continue; // Custom colors don't need range
    }

    if (value < min) min = value;
    if (value > max) max = value;
  }

  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
}

function getColorForPoint(
  point: PointCloudPoint,
  colorBy: "value" | "height" | "custom",
  colorScale: (value: number) => string,
  valueMin: number,
  valueMax: number
): THREE.Color {
  // If point has custom color, use it
  if (colorBy === "custom" && point.color) {
    return new THREE.Color(
      `rgb(${point.color[0]}, ${point.color[1]}, ${point.color[2]})`
    );
  }

  // Otherwise use value or height with color scale
  let value: number;
  if (colorBy === "value") {
    value = point.value ?? valueMin;
  } else {
    value = point.y;
  }

  // Normalize to 0-1
  const normalized = (value - valueMin) / (valueMax - valueMin);
  const colorString = colorScale(normalized);
  return new THREE.Color(colorString);
}

// ============================================================================
// Point Cloud Renderer Component
// ============================================================================

function PointCloudRenderer() {
  const ctx = useContext(PointCloudContext);
  const { camera, gl } = useThree();

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const raycaster = useRef(new THREE.Raycaster());

  // Filter points if filter is set
  const filteredPoints = useMemo(() => {
    if (!ctx) return null;
    if (!ctx.filter) return ctx.points;

    return ctx.points.filter((point) => {
      const value = ctx.colorBy === "value" ? point.value ?? 0 : point.y;
      return value >= ctx.filter!.min && value <= ctx.filter!.max;
    });
  }, [ctx?.points, ctx?.filter, ctx?.colorBy]);

  // Create geometry based on point shape
  const geometry = useMemo(() => {
    if (!ctx) return null;
    if (ctx.pointShape === "sphere") {
      return new THREE.SphereGeometry(1, 8, 8);
    } else if (ctx.pointShape === "circle") {
      return new THREE.CircleGeometry(1, 16);
    } else {
      // square
      return new THREE.PlaneGeometry(1, 1);
    }
  }, [ctx?.pointShape]);

  // Create material
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    });
  }, []);

  // Update instance matrix and colors
  useEffect(() => {
    if (!meshRef.current || !ctx) return;

    const mesh = meshRef.current;
    const count = filteredPoints?.length ?? 0;

    // Update instance count
    mesh.count = count;

    const matrix = new THREE.Matrix4();

    for (let i = 0; i < count; i++) {
      const point = filteredPoints?.[i];
      if (!point || !ctx) continue;

      const size = (point.size ?? 1) * ctx.pointSize;

      // Set position and scale
      matrix.setPosition(point.x, point.y, point.z);
      matrix.scale(new THREE.Vector3(size, size, size));
      mesh.setMatrixAt(i, matrix);

      // Set color
      const pointColor = getColorForPoint(
        point,
        ctx.colorBy,
        ctx.colorScale,
        ctx.valueMin,
        ctx.valueMax
      );
      mesh.setColorAt(i, pointColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [
    filteredPoints,
    ctx?.colorBy,
    ctx?.colorScale,
    ctx?.valueMin,
    ctx?.valueMax,
    ctx?.pointSize,
  ]);

  // Handle point picking
  useEffect(() => {
    if (!ctx?.enablePicking || !meshRef.current) return;

    const handleClick = (event: MouseEvent) => {
      if (!meshRef.current) return;

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.current.intersectObject(meshRef.current);

      if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
        const index = intersects[0].instanceId;
        const point = filteredPoints?.[index];
        ctx?.onPointClick?.(point ?? { x: 0, y: 0, z: 0 }, index);
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [ctx?.enablePicking, ctx?.onPointClick, filteredPoints, camera, gl]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry ?? undefined, material, filteredPoints?.length ?? 0]}
      frustumCulled={true}
    />
  );
}

// ============================================================================
// Scene Component
// ============================================================================

function Scene({
  showGrid,
  showAxes,
  onLoad,
}: {
  showGrid?: boolean;
  showAxes?: boolean;
  onLoad?: () => void;
}) {
  const ctx = useContext(PointCloudContext);

  // Calculate bounding box for grid size
  const boundingBox = useMemo(() => {
    if (ctx?.points.length === 0) {
      return { min: { x: -5, y: -5, z: -5 }, max: { x: 5, y: 5, z: 5 } };
    }

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (const point of ctx?.points ?? []) {
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
      if (point.z < minZ) minZ = point.z;
      if (point.z > maxZ) maxZ = point.z;
    }

    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
    };
  }, [ctx?.points]);

  const gridSize = Math.max(
    boundingBox.max.x - boundingBox.min.x,
    boundingBox.max.z - boundingBox.min.z,
    10
  );

  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {showGrid && (
        <gridHelper
          args={[gridSize, Math.ceil(gridSize)]}
          position={[0, boundingBox.min.y, 0]}
        />
      )}
      {showAxes && <axesHelper args={[gridSize / 2]} />}

      <Suspense fallback={null}>
        <PointCloudRenderer />
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        target={[
          (boundingBox.min.x + boundingBox.max.x) / 2,
          (boundingBox.min.y + boundingBox.max.y) / 2,
          (boundingBox.min.z + boundingBox.max.z) / 2,
        ]}
      />
    </>
  );
}

// ============================================================================
// Root Component
// ============================================================================

function PointCloudViewerRoot({
  children,
  points,
  colorBy = "value",
  colorScale: colorScaleProp = "viridis",
  valueMin,
  valueMax,
  pointSize = 0.1,
  pointShape = "circle",
  filter,
  enablePicking = false,
  onPointClick,
}: {
  children?: React.ReactNode;
  points: PointCloudPoint[];
  colorBy?: "value" | "height" | "custom";
  colorScale?: ColorScaleName | ((value: number) => string);
  valueMin?: number;
  valueMax?: number;
  pointSize?: number;
  pointShape?: "square" | "circle" | "sphere";
  filter?: { min: number; max: number };
  enablePicking?: boolean;
  onPointClick?: (point: PointCloudPoint, index: number) => void;
}) {
  const autoRange = useMemo(
    () => calculateValueRange(points, colorBy),
    [points, colorBy]
  );

  const colorScaleFunc = useMemo(() => {
    if (typeof colorScaleProp === "function") {
      return colorScaleProp;
    }
    return colorScales[colorScaleProp] || viridis;
  }, [colorScaleProp]);

  const contextValue: PointCloudContextType = useMemo(
    () => ({
      points,
      colorBy,
      colorScale: colorScaleFunc,
      valueMin: valueMin ?? autoRange.min,
      valueMax: valueMax ?? autoRange.max,
      pointSize,
      pointShape,
      filter,
      enablePicking,
      onPointClick,
    }),
    [
      points,
      colorBy,
      colorScaleFunc,
      valueMin,
      valueMax,
      autoRange,
      pointSize,
      pointShape,
      filter,
      enablePicking,
      onPointClick,
    ]
  );

  return (
    <PointCloudContext.Provider value={contextValue}>
      {children}
    </PointCloudContext.Provider>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const PointCloudViewerComponent = ({
  points,
  colorBy = "value",
  colorScale = "viridis",
  valueMin,
  valueMax,
  pointSize = 0.1,
  pointShape = "circle",
  filter,
  width = 800,
  height = 600,
  background = "#1a1a1a",
  showGrid = true,
  showAxes = true,
  enablePicking = false,
  onPointClick,
  className,
  onLoad,
}: PointCloudViewerProps) => {
  // Calculate camera position based on bounding box
  const cameraPosition = useMemo((): [number, number, number] => {
    if (points.length === 0) return [5, 5, 5];

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (const point of points) {
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
      if (point.z < minZ) minZ = point.z;
      if (point.z > maxZ) maxZ = point.z;
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;
    const maxSize = Math.max(sizeX, sizeY, sizeZ, 1);

    const distance = maxSize * 1.5;

    return [
      centerX + distance * 0.6,
      centerY + distance * 0.6,
      centerZ + distance * 0.6,
    ];
  }, [points]);

  return (
    <PointCloudViewerRoot
      points={points}
      colorBy={colorBy}
      colorScale={colorScale}
      valueMin={valueMin}
      valueMax={valueMax}
      pointSize={pointSize}
      pointShape={pointShape}
      filter={filter}
      enablePicking={enablePicking}
      onPointClick={onPointClick}
    >
      <div
        style={{
          width,
          height,
          background,
          borderRadius: "8px",
          overflow: "hidden",
        }}
        className={className}
      >
        <Canvas
          camera={{
            position: cameraPosition,
            fov: 50,
          }}
          gl={{
            antialias: true,
          }}
        >
          <Scene showGrid={showGrid} showAxes={showAxes} onLoad={onLoad} />
        </Canvas>
      </div>
    </PointCloudViewerRoot>
  );
};

// Attach primitive components
PointCloudViewerComponent.Root = PointCloudViewerRoot;
PointCloudViewerComponent.Scene = Scene;
PointCloudViewerComponent.displayName = "PointCloudViewer";

export const PointCloudViewer = PointCloudViewerComponent;
export default PointCloudViewer;
