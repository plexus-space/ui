"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  Suspense,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

// ============================================================================
// Types
// ============================================================================

export interface VertexData {
  vertexIndex: number;
  value: number;
}

export interface ModelViewerProps {
  src: string;
  data?: VertexData[];
  dataFunction?: (x: number, y: number, z: number, time?: number) => number;
  colorMap?: "viridis" | "plasma" | "inferno" | "jet" | "grayscale";
  dataMin?: number;
  dataMax?: number;
  width?: number;
  height?: number;
  background?: string;
  showGrid?: boolean;
  showAxes?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface ModelViewerContextType {
  data?: VertexData[];
  dataFunction?: (x: number, y: number, z: number, time?: number) => number;
  colorMap: "viridis" | "plasma" | "inferno" | "jet" | "grayscale";
  dataMin: number;
  dataMax: number;
  time?: number;
}

const ModelViewerContext = createContext<ModelViewerContextType | null>(null);

// ============================================================================
// Color Maps
// ============================================================================

const COLOR_MAPS: Record<string, number[][]> = {
  viridis: [
    [0.267004, 0.004874, 0.329415],
    [0.229739, 0.322361, 0.545706],
    [0.127568, 0.566949, 0.550556],
    [0.369214, 0.788888, 0.382914],
    [0.993248, 0.906157, 0.143936],
  ],
  plasma: [
    [0.050383, 0.029803, 0.527975],
    [0.513167, 0.057219, 0.659658],
    [0.847578, 0.281204, 0.469538],
    [0.990438, 0.624134, 0.270415],
    [0.940015, 0.975158, 0.131326],
  ],
  inferno: [
    [0.001462, 0.000466, 0.013866],
    [0.309498, 0.072019, 0.482352],
    [0.735683, 0.215906, 0.330245],
    [0.978422, 0.557937, 0.034761],
    [0.988362, 0.998364, 0.644924],
  ],
  jet: [
    [0.0, 0.0, 0.5],
    [0.0, 0.0, 1.0],
    [0.0, 1.0, 1.0],
    [0.0, 1.0, 0.0],
    [1.0, 1.0, 0.0],
    [1.0, 0.0, 0.0],
    [0.5, 0.0, 0.0],
  ],
  grayscale: [
    [0.0, 0.0, 0.0],
    [1.0, 1.0, 1.0],
  ],
};

function interpolateColors(
  colors: number[][],
  t: number
): [number, number, number] {
  const numColors = colors.length;
  const scaled = t * (numColors - 1);
  const index = Math.floor(scaled);
  const frac = scaled - index;

  if (index >= numColors - 1) {
    const c = colors[numColors - 1];
    return [c[0], c[1], c[2]];
  }

  const c1 = colors[index];
  const c2 = colors[index + 1];

  return [
    c1[0] + (c2[0] - c1[0]) * frac,
    c1[1] + (c2[1] - c1[1]) * frac,
    c1[2] + (c2[2] - c1[2]) * frac,
  ];
}

function getColorForValue(
  value: number,
  min: number,
  max: number,
  colorMapName: string
): THREE.Color {
  const colors = COLOR_MAPS[colorMapName] || COLOR_MAPS.viridis;
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const [r, g, b] = interpolateColors(colors, t);
  return new THREE.Color(r, g, b);
}

function calculateDataRange(data?: VertexData[]): {
  min: number;
  max: number;
} {
  if (!data || data.length === 0) {
    return { min: 0, max: 100 };
  }

  let min = Infinity;
  let max = -Infinity;

  for (const { value } of data) {
    if (value < min) min = value;
    if (value > max) max = value;
  }

  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
}

// ============================================================================
// Model Loaders
// ============================================================================

function loadSTL(url: string): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    const loader = new STLLoader();
    loader.load(url, resolve, undefined, reject);
  });
}

function loadOBJ(url: string): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load(
      url,
      (object) => {
        let geometry: THREE.BufferGeometry | null = null;
        object.traverse((child) => {
          if (child instanceof THREE.Mesh && !geometry) {
            geometry = child.geometry;
          }
        });
        if (geometry) {
          resolve(geometry);
        } else {
          reject(new Error("No mesh found in OBJ model"));
        }
      },
      undefined,
      reject
    );
  });
}

function loadPLY(url: string): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    const loader = new PLYLoader();
    loader.load(url, resolve, undefined, reject);
  });
}

// ============================================================================
// 3D Model Component
// ============================================================================

function Model({
  src,
  onLoad,
  onError,
}: {
  src: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) {
  const ctx = useContext(ModelViewerContext);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const extension = src.split(".").pop()?.toLowerCase();
    let cancelled = false;

    async function load() {
      try {
        let geom: THREE.BufferGeometry;

        switch (extension) {
          case "stl":
            geom = await loadSTL(src);
            break;
          case "obj":
            geom = await loadOBJ(src);
            break;
          case "ply":
            geom = await loadPLY(src);
            break;
          case "gltf":
          case "glb":
            // For GLTF/GLB, we'll use the useGLTF hook in a separate component
            return;
          default:
            throw new Error(`Unsupported format: ${extension}`);
        }

        if (cancelled) return;

        // Compute normals if not present
        if (!geom.attributes.normal) {
          geom.computeVertexNormals();
        }

        // Compute bounding box and center the geometry properly
        geom.computeBoundingBox();
        const boundingBox = geom.boundingBox!;
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);

        // Translate geometry to center it at origin
        geom.translate(-center.x, -center.y, -center.z);

        setGeometry(geom);
        onLoad?.();
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading model:", error);
        onError?.(error as Error);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [src, onLoad, onError]);

  // Create material once
  const material = useMemo(() => {
    if (!geometry) {
      return new THREE.MeshStandardMaterial({
        color: "#888888",
        roughness: 0.5,
        metalness: 0.1,
      });
    }

    if ((ctx?.data && ctx.data.length > 0) || ctx?.dataFunction) {
      return new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.5,
        metalness: 0.1,
      });
    }

    return new THREE.MeshStandardMaterial({
      color: "#888888",
      roughness: 0.5,
      metalness: 0.1,
    });
  }, [geometry, ctx?.data, ctx?.dataFunction]);

  // Update vertex colors when data changes
  useEffect(() => {
    if (!geometry || !ctx) return;
    if (!ctx.data && !ctx.dataFunction) return;

    const positionCount = geometry.attributes.position.count;
    const positions = geometry.attributes.position;

    // Reuse or create color buffer
    let colorAttribute = geometry.attributes.color as
      | THREE.BufferAttribute
      | undefined;
    let colors: Float32Array;

    if (!colorAttribute) {
      colors = new Float32Array(positionCount * 3);
      colorAttribute = new THREE.BufferAttribute(colors, 3);
      geometry.setAttribute("color", colorAttribute);
    } else {
      colors = colorAttribute.array as Float32Array;
    }

    // Build data map for fast lookup if using data array
    const dataMap = ctx.data
      ? new Map(ctx.data.map((d) => [d.vertexIndex, d.value]))
      : null;

    // Update colors
    for (let i = 0; i < positionCount; i++) {
      let value: number;

      if (ctx.dataFunction) {
        // Use function based on vertex position
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        value = ctx.dataFunction(x, y, z, ctx.time);
      } else if (dataMap) {
        // Use data array
        value = dataMap.get(i) ?? ctx.dataMin;
      } else {
        value = ctx.dataMin;
      }

      const color = getColorForValue(
        value,
        ctx.dataMin,
        ctx.dataMax,
        ctx.colorMap
      );
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    // Mark as needing update
    colorAttribute.needsUpdate = true;
  }, [
    geometry,
    ctx?.data,
    ctx?.dataFunction,
    ctx?.dataMin,
    ctx?.dataMax,
    ctx?.colorMap,
    ctx?.time,
  ]);

  if (!geometry || !ctx) return null;

  return <mesh geometry={geometry} material={material} />;
}

function GLTFModel({
  src,
  onLoad,
}: {
  src: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) {
  const gltf = useGLTF(src);
  const ctx = useContext(ModelViewerContext);

  useEffect(() => {
    if (gltf) {
      onLoad?.();
    }
  }, [gltf, onLoad]);

  if (!ctx) return null;

  return <primitive object={gltf.scene} />;
}

// ============================================================================
// Scene Component
// ============================================================================

function Scene({
  src,
  showGrid,
  showAxes,
  onLoad,
  onError,
}: {
  src: string;
  showGrid?: boolean;
  showAxes?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) {
  const extension = src.split(".").pop()?.toLowerCase();
  const isGLTF = extension === "gltf" || extension === "glb";

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {showGrid && <gridHelper args={[10, 10]} />}
      {showAxes && <axesHelper args={[5]} />}

      <Suspense fallback={null}>
        {isGLTF ? (
          <GLTFModel src={src} onLoad={onLoad} onError={onError} />
        ) : (
          <Model src={src} onLoad={onLoad} onError={onError} />
        )}
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        target={[0, 0, 0]}
      />
    </>
  );
}

// ============================================================================
// Root Component
// ============================================================================

function ModelViewerRoot({
  children,
  data,
  dataFunction,
  colorMap = "viridis",
  dataMin,
  dataMax,
  time,
}: {
  children?: React.ReactNode;
  data?: VertexData[];
  dataFunction?: (x: number, y: number, z: number, time?: number) => number;
  colorMap?: "viridis" | "plasma" | "inferno" | "jet" | "grayscale";
  dataMin?: number;
  dataMax?: number;
  time?: number;
}) {
  const autoRange = useMemo(() => calculateDataRange(data), [data]);

  const contextValue: ModelViewerContextType = useMemo(
    () => ({
      data,
      dataFunction,
      colorMap,
      dataMin: dataMin ?? autoRange.min,
      dataMax: dataMax ?? autoRange.max,
      time,
    }),
    [data, dataFunction, colorMap, dataMin, dataMax, autoRange, time]
  );

  return (
    <ModelViewerContext.Provider value={contextValue}>
      {children}
    </ModelViewerContext.Provider>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const ModelViewerComponent = ({
  src,
  data,
  dataFunction,
  colorMap = "viridis",
  dataMin,
  dataMax,
  width = 800,
  height = 600,
  background = "#1a1a1a",
  showGrid = false,
  showAxes = false,
  className,
  onLoad,
  onError,
}: ModelViewerProps) => {
  const [time, setTime] = useState(0);

  // Auto-animate time if dataFunction is provided
  useEffect(() => {
    if (!dataFunction) return;

    const interval = setInterval(() => {
      setTime((t) => t + 0.016); // ~60fps
    }, 16);

    return () => clearInterval(interval);
  }, [dataFunction]);

  return (
    <ModelViewerRoot
      data={data}
      dataFunction={dataFunction}
      colorMap={colorMap}
      dataMin={dataMin}
      dataMax={dataMax}
      time={time}
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
            position: [3, 3, 3],
            fov: 50,
          }}
          gl={{
            antialias: true,
          }}
        >
          <Scene
            src={src}
            showGrid={showGrid}
            showAxes={showAxes}
            onLoad={onLoad}
            onError={onError}
          />
        </Canvas>
      </div>
    </ModelViewerRoot>
  );
};

// Attach primitive components
ModelViewerComponent.Root = ModelViewerRoot;
ModelViewerComponent.Scene = Scene;
ModelViewerComponent.displayName = "ModelViewer";

export const ModelViewer = ModelViewerComponent;
export default ModelViewer;
