"use client";

/**
 * Chart Grid - SVG Grid Overlay
 *
 * Renders grid lines using SVG for simplicity and compatibility.
 * SVG overlays work perfectly on top of WebGPU canvas.
 */

import * as React from "react";
import type { Margin } from "../lib/types";

// ============================================================================
// Types
// ============================================================================

export interface ChartGridProps {
  /** Canvas element to render on */
  readonly canvas?: HTMLCanvasElement | null;
  /** Canvas width */
  readonly width?: number;
  /** Canvas height */
  readonly height?: number;
  /** Margins */
  readonly margin?: Margin;
  /** Number of horizontal grid lines (default: 5) */
  readonly horizontalLines?: number;
  /** Number of vertical grid lines (default: 10) */
  readonly verticalLines?: number;
  /** Grid line color [r, g, b, a] (default: [1, 1, 1, 0.1]) */
  readonly gridColor?: readonly [number, number, number, number];
  /** Grid line thickness in pixels (default: 1) */
  readonly thickness?: number;
  /** Show major grid lines with different styling */
  readonly showMajorLines?: boolean;
  /** Interval for major lines (default: every 5th line) */
  readonly majorInterval?: number;
  /** Major line color [r, g, b, a] (default: [1, 1, 1, 0.2]) */
  readonly majorColor?: readonly [number, number, number, number];
  /** Major line thickness in pixels (default: 1.5) */
  readonly majorThickness?: number;
}

// ============================================================================
// Component
// ============================================================================

const DEFAULT_MARGIN: Margin = { top: 40, right: 40, bottom: 60, left: 70 };

export const ChartGrid: React.FC<ChartGridProps> = ({
  canvas: canvasProp,
  width: widthProp,
  height: heightProp,
  margin: marginProp,
  horizontalLines = 5,
  verticalLines = 10,
  gridColor = [1, 1, 1, 0.1],
  thickness = 1,
  showMajorLines = false,
  majorInterval = 5,
  majorColor = [1, 1, 1, 0.2],
  majorThickness = 1.5,
}) => {
  // Try to get from WaveformMonitor context if not provided
  let contextCanvas = null;
  let contextWidth = widthProp;
  let contextHeight = heightProp;
  let contextMargin = marginProp;

  const width = contextWidth || 800;
  const height = contextHeight || 400;
  const margin = contextMargin || DEFAULT_MARGIN;

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const rgbaToCSS = (color: readonly [number, number, number, number]) =>
    `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${
      color[3]
    })`;

  const gridColorCSS = rgbaToCSS(gridColor);
  const majorColorCSS = showMajorLines ? rgbaToCSS(majorColor) : gridColorCSS;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: "none",
      }}
      width={width}
      height={height}
    >
      {/* Horizontal grid lines */}
      {Array.from({ length: horizontalLines + 1 }).map((_, i) => {
        const fraction = i / horizontalLines;
        const y = margin.top + plotHeight * fraction;
        const x1 = margin.left;
        const x2 = margin.left + plotWidth;

        const isMajor = showMajorLines && i % majorInterval === 0;
        const color = isMajor ? majorColorCSS : gridColorCSS;
        const lineThickness = isMajor ? majorThickness : thickness;

        return (
          <line
            key={`h-${i}`}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={color}
            strokeWidth={lineThickness}
          />
        );
      })}

      {/* Vertical grid lines */}
      {Array.from({ length: verticalLines + 1 }).map((_, i) => {
        const fraction = i / verticalLines;
        const x = margin.left + plotWidth * fraction;
        const y1 = margin.top;
        const y2 = margin.top + plotHeight;

        const isMajor = showMajorLines && i % majorInterval === 0;
        const color = isMajor ? majorColorCSS : gridColorCSS;
        const lineThickness = isMajor ? majorThickness : thickness;

        return (
          <line
            key={`v-${i}`}
            x1={x}
            y1={y1}
            x2={x}
            y2={y2}
            stroke={color}
            strokeWidth={lineThickness}
          />
        );
      })}
    </svg>
  );
};

ChartGrid.displayName = "ChartGrid";
