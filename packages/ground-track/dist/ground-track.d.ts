import * as THREE from "three";
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
export declare const DEFAULT_TRACK_COLOR = "#ffff00";
export declare const DEFAULT_LINE_WIDTH = 3;
export declare const DEFAULT_PLANET_RADIUS = 6371;
export declare const DEFAULT_OFFSET = 10;
/**
 * Convert latitude/longitude to 3D Cartesian coordinates on a sphere
 */
declare function latLonToCartesian(lat: number, lon: number, radius: number): THREE.Vector3;
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
export declare const GroundTrackRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GroundTrackRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>>;
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
export declare const GroundTrackScene: import("react").ForwardRefExoticComponent<GroundTrackSceneProps & import("react").RefAttributes<HTMLDivElement>>;
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
export declare const GroundTrack: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GroundTrackProps & import("react").RefAttributes<HTMLDivElement>>>;
/**
 * Utility functions for ground track calculations
 */
export declare const GroundTrackUtils: {
    /**
     * Convert Cartesian coordinates to lat/lon
     */
    cartesianToLatLon: (position: THREE.Vector3, radius: number) => {
        latitude: number;
        longitude: number;
    };
    /**
     * Convert lat/lon to Cartesian
     */
    latLonToCartesian: typeof latLonToCartesian;
    /**
     * Generate ground track from orbital elements over time
     *
     * ⚠️ SIMPLIFIED PROPAGATION - For visualization only!
     * Uses basic circular+inclined orbit model.
     * For mission-critical applications, use SGP4/SDP4 propagators.
     */
    generateFromOrbit: (semiMajorAxis: number, inclination: number, steps: number, planetRadius?: number) => GroundTrackPoint[];
    /**
     * Filter points by time range
     */
    filterByTimeRange: (points: GroundTrackPoint[], startTime: number, endTime: number) => GroundTrackPoint[];
    /**
     * Validate ground track point
     */
    validatePoint: (point: GroundTrackPoint) => boolean;
};
export {};
//# sourceMappingURL=ground-track.d.ts.map