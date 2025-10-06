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
 * Mercury radius in scene units (relative to Earth)
 * @constant {number}
 */
export const MERCURY_RADIUS = 0.383; // Relative to Earth (2,439.7 km actual)
/**
 * Mercury actual radius in kilometers
 * @constant {number}
 */
export const MERCURY_REAL_RADIUS_KM = 2439.7;
/**
 * Mercury rotation period in Earth days (58.6 days)
 * @constant {number}
 */
export const MERCURY_ROTATION_PERIOD = 58.6;
/**
 * Mercury orbital period around the Sun in Earth days
 * @constant {number}
 */
export const MERCURY_ORBITAL_PERIOD = 88;
const MercurySphere = memo(function MercurySphere({ radius, textureUrl, brightness, enableRotation, emissiveColor, shininess, }) {
    const meshRef = useRef(null);
    const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
    useFrame(() => {
        if (meshRef.current && enableRotation) {
            meshRef.current.rotation.y += 0.001 / MERCURY_ROTATION_PERIOD;
        }
    });
    return (_jsxs("mesh", { ref: meshRef, children: [_jsx("sphereGeometry", { args: [radius, 64, 32] }), texture ? (_jsx("meshPhongMaterial", { map: texture, shininess: shininess, emissive: emissiveColor, emissiveIntensity: 0.1 * brightness })) : (_jsx("meshPhongMaterial", { color: "#8c7853", shininess: shininess, emissive: emissiveColor, emissiveIntensity: 0.1 * brightness }))] }));
});
/**
 * MercurySphereRoot - The base Mercury sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Mercury sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { MercurySphereRoot } from '@plexusui/mercury';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <MercurySphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const MercurySphereRoot = forwardRef(({ radius = MERCURY_RADIUS, textureUrl, brightness = 1.2, enableRotation = true, emissiveColor = "#111111", shininess = 5, }, ref) => {
    return (_jsx("group", { ref: ref, children: _jsx(MercurySphere, { radius: radius, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation, emissiveColor: emissiveColor, shininess: shininess }) }));
});
MercurySphereRoot.displayName = "MercurySphereRoot";
export const MercuryScene = forwardRef(({ cameraPosition = [0, 0, 1.149], cameraFov = 45, minDistance = 0.5745, maxDistance = 7.66, brightness = 1.2, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { camera: { position: cameraPosition, fov: cameraFov }, gl: { antialias: true }, children: [_jsx("color", { attach: "background", args: [0, 0, 0] }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.6 * brightness }), _jsx("directionalLight", { position: [5, 3, 5], intensity: 1.5 * brightness }), _jsx(OrbitControls, { enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05 }), children] })] }) }));
});
MercuryScene.displayName = "MercuryScene";
/**
 * Mercury - The main composed Mercury component
 *
 * A fully pre-configured Mercury visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Mercury } from '@plexusui/mercury';
 *
 * function App() {
 *   return <Mercury />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Mercury textureUrl="/textures/mercury.jpg" />;
 * }
 */
const MercuryComponent = forwardRef(({ textureUrl, brightness = 1.2, enableRotation = true, children, cameraPosition = [0, 0, 1.149], cameraFov = 45, minDistance = 0.5745, maxDistance = 7.66, }, ref) => {
    return (_jsxs(MercuryScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, brightness: brightness, children: [_jsx(MercurySphereRoot, { radius: MERCURY_RADIUS, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation }), children] }));
});
MercuryComponent.displayName = "Mercury";
export const Mercury = memo(MercuryComponent);
//# sourceMappingURL=mercury.js.map