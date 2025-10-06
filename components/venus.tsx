"use client";

import { Suspense, useRef, memo, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Constants
// ============================================================================

/**
 * Venus radius in scene units (relative to Earth)
 * @constant {number}
 */
export const VENUS_RADIUS = 0.949; // Relative to Earth (6,051.8 km actual)

/**
 * Venus actual radius in kilometers
 * @constant {number}
 */
export const VENUS_REAL_RADIUS_KM = 6051.8;

/**
 * Venus rotation period in Earth days (243 days - retrograde rotation)
 * @constant {number}
 */
export const VENUS_ROTATION_PERIOD = 243; // Earth days (retrograde)

/**
 * Venus orbital period around the Sun in Earth days
 * @constant {number}
 */
export const VENUS_ORBITAL_PERIOD = 224.7; // Earth days

/**
 * Venus's axial tilt in degrees (nearly upside down - retrograde rotation)
 * @constant {number}
 */
export const VENUS_AXIAL_TILT = 177.4;

// ============================================================================
// Internal Sphere Component
// ============================================================================
interface VenusSphereProps {
  radius: number;
  textureUrl?: string;
  brightness: number;
  enableRotation: boolean;
  emissiveColor: string;
  shininess: number;
}

const VenusSphere = memo(function VenusSphere({
  radius,
  textureUrl,
  brightness,
  enableRotation,
  emissiveColor,
  shininess,
}: VenusSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const texture = textureUrl
    ? useLoader(THREE.TextureLoader, textureUrl)
    : null;

  // Apply axial tilt (Venus is nearly upside down)
  useFrame(() => {
    if (groupRef.current && groupRef.current.rotation.z === 0) {
      groupRef.current.rotation.z = THREE.MathUtils.degToRad(VENUS_AXIAL_TILT);
    }
  });

  return (
    <group ref={groupRef}>
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
          color="#ffc649"
          shininess={shininess}
          emissive={emissiveColor}
          emissiveIntensity={0.15 * brightness}
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
 * Props for the VenusSphereRoot component
 * @interface VenusSphereRootProps
 */
export interface VenusSphereRootProps {
  /** Radius of the Venus sphere in scene units (default: VENUS_RADIUS) */
  radius?: number;
  /** URL to the Venus surface texture (optional - uses yellow-orange fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Emissive color for the material (default: "#ff9944") */
  emissiveColor?: string;
  /** Material shininess value (default: 30) */
  shininess?: number;
}

/**
 * VenusSphereRoot - The base Venus sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Venus sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { VenusSphereRoot } from '@/components/ui/venus';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <VenusSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const VenusSphereRoot = forwardRef<THREE.Group, VenusSphereRootProps>(
  (
    {
      radius = VENUS_RADIUS,
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      emissiveColor = "#ff9944",
      shininess = 30,
    },
    ref
  ) => {
    return (
      <group ref={ref}>
        <VenusSphere
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

VenusSphereRoot.displayName = "VenusSphereRoot";

/**
 * Props for the VenusScene component
 * @interface VenusSceneProps
 */
export interface VenusSceneProps {
  /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 2.847]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view in degrees (default: 45) */
  cameraFov?: number;
  /** Minimum zoom distance from target (default: 1.4235) */
  minDistance?: number;
  /** Maximum zoom distance from target (default: 18.98) */
  maxDistance?: number;
  /** Overall scene brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Child components to render within the scene */
  children?: React.ReactNode;
}

/**
 * VenusScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { VenusScene, VenusSphereRoot } from '@/components/ui/venus';
 *
 * function CustomVenus() {
 *   return (
 *     <VenusScene cameraPosition={[0, 0, 2.847]} brightness={1.5}>
 *       <VenusSphereRoot
 *         radius={0.949}
 *         textureUrl="/venus.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[2, 0, 0]}>
 *         <sphereGeometry args={[0.1, 32, 32]} />
 *         <meshStandardMaterial color="red" />
 *       </mesh>
 *     </VenusScene>
 *   );
 * }
 *
 * @param props - Configuration props for the scene
 * @param ref - Forward ref to the container div element
 * @returns A complete Three.js scene ready to render
 */
export const VenusScene = forwardRef<HTMLDivElement, VenusSceneProps>(
  (
    {
      cameraPosition = [0, 0, 2.847],
      cameraFov = 45,
      minDistance = 1.4235,
      maxDistance = 18.98,
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

VenusScene.displayName = "VenusScene";

// ============================================================================
// COMPOSED COMPONENT - Pre-configured for common use cases
// ============================================================================

/**
 * Props for the main Venus component
 * @interface VenusProps
 */
export interface VenusProps {
  /** URL to the Venus surface texture (optional - uses yellow-orange fallback) */
  textureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Custom child components to render in the scene */
  children?: React.ReactNode;
  /** Camera position [x, y, z] (default: [0, 0, 2.847]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 45) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 1.4235) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 18.98) */
  maxDistance?: number;
}

/**
 * Venus - The main composed Venus component
 *
 * A fully pre-configured Venus visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Venus } from '@/components/ui/venus';
 *
 * function App() {
 *   return <Venus />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Venus textureUrl="/textures/venus.jpg" />;
 * }
 */
const VenusComponent = forwardRef<HTMLDivElement, VenusProps>(
  (
    {
      textureUrl,
      brightness = 1.2,
      enableRotation = true,
      children,
      cameraPosition = [0, 0, 2.847],
      cameraFov = 45,
      minDistance = 1.4235,
      maxDistance = 18.98,
    },
    ref
  ) => {
    return (
      <VenusScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <VenusSphereRoot
          radius={VENUS_RADIUS}
          textureUrl={textureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
        />
        {children}
      </VenusScene>
    );
  }
);

VenusComponent.displayName = "Venus";

export const Venus = memo(VenusComponent);
