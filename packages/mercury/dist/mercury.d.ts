import * as THREE from "three";
/**
 * Mercury radius in scene units (relative to Earth)
 * @constant {number}
 */
export declare const MERCURY_RADIUS = 0.383;
/**
 * Mercury actual radius in kilometers
 * @constant {number}
 */
export declare const MERCURY_REAL_RADIUS_KM = 2439.7;
/**
 * Mercury rotation period in Earth days (58.6 days)
 * @constant {number}
 */
export declare const MERCURY_ROTATION_PERIOD = 58.6;
/**
 * Mercury orbital period around the Sun in Earth days
 * @constant {number}
 */
export declare const MERCURY_ORBITAL_PERIOD = 88;
/**
 * Props for the MercurySphereRoot component
 * @interface MercurySphereRootProps
 */
export interface MercurySphereRootProps {
    /** Radius of the Mercury sphere in scene units (default: MERCURY_RADIUS) */
    radius?: number;
    /** URL to the Mercury surface texture (optional - uses gray-brown fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Emissive color for the material (default: "#111111") */
    emissiveColor?: string;
    /** Material shininess value (default: 5) */
    shininess?: number;
}
/**
 * MercurySphereRoot - The base Mercury sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Mercury sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { MercurySphereRoot } from '@plexusui/mercury';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <MercurySphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export declare const MercurySphereRoot: import("react").ForwardRefExoticComponent<MercurySphereRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
/**
 * MercuryScene - The Three.js scene primitive
 */
export interface MercurySceneProps {
    cameraPosition?: [number, number, number];
    cameraFov?: number;
    minDistance?: number;
    maxDistance?: number;
    brightness?: number;
    children?: React.ReactNode;
}
export declare const MercuryScene: import("react").ForwardRefExoticComponent<MercurySceneProps & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Props for the main Mercury component
 * @interface MercuryProps
 */
export interface MercuryProps {
    /** URL to the Mercury surface texture (optional - uses gray-brown fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Custom child components to render in the scene */
    children?: React.ReactNode;
    /** Camera position [x, y, z] (default: [0, 0, 1.149]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view (default: 45) */
    cameraFov?: number;
    /** Minimum camera zoom distance (default: 0.5745) */
    minDistance?: number;
    /** Maximum camera zoom distance (default: 7.66) */
    maxDistance?: number;
}
export declare const Mercury: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<MercuryProps & import("react").RefAttributes<HTMLDivElement>>>;
//# sourceMappingURL=mercury.d.ts.map