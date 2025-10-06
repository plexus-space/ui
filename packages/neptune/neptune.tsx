"use client";

import { Suspense, useRef, memo, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Constants
// ============================================================================

/**
 * Neptune radius in scene units (relative to Earth)
 * @constant {number}
 */
export const NEPTUNE_RADIUS = 3.88; // Relative to Earth (24,622 km actual)

/**
 * Neptune actual radius in kilometers
 * @constant {number}
 */
export const NEPTUNE_REAL_RADIUS_KM = 24622;

/**
 * Neptune rotation period in Earth days (16 hours)
 * @constant {number}
 */
export const NEPTUNE_ROTATION_PERIOD = 0.67;

/**
 * Neptune orbital period around the Sun in Earth days (164.8 years)
 * @constant {number}
 */
export const NEPTUNE_ORBITAL_PERIOD = 60190;

// ============================================================================
// Internal Sphere Component
// ============================================================================
interface NeptuneSphereProps {
  radius: number;
  textureUrl?: string;
  brightness: number;
  enableRotation: boolean;
  emissiveColor: string;
  shininess: number;
}

const NeptuneSphere = memo(function NeptuneSphere({
  radius,
  textureUrl,
  brightness,
  enableRotation,
  emissiveColor,
  shininess,
}: NeptuneSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;

  useFrame(() => {
    if (meshRef.current && enableRotation) {
      meshRef.current.rotation.y += 0.0016;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 64, 32]} />
      {texture ? (
        <meshPhongMaterial
          map={texture}
          shininess={shininess}
          emissive={emissiveColor}
          emissiveIntensity={0.15 * brightness}
        />
      ) : (
        <meshPhongMaterial
          color="#4166f5"
          shininess={shininess}
          emissive={emissiveColor}
          emissiveIntensity={0.15 * brightness}
        />
      )}
    </mesh>
  );
});


// ============================================================================
// PRIMITIVES - Composable building blocks
// ============================================================================

/**
 * Props for the NeptuneSphereRoot component
 * @interface NeptuneSphereRootProps
 */
export interface NeptuneSphereRootProps {
  /** Radius of the Neptune sphere in scene units (default: NEPTUNE_RADIUS) */
  radius?: number;
  /** URL to the Neptune surface texture (optional - uses deep blue fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Emissive color for the material (default: "#001166") */
  emissiveColor?: string;
  /** Material shininess value (default: 30) */
  shininess?: number;
}

/**
 * NeptuneSphereRoot - The base Neptune sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Neptune sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { NeptuneSphereRoot } from '@plexusui/neptune';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <NeptuneSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const NeptuneSphereRoot = forwardRef<THREE.Group, NeptuneSphereRootProps>(
  (
    {
      radius = NEPTUNE_RADIUS,
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      emissiveColor = "#001166",
      shininess = 30,
    },
    ref
  ) => {
    return (
      <group ref={ref}>
        <NeptuneSphere
          radius={radius}
          textureUrl={textureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
          emissiveColor={emissiveColor}
          shininess={shininess}
        />
      </group>
    );
  }
);

NeptuneSphereRoot.displayName = "NeptuneSphereRoot";

/**
 * Props for the NeptuneScene component
 * @interface NeptuneSceneProps
 */
export interface NeptuneSceneProps {
  /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 11.64]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view in degrees (default: 45) */
  cameraFov?: number;
  /** Minimum zoom distance from target (default: 5.82) */
  minDistance?: number;
  /** Maximum zoom distance from target (default: 77.6) */
  maxDistance?: number;
  /** Overall scene brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Child components to render within the scene */
  children?: React.ReactNode;
}

/**
 * NeptuneScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { NeptuneScene, NeptuneSphereRoot } from '@plexusui/neptune';
 *
 * function CustomNeptune() {
 *   return (
 *     <NeptuneScene cameraPosition={[0, 0, 11.64]} brightness={1.5}>
 *       <NeptuneSphereRoot
 *         radius={3.88}
 *         textureUrl="/neptune.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 5, 0]}>
 *         <sphereGeometry args={[0.5, 32, 32]} />
 *         <meshStandardMaterial color="white" />
 *       </mesh>
 *     </NeptuneScene>
 *   );
 * }
 *
 * @param props - Configuration props for the scene
 * @param ref - Forward ref to the container div element
 * @returns A complete Three.js scene ready to render
 */
export const NeptuneScene = forwardRef<HTMLDivElement, NeptuneSceneProps>(
  (
    {
      cameraPosition = [0, 0, 11.64],
      cameraFov = 45,
      minDistance = 5.82,
      maxDistance = 77.6,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="relative h-full w-full">
        <Canvas
          camera={{ position: cameraPosition, fov: cameraFov }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={[0, 0, 0]} />

          <Suspense fallback={null}>
            <ambientLight intensity={0.8 * brightness} />
            <directionalLight position={[5, 3, 5]} intensity={1.5 * brightness} />

            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              zoomSpeed={0.6}
              panSpeed={0.5}
              rotateSpeed={0.4}
              minDistance={minDistance}
              maxDistance={maxDistance}
              enableDamping
              dampingFactor={0.05}
            />

            {children}
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

NeptuneScene.displayName = "NeptuneScene";

// ============================================================================
// COMPOSED COMPONENT - Pre-configured for common use cases
// ============================================================================

/**
 * Props for the main Neptune component
 * @interface NeptuneProps
 */
export interface NeptuneProps {
  /** URL to the Neptune surface texture (optional - uses deep blue fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.3) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Custom child components to render in the scene */
  children?: React.ReactNode;
  /** Camera position [x, y, z] (default: [0, 0, 11.64]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 45) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 5.82) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 77.6) */
  maxDistance?: number;
}

/**
 * Neptune - The main composed Neptune component
 *
 * A fully pre-configured Neptune visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Neptune } from '@plexusui/neptune';
 *
 * function App() {
 *   return <Neptune />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Neptune textureUrl="/textures/neptune.jpg" />;
 * }
 */
const NeptuneComponent = forwardRef<HTMLDivElement, NeptuneProps>(
  (
    {
      textureUrl,
      brightness = 1.3,
      enableRotation = true,
      children,
      cameraPosition = [0, 0, 11.64],
      cameraFov = 45,
      minDistance = 5.82,
      maxDistance = 77.6,
    },
    ref
  ) => {
    return (
      <NeptuneScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <NeptuneSphereRoot
          radius={NEPTUNE_RADIUS}
          textureUrl={textureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
        />
        {children}
      </NeptuneScene>
    );
  }
);

NeptuneComponent.displayName = "Neptune";

/**
 * Neptune - Memoized Neptune component for optimal performance
 *
 * This is the main export. The component is memoized to prevent
 * unnecessary re-renders when parent components update.
 */
export const Neptune = memo(NeptuneComponent);
