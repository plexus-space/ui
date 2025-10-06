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
 * Moon radius in scene units (relative to Earth)
 * @constant {number}
 */
export const MOON_RADIUS = 0.273; // Relative to Earth (1,737.4 km actual)
/**
 * Moon actual radius in kilometers
 * @constant {number}
 */
export const MOON_REAL_RADIUS_KM = 1737.4;
/**
 * Moon rotation period in Earth days (tidally locked)
 * @constant {number}
 */
export const MOON_ROTATION_PERIOD = 27.3;
/**
 * Moon orbital period around Earth in Earth days
 * @constant {number}
 */
export const MOON_ORBITAL_PERIOD = 27.3;
const MoonSphere = memo(function MoonSphere({ radius, textureUrl, brightness, enableRotation, emissiveColor, shininess, }) {
    const meshRef = useRef(null);
    const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
    useFrame(() => {
        if (meshRef.current && enableRotation) {
            // Slow rotation - tidally locked to Earth
            meshRef.current.rotation.y += 0.0004 / MOON_ROTATION_PERIOD;
        }
    });
    return (_jsxs("mesh", { ref: meshRef, children: [_jsx("sphereGeometry", { args: [radius, 64, 32] }), texture ? (_jsx("meshPhongMaterial", { map: texture, bumpScale: 0.005, shininess: shininess, emissive: emissiveColor, emissiveIntensity: 0.05 * brightness })) : (_jsx("meshPhongMaterial", { color: "#aaaaaa", shininess: shininess, emissive: emissiveColor, emissiveIntensity: 0.05 * brightness }))] }));
});
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
export const MoonSphereRoot = forwardRef(({ radius = MOON_RADIUS, textureUrl, brightness = 1.2, enableRotation = true, emissiveColor = "#0a0a0a", shininess = 1, }, ref) => {
    return (_jsx("group", { ref: ref, children: _jsx(MoonSphere, { radius: radius, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation, emissiveColor: emissiveColor, shininess: shininess }) }));
});
MoonSphereRoot.displayName = "MoonSphereRoot";
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
export const MoonScene = forwardRef(({ cameraPosition = [0, 0, 0.819], cameraFov = 45, minDistance = 0.41, maxDistance = 5.46, brightness = 1.2, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { camera: { position: cameraPosition, fov: cameraFov }, gl: { antialias: true }, children: [_jsx("color", { attach: "background", args: [0, 0, 0] }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.8 * brightness }), _jsx("directionalLight", { position: [5, 3, 5], intensity: 1.5 * brightness }), _jsx(OrbitControls, { enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05 }), children] })] }) }));
});
MoonScene.displayName = "MoonScene";
/**
 * Moon - The main composed Moon component
 *
 * A fully pre-configured Moon visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Moon } from '@plexusui/moon';
 *
 * function App() {
 *   return <Moon />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Moon textureUrl="/textures/moon.jpg" />;
 * }
 */
const MoonComponent = forwardRef(({ textureUrl, brightness = 1.2, enableRotation = true, children, cameraPosition = [0, 0, 0.819], cameraFov = 45, minDistance = 0.41, maxDistance = 5.46, }, ref) => {
    return (_jsxs(MoonScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, brightness: brightness, children: [_jsx(MoonSphereRoot, { radius: MOON_RADIUS, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation }), children] }));
});
MoonComponent.displayName = "Moon";
export const Moon = memo(MoonComponent);
//# sourceMappingURL=moon.js.map