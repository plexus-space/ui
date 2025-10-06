"use client";

import { Suspense, useRef, memo, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Constants
// ============================================================================

/**
 * Jupiter radius in scene units (relative to Earth)
 * @constant {number}
 */
export const JUPITER_RADIUS = 10.97; // Relative to Earth (69,911 km actual)

/**
 * Jupiter actual radius in kilometers (same as JUPITER_RADIUS)
 * @constant {number}
 */
export const JUPITER_REAL_RADIUS_KM = 69911;

/**
 * Jupiter diameter in kilometers
 * @constant {number}
 */
export const JUPITER_DIAMETER_KM = 139822;

/**
 * Jupiter rotation period in Earth days (9.9 hours - fastest rotation in solar system)
 * @constant {number}
 */
export const JUPITER_ROTATION_PERIOD = 0.41;

/**
 * Jupiter orbital period around the Sun in Earth days
 * @constant {number}
 */
export const JUPITER_ORBITAL_PERIOD = 4333; // 11.9 years

/**
 * Jupiter's axial tilt in degrees (nearly upright)
 * @constant {number}
 */
export const JUPITER_AXIAL_TILT = 3.1;

// ============================================================================
// Internal Sphere Component
// ============================================================================
interface JupiterSphereProps {
  radius: number;
  textureUrl?: string;
  brightness: number;
  enableRotation: boolean;
  emissiveColor: string;
  shininess: number;
}

const JupiterSphere = memo(function JupiterSphere({
  radius,
  textureUrl,
  brightness,
  enableRotation,
  emissiveColor,
  shininess,
}: JupiterSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const texture = textureUrl
    ? useLoader(THREE.TextureLoader, textureUrl)
    : null;

  // Apply axial tilt
  useFrame(() => {
    if (groupRef.current && groupRef.current.rotation.z === 0) {
      groupRef.current.rotation.z = THREE.MathUtils.degToRad(JUPITER_AXIAL_TILT);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 32]} />
      {texture ? (
        <meshStandardMaterial
          map={texture}
          roughness={0.7} // Gas giant - no solid surface
          metalness={0.1}
          emissive={emissiveColor}
          emissiveIntensity={0.08 * brightness}
        />
      ) : (
        <meshStandardMaterial
          color="#c88b3a"
          roughness={0.7} // Gas giant - no solid surface
          metalness={0.1}
          emissive={emissiveColor}
          emissiveIntensity={0.08 * brightness}
        />
      )}
      </mesh>
    </group>
  );
});

// ============================================================================
// PRIMITIVES - Composable building blocks
// ============================================================================

/**
 * Props for the JupiterSphereRoot component
 * @interface JupiterSphereRootProps
 */
export interface JupiterSphereRootProps {
  /** Radius of the Jupiter sphere in scene units (default: JUPITER_RADIUS) */
  radius?: number;
  /** URL to the Jupiter surface texture (optional - uses tan/orange fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.1) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Emissive color for the material (default: "#221100") */
  emissiveColor?: string;
  /** Material shininess value (default: 20) */
  shininess?: number;
}

/**
 * JupiterSphereRoot - The base Jupiter sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Jupiter sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { JupiterSphereRoot } from '@/ui/components/jupiter';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <JupiterSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const JupiterSphereRoot = forwardRef<
  THREE.Group,
  JupiterSphereRootProps
>(
  (
    {
      radius = JUPITER_RADIUS,
      textureUrl,
      brightness = 1.1,
      enableRotation = true,
      emissiveColor = "#221100",
      shininess = 20,
    },
    ref
  ) => {
    return (
      <group ref={ref}>
        <JupiterSphere
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

JupiterSphereRoot.displayName = "JupiterSphereRoot";

/**
 * Props for the JupiterScene component
 * @interface JupiterSceneProps
 */
export interface JupiterSceneProps {
  /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 33.63]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view in degrees (default: 45) */
  cameraFov?: number;
  /** Minimum zoom distance from target (default: 16.815) */
  minDistance?: number;
  /** Maximum zoom distance from target (default: 224.2) */
  maxDistance?: number;
  /** Overall scene brightness multiplier (default: 1.1) */
  brightness?: number;
  /** Child components to render within the scene */
  children?: React.ReactNode;
}

/**
 * JupiterScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { JupiterScene, JupiterSphereRoot } from '@/ui/components/jupiter';
 *
 * function CustomJupiter() {
 *   return (
 *     <JupiterScene cameraPosition={[0, 0, 40]} brightness={1.3}>
 *       <JupiterSphereRoot
 *         radius={11.21}
 *         textureUrl="/jupiter.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 15, 0]}>
 *         <sphereGeometry args={[2, 32, 32]} />
 *         <meshStandardMaterial color="white" />
 *       </mesh>
 *     </JupiterScene>
 *   );
 * }
 */
export const JupiterScene = forwardRef<HTMLDivElement, JupiterSceneProps>(
  (
    {
      cameraPosition = [0, 0, 33.63], // 3x Jupiter radius
      cameraFov = 45,
      minDistance = 16.815,
      maxDistance = 224.2,
      brightness = 1.1,
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
            <directionalLight
              position={[5, 3, 5]}
              intensity={1.5 * brightness}
            />

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

JupiterScene.displayName = "JupiterScene";

// ============================================================================
// COMPOSED COMPONENT - Pre-configured for common use cases
// ============================================================================

/**
 * Props for the main Jupiter component
 * @interface JupiterProps
 */
export interface JupiterProps {
  /** URL to the Jupiter surface texture (optional - uses tan/orange fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.1) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Custom child components to render in the scene */
  children?: React.ReactNode;
  /** Camera position [x, y, z] (default: [0, 0, 33.63]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 45) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 16.815) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 224.2) */
  maxDistance?: number;
}

/**
 * Jupiter - The main composed Jupiter component
 *
 * A fully pre-configured Jupiter visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Jupiter } from '@/ui/components/jupiter';
 *
 * function App() {
 *   return <Jupiter />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Jupiter textureUrl="/textures/jupiter.jpg" />;
 * }
 */
const JupiterComponent = forwardRef<HTMLDivElement, JupiterProps>(
  (
    {
      textureUrl,
      brightness = 1.1,
      enableRotation = true,
      children,
      cameraPosition = [0, 0, 33.63],
      cameraFov = 45,
      minDistance = 16.815,
      maxDistance = 224.2,
    },
    ref
  ) => {
    return (
      <JupiterScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <JupiterSphereRoot
          radius={JUPITER_RADIUS}
          textureUrl={textureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
        />
        {children}
      </JupiterScene>
    );
  }
);

JupiterComponent.displayName = "Jupiter";

/**
 * Jupiter - Memoized Jupiter component for optimal performance
 *
 * This is the main export. The component is memoized to prevent
 * unnecessary re-renders when parent components update.
 */
export const Jupiter = memo(JupiterComponent);
