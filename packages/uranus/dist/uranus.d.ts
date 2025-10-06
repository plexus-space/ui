import * as THREE from "three";
/**
 * Uranus radius in scene units (relative to Earth)
 * @constant {number}
 */
export declare const URANUS_RADIUS = 4.01;
/**
 * Uranus actual radius in kilometers
 * @constant {number}
 */
export declare const URANUS_REAL_RADIUS_KM = 25362;
/**
 * Uranus rotation period in Earth days (17.2 hours - retrograde)
 * @constant {number}
 */
export declare const URANUS_ROTATION_PERIOD = 0.72;
/**
 * Uranus orbital period around the Sun in Earth days (84 years)
 * @constant {number}
 */
export declare const URANUS_ORBITAL_PERIOD = 30687;
/**
 * Props for the UranusSphereRoot component
 * @interface UranusSphereRootProps
 */
export interface UranusSphereRootProps {
    /** Radius of the Uranus sphere in scene units (default: URANUS_RADIUS) */
    radius?: number;
    /** URL to the Uranus surface texture (optional - uses cyan/blue fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Emissive color for the material (default: "#004466") */
    emissiveColor?: string;
    /** Material shininess value (default: 25) */
    shininess?: number;
}
/**
 * UranusSphereRoot - The base Uranus sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Uranus sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { UranusSphereRoot } from '@plexusui/uranus';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <UranusSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export declare const UranusSphereRoot: import("react").ForwardRefExoticComponent<UranusSphereRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
/**
 * Props for the UranusScene component
 * @interface UranusSceneProps
 */
export interface UranusSceneProps {
    /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 12.03]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view in degrees (default: 45) */
    cameraFov?: number;
    /** Minimum zoom distance from target (default: 6.015) */
    minDistance?: number;
    /** Maximum zoom distance from target (default: 80.2) */
    maxDistance?: number;
    /** Overall scene brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Child components to render within the scene */
    children?: React.ReactNode;
}
/**
 * UranusScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { UranusScene, UranusSphereRoot } from '@plexusui/uranus';
 *
 * function CustomUranus() {
 *   return (
 *     <UranusScene cameraPosition={[0, 0, 15]} brightness={1.5}>
 *       <UranusSphereRoot
 *         radius={4.01}
 *         textureUrl="/uranus.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 6, 0]}>
 *         <sphereGeometry args={[0.5, 32, 32]} />
 *         <meshStandardMaterial color="white" />
 *       </mesh>
 *     </UranusScene>
 *   );
 * }
 */
export declare const UranusScene: import("react").ForwardRefExoticComponent<UranusSceneProps & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Props for the main Uranus component
 * @interface UranusProps
 */
export interface UranusProps {
    /** URL to the Uranus surface texture (optional - uses cyan/blue fallback) */
    textureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Custom child components to render in the scene */
    children?: React.ReactNode;
    /** Camera position [x, y, z] (default: [0, 0, 12.03]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view (default: 45) */
    cameraFov?: number;
    /** Minimum camera zoom distance (default: 6.015) */
    minDistance?: number;
    /** Maximum camera zoom distance (default: 80.2) */
    maxDistance?: number;
}
export declare const Uranus: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<UranusProps & import("react").RefAttributes<HTMLDivElement>>>;
//# sourceMappingURL=uranus.d.ts.map