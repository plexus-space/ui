"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, useRef, memo, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
// ============================================================================
// Constants
// ============================================================================
/**
 * Venus radius in scene units (relative to Earth)
 * @constant {number}
 */
export const VENUS_RADIUS = 0.949; // Relative to Earth (6,051.8 km actual)
/**
 * Venus actual radius in kilometers
 * @constant {number}
 */
export const VENUS_REAL_RADIUS_KM = 6051.8;
/**
 * Venus rotation period in Earth days (243 days - retrograde rotation)
 * @constant {number}
 */
export const VENUS_ROTATION_PERIOD = 243; // Earth days (retrograde)
/**
 * Venus orbital period around the Sun in Earth days
 * @constant {number}
 */
export const VENUS_ORBITAL_PERIOD = 224.7; // Earth days
const VenusSphere = memo(function VenusSphere({ radius, textureUrl, brightness, enableRotation, emissiveColor, shininess, }) {
    const meshRef = useRef(null);
    const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
    useFrame(() => {
        if (meshRef.current && enableRotation) {
            // Very slow retrograde rotation (backwards)
            meshRef.current.rotation.y -= 0.00005;
        }
    });
    return (_jsxs("mesh", { ref: meshRef, children: [_jsx("sphereGeometry", { args: [radius, 64, 32] }), texture ? (_jsx("meshPhongMaterial", { map: texture, shininess: shininess, emissive: emissiveColor, emissiveIntensity: 0.15 * brightness })) : (_jsx("meshPhongMaterial", { color: "#ffc649", shininess: shininess, emissive: emissiveColor, emissiveIntensity: 0.15 * brightness }))] }));
});
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
export const VenusSphereRoot = forwardRef(({ radius = VENUS_RADIUS, textureUrl, brightness = 1.2, enableRotation = true, emissiveColor = "#ff9944", shininess = 30, }, ref) => {
    return (_jsx("group", { ref: ref, children: _jsx(VenusSphere, { radius: radius, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation, emissiveColor: emissiveColor, shininess: shininess }) }));
});
VenusSphereRoot.displayName = "VenusSphereRoot";
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
export const VenusScene = forwardRef(({ cameraPosition = [0, 0, 2.847], cameraFov = 45, minDistance = 1.4235, maxDistance = 18.98, brightness = 1.2, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { camera: { position: cameraPosition, fov: cameraFov }, gl: { antialias: true }, children: [_jsx("color", { attach: "background", args: [0, 0, 0] }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.8 * brightness }), _jsx("directionalLight", { position: [5, 3, 5], intensity: 1.5 * brightness }), _jsx(OrbitControls, { enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05 }), children] })] }) }));
});
VenusScene.displayName = "VenusScene";
/**
 * Venus - The main composed Venus component
 *
 * A fully pre-configured Venus visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Venus } from '@plexusui/venus';
 *
 * function App() {
 *   return <Venus />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Venus textureUrl="/textures/venus.jpg" />;
 * }
 */
const VenusComponent = forwardRef(({ textureUrl, brightness = 1.2, enableRotation = true, children, cameraPosition = [0, 0, 2.847], cameraFov = 45, minDistance = 1.4235, maxDistance = 18.98, }, ref) => {
    return (_jsxs(VenusScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, brightness: brightness, children: [_jsx(VenusSphereRoot, { radius: VENUS_RADIUS, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation }), children] }));
});
VenusComponent.displayName = "Venus";
export const Venus = memo(VenusComponent);
//# sourceMappingURL=venus.js.map