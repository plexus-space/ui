"use client";

import { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import {
  vec3,
  orbitalPeriod,
  stateToOrbitalElements,
  type Vec3,
  type OrbitalElements,
} from "../components/primitives/physics";
import {
  eciToGeodetic,
  type GeodeticCoordinates,
} from "../components/primitives/coordinate-systems";
import {
  computePositionAtAnomaly,
  meanToTrueAnomaly,
  trueToMeanAnomaly,
} from "../components/primitives/orbital-mechanics";

/**
 * USE ORBITAL PROPAGATION - Pure Data Hook
 *
 * Shadcn-style primitive hook for orbital mechanics.
 * Returns satellite states (positions, velocities, ground tracks) with NO rendering.
 *
 * **Architecture:**
 * - PURE DATA: No Three.js rendering, just physics
 * - COMPOSABLE: Use with any rendering primitive
 * - TESTABLE: Easy to unit test physics
 *
 * **Usage:**
 * ```tsx
 * const { satellites } = useOrbitalPropagation({
 *   satellites: [{ id: "iss", semiMajorAxis: 6778, inclination: 51.6, ... }],
 *   propagatorType: "j2",
 *   timeMultiplier: 50,
 * });
 *
 * // Compose with any rendering primitive
 * return satellites.map(sat => (
 *   <Marker key={sat.id} position={sat.position} color={sat.color} />
 * ));
 * ```
 */

// ============================================================================
// Constants (WGS-84)
// ============================================================================

export const EARTH_MU = 398600.4418; // km³/s² (WGS-84)
export const EARTH_RADIUS = 6378.137; // km (WGS-84)
export const EARTH_J2 = 1.08262668355e-3; // J2 coefficient

// ============================================================================
// Types
// ============================================================================

export type PropagatorType = "two-body" | "j2" | "high-fidelity";

export interface InitialOrbit {
  id: string;
  name: string;
  semiMajorAxis: number; // km
  eccentricity: number;
  inclination: number; // degrees
  longitudeOfAscendingNode?: number; // degrees
  argumentOfPeriapsis?: number; // degrees
  trueAnomaly?: number; // degrees
  color?: string;
}

export interface SatelliteState {
  id: string;
  name: string;
  position: Vec3; // ECI coordinates (km)
  velocity: Vec3; // ECI velocity (km/s)
  color?: string;
  elements?: OrbitalElements;
  groundTrack?: GeodeticCoordinates;
  simulationTime: Date;
  elapsedTime: number; // seconds
}

export interface UseOrbitalPropagationOptions {
  satellites: InitialOrbit[];
  propagatorType?: PropagatorType;
  timeMultiplier?: number;
  paused?: boolean;
  /** Callback when states update */
  onUpdate?: (satellites: SatelliteState[]) => void;
  /**
   * Error callback for handling simulation errors
   * @param error - Error object
   * @param satelliteId - ID of satellite that caused the error
   * @param context - Context string (e.g., "coordinate_conversion", "element_computation")
   */
  onError?: (error: Error, satelliteId: string, context: string) => void;
}


// ============================================================================
// Hook
// ============================================================================

/**
 * Use Orbital Propagation Hook
 *
 * Pure data hook for orbital mechanics simulation.
 * Returns satellite states with NO rendering.
 */
export function useOrbitalPropagation({
  satellites: initialSatellites,
  propagatorType = "j2",
  timeMultiplier = 1,
  paused = false,
  onUpdate,
  onError,
}: UseOrbitalPropagationOptions) {
  const [satellites, setSatellites] = useState<SatelliteState[]>([]);

  // Per-satellite state
  const satelliteRefs = useRef<
    Map<
      string,
      {
        epochTime: Date;
        currentTime: number;
        meanAnomaly: number;
        period: number;
        meanMotion: number;
      }
    >
  >(new Map());

  // Initialize satellite states
  const initializeSatellite = useCallback((orbit: InitialOrbit) => {
    const period = orbitalPeriod(orbit.semiMajorAxis, EARTH_MU);
    const nu = ((orbit.trueAnomaly || 0) * Math.PI) / 180;
    const initialMeanAnomaly = trueToMeanAnomaly(nu, orbit.eccentricity);
    const meanMotion = (2 * Math.PI) / period;

    satelliteRefs.current.set(orbit.id, {
      epochTime: new Date(),
      currentTime: 0,
      meanAnomaly: initialMeanAnomaly,
      period,
      meanMotion,
    });
  }, []);

  // Initialize all satellites
  if (satelliteRefs.current.size === 0) {
    initialSatellites.forEach(initializeSatellite);
  }

  // Animation loop
  useFrame((_, delta) => {
    if (paused) return;

    const deltaTime = delta * timeMultiplier;
    const newStates: SatelliteState[] = [];

    initialSatellites.forEach((orbit) => {
      const ref = satelliteRefs.current.get(orbit.id);
      if (!ref) return;

      // Update time and mean anomaly
      ref.currentTime += deltaTime;
      ref.meanAnomaly += ref.meanMotion * deltaTime;

      if (ref.meanAnomaly > 2 * Math.PI) {
        ref.meanAnomaly -= 2 * Math.PI;
      }

      // Solve for true anomaly
      const trueAnomaly = meanToTrueAnomaly(
        ref.meanAnomaly,
        orbit.eccentricity
      );

      // Compute position and velocity
      const { position, velocity } = computePositionAtAnomaly(
        orbit,
        trueAnomaly,
        EARTH_MU
      );

      // Compute absolute time
      const simulationTime = new Date(
        ref.epochTime.getTime() + ref.currentTime * 1000
      );

      // Compute ground track
      let groundTrack: GeodeticCoordinates | undefined;
      try {
        const posMeters = {
          x: position[0] * 1000,
          y: position[1] * 1000,
          z: position[2] * 1000,
        };
        groundTrack = eciToGeodetic(posMeters, simulationTime);
      } catch (e) {
        onError?.(
          e as Error,
          orbit.id,
          "coordinate_conversion"
        );
      }

      // Compute orbital elements
      let elements: OrbitalElements | undefined;
      try {
        elements = stateToOrbitalElements(position, velocity, EARTH_MU);
      } catch (e) {
        onError?.(
          e as Error,
          orbit.id,
          "element_computation"
        );
      }

      newStates.push({
        id: orbit.id,
        name: orbit.name,
        position,
        velocity,
        color: orbit.color,
        elements,
        groundTrack,
        simulationTime,
        elapsedTime: ref.currentTime,
      });
    });

    setSatellites(newStates);

    if (onUpdate) {
      onUpdate(newStates);
    }
  });

  return { satellites };
}
