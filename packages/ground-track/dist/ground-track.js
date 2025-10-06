"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useMemo, forwardRef, useRef, Suspense } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
// Extend THREE types for R3F
extend(THREE);
// ============================================================================
// Constants
// ============================================================================
export const DEFAULT_TRACK_COLOR = "#ffff00";
export const DEFAULT_LINE_WIDTH = 3;
export const DEFAULT_PLANET_RADIUS = 6371; // Earth radius in km
export const DEFAULT_OFFSET = 10; // Offset above surface in km
// ============================================================================
// Utilities
// ============================================================================
/**
 * Convert latitude/longitude to 3D Cartesian coordinates on a sphere
 */
function latLonToCartesian(lat, lon, radius) {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lon + 180) * Math.PI) / 180;
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
}
/**
 * Generate ground track points from orbit parameters
 */
function generateGroundTrackPoints(points, planetRadius, offset) {
    return points.map((point) => {
        const radius = planetRadius + offset + (point.altitude || 0);
        return latLonToCartesian(point.latitude, point.longitude, radius);
    });
}
/**
 * Split ground track at date line crossing to avoid visual artifacts
 */
function splitAtDateLine(points) {
    const segments = [];
    let currentSegment = [];
    for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[i + 1];
        currentSegment.push(current);
        // Check for date line crossing (large longitude jump)
        if (next && Math.abs(next.longitude - current.longitude) > 180) {
            segments.push(currentSegment);
            currentSegment = [];
        }
    }
    if (currentSegment.length > 0) {
        segments.push(currentSegment);
    }
    return segments;
}
/**
 * GroundTrackRoot - The base ground track primitive component
 *
 * Renders satellite ground track overlay on planetary surface.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <GroundTrackRoot
 *     points={[
 *       { latitude: 0, longitude: 0 },
 *       { latitude: 10, longitude: 20 },
 *       { latitude: 20, longitude: 40 },
 *     ]}
 *     planetRadius={6371}
 *     color="#ffff00"
 *   />
 * </Canvas>
 * ```
 */
export const GroundTrackRoot = memo(forwardRef(({ points, planetRadius = DEFAULT_PLANET_RADIUS, offset = DEFAULT_OFFSET, color = DEFAULT_TRACK_COLOR, lineWidth = DEFAULT_LINE_WIDTH, showMarkers = false, markerSize = 50, markerColor = "#ffffff", splitAtDateLine: shouldSplit = true, animated = false, animationSpeed = 0.01, }, ref) => {
    const animationRef = useRef(0);
    // Split track at date line if needed
    const segments = useMemo(() => {
        if (shouldSplit) {
            return splitAtDateLine(points);
        }
        return [points];
    }, [points, shouldSplit]);
    // Generate 3D coordinates for each segment
    const trackSegments = useMemo(() => {
        return segments.map((segment) => generateGroundTrackPoints(segment, planetRadius, offset));
    }, [segments, planetRadius, offset]);
    // Animation
    useFrame(() => {
        if (animated) {
            animationRef.current += animationSpeed;
        }
    });
    return (_jsx("group", { ref: ref, children: trackSegments.map((segmentPoints, segmentIndex) => (_jsxs("group", { children: [_jsxs("line", { children: [_jsx("bufferGeometry", { children: _jsx("bufferAttribute", { attach: "attributes-position", count: segmentPoints.length, array: new Float32Array(segmentPoints.flatMap((p) => [p.x, p.y, p.z])), itemSize: 3 }) }), _jsx("lineBasicMaterial", { color: color, linewidth: lineWidth, transparent: animated, opacity: animated ? 0.8 : 1 })] }), showMarkers &&
                    segmentPoints.map((point, idx) => (_jsxs("mesh", { position: point, children: [_jsx("sphereGeometry", { args: [markerSize, 8, 8] }), _jsx("meshBasicMaterial", { color: markerColor })] }, `marker-${segmentIndex}-${idx}`)))] }, `segment-${segmentIndex}`))) }));
}));
GroundTrackRoot.displayName = "GroundTrackRoot";
/**
 * GroundTrackScene - A pre-configured Three.js scene for ground track visualizations
 *
 * Provides a complete scene with Canvas, camera, lights, and orbital controls.
 * Use this when you want a ready-to-go scene but need to add custom content like planets.
 *
 * @example
 * ```tsx
 * import { GroundTrackScene, GroundTrackRoot } from '@plexusui/ground-track';
 * import { EarthSphereRoot } from '@plexusui/earth';
 *
 * function CustomGroundTrack() {
 *   return (
 *     <GroundTrackScene>
 *       <EarthSphereRoot radius={6371} textureUrl="/earth.jpg" />
 *       <GroundTrackRoot
 *         points={satelliteTrack}
 *         planetRadius={6371}
 *       />
 *     </GroundTrackScene>
 *   );
 * }
 * ```
 */
export const GroundTrackScene = forwardRef(({ cameraPosition = [0, 0, 15000], cameraFov = 45, minDistance = 7000, maxDistance = 50000, brightness = 1.0, children, }, ref) => {
    return (_jsx("div", { ref: ref, className: "relative h-full w-full", children: _jsxs(Canvas, { gl: { antialias: true }, children: [_jsx("color", { attach: "background", args: ["#000000"] }), _jsx(PerspectiveCamera, { makeDefault: true, position: cameraPosition, fov: cameraFov }), _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.15 * brightness }), _jsx("directionalLight", { position: [150000, 0, 0], intensity: 3.0 * brightness, color: "#FFF5E6" }), _jsx("hemisphereLight", { color: "#1a1a2e", groundColor: "#000000", intensity: 0.2 * brightness }), _jsx(OrbitControls, { makeDefault: true, enablePan: true, enableZoom: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4, minDistance: minDistance, maxDistance: maxDistance, enableDamping: true, dampingFactor: 0.05, target: [0, 0, 0] }), children] })] }) }));
});
GroundTrackScene.displayName = "GroundTrackScene";
/**
 * GroundTrack - Fully composed satellite ground track visualization component
 *
 * A complete, drop-in-ready ground track visualization with scene, lighting, and controls.
 * Just pass ground track points and it works immediately!
 *
 * **This is the highest-level component** - includes Canvas, lights, camera, and controls.
 *
 * @example
 * Simplest usage (works immediately):
 * ```tsx
 * import { GroundTrack } from '@plexusui/ground-track';
 *
 * function App() {
 *   const trackPoints = [
 *     { latitude: 0, longitude: 0 },
 *     { latitude: 10, longitude: 20 },
 *     { latitude: 20, longitude: 40 },
 *   ];
 *
 *   return (
 *     <GroundTrack
 *       points={trackPoints}
 *       planetRadius={6371}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * With all features:
 * ```tsx
 * <GroundTrack
 *   points={issGroundTrack}
 *   planetRadius={6371}
 *   showMarkers
 *   animated
 *   color="#ffff00"
 *   markerColor="#ffffff"
 * />
 * ```
 *
 * @example
 * Build custom scene with Scene primitive:
 * ```tsx
 * import { GroundTrackScene, GroundTrackRoot } from '@plexusui/ground-track';
 * import { EarthSphereRoot } from '@plexusui/earth';
 *
 * <GroundTrackScene>
 *   <EarthSphereRoot radius={6371} textureUrl="/earth.jpg" />
 *   <GroundTrackRoot points={track1} color="#00ff00" />
 *   <GroundTrackRoot points={track2} color="#ff0000" />
 * </GroundTrackScene>
 * ```
 */
const GroundTrackComponent = forwardRef(({ cameraPosition, cameraFov, minDistance, maxDistance, children, ...rootProps }, ref) => {
    return (_jsxs(GroundTrackScene, { ref: ref, cameraPosition: cameraPosition, cameraFov: cameraFov, minDistance: minDistance, maxDistance: maxDistance, children: [_jsx(GroundTrackRoot, { ...rootProps }), children] }));
});
GroundTrackComponent.displayName = "GroundTrack";
export const GroundTrack = memo(GroundTrackComponent);
// ============================================================================
// UTILITIES
// ============================================================================
/**
 * Utility functions for ground track calculations
 */
export const GroundTrackUtils = {
    /**
     * Convert Cartesian coordinates to lat/lon
     */
    cartesianToLatLon: (position, radius) => {
        const { x, y, z } = position;
        const lat = (Math.asin(y / radius) * 180) / Math.PI;
        const lon = (Math.atan2(z, -x) * 180) / Math.PI - 180;
        return { latitude: lat, longitude: lon };
    },
    /**
     * Convert lat/lon to Cartesian
     */
    latLonToCartesian,
    /**
     * Generate ground track from orbital elements over time
     *
     * ⚠️ SIMPLIFIED PROPAGATION - For visualization only!
     * Uses basic circular+inclined orbit model.
     * For mission-critical applications, use SGP4/SDP4 propagators.
     */
    generateFromOrbit: (semiMajorAxis, inclination, steps, planetRadius = DEFAULT_PLANET_RADIUS) => {
        const points = [];
        const period = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / 398600);
        for (let i = 0; i < steps; i++) {
            const t = (i / steps) * period;
            const theta = (2 * Math.PI * t) / period;
            // Simplified orbit propagation
            const lat = (Math.asin(Math.sin(inclination) * Math.sin(theta)) * 180) / Math.PI;
            const lon = ((theta * 180) / Math.PI) % 360 - 180;
            points.push({ latitude: lat, longitude: lon });
        }
        return points;
    },
    /**
     * Filter points by time range
     */
    filterByTimeRange: (points, startTime, endTime) => {
        return points.filter((p) => p.timestamp !== undefined &&
            p.timestamp >= startTime &&
            p.timestamp <= endTime);
    },
    /**
     * Validate ground track point
     */
    validatePoint: (point) => {
        return (point.latitude >= -90 &&
            point.latitude <= 90 &&
            point.longitude >= -180 &&
            point.longitude <= 180);
    },
};
//# sourceMappingURL=ground-track.js.map