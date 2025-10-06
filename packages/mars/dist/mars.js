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
 * Mars radius in kilometers
 * @constant {number}
 */
export const MARS_RADIUS = 3389.5;
/**
 * Mars actual radius in kilometers (same as MARS_RADIUS)
 * @constant {number}
 */
export const MARS_REAL_RADIUS_KM = 3389.5;
/**
 * Mars diameter in kilometers
 * @constant {number}
 */
export const MARS_DIAMETER_KM = 6779;
/**
 * Mars rotation period in Earth days (24.6 hours)
 * @constant {number}
 */
export const MARS_ROTATION_PERIOD = 1.03;
/**
 * Mars orbital period around the Sun in Earth days
 * @constant {number}
 */
export const MARS_ORBITAL_PERIOD = 687;
const MarsSphere = memo(function MarsSphere({ radius, textureUrl, brightness, enableRotation, emissiveColor, shininess, }) {
    const meshRef = useRef(null);
    const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
    useFrame(() => {
        if (meshRef.current && enableRotation) {
            // Rotation speed based on actual rotation period (1.03 Earth days)
            meshRef.current.rotation.y += 0.001 / MARS_ROTATION_PERIOD;
        }
    });
    return (_jsxs("mesh", { ref: meshRef, children: [_jsx("sphereGeometry", { args: [radius, 64, 32] }), texture ? (_jsx("meshStandardMaterial", { map: texture, roughness: 0.9, metalness: 0.1, emissive: emissiveColor, emissiveIntensity: 0.1 * brightness })) : (_jsx("meshStandardMaterial", { color: "#cd5c5c", roughness: 0.9, metalness: 0.1, emissive: emissiveColor, emissiveIntensity: 0.1 * brightness }))] }));
});
/**
 * MarsSphereRoot - The base Mars sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Mars sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { MarsSphereRoot } from '@plexusui/mars';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <MarsSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const MarsSphereRoot = forwardRef(({ radius = MARS_RADIUS, textureUrl, brightness = 1.2, enableRotation = true, emissiveColor = "#331100", shininess = 5, }, ref) => {
    return (_jsx("group", { ref: ref, children: _jsx(MarsSphere, { radius: radius, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation, emissiveColor: emissiveColor, shininess: shininess }) }));
});
MarsSphereRoot.displayName = "MarsSphereRoot";
export const MarsScene = forwardRef(({ cameraPosition = [0, 0, 10167], // 3x Mars radius
cameraFov = 45, minDistance = 5000, maxDistance = 30000, brightness = 1.2, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { camera: { position: cameraPosition, fov: cameraFov }, gl: { antialias: true }, children: [_jsx("color", { attach: "background", args: [0, 0, 0] }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.6 * brightness }), _jsx("directionalLight", { position: [5, 3, 5], intensity: 1.5 * brightness }), _jsx(OrbitControls, { enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05 }), children] })] }) }));
});
MarsScene.displayName = "MarsScene";
/**
 * Mars - The main composed Mars component
 *
 * A fully pre-configured Mars visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Mars } from '@plexusui/mars';
 *
 * function App() {
 *   return <Mars />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Mars textureUrl="/textures/mars.jpg" />;
 * }
 */
const MarsComponent = forwardRef(({ textureUrl, brightness = 1.2, enableRotation = true, children, cameraPosition = [0, 0, 10167], cameraFov = 45, minDistance = 5000, maxDistance = 30000, }, ref) => {
    return (_jsxs(MarsScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, brightness: brightness, children: [_jsx(MarsSphereRoot, { radius: MARS_RADIUS, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation }), children] }));
});
MarsComponent.displayName = "Mars";
export const Mars = memo(MarsComponent);
//# sourceMappingURL=mars.js.map