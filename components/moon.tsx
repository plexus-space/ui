"use client";

import { Suspense, useRef, memo, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Constants
// ============================================================================

/**
 * Moon radius in scene units (relative to Earth)
 * @constant {number}
 */
export const MOON_RADIUS = 0.273; // Relative to Earth (1,737.4 km actual)

/**
 * Moon actual radius in kilometers
 * @constant {number}
 */
export const MOON_REAL_RADIUS_KM = 1737.4;

/**
 * Moon rotation period in Earth days (tidally locked)
 * @constant {number}
 */
export const MOON_ROTATION_PERIOD = 27.3;

/**
 * Moon orbital period around Earth in Earth days
 * @constant {number}
 */
export const MOON_ORBITAL_PERIOD = 27.3;

/**
 * Moon's axial tilt in degrees (relative to ecliptic)
 * @constant {number}
 */
export const MOON_AXIAL_TILT = 6.7;

// ============================================================================
// Internal Sphere Component
// ============================================================================
interface MoonSphereProps {
  radius: number;
  textureUrl?: string;
  brightness: number;
  enableRotation: boolean;
  emissiveColor: string;
  shininess: number;
}

const MoonSphere = memo(function MoonSphere({
  radius,
  textureUrl,
  brightness,
  enableRotation,
  emissiveColor,
  shininess,
}: MoonSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const texture = textureUrl
    ? useLoader(THREE.TextureLoader, textureUrl)
    : null;

  // Apply axial tilt
  useFrame(() => {
    if (groupRef.current && groupRef.current.rotation.z === 0) {
      groupRef.current.rotation.z = THREE.MathUtils.degToRad(MOON_AXIAL_TILT);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 32]} />
      {texture ? (
        <meshPhongMaterial
          map={texture}
          bumpScale={0.005}
          shininess={shininess}
          emissive={emissiveColor}
          emissiveIntensity={0.05 * brightness}
        />
      ) : (
        <meshPhongMaterial
          color="#aaaaaa"
          shininess={shininess}
          emissive={emissiveColor}
          emissiveIntensity={0.05 * brightness}
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
 * Props for the MoonSphereRoot component
 * @interface MoonSphereRootProps
 */
export interface MoonSphereRootProps {
  /** Radius of the Moon sphere in scene units (default: MOON_RADIUS) */
  radius?: number;
  /** URL to the Moon surface texture (optional - uses gray fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Emissive color for the material (default: "#0a0a0a") */
  emissiveColor?: string;
  /** Material shininess value (default: 1) */
  shininess?: number;
}

/**
 * MoonSphereRoot - The base Moon sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Moon sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { MoonSphereRoot } from '@components/ui/moon';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <MoonSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const MoonSphereRoot = forwardRef<THREE.Group, MoonSphereRootProps>(
  (
    {
      radius = MOON_RADIUS,
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      emissiveColor = "#0a0a0a",
      shininess = 1,
    },
    ref
  ) => {
    return (
      <group ref={ref}>
        <MoonSphere
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

MoonSphereRoot.displayName = "MoonSphereRoot";

/**
 * Props for the MoonScene component
 * @interface MoonSceneProps
 */
export interface MoonSceneProps {
  /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 0.819]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view in degrees (default: 45) */
  cameraFov?: number;
  /** Minimum zoom distance from target (default: 0.41) */
  minDistance?: number;
  /** Maximum zoom distance from target (default: 5.46) */
  maxDistance?: number;
  /** Overall scene brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Child components to render within the scene */
  children?: React.ReactNode;
}

/**
 * MoonScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { MoonScene, MoonSphereRoot } from '@components/ui/moon';
 *
 * function CustomMoon() {
 *   return (
 *     <MoonScene cameraPosition={[0, 0, 0.819]} brightness={1.5}>
 *       <MoonSphereRoot
 *         radius={0.273}
 *         textureUrl="/moon.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 0.4, 0]}>
 *         <sphereGeometry args={[0.05, 32, 32]} />
 *         <meshStandardMaterial color="red" />
 *       </mesh>
 *     </MoonScene>
 *   );
 * }
 *
 * @param props - Configuration props for the scene
 * @param ref - Forward ref to the container div element
 * @returns A complete Three.js scene ready to render
 */
export const MoonScene = forwardRef<HTMLDivElement, MoonSceneProps>(
  (
    {
      cameraPosition = [0, 0, 0.819],
      cameraFov = 45,
      minDistance = 0.41,
      maxDistance = 5.46,
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

MoonScene.displayName = "MoonScene";

// ============================================================================
// COMPOSED COMPONENT - Pre-configured for common use cases
// ============================================================================

/**
 * Props for the main Moon component
 * @interface MoonProps
 */
export interface MoonProps {
  /** URL to the Moon surface texture (optional - uses gray fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Custom child components to render in the scene */
  children?: React.ReactNode;
  /** Camera position [x, y, z] (default: [0, 0, 0.819]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 45) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 0.41) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 5.46) */
  maxDistance?: number;
}

/**
 * Moon - The main composed Moon component
 *
 * A fully pre-configured Moon visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Moon } from '@/components/ui/moon';
 *
 * function App() {
 *   return <Moon />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Moon textureUrl="/textures/moon.jpg" />;
 * }
 */
const MoonComponent = forwardRef<HTMLDivElement, MoonProps>(
  (
    {
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      children,
      cameraPosition = [0, 0, 0.819],
      cameraFov = 45,
      minDistance = 0.41,
      maxDistance = 5.46,
    },
    ref
  ) => {
    return (
      <MoonScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <MoonSphereRoot
          radius={MOON_RADIUS}
          textureUrl={textureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
        />
        {children}
      </MoonScene>
    );
  }
);

MoonComponent.displayName = "Moon";

export const Moon = memo(MoonComponent);
