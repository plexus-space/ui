"use client";

/**
 * Vector Field Visualization
 *
 * Architectural Decision: Three.js + React Three Fiber (3D), Canvas 2D (2D fallback)
 * Rationale:
 * 1. Dual Mode Support - Both 2D and 3D vector fields
 * 2. Instanced Rendering - 100k+ arrows require GPU instancing
 * 3. Particle Tracing - Streamlines need frame-by-frame integration
 * 4. Industry Standard - Three.js for 3D, Canvas for simple 2D
 * 5. Compute Shaders - Future: WebGPU compute for particle tracing
 *
 * This component handles:
 * - Fluid dynamics (CFD airflow, blood flow, ocean currents)
 * - Electromagnetic fields (E-field, B-field, antenna radiation)
 * - Force vectors on structures (stress, strain)
 * - Wind patterns, thermal gradients
 * - Gradient fields in optimization
 *
 * Performance Target: 100k+ arrows at 60fps
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
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { viridis, plasma, inferno, cool, warm, type ColorScaleName, colorScales } from "../lib/color-scales";

// ============================================================================
// Types
// ============================================================================

export interface VectorFieldPoint {
  /** Position */
  x: number;
  y: number;
  z?: number; // Optional for 2D fields
  /** Vector direction and magnitude */
  vx: number;
  vy: number;
  vz?: number; // Optional for 2D fields
  /** Optional custom magnitude for coloring (defaults to vector length) */
  magnitude?: number;
}

export interface StreamlineParticle {
  x: number;
  y: number;
  z: number;
  age: number;
}

export interface VectorFieldProps {
  /** Array of vector field samples */
  field: VectorFieldPoint[];
  /** Visualization mode */
  mode?: "arrows" | "streamlines" | "both";
  /** Arrow size scale factor */
  arrowScale?: number;
  /** Arrow density (for grid-based subsampling) */
  arrowDensity?: number;
  /** Color by magnitude using a color scale */
  colorBy?: "magnitude" | "direction" | "uniform";
  /** Color scale to use when coloring by magnitude */
  colorScale?: ColorScaleName | ((value: number) => string);
  /** Minimum magnitude for color mapping (auto if not specified) */
  magnitudeMin?: number;
  /** Maximum magnitude for color mapping (auto if not specified) */
  magnitudeMax?: number;
  /** Uniform color when colorBy is "uniform" */
  uniformColor?: string;
  /** Number of streamline particles */
  streamlineCount?: number;
  /** Streamline particle lifetime in seconds */
  streamlineLifetime?: number;
  /** Streamline integration step size */
  streamlineStep?: number;
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
  /** Enable animation (for streamlines) */
  animate?: boolean;
  /** 2D or 3D mode */
  dimensions?: "2d" | "3d";
  className?: string;
  onLoad?: () => void;
}

interface VectorFieldContextType {
  field: VectorFieldPoint[];
  mode: "arrows" | "streamlines" | "both";
  arrowScale: number;
  colorBy: "magnitude" | "direction" | "uniform";
  colorScale: (value: number) => string;
  magnitudeMin: number;
  magnitudeMax: number;
  uniformColor: string;
  streamlineCount: number;
  streamlineLifetime: number;
  streamlineStep: number;
  animate: boolean;
  dimensions: "2d" | "3d";
}

const VectorFieldContext = createContext<VectorFieldContextType | null>(null);

// ============================================================================
// Utilities
// ============================================================================

function calculateMagnitudeRange(field: VectorFieldPoint[]): {
  min: number;
  max: number;
} {
  if (field.length === 0) {
    return { min: 0, max: 1 };
  }

  let min = Infinity;
  let max = -Infinity;

  for (const point of field) {
    const magnitude = point.magnitude ?? Math.sqrt(
      point.vx ** 2 + point.vy ** 2 + (point.vz ?? 0) ** 2
    );

    if (magnitude < min) min = magnitude;
    if (magnitude > max) max = magnitude;
  }

  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
}

function getColorForVector(
  point: VectorFieldPoint,
  colorBy: "magnitude" | "direction" | "uniform",
  colorScale: (value: number) => string,
  magnitudeMin: number,
  magnitudeMax: number,
  uniformColor: string
): THREE.Color {
  if (colorBy === "uniform") {
    return new THREE.Color(uniformColor);
  }

  const magnitude = point.magnitude ?? Math.sqrt(
    point.vx ** 2 + point.vy ** 2 + (point.vz ?? 0) ** 2
  );

  if (colorBy === "magnitude") {
    const normalized = (magnitude - magnitudeMin) / (magnitudeMax - magnitudeMin);
    const colorString = colorScale(Math.max(0, Math.min(1, normalized)));
    return new THREE.Color(colorString);
  }

  // Direction-based coloring (hue based on angle)
  if (colorBy === "direction") {
    const angle = Math.atan2(point.vy, point.vx);
    const hue = (angle / (2 * Math.PI) + 0.5) % 1; // Normalize to 0-1
    return new THREE.Color().setHSL(hue, 0.8, 0.5);
  }

  return new THREE.Color(uniformColor);
}

// Interpolate vector field at any position (bilinear/trilinear)
function interpolateField(
  field: VectorFieldPoint[],
  x: number,
  y: number,
  z: number,
  dimensions: "2d" | "3d"
): { vx: number; vy: number; vz: number } | null {
  if (field.length === 0) return null;

  // Find nearest point (simple nearest-neighbor for now)
  // TODO: Implement proper bilinear/trilinear interpolation with structured grid
  let nearestPoint = field[0];
  let minDist = Infinity;

  for (const point of field) {
    const pz = point.z ?? 0;
    const dist = (point.x - x) ** 2 + (point.y - y) ** 2 + (pz - z) ** 2;
    if (dist < minDist) {
      minDist = dist;
      nearestPoint = point;
    }
  }

  return {
    vx: nearestPoint.vx,
    vy: nearestPoint.vy,
    vz: nearestPoint.vz ?? 0,
  };
}

// ============================================================================
// Arrow Renderer Component
// ============================================================================

function ArrowRenderer() {
  const ctx = useContext(VectorFieldContext);
  if (!ctx) return null;

  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Create arrow geometry (cone + cylinder combined)
  const geometry = useMemo(() => {
    // Create cylinder body
    const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);

    // Create cone head
    const coneGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
    coneGeometry.translate(0, 0.5, 0);

    // Manually combine the two geometries by merging their attributes
    const cylinderPositions = cylinderGeometry.attributes.position;
    const conePositions = coneGeometry.attributes.position;

    const totalVertices = cylinderPositions.count + conePositions.count;
    const positions = new Float32Array(totalVertices * 3);

    // Copy cylinder vertices
    for (let i = 0; i < cylinderPositions.count; i++) {
      positions[i * 3] = cylinderPositions.getX(i);
      positions[i * 3 + 1] = cylinderPositions.getY(i);
      positions[i * 3 + 2] = cylinderPositions.getZ(i);
    }

    // Copy cone vertices
    const offset = cylinderPositions.count;
    for (let i = 0; i < conePositions.count; i++) {
      positions[(offset + i) * 3] = conePositions.getX(i);
      positions[(offset + i) * 3 + 1] = conePositions.getY(i);
      positions[(offset + i) * 3 + 2] = conePositions.getZ(i);
    }

    const combinedGeometry = new THREE.BufferGeometry();
    combinedGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    combinedGeometry.computeVertexNormals();
    combinedGeometry.rotateX(Math.PI / 2); // Point along +Z axis

    return combinedGeometry;
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
    });
  }, []);

  // Update arrow instances
  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const count = ctx.field.length;
    mesh.count = count;

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 0, 1);

    for (let i = 0; i < count; i++) {
      const point = ctx.field[i];
      const pz = point.z ?? 0;
      const vz = point.vz ?? 0;

      const magnitude = point.magnitude ?? Math.sqrt(
        point.vx ** 2 + point.vy ** 2 + vz ** 2
      );

      if (magnitude < 0.001) continue; // Skip zero vectors

      // Position
      const position = new THREE.Vector3(point.x, point.y, pz);

      // Direction
      const direction = new THREE.Vector3(point.vx, point.vy, vz).normalize();

      // Rotation to align arrow with vector
      quaternion.setFromUnitVectors(up, direction);

      // Scale by magnitude
      const scale = magnitude * ctx.arrowScale;

      // Set matrix
      matrix.compose(position, quaternion, new THREE.Vector3(scale, scale, scale));
      mesh.setMatrixAt(i, matrix);

      // Set color
      const color = getColorForVector(
        point,
        ctx.colorBy,
        ctx.colorScale,
        ctx.magnitudeMin,
        ctx.magnitudeMax,
        ctx.uniformColor
      );
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [ctx.field, ctx.arrowScale, ctx.colorBy, ctx.colorScale, ctx.magnitudeMin, ctx.magnitudeMax, ctx.uniformColor]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, ctx.field.length]}
    />
  );
}

// ============================================================================
// Streamline Renderer Component
// ============================================================================

function StreamlineRenderer() {
  const ctx = useContext(VectorFieldContext);
  if (!ctx) return null;

  const [particles, setParticles] = useState<StreamlineParticle[]>([]);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Initialize particles
  useEffect(() => {
    if (ctx.field.length === 0) return;

    // Find bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const point of ctx.field) {
      const pz = point.z ?? 0;
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
      if (pz < minZ) minZ = pz;
      if (pz > maxZ) maxZ = pz;
    }

    // Spawn random particles
    const newParticles: StreamlineParticle[] = [];
    for (let i = 0; i < ctx.streamlineCount; i++) {
      newParticles.push({
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
        z: ctx.dimensions === "3d" ? (minZ + Math.random() * (maxZ - minZ)) : 0,
        age: Math.random() * ctx.streamlineLifetime,
      });
    }

    setParticles(newParticles);
  }, [ctx.field, ctx.streamlineCount, ctx.streamlineLifetime, ctx.dimensions]);

  // Animate particles
  useFrame((state, delta) => {
    if (!ctx.animate || particles.length === 0) return;

    setParticles((prevParticles) => {
      return prevParticles.map((particle) => {
        // Integrate using Euler method (TODO: Use RK4 for better accuracy)
        const vector = interpolateField(ctx.field, particle.x, particle.y, particle.z, ctx.dimensions);

        if (!vector) return particle;

        const newParticle = {
          x: particle.x + vector.vx * ctx.streamlineStep,
          y: particle.y + vector.vy * ctx.streamlineStep,
          z: particle.z + vector.vz * ctx.streamlineStep,
          age: particle.age + delta,
        };

        // Reset if too old
        if (newParticle.age > ctx.streamlineLifetime) {
          // Find bounding box again
          let minX = Infinity, minY = Infinity, minZ = Infinity;
          let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

          for (const point of ctx.field) {
            const pz = point.z ?? 0;
            if (point.x < minX) minX = point.x;
            if (point.x > maxX) maxX = point.x;
            if (point.y < minY) minY = point.y;
            if (point.y > maxY) maxY = point.y;
            if (pz < minZ) minZ = pz;
            if (pz > maxZ) maxZ = pz;
          }

          return {
            x: minX + Math.random() * (maxX - minX),
            y: minY + Math.random() * (maxY - minY),
            z: ctx.dimensions === "3d" ? (minZ + Math.random() * (maxZ - minZ)) : 0,
            age: 0,
          };
        }

        return newParticle;
      });
    });
  });

  // Create line geometry for particles
  const geometry = useMemo(() => {
    if (particles.length === 0) return null;

    const positions: number[] = [];

    for (const particle of particles) {
      // Create a small cross at each particle position
      const size = 0.1;
      positions.push(
        particle.x - size, particle.y, particle.z,
        particle.x + size, particle.y, particle.z,
        particle.x, particle.y - size, particle.z,
        particle.x, particle.y + size, particle.z
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    return geometry;
  }, [particles]);

  if (!geometry) return null;

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color={ctx.uniformColor} />
    </lineSegments>
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
  const ctx = useContext(VectorFieldContext);
  if (!ctx) return null;

  // Calculate bounding box
  const boundingBox = useMemo(() => {
    if (ctx.field.length === 0) {
      return { min: { x: -5, y: -5, z: -5 }, max: { x: 5, y: 5, z: 5 } };
    }

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const point of ctx.field) {
      const pz = point.z ?? 0;
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
      if (pz < minZ) minZ = pz;
      if (pz > maxZ) maxZ = pz;
    }

    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
    };
  }, [ctx.field]);

  const gridSize = Math.max(
    boundingBox.max.x - boundingBox.min.x,
    boundingBox.max.y - boundingBox.min.y,
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

      {showGrid && <gridHelper args={[gridSize, Math.ceil(gridSize)]} position={[0, boundingBox.min.y, 0]} />}
      {showAxes && <axesHelper args={[gridSize / 2]} />}

      <Suspense fallback={null}>
        {(ctx.mode === "arrows" || ctx.mode === "both") && <ArrowRenderer />}
        {(ctx.mode === "streamlines" || ctx.mode === "both") && <StreamlineRenderer />}
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

function VectorFieldRoot({
  children,
  field,
  mode = "arrows",
  arrowScale = 1.0,
  colorBy = "magnitude",
  colorScale: colorScaleProp = "viridis",
  magnitudeMin,
  magnitudeMax,
  uniformColor = "#3b82f6",
  streamlineCount = 100,
  streamlineLifetime = 3.0,
  streamlineStep = 0.05,
  animate = true,
  dimensions = "3d",
}: {
  children?: React.ReactNode;
  field: VectorFieldPoint[];
  mode?: "arrows" | "streamlines" | "both";
  arrowScale?: number;
  colorBy?: "magnitude" | "direction" | "uniform";
  colorScale?: ColorScaleName | ((value: number) => string);
  magnitudeMin?: number;
  magnitudeMax?: number;
  uniformColor?: string;
  streamlineCount?: number;
  streamlineLifetime?: number;
  streamlineStep?: number;
  animate?: boolean;
  dimensions?: "2d" | "3d";
}) {
  const autoRange = useMemo(() => calculateMagnitudeRange(field), [field]);

  const colorScaleFunc = useMemo(() => {
    if (typeof colorScaleProp === "function") {
      return colorScaleProp;
    }
    return colorScales[colorScaleProp] || viridis;
  }, [colorScaleProp]);

  const contextValue: VectorFieldContextType = useMemo(
    () => ({
      field,
      mode,
      arrowScale,
      colorBy,
      colorScale: colorScaleFunc,
      magnitudeMin: magnitudeMin ?? autoRange.min,
      magnitudeMax: magnitudeMax ?? autoRange.max,
      uniformColor,
      streamlineCount,
      streamlineLifetime,
      streamlineStep,
      animate,
      dimensions,
    }),
    [field, mode, arrowScale, colorBy, colorScaleFunc, magnitudeMin, magnitudeMax, autoRange, uniformColor, streamlineCount, streamlineLifetime, streamlineStep, animate, dimensions]
  );

  return (
    <VectorFieldContext.Provider value={contextValue}>
      {children}
    </VectorFieldContext.Provider>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const VectorFieldComponent = ({
  field,
  mode = "arrows",
  arrowScale = 1.0,
  arrowDensity = 1.0,
  colorBy = "magnitude",
  colorScale = "viridis",
  magnitudeMin,
  magnitudeMax,
  uniformColor = "#3b82f6",
  streamlineCount = 100,
  streamlineLifetime = 3.0,
  streamlineStep = 0.05,
  width = 800,
  height = 600,
  background = "#1a1a1a",
  showGrid = true,
  showAxes = true,
  animate = true,
  dimensions = "3d",
  className,
  onLoad,
}: VectorFieldProps) => {
  // Subsample arrows based on density
  const subsampledField = useMemo(() => {
    if (arrowDensity >= 1.0) return field;

    const step = Math.ceil(1 / arrowDensity);
    return field.filter((_, i) => i % step === 0);
  }, [field, arrowDensity]);

  // Calculate camera position based on bounding box
  const cameraPosition = useMemo((): [number, number, number] => {
    if (field.length === 0) return [5, 5, 5];

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const point of field) {
      const pz = point.z ?? 0;
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
      if (pz < minZ) minZ = pz;
      if (pz > maxZ) maxZ = pz;
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;
    const maxSize = Math.max(sizeX, sizeY, sizeZ, 1);

    const distance = maxSize * 1.5;

    if (dimensions === "2d") {
      // Top-down view for 2D
      return [centerX, centerY + distance, centerZ];
    }

    return [
      centerX + distance * 0.6,
      centerY + distance * 0.6,
      centerZ + distance * 0.6,
    ];
  }, [field, dimensions]);

  return (
    <VectorFieldRoot
      field={subsampledField}
      mode={mode}
      arrowScale={arrowScale}
      colorBy={colorBy}
      colorScale={colorScale}
      magnitudeMin={magnitudeMin}
      magnitudeMax={magnitudeMax}
      uniformColor={uniformColor}
      streamlineCount={streamlineCount}
      streamlineLifetime={streamlineLifetime}
      streamlineStep={streamlineStep}
      animate={animate}
      dimensions={dimensions}
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
          <Scene
            showGrid={showGrid}
            showAxes={showAxes}
            onLoad={onLoad}
          />
        </Canvas>
      </div>
    </VectorFieldRoot>
  );
};

// Attach primitive components
VectorFieldComponent.Root = VectorFieldRoot;
VectorFieldComponent.Scene = Scene;
VectorFieldComponent.displayName = "VectorField";

export const VectorField = VectorFieldComponent;
export default VectorField;
