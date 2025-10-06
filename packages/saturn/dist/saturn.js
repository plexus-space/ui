"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Suspense, useRef, memo, forwardRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
// ============================================================================
// Constants
// ============================================================================
/**
 * Saturn radius in kilometers
 * @constant {number}
 */
export const SATURN_RADIUS = 58232;
/**
 * Saturn actual radius in kilometers (same as SATURN_RADIUS)
 * @constant {number}
 */
export const SATURN_REAL_RADIUS_KM = 58232;
/**
 * Saturn diameter in kilometers
 * @constant {number}
 */
export const SATURN_DIAMETER_KM = 116464;
/**
 * Saturn rotation period in Earth days (10.7 hours)
 * @constant {number}
 */
export const SATURN_ROTATION_PERIOD = 0.45;
/**
 * Saturn orbital period around the Sun in Earth days (29.5 years)
 * @constant {number}
 */
export const SATURN_ORBITAL_PERIOD = 10759;
/**
 * Saturn's ring system inner radius in kilometers (D ring inner edge)
 * @constant {number}
 */
export const SATURN_RINGS_INNER = 66900;
/**
 * Saturn's ring system outer radius in kilometers (A ring outer edge)
 * @constant {number}
 */
export const SATURN_RINGS_OUTER = 136780;
const SaturnSphere = memo(function SaturnSphere({ radius, textureUrl, ringsTextureUrl, brightness, enableRotation, emissiveColor, shininess, showRings, }) {
    const saturnRef = useRef(null);
    const ringsRef = useRef(null);
    const texture = textureUrl
        ? useLoader(THREE.TextureLoader, textureUrl)
        : null;
    const ringsTexture = ringsTextureUrl
        ? useLoader(THREE.TextureLoader, ringsTextureUrl)
        : null;
    useFrame(() => {
        if (enableRotation) {
            if (saturnRef.current) {
                // Fast rotation based on Saturn's rotation period
                saturnRef.current.rotation.y += 0.001 / SATURN_ROTATION_PERIOD;
            }
            if (ringsRef.current && showRings) {
                // Rings rotate slightly slower
                ringsRef.current.rotation.z += 0.0014;
            }
        }
    });
    return (_jsxs(_Fragment, { children: [_jsxs("mesh", { ref: saturnRef, children: [_jsx("sphereGeometry", { args: [radius, 64, 32] }), texture ? (_jsx("meshStandardMaterial", { map: texture, roughness: 0.7, metalness: 0.1, emissive: emissiveColor, emissiveIntensity: 0.05 * brightness })) : (_jsx("meshStandardMaterial", { color: "#fad5a5", roughness: 0.7, metalness: 0.1, emissive: emissiveColor, emissiveIntensity: 0.05 * brightness }))] }), showRings && (_jsxs("mesh", { ref: ringsRef, rotation: [Math.PI / 2.2, 0, 0], children: [_jsx("ringGeometry", { args: [SATURN_RINGS_INNER, SATURN_RINGS_OUTER, 64] }), ringsTexture ? (_jsx("meshBasicMaterial", { map: ringsTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })) : (_jsx("meshBasicMaterial", { color: "#c9b29b", side: THREE.DoubleSide, transparent: true, opacity: 0.7 }))] }))] }));
});
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
export const SaturnSphereRoot = forwardRef(({ radius = SATURN_RADIUS, textureUrl, ringsTextureUrl, brightness = 1.2, enableRotation = true, emissiveColor = "#221100", shininess = 15, showRings = true, }, ref) => {
    return (_jsx("group", { ref: ref, children: _jsx(SaturnSphere, { radius: radius, textureUrl: textureUrl, ringsTextureUrl: ringsTextureUrl, brightness: brightness, enableRotation: enableRotation, emissiveColor: emissiveColor, shininess: shininess, showRings: showRings }) }));
});
SaturnSphereRoot.displayName = "SaturnSphereRoot";
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
export const SaturnScene = forwardRef(({ cameraPosition = [0, 0, 350000], // View rings from distance
cameraFov = 45, minDistance = 150000, maxDistance = 800000, brightness = 1.2, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { camera: { position: cameraPosition, fov: cameraFov }, gl: { antialias: true }, children: [_jsx("color", { attach: "background", args: [0, 0, 0] }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.8 * brightness }), _jsx("directionalLight", { position: [5, 3, 5], intensity: 1.5 * brightness }), _jsx(OrbitControls, { enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05 }), children] })] }) }));
});
SaturnScene.displayName = "SaturnScene";
/**
 * Saturn - The main composed Saturn component
 *
 * A fully pre-configured Saturn visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Saturn } from '@plexusui/saturn';
 *
 * function App() {
 *   return <Saturn />;
 * }
 *
 * @example
 * With texture and without rings:
 *
 * function App() {
 *   return (
 *     <Saturn
 *       textureUrl="/textures/saturn.jpg"
 *       showRings={false}
 *     />
 *   );
 * }
 *
 * @example
 * With custom settings:
 *
 * function App() {
 *   return (
 *     <Saturn
 *       textureUrl="/textures/saturn.jpg"
 *       ringsTextureUrl="/textures/saturn-rings.jpg"
 *       brightness={1.5}
 *       enableRotation={true}
 *     />
 *   );
 * }
 *
 * @param props - Configuration props for the Saturn component
 * @param ref - Forward ref to the container div element
 * @returns A complete, ready-to-use Saturn visualization
 */
const SaturnComponent = forwardRef(({ textureUrl, ringsTextureUrl, brightness = 1.2, enableRotation = true, showRings = true, children, cameraPosition = [0, 0, 350000], cameraFov = 45, minDistance = 150000, maxDistance = 800000, }, ref) => {
    return (_jsxs(SaturnScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, brightness: brightness, children: [_jsx(SaturnSphereRoot, { radius: SATURN_RADIUS, textureUrl: textureUrl, ringsTextureUrl: ringsTextureUrl, brightness: brightness, enableRotation: enableRotation, showRings: showRings }), children] }));
});
SaturnComponent.displayName = "Saturn";
/**
 * Saturn - Memoized Saturn component for optimal performance
 *
 * This is the main export. The component is memoized to prevent
 * unnecessary re-renders when parent components update.
 */
export const Saturn = memo(SaturnComponent);
//# sourceMappingURL=saturn.js.map