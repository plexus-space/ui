"use client";

import { Suspense, useRef, memo, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Constants
// ============================================================================

/**
 * Uranus radius in scene units (relative to Earth)
 * @constant {number}
 */
export const URANUS_RADIUS = 4.01; // Relative to Earth (25,362 km actual)

/**
 * Uranus actual radius in kilometers
 * @constant {number}
 */
export const URANUS_REAL_RADIUS_KM = 25362;

/**
 * Uranus rotation period in Earth days (17.2 hours - retrograde)
 * @constant {number}
 */
export const URANUS_ROTATION_PERIOD = 0.72;

/**
 * Uranus orbital period around the Sun in Earth days (84 years)
 * @constant {number}
 */
export const URANUS_ORBITAL_PERIOD = 30687;

// ============================================================================
// Internal Sphere Component
// ============================================================================
interface UranusSphereProps {
  radius: number;
  textureUrl?: string;
  brightness: number;
  enableRotation: boolean;
  emissiveColor: string;
  shininess: number;
}

const UranusSphere = memo(function UranusSphere({
  radius,
  textureUrl,
  brightness,
  enableRotation,
  emissiveColor,
  shininess,
}: UranusSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;

  useFrame(() => {
    if (meshRef.current && enableRotation) {
      // Retrograde rotation (tilted on its side)
      meshRef.current.rotation.y -= 0.0015;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0, Math.PI / 2.2]}>
      <sphereGeometry args={[radius, 64, 32]} />
      {texture ? (
        <meshPhongMaterial
          map={texture}
          shininess={shininess}
          emissive={emissiveColor}
          emissiveIntensity={0.12 * brightness}
        />
      ) : (
        <meshPhongMaterial
          color="#4fd0e7"
          shininess={shininess}
          emissive={emissiveColor}
          emissiveIntensity={0.12 * brightness}
        />
      )}
    </mesh>
  );
});


// ============================================================================
// PRIMITIVES - Composable building blocks
// ============================================================================

/**
 * Props for the UranusSphereRoot component
 * @interface UranusSphereRootProps
 */
export interface UranusSphereRootProps {
  /** Radius of the Uranus sphere in scene units (default: URANUS_RADIUS) */
  radius?: number;
  /** URL to the Uranus surface texture (optional - uses cyan/blue fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Emissive color for the material (default: "#004466") */
  emissiveColor?: string;
  /** Material shininess value (default: 25) */
  shininess?: number;
}

/**
 * UranusSphereRoot - The base Uranus sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Uranus sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { UranusSphereRoot } from '@plexusui/uranus';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <UranusSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const UranusSphereRoot = forwardRef<THREE.Group, UranusSphereRootProps>(
  (
    {
      radius = URANUS_RADIUS,
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      emissiveColor = "#004466",
      shininess = 25,
    },
    ref
  ) => {
    return (
      <group ref={ref}>
        <UranusSphere
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

UranusSphereRoot.displayName = "UranusSphereRoot";

/**
 * Props for the UranusScene component
 * @interface UranusSceneProps
 */
export interface UranusSceneProps {
  /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 12.03]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view in degrees (default: 45) */
  cameraFov?: number;
  /** Minimum zoom distance from target (default: 6.015) */
  minDistance?: number;
  /** Maximum zoom distance from target (default: 80.2) */
  maxDistance?: number;
  /** Overall scene brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Child components to render within the scene */
  children?: React.ReactNode;
}

/**
 * UranusScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { UranusScene, UranusSphereRoot } from '@plexusui/uranus';
 *
 * function CustomUranus() {
 *   return (
 *     <UranusScene cameraPosition={[0, 0, 15]} brightness={1.5}>
 *       <UranusSphereRoot
 *         radius={4.01}
 *         textureUrl="/uranus.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 6, 0]}>
 *         <sphereGeometry args={[0.5, 32, 32]} />
 *         <meshStandardMaterial color="white" />
 *       </mesh>
 *     </UranusScene>
 *   );
 * }
 */
export const UranusScene = forwardRef<HTMLDivElement, UranusSceneProps>(
  (
    {
      cameraPosition = [0, 0, 12.03],
      cameraFov = 45,
      minDistance = 6.015,
      maxDistance = 80.2,
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

UranusScene.displayName = "UranusScene";

// ============================================================================
// COMPOSED COMPONENT - Pre-configured for common use cases
// ============================================================================

/**
 * Props for the main Uranus component
 * @interface UranusProps
 */
export interface UranusProps {
  /** URL to the Uranus surface texture (optional - uses cyan/blue fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Custom child components to render in the scene */
  children?: React.ReactNode;
  /** Camera position [x, y, z] (default: [0, 0, 12.03]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 45) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 6.015) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 80.2) */
  maxDistance?: number;
}

/**
 * Uranus - The main composed Uranus component
 *
 * A fully pre-configured Uranus visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Uranus } from '@plexusui/uranus';
 *
 * function App() {
 *   return <Uranus />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Uranus textureUrl="/textures/uranus.jpg" />;
 * }
 */
const UranusComponent = forwardRef<HTMLDivElement, UranusProps>(
  (
    {
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      children,
      cameraPosition = [0, 0, 12.03],
      cameraFov = 45,
      minDistance = 6.015,
      maxDistance = 80.2,
    },
    ref
  ) => {
    return (
      <UranusScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <UranusSphereRoot
          radius={URANUS_RADIUS}
          textureUrl={textureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
        />
        {children}
      </UranusScene>
    );
  }
);

UranusComponent.displayName = "Uranus";

export const Uranus = memo(UranusComponent);
