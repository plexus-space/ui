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
 * Uranus radius in scene units (relative to Earth)
 * @constant {number}
 */
export const URANUS_RADIUS = 4.01; // Relative to Earth (25,362 km actual)
/**
 * Uranus actual radius in kilometers
 * @constant {number}
 */
export const URANUS_REAL_RADIUS_KM = 25362;
/**
 * Uranus rotation period in Earth days (17.2 hours - retrograde)
 * @constant {number}
 */
export const URANUS_ROTATION_PERIOD = 0.72;
/**
 * Uranus orbital period around the Sun in Earth days (84 years)
 * @constant {number}
 */
export const URANUS_ORBITAL_PERIOD = 30687;
const UranusSphere = memo(function UranusSphere({ radius, textureUrl, brightness, enableRotation, emissiveColor, shininess, }) {
    const meshRef = useRef(null);
    const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
    useFrame(() => {
        if (meshRef.current && enableRotation) {
            // Retrograde rotation (tilted on its side)
            meshRef.current.rotation.y -= 0.0015;
        }
    });
    return (_jsxs("mesh", { ref: meshRef, rotation: [0, 0, Math.PI / 2.2], children: [_jsx("sphereGeometry", { args: [radius, 64, 32] }), texture ? (_jsx("meshPhongMaterial", { map: texture, shininess: shininess, emissive: emissiveColor, emissiveIntensity: 0.12 * brightness })) : (_jsx("meshPhongMaterial", { color: "#4fd0e7", shininess: shininess, emissive: emissiveColor, emissiveIntensity: 0.12 * brightness }))] }));
});
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
export const UranusSphereRoot = forwardRef(({ radius = URANUS_RADIUS, textureUrl, brightness = 1.2, enableRotation = true, emissiveColor = "#004466", shininess = 25, }, ref) => {
    return (_jsx("group", { ref: ref, children: _jsx(UranusSphere, { radius: radius, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation, emissiveColor: emissiveColor, shininess: shininess }) }));
});
UranusSphereRoot.displayName = "UranusSphereRoot";
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
export const UranusScene = forwardRef(({ cameraPosition = [0, 0, 12.03], cameraFov = 45, minDistance = 6.015, maxDistance = 80.2, brightness = 1.2, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { camera: { position: cameraPosition, fov: cameraFov }, gl: { antialias: true }, children: [_jsx("color", { attach: "background", args: [0, 0, 0] }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.8 * brightness }), _jsx("directionalLight", { position: [5, 3, 5], intensity: 1.5 * brightness }), _jsx(OrbitControls, { enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05 }), children] })] }) }));
});
UranusScene.displayName = "UranusScene";
/**
 * Uranus - The main composed Uranus component
 *
 * A fully pre-configured Uranus visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Uranus } from '@plexusui/uranus';
 *
 * function App() {
 *   return <Uranus />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Uranus textureUrl="/textures/uranus.jpg" />;
 * }
 */
const UranusComponent = forwardRef(({ textureUrl, brightness = 1.2, enableRotation = true, children, cameraPosition = [0, 0, 12.03], cameraFov = 45, minDistance = 6.015, maxDistance = 80.2, }, ref) => {
    return (_jsxs(UranusScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, brightness: brightness, children: [_jsx(UranusSphereRoot, { radius: URANUS_RADIUS, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation }), children] }));
});
UranusComponent.displayName = "Uranus";
export const Uranus = memo(UranusComponent);
//# sourceMappingURL=uranus.js.map