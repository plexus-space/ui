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
 * Jupiter radius in kilometers
 * @constant {number}
 */
export const JUPITER_RADIUS = 69911;
/**
 * Jupiter actual radius in kilometers (same as JUPITER_RADIUS)
 * @constant {number}
 */
export const JUPITER_REAL_RADIUS_KM = 69911;
/**
 * Jupiter diameter in kilometers
 * @constant {number}
 */
export const JUPITER_DIAMETER_KM = 139822;
/**
 * Jupiter rotation period in Earth days (9.9 hours - fastest rotation in solar system)
 * @constant {number}
 */
export const JUPITER_ROTATION_PERIOD = 0.41;
/**
 * Jupiter orbital period around the Sun in Earth days
 * @constant {number}
 */
export const JUPITER_ORBITAL_PERIOD = 4333; // 11.9 years
const JupiterSphere = memo(function JupiterSphere({ radius, textureUrl, brightness, enableRotation, emissiveColor, shininess, }) {
    const meshRef = useRef(null);
    const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
    useFrame(() => {
        if (meshRef.current && enableRotation) {
            // Fast rotation - Jupiter has the fastest rotation in the solar system (9.9 hours)
            // Rotates 2.44x faster than Earth
            meshRef.current.rotation.y += 0.001 / JUPITER_ROTATION_PERIOD;
        }
    });
    return (_jsxs("mesh", { ref: meshRef, children: [_jsx("sphereGeometry", { args: [radius, 64, 32] }), texture ? (_jsx("meshStandardMaterial", { map: texture, roughness: 0.7, metalness: 0.1, emissive: emissiveColor, emissiveIntensity: 0.08 * brightness })) : (_jsx("meshStandardMaterial", { color: "#c88b3a", roughness: 0.7, metalness: 0.1, emissive: emissiveColor, emissiveIntensity: 0.08 * brightness }))] }));
});
/**
 * JupiterSphereRoot - The base Jupiter sphere primitive
 *
 * Use this when you want full control over the Three.js scene setup.
 * Renders just the Jupiter sphere with optional texture and materials.
 *
 * @example
 * Basic usage in custom scene:
 *
 * import { Canvas } from '@react-three/fiber';
 * import { JupiterSphereRoot } from '@plexusui/jupiter';
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <JupiterSphereRoot />
 *     </Canvas>
 *   );
 * }
 */
export const JupiterSphereRoot = forwardRef(({ radius = JUPITER_RADIUS, textureUrl, brightness = 1.1, enableRotation = true, emissiveColor = "#221100", shininess = 20, }, ref) => {
    return (_jsx("group", { ref: ref, children: _jsx(JupiterSphere, { radius: radius, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation, emissiveColor: emissiveColor, shininess: shininess }) }));
});
JupiterSphereRoot.displayName = "JupiterSphereRoot";
/**
 * JupiterScene - The Three.js scene primitive component
 *
 * Provides a complete Three.js scene with Canvas, lights, camera, and orbital controls.
 * Use this when you want a pre-configured scene but still need to add custom content.
 *
 * @example
 * Usage with custom meshes:
 *
 * import { JupiterScene, JupiterSphereRoot } from '@plexusui/jupiter';
 *
 * function CustomJupiter() {
 *   return (
 *     <JupiterScene cameraPosition={[0, 0, 40]} brightness={1.3}>
 *       <JupiterSphereRoot
 *         radius={11.21}
 *         textureUrl="/jupiter.jpg"
 *         enableRotation={true}
 *       />
 *       <mesh position={[0, 15, 0]}>
 *         <sphereGeometry args={[2, 32, 32]} />
 *         <meshStandardMaterial color="white" />
 *       </mesh>
 *     </JupiterScene>
 *   );
 * }
 */
export const JupiterScene = forwardRef(({ cameraPosition = [0, 0, 209733], // 3x Jupiter radius
cameraFov = 45, minDistance = 100000, maxDistance = 500000, brightness = 1.1, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { camera: { position: cameraPosition, fov: cameraFov }, gl: { antialias: true }, children: [_jsx("color", { attach: "background", args: [0, 0, 0] }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.8 * brightness }), _jsx("directionalLight", { position: [5, 3, 5], intensity: 1.5 * brightness }), _jsx(OrbitControls, { enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05 }), children] })] }) }));
});
JupiterScene.displayName = "JupiterScene";
/**
 * Jupiter - The main composed Jupiter component
 *
 * A fully pre-configured Jupiter visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Jupiter } from '@plexusui/jupiter';
 *
 * function App() {
 *   return <Jupiter />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Jupiter textureUrl="/textures/jupiter.jpg" />;
 * }
 */
const JupiterComponent = forwardRef(({ textureUrl, brightness = 1.1, enableRotation = true, children, cameraPosition = [0, 0, 209733], cameraFov = 45, minDistance = 100000, maxDistance = 500000, }, ref) => {
    return (_jsxs(JupiterScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, brightness: brightness, children: [_jsx(JupiterSphereRoot, { radius: JUPITER_RADIUS, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation }), children] }));
});
JupiterComponent.displayName = "Jupiter";
/**
 * Jupiter - Memoized Jupiter component for optimal performance
 *
 * This is the main export. The component is memoized to prevent
 * unnecessary re-renders when parent components update.
 */
export const Jupiter = memo(JupiterComponent);
//# sourceMappingURL=jupiter.js.map