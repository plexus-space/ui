"use client";

import { useRef, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Surface Plot Types
// ============================================================================

export interface SurfaceData {
  x: number[];
  y: number[];
  z: number[][]; // 2D grid of height values
}

export interface SurfacePlotProps {
  data: SurfaceData;
  colormap?: "viridis" | "plasma" | "inferno" | "thermal" | "terrain";
  wireframe?: boolean;
  showContours?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

// ============================================================================
// Colormaps
// ============================================================================

const COLORMAPS = {
  viridis: [
    [68, 1, 84],
    [72, 40, 120],
    [62, 73, 137],
    [49, 104, 142],
    [38, 130, 142],
    [31, 158, 137],
    [53, 183, 121],
    [109, 205, 89],
    [180, 222, 44],
    [253, 231, 37],
  ],
  plasma: [
    [13, 8, 135],
    [75, 3, 161],
    [125, 3, 168],
    [168, 34, 150],
    [203, 70, 121],
    [229, 107, 93],
    [248, 148, 65],
    [253, 195, 40],
    [244, 237, 69],
    [240, 249, 33],
  ],
  inferno: [
    [0, 0, 4],
    [40, 11, 84],
    [101, 21, 110],
    [159, 42, 99],
    [212, 72, 66],
    [245, 125, 21],
    [250, 193, 39],
    [245, 239, 97],
    [252, 255, 164],
  ],
  thermal: [
    [0, 0, 0],
    [128, 0, 128],
    [255, 0, 0],
    [255, 128, 0],
    [255, 255, 0],
    [255, 255, 255],
  ],
  terrain: [
    [0, 0, 128],
    [0, 128, 128],
    [34, 139, 34],
    [139, 69, 19],
    [210, 180, 140],
    [255, 255, 255],
  ],
};

function getColorFromValue(
  value: number,
  min: number,
  max: number,
  colormap: keyof typeof COLORMAPS
): THREE.Color {
  const colors = COLORMAPS[colormap];
  const normalizedValue = (value - min) / (max - min);
  const scaledValue = Math.max(0, Math.min(1, normalizedValue));
  const index = scaledValue * (colors.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const t = index - lowerIndex;

  const lower = colors[lowerIndex];
  const upper = colors[upperIndex];

  const r = (lower[0] + (upper[0] - lower[0]) * t) / 255;
  const g = (lower[1] + (upper[1] - lower[1]) * t) / 255;
  const b = (lower[2] + (upper[2] - lower[2]) * t) / 255;

  return new THREE.Color(r, g, b);
}

// ============================================================================
// Surface Mesh Component
// ============================================================================

interface SurfaceMeshProps {
  data: SurfaceData;
  colormap: keyof typeof COLORMAPS;
  wireframe: boolean;
}

function SurfaceMesh({ data, colormap, wireframe }: SurfaceMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, minZ, maxZ } = useMemo(() => {
    const { x, y, z } = data;

    // Validate input data
    if (!z || z.length === 0) {
      throw new Error("Surface plot data must have at least one row");
    }
    if (!z[0] || z[0].length === 0) {
      throw new Error("Surface plot data must have at least one column");
    }
    if (z.length !== y.length) {
      throw new Error(`Surface plot z rows (${z.length}) must match y length (${y.length})`);
    }
    if (z[0].length !== x.length) {
      throw new Error(`Surface plot z columns (${z[0].length}) must match x length (${x.length})`);
    }

    const rows = z.length;
    const cols = z[0].length;

    // Calculate min/max for color mapping
    let minZ = Number.POSITIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (z[i][j] < minZ) minZ = z[i][j];
        if (z[i][j] > maxZ) maxZ = z[i][j];
      }
    }

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Create vertices
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const xVal = x[j];
        const yVal = y[i];
        const zVal = z[i][j];

        vertices.push(xVal, zVal, yVal);

        const color = getColorFromValue(zVal, minZ, maxZ, colormap);
        colors.push(color.r, color.g, color.b);
      }
    }

    // Create indices for triangles
    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < cols - 1; j++) {
        const topLeft = i * cols + j;
        const topRight = topLeft + 1;
        const bottomLeft = (i + 1) * cols + j;
        const bottomRight = bottomLeft + 1;

        // First triangle
        indices.push(topLeft, bottomLeft, topRight);
        // Second triangle
        indices.push(topRight, bottomLeft, bottomRight);
      }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return { geometry, minZ, maxZ };
  }, [data, colormap]);

  // Slow rotation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.001;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        wireframe={wireframe}
        side={THREE.DoubleSide}
        flatShading={false}
      />
    </mesh>
  );
}

// ============================================================================
// Grid Helper Component
// ============================================================================

function GridPlane({ data }: { data: SurfaceData }) {
  const { x, y } = data;
  const sizeX = Math.max(...x) - Math.min(...x);
  const sizeY = Math.max(...y) - Math.min(...y);

  return (
    <gridHelper
      args={[Math.max(sizeX, sizeY), 20, 0x334155, 0x1e293b]}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, -Math.max(...data.z.flat()) * 0.1, 0]}
    />
  );
}

// ============================================================================
// Scene Component
// ============================================================================

interface SceneProps {
  data: SurfaceData;
  colormap: keyof typeof COLORMAPS;
  wireframe: boolean;
  showContours: boolean;
}

function Scene({ data, colormap, wireframe, showContours }: SceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={50} />

      {/* Controls */}
      <OrbitControls enableDamping dampingFactor={0.05} rotateSpeed={0.5} zoomSpeed={0.5} />

      {/* Surface */}
      <SurfaceMesh data={data} colormap={colormap} wireframe={wireframe} />

      {/* Grid */}
      <GridPlane data={data} />

      {/* Axes Helper */}
      <axesHelper args={[5]} />
    </>
  );
}

// ============================================================================
// Loading Fallback
// ============================================================================

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950">
      <div className="text-zinc-500">Loading 3D surface...</div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SurfacePlot({
  data,
  colormap = "viridis",
  wireframe = false,
  showContours = false,
  width = 800,
  height = 600,
  className = "",
}: SurfacePlotProps) {
  return (
    <div className={`relative ${className}`} style={{ width: `${width}px`, height: `${height}px` }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas gl={{ antialias: true, alpha: true }} className="bg-zinc-950">
          <Scene
            data={data}
            colormap={colormap}
            wireframe={wireframe}
            showContours={showContours}
          />
        </Canvas>
      </Suspense>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-lg p-3">
        <div className="text-xs text-zinc-400 font-medium mb-2">Controls</div>
        <div className="text-xs text-zinc-500 space-y-1">
          <div>• Left click + drag to rotate</div>
          <div>• Right click + drag to pan</div>
          <div>• Scroll to zoom</div>
        </div>
      </div>
    </div>
  );
}

export default SurfacePlot;
