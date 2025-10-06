import * as THREE from "three";
/**
 * Venus radius in scene units (relative to Earth)
 * @constant {number}
 */
export declare const VENUS_RADIUS = 0.949;
/**
 * Venus actual radius in kilometers
 * @constant {number}
 */
export declare const VENUS_REAL_RADIUS_KM = 6051.8;
/**
 * Venus rotation period in Earth days (243 days - retrograde rotation)
 * @constant {number}
 */
export declare const VENUS_ROTATION_PERIOD = 243;
/**
 * Venus orbital period around the Sun in Earth days
 * @constant {number}
 */
export declare const VENUS_ORBITAL_PERIOD = 224.7;
/**
 * Props for the VenusSphereRoot component
 * @interface VenusSphereRootProps
 */
export interface VenusSphereRootProps {
    /** Radius of the Venus sphere in scene units (default: VENUS_RADIUS) */
    radius?: number;
    /** URL to the Venus surface texture (optional - uses yellow-orange fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Emissive color for the material (default: "#ff9944") */
    emissiveColor?: string;
    /** Material shininess value (default: 30) */
    shininess?: number;
}
/**
 * VenusSphereRoot - The base Venus sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Venus sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { VenusSphereRoot } from '@plexusui/venus';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <VenusSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export declare const VenusSphereRoot: import("react").ForwardRefExoticComponent<VenusSphereRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
/**
 * Props for the VenusScene component
 * @interface VenusSceneProps
 */
export interface VenusSceneProps {
    /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 2.847]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view in degrees (default: 45) */
    cameraFov?: number;
    /** Minimum zoom distance from target (default: 1.4235) */
    minDistance?: number;
    /** Maximum zoom distance from target (default: 18.98) */
    maxDistance?: number;
    /** Overall scene brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Child components to render within the scene */
    children?: React.ReactNode;
}
/**
 * VenusScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { VenusScene, VenusSphereRoot } from '@plexusui/venus';
 *
 * function CustomVenus() {
 *   return (
 *     <VenusScene cameraPosition={[0, 0, 2.847]} brightness={1.5}>
 *       <VenusSphereRoot
 *         radius={0.949}
 *         textureUrl="/venus.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[2, 0, 0]}>
 *         <sphereGeometry args={[0.1, 32, 32]} />
 *         <meshStandardMaterial color="red" />
 *       </mesh>
 *     </VenusScene>
 *   );
 * }
 *
 * @param props - Configuration props for the scene
 * @param ref - Forward ref to the container div element
 * @returns A complete Three.js scene ready to render
 */
export declare const VenusScene: import("react").ForwardRefExoticComponent<VenusSceneProps & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Props for the main Venus component
 * @interface VenusProps
 */
export interface VenusProps {
    /** URL to the Venus surface texture (optional - uses yellow-orange fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Custom child components to render in the scene */
    children?: React.ReactNode;
    /** Camera position [x, y, z] (default: [0, 0, 2.847]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view (default: 45) */
    cameraFov?: number;
    /** Minimum camera zoom distance (default: 1.4235) */
    minDistance?: number;
    /** Maximum camera zoom distance (default: 18.98) */
    maxDistance?: number;
}
export declare const Venus: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<VenusProps & import("react").RefAttributes<HTMLDivElement>>>;
//# sourceMappingURL=venus.d.ts.map