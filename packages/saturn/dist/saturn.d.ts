import * as THREE from "three";
/**
 * Saturn radius in kilometers
 * @constant {number}
 */
export declare const SATURN_RADIUS = 58232;
/**
 * Saturn actual radius in kilometers (same as SATURN_RADIUS)
 * @constant {number}
 */
export declare const SATURN_REAL_RADIUS_KM = 58232;
/**
 * Saturn diameter in kilometers
 * @constant {number}
 */
export declare const SATURN_DIAMETER_KM = 116464;
/**
 * Saturn rotation period in Earth days (10.7 hours)
 * @constant {number}
 */
export declare const SATURN_ROTATION_PERIOD = 0.45;
/**
 * Saturn orbital period around the Sun in Earth days (29.5 years)
 * @constant {number}
 */
export declare const SATURN_ORBITAL_PERIOD = 10759;
/**
 * Saturn's ring system inner radius in kilometers (D ring inner edge)
 * @constant {number}
 */
export declare const SATURN_RINGS_INNER = 66900;
/**
 * Saturn's ring system outer radius in kilometers (A ring outer edge)
 * @constant {number}
 */
export declare const SATURN_RINGS_OUTER = 136780;
/**
 * Props for the SaturnSphereRoot component
 * @interface SaturnSphereRootProps
 */
export interface SaturnSphereRootProps {
    /** Radius of the Saturn sphere in scene units (default: SATURN_RADIUS) */
    radius?: number;
    /** URL to the Saturn surface texture (optional - uses pale gold fallback) */
    textureUrl?: string;
    /** URL to the rings texture (optional - uses beige fallback) */
    ringsTextureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Emissive color for the material (default: "#221100") */
    emissiveColor?: string;
    /** Material shininess value (default: 15) */
    shininess?: number;
    /** Show Saturn's iconic ring system (default: true) */
    showRings?: boolean;
}
/**
 * SaturnSphereRoot - The base Saturn sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Saturn sphere with optional texture, materials, and rings.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { SaturnSphereRoot } from '@plexusui/saturn';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <SaturnSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export declare const SaturnSphereRoot: import("react").ForwardRefExoticComponent<SaturnSphereRootProps & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
/**
 * Props for the SaturnScene component
 * @interface SaturnSceneProps
 */
export interface SaturnSceneProps {
    /** Initial camera position in 3D space [x, y, z] (default: [0, 0, 28.35]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view in degrees (default: 45) */
    cameraFov?: number;
    /** Minimum zoom distance from target (default: 14.175) */
    minDistance?: number;
    /** Maximum zoom distance from target (default: 189) */
    maxDistance?: number;
    /** Overall scene brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Child components to render within the scene */
    children?: React.ReactNode;
}
/**
 * SaturnScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { SaturnScene, SaturnSphereRoot } from '@plexusui/saturn';
 *
 * function CustomSaturn() {
 *   return (
 *     <SaturnScene cameraPosition={[0, 0, 30]} brightness={1.5}>
 *       <SaturnSphereRoot
 *         radius={9.45}
 *         textureUrl="/saturn.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 15, 0]}>
 *         <sphereGeometry args={[1, 32, 32]} />
 *         <meshStandardMaterial color="white" />
 *       </mesh>
 *     </SaturnScene>
 *   );
 * }
 *
 * @param props - Configuration props for the scene
 * @param ref - Forward ref to the container div element
 * @returns A complete Three.js scene ready to render
 */
export declare const SaturnScene: import("react").ForwardRefExoticComponent<SaturnSceneProps & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Props for the main Saturn component
 * @interface SaturnProps
 */
export interface SaturnProps {
    /** URL to the Saturn surface texture (optional - uses pale gold fallback) */
    textureUrl?: string;
    /** URL to the rings texture (optional - uses beige fallback) */
    ringsTextureUrl?: string;
    /** Overall brightness multiplier (default: 1.2) */
    brightness?: number;
    /** Enable automatic rotation (default: true) */
    enableRotation?: boolean;
    /** Show Saturn's iconic ring system (default: true) */
    showRings?: boolean;
    /** Custom child components to render in the scene */
    children?: React.ReactNode;
    /** Camera position [x, y, z] (default: [0, 0, 28.35]) */
    cameraPosition?: [number, number, number];
    /** Camera field of view (default: 45) */
    cameraFov?: number;
    /** Minimum camera zoom distance (default: 20) */
    minDistance?: number;
    /** Maximum camera zoom distance (default: 80) */
    maxDistance?: number;
}
/**
 * Saturn - Memoized Saturn component for optimal performance
 *
 * This is the main export. The component is memoized to prevent
 * unnecessary re-renders when parent components update.
 */
export declare const Saturn: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<SaturnProps & import("react").RefAttributes<HTMLDivElement>>>;
//# sourceMappingURL=saturn.d.ts.map