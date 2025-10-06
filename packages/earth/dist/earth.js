"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, memo, useRef, forwardRef, useEffect, useState, } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
// ============================================================================
// Constants - Astronomically Accurate Values
// ============================================================================
/**
 * Earth's radius in kilometers (mean radius)
 * @constant {number}
 */
const EARTH_RADIUS_KM = 6371.0;
/**
 * Scale factor for the scene (1 unit = 1000 km for manageable numbers)
 * @constant {number}
 */
const SCENE_SCALE = 0.001; // 1 scene unit = 1000 km
/**
 * Earth's radius in scene units
 * @constant {number}
 */
const EARTH_RADIUS = EARTH_RADIUS_KM * SCENE_SCALE;
/**
 * Earth's rotation period in seconds (sidereal day)
 * @constant {number}
 */
const EARTH_ROTATION_PERIOD_SECONDS = 86164.0905; // 23h 56m 4.0905s
/**
 * Earth's orbital period in days
 * @constant {number}
 */
const EARTH_ORBITAL_PERIOD_DAYS = 365.256363004; // Tropical year
/**
 * Earth's axial tilt in degrees (obliquity of the ecliptic)
 * @constant {number}
 */
const EARTH_AXIAL_TILT_DEG = 23.4392811; // Current value (changes slowly over time)
/**
 * Astronomical Unit in kilometers (mean Earth-Sun distance)
 * @constant {number}
 */
const ASTRONOMICAL_UNIT_KM = 149597870.7;
/**
 * Sun's radius in kilometers
 * @constant {number}
 */
const SUN_RADIUS_KM = 695700;
// ============================================================================
// Utility Functions - Astronomical Calculations
// ============================================================================
/**
 * Get current day of year and fraction of day
 * @returns {dayOfYear: number, fractionOfDay: number}
 */
function getCurrentDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const fractionOfDay = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
    return { dayOfYear, fractionOfDay };
}
/**
 * Calculate Earth's rotation based on time
 * @param timeScale - Time acceleration factor (1 = real-time)
 * @returns Current rotation angle in radians
 */
function calculateEarthRotation(timeScale = 1) {
    const { fractionOfDay } = getCurrentDayOfYear();
    // Earth rotates 360° per sidereal day
    // Starting position: Prime Meridian at noon
    return fractionOfDay * 2 * Math.PI * timeScale;
}
const EarthSphere = memo(function EarthSphere({ radius, textureUrl, cloudsMapUrl, enableRotation, axialTilt, timeScale, showAxis = false, }) {
    const meshRef = useRef(null);
    const cloudsRef = useRef(null);
    const groupRef = useRef(null);
    const [initialRotation, setInitialRotation] = useState(0);
    // Load textures
    const dayMap = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
    const cloudsTexture = cloudsMapUrl ? useLoader(THREE.TextureLoader, cloudsMapUrl) : null;
    // Set initial rotation based on current time
    useEffect(() => {
        setInitialRotation(calculateEarthRotation(1));
    }, []);
    // Apply axial tilt and rotation
    useFrame((_state) => {
        if (groupRef.current && groupRef.current.rotation.z === 0) {
            // Apply axial tilt (tilted away from orbital plane)
            groupRef.current.rotation.z = THREE.MathUtils.degToRad(axialTilt);
        }
        if (!enableRotation)
            return;
        // Realistic rotation rate
        const rotationPerSecond = ((2 * Math.PI) / EARTH_ROTATION_PERIOD_SECONDS) * timeScale;
        if (meshRef.current) {
            meshRef.current.rotation.y =
                initialRotation + _state.clock.elapsedTime * rotationPerSecond;
        }
        if (cloudsRef.current) {
            // Clouds rotate slightly differently due to atmospheric circulation
            cloudsRef.current.rotation.y =
                initialRotation + _state.clock.elapsedTime * rotationPerSecond * 1.02;
        }
    });
    return (_jsxs("group", { ref: groupRef, children: [_jsxs("mesh", { ref: meshRef, children: [_jsx("sphereGeometry", { args: [radius, 64, 32] }), dayMap ? (_jsx("meshBasicMaterial", { map: dayMap, toneMapped: false })) : (_jsx("meshBasicMaterial", { color: new THREE.Color(0x2233ff) }))] }), cloudsTexture && (_jsxs("mesh", { ref: cloudsRef, children: [_jsx("sphereGeometry", { args: [radius * 1.003, 64, 32] }), _jsx("meshBasicMaterial", { map: cloudsTexture, transparent: true, opacity: 0.4, depthWrite: false })] })), showAxis && _jsx("axesHelper", { args: [radius * 2] })] }));
});
export const EarthScene = forwardRef(({ cameraPosition = [0, 5, 20], cameraFov = 45, minDistance = 8, maxDistance = 100, brightness = 1.0, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { camera: { position: cameraPosition, fov: cameraFov }, gl: {
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.0,
            }, children: [_jsx("color", { attach: "background", args: [0x000511] }), _jsx("fog", { attach: "fog", args: [0x000511, 50, 200] }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 1.0 * brightness, color: 0xffffff }), _jsx(OrbitControls, { makeDefault: true, enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05 }), children] })] }) }));
});
EarthScene.displayName = "EarthScene";
const EarthComponent = forwardRef(({ dayMapUrl, cloudsMapUrl, brightness = 1.0, enableRotation = true, cameraPosition = [0, 5, 20], cameraFov = 45, minDistance = 8, maxDistance = 100, timeScale = 1, showAxis = false, children, }, ref) => {
    return (_jsxs(EarthScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, brightness: brightness, children: [_jsx(EarthSphere, { radius: EARTH_RADIUS, textureUrl: dayMapUrl, cloudsMapUrl: cloudsMapUrl, enableRotation: enableRotation, axialTilt: EARTH_AXIAL_TILT_DEG, timeScale: timeScale, showAxis: showAxis }), children] }));
});
EarthComponent.displayName = "Earth";
export const Earth = memo(EarthComponent);
// Export all astronomical constants for external use
export { EARTH_RADIUS, EARTH_RADIUS_KM, EARTH_ROTATION_PERIOD_SECONDS, EARTH_ORBITAL_PERIOD_DAYS, EARTH_AXIAL_TILT_DEG, ASTRONOMICAL_UNIT_KM, SUN_RADIUS_KM, SCENE_SCALE, calculateEarthRotation, getCurrentDayOfYear, };
//# sourceMappingURL=earth.js.map