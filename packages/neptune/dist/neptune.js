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
 * Neptune radius in scene units (relative to Earth)
 * @constant {number}
 */
export const NEPTUNE_RADIUS = 3.88; // Relative to Earth (24,622 km actual)
/**
 * Neptune actual radius in kilometers
 * @constant {number}
 */
export const NEPTUNE_REAL_RADIUS_KM = 24622;
/**
 * Neptune rotation period in Earth days (16 hours)
 * @constant {number}
 */
export const NEPTUNE_ROTATION_PERIOD = 0.67;
/**
 * Neptune orbital period around the Sun in Earth days (164.8 years)
 * @constant {number}
 */
export const NEPTUNE_ORBITAL_PERIOD = 60190;
const NeptuneSphere = memo(function NeptuneSphere({ radius, textureUrl, brightness, enableRotation, emissiveColor, shininess, }) {
    const meshRef = useRef(null);
    const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
    useFrame(() => {
        if (meshRef.current && enableRotation) {
            meshRef.current.rotation.y += 0.0016;
        }
    });
    return (_jsxs("mesh", { ref: meshRef, children: [_jsx("sphereGeometry", { args: [radius, 64, 32] }), texture ? (_jsx("meshPhongMaterial", { map: texture, shininess: shininess, emissive: emissiveColor, emissiveIntensity: 0.15 * brightness })) : (_jsx("meshPhongMaterial", { color: "#4166f5", shininess: shininess, emissive: emissiveColor, emissiveIntensity: 0.15 * brightness }))] }));
});
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
export const NeptuneSphereRoot = forwardRef(({ radius = NEPTUNE_RADIUS, textureUrl, brightness = 1.2, enableRotation = true, emissiveColor = "#001166", shininess = 30, }, ref) => {
    return (_jsx("group", { ref: ref, children: _jsx(NeptuneSphere, { radius: radius, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation, emissiveColor: emissiveColor, shininess: shininess }) }));
});
NeptuneSphereRoot.displayName = "NeptuneSphereRoot";
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
export const NeptuneScene = forwardRef(({ cameraPosition = [0, 0, 11.64], cameraFov = 45, minDistance = 5.82, maxDistance = 77.6, brightness = 1.2, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { camera: { position: cameraPosition, fov: cameraFov }, gl: { antialias: true }, children: [_jsx("color", { attach: "background", args: [0, 0, 0] }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.8 * brightness }), _jsx("directionalLight", { position: [5, 3, 5], intensity: 1.5 * brightness }), _jsx(OrbitControls, { enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05 }), children] })] }) }));
});
NeptuneScene.displayName = "NeptuneScene";
/**
 * Neptune - The main composed Neptune component
 *
 * A fully pre-configured Neptune visualization with sensible defaults.
 * Just drop it in and it works - no textures or setup required!
 *
 * @example
 * Simplest usage (works immediately):
 *
 * import { Neptune } from '@plexusui/neptune';
 *
 * function App() {
 *   return <Neptune />;
 * }
 *
 * @example
 * With texture:
 *
 * function App() {
 *   return <Neptune textureUrl="/textures/neptune.jpg" />;
 * }
 */
const NeptuneComponent = forwardRef(({ textureUrl, brightness = 1.3, enableRotation = true, children, cameraPosition = [0, 0, 11.64], cameraFov = 45, minDistance = 5.82, maxDistance = 77.6, }, ref) => {
    return (_jsxs(NeptuneScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, brightness: brightness, children: [_jsx(NeptuneSphereRoot, { radius: NEPTUNE_RADIUS, textureUrl: textureUrl, brightness: brightness, enableRotation: enableRotation }), children] }));
});
NeptuneComponent.displayName = "Neptune";
/**
 * Neptune - Memoized Neptune component for optimal performance
 *
 * This is the main export. The component is memoized to prevent
 * unnecessary re-renders when parent components update.
 */
export const Neptune = memo(NeptuneComponent);
//# sourceMappingURL=neptune.js.map