import * as THREE from "three";
/**
 * Mars radius in kilometers
 * @constant {number}
 */
export declare const MARS_RADIUS = 3389.5;
/**
 * Mars actual radius in kilometers (same as MARS_RADIUS)
 * @constant {number}
 */
export declare const MARS_REAL_RADIUS_KM = 3389.5;
/**
 * Mars diameter in kilometers
 * @constant {number}
 */
export declare const MARS_DIAMETER_KM = 6779;
/**
 * Mars rotation period in Earth days (24.6 hours)
 * @constant {number}
 */
export declare const MARS_ROTATION_PERIOD = 1.03;
/**
 * Mars orbital period around the Sun in Earth days
 * @constant {number}
 */
export declare const MARS_ORBITAL_PERIOD = 687;
/**
 * Props for the MarsSphereRoot component
 * @interface MarsSphereRootProps
 */
export interface MarsSphereRootProps {
    /** Radius of the Mars sphere in scene units (default: MARS_RADIUS) */
    radius?: number;
    /** URL to the Mars surface texture (optional - uses reddish-brown fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Emissive color for the material (default: "#331100") */
    emissiveColor?: string;
    /** Material shininess value (default: 5) */
    shininess?: number;
}
/**
 * MarsSphereRoot - The base Mars sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Mars sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { MarsSphereRoot } from '@plexusui/mars';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <MarsSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export declare const MarsSphereRoot: import("react").ForwardRefExoticComponent<MarsSphereRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
/**
 * MarsScene - The Three.js scene primitive
 */
export interface MarsSceneProps {
    cameraPosition?: [number, number, number];
    cameraFov?: number;
    minDistance?: number;
    maxDistance?: number;
    brightness?: number;
    children?: React.ReactNode;
}
export declare const MarsScene: import("react").ForwardRefExoticComponent<MarsSceneProps & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Props for the main Mars component
 * @interface MarsProps
 */
export interface MarsProps {
    /** URL to the Mars surface texture (optional - uses reddish-brown fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Custom child components to render in the scene */
    children?: React.ReactNode;
    /** Camera position [x, y, z] (default: [0, 0, 1.596]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view (default: 45) */
    cameraFov?: number;
    /** Minimum camera zoom distance (default: 1.0) */
    minDistance?: number;
    /** Maximum camera zoom distance (default: 12) */
    maxDistance?: number;
}
export declare const Mars: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<MarsProps & import("react").RefAttributes<HTMLDivElement>>>;
//# sourceMappingURL=mars.d.ts.map