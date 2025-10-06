"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useMemo, forwardRef, Suspense } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
// Extend THREE types for R3F
extend(THREE);
// ============================================================================
// Constants
// ============================================================================
export const DEFAULT_ORBITAL_SEGMENTS = 128;
export const DEFAULT_ORBITAL_COLOR = "#00ff00";
export const DEFAULT_LINE_WIDTH = 2;
// ============================================================================
// Utilities
// ============================================================================
/**
 * Calculate position on elliptical orbit at given true anomaly
 */
function calculateOrbitalPosition(a, e, theta) {
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
    return new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta));
}
/**
 * Generate orbital path points from Keplerian elements
 */
function generateOrbitalPath(elements, segments) {
    const { semiMajorAxis, eccentricity } = elements;
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const point = calculateOrbitalPosition(semiMajorAxis, eccentricity, theta);
        points.push(point);
    }
    return points;
}
/**
 * Apply 3D rotation transformations for orbital elements
 */
function applyOrbitalRotations(group, elements) {
    const { inclination = 0, longitudeOfAscendingNode = 0, argumentOfPeriapsis = 0, } = elements;
    // Reset rotation
    group.rotation.set(0, 0, 0);
    // Apply rotations in order: Ω (RAAN), i (inclination), ω (arg of periapsis)
    group.rotateY((longitudeOfAscendingNode * Math.PI) / 180);
    group.rotateX((inclination * Math.PI) / 180);
    group.rotateZ((argumentOfPeriapsis * Math.PI) / 180);
}
/**
 * OrbitalPathRoot - The base orbital path primitive component
 *
 * Renders an elliptical orbit using Keplerian elements.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <OrbitalPathRoot
 *     elements={{
 *       semiMajorAxis: 10000,
 *       eccentricity: 0.3,
 *       inclination: 23.5,
 *       longitudeOfAscendingNode: 45,
 *       argumentOfPeriapsis: 90
 *     }}
 *     color="#00ff00"
 *     showApoapsis
 *     showPeriapsis
 *   />
 * </Canvas>
 * ```
 */
export const OrbitalPathRoot = memo(forwardRef(({ elements, segments = DEFAULT_ORBITAL_SEGMENTS, color = DEFAULT_ORBITAL_COLOR, lineWidth = DEFAULT_LINE_WIDTH, showApoapsis = false, showPeriapsis = false, apoapsisColor = "#ff0000", periapsisColor = "#0000ff", markerSize = 100, }, ref) => {
    // Generate orbital path points
    const points = useMemo(() => generateOrbitalPath(elements, segments), [elements, segments]);
    // Calculate apoapsis and periapsis positions
    const { apoapsis, periapsis } = useMemo(() => {
        const { semiMajorAxis, eccentricity } = elements;
        const apoapsisDistance = semiMajorAxis * (1 + eccentricity);
        const periapsisDistance = semiMajorAxis * (1 - eccentricity);
        return {
            apoapsis: new THREE.Vector3(apoapsisDistance, 0, 0),
            periapsis: new THREE.Vector3(-periapsisDistance, 0, 0),
        };
    }, [elements]);
    // Apply orbital rotations
    const groupRef = useMemo(() => {
        const group = new THREE.Group();
        applyOrbitalRotations(group, elements);
        return group;
    }, [elements]);
    return (_jsx("group", { ref: ref, children: _jsxs("primitive", { object: groupRef, children: [_jsxs("line", { children: [_jsx("bufferGeometry", { children: _jsx("bufferAttribute", { attach: "attributes-position", count: points.length, array: new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), itemSize: 3 }) }), _jsx("lineBasicMaterial", { color: color, linewidth: lineWidth })] }), showApoapsis && (_jsxs("mesh", { position: apoapsis, children: [_jsx("sphereGeometry", { args: [markerSize, 16, 16] }), _jsx("meshBasicMaterial", { color: apoapsisColor })] })), showPeriapsis && (_jsxs("mesh", { position: periapsis, children: [_jsx("sphereGeometry", { args: [markerSize, 16, 16] }), _jsx("meshBasicMaterial", { color: periapsisColor })] }))] }) }));
}));
OrbitalPathRoot.displayName = "OrbitalPathRoot";
/**
 * OrbitalPathScene - A pre-configured Three.js scene for orbital visualizations
 *
 * Provides a complete scene with Canvas, camera, lights, and orbital controls.
 * Use this when you want a ready-to-go scene but need to add custom content.
 *
 * @example
 * ```tsx
 * import \{ OrbitalPathScene, OrbitalPathRoot \} from '@plexusui/orbital-path';
 *
 * function CustomOrbit() \{
 *   return (
 *     <OrbitalPathScene>
 *       <OrbitalPathRoot
 *         elements=\{\{
 *           semiMajorAxis: 10000,
 *           eccentricity: 0.3
 *         \}\}
 *       />
 *       <mesh position=\{[0, 0, 0]\}>
 *         <sphereGeometry args=\{[500, 32, 32]\} />
 *         <meshStandardMaterial color="orange" />
 *       </mesh>
 *     </OrbitalPathScene>
 *   );
 * \}
 * ```
 */
export const OrbitalPathScene = forwardRef(({ cameraPosition = [0, 10000, 10000], cameraFov = 45, minDistance = 1000, maxDistance = 100000, brightness = 1.0, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { gl: { antialias: true }, children: [_jsx("color", { attach: "background", args: ["#000000"] }), _jsx(PerspectiveCamera, { makeDefault: true, position: cameraPosition, fov: cameraFov }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.3 * brightness }), _jsx("pointLight", { position: [10000, 10000, 10000], intensity: 1.0 * brightness }), _jsx("pointLight", { position: [-10000, -5000, -10000], intensity: 0.3 * brightness }), _jsx(OrbitControls, { makeDefault: true, enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05 }), children] })] }) }));
});
OrbitalPathScene.displayName = "OrbitalPathScene";
/**
 * OrbitalPath - Fully composed orbital path visualization component
 *
 * A complete, drop-in-ready orbital visualization with scene, lighting, and controls.
 * Just pass Keplerian elements and it works immediately!
 *
 * **This is the highest-level component** - includes Canvas, lights, camera, and controls.
 *
 * @example
 * Simplest usage (works immediately):
 * ```tsx
 * import { OrbitalPath } from '@plexusui/orbital-path';
 *
 * function App() {
 *   return (
 *     <OrbitalPath
 *       elements={{
 *         semiMajorAxis: 10000,
 *         eccentricity: 0.3
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * With all features:
 * ```tsx
 * <OrbitalPath
 *   elements={{
 *     semiMajorAxis: 10000,
 *     eccentricity: 0.3,
 *     inclination: 23.5,
 *     longitudeOfAscendingNode: 45,
 *     argumentOfPeriapsis: 90
 *   }}
 *   showApoapsis
 *   showPeriapsis
 *   color="#00ff00"
 *   segments={256}
 * />
 * ```
 *
 * @example
 * Build custom scene with Scene primitive:
 * ```tsx
 * <OrbitalPathScene>
 *   <OrbitalPathRoot elements=\{orbit1\} color="#00ff00" />
 *   <OrbitalPathRoot elements=\{orbit2\} color="#ff0000" />
 * </OrbitalPathScene>
 * ```
 */
const OrbitalPathComponent = forwardRef(({ cameraPosition, cameraFov, minDistance, maxDistance, children, ...rootProps }, ref) => {
    return (_jsxs(OrbitalPathScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, children: [_jsx(OrbitalPathRoot, { ...rootProps }), children] }));
});
OrbitalPathComponent.displayName = "OrbitalPath";
export const OrbitalPath = memo(OrbitalPathComponent);
// ============================================================================
// UTILITIES
// ============================================================================
/**
 * Utility functions for orbital calculations
 */
export const OrbitalPathUtils = {
    /**
     * Calculate orbital period using Kepler's third law
     * @param semiMajorAxis Semi-major axis in km
     * @param mu Gravitational parameter (default: Earth's μ = 398600 km³/s²)
     * @returns Orbital period in seconds
     */
    calculateOrbitalPeriod: (semiMajorAxis, mu = 398600) => {
        return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);
    },
    /**
     * Calculate apoapsis and periapsis distances
     */
    calculateApsides: (semiMajorAxis, eccentricity) => {
        return {
            apoapsis: semiMajorAxis * (1 + eccentricity),
            periapsis: semiMajorAxis * (1 - eccentricity),
        };
    },
    /**
     * Convert circular orbit radius to Keplerian elements
     */
    circularOrbit: (radius) => {
        return {
            semiMajorAxis: radius,
            eccentricity: 0,
            inclination: 0,
            longitudeOfAscendingNode: 0,
            argumentOfPeriapsis: 0,
            trueAnomaly: 0,
        };
    },
    /**
     * Validate Keplerian elements
     */
    validateElements: (elements) => {
        const { semiMajorAxis, eccentricity } = elements;
        return semiMajorAxis > 0 && eccentricity >= 0 && eccentricity < 1;
    },
};
//# sourceMappingURL=orbital-path.js.map