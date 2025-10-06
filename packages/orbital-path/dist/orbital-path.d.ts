import * as THREE from "three";
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
export declare const DEFAULT_ORBITAL_SEGMENTS = 128;
export declare const DEFAULT_ORBITAL_COLOR = "#00ff00";
export declare const DEFAULT_LINE_WIDTH = 2;
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
export declare const OrbitalPathRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<OrbitalPathRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>>;
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
 * import \{ OrbitalPathScene, OrbitalPathRoot \} from '@plexusui/orbital-path';
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
export declare const OrbitalPathScene: import("react").ForwardRefExoticComponent<OrbitalPathSceneProps & import("react").RefAttributes<HTMLDivElement>>;
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
export declare const OrbitalPath: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<OrbitalPathProps & import("react").RefAttributes<HTMLDivElement>>>;
/**
 * Utility functions for orbital calculations
 */
export declare const OrbitalPathUtils: {
    /**
     * Calculate orbital period using Kepler's third law
     * @param semiMajorAxis Semi-major axis in km
     * @param mu Gravitational parameter (default: Earth's μ = 398600 km³/s²)
     * @returns Orbital period in seconds
     */
    calculateOrbitalPeriod: (semiMajorAxis: number, mu?: number) => number;
    /**
     * Calculate apoapsis and periapsis distances
     */
    calculateApsides: (semiMajorAxis: number, eccentricity: number) => {
        apoapsis: number;
        periapsis: number;
    };
    /**
     * Convert circular orbit radius to Keplerian elements
     */
    circularOrbit: (radius: number) => KeplerianElements;
    /**
     * Validate Keplerian elements
     */
    validateElements: (elements: KeplerianElements) => boolean;
};
//# sourceMappingURL=orbital-path.d.ts.map