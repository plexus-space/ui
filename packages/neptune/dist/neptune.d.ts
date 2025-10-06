import * as THREE from "three";
/**
 * Neptune radius in scene units (relative to Earth)
 * @constant {number}
 */
export declare const NEPTUNE_RADIUS = 3.88;
/**
 * Neptune actual radius in kilometers
 * @constant {number}
 */
export declare const NEPTUNE_REAL_RADIUS_KM = 24622;
/**
 * Neptune rotation period in Earth days (16 hours)
 * @constant {number}
 */
export declare const NEPTUNE_ROTATION_PERIOD = 0.67;
/**
 * Neptune orbital period around the Sun in Earth days (164.8 years)
 * @constant {number}
 */
export declare const NEPTUNE_ORBITAL_PERIOD = 60190;
/**
 * Props for the NeptuneSphereRoot component
 * @interface NeptuneSphereRootProps
 */
export interface NeptuneSphereRootProps {
    /** Radius of the Neptune sphere in scene units (default: NEPTUNE_RADIUS) */
    radius?: number;
    /** URL to the Neptune surface texture (optional - uses deep blue fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Emissive color for the material (default: "#001166") */
    emissiveColor?: string;
    /** Material shininess value (default: 30) */
    shininess?: number;
}
/**
 * NeptuneSphereRoot - The base Neptune sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Neptune sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { NeptuneSphereRoot } from '@plexusui/neptune';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <NeptuneSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export declare const NeptuneSphereRoot: import("react").ForwardRefExoticComponent<NeptuneSphereRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
/**
 * Props for the NeptuneScene component
 * @interface NeptuneSceneProps
 */
export interface NeptuneSceneProps {
    /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 11.64]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view in degrees (default: 45) */
    cameraFov?: number;
    /** Minimum zoom distance from target (default: 5.82) */
    minDistance?: number;
    /** Maximum zoom distance from target (default: 77.6) */
    maxDistance?: number;
    /** Overall scene brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Child components to render within the scene */
    children?: React.ReactNode;
}
/**
 * NeptuneScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { NeptuneScene, NeptuneSphereRoot } from '@plexusui/neptune';
 *
 * function CustomNeptune() {
 *   return (
 *     <NeptuneScene cameraPosition={[0, 0, 11.64]} brightness={1.5}>
 *       <NeptuneSphereRoot
 *         radius={3.88}
 *         textureUrl="/neptune.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 5, 0]}>
 *         <sphereGeometry args={[0.5, 32, 32]} />
 *         <meshStandardMaterial color="white" />
 *       </mesh>
 *     </NeptuneScene>
 *   );
 * }
 *
 * @param props - Configuration props for the scene
 * @param ref - Forward ref to the container div element
 * @returns A complete Three.js scene ready to render
 */
export declare const NeptuneScene: import("react").ForwardRefExoticComponent<NeptuneSceneProps & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Props for the main Neptune component
 * @interface NeptuneProps
 */
export interface NeptuneProps {
    /** URL to the Neptune surface texture (optional - uses deep blue fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.3) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Custom child components to render in the scene */
    children?: React.ReactNode;
    /** Camera position [x, y, z] (default: [0, 0, 11.64]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view (default: 45) */
    cameraFov?: number;
    /** Minimum camera zoom distance (default: 5.82) */
    minDistance?: number;
    /** Maximum camera zoom distance (default: 77.6) */
    maxDistance?: number;
}
/**
 * Neptune - Memoized Neptune component for optimal performance
 *
 * This is the main export. The component is memoized to prevent
 * unnecessary re-renders when parent components update.
 */
export declare const Neptune: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<NeptuneProps & import("react").RefAttributes<HTMLDivElement>>>;
//# sourceMappingURL=neptune.d.ts.map