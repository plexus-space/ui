import * as THREE from "three";
/**
 * Moon radius in scene units (relative to Earth)
 * @constant {number}
 */
export declare const MOON_RADIUS = 0.273;
/**
 * Moon actual radius in kilometers
 * @constant {number}
 */
export declare const MOON_REAL_RADIUS_KM = 1737.4;
/**
 * Moon rotation period in Earth days (tidally locked)
 * @constant {number}
 */
export declare const MOON_ROTATION_PERIOD = 27.3;
/**
 * Moon orbital period around Earth in Earth days
 * @constant {number}
 */
export declare const MOON_ORBITAL_PERIOD = 27.3;
/**
 * Props for the MoonSphereRoot component
 * @interface MoonSphereRootProps
 */
export interface MoonSphereRootProps {
    /** Radius of the Moon sphere in scene units (default: MOON_RADIUS) */
    radius?: number;
    /** URL to the Moon surface texture (optional - uses gray fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Emissive color for the material (default: "#0a0a0a") */
    emissiveColor?: string;
    /** Material shininess value (default: 1) */
    shininess?: number;
}
/**
 * MoonSphereRoot - The base Moon sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Moon sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { MoonSphereRoot } from '@plexusui/moon';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <MoonSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export declare const MoonSphereRoot: import("react").ForwardRefExoticComponent<MoonSphereRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
/**
 * Props for the MoonScene component
 * @interface MoonSceneProps
 */
export interface MoonSceneProps {
    /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 0.819]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view in degrees (default: 45) */
    cameraFov?: number;
    /** Minimum zoom distance from target (default: 0.41) */
    minDistance?: number;
    /** Maximum zoom distance from target (default: 5.46) */
    maxDistance?: number;
    /** Overall scene brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Child components to render within the scene */
    children?: React.ReactNode;
}
/**
 * MoonScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { MoonScene, MoonSphereRoot } from '@plexusui/moon';
 *
 * function CustomMoon() {
 *   return (
 *     <MoonScene cameraPosition={[0, 0, 0.819]} brightness={1.5}>
 *       <MoonSphereRoot
 *         radius={0.273}
 *         textureUrl="/moon.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 0.4, 0]}>
 *         <sphereGeometry args={[0.05, 32, 32]} />
 *         <meshStandardMaterial color="red" />
 *       </mesh>
 *     </MoonScene>
 *   );
 * }
 *
 * @param props - Configuration props for the scene
 * @param ref - Forward ref to the container div element
 * @returns A complete Three.js scene ready to render
 */
export declare const MoonScene: import("react").ForwardRefExoticComponent<MoonSceneProps & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Props for the main Moon component
 * @interface MoonProps
 */
export interface MoonProps {
    /** URL to the Moon surface texture (optional - uses gray fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Custom child components to render in the scene */
    children?: React.ReactNode;
    /** Camera position [x, y, z] (default: [0, 0, 0.819]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view (default: 45) */
    cameraFov?: number;
    /** Minimum camera zoom distance (default: 0.41) */
    minDistance?: number;
    /** Maximum camera zoom distance (default: 5.46) */
    maxDistance?: number;
}
export declare const Moon: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<MoonProps & import("react").RefAttributes<HTMLDivElement>>>;
//# sourceMappingURL=moon.d.ts.map