import * as THREE from "three";
export type LagrangePointType = "L1" | "L2" | "L3" | "L4" | "L5";
/**
 * Configuration for a two-body system
 */
export interface TwoBodySystem {
    /** Primary body mass (kg) */
    primaryMass: number;
    /** Secondary body mass (kg) */
    secondaryMass: number;
    /** Distance between bodies (km) */
    distance: number;
    /** Primary body position (defaults to origin) */
    primaryPosition?: THREE.Vector3 | [number, number, number];
    /** Secondary body position (calculated if not provided) */
    secondaryPosition?: THREE.Vector3 | [number, number, number];
}
/**
 * Lagrange point data
 */
export interface LagrangePointData {
    /** Point type */
    type: LagrangePointType;
    /** Position in 3D space */
    position: THREE.Vector3;
    /** Stability (true for L4/L5, false for L1/L2/L3) */
    stable: boolean;
    /** Distance from primary body (km) */
    distanceFromPrimary: number;
    /** Distance from secondary body (km) */
    distanceFromSecondary: number;
}
export declare const L1_COLOR = "#ff0000";
export declare const L2_COLOR = "#ff9900";
export declare const L3_COLOR = "#ffff00";
export declare const L4_COLOR = "#00ff00";
export declare const L5_COLOR = "#00ffff";
export declare const DEFAULT_POINT_SIZE = 200;
export declare const DEFAULT_SHOW_LABELS = true;
/**
 * Convert position to Vector3
 */
declare function toVector3(pos?: THREE.Vector3 | [number, number, number]): THREE.Vector3;
/**
 * Calculate mass ratio
 */
declare function calculateMassRatio(m1: number, m2: number): number;
/**
 * Calculate all Lagrange points for a two-body system
 */
declare function calculateAllLagrangePoints(system: TwoBodySystem, highPrecision?: boolean): LagrangePointData[];
/**
 * Get color for Lagrange point
 */
declare function getPointColor(type: LagrangePointType): string;
export interface LaGrangePointsRootProps {
    /** Two-body system configuration */
    system: TwoBodySystem;
    /** Which points to show (defaults to all) */
    showPoints?: LagrangePointType[];
    /** Point marker size */
    pointSize?: number;
    /** Show labels */
    showLabels?: boolean;
    /** Show stability indicators */
    showStability?: boolean;
    /** Show connecting lines to bodies */
    showConnectionLines?: boolean;
    /** Custom colors for points */
    colors?: Partial<Record<LagrangePointType, string>>;
    /** Show primary body marker */
    showPrimaryBody?: boolean;
    /** Show secondary body marker */
    showSecondaryBody?: boolean;
    /** Primary body size */
    primaryBodySize?: number;
    /** Secondary body size */
    secondaryBodySize?: number;
    /** Primary body color */
    primaryBodyColor?: string;
    /** Secondary body color */
    secondaryBodyColor?: string;
    /** Use high-precision Newton-Raphson solver (default: false) */
    highPrecision?: boolean;
}
/**
 * LaGrangePointsRoot - The base Lagrange points primitive component
 *
 * Renders L1-L5 Lagrange points for a two-body system.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <LaGrangePointsRoot
 *     system={{
 *       primaryMass: 5.972e24, // Earth
 *       secondaryMass: 7.342e22, // Moon
 *       distance: 384400, // km
 *     }}
 *     showPoints={["L1", "L2", "L4", "L5"]}
 *     showLabels
 *   />
 * </Canvas>
 * ```
 */
export declare const LaGrangePointsRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<LaGrangePointsRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>>;
export interface LaGrangePointsProps extends LaGrangePointsRootProps {
    /** Additional children to render */
    children?: React.ReactNode;
}
export declare const LaGrangePoints: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<LaGrangePointsProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>>;
/**
 * Utility functions for Lagrange point calculations
 */
export declare const LaGrangePointsUtils: {
    /**
     * Calculate all Lagrange points
     */
    calculateAllPoints: typeof calculateAllLagrangePoints;
    /**
     * Calculate mass ratio
     */
    calculateMassRatio: typeof calculateMassRatio;
    /**
     * Check if point is stable
     */
    isStable: (type: LagrangePointType) => boolean;
    /**
     * Get point color
     */
    getPointColor: typeof getPointColor;
    /**
     * Earth-Moon system preset
     */
    EarthMoonSystem: () => TwoBodySystem;
    /**
     * Sun-Earth system preset
     */
    SunEarthSystem: () => TwoBodySystem;
    /**
     * Earth-Sun L2 (JWST location) preset
     */
    JWSTSystem: () => TwoBodySystem;
    /**
     * Convert position to Vector3
     */
    toVector3: typeof toVector3;
};
export {};
//# sourceMappingURL=lagrange-points.d.ts.map