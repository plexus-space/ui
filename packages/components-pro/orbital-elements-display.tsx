"use client";

import * as React from "react";
import { Html } from "@react-three/drei";
import type { OrbitalElements } from "../components/primitives/physics";

/**
 * ORBITAL ELEMENTS DISPLAY - PRO COMPONENT
 *
 * Interactive visualization of Keplerian orbital elements.
 * Displays the six classical orbital elements with scientific accuracy.
 *
 * **ORBITAL ELEMENTS (Classical Keplerian):**
 * - a: Semi-major axis (km) - Size of orbit
 * - e: Eccentricity (0-1) - Shape of orbit (0 = circular, <1 = elliptical)
 * - i: Inclination (deg) - Tilt relative to reference plane
 * - Ω: Longitude of ascending node (deg) - Where orbit crosses reference plane
 * - ω: Argument of periapsis (deg) - Orientation of ellipse in orbital plane
 * - ν: True anomaly (deg) - Position of satellite in orbit
 *
 * **REFERENCES:**
 * [1] Vallado, D. A. (2013). Fundamentals of Astrodynamics and Applications (4th ed.)
 * [2] Curtis, H. D. (2013). Orbital Mechanics for Engineering Students (3rd ed.)
 *
 * **USAGE:**
 * This is a PRO component - compose it with orbit propagator primitives:
 *
 * ```tsx
 * <Canvas>
 *   <OrbitPropagator
 *     satellites={satellites}
 *     onUpdate={(states) => setSatelliteStates(states)}
 *   />
 *   <OrbitalElementsDisplay
 *     elements={satelliteStates[0]?.elements}
 *     position="top-left"
 *   />
 * </Canvas>
 * ```
 */

export interface OrbitalElementsDisplayProps {
  /** Orbital elements to display */
  elements?: OrbitalElements;
  /** Satellite name */
  name?: string;
  /** Position of display panel */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  /** Show period and other derived values */
  showDerived?: boolean;
  /** Gravitational parameter for calculations (km³/s²) */
  mu?: number;
  /** Custom CSS styling */
  style?: React.CSSProperties;
  /** Show/hide panel */
  visible?: boolean;
}

/**
 * Convert radians to degrees
 */
function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Calculate orbital period from semi-major axis
 * T = 2π√(a³/μ)
 */
function calculatePeriod(a: number, mu: number): number {
  return 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu);
}

/**
 * Calculate apoapsis and periapsis
 */
function calculateApsides(a: number, e: number): { apoapsis: number; periapsis: number } {
  return {
    apoapsis: a * (1 + e),
    periapsis: a * (1 - e),
  };
}

/**
 * Format time duration (seconds to human readable)
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Position styles for panel placement
 */
const getPositionStyles = (
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    color: "#ffffff",
    fontFamily: "monospace",
    fontSize: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    minWidth: "280px",
    zIndex: 1000,
  };

  switch (position) {
    case "top-left":
      return { ...baseStyle, top: "20px", left: "20px" };
    case "top-right":
      return { ...baseStyle, top: "20px", right: "20px" };
    case "bottom-left":
      return { ...baseStyle, bottom: "20px", left: "20px" };
    case "bottom-right":
      return { ...baseStyle, bottom: "20px", right: "20px" };
    case "center":
      return {
        ...baseStyle,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    default:
      return { ...baseStyle, top: "20px", left: "20px" };
  }
};

export const OrbitalElementsDisplay: React.FC<OrbitalElementsDisplayProps> = ({
  elements,
  name = "Satellite",
  position = "top-left",
  showDerived = true,
  mu = 398600.4418, // Earth's gravitational parameter (km³/s²)
  style,
  visible = true,
}) => {
  if (!visible || !elements) return null;

  const period = calculatePeriod(elements.semiMajorAxis, mu);
  const { apoapsis, periapsis } = calculateApsides(
    elements.semiMajorAxis,
    elements.eccentricity
  );

  // Convert angles to degrees
  const inclination = rad2deg(elements.inclination);
  const longitudeAscendingNode = rad2deg(elements.longitudeAscendingNode);
  const argumentOfPeriapsis = rad2deg(elements.argumentOfPeriapsis);
  const trueAnomaly = rad2deg(elements.trueAnomaly);

  const panelStyle = { ...getPositionStyles(position), ...style };

  return (
    <Html fullscreen>
      <div style={panelStyle}>
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            paddingBottom: "8px",
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "14px" }}>
            {name}
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            ORBITAL ELEMENTS
          </span>
        </div>

        {/* Classical Elements */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "10px" }}>
              CLASSICAL ELEMENTS
            </div>
          </div>

          <ElementRow
            label="Semi-major axis (a)"
            value={elements.semiMajorAxis.toFixed(2)}
            unit="km"
          />
          <ElementRow
            label="Eccentricity (e)"
            value={elements.eccentricity.toFixed(6)}
            unit=""
          />
          <ElementRow
            label="Inclination (i)"
            value={inclination.toFixed(2)}
            unit="°"
          />
          <ElementRow
            label="RAAN (Ω)"
            value={longitudeAscendingNode.toFixed(2)}
            unit="°"
          />
          <ElementRow
            label="Arg. of Periapsis (ω)"
            value={argumentOfPeriapsis.toFixed(2)}
            unit="°"
          />
          <ElementRow
            label="True Anomaly (ν)"
            value={trueAnomaly.toFixed(2)}
            unit="°"
          />
        </div>

        {/* Derived Parameters */}
        {showDerived && (
          <div>
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "10px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingTop: "12px",
                }}
              >
                DERIVED PARAMETERS
              </div>
            </div>

            <ElementRow
              label="Period"
              value={formatDuration(period)}
              unit=""
            />
            <ElementRow
              label="Apoapsis"
              value={apoapsis.toFixed(2)}
              unit="km"
            />
            <ElementRow
              label="Periapsis"
              value={periapsis.toFixed(2)}
              unit="km"
            />
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "12px",
            paddingTop: "8px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: "9px",
            color: "rgba(255, 255, 255, 0.4)",
            textAlign: "center",
          }}
        >
          J2000 ECI Reference Frame
        </div>
      </div>
    </Html>
  );
};

/**
 * Helper component for rendering element rows
 */
const ElementRow: React.FC<{
  label: string;
  value: string;
  unit: string;
}> = ({ label, value, unit }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "6px",
      fontSize: "11px",
    }}
  >
    <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>{label}</span>
    <span style={{ fontWeight: "bold", color: "#00ff00" }}>
      {value} <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>{unit}</span>
    </span>
  </div>
);

OrbitalElementsDisplay.displayName = "OrbitalElementsDisplay";
