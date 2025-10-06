"use client";

import { memo, useMemo, forwardRef, Suspense } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Extend THREE types for R3F
extend({
  Line: THREE.Line,
  BufferGeometry: THREE.BufferGeometry,
  BufferAttribute: THREE.BufferAttribute,
  LineBasicMaterial: THREE.LineBasicMaterial,
  SphereGeometry: THREE.SphereGeometry,
  MeshBasicMaterial: THREE.MeshBasicMaterial,
});

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Keplerian orbital elements
 */
export interface KeplerianElements {
  /** Semi-major axis (km) */
  semiMajorAxis: number;
  /** Eccentricity (0 = circular, < 1 = elliptical) */
  eccentricity: number;
  /** Inclination (degrees) */
  inclination?: number;
  /** Longitude of ascending node (degrees) */
  longitudeOfAscendingNode?: number;
  /** Argument of periapsis (degrees) */
  argumentOfPeriapsis?: number;
  /** True anomaly (degrees) */
  trueAnomaly?: number;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_ORBITAL_SEGMENTS = 128;
export const DEFAULT_ORBITAL_COLOR = "#00ff00";
export const DEFAULT_LINE_WIDTH = 2;

// ============================================================================
// Utilities
// ============================================================================

/**
 * Calculate position on elliptical orbit at given true anomaly
 */
function calculateOrbitalPosition(
  a: number,
  e: number,
  theta: number
): THREE.Vector3 {
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
  return new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta));
}

/**
 * Generate orbital path points from Keplerian elements
 */
function generateOrbitalPath(
  elements: KeplerianElements,
  segments: number
): THREE.Vector3[] {
  const { semiMajorAxis, eccentricity } = elements;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const point = calculateOrbitalPosition(semiMajorAxis, eccentricity, theta);
    points.push(point);
  }

  return points;
}

/**
 * Apply 3D rotation transformations for orbital elements
 */
function applyOrbitalRotations(
  group: THREE.Group,
  elements: KeplerianElements
): void {
  const {
    inclination = 0,
    longitudeOfAscendingNode = 0,
    argumentOfPeriapsis = 0,
  } = elements;

  // Reset rotation
  group.rotation.set(0, 0, 0);

  // Apply rotations in order: Ω (RAAN), i (inclination), ω (arg of periapsis)
  group.rotateY((longitudeOfAscendingNode * Math.PI) / 180);
  group.rotateX((inclination * Math.PI) / 180);
  group.rotateZ((argumentOfPeriapsis * Math.PI) / 180);
}

// ============================================================================
// PRIMITIVES
// ============================================================================

export interface OrbitalPathRootProps {
  /** Keplerian orbital elements */
  elements: KeplerianElements;
  /** Number of segments for path smoothness */
  segments?: number;
  /** Path line color */
  color?: string;
  /** Line width (only works with WebGLRenderer.setLineWidth or Line2) */
  lineWidth?: number;
  /** Show apoapsis marker */
  showApoapsis?: boolean;
  /** Show periapsis marker */
  showPeriapsis?: boolean;
  /** Apoapsis marker color */
  apoapsisColor?: string;
  /** Periapsis marker color */
  periapsisColor?: string;
  /** Marker size */
  markerSize?: number;
}

/**
 * OrbitalPathRoot - The base orbital path primitive component
 *
 * Renders an elliptical orbit using Keplerian elements.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <OrbitalPathRoot
 *     elements={{
 *       semiMajorAxis: 10000,
 *       eccentricity: 0.3,
 *       inclination: 23.5,
 *       longitudeOfAscendingNode: 45,
 *       argumentOfPeriapsis: 90
 *     }}
 *     color="#00ff00"
 *     showApoapsis
 *     showPeriapsis
 *   />
 * </Canvas>
 * ```
 */
export const OrbitalPathRoot = memo(
  forwardRef<THREE.Group, OrbitalPathRootProps>(
    (
      {
        elements,
        segments = DEFAULT_ORBITAL_SEGMENTS,
        color = DEFAULT_ORBITAL_COLOR,
        lineWidth = DEFAULT_LINE_WIDTH,
        showApoapsis = false,
        showPeriapsis = false,
        apoapsisColor = "#ff0000",
        periapsisColor = "#0000ff",
        markerSize = 100,
      },
      ref
    ) => {
      // Generate orbital path points
      const points = useMemo(
        () => generateOrbitalPath(elements, segments),
        [elements, segments]
      );

      // Calculate apoapsis and periapsis positions
      const { apoapsis, periapsis } = useMemo(() => {
        const { semiMajorAxis, eccentricity } = elements;
        const apoapsisDistance = semiMajorAxis * (1 + eccentricity);
        const periapsisDistance = semiMajorAxis * (1 - eccentricity);

        return {
          apoapsis: new THREE.Vector3(apoapsisDistance, 0, 0),
          periapsis: new THREE.Vector3(-periapsisDistance, 0, 0),
        };
      }, [elements]);

      // Apply orbital rotations
      const groupRef = useMemo(() => {
        const group = new THREE.Group();
        applyOrbitalRotations(group, elements);
        return group;
      }, [elements]);

      return (
        <group ref={ref}>
          <primitive object={groupRef}>
            {/* Orbital path line */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={points.length}
                  array={
                    new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
                  }
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color={color} linewidth={lineWidth} />
            </line>

            {/* Apoapsis marker */}
            {showApoapsis && (
              <mesh position={apoapsis}>
                <sphereGeometry args={[markerSize, 16, 16]} />
                <meshBasicMaterial color={apoapsisColor} />
              </mesh>
            )}

            {/* Periapsis marker */}
            {showPeriapsis && (
              <mesh position={periapsis}>
                <sphereGeometry args={[markerSize, 16, 16]} />
                <meshBasicMaterial color={periapsisColor} />
              </mesh>
            )}
          </primitive>
        </group>
      );
    }
  )
);

OrbitalPathRoot.displayName = "OrbitalPathRoot";

// ============================================================================
// SCENE PRIMITIVE - Container with Canvas and lighting
// ============================================================================

/**
 * Props for the OrbitalPathScene component
 */
export interface OrbitalPathSceneProps {
  /** Initial camera position [x, y, z] (default: [0, 10000, 10000]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view in degrees (default: 45) */
  cameraFov?: number;
  /** Minimum zoom distance (default: 1000) */
  minDistance?: number;
  /** Maximum zoom distance (default: 100000) */
  maxDistance?: number;
  /** Overall scene brightness (default: 1.0) */
  brightness?: number;
  /** Child components to render within the scene */
  children?: React.ReactNode;
}

/**
 * OrbitalPathScene - A pre-configured Three.js scene for orbital visualizations
 *
 * Provides a complete scene with Canvas, camera, lights, and orbital controls.
 * Use this when you want a ready-to-go scene but need to add custom content.
 *
 * @example
 * ```tsx
 * import \{ OrbitalPathScene, OrbitalPathRoot \} from '@/components/ui/orbital-path';
 *
 * function CustomOrbit() \{
 *   return (
 *     <OrbitalPathScene>
 *       <OrbitalPathRoot
 *         elements=\{\{
 *           semiMajorAxis: 10000,
 *           eccentricity: 0.3
 *         \}\}
 *       />
 *       <mesh position=\{[0, 0, 0]\}>
 *         <sphereGeometry args=\{[500, 32, 32]\} />
 *         <meshStandardMaterial color="orange" />
 *       </mesh>
 *     </OrbitalPathScene>
 *   );
 * \}
 * ```
 */
export const OrbitalPathScene = forwardRef<
  HTMLDivElement,
  OrbitalPathSceneProps
>(
  (
    {
      cameraPosition = [0, 10000, 10000],
      cameraFov = 45,
      minDistance = 1000,
      maxDistance = 100000,
      brightness = 1.0,
      children,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="relative h-full w-full">
        <Canvas gl={{ antialias: true }}>
          <color attach="background" args={["#000000"]} />
          <PerspectiveCamera
            makeDefault
            position={cameraPosition}
            fov={cameraFov}
          />

          <Suspense fallback={null}>
            {/* Ambient space light */}
            <ambientLight intensity={0.3 * brightness} />

            {/* Main light source */}
            <pointLight
              position={[10000, 10000, 10000]}
              intensity={1.0 * brightness}
            />

            {/* Fill light */}
            <pointLight
              position={[-10000, -5000, -10000]}
              intensity={0.3 * brightness}
            />

            <OrbitControls
              makeDefault
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

OrbitalPathScene.displayName = "OrbitalPathScene";

// ============================================================================
// COMPOSED COMPONENT - Fully configured for common use cases
// ============================================================================

export interface OrbitalPathProps extends OrbitalPathRootProps {
  /** Camera position [x, y, z] (default: [0, 10000, 10000]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 45) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 1000) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 100000) */
  maxDistance?: number;
  /** Additional children to render in the scene */
  children?: React.ReactNode;
}

/**
 * OrbitalPath - Fully composed orbital path visualization component
 *
 * A complete, drop-in-ready orbital visualization with scene, lighting, and controls.
 * Just pass Keplerian elements and it works immediately!
 *
 * **This is the highest-level component** - includes Canvas, lights, camera, and controls.
 *
 * @example
 * Simplest usage (works immediately):
 * ```tsx
 * import { OrbitalPath } from '@/components/ui/orbital-path';
 *
 * function App() {
 *   return (
 *     <OrbitalPath
 *       elements={{
 *         semiMajorAxis: 10000,
 *         eccentricity: 0.3
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * With all features:
 * ```tsx
 * <OrbitalPath
 *   elements={{
 *     semiMajorAxis: 10000,
 *     eccentricity: 0.3,
 *     inclination: 23.5,
 *     longitudeOfAscendingNode: 45,
 *     argumentOfPeriapsis: 90
 *   }}
 *   showApoapsis
 *   showPeriapsis
 *   color="#00ff00"
 *   segments={256}
 * />
 * ```
 *
 * @example
 * Build custom scene with Scene primitive:
 * ```tsx
 * <OrbitalPathScene>
 *   <OrbitalPathRoot elements=\{orbit1\} color="#00ff00" />
 *   <OrbitalPathRoot elements=\{orbit2\} color="#ff0000" />
 * </OrbitalPathScene>
 * ```
 */
const OrbitalPathComponent = forwardRef<HTMLDivElement, OrbitalPathProps>(
  (
    {
      cameraPosition,
      cameraFov,
      minDistance,
      maxDistance,
      children,
      ...rootProps
    },
    ref
  ) => {
    return (
      <OrbitalPathScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
      >
        <OrbitalPathRoot {...rootProps} />
        {children}
      </OrbitalPathScene>
    );
  }
);

OrbitalPathComponent.displayName = "OrbitalPath";

export const OrbitalPath = memo(OrbitalPathComponent);

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Utility functions for orbital calculations
 */
export const OrbitalPathUtils = {
  /**
   * Calculate orbital period using Kepler's third law
   * @param semiMajorAxis Semi-major axis in km
   * @param mu Gravitational parameter (default: Earth's μ = 398600 km³/s²)
   * @returns Orbital period in seconds
   */
  calculateOrbitalPeriod: (semiMajorAxis: number, mu = 398600): number => {
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);
  },

  /**
   * Calculate apoapsis and periapsis distances
   */
  calculateApsides: (
    semiMajorAxis: number,
    eccentricity: number
  ): { apoapsis: number; periapsis: number } => {
    return {
      apoapsis: semiMajorAxis * (1 + eccentricity),
      periapsis: semiMajorAxis * (1 - eccentricity),
    };
  },

  /**
   * Convert circular orbit radius to Keplerian elements
   */
  circularOrbit: (radius: number): KeplerianElements => {
    return {
      semiMajorAxis: radius,
      eccentricity: 0,
      inclination: 0,
      longitudeOfAscendingNode: 0,
      argumentOfPeriapsis: 0,
      trueAnomaly: 0,
    };
  },

  /**
   * Validate Keplerian elements
   */
  validateElements: (elements: KeplerianElements): boolean => {
    const { semiMajorAxis, eccentricity } = elements;
    return semiMajorAxis > 0 && eccentricity >= 0 && eccentricity < 1;
  },
};
