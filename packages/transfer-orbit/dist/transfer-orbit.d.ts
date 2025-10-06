import * as THREE from "three";
export type TransferType = "hohmann" | "bi-elliptic";
/**
 * Transfer orbit configuration
 */
export interface TransferOrbitConfig {
    /** Initial orbit radius (km) */
    initialRadius: number;
    /** Final orbit radius (km) */
    finalRadius: number;
    /** Transfer type */
    type?: TransferType;
    /** Intermediate radius for bi-elliptic (km) */
    intermediateRadius?: number;
    /** Gravitational parameter (km³/s²) - default is Earth's */
    mu?: number;
}
/**
 * Calculated transfer orbit data
 */
export interface TransferOrbitData {
    /** Initial circular orbit */
    initialOrbit: THREE.Vector3[];
    /** Final circular orbit */
    finalOrbit: THREE.Vector3[];
    /** Transfer orbit path(s) */
    transferPaths: THREE.Vector3[][];
    /** Burn locations */
    burns: {
        position: THREE.Vector3;
        deltaV: number;
        label: string;
    }[];
    /** Total delta-V (m/s) */
    totalDeltaV: number;
    /** Transfer time (seconds) */
    transferTime: number;
}
export declare const DEFAULT_MU = 398600;
export declare const DEFAULT_INITIAL_COLOR = "#00ff00";
export declare const DEFAULT_FINAL_COLOR = "#0000ff";
export declare const DEFAULT_TRANSFER_COLOR = "#ffff00";
export declare const DEFAULT_BURN_COLOR = "#ff0000";
export declare const DEFAULT_SEGMENTS = 128;
/**
 * Calculate orbital velocity at radius
 */
declare function orbitalVelocity(radius: number, mu: number): number;
export interface TransferOrbitRootProps {
    /** Transfer orbit configuration */
    config: TransferOrbitConfig;
    /** Number of segments for smoothness */
    segments?: number;
    /** Initial orbit color */
    initialColor?: string;
    /** Final orbit color */
    finalColor?: string;
    /** Transfer orbit color */
    transferColor?: string;
    /** Burn marker color */
    burnColor?: string;
    /** Show burn markers */
    showBurns?: boolean;
    /** Burn marker size */
    burnSize?: number;
    /** Show orbit labels */
    showLabels?: boolean;
    /** Line width */
    lineWidth?: number;
}
/**
 * TransferOrbitRoot - The base transfer orbit primitive component
 *
 * Renders Hohmann or bi-elliptic transfer orbits with burn markers.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <TransferOrbitRoot
 *     config={{
 *       initialRadius: 7000,
 *       finalRadius: 42164,
 *       type: "hohmann"
 *     }}
 *     showBurns
 *   />
 * </Canvas>
 * ```
 */
export declare const TransferOrbitRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<TransferOrbitRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>>;
export interface TransferOrbitProps extends TransferOrbitRootProps {
    /** Additional children to render */
    children?: React.ReactNode;
}
export declare const TransferOrbit: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<TransferOrbitProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>>;
/**
 * Utility functions for transfer orbit calculations
 */
export declare const TransferOrbitUtils: {
    /**
     * Calculate Hohmann transfer delta-V
     */
    calculateHohmannDeltaV: (r1: number, r2: number, mu?: number) => number;
    /**
     * Calculate bi-elliptic transfer delta-V
     */
    calculateBiEllipticDeltaV: (r1: number, r2: number, rb: number, mu?: number) => number;
    /**
     * Compare Hohmann vs bi-elliptic efficiency
     */
    compareTransfers: (r1: number, r2: number, rb: number, mu?: number) => {
        hohmann: number;
        biElliptic: number;
        recommendation: "hohmann" | "bi-elliptic";
    };
    /**
     * Calculate optimal intermediate radius for bi-elliptic
     * (Simplified - uses 1.5x the larger orbit as heuristic)
     */
    calculateOptimalIntermediateRadius: (r1: number, r2: number) => number;
    /**
     * Calculate orbital velocity
     */
    orbitalVelocity: typeof orbitalVelocity;
    /**
     * Generate transfer orbit data
     */
    generateTransferData: (config: TransferOrbitConfig, segments?: number) => TransferOrbitData;
};
export {};
//# sourceMappingURL=transfer-orbit.d.ts.map