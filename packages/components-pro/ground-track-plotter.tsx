"use client";

import * as React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  geodeticToECEF,
  eciToGeodetic,
  type GeodeticCoordinates,
  type ECICoordinates,
} from "../components/primitives/coordinate-systems";

/**
 * GROUND TRACK PLOTTER - PRO COMPONENT
 *
 * Visualizes satellite ground track (sub-satellite point) on Earth's surface.
 * Projects satellite position onto Earth surface accounting for rotation.
 *
 * **SCIENTIFIC BACKGROUND:**
 * Ground track is the path traced by the sub-satellite point (nadir) on Earth's
 * surface. For LEO satellites, the track moves westward due to Earth's rotation.
 * Ground track repeat depends on orbital period vs Earth rotation period.
 *
 * **KEY CONCEPTS:**
 * - Sub-satellite point: Point on surface directly below satellite
 * - Ground track: Path of sub-satellite point over time
 * - Ascending node: Where orbit crosses equator going north
 * - Descending node: Where orbit crosses equator going south
 *
 * **REFERENCES:**
 * [1] Wertz, J. R. (2001). Mission Geometry; Orbit and Constellation Design
 * [2] Vallado, D. A. (2013). Fundamentals of Astrodynamics, Ch. 11
 *
 * **USAGE:**
 * ```tsx
 * <Canvas>
 *   <Sphere radius={6378} />
 *   <OrbitPropagator satellites={sats} onUpdate={setSatelliteStates} />
 *   <GroundTrackPlotter
 *     satellitePosition={satelliteStates[0]?.state.position}
 *     maxPoints={500}
 *     color="#00ff00"
 *   />
 * </Canvas>
 * ```
 */

export interface GroundTrackPlotterProps {
  /** Current satellite position in ECI (km) */
  satellitePosition?: ECICoordinates;
  /** Current time for coordinate transformations */
  time?: Date;
  /** Maximum number of ground track points to store */
  maxPoints?: number;
  /** Ground track line color */
  color?: string;
  /** Line width */
  lineWidth?: number;
  /** Line opacity */
  opacity?: number;
  /** Height offset above surface (km) */
  heightOffset?: number;
  /** Show markers at ascending/descending nodes */
  showNodes?: boolean;
  /** Update interval (frames) - lower = more frequent updates */
  updateInterval?: number;
  /** Earth radius (km) */
  earthRadius?: number;
}

interface GroundTrackPoint {
  position: [number, number, number];
  latitude: number;
  longitude: number;
  timestamp: number;
}

/**
 * Convert geodetic coordinates to ECEF for rendering on Earth surface
 */
function geodeticToRenderPosition(
  lat: number,
  lon: number,
  radius: number,
  heightOffset: number
): [number, number, number] {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const r = radius + heightOffset;
  const x = r * Math.cos(latRad) * Math.cos(lonRad);
  const y = r * Math.cos(latRad) * Math.sin(lonRad);
  const z = r * Math.sin(latRad);

  return [x, y, z];
}

export const GroundTrackPlotter: React.FC<GroundTrackPlotterProps> = ({
  satellitePosition,
  time = new Date(),
  maxPoints = 500,
  color = "#00ff00",
  lineWidth = 2,
  opacity = 0.8,
  heightOffset = 10, // 10km above surface for visibility
  showNodes = false,
  updateInterval = 5, // Update every 5 frames (~12 times per second at 60fps)
  earthRadius = 6378.137, // Earth equatorial radius (km)
}) => {
  const groundTrackRef = React.useRef<GroundTrackPoint[]>([]);
  const frameCounter = React.useRef(0);
  const lastLatitude = React.useRef<number | null>(null);
  const [ascendingNodes, setAscendingNodes] = React.useState<[number, number, number][]>([]);
  const [descendingNodes, setDescendingNodes] = React.useState<[number, number, number][]>([]);

  // Update ground track on frame
  useFrame(() => {
    if (!satellitePosition) return;

    frameCounter.current++;

    // Only update every N frames to reduce overhead
    if (frameCounter.current % updateInterval !== 0) return;

    try {
      // Convert ECI to geodetic (lat/lon/alt)
      const geodetic = eciToGeodetic(satellitePosition, time);

      // Skip invalid coordinates
      if (
        !isFinite(geodetic.latitude) ||
        !isFinite(geodetic.longitude) ||
        Math.abs(geodetic.latitude) > 90 ||
        Math.abs(geodetic.longitude) > 180
      ) {
        return;
      }

      // Convert to render position (on Earth surface with offset)
      const renderPos = geodeticToRenderPosition(
        geodetic.latitude,
        geodetic.longitude,
        earthRadius,
        heightOffset
      );

      // Detect ascending/descending nodes (equator crossings)
      if (lastLatitude.current !== null && showNodes) {
        // Ascending node: crossing equator from south to north
        if (lastLatitude.current < 0 && geodetic.latitude >= 0) {
          setAscendingNodes((prev) => [...prev.slice(-10), renderPos]); // Keep last 10
        }
        // Descending node: crossing equator from north to south
        if (lastLatitude.current > 0 && geodetic.latitude <= 0) {
          setDescendingNodes((prev) => [...prev.slice(-10), renderPos]); // Keep last 10
        }
      }

      lastLatitude.current = geodetic.latitude;

      // Add new point to ground track
      const newPoint: GroundTrackPoint = {
        position: renderPos,
        latitude: geodetic.latitude,
        longitude: geodetic.longitude,
        timestamp: Date.now(),
      };

      groundTrackRef.current.push(newPoint);

      // Keep only last N points
      if (groundTrackRef.current.length > maxPoints) {
        groundTrackRef.current.shift();
      }
    } catch (error) {
      // Silently handle coordinate conversion errors
      console.debug("Ground track conversion error:", error);
    }
  });

  const groundTrackPoints = groundTrackRef.current.map((p) => p.position);

  if (groundTrackPoints.length < 2) return null;

  return (
    <group>
      {/* Ground track line */}
      <Line
        points={groundTrackPoints}
        color={color}
        lineWidth={lineWidth}
        opacity={opacity}
        transparent
      />

      {/* Ascending node markers (green) */}
      {showNodes &&
        ascendingNodes.map((pos, i) => (
          <mesh key={`asc-${i}`} position={pos}>
            <sphereGeometry args={[50, 8, 8]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        ))}

      {/* Descending node markers (red) */}
      {showNodes &&
        descendingNodes.map((pos, i) => (
          <mesh key={`desc-${i}`} position={pos}>
            <sphereGeometry args={[50, 8, 8]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        ))}
    </group>
  );
};

/**
 * Multi-Satellite Ground Track Plotter
 *
 * Renders ground tracks for multiple satellites with different colors.
 */
export interface MultiGroundTrackPlotterProps {
  /** Array of satellite states with positions and colors */
  satellites: Array<{
    id: string;
    position: ECICoordinates;
    color?: string;
  }>;
  /** Time for coordinate transformations */
  time?: Date;
  /** Maximum points per satellite */
  maxPoints?: number;
  /** Show ascending/descending node markers */
  showNodes?: boolean;
  /** Earth radius (km) */
  earthRadius?: number;
}

export const MultiGroundTrackPlotter: React.FC<MultiGroundTrackPlotterProps> = ({
  satellites,
  time = new Date(),
  maxPoints = 500,
  showNodes = false,
  earthRadius = 6378.137,
}) => {
  return (
    <group>
      {satellites.map((sat) => (
        <GroundTrackPlotter
          key={sat.id}
          satellitePosition={sat.position}
          time={time}
          maxPoints={maxPoints}
          color={sat.color || "#00ff00"}
          showNodes={showNodes}
          earthRadius={earthRadius}
        />
      ))}
    </group>
  );
};

GroundTrackPlotter.displayName = "GroundTrackPlotter";
MultiGroundTrackPlotter.displayName = "MultiGroundTrackPlotter";
