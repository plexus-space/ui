"use client";

import { Suspense, useRef, memo, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Constants
// ============================================================================

/**
 * Mars radius in scene units (relative to Earth)
 * @constant {number}
 */
export const MARS_RADIUS = 0.532; // Relative to Earth (3,389.5 km actual)

/**
 * Mars actual radius in kilometers (same as MARS_RADIUS)
 * @constant {number}
 */
export const MARS_REAL_RADIUS_KM = 3389.5;

/**
 * Mars diameter in kilometers
 * @constant {number}
 */
export const MARS_DIAMETER_KM = 6779;

/**
 * Mars rotation period in Earth days (24.6 hours)
 * @constant {number}
 */
export const MARS_ROTATION_PERIOD = 1.03;

/**
 * Mars orbital period around the Sun in Earth days
 * @constant {number}
 */
export const MARS_ORBITAL_PERIOD = 687;

/**
 * Mars's axial tilt in degrees (similar to Earth)
 * @constant {number}
 */
export const MARS_AXIAL_TILT = 25.2;

// ============================================================================
// Internal Sphere Component
// ============================================================================
interface MarsSphereProps {
  radius: number;
  textureUrl?: string;
  brightness: number;
  enableRotation: boolean;
  emissiveColor: string;
  shininess: number;
}

const MarsSphere = memo(function MarsSphere({
  radius,
  textureUrl,
  brightness,
  enableRotation,
  emissiveColor,
  shininess,
}: MarsSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const texture = textureUrl
    ? useLoader(THREE.TextureLoader, textureUrl)
    : null;

  // Apply axial tilt
  useFrame(() => {
    if (groupRef.current && groupRef.current.rotation.z === 0) {
      groupRef.current.rotation.z = THREE.MathUtils.degToRad(MARS_AXIAL_TILT);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 32]} />
      {texture ? (
        <meshStandardMaterial
          map={texture}
          roughness={0.9} // Dusty surface
          metalness={0.1}
          emissive={emissiveColor}
          emissiveIntensity={0.1 * brightness}
        />
      ) : (
        <meshStandardMaterial
          color="#cd5c5c"
          roughness={0.9} // Dusty surface
          metalness={0.1}
          emissive={emissiveColor}
          emissiveIntensity={0.1 * brightness}
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
 * Props for the MarsSphereRoot component
 * @interface MarsSphereRootProps
 */
export interface MarsSphereRootProps {
  /** Radius of the Mars sphere in scene units (default: MARS_RADIUS) */
  radius?: number;
  /** URL to the Mars surface texture (optional - uses reddish-brown fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Emissive color for the material (default: "#331100") */
  emissiveColor?: string;
  /** Material shininess value (default: 5) */
  shininess?: number;
}

/**
 * MarsSphereRoot - The base Mars sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Mars sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { MarsSphereRoot } from '@/ui/components/mars';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <MarsSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const MarsSphereRoot = forwardRef<THREE.Group, MarsSphereRootProps>(
  (
    {
      radius = MARS_RADIUS,
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      emissiveColor = "#331100",
      shininess = 5,
    },
    ref
  ) => {
    return (
      <group ref={ref}>
        <MarsSphere
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

MarsSphereRoot.displayName = "MarsSphereRoot";

/**
 * MarsScene - The Three.js scene primitive
 */
export interface MarsSceneProps {
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  minDistance?: number;
  maxDistance?: number;
  brightness?: number;
  children?: React.ReactNode;
}

export const MarsScene = forwardRef<HTMLDivElement, MarsSceneProps>(
  (
    {
      cameraPosition = [0, 0, 1.596], // 3x Mars radius
      cameraFov = 45,
      minDistance = 0.798,
      maxDistance = 10.64,
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
          {/* @ts-ignore */}
          <color attach="background" args={[0, 0, 0]} />

          <Suspense fallback={null}>
            <ambientLight intensity={0.6 * brightness} />
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

MarsScene.displayName = "MarsScene";

// ============================================================================
// COMPOSED COMPONENT - Pre-configured for common use cases
// ============================================================================

/**
 * Props for the main Mars component
 * @interface MarsProps
 */
export interface MarsProps {
  /** URL to the Mars surface texture (optional - uses reddish-brown fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Custom child components to render in the scene */
  children?: React.ReactNode;
  /** Camera position [x, y, z] (default: [0, 0, 1.596]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 45) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 1.0) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 12) */
  maxDistance?: number;
}

/**
 * Mars - The main composed Mars component
 *
 * A fully pre-configured Mars visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Mars } from '@/ui/components/mars';
 *
 * function App() {
 *   return <Mars />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Mars textureUrl="/textures/mars.jpg" />;
 * }
 */
const MarsComponent = forwardRef<HTMLDivElement, MarsProps>(
  (
    {
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      children,
      cameraPosition = [0, 0, 1.596],
      cameraFov = 45,
      minDistance = 0.798,
      maxDistance = 10.64,
    },
    ref
  ) => {
    return (
      <MarsScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <MarsSphereRoot
          radius={MARS_RADIUS}
          textureUrl={textureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
        />
        {children}
      </MarsScene>
    );
  }
);

MarsComponent.displayName = "Mars";

export const Mars = memo(MarsComponent);
