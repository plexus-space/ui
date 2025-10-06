import * as THREE from "three";
/**
 * Jupiter radius in kilometers
 * @constant {number}
 */
export declare const JUPITER_RADIUS = 69911;
/**
 * Jupiter actual radius in kilometers (same as JUPITER_RADIUS)
 * @constant {number}
 */
export declare const JUPITER_REAL_RADIUS_KM = 69911;
/**
 * Jupiter diameter in kilometers
 * @constant {number}
 */
export declare const JUPITER_DIAMETER_KM = 139822;
/**
 * Jupiter rotation period in Earth days (9.9 hours - fastest rotation in solar system)
 * @constant {number}
 */
export declare const JUPITER_ROTATION_PERIOD = 0.41;
/**
 * Jupiter orbital period around the Sun in Earth days
 * @constant {number}
 */
export declare const JUPITER_ORBITAL_PERIOD = 4333;
/**
 * Props for the JupiterSphereRoot component
 * @interface JupiterSphereRootProps
 */
export interface JupiterSphereRootProps {
    /** Radius of the Jupiter sphere in scene units (default: JUPITER_RADIUS) */
    radius?: number;
    /** URL to the Jupiter surface texture (optional - uses tan/orange fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.1) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Emissive color for the material (default: "#221100") */
    emissiveColor?: string;
    /** Material shininess value (default: 20) */
    shininess?: number;
}
/**
 * JupiterSphereRoot - The base Jupiter sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Jupiter sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { JupiterSphereRoot } from '@plexusui/jupiter';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <JupiterSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export declare const JupiterSphereRoot: import("react").ForwardRefExoticComponent<JupiterSphereRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
/**
 * Props for the JupiterScene component
 * @interface JupiterSceneProps
 */
export interface JupiterSceneProps {
    /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 33.63]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view in degrees (default: 45) */
    cameraFov?: number;
    /** Minimum zoom distance from target (default: 16.815) */
    minDistance?: number;
    /** Maximum zoom distance from target (default: 224.2) */
    maxDistance?: number;
    /** Overall scene brightness multiplier (default: 1.1) */
    brightness?: number;
    /** Child components to render within the scene */
    children?: React.ReactNode;
}
/**
 * JupiterScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { JupiterScene, JupiterSphereRoot } from '@plexusui/jupiter';
 *
 * function CustomJupiter() {
 *   return (
 *     <JupiterScene cameraPosition={[0, 0, 40]} brightness={1.3}>
 *       <JupiterSphereRoot
 *         radius={11.21}
 *         textureUrl="/jupiter.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 15, 0]}>
 *         <sphereGeometry args={[2, 32, 32]} />
 *         <meshStandardMaterial color="white" />
 *       </mesh>
 *     </JupiterScene>
 *   );
 * }
 */
export declare const JupiterScene: import("react").ForwardRefExoticComponent<JupiterSceneProps & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Props for the main Jupiter component
 * @interface JupiterProps
 */
export interface JupiterProps {
    /** URL to the Jupiter surface texture (optional - uses tan/orange fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.1) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Custom child components to render in the scene */
    children?: React.ReactNode;
    /** Camera position [x, y, z] (default: [0, 0, 33.63]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view (default: 45) */
    cameraFov?: number;
    /** Minimum camera zoom distance (default: 16.815) */
    minDistance?: number;
    /** Maximum camera zoom distance (default: 224.2) */
    maxDistance?: number;
}
/**
 * Jupiter - Memoized Jupiter component for optimal performance
 *
 * This is the main export. The component is memoized to prevent
 * unnecessary re-renders when parent components update.
 */
export declare const Jupiter: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<JupiterProps & import("react").RefAttributes<HTMLDivElement>>>;
//# sourceMappingURL=jupiter.d.ts.map