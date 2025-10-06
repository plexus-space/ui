"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useMemo, forwardRef } from "react";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
// Extend THREE types for R3F
extend(THREE);
// ============================================================================
// Constants
// ============================================================================
export const DEFAULT_TRAJECTORY_COLOR = "#00ffff";
export const DEFAULT_WAYPOINT_COLOR = "#ffffff";
export const DEFAULT_BURN_COLOR = "#ff9900";
export const DEFAULT_LINE_WIDTH = 2;
export const DEFAULT_WAYPOINT_SIZE = 100;
export const DEFAULT_BURN_SIZE = 150;
export const BURN_TYPE_COLORS = {
    prograde: "#00ff00",
    retrograde: "#ff0000",
    normal: "#0000ff",
    radial: "#ffff00",
    custom: "#ff9900",
};
// ============================================================================
// Utilities
// ============================================================================
/**
 * Convert position array to Vector3 if needed
 */
function toVector3(pos) {
    return Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;
}
/**
 * Generate smooth curve through waypoints using Catmull-Rom spline
 */
function generateSmoothPath(waypoints, segments) {
    if (waypoints.length < 2)
        return [];
    const points = waypoints.map((wp) => toVector3(wp.position));
    const curve = new THREE.CatmullRomCurve3(points);
    return curve.getPoints(segments);
}
/**
 * Calculate total delta-V budget
 */
function calculateTotalDeltaV(burns) {
    return burns.reduce((sum, burn) => sum + burn.deltaV, 0);
}
/**
 * TrajectoryRoot - The base trajectory primitive component
 *
 * Renders flight paths with waypoints and burn markers.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <TrajectoryRoot
 *     waypoints={[
 *       { position: [0, 0, 0] },
 *       { position: [1000, 500, 0] },
 *       { position: [2000, 0, 0] },
 *     ]}
 *     burns={[
 *       { position: [1000, 500, 0], deltaV: 250, type: "prograde" }
 *     ]}
 *     showWaypoints
 *     showBurns
 *   />
 * </Canvas>
 * ```
 */
export const TrajectoryRoot = memo(forwardRef(({ waypoints, burns = [], color = DEFAULT_TRAJECTORY_COLOR, lineWidth = DEFAULT_LINE_WIDTH, showWaypoints = false, waypointSize = DEFAULT_WAYPOINT_SIZE, waypointColor = DEFAULT_WAYPOINT_COLOR, showBurns = false, burnSize = DEFAULT_BURN_SIZE, burnColor, showDeltaVVectors = false, deltaVScale = 100, smoothCurve = true, curveSegments = 100, showLabels = false, animated = false, animationProgress = 1, }, ref) => {
    // Generate trajectory path
    const pathPoints = useMemo(() => {
        if (waypoints.length === 0)
            return [];
        if (smoothCurve && waypoints.length >= 2) {
            return generateSmoothPath(waypoints, curveSegments);
        }
        return waypoints.map((wp) => toVector3(wp.position));
    }, [waypoints, smoothCurve, curveSegments]);
    // Apply animation
    const visiblePoints = useMemo(() => {
        if (!animated || animationProgress >= 1)
            return pathPoints;
        const count = Math.floor(pathPoints.length * animationProgress);
        return pathPoints.slice(0, Math.max(1, count));
    }, [pathPoints, animated, animationProgress]);
    return (_jsxs("group", { ref: ref, children: [visiblePoints.length > 1 && (_jsxs("line", { children: [_jsx("bufferGeometry", { children: _jsx("bufferAttribute", { attach: "attributes-position", count: visiblePoints.length, array: new Float32Array(visiblePoints.flatMap((p) => [p.x, p.y, p.z])), itemSize: 3 }) }), _jsx("lineBasicMaterial", { color: color, linewidth: lineWidth })] })), showWaypoints &&
                waypoints.map((waypoint, idx) => {
                    const pos = toVector3(waypoint.position);
                    return (_jsxs("group", { children: [_jsxs("mesh", { position: pos, children: [_jsx("sphereGeometry", { args: [waypointSize, 16, 16] }), _jsx("meshBasicMaterial", { color: waypointColor })] }), showLabels && waypoint.name && (_jsx("mesh", { position: pos }))] }, `waypoint-${idx}`));
                }), showBurns &&
                burns.map((burn, idx) => {
                    const pos = toVector3(burn.position);
                    const color = burnColor ||
                        (burn.type && BURN_TYPE_COLORS[burn.type]) ||
                        DEFAULT_BURN_COLOR;
                    return (_jsxs("group", { children: [_jsxs("mesh", { position: pos, children: [_jsx("sphereGeometry", { args: [burnSize, 16, 16] }), _jsx("meshBasicMaterial", { color: color })] }), showDeltaVVectors && burn.direction && (_jsx("arrowHelper", { args: [
                                    toVector3(burn.direction).normalize(),
                                    pos,
                                    burn.deltaV * deltaVScale,
                                    color,
                                ] })), showLabels && burn.label && (_jsx("mesh", { position: pos }))] }, `burn-${idx}`));
                })] }));
}));
TrajectoryRoot.displayName = "TrajectoryRoot";
/**
 * Trajectory - Flight path visualization component
 *
 * A primitive-based component for visualizing spacecraft trajectories with
 * waypoints and burn markers. Supports smooth curves and animation.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <Trajectory
 *     waypoints={flightPath}
 *     burns={maneuvers}
 *     showWaypoints
 *     showBurns
 *     showDeltaVVectors
 *     smoothCurve
 *   />
 * </Canvas>
 * ```
 */
const TrajectoryComponent = forwardRef((props, ref) => {
    return (_jsx(TrajectoryRoot, { ref: ref, ...props }));
});
TrajectoryComponent.displayName = "Trajectory";
export const Trajectory = memo(TrajectoryComponent);
// ============================================================================
// UTILITIES
// ============================================================================
/**
 * Utility functions for trajectory calculations
 */
export const TrajectoryUtils = {
    /**
     * Calculate total delta-V budget
     */
    calculateTotalDeltaV,
    /**
     * Calculate trajectory length
     */
    calculateLength: (waypoints) => {
        let length = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            const p1 = toVector3(waypoints[i].position);
            const p2 = toVector3(waypoints[i + 1].position);
            length += p1.distanceTo(p2);
        }
        return length;
    },
    /**
     * Calculate trajectory duration (if timestamps provided)
     */
    calculateDuration: (waypoints) => {
        const withTime = waypoints.filter((wp) => wp.timestamp !== undefined);
        if (withTime.length < 2)
            return null;
        const times = withTime.map((wp) => wp.timestamp);
        return Math.max(...times) - Math.min(...times);
    },
    /**
     * Interpolate position along trajectory at given progress (0-1)
     */
    interpolatePosition: (waypoints, progress) => {
        if (waypoints.length === 0)
            return null;
        if (progress <= 0)
            return toVector3(waypoints[0].position);
        if (progress >= 1)
            return toVector3(waypoints[waypoints.length - 1].position);
        const totalLength = TrajectoryUtils.calculateLength(waypoints);
        const targetLength = totalLength * progress;
        let accumulatedLength = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            const p1 = toVector3(waypoints[i].position);
            const p2 = toVector3(waypoints[i + 1].position);
            const segmentLength = p1.distanceTo(p2);
            if (accumulatedLength + segmentLength >= targetLength) {
                const localProgress = (targetLength - accumulatedLength) / segmentLength;
                return p1.clone().lerp(p2, localProgress);
            }
            accumulatedLength += segmentLength;
        }
        return toVector3(waypoints[waypoints.length - 1].position);
    },
    /**
     * Create Hohmann transfer waypoints
     */
    createHohmannTransfer: (r1, r2, steps = 50) => {
        const waypoints = [];
        const a = (r1 + r2) / 2; // Semi-major axis of transfer orbit
        // Starting point
        waypoints.push({ position: [r1, 0, 0] });
        // Transfer arc
        for (let i = 1; i < steps; i++) {
            const theta = (i / steps) * Math.PI;
            const r = (a * (1 - ((r2 - r1) / (r1 + r2)) ** 2)) /
                (1 + ((r2 - r1) / (r1 + r2)) * Math.cos(theta));
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            waypoints.push({ position: [x, y, 0] });
        }
        // Ending point
        waypoints.push({ position: [r2, 0, 0] });
        return waypoints;
    },
    /**
     * Validate waypoint
     */
    validateWaypoint: (waypoint) => {
        try {
            const pos = toVector3(waypoint.position);
            return !isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.z);
        }
        catch {
            return false;
        }
    },
    /**
     * Convert position array to Vector3
     */
    toVector3,
};
//# sourceMappingURL=trajectory.js.map