/**
 * Shared chart utilities
 * Used across all chart components (line-chart, scatter-plot, etc.)
 */

import { useEffect, useState, type RefObject } from "react";

// ============================================================================
// Types
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Axis {
  label?: string;
  domain?: [number, number] | "auto";
  type?: "number" | "log" | "time";
  timezone?: string;
  formatter?: (value: number) => string;
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Hook to observe element resize
 */
export function useResizeObserver(ref: RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

// ============================================================================
// Domain & Scaling
// ============================================================================

/**
 * Calculate domain (min/max) for a set of points
 */
export function getDomain(
  points: Point[],
  accessor: (p: Point) => number,
  addPadding: boolean = true
): [number, number] {
  if (points.length === 0) return [0, 1];

  const values = points.map(accessor);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (!addPadding) return [min, max];

  const padding = (max - min) * 0.1 || 1;
  return [min - padding, max + padding];
}

/**
 * Create a scale function that maps domain to range
 */
export function createScale(
  domain: [number, number],
  range: [number, number],
  type: "number" | "log" = "number"
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;

  if (type === "log") {
    const logMin = Math.log10(d0 || 1);
    const logMax = Math.log10(d1 || 1);
    const slope = (r1 - r0) / (logMax - logMin);
    return (value: number) => {
      const logValue = Math.log10(Math.max(value, 0.0001));
      return r0 + slope * (logValue - logMin);
    };
  }

  const slope = (r1 - r0) / (d1 - d0);
  return (value: number) => r0 + slope * (value - d0);
}

/**
 * Generate evenly spaced tick values
 */
export function getTicks(domain: [number, number], count: number = 5): number[] {
  const [min, max] = domain;
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format number values for display
 */
export function formatValue(value: number): string {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(1);
  return value.toFixed(2);
}

/**
 * Format timestamp values
 */
export function formatTime(timestamp: number, timezone: string = "UTC"): string {
  try {
    const date = new Date(timestamp);
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone,
    });
    return formatter.format(date);
  } catch (error) {
    const date = new Date(timestamp);
    return date.toISOString().substring(11, 19);
  }
}

// ============================================================================
// Data Processing
// ============================================================================

/**
 * Decimate data to reduce point count
 * Uses simple downsampling - for more advanced, use LTTB algorithm from decimation.ts
 */
export function decimateData(data: Point[], maxPoints: number): Point[] {
  if (data.length <= maxPoints) return data;
  const threshold = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % threshold === 0);
}

/**
 * Generate smooth Catmull-Rom spline path
 */
export function generateSmoothPath(
  points: Point[],
  xScale: (x: number) => number,
  yScale: (y: number) => number,
  tension: number = 0.3
): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    const x1 = xScale(points[0].x);
    const y1 = yScale(points[0].y);
    const x2 = xScale(points[1].x);
    const y2 = yScale(points[1].y);
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  let path = "";

  for (let i = 0; i < points.length; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[Math.min(points.length - 1, i + 1)];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const x1 = xScale(p1.x);
    const y1 = yScale(p1.y);
    const x2 = xScale(p2.x);
    const y2 = yScale(p2.y);

    if (i === 0) {
      path = `M ${x1} ${y1}`;
    }

    if (i < points.length - 1) {
      const cp1x = x1 + (xScale(p2.x) - xScale(p0.x)) * tension;
      const cp1y = y1 + (yScale(p2.y) - yScale(p0.y)) * tension;
      const cp2x = x2 - (xScale(p3.x) - xScale(p1.x)) * tension;
      const cp2y = y2 - (yScale(p3.y) - yScale(p1.y)) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    }
  }

  return path;
}

// ============================================================================
// Statistical Functions
// ============================================================================

/**
 * Calculate linear regression
 */
export function linearRegression(points: Point[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = points.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0,
    sumYY = 0;

  points.forEach((p) => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const yMean = sumY / n;
  const ssTotal = sumYY - n * yMean * yMean;
  const ssResidual = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);
  const r2 = 1 - ssResidual / ssTotal;

  return { slope, intercept, r2 };
}
