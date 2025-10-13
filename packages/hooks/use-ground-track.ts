"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  eciToGeodetic,
  geodeticToECEF,
  type GeodeticCoordinates,
  type ECICoordinates,
} from "../components/primitives/coordinate-systems";
import type { Vec3 } from "../components/primitives/physics";

/**
 * USE GROUND TRACK - Pure Data Hook
 *
 * Shadcn-style primitive hook for ground track computation.
 * Returns ground track points with NO rendering.
 *
 * **Architecture:**
 * - PURE DATA: No Three.js rendering, just coordinate transforms
 * - COMPOSABLE: Use with LineRenderer or any visualization
 * - TESTABLE: Easy to unit test coordinate math
 *
 * **Usage:**
 * ```tsx
 * const { points, currentPoint } = useGroundTrack({
 *   satellitePosition: satellite.position,
 *   simulationTime: satellite.simulationTime,
 *   maxPoints: 500,
 * });
 *
 * // Compose with LineRenderer primitive
 * return <LineRenderer points={points} color="#00ff00" />;
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface GroundTrackPoint {
  position: Vec3; // Render position in km (ECEF-like for Three.js)
  latitude: number; // degrees
  longitude: number; // degrees
  altitude: number; // meters
  timestamp: number; // Unix timestamp
}

export interface UseGroundTrackOptions {
  /**
   * Satellite position in ECI frame (kilometers)
   * Will be automatically converted to meters for coordinate transforms
   */
  satellitePosition?: ECICoordinates | Vec3;
  /** Simulation time for coordinate transform */
  simulationTime?: Date;
  /** Maximum number of points to store */
  maxPoints?: number;
  /** Update interval in frames (5 = update every 5 frames) */
  updateInterval?: number;
  /** Height offset above surface for visualization (km) */
  heightOffset?: number;
  /** Earth radius (km) */
  earthRadius?: number;
  /**
   * Error callback for handling conversion errors
   * @param error - Error object
   * @param context - Context string
   */
  onError?: (error: Error, context: string) => void;
}

export interface NodeCrossing {
  position: Vec3;
  latitude: number;
  longitude: number;
  type: "ascending" | "descending";
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Convert geodetic to render position (ECEF in km for Three.js)
 */
function geodeticToRenderPosition(
  lat: number,
  lon: number,
  heightOffset: number
): Vec3 {
  const ecef = geodeticToECEF({
    latitude: lat,
    longitude: lon,
    altitude: heightOffset * 1000, // km to meters
  });

  // Convert meters to km for Three.js scene
  return [ecef.x / 1000, ecef.y / 1000, ecef.z / 1000];
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Use Ground Track Hook
 *
 * Pure data hook for ground track computation.
 * Returns ground track points with NO rendering.
 */
export function useGroundTrack({
  satellitePosition,
  simulationTime = new Date(),
  maxPoints = 500,
  updateInterval = 5,
  heightOffset = 1, // 1km above surface for visibility
  earthRadius = 6378.137,
  onError,
}: UseGroundTrackOptions) {
  const pointsRef = useRef<GroundTrackPoint[]>([]);
  const frameCounter = useRef(0);
  const lastLatitude = useRef<number | null>(null);
  const ascendingNodesRef = useRef<NodeCrossing[]>([]);
  const descendingNodesRef = useRef<NodeCrossing[]>([]);

  useFrame(() => {
    if (!satellitePosition) return;

    frameCounter.current++;
    if (frameCounter.current % updateInterval !== 0) return;

    try {
      // Convert satellite position to meters for coordinate transform
      const satPosMeters: ECICoordinates = Array.isArray(satellitePosition)
        ? { x: satellitePosition[0] * 1000, y: satellitePosition[1] * 1000, z: satellitePosition[2] * 1000 }
        : { x: satellitePosition.x * 1000, y: satellitePosition.y * 1000, z: satellitePosition.z * 1000 };

      // Convert ECI to geodetic using simulation time
      const geodetic = eciToGeodetic(satPosMeters, simulationTime);

      // Validate coordinates
      if (
        !isFinite(geodetic.latitude) ||
        !isFinite(geodetic.longitude) ||
        Math.abs(geodetic.latitude) > 90 ||
        Math.abs(geodetic.longitude) > 180
      ) {
        return;
      }

      // Convert to render position
      const renderPos = geodeticToRenderPosition(
        geodetic.latitude,
        geodetic.longitude,
        heightOffset
      );

      // Detect node crossings (equator crossings)
      if (lastLatitude.current !== null) {
        if (lastLatitude.current < 0 && geodetic.latitude >= 0) {
          // Ascending node
          ascendingNodesRef.current.push({
            position: renderPos,
            latitude: geodetic.latitude,
            longitude: geodetic.longitude,
            type: "ascending",
          });
          if (ascendingNodesRef.current.length > 10) {
            ascendingNodesRef.current.shift();
          }
        } else if (lastLatitude.current > 0 && geodetic.latitude <= 0) {
          // Descending node
          descendingNodesRef.current.push({
            position: renderPos,
            latitude: geodetic.latitude,
            longitude: geodetic.longitude,
            type: "descending",
          });
          if (descendingNodesRef.current.length > 10) {
            descendingNodesRef.current.shift();
          }
        }
      }

      lastLatitude.current = geodetic.latitude;

      // Add new point
      const newPoint: GroundTrackPoint = {
        position: renderPos,
        latitude: geodetic.latitude,
        longitude: geodetic.longitude,
        altitude: geodetic.altitude,
        timestamp: Date.now(),
      };

      pointsRef.current.push(newPoint);

      // Keep only last N points
      if (pointsRef.current.length > maxPoints) {
        pointsRef.current.shift();
      }
    } catch (error) {
      onError?.(error as Error, "coordinate_conversion");
    }
  });

  return {
    /** Array of ground track points */
    points: pointsRef.current,
    /** Current ground track point */
    currentPoint: pointsRef.current[pointsRef.current.length - 1],
    /** Ascending node crossings */
    ascendingNodes: ascendingNodesRef.current,
    /** Descending node crossings */
    descendingNodes: descendingNodesRef.current,
  };
}
