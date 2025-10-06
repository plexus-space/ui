"use client";

import { Suspense, useRef, memo, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Constants
// ============================================================================

/**
 * Mercury radius in scene units (relative to Earth)
 * @constant {number}
 */
export const MERCURY_RADIUS = 0.383; // Relative to Earth (2,439.7 km actual)

/**
 * Mercury actual radius in kilometers
 * @constant {number}
 */
export const MERCURY_REAL_RADIUS_KM = 2439.7;

/**
 * Mercury rotation period in Earth days (58.6 days)
 * @constant {number}
 */
export const MERCURY_ROTATION_PERIOD = 58.6;

/**
 * Mercury orbital period around the Sun in Earth days
 * @constant {number}
 */
export const MERCURY_ORBITAL_PERIOD = 88;

// ============================================================================
// Internal Sphere Component
// ============================================================================
interface MercurySphereProps {
  radius: number;
  textureUrl?: string;
  brightness: number;
  enableRotation: boolean;
  emissiveColor: string;
  shininess: number;
}

const MercurySphere = memo(function MercurySphere({
  radius,
  textureUrl,
  brightness,
  enableRotation,
  emissiveColor,
  shininess,
}: MercurySphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;

  useFrame(() => {
    if (meshRef.current && enableRotation) {
      meshRef.current.rotation.y += 0.001 / MERCURY_ROTATION_PERIOD;
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
          emissiveIntensity={0.1 * brightness}
        />
      ) : (
        <meshPhongMaterial
          color="#8c7853"
          shininess={shininess}
          emissive={emissiveColor}
          emissiveIntensity={0.1 * brightness}
        />
      )}
    </mesh>
  );
});

// ============================================================================
// PRIMITIVES - Composable building blocks
// ============================================================================

/**
 * Props for the MercurySphereRoot component
 * @interface MercurySphereRootProps
 */
export interface MercurySphereRootProps {
  /** Radius of the Mercury sphere in scene units (default: MERCURY_RADIUS) */
  radius?: number;
  /** URL to the Mercury surface texture (optional - uses gray-brown fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Emissive color for the material (default: "#111111") */
  emissiveColor?: string;
  /** Material shininess value (default: 5) */
  shininess?: number;
}

/**
 * MercurySphereRoot - The base Mercury sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Mercury sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { MercurySphereRoot } from '@plexusui/mercury';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <MercurySphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const MercurySphereRoot = forwardRef<THREE.Group, MercurySphereRootProps>(
  (
    {
      radius = MERCURY_RADIUS,
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      emissiveColor = "#111111",
      shininess = 5,
    },
    ref
  ) => {
    return (
      <group ref={ref}>
        <MercurySphere
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

MercurySphereRoot.displayName = "MercurySphereRoot";

/**
 * MercuryScene - The Three.js scene primitive
 */
export interface MercurySceneProps {
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  minDistance?: number;
  maxDistance?: number;
  brightness?: number;
  children?: React.ReactNode;
}

export const MercuryScene = forwardRef<HTMLDivElement, MercurySceneProps>(
  (
    {
      cameraPosition = [0, 0, 1.149],
      cameraFov = 45,
      minDistance = 0.5745,
      maxDistance = 7.66,
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
            <ambientLight intensity={0.6 * brightness} />
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

MercuryScene.displayName = "MercuryScene";

// ============================================================================
// COMPOSED COMPONENT - Pre-configured for common use cases
// ============================================================================

/**
 * Props for the main Mercury component
 * @interface MercuryProps
 */
export interface MercuryProps {
  /** URL to the Mercury surface texture (optional - uses gray-brown fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Custom child components to render in the scene */
  children?: React.ReactNode;
  /** Camera position [x, y, z] (default: [0, 0, 1.149]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 45) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 0.5745) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 7.66) */
  maxDistance?: number;
}

/**
 * Mercury - The main composed Mercury component
 *
 * A fully pre-configured Mercury visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Mercury } from '@plexusui/mercury';
 *
 * function App() {
 *   return <Mercury />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Mercury textureUrl="/textures/mercury.jpg" />;
 * }
 */
const MercuryComponent = forwardRef<HTMLDivElement, MercuryProps>(
  (
    {
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      children,
      cameraPosition = [0, 0, 1.149],
      cameraFov = 45,
      minDistance = 0.5745,
      maxDistance = 7.66,
    },
    ref
  ) => {
    return (
      <MercuryScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <MercurySphereRoot
          radius={MERCURY_RADIUS}
          textureUrl={textureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
        />
        {children}
      </MercuryScene>
    );
  }
);

MercuryComponent.displayName = "Mercury";

export const Mercury = memo(MercuryComponent);
