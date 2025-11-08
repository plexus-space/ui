"use client";

/**
 * Chart Axes - WebGPU-Accelerated Axes with Labels
 *
 * Renders axis lines using WebGPU shape renderer and labels using MSDF text.
 * Integrates with ChartContainer for automatic domain mapping and formatting.
 */

import * as React from "react";
import { WebGPU2DRenderer } from "./shape-2d-renderer";
import { createLine, type Shape } from "./shape-2d-renderer";
import type { Domain2D, Margin } from "../lib/types";

// ============================================================================
// Types
// ============================================================================

export interface ChartAxesProps {
  /** Canvas element */
  readonly canvas?: HTMLCanvasElement | null;
  /** Canvas width */
  readonly width?: number;
  /** Canvas height */
  readonly height?: number;
  /** Margins */
  readonly margin?: Margin;
  /** X domain */
  readonly xDomain?: Domain2D;
  /** Y domain */
  readonly yDomain?: Domain2D;
  /** X axis label */
  readonly xLabel?: string;
  /** Y axis label */
  readonly yLabel?: string;
  /** Number of X axis ticks (default: 10) */
  readonly xTicks?: number;
  /** Number of Y axis ticks (default: 5) */
  readonly yTicks?: number;
  /** Axis line color [r, g, b, a] (default: [1, 1, 1, 0.3]) */
  readonly axisColor?: readonly [number, number, number, number];
  /** Axis line thickness (default: 1) */
  readonly thickness?: number;
  /** Tick length in pixels (default: 5) */
  readonly tickLength?: number;
  /** Label font size (default: 10) */
  readonly labelFontSize?: number;
  /** Format function for X tick values */
  readonly formatX?: (value: number) => string;
  /** Format function for Y tick values */
  readonly formatY?: (value: number) => string;
}

// ============================================================================
// Default Formatters
// ============================================================================

const defaultFormatter = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return value.toExponential(1);
  }
  if (Math.abs(value) < 0.01 && value !== 0) {
    return value.toExponential(1);
  }
  return value.toFixed(2);
};

// ============================================================================
// Component
// ============================================================================

const DEFAULT_MARGIN: Margin = { top: 40, right: 40, bottom: 60, left: 70 };
const DEFAULT_DOMAIN: Domain2D = [0, 1];

export const ChartAxes: React.FC<ChartAxesProps> = ({
  canvas: canvasProp,
  width: widthProp,
  height: heightProp,
  margin: marginProp,
  xDomain: xDomainProp,
  yDomain: yDomainProp,
  xLabel,
  yLabel,
  xTicks = 10,
  yTicks = 5,
  axisColor = [1, 1, 1, 0.3],
  thickness = 1,
  tickLength = 5,
  labelFontSize = 10,
  formatX = defaultFormatter,
  formatY = defaultFormatter,
}) => {
  // Try to get from WaveformMonitor context if not provided
  let contextCanvas = null;
  let contextWidth = widthProp;
  let contextHeight = heightProp;
  let contextMargin = marginProp;
  let contextXDomain = xDomainProp;
  let contextYDomain = yDomainProp;

  const canvas = canvasProp ?? contextCanvas;
  const width = contextWidth || 800;
  const height = contextHeight || 400;
  const margin = contextMargin || DEFAULT_MARGIN;
  const xDomain = contextXDomain || DEFAULT_DOMAIN;
  const yDomain = contextYDomain || DEFAULT_DOMAIN;

  // Generate axis shapes
  const axisShapes = React.useMemo((): Shape[] => {
    if (!canvas) return [];

    const shapes: Shape[] = [];
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // X axis line
    const xAxisY = height - margin.bottom;
    shapes.push(
      createLine(
        margin.left,
        xAxisY,
        margin.left + plotWidth,
        xAxisY,
        thickness,
        axisColor
      )
    );

    // Y axis line
    shapes.push(
      createLine(
        margin.left,
        margin.top,
        margin.left,
        margin.top + plotHeight,
        thickness,
        axisColor
      )
    );

    // X axis ticks
    for (let i = 0; i <= xTicks; i++) {
      const fraction = i / xTicks;
      const x = margin.left + plotWidth * fraction;
      shapes.push(
        createLine(x, xAxisY, x, xAxisY + tickLength, thickness, axisColor)
      );
    }

    // Y axis ticks
    for (let i = 0; i <= yTicks; i++) {
      const fraction = i / yTicks;
      const y = margin.top + plotHeight * fraction;
      shapes.push(
        createLine(
          margin.left - tickLength,
          y,
          margin.left,
          y,
          thickness,
          axisColor
        )
      );
    }

    return shapes;
  }, [
    canvas,
    width,
    height,
    margin,
    xTicks,
    yTicks,
    thickness,
    tickLength,
    axisColor,
  ]);

  // Generate tick labels
  const tickLabels = React.useMemo(() => {
    if (!canvas) return { xLabels: [], yLabels: [] };

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const xAxisY = height - margin.bottom;

    // X tick labels
    const xLabels: Array<{ x: number; y: number; text: string }> = [];
    const [xMin, xMax] = xDomain;
    const xRange = xMax - xMin;

    for (let i = 0; i <= xTicks; i++) {
      const fraction = i / xTicks;
      const value = xMin + fraction * xRange;
      const x = margin.left + plotWidth * fraction;
      xLabels.push({
        x,
        y: xAxisY + tickLength + 12,
        text: formatX(value),
      });
    }

    // Y tick labels
    const yLabels: Array<{ x: number; y: number; text: string }> = [];
    const [yMin, yMax] = yDomain;
    const yRange = yMax - yMin;

    for (let i = 0; i <= yTicks; i++) {
      const fraction = i / yTicks;
      const value = yMin + fraction * yRange;
      const y = margin.top + plotHeight * (1 - fraction); // Inverted
      yLabels.push({
        x: margin.left - tickLength - 5,
        y,
        text: formatY(value),
      });
    }

    return { xLabels, yLabels };
  }, [
    canvas,
    width,
    height,
    margin,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    formatX,
    formatY,
    tickLength,
  ]);

  if (!canvas) return null;

  return (
    <>
      {/* Axis lines and ticks */}
      <WebGPU2DRenderer
        canvas={canvas}
        shapes={axisShapes}
        width={width}
        height={height}
      />

      {/* Tick labels using HTML for now (can be replaced with MSDF text later) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          pointerEvents: "none",
        }}
      >
        {/* X tick labels */}
        {tickLabels.xLabels.map((label, i) => (
          <div
            key={`x-${i}`}
            style={{
              position: "absolute",
              left: label.x,
              top: label.y,
              transform: "translateX(-50%)",
              fontSize: labelFontSize,
              color: "currentColor",
              opacity: 0.6,
              fontFamily: "monospace",
            }}
          >
            {label.text}
          </div>
        ))}

        {/* Y tick labels */}
        {tickLabels.yLabels.map((label, i) => (
          <div
            key={`y-${i}`}
            style={{
              position: "absolute",
              left: label.x,
              top: label.y,
              transform: "translate(-100%, -50%)",
              fontSize: labelFontSize,
              color: "currentColor",
              opacity: 0.6,
              fontFamily: "monospace",
              textAlign: "right",
            }}
          >
            {label.text}
          </div>
        ))}

        {/* Axis labels */}
        {xLabel && (
          <div
            style={{
              position: "absolute",
              left: margin.left + (width - margin.left - margin.right) / 2,
              top: height - 5,
              transform: "translateX(-50%)",
              fontSize: labelFontSize + 2,
              color: "currentColor",
              opacity: 0.8,
              fontWeight: 500,
            }}
          >
            {xLabel}
          </div>
        )}

        {yLabel && (
          <div
            style={{
              position: "absolute",
              left: 10,
              top: margin.top + (height - margin.top - margin.bottom) / 2,
              transform: `rotate(-90deg) translateX(-50%)`,
              transformOrigin: "left center",
              fontSize: labelFontSize + 2,
              color: "currentColor",
              opacity: 0.8,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {yLabel}
          </div>
        )}
      </div>
    </>
  );
};

ChartAxes.displayName = "ChartAxes";
