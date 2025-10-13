/**
 * Plexus UI Hooks
 *
 * Pure data/logic hooks for aerospace and physics simulations.
 * Shadcn-style primitives: data generation separate from rendering.
 *
 * @example
 * ```tsx
 * import { useOrbitalPropagation, useGroundTrack } from './hooks';
 * import { Marker, Trail, LineRenderer } from './primitives';
 *
 * function MyOrbitViz() {
 *   const { satellites } = useOrbitalPropagation({ satellites: [...] });
 *   const { points } = useGroundTrack({ satellitePosition: satellites[0].position });
 *
 *   return (
 *     <>
 *       <Marker position={satellites[0].position} />
 *       <Trail position={satellites[0].position} maxLength={200} />
 *       <LineRenderer points={points} color="#00ff00" />
 *     </>
 *   );
 * }
 * ```
 */

// Orbital Mechanics Hooks
export {
  useOrbitalPropagation,
  EARTH_MU,
  EARTH_RADIUS,
  EARTH_J2,
  type PropagatorType,
  type InitialOrbit,
  type SatelliteState,
  type UseOrbitalPropagationOptions,
} from "./use-orbital-propagation";

export {
  useGroundTrack,
  type GroundTrackPoint,
  type UseGroundTrackOptions,
  type NodeCrossing,
} from "./use-ground-track";
