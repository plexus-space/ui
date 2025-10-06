import * as THREE from "three";
/**
 * Waypoint along a trajectory
 */
export interface Waypoint {
    /** Position in 3D space */
    position: THREE.Vector3 | [number, number, number];
    /** Optional waypoint name/label */
    name?: string;
    /** Optional timestamp */
    timestamp?: number;
    /** Optional velocity at waypoint (km/s) */
    velocity?: THREE.Vector3 | [number, number, number];
}
/**
 * Burn/maneuver marker
 */
export interface BurnMarker {
    /** Position in 3D space */
    position: THREE.Vector3 | [number, number, number];
    /** Delta-V magnitude (m/s) */
    deltaV: number;
    /** Delta-V direction vector */
    direction?: THREE.Vector3 | [number, number, number];
    /** Burn duration (seconds) */
    duration?: number;
    /** Burn type */
    type?: "prograde" | "retrograde" | "normal" | "radial" | "custom";
    /** Optional label */
    label?: string;
}
export declare const DEFAULT_TRAJECTORY_COLOR = "#00ffff";
export declare const DEFAULT_WAYPOINT_COLOR = "#ffffff";
export declare const DEFAULT_BURN_COLOR = "#ff9900";
export declare const DEFAULT_LINE_WIDTH = 2;
export declare const DEFAULT_WAYPOINT_SIZE = 100;
export declare const DEFAULT_BURN_SIZE = 150;
export declare const BURN_TYPE_COLORS: {
    prograde: string;
    retrograde: string;
    normal: string;
    radial: string;
    custom: string;
};
/**
 * Convert position array to Vector3 if needed
 */
declare function toVector3(pos: THREE.Vector3 | [number, number, number]): THREE.Vector3;
/**
 * Calculate total delta-V budget
 */
declare function calculateTotalDeltaV(burns: BurnMarker[]): number;
export interface TrajectoryRootProps {
    /** Waypoints defining the trajectory */
    waypoints: Waypoint[];
    /** Burn/maneuver markers */
    burns?: BurnMarker[];
    /** Trajectory line color */
    color?: string;
    /** Line width */
    lineWidth?: number;
    /** Show waypoint markers */
    showWaypoints?: boolean;
    /** Waypoint marker size */
    waypointSize?: number;
    /** Waypoint marker color */
    waypointColor?: string;
    /** Show burn markers */
    showBurns?: boolean;
    /** Burn marker size */
    burnSize?: number;
    /** Burn marker color (overrides type colors) */
    burnColor?: string;
    /** Show delta-V vectors */
    showDeltaVVectors?: boolean;
    /** Delta-V vector scale */
    deltaVScale?: number;
    /** Use smooth curve (Catmull-Rom spline) */
    smoothCurve?: boolean;
    /** Number of segments for smooth curve */
    curveSegments?: number;
    /** Show waypoint labels */
    showLabels?: boolean;
    /** Animated path drawing */
    animated?: boolean;
    /** Animation progress (0-1) */
    animationProgress?: number;
}
/**
 * TrajectoryRoot - The base trajectory primitive component
 *
 * Renders flight paths with waypoints and burn markers.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <TrajectoryRoot
 *     waypoints={[
 *       { position: [0, 0, 0] },
 *       { position: [1000, 500, 0] },
 *       { position: [2000, 0, 0] },
 *     ]}
 *     burns={[
 *       { position: [1000, 500, 0], deltaV: 250, type: "prograde" }
 *     ]}
 *     showWaypoints
 *     showBurns
 *   />
 * </Canvas>
 * ```
 */
export declare const TrajectoryRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<TrajectoryRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>>;
export interface TrajectoryProps extends TrajectoryRootProps {
    /** Additional children to render */
    children?: React.ReactNode;
}
export declare const Trajectory: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<TrajectoryProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>>;
/**
 * Utility functions for trajectory calculations
 */
export declare const TrajectoryUtils: {
    /**
     * Calculate total delta-V budget
     */
    calculateTotalDeltaV: typeof calculateTotalDeltaV;
    /**
     * Calculate trajectory length
     */
    calculateLength: (waypoints: Waypoint[]) => number;
    /**
     * Calculate trajectory duration (if timestamps provided)
     */
    calculateDuration: (waypoints: Waypoint[]) => number | null;
    /**
     * Interpolate position along trajectory at given progress (0-1)
     */
    interpolatePosition: (waypoints: Waypoint[], progress: number) => THREE.Vector3 | null;
    /**
     * Create Hohmann transfer waypoints
     */
    createHohmannTransfer: (r1: number, r2: number, steps?: number) => Waypoint[];
    /**
     * Validate waypoint
     */
    validateWaypoint: (waypoint: Waypoint) => boolean;
    /**
     * Convert position array to Vector3
     */
    toVector3: typeof toVector3;
};
export {};
//# sourceMappingURL=trajectory.d.ts.map