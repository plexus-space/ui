"use client";

import { memo, useMemo, forwardRef, useRef, Suspense } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Extend THREE types for R3F
extend(THREE);

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Ground track point with lat/lon coordinates
 */
export interface GroundTrackPoint {
  /** Latitude in degrees (-90 to 90) */
  latitude: number;
  /** Longitude in degrees (-180 to 180) */
  longitude: number;
  /** Optional timestamp */
  timestamp?: number;
  /** Optional altitude in km */
  altitude?: number;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_TRACK_COLOR = "#ffff00";
export const DEFAULT_LINE_WIDTH = 3;
export const DEFAULT_PLANET_RADIUS = 6371; // Earth radius in km
export const DEFAULT_OFFSET = 10; // Offset above surface in km

// ============================================================================
// Utilities
// ============================================================================

/**
 * Convert latitude/longitude to 3D Cartesian coordinates on a sphere
 */
function latLonToCartesian(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Generate ground track points from orbit parameters
 */
function generateGroundTrackPoints(
  points: GroundTrackPoint[],
  planetRadius: number,
  offset: number
): THREE.Vector3[] {
  return points.map((point) => {
    const radius = planetRadius + offset + (point.altitude || 0);
    return latLonToCartesian(point.latitude, point.longitude, radius);
  });
}

/**
 * Split ground track at date line crossing to avoid visual artifacts
 */
function splitAtDateLine(
  points: GroundTrackPoint[]
): GroundTrackPoint[][] {
  const segments: GroundTrackPoint[][] = [];
  let currentSegment: GroundTrackPoint[] = [];

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[i + 1];

    currentSegment.push(current);

    // Check for date line crossing (large longitude jump)
    if (next && Math.abs(next.longitude - current.longitude) > 180) {
      segments.push(currentSegment);
      currentSegment = [];
    }
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
}

// ============================================================================
// PRIMITIVES
// ============================================================================

export interface GroundTrackRootProps {
  /** Ground track points (lat/lon coordinates) */
  points: GroundTrackPoint[];
  /** Planet radius in km */
  planetRadius?: number;
  /** Offset above surface in km */
  offset?: number;
  /** Track line color */
  color?: string;
  /** Line width */
  lineWidth?: number;
  /** Show markers at each point */
  showMarkers?: boolean;
  /** Marker size */
  markerSize?: number;
  /** Marker color */
  markerColor?: string;
  /** Automatically split at date line */
  splitAtDateLine?: boolean;
  /** Animated trail effect */
  animated?: boolean;
  /** Animation speed */
  animationSpeed?: number;
}

/**
 * GroundTrackRoot - The base ground track primitive component
 *
 * Renders satellite ground track overlay on planetary surface.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <GroundTrackRoot
 *     points={[
 *       { latitude: 0, longitude: 0 },
 *       { latitude: 10, longitude: 20 },
 *       { latitude: 20, longitude: 40 },
 *     ]}
 *     planetRadius={6371}
 *     color="#ffff00"
 *   />
 * </Canvas>
 * ```
 */
export const GroundTrackRoot = memo(
  forwardRef<THREE.Group, GroundTrackRootProps>(
    (
      {
        points,
        planetRadius = DEFAULT_PLANET_RADIUS,
        offset = DEFAULT_OFFSET,
        color = DEFAULT_TRACK_COLOR,
        lineWidth = DEFAULT_LINE_WIDTH,
        showMarkers = false,
        markerSize = 50,
        markerColor = "#ffffff",
        splitAtDateLine: shouldSplit = true,
        animated = false,
        animationSpeed = 0.01,
      },
      ref
    ) => {
      const animationRef = useRef(0);

      // Split track at date line if needed
      const segments = useMemo(() => {
        if (shouldSplit) {
          return splitAtDateLine(points);
        }
        return [points];
      }, [points, shouldSplit]);

      // Generate 3D coordinates for each segment
      const trackSegments = useMemo(() => {
        return segments.map((segment) =>
          generateGroundTrackPoints(segment, planetRadius, offset)
        );
      }, [segments, planetRadius, offset]);

      // Animation
      useFrame(() => {
        if (animated) {
          animationRef.current += animationSpeed;
        }
      });

      return (
        <group ref={ref}>
          {trackSegments.map((segmentPoints, segmentIndex) => (
            <group key={`segment-${segmentIndex}`}>
              {/* Ground track line */}
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={segmentPoints.length}
                    array={
                      new Float32Array(
                        segmentPoints.flatMap((p) => [p.x, p.y, p.z])
                      )
                    }
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color={color}
                  linewidth={lineWidth}
                  transparent={animated}
                  opacity={animated ? 0.8 : 1}
                />
              </line>

              {/* Markers at each point */}
              {showMarkers &&
                segmentPoints.map((point, idx) => (
                  <mesh key={`marker-${segmentIndex}-${idx}`} position={point}>
                    <sphereGeometry args={[markerSize, 8, 8]} />
                    <meshBasicMaterial color={markerColor} />
                  </mesh>
                ))}
            </group>
          ))}
        </group>
      );
    }
  )
);

GroundTrackRoot.displayName = "GroundTrackRoot";

// ============================================================================
// SCENE PRIMITIVE - Container with Canvas and lighting
// ============================================================================

/**
 * Props for the GroundTrackScene component
 */
export interface GroundTrackSceneProps {
  /** Initial camera position [x, y, z] (default: [0, 0, 15000]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view in degrees (default: 45) */
  cameraFov?: number;
  /** Minimum zoom distance (default: 7000) */
  minDistance?: number;
  /** Maximum zoom distance (default: 50000) */
  maxDistance?: number;
  /** Overall scene brightness (default: 1.0) */
  brightness?: number;
  /** Child components to render within the scene */
  children?: React.ReactNode;
}

/**
 * GroundTrackScene - A pre-configured Three.js scene for ground track visualizations
 *
 * Provides a complete scene with Canvas, camera, lights, and orbital controls.
 * Use this when you want a ready-to-go scene but need to add custom content like planets.
 *
 * @example
 * ```tsx
 * import { GroundTrackScene, GroundTrackRoot } from '@plexusui/ground-track';
 * import { EarthSphereRoot } from '@plexusui/earth';
 *
 * function CustomGroundTrack() {
 *   return (
 *     <GroundTrackScene>
 *       <EarthSphereRoot radius={6371} textureUrl="/earth.jpg" />
 *       <GroundTrackRoot
 *         points={satelliteTrack}
 *         planetRadius={6371}
 *       />
 *     </GroundTrackScene>
 *   );
 * }
 * ```
 */
export const GroundTrackScene = forwardRef<HTMLDivElement, GroundTrackSceneProps>(
  (
    {
      cameraPosition = [0, 0, 15000],
      cameraFov = 45,
      minDistance = 7000,
      maxDistance = 50000,
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
            <ambientLight intensity={0.15 * brightness} />

            {/* Main light source (Sun) */}
            <directionalLight
              position={[150000, 0, 0]}
              intensity={3.0 * brightness}
              color="#FFF5E6"
            />

            {/* Fill light for dark side */}
            <hemisphereLight
              color="#1a1a2e"
              groundColor="#000000"
              intensity={0.2 * brightness}
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
              target={[0, 0, 0]}
            />

            {children}
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

GroundTrackScene.displayName = "GroundTrackScene";

// ============================================================================
// COMPOSED COMPONENT - Fully configured for common use cases
// ============================================================================

export interface GroundTrackProps extends GroundTrackRootProps {
  /** Camera position [x, y, z] (default: [0, 0, 15000]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 45) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 7000) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 50000) */
  maxDistance?: number;
  /** Additional children to render in the scene */
  children?: React.ReactNode;
}

/**
 * GroundTrack - Fully composed satellite ground track visualization component
 *
 * A complete, drop-in-ready ground track visualization with scene, lighting, and controls.
 * Just pass ground track points and it works immediately!
 *
 * **This is the highest-level component** - includes Canvas, lights, camera, and controls.
 *
 * @example
 * Simplest usage (works immediately):
 * ```tsx
 * import { GroundTrack } from '@plexusui/ground-track';
 *
 * function App() {
 *   const trackPoints = [
 *     { latitude: 0, longitude: 0 },
 *     { latitude: 10, longitude: 20 },
 *     { latitude: 20, longitude: 40 },
 *   ];
 *
 *   return (
 *     <GroundTrack
 *       points={trackPoints}
 *       planetRadius={6371}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * With all features:
 * ```tsx
 * <GroundTrack
 *   points={issGroundTrack}
 *   planetRadius={6371}
 *   showMarkers
 *   animated
 *   color="#ffff00"
 *   markerColor="#ffffff"
 * />
 * ```
 *
 * @example
 * Build custom scene with Scene primitive:
 * ```tsx
 * import { GroundTrackScene, GroundTrackRoot } from '@plexusui/ground-track';
 * import { EarthSphereRoot } from '@plexusui/earth';
 *
 * <GroundTrackScene>
 *   <EarthSphereRoot radius={6371} textureUrl="/earth.jpg" />
 *   <GroundTrackRoot points={track1} color="#00ff00" />
 *   <GroundTrackRoot points={track2} color="#ff0000" />
 * </GroundTrackScene>
 * ```
 */
const GroundTrackComponent = forwardRef<HTMLDivElement, GroundTrackProps>(
  ({ cameraPosition, cameraFov, minDistance, maxDistance, children, ...rootProps }, ref) => {
    return (
      <GroundTrackScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
      >
        <GroundTrackRoot {...rootProps} />
        {children}
      </GroundTrackScene>
    );
  }
);

GroundTrackComponent.displayName = "GroundTrack";

export const GroundTrack = memo(GroundTrackComponent);

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Utility functions for ground track calculations
 */
export const GroundTrackUtils = {
  /**
   * Convert Cartesian coordinates to lat/lon
   */
  cartesianToLatLon: (
    position: THREE.Vector3,
    radius: number
  ): { latitude: number; longitude: number } => {
    const { x, y, z } = position;
    const lat = (Math.asin(y / radius) * 180) / Math.PI;
    const lon = (Math.atan2(z, -x) * 180) / Math.PI - 180;
    return { latitude: lat, longitude: lon };
  },

  /**
   * Convert lat/lon to Cartesian
   */
  latLonToCartesian,

  /**
   * Generate ground track from orbital elements over time
   *
   * ⚠️ SIMPLIFIED PROPAGATION - For visualization only!
   * Uses basic circular+inclined orbit model.
   * For mission-critical applications, use SGP4/SDP4 propagators.
   */
  generateFromOrbit: (
    semiMajorAxis: number,
    inclination: number,
    steps: number,
    planetRadius: number = DEFAULT_PLANET_RADIUS
  ): GroundTrackPoint[] => {
    const points: GroundTrackPoint[] = [];
    const period = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / 398600);

    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * period;
      const theta = (2 * Math.PI * t) / period;

      // Simplified orbit propagation
      const lat = (Math.asin(Math.sin(inclination) * Math.sin(theta)) * 180) / Math.PI;
      const lon = ((theta * 180) / Math.PI) % 360 - 180;

      points.push({ latitude: lat, longitude: lon });
    }

    return points;
  },

  /**
   * Filter points by time range
   */
  filterByTimeRange: (
    points: GroundTrackPoint[],
    startTime: number,
    endTime: number
  ): GroundTrackPoint[] => {
    return points.filter(
      (p) =>
        p.timestamp !== undefined &&
        p.timestamp >= startTime &&
        p.timestamp <= endTime
    );
  },

  /**
   * Validate ground track point
   */
  validatePoint: (point: GroundTrackPoint): boolean => {
    return (
      point.latitude >= -90 &&
      point.latitude <= 90 &&
      point.longitude >= -180 &&
      point.longitude <= 180
    );
  },
};
