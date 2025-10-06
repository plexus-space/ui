"use client";

import { Suspense, useRef, memo, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Constants
// ============================================================================

/**
 * Saturn radius in scene units (relative to Earth)
 * @constant {number}
 */
export const SATURN_RADIUS = 9.14; // Relative to Earth (58,232 km actual)

/**
 * Saturn actual radius in kilometers (same as SATURN_RADIUS)
 * @constant {number}
 */
export const SATURN_REAL_RADIUS_KM = 58232;

/**
 * Saturn diameter in kilometers
 * @constant {number}
 */
export const SATURN_DIAMETER_KM = 116464;

/**
 * Saturn rotation period in Earth days (10.7 hours)
 * @constant {number}
 */
export const SATURN_ROTATION_PERIOD = 0.45;

/**
 * Saturn orbital period around the Sun in Earth days (29.5 years)
 * @constant {number}
 */
export const SATURN_ORBITAL_PERIOD = 10759;

/**
 * Saturn's axial tilt in degrees (similar to Earth)
 * @constant {number}
 */
export const SATURN_AXIAL_TILT = 26.7;

/**
 * Saturn's ring system inner radius in scene units (D ring inner edge)
 * @constant {number}
 */
export const SATURN_RINGS_INNER = 10.50; // Relative to Earth (66,900 km actual)

/**
 * Saturn's ring system outer radius in scene units (A ring outer edge)
 * @constant {number}
 */
export const SATURN_RINGS_OUTER = 21.47; // Relative to Earth (136,780 km actual)

// ============================================================================
// Internal Sphere Component
// ============================================================================

interface SaturnSphereProps {
  radius: number;
  textureUrl?: string;
  ringsTextureUrl?: string;
  brightness: number;
  enableRotation: boolean;
  emissiveColor: string;
  shininess: number;
  showRings: boolean;
}

const SaturnSphere = memo(function SaturnSphere({
  radius,
  textureUrl,
  ringsTextureUrl,
  brightness,
  enableRotation,
  emissiveColor,
  shininess,
  showRings,
}: SaturnSphereProps) {
  const saturnRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const texture = textureUrl
    ? useLoader(THREE.TextureLoader, textureUrl)
    : null;
  const ringsTexture = ringsTextureUrl
    ? useLoader(THREE.TextureLoader, ringsTextureUrl)
    : null;

  // Apply axial tilt
  useFrame(() => {
    if (groupRef.current && groupRef.current.rotation.z === 0) {
      groupRef.current.rotation.z = THREE.MathUtils.degToRad(SATURN_AXIAL_TILT);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={saturnRef}>
        <sphereGeometry args={[radius, 64, 32]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            roughness={0.7} // Gas giant - no solid surface
            metalness={0.1}
            emissive={emissiveColor}
            emissiveIntensity={0.05 * brightness}
          />
        ) : (
          <meshStandardMaterial
            color="#fad5a5"
            roughness={0.7} // Gas giant - no solid surface
            metalness={0.1}
            emissive={emissiveColor}
            emissiveIntensity={0.05 * brightness}
          />
        )}
      </mesh>

      {showRings && (
        <mesh ref={ringsRef} rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[SATURN_RINGS_INNER, SATURN_RINGS_OUTER, 64]} />
          {ringsTexture ? (
            <meshBasicMaterial
              map={ringsTexture}
              side={THREE.DoubleSide}
              transparent
              opacity={0.7}
            />
          ) : (
            <meshBasicMaterial
              color="#c9b29b"
              side={THREE.DoubleSide}
              transparent
              opacity={0.7}
            />
          )}
        </mesh>
      )}
    </group>
  );
});

// ============================================================================
// PRIMITIVES - Composable building blocks
// ============================================================================

/**
 * Props for the SaturnSphereRoot component
 * @interface SaturnSphereRootProps
 */
export interface SaturnSphereRootProps {
  /** Radius of the Saturn sphere in scene units (default: SATURN_RADIUS) */
  radius?: number;
  /** URL to the Saturn surface texture (optional - uses pale gold fallback) */
  textureUrl?: string;
  /** URL to the rings texture (optional - uses beige fallback) */
  ringsTextureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Emissive color for the material (default: "#221100") */
  emissiveColor?: string;
  /** Material shininess value (default: 15) */
  shininess?: number;
  /** Show Saturn's iconic ring system (default: true) */
  showRings?: boolean;
}

/**
 * SaturnSphereRoot - The base Saturn sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Saturn sphere with optional texture, materials, and rings.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { SaturnSphereRoot } from '@/components/ui/saturn';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <SaturnSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const SaturnSphereRoot = forwardRef<THREE.Group, SaturnSphereRootProps>(
  (
    {
      radius = SATURN_RADIUS,
      textureUrl,
      ringsTextureUrl,
      brightness = 1.2,
      enableRotation = true,
      emissiveColor = "#221100",
      shininess = 15,
      showRings = true,
    },
    ref
  ) => {
    return (
      <group ref={ref}>
        <SaturnSphere
          radius={radius}
          textureUrl={textureUrl}
          ringsTextureUrl={ringsTextureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
          emissiveColor={emissiveColor}
          shininess={shininess}
          showRings={showRings}
        />
      </group>
    );
  }
);

SaturnSphereRoot.displayName = "SaturnSphereRoot";

/**
 * Props for the SaturnScene component
 * @interface SaturnSceneProps
 */
export interface SaturnSceneProps {
  /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 28.35]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view in degrees (default: 45) */
  cameraFov?: number;
  /** Minimum zoom distance from target (default: 14.175) */
  minDistance?: number;
  /** Maximum zoom distance from target (default: 189) */
  maxDistance?: number;
  /** Overall scene brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Child components to render within the scene */
  children?: React.ReactNode;
}

/**
 * SaturnScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { SaturnScene, SaturnSphereRoot } from '@/components/ui/saturn';
 *
 * function CustomSaturn() {
 *   return (
 *     <SaturnScene cameraPosition={[0, 0, 30]} brightness={1.5}>
 *       <SaturnSphereRoot
 *         radius={9.45}
 *         textureUrl="/saturn.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 15, 0]}>
 *         <sphereGeometry args={[1, 32, 32]} />
 *         <meshStandardMaterial color="white" />
 *       </mesh>
 *     </SaturnScene>
 *   );
 * }
 *
 * @param props - Configuration props for the scene
 * @param ref - Forward ref to the container div element
 * @returns A complete Three.js scene ready to render
 */
export const SaturnScene = forwardRef<HTMLDivElement, SaturnSceneProps>(
  (
    {
      cameraPosition = [0, 0, 28.35], // View rings from distance
      cameraFov = 45,
      minDistance = 14.175,
      maxDistance = 189,
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

SaturnScene.displayName = "SaturnScene";

// ============================================================================
// COMPOSED COMPONENT - Pre-configured for common use cases
// ============================================================================

/**
 * Props for the main Saturn component
 * @interface SaturnProps
 */
export interface SaturnProps {
  /** URL to the Saturn surface texture (optional - uses pale gold fallback) */
  textureUrl?: string;
  /** URL to the rings texture (optional - uses beige fallback) */
  ringsTextureUrl?: string;
  /** Overall brightness multiplier (default: 1.2) */
  brightness?: number;
  /** Enable automatic rotation (default: true) */
  enableRotation?: boolean;
  /** Show Saturn's iconic ring system (default: true) */
  showRings?: boolean;
  /** Custom child components to render in the scene */
  children?: React.ReactNode;
  /** Camera position [x, y, z] (default: [0, 0, 28.35]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 45) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 20) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 80) */
  maxDistance?: number;
}

/**
 * Saturn - The main composed Saturn component
 *
 * A fully pre-configured Saturn visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Saturn } from '@/components/ui/saturn';
 *
 * function App() {
 *   return <Saturn />;
 * }
 *
 * @example
 * With texture and without rings:
 *
 * function App() {
 *   return (
 *     <Saturn
 *       textureUrl="/textures/saturn.jpg"
 *       showRings={false}
 *     />
 *   );
 * }
 *
 * @example
 * With custom settings:
 *
 * function App() {
 *   return (
 *     <Saturn
 *       textureUrl="/textures/saturn.jpg"
 *       ringsTextureUrl="/textures/saturn-rings.jpg"
 *       brightness={1.5}
 *       enableRotation={true}
 *     />
 *   );
 * }
 *
 * @param props - Configuration props for the Saturn component
 * @param ref - Forward ref to the container div element
 * @returns A complete, ready-to-use Saturn visualization
 */
const SaturnComponent = forwardRef<HTMLDivElement, SaturnProps>(
  (
    {
      textureUrl,
      ringsTextureUrl,
      brightness = 1.2,
      enableRotation = true,
      showRings = true,
      children,
      cameraPosition = [0, 0, 28.35],
      cameraFov = 45,
      minDistance = 14.175,
      maxDistance = 189,
    },
    ref
  ) => {
    return (
      <SaturnScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <SaturnSphereRoot
          radius={SATURN_RADIUS}
          textureUrl={textureUrl}
          ringsTextureUrl={ringsTextureUrl}
          brightness={brightness}
          enableRotation={enableRotation}
          showRings={showRings}
        />
        {children}
      </SaturnScene>
    );
  }
);

SaturnComponent.displayName = "Saturn";

/**
 * Saturn - Memoized Saturn component for optimal performance
 *
 * This is the main export. The component is memoized to prevent
 * unnecessary re-renders when parent components update.
 */
export const Saturn = memo(SaturnComponent);
