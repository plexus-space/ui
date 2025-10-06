"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { memo, useMemo, forwardRef } from "react";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
// Extend THREE types for R3F
extend(THREE);
// ============================================================================
// Constants
// ============================================================================
export const L1_COLOR = "#ff0000";
export const L2_COLOR = "#ff9900";
export const L3_COLOR = "#ffff00";
export const L4_COLOR = "#00ff00";
export const L5_COLOR = "#00ffff";
export const DEFAULT_POINT_SIZE = 200;
export const DEFAULT_SHOW_LABELS = true;
// ============================================================================
// Utilities
// ============================================================================
/**
 * Convert position to Vector3
 */
function toVector3(pos) {
    if (!pos)
        return new THREE.Vector3(0, 0, 0);
    return Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;
}
/**
 * Calculate mass ratio
 */
function calculateMassRatio(m1, m2) {
    return m2 / (m1 + m2);
}
/**
 * Calculate L1 position (between bodies, closer to smaller)
 *
 * ⚠️ APPROXIMATION: Uses first-order expansion of exact solution.
 * Accurate to ~1% for small mass ratios (μ < 0.1).
 * For exact positions, use highPrecision mode or @plexusui/orbital-math.
 */
function calculateL1(primaryPos, secondaryPos, mu, distance, highPrecision = false) {
    let r;
    if (highPrecision) {
        // High-precision solver (Newton-Raphson)
        r = solveL1PositionExact(mu) * distance;
    }
    else {
        // First-order approximation: r ≈ d × (μ/3)^(1/3)
        r = distance * Math.pow(mu / 3, 1 / 3);
    }
    const direction = secondaryPos.clone().sub(primaryPos).normalize();
    return primaryPos.clone().add(direction.multiplyScalar(r));
}
/**
 * Newton-Raphson solver for L1 (high-precision)
 * Returns normalized distance from barycenter
 */
function solveL1PositionExact(mu, tolerance = 1e-10) {
    let r = 1 - Math.pow(mu / 3, 1 / 3); // initial guess
    for (let i = 0; i < 50; i++) {
        const f = (1 - mu) / Math.pow(r + mu, 2) - mu / Math.pow(r - 1 + mu, 2) - r;
        const fPrime = -2 * (1 - mu) / Math.pow(r + mu, 3) +
            2 * mu / Math.pow(r - 1 + mu, 3) -
            1;
        const delta = f / fPrime;
        r = r - delta;
        if (Math.abs(delta) < tolerance) {
            return r;
        }
    }
    return r;
}
/**
 * Calculate L2 position (beyond smaller body)
 */
function calculateL2(primaryPos, secondaryPos, mu, distance, highPrecision = false) {
    let r;
    if (highPrecision) {
        r = solveL2PositionExact(mu) * distance;
    }
    else {
        r = distance * (1 + Math.pow(mu / 3, 1 / 3));
    }
    const direction = secondaryPos.clone().sub(primaryPos).normalize();
    return primaryPos.clone().add(direction.multiplyScalar(r));
}
function solveL2PositionExact(mu, tolerance = 1e-10) {
    let r = 1 + Math.pow(mu / 3, 1 / 3);
    for (let i = 0; i < 50; i++) {
        const f = (1 - mu) / Math.pow(r + mu, 2) + mu / Math.pow(r - 1 + mu, 2) - r;
        const fPrime = -2 * (1 - mu) / Math.pow(r + mu, 3) -
            2 * mu / Math.pow(r - 1 + mu, 3) -
            1;
        const delta = f / fPrime;
        r = r - delta;
        if (Math.abs(delta) < tolerance) {
            return r;
        }
    }
    return r;
}
/**
 * Calculate L3 position (opposite smaller body)
 */
function calculateL3(primaryPos, secondaryPos, mu, distance, highPrecision = false) {
    let r;
    if (highPrecision) {
        r = Math.abs(solveL3PositionExact(mu)) * distance;
    }
    else {
        r = distance * (1 + 5 * mu / 12);
    }
    const direction = secondaryPos.clone().sub(primaryPos).normalize().negate();
    return primaryPos.clone().add(direction.multiplyScalar(r));
}
function solveL3PositionExact(mu, tolerance = 1e-10) {
    let r = -1 - 5 * mu / 12;
    for (let i = 0; i < 50; i++) {
        const f = (1 - mu) / Math.pow(r + mu, 2) + mu / Math.pow(r - 1 + mu, 2) + r;
        const fPrime = -2 * (1 - mu) / Math.pow(r + mu, 3) -
            2 * mu / Math.pow(r - 1 + mu, 3) +
            1;
        const delta = f / fPrime;
        r = r - delta;
        if (Math.abs(delta) < tolerance) {
            return r;
        }
    }
    return r;
}
/**
 * Calculate L4 position (60° ahead in orbit)
 */
function calculateL4(primaryPos, secondaryPos, distance) {
    const center = primaryPos
        .clone()
        .add(secondaryPos.clone().sub(primaryPos).multiplyScalar(0.5));
    const direction = secondaryPos.clone().sub(primaryPos);
    const angle = Math.PI / 3; // 60 degrees
    const x = direction.x * Math.cos(angle) -
        direction.z * Math.sin(angle);
    const z = direction.x * Math.sin(angle) +
        direction.z * Math.cos(angle);
    return new THREE.Vector3(primaryPos.x + x, primaryPos.y, primaryPos.z + z);
}
/**
 * Calculate L5 position (60° behind in orbit)
 */
function calculateL5(primaryPos, secondaryPos, distance) {
    const center = primaryPos
        .clone()
        .add(secondaryPos.clone().sub(primaryPos).multiplyScalar(0.5));
    const direction = secondaryPos.clone().sub(primaryPos);
    const angle = -Math.PI / 3; // -60 degrees
    const x = direction.x * Math.cos(angle) -
        direction.z * Math.sin(angle);
    const z = direction.x * Math.sin(angle) +
        direction.z * Math.cos(angle);
    return new THREE.Vector3(primaryPos.x + x, primaryPos.y, primaryPos.z + z);
}
/**
 * Calculate all Lagrange points for a two-body system
 */
function calculateAllLagrangePoints(system, highPrecision = false) {
    const primaryPos = toVector3(system.primaryPosition);
    const secondaryPos = system.secondaryPosition
        ? toVector3(system.secondaryPosition)
        : new THREE.Vector3(system.distance, 0, 0);
    const mu = calculateMassRatio(system.primaryMass, system.secondaryMass);
    const d = system.distance;
    const points = [];
    // L1
    const l1Pos = calculateL1(primaryPos, secondaryPos, mu, d, highPrecision);
    points.push({
        type: "L1",
        position: l1Pos,
        stable: false,
        distanceFromPrimary: l1Pos.distanceTo(primaryPos),
        distanceFromSecondary: l1Pos.distanceTo(secondaryPos),
    });
    // L2
    const l2Pos = calculateL2(primaryPos, secondaryPos, mu, d, highPrecision);
    points.push({
        type: "L2",
        position: l2Pos,
        stable: false,
        distanceFromPrimary: l2Pos.distanceTo(primaryPos),
        distanceFromSecondary: l2Pos.distanceTo(secondaryPos),
    });
    // L3
    const l3Pos = calculateL3(primaryPos, secondaryPos, mu, d, highPrecision);
    points.push({
        type: "L3",
        position: l3Pos,
        stable: false,
        distanceFromPrimary: l3Pos.distanceTo(primaryPos),
        distanceFromSecondary: l3Pos.distanceTo(secondaryPos),
    });
    // L4
    const l4Pos = calculateL4(primaryPos, secondaryPos, d);
    points.push({
        type: "L4",
        position: l4Pos,
        stable: true,
        distanceFromPrimary: l4Pos.distanceTo(primaryPos),
        distanceFromSecondary: l4Pos.distanceTo(secondaryPos),
    });
    // L5
    const l5Pos = calculateL5(primaryPos, secondaryPos, d);
    points.push({
        type: "L5",
        position: l5Pos,
        stable: true,
        distanceFromPrimary: l5Pos.distanceTo(primaryPos),
        distanceFromSecondary: l5Pos.distanceTo(secondaryPos),
    });
    return points;
}
/**
 * Get color for Lagrange point
 */
function getPointColor(type) {
    switch (type) {
        case "L1":
            return L1_COLOR;
        case "L2":
            return L2_COLOR;
        case "L3":
            return L3_COLOR;
        case "L4":
            return L4_COLOR;
        case "L5":
            return L5_COLOR;
    }
}
/**
 * LaGrangePointsRoot - The base Lagrange points primitive component
 *
 * Renders L1-L5 Lagrange points for a two-body system.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <LaGrangePointsRoot
 *     system={{
 *       primaryMass: 5.972e24, // Earth
 *       secondaryMass: 7.342e22, // Moon
 *       distance: 384400, // km
 *     }}
 *     showPoints={["L1", "L2", "L4", "L5"]}
 *     showLabels
 *   />
 * </Canvas>
 * ```
 */
export const LaGrangePointsRoot = memo(forwardRef(({ system, showPoints, pointSize = DEFAULT_POINT_SIZE, showLabels = DEFAULT_SHOW_LABELS, showStability = false, showConnectionLines = false, colors = {}, showPrimaryBody = true, showSecondaryBody = true, primaryBodySize = 1000, secondaryBodySize = 500, primaryBodyColor = "#0000ff", secondaryBodyColor = "#888888", highPrecision = false, }, ref) => {
    // Calculate all Lagrange points
    const lagrangePoints = useMemo(() => calculateAllLagrangePoints(system, highPrecision), [system, highPrecision]);
    // Filter points to show
    const visiblePoints = useMemo(() => {
        if (!showPoints)
            return lagrangePoints;
        return lagrangePoints.filter((p) => showPoints.includes(p.type));
    }, [lagrangePoints, showPoints]);
    // Body positions
    const primaryPos = toVector3(system.primaryPosition);
    const secondaryPos = system.secondaryPosition
        ? toVector3(system.secondaryPosition)
        : new THREE.Vector3(system.distance, 0, 0);
    return (_jsxs("group", { ref: ref, children: [showPrimaryBody && (_jsxs("mesh", { position: primaryPos, children: [_jsx("sphereGeometry", { args: [primaryBodySize, 32, 32] }), _jsx("meshBasicMaterial", { color: primaryBodyColor })] })), showSecondaryBody && (_jsxs("mesh", { position: secondaryPos, children: [_jsx("sphereGeometry", { args: [secondaryBodySize, 32, 32] }), _jsx("meshBasicMaterial", { color: secondaryBodyColor })] })), visiblePoints.map((point) => {
                const color = colors[point.type] || getPointColor(point.type);
                return (_jsxs("group", { children: [_jsxs("mesh", { position: point.position, children: [_jsx("sphereGeometry", { args: [pointSize, 16, 16] }), _jsx("meshBasicMaterial", { color: color, transparent: true, opacity: point.stable ? 0.9 : 0.7 })] }), showStability && point.stable && (_jsxs("mesh", { position: point.position, rotation: [Math.PI / 2, 0, 0], children: [_jsx("torusGeometry", { args: [pointSize * 1.5, pointSize * 0.1, 16, 32] }), _jsx("meshBasicMaterial", { color: color, transparent: true, opacity: 0.5 })] })), showConnectionLines && (_jsxs(_Fragment, { children: [_jsxs("line", { children: [_jsx("bufferGeometry", { children: _jsx("bufferAttribute", { attach: "attributes-position", count: 2, array: new Float32Array([
                                                    point.position.x,
                                                    point.position.y,
                                                    point.position.z,
                                                    primaryPos.x,
                                                    primaryPos.y,
                                                    primaryPos.z,
                                                ]), itemSize: 3 }) }), _jsx("lineBasicMaterial", { color: color, transparent: true, opacity: 0.3 })] }), _jsxs("line", { children: [_jsx("bufferGeometry", { children: _jsx("bufferAttribute", { attach: "attributes-position", count: 2, array: new Float32Array([
                                                    point.position.x,
                                                    point.position.y,
                                                    point.position.z,
                                                    secondaryPos.x,
                                                    secondaryPos.y,
                                                    secondaryPos.z,
                                                ]), itemSize: 3 }) }), _jsx("lineBasicMaterial", { color: color, transparent: true, opacity: 0.3 })] })] }))] }, point.type));
            })] }));
}));
LaGrangePointsRoot.displayName = "LaGrangePointsRoot";
/**
 * LaGrangePoints - Lagrange point visualization component
 *
 * A primitive-based component for visualizing L1-L5 equilibrium points in
 * two-body orbital systems. Highlights stable vs unstable points.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <LaGrangePoints
 *     system={{
 *       primaryMass: 5.972e24, // Earth
 *       secondaryMass: 7.342e22, // Moon
 *       distance: 384400,
 *     }}
 *     showStability
 *     showConnectionLines
 *   />
 * </Canvas>
 * ```
 */
const LaGrangePointsComponent = forwardRef((props, ref) => {
    return (_jsx(LaGrangePointsRoot, { ref: ref, ...props }));
});
LaGrangePointsComponent.displayName = "LaGrangePoints";
export const LaGrangePoints = memo(LaGrangePointsComponent);
// ============================================================================
// UTILITIES
// ============================================================================
/**
 * Utility functions for Lagrange point calculations
 */
export const LaGrangePointsUtils = {
    /**
     * Calculate all Lagrange points
     */
    calculateAllPoints: calculateAllLagrangePoints,
    /**
     * Calculate mass ratio
     */
    calculateMassRatio,
    /**
     * Check if point is stable
     */
    isStable: (type) => {
        return type === "L4" || type === "L5";
    },
    /**
     * Get point color
     */
    getPointColor,
    /**
     * Earth-Moon system preset
     */
    EarthMoonSystem: () => ({
        primaryMass: 5.972e24, // Earth mass (kg)
        secondaryMass: 7.342e22, // Moon mass (kg)
        distance: 384400, // km
    }),
    /**
     * Sun-Earth system preset
     */
    SunEarthSystem: () => ({
        primaryMass: 1.989e30, // Sun mass (kg)
        secondaryMass: 5.972e24, // Earth mass (kg)
        distance: 149600000, // km (1 AU)
    }),
    /**
     * Earth-Sun L2 (JWST location) preset
     */
    JWSTSystem: () => ({
        primaryMass: 1.989e30,
        secondaryMass: 5.972e24,
        distance: 149600000,
    }),
    /**
     * Convert position to Vector3
     */
    toVector3,
};
//# sourceMappingURL=lagrange-points.js.map