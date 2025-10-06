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
export const DEFAULT_MU = 398600; // Earth's gravitational parameter (km³/s²)
export const DEFAULT_INITIAL_COLOR = "#00ff00";
export const DEFAULT_FINAL_COLOR = "#0000ff";
export const DEFAULT_TRANSFER_COLOR = "#ffff00";
export const DEFAULT_BURN_COLOR = "#ff0000";
export const DEFAULT_SEGMENTS = 128;
// ============================================================================
// Utilities
// ============================================================================
/**
 * Generate circular orbit points
 */
function generateCircularOrbit(radius, segments) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
    }
    return points;
}
/**
 * Generate elliptical transfer orbit
 */
function generateEllipticalOrbit(periapsis, apoapsis, segments) {
    const a = (periapsis + apoapsis) / 2;
    const e = (apoapsis - periapsis) / (apoapsis + periapsis);
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        points.push(new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta)));
    }
    return points;
}
/**
 * Calculate orbital velocity at radius
 */
function orbitalVelocity(radius, mu) {
    return Math.sqrt(mu / radius);
}
/**
 * Calculate transfer orbit velocity at periapsis/apoapsis
 */
function transferVelocity(r, a, mu) {
    return Math.sqrt(mu * (2 / r - 1 / a));
}
/**
 * Calculate Hohmann transfer
 */
function calculateHohmannTransfer(r1, r2, mu, segments) {
    const a_transfer = (r1 + r2) / 2;
    // Velocities
    const v1_circular = orbitalVelocity(r1, mu);
    const v2_circular = orbitalVelocity(r2, mu);
    const v1_transfer = transferVelocity(r1, a_transfer, mu);
    const v2_transfer = transferVelocity(r2, a_transfer, mu);
    // Delta-Vs (convert to m/s)
    const dv1 = Math.abs(v1_transfer - v1_circular) * 1000;
    const dv2 = Math.abs(v2_circular - v2_transfer) * 1000;
    const totalDeltaV = dv1 + dv2;
    // Transfer time
    const transferTime = Math.PI * Math.sqrt(Math.pow(a_transfer, 3) / mu);
    // Generate paths
    const initialOrbit = generateCircularOrbit(r1, segments);
    const finalOrbit = generateCircularOrbit(r2, segments);
    const transferPath = generateEllipticalOrbit(r1, r2, Math.floor(segments / 2));
    return {
        initialOrbit,
        finalOrbit,
        transferPaths: [transferPath],
        burns: [
            {
                position: new THREE.Vector3(r1, 0, 0),
                deltaV: dv1,
                label: `Burn 1: ${dv1.toFixed(0)} m/s`,
            },
            {
                position: new THREE.Vector3(-r2, 0, 0),
                deltaV: dv2,
                label: `Burn 2: ${dv2.toFixed(0)} m/s`,
            },
        ],
        totalDeltaV,
        transferTime,
    };
}
/**
 * Calculate bi-elliptic transfer
 */
function calculateBiEllipticTransfer(r1, r2, rb, mu, segments) {
    const a1 = (r1 + rb) / 2;
    const a2 = (rb + r2) / 2;
    // Velocities
    const v1_circular = orbitalVelocity(r1, mu);
    const v2_circular = orbitalVelocity(r2, mu);
    const vb_1 = transferVelocity(rb, a1, mu);
    const vb_2 = transferVelocity(rb, a2, mu);
    const v1_transfer1 = transferVelocity(r1, a1, mu);
    const v2_transfer2 = transferVelocity(r2, a2, mu);
    // Delta-Vs (convert to m/s)
    const dv1 = Math.abs(v1_transfer1 - v1_circular) * 1000;
    const dv2 = Math.abs(vb_2 - vb_1) * 1000;
    const dv3 = Math.abs(v2_circular - v2_transfer2) * 1000;
    const totalDeltaV = dv1 + dv2 + dv3;
    // Transfer time
    const t1 = Math.PI * Math.sqrt(Math.pow(a1, 3) / mu);
    const t2 = Math.PI * Math.sqrt(Math.pow(a2, 3) / mu);
    const transferTime = t1 + t2;
    // Generate paths
    const initialOrbit = generateCircularOrbit(r1, segments);
    const finalOrbit = generateCircularOrbit(r2, segments);
    const transfer1 = generateEllipticalOrbit(r1, rb, Math.floor(segments / 2));
    const transfer2 = generateEllipticalOrbit(r2, rb, Math.floor(segments / 2));
    return {
        initialOrbit,
        finalOrbit,
        transferPaths: [transfer1, transfer2],
        burns: [
            {
                position: new THREE.Vector3(r1, 0, 0),
                deltaV: dv1,
                label: `Burn 1: ${dv1.toFixed(0)} m/s`,
            },
            {
                position: new THREE.Vector3(-rb, 0, 0),
                deltaV: dv2,
                label: `Burn 2: ${dv2.toFixed(0)} m/s`,
            },
            {
                position: new THREE.Vector3(-r2, 0, 0),
                deltaV: dv3,
                label: `Burn 3: ${dv3.toFixed(0)} m/s`,
            },
        ],
        totalDeltaV,
        transferTime,
    };
}
/**
 * TransferOrbitRoot - The base transfer orbit primitive component
 *
 * Renders Hohmann or bi-elliptic transfer orbits with burn markers.
 * Use this when you want full control over the scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <TransferOrbitRoot
 *     config={{
 *       initialRadius: 7000,
 *       finalRadius: 42164,
 *       type: "hohmann"
 *     }}
 *     showBurns
 *   />
 * </Canvas>
 * ```
 */
export const TransferOrbitRoot = memo(forwardRef(({ config, segments = DEFAULT_SEGMENTS, initialColor = DEFAULT_INITIAL_COLOR, finalColor = DEFAULT_FINAL_COLOR, transferColor = DEFAULT_TRANSFER_COLOR, burnColor = DEFAULT_BURN_COLOR, showBurns = false, burnSize = 200, showLabels = false, lineWidth = 2, }, ref) => {
    const { initialRadius, finalRadius, type = "hohmann", intermediateRadius, mu = DEFAULT_MU, } = config;
    // Calculate transfer orbit data
    const transferData = useMemo(() => {
        if (type === "bi-elliptic") {
            const rb = intermediateRadius || Math.max(initialRadius, finalRadius) * 1.5;
            return calculateBiEllipticTransfer(initialRadius, finalRadius, rb, mu, segments);
        }
        return calculateHohmannTransfer(initialRadius, finalRadius, mu, segments);
    }, [initialRadius, finalRadius, type, intermediateRadius, mu, segments]);
    return (_jsxs("group", { ref: ref, children: [_jsxs("line", { children: [_jsx("bufferGeometry", { children: _jsx("bufferAttribute", { attach: "attributes-position", count: transferData.initialOrbit.length, array: new Float32Array(transferData.initialOrbit.flatMap((p) => [p.x, p.y, p.z])), itemSize: 3 }) }), _jsx("lineBasicMaterial", { color: initialColor, linewidth: lineWidth })] }), _jsxs("line", { children: [_jsx("bufferGeometry", { children: _jsx("bufferAttribute", { attach: "attributes-position", count: transferData.finalOrbit.length, array: new Float32Array(transferData.finalOrbit.flatMap((p) => [p.x, p.y, p.z])), itemSize: 3 }) }), _jsx("lineBasicMaterial", { color: finalColor, linewidth: lineWidth })] }), transferData.transferPaths.map((path, idx) => (_jsxs("line", { children: [_jsx("bufferGeometry", { children: _jsx("bufferAttribute", { attach: "attributes-position", count: path.length, array: new Float32Array(path.flatMap((p) => [p.x, p.y, p.z])), itemSize: 3 }) }), _jsx("lineBasicMaterial", { color: transferColor, linewidth: lineWidth, transparent: true, opacity: 0.8 })] }, `transfer-${idx}`))), showBurns &&
                transferData.burns.map((burn, idx) => (_jsxs("mesh", { position: burn.position, children: [_jsx("sphereGeometry", { args: [burnSize, 16, 16] }), _jsx("meshBasicMaterial", { color: burnColor })] }, `burn-${idx}`)))] }));
}));
TransferOrbitRoot.displayName = "TransferOrbitRoot";
/**
 * TransferOrbit - Hohmann/bi-elliptic transfer visualization component
 *
 * A primitive-based component for visualizing orbital transfers between two
 * circular orbits. Automatically calculates delta-V requirements and burn locations.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <TransferOrbit
 *     config={{
 *       initialRadius: 7000,
 *       finalRadius: 42164,
 *       type: "hohmann"
 *     }}
 *     showBurns
 *     showLabels
 *   />
 * </Canvas>
 * ```
 */
const TransferOrbitComponent = forwardRef((props, ref) => {
    return (_jsx(TransferOrbitRoot, { ref: ref, ...props }));
});
TransferOrbitComponent.displayName = "TransferOrbit";
export const TransferOrbit = memo(TransferOrbitComponent);
// ============================================================================
// UTILITIES
// ============================================================================
/**
 * Utility functions for transfer orbit calculations
 */
export const TransferOrbitUtils = {
    /**
     * Calculate Hohmann transfer delta-V
     */
    calculateHohmannDeltaV: (r1, r2, mu = DEFAULT_MU) => {
        const transfer = calculateHohmannTransfer(r1, r2, mu, 64);
        return transfer.totalDeltaV;
    },
    /**
     * Calculate bi-elliptic transfer delta-V
     */
    calculateBiEllipticDeltaV: (r1, r2, rb, mu = DEFAULT_MU) => {
        const transfer = calculateBiEllipticTransfer(r1, r2, rb, mu, 64);
        return transfer.totalDeltaV;
    },
    /**
     * Compare Hohmann vs bi-elliptic efficiency
     */
    compareTransfers: (r1, r2, rb, mu = DEFAULT_MU) => {
        const hohmann = TransferOrbitUtils.calculateHohmannDeltaV(r1, r2, mu);
        const biElliptic = TransferOrbitUtils.calculateBiEllipticDeltaV(r1, r2, rb, mu);
        return {
            hohmann,
            biElliptic,
            recommendation: biElliptic < hohmann ? "bi-elliptic" : "hohmann",
        };
    },
    /**
     * Calculate optimal intermediate radius for bi-elliptic
     * (Simplified - uses 1.5x the larger orbit as heuristic)
     */
    calculateOptimalIntermediateRadius: (r1, r2) => {
        return Math.max(r1, r2) * 1.5;
    },
    /**
     * Calculate orbital velocity
     */
    orbitalVelocity,
    /**
     * Generate transfer orbit data
     */
    generateTransferData: (config, segments = DEFAULT_SEGMENTS) => {
        const { initialRadius, finalRadius, type = "hohmann", intermediateRadius, mu = DEFAULT_MU } = config;
        if (type === "bi-elliptic") {
            const rb = intermediateRadius || TransferOrbitUtils.calculateOptimalIntermediateRadius(initialRadius, finalRadius);
            return calculateBiEllipticTransfer(initialRadius, finalRadius, rb, mu, segments);
        }
        return calculateHohmannTransfer(initialRadius, finalRadius, mu, segments);
    },
};
//# sourceMappingURL=transfer-orbit.js.map