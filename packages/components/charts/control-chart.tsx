/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
"use client";

import { useMemo } from "react";
import type { Series } from "./line-chart";
import { LineChart } from "./line-chart";
import type { DataPoint } from "../lib/data-utils";

// ============================================================================
// Control Chart Types (Statistical Process Control)
// ============================================================================

export interface ControlLimits {
  /** Target mean value (center line, CL) */
  mean: number;
  /** Process standard deviation */
  stdDev: number;
  /** Upper Control Limit (UCL) multiplier (default: 3 for 3-sigma) */
  uclSigma?: number;
  /** Lower Control Limit (LCL) multiplier (default: 3 for 3-sigma) */
  lclSigma?: number;
  /** Warning limits multiplier (default: 2 for 2-sigma) */
  warningSigma?: number;
}

export interface ControlChartProps {
  /**
   * Measurement data points
   */
  data: DataPoint[];

  /**
   * Control limits configuration
   */
  limits: ControlLimits;

  /**
   * Western Electric rules to check
   * Rule 1: One point beyond 3-sigma
   * Rule 2: 2 out of 3 consecutive points beyond 2-sigma
   * Rule 3: 4 out of 5 consecutive points beyond 1-sigma
   * Rule 4: 8 consecutive points on same side of mean
   */
  rules?: ("rule1" | "rule2" | "rule3" | "rule4")[];

  /**
   * Callback when out-of-control condition detected
   */
  onOutOfControl?: (violations: ControlViolation[]) => void;

  /**
   * Show zones (A, B, C) between control limits
   */
  showZones?: boolean;

  /**
   * Chart appearance
   */
  color?: string;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showTooltip?: boolean;
  preferWebGPU?: boolean;
  className?: string;

  /**
   * Axis configuration
   */
  xAxis?: {
    label?: string;
    domain?: [number, number] | "auto";
    formatter?: (value: number) => string;
  };
  yAxis?: {
    label?: string;
    domain?: [number, number] | "auto";
    formatter?: (value: number) => string;
  };
}

export interface ControlViolation {
  rule: string;
  pointIndices: number[];
  description: string;
}

// ============================================================================
// Western Electric Rules
// ============================================================================

function checkWesternElectricRules(
  data: DataPoint[],
  limits: ControlLimits,
  rules: ("rule1" | "rule2" | "rule3" | "rule4")[]
): ControlViolation[] {
  const violations: ControlViolation[] = [];
  const { mean, stdDev } = limits;
  const ucl3 = mean + 3 * stdDev;
  const lcl3 = mean - 3 * stdDev;
  const ucl2 = mean + 2 * stdDev;
  const lcl2 = mean - 2 * stdDev;
  const ucl1 = mean + 1 * stdDev;
  const lcl1 = mean - 1 * stdDev;

  // Rule 1: One point beyond 3-sigma
  if (rules.includes("rule1")) {
    data.forEach((point, i) => {
      if (point.y > ucl3 || point.y < lcl3) {
        violations.push({
          rule: "Rule 1",
          pointIndices: [i],
          description: `Point ${i + 1} beyond 3-sigma limit`,
        });
      }
    });
  }

  // Rule 2: 2 out of 3 consecutive points beyond 2-sigma (same side)
  if (rules.includes("rule2")) {
    for (let i = 0; i <= data.length - 3; i++) {
      const window = data.slice(i, i + 3);
      const aboveUCL2 = window.filter((p) => p.y > ucl2).length;
      const belowLCL2 = window.filter((p) => p.y < lcl2).length;

      if (aboveUCL2 >= 2 || belowLCL2 >= 2) {
        violations.push({
          rule: "Rule 2",
          pointIndices: [i, i + 1, i + 2],
          description: `2 of 3 consecutive points beyond 2-sigma (points ${
            i + 1
          }-${i + 3})`,
        });
      }
    }
  }

  // Rule 3: 4 out of 5 consecutive points beyond 1-sigma (same side)
  if (rules.includes("rule3")) {
    for (let i = 0; i <= data.length - 5; i++) {
      const window = data.slice(i, i + 5);
      const aboveUCL1 = window.filter((p) => p.y > ucl1).length;
      const belowLCL1 = window.filter((p) => p.y < lcl1).length;

      if (aboveUCL1 >= 4 || belowLCL1 >= 4) {
        violations.push({
          rule: "Rule 3",
          pointIndices: [i, i + 1, i + 2, i + 3, i + 4],
          description: `4 of 5 consecutive points beyond 1-sigma (points ${
            i + 1
          }-${i + 5})`,
        });
      }
    }
  }

  // Rule 4: 8 consecutive points on same side of mean
  if (rules.includes("rule4")) {
    for (let i = 0; i <= data.length - 8; i++) {
      const window = data.slice(i, i + 8);
      const allAbove = window.every((p) => p.y > mean);
      const allBelow = window.every((p) => p.y < mean);

      if (allAbove || allBelow) {
        violations.push({
          rule: "Rule 4",
          pointIndices: Array.from({ length: 8 }, (_, j) => i + j),
          description: `8 consecutive points ${
            allAbove ? "above" : "below"
          } mean (points ${i + 1}-${i + 8})`,
        });
      }
    }
  }

  return violations;
}

// ============================================================================
// Control Chart Component
// ============================================================================

export function ControlChart({
  data,
  limits,
  rules = ["rule1", "rule2", "rule3", "rule4"],
  onOutOfControl,
  showZones = true,
  color = "#3b82f6",
  width = 800,
  height = 400,
  showGrid = true,
  showAxes = true,
  showTooltip = true,
  preferWebGPU = true,
  className,
  xAxis = {},
  yAxis = {},
}: ControlChartProps) {
  const { mean, stdDev, uclSigma = 3, lclSigma = 3, warningSigma = 2 } = limits;

  // Calculate control limits
  const ucl = mean + uclSigma * stdDev;
  const lcl = mean - lclSigma * stdDev;
  const uwl = mean + warningSigma * stdDev; // Upper warning limit
  const lwl = mean - warningSigma * stdDev; // Lower warning limit

  // Check Western Electric rules
  const violations = useMemo(() => {
    const v = checkWesternElectricRules(data, limits, rules);
    if (v.length > 0 && onOutOfControl) {
      onOutOfControl(v);
    }
    return v;
  }, [data, limits, rules, onOutOfControl]);

  // Create series for line chart
  const series: Series[] = useMemo(() => {
    return [
      {
        name: "Measurements",
        data,
        color,
      },
    ];
  }, [data, color]);

  // Auto-calculate Y domain to include control limits with padding
  const yDomain = useMemo((): [number, number] => {
    if (yAxis.domain && yAxis.domain !== "auto") {
      return yAxis.domain;
    }

    const dataMin = Math.min(...data.map((p) => p.y));
    const dataMax = Math.max(...data.map((p) => p.y));
    const min = Math.min(dataMin, lcl);
    const max = Math.max(dataMax, ucl);
    const padding = (max - min) * 0.1;

    return [min - padding, max + padding];
  }, [data, lcl, ucl, yAxis.domain]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <LineChart
        series={series}
        xAxis={{
          ...xAxis,
          label: xAxis.label || "Sample Number",
        }}
        yAxis={{
          ...yAxis,
          label: yAxis.label || "Measurement",
          domain: yDomain,
        }}
        width={width}
        height={height}
        showGrid={showGrid}
        showAxes={showAxes}
        showTooltip={showTooltip}
        preferWebGPU={preferWebGPU}
      />

      <svg
        className="absolute inset-0 pointer-events-none"
        width={width}
        height={height}
        style={{ top: 0, left: 0 }}
      >
        <ControlLimitsOverlay
          mean={mean}
          ucl={ucl}
          lcl={lcl}
          uwl={uwl}
          lwl={lwl}
          yDomain={yDomain}
          width={width}
          height={height}
          showZones={showZones}
          violations={violations}
          data={data}
        />
      </svg>
    </div>
  );
}

// ============================================================================
// Control Limits Overlay Component
// ============================================================================

function ControlLimitsOverlay({
  mean,
  ucl,
  lcl,
  uwl,
  lwl,
  yDomain,
  width,
  height,
  showZones,
  violations,
  data,
}: {
  mean: number;
  ucl: number;
  lcl: number;
  uwl: number;
  lwl: number;
  yDomain: [number, number];
  width: number;
  height: number;
  showZones: boolean;
  violations: ControlViolation[];
  data: DataPoint[];
}) {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const yScale = (y: number) =>
    height -
    margin.bottom -
    ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * innerHeight;

  const meanY = yScale(mean);
  const uclY = yScale(ucl);
  const lclY = yScale(lcl);
  const uwlY = yScale(uwl);
  const lwlY = yScale(lwl);

  // Calculate zone backgrounds (if enabled)
  const zones = showZones ? (
    <>
      {/* Zone A (2-3 sigma) */}
      <rect
        x={margin.left}
        y={uclY}
        width={innerWidth}
        height={uwlY - uclY}
        fill="#fef3c7"
        opacity={0.2}
      />
      <rect
        x={margin.left}
        y={lwlY}
        width={innerWidth}
        height={lclY - lwlY}
        fill="#fef3c7"
        opacity={0.2}
      />

      {/* Zone B (1-2 sigma) */}
      <rect
        x={margin.left}
        y={uwlY}
        width={innerWidth}
        height={yScale(mean + 1 * ((ucl - mean) / 3)) - uwlY}
        fill="#dbeafe"
        opacity={0.2}
      />
      <rect
        x={margin.left}
        y={yScale(mean - 1 * ((mean - lcl) / 3))}
        width={innerWidth}
        height={lwlY - yScale(mean - 1 * ((mean - lcl) / 3))}
        fill="#dbeafe"
        opacity={0.2}
      />

      {/* Zone C (within 1 sigma) - no fill, just central zone */}
    </>
  ) : null;

  // Highlight violation points
  const violationPoints = new Set(violations.flatMap((v) => v.pointIndices));
  const xScale = (x: number) =>
    margin.left +
    ((x - data[0].x) / (data[data.length - 1].x - data[0].x)) * innerWidth;

  return (
    <g>
      {zones}

      {/* Center line (mean) */}
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={meanY}
        y2={meanY}
        stroke="#10b981"
        strokeWidth={2}
        strokeDasharray="none"
      />
      <text
        x={width - margin.right + 5}
        y={meanY + 4}
        fontSize={11}
        fill="#10b981"
        fontWeight="600"
      >
        CL
      </text>

      {/* Upper Control Limit (UCL) */}
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={uclY}
        y2={uclY}
        stroke="#ef4444"
        strokeWidth={2}
        strokeDasharray="5,5"
      />
      <text
        x={width - margin.right + 5}
        y={uclY + 4}
        fontSize={11}
        fill="#ef4444"
        fontWeight="600"
      >
        UCL
      </text>

      {/* Lower Control Limit (LCL) */}
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={lclY}
        y2={lclY}
        stroke="#ef4444"
        strokeWidth={2}
        strokeDasharray="5,5"
      />
      <text
        x={width - margin.right + 5}
        y={lclY + 4}
        fontSize={11}
        fill="#ef4444"
        fontWeight="600"
      >
        LCL
      </text>

      {/* Warning limits (2-sigma) */}
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={uwlY}
        y2={uwlY}
        stroke="#f59e0b"
        strokeWidth={1}
        strokeDasharray="2,2"
        opacity={0.6}
      />
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={lwlY}
        y2={lwlY}
        stroke="#f59e0b"
        strokeWidth={1}
        strokeDasharray="2,2"
        opacity={0.6}
      />

      {/* Violation markers */}
      {data.map((point, i) =>
        violationPoints.has(i) ? (
          <circle
            key={i}
            cx={xScale(point.x)}
            cy={yScale(point.y)}
            r={6}
            fill="none"
            stroke="#dc2626"
            strokeWidth={2}
          />
        ) : null
      )}
    </g>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate control limits from historical data
 * (Use this to establish initial control limits from stable process)
 */
export function calculateControlLimits(data: number[]): ControlLimits {
  if (data.length === 0) {
    return { mean: 0, stdDev: 1 };
  }

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance =
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
}

/**
 * Generate example SPC data for testing
 */
export function generateSPCData(
  n: number,
  mean = 100,
  stdDev = 2,
  driftAfter?: number
): DataPoint[] {
  const data: DataPoint[] = [];

  for (let i = 0; i < n; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Add drift after certain point (simulate process going out of control)
    const drift = driftAfter && i >= driftAfter ? (i - driftAfter) * 0.1 : 0;

    data.push({
      x: i + 1,
      y: mean + drift + z * stdDev,
    });
  }

  return data;
}

export default ControlChart;
