"use client";

import * as React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { Vec3 } from "../components/primitives/physics";

/**
 * ORBIT TRANSFER PLANNER - PRO COMPONENT
 *
 * Visualizes and calculates orbital transfers between circular orbits.
 * Implements Hohmann and bi-elliptic transfer trajectories.
 *
 * **TRANSFER TYPES:**
 *
 * 1. **Hohmann Transfer** (Most efficient for radius ratios < 11.94)
 *    - Two-impulse transfer between coplanar circular orbits
 *    - First burn at periapsis of initial orbit
 *    - Second burn at apoapsis of transfer orbit
 *    - ΔV = ΔV₁ + ΔV₂
 *
 * 2. **Bi-Elliptic Transfer** (More efficient for large radius ratios)
 *    - Three-impulse transfer via intermediate apoapsis
 *    - First burn to reach high apoapsis
 *    - Second burn at apoapsis to lower periapsis
 *    - Third burn at new periapsis to circularize
 *    - More efficient when r₂/r₁ > 11.94
 *
 * **REFERENCES:**
 * [1] Curtis, H. D. (2013). Orbital Mechanics for Engineering Students, Ch. 6
 * [2] Prussing, J. E. & Conway, B. A. (1993). Orbital Mechanics, Ch. 2
 * [3] Vallado, D. A. (2013). Fundamentals of Astrodynamics, Ch. 6
 *
 * **USAGE:**
 * ```tsx
 * <Canvas>
 *   <Sphere radius={6378} />
 *   <OrbitTransferPlanner
 *     initialRadius={6778}  // ISS orbit
 *     finalRadius={42164}   // GEO orbit
 *     transferType="hohmann"
 *     showStats
 *   />
 * </Canvas>
 * ```
 */

export interface OrbitTransferPlannerProps {
  /** Initial circular orbit radius (km) */
  initialRadius: number;
  /** Final circular orbit radius (km) */
  finalRadius: number;
  /** Type of transfer */
  transferType: "hohmann" | "bi-elliptic";
  /** Intermediate apoapsis radius for bi-elliptic (km), defaults to 2x final radius */
  intermediateRadius?: number;
  /** Gravitational parameter (km³/s²) */
  mu?: number;
  /** Color of initial orbit */
  initialColor?: string;
  /** Color of transfer orbit */
  transferColor?: string;
  /** Color of final orbit */
  finalColor?: string;
  /** Show delta-V statistics panel */
  showStats?: boolean;
  /** Number of points for rendering orbits */
  segments?: number;
  /** Line width */
  lineWidth?: number;
  /** Show burn markers */
  showBurns?: boolean;
}

interface TransferCalculation {
  deltaV1: number;
  deltaV2: number;
  deltaV3?: number;
  totalDeltaV: number;
  transferTime1: number;
  transferTime2?: number;
  totalTime: number;
  transferOrbit1: { a: number; e: number };
  transferOrbit2?: { a: number; e: number };
}

/**
 * Calculate Hohmann transfer parameters
 *
 * @reference Curtis, H. D. (2013). Orbital Mechanics, Eq. 6.15-6.18
 */
function calculateHohmannTransfer(
  r1: number,
  r2: number,
  mu: number
): TransferCalculation {
  // Circular velocities
  const v1 = Math.sqrt(mu / r1);
  const v2 = Math.sqrt(mu / r2);

  // Transfer orbit semi-major axis
  const a_transfer = (r1 + r2) / 2;

  // Velocities at periapsis and apoapsis of transfer orbit
  const vp = Math.sqrt((2 * mu * r2) / (r1 * (r1 + r2)));
  const va = Math.sqrt((2 * mu * r1) / (r2 * (r1 + r2)));

  // Delta-V requirements
  const deltaV1 = Math.abs(vp - v1);
  const deltaV2 = Math.abs(v2 - va);
  const totalDeltaV = deltaV1 + deltaV2;

  // Transfer time (half period of transfer ellipse)
  const transferTime = Math.PI * Math.sqrt(Math.pow(a_transfer, 3) / mu);

  return {
    deltaV1,
    deltaV2,
    totalDeltaV,
    transferTime1: transferTime,
    totalTime: transferTime,
    transferOrbit1: {
      a: a_transfer,
      e: Math.abs(r2 - r1) / (r2 + r1),
    },
  };
}

/**
 * Calculate bi-elliptic transfer parameters
 *
 * @reference Curtis, H. D. (2013). Orbital Mechanics, Eq. 6.25-6.30
 */
function calculateBiEllipticTransfer(
  r1: number,
  r2: number,
  rb: number,
  mu: number
): TransferCalculation {
  // Circular velocities
  const v1 = Math.sqrt(mu / r1);
  const v2 = Math.sqrt(mu / r2);

  // First transfer orbit (r1 to rb)
  const a1 = (r1 + rb) / 2;
  const vp1 = Math.sqrt((2 * mu * rb) / (r1 * (r1 + rb)));
  const va1 = Math.sqrt((2 * mu * r1) / (rb * (r1 + rb)));

  // Second transfer orbit (rb to r2)
  const a2 = (rb + r2) / 2;
  const vp2 = Math.sqrt((2 * mu * r2) / (rb * (rb + r2)));
  const va2 = Math.sqrt((2 * mu * rb) / (r2 * (rb + r2)));

  // Delta-V requirements
  const deltaV1 = Math.abs(vp1 - v1);
  const deltaV2 = Math.abs(vp2 - va1);
  const deltaV3 = Math.abs(v2 - va2);
  const totalDeltaV = deltaV1 + deltaV2 + deltaV3;

  // Transfer times
  const transferTime1 = Math.PI * Math.sqrt(Math.pow(a1, 3) / mu);
  const transferTime2 = Math.PI * Math.sqrt(Math.pow(a2, 3) / mu);
  const totalTime = transferTime1 + transferTime2;

  return {
    deltaV1,
    deltaV2,
    deltaV3,
    totalDeltaV,
    transferTime1,
    transferTime2,
    totalTime,
    transferOrbit1: {
      a: a1,
      e: Math.abs(rb - r1) / (rb + r1),
    },
    transferOrbit2: {
      a: a2,
      e: Math.abs(r2 - rb) / (r2 + rb),
    },
  };
}

/**
 * Generate elliptical orbit path
 */
function generateEllipticalOrbit(
  a: number,
  e: number,
  startAnomaly: number,
  endAnomaly: number,
  segments: number
): Vec3[] {
  const points: Vec3[] = [];
  const angleSpan = endAnomaly - startAnomaly;

  for (let i = 0; i <= segments; i++) {
    const nu = startAnomaly + (i / segments) * angleSpan;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

    const x = r * Math.cos(nu);
    const y = r * Math.sin(nu);
    const z = 0;

    points.push([x, y, z]);
  }

  return points;
}

/**
 * Generate circular orbit path
 */
function generateCircularOrbit(radius: number, segments: number): Vec3[] {
  const points: Vec3[] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const z = 0;

    points.push([x, y, z]);
  }

  return points;
}

/**
 * Format delta-V value
 */
function formatDeltaV(dv: number): string {
  return `${(dv * 1000).toFixed(0)} m/s`;
}

/**
 * Format time duration
 */
function formatTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export const OrbitTransferPlanner: React.FC<OrbitTransferPlannerProps> = ({
  initialRadius,
  finalRadius,
  transferType,
  intermediateRadius,
  mu = 398600.4418, // Earth
  initialColor = "#00ff00",
  transferColor = "#ffaa00",
  finalColor = "#ff00ff",
  showStats = true,
  segments = 128,
  lineWidth = 2,
  showBurns = true,
}) => {
  // Calculate transfer
  const transfer = React.useMemo(() => {
    if (transferType === "hohmann") {
      return calculateHohmannTransfer(initialRadius, finalRadius, mu);
    } else {
      const rb = intermediateRadius || finalRadius * 2;
      return calculateBiEllipticTransfer(initialRadius, finalRadius, rb, mu);
    }
  }, [initialRadius, finalRadius, transferType, intermediateRadius, mu]);

  // Generate orbit paths
  const initialOrbit = React.useMemo(
    () => generateCircularOrbit(initialRadius, segments),
    [initialRadius, segments]
  );

  const finalOrbit = React.useMemo(
    () => generateCircularOrbit(finalRadius, segments),
    [finalRadius, segments]
  );

  const transferOrbit1 = React.useMemo(
    () =>
      generateEllipticalOrbit(
        transfer.transferOrbit1.a,
        transfer.transferOrbit1.e,
        0,
        Math.PI,
        segments
      ),
    [transfer.transferOrbit1, segments]
  );

  const transferOrbit2 = React.useMemo(() => {
    if (transfer.transferOrbit2) {
      return generateEllipticalOrbit(
        transfer.transferOrbit2.a,
        transfer.transferOrbit2.e,
        Math.PI,
        2 * Math.PI,
        segments
      );
    }
    return null;
  }, [transfer.transferOrbit2, segments]);

  return (
    <group>
      {/* Initial orbit */}
      <Line
        points={initialOrbit}
        color={initialColor}
        lineWidth={lineWidth}
        opacity={0.5}
        transparent
      />

      {/* Final orbit */}
      <Line
        points={finalOrbit}
        color={finalColor}
        lineWidth={lineWidth}
        opacity={0.5}
        transparent
      />

      {/* Transfer orbit 1 */}
      <Line
        points={transferOrbit1}
        color={transferColor}
        lineWidth={lineWidth * 1.5}
        opacity={0.9}
        transparent
      />

      {/* Transfer orbit 2 (bi-elliptic only) */}
      {transferOrbit2 && (
        <Line
          points={transferOrbit2}
          color={transferColor}
          lineWidth={lineWidth * 1.5}
          opacity={0.9}
          transparent
        />
      )}

      {/* Burn markers */}
      {showBurns && (
        <>
          {/* Burn 1 (initial orbit) */}
          <mesh position={[initialRadius, 0, 0]}>
            <sphereGeometry args={[100, 8, 8]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>

          {/* Burn 2 */}
          {transferType === "hohmann" ? (
            <mesh position={[finalRadius, 0, 0]}>
              <sphereGeometry args={[100, 8, 8]} />
              <meshBasicMaterial color="#ff00ff" />
            </mesh>
          ) : (
            <>
              {/* Intermediate burn */}
              <mesh position={[-(intermediateRadius || finalRadius * 2), 0, 0]}>
                <sphereGeometry args={[100, 8, 8]} />
                <meshBasicMaterial color="#ffaa00" />
              </mesh>
              {/* Final burn */}
              <mesh position={[finalRadius, 0, 0]}>
                <sphereGeometry args={[100, 8, 8]} />
                <meshBasicMaterial color="#ff00ff" />
              </mesh>
            </>
          )}
        </>
      )}

      {/* Statistics panel */}
      {showStats && (
        <Html fullscreen>
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              color: "#ffffff",
              fontFamily: "monospace",
              fontSize: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              minWidth: "280px",
            }}
          >
            {/* Header */}
            <div
              style={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                paddingBottom: "8px",
                marginBottom: "12px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              {transferType === "hohmann" ? "HOHMANN TRANSFER" : "BI-ELLIPTIC TRANSFER"}
            </div>

            {/* Delta-V breakdown */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "10px",
                  marginBottom: "8px",
                }}
              >
                DELTA-V BUDGET
              </div>
              <StatRow label="ΔV₁ (Initial)" value={formatDeltaV(transfer.deltaV1)} />
              <StatRow label="ΔV₂ (Transfer)" value={formatDeltaV(transfer.deltaV2)} />
              {transfer.deltaV3 && (
                <StatRow label="ΔV₃ (Final)" value={formatDeltaV(transfer.deltaV3)} />
              )}
              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <StatRow
                  label="Total ΔV"
                  value={formatDeltaV(transfer.totalDeltaV)}
                  highlight
                />
              </div>
            </div>

            {/* Time breakdown */}
            <div>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "10px",
                  marginBottom: "8px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingTop: "12px",
                }}
              >
                TRANSFER TIME
              </div>
              <StatRow label="Leg 1" value={formatTime(transfer.transferTime1)} />
              {transfer.transferTime2 && (
                <StatRow label="Leg 2" value={formatTime(transfer.transferTime2)} />
              )}
              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <StatRow label="Total Time" value={formatTime(transfer.totalTime)} highlight />
              </div>
            </div>

            {/* Orbits info */}
            <div
              style={{
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "10px",
                  marginBottom: "8px",
                }}
              >
                ORBIT PARAMETERS
              </div>
              <StatRow label="Initial radius" value={`${initialRadius.toFixed(0)} km`} />
              <StatRow label="Final radius" value={`${finalRadius.toFixed(0)} km`} />
              <StatRow
                label="Ratio (r₂/r₁)"
                value={(finalRadius / initialRadius).toFixed(2)}
              />
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

/**
 * Helper component for statistics rows
 */
const StatRow: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "6px",
      fontSize: "11px",
    }}
  >
    <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>{label}</span>
    <span
      style={{
        fontWeight: highlight ? "bold" : "normal",
        color: highlight ? "#00ff00" : "#ffffff",
      }}
    >
      {value}
    </span>
  </div>
);

OrbitTransferPlanner.displayName = "OrbitTransferPlanner";
