"use client";

import * as React from "react";
import {
  cn,
  getDomain,
  createScale,
  formatValue,
  formatTime,
  getTicks,
  type Point,
} from "./lib";

// ============================================================================
// Types
// ============================================================================

export interface ScatterPoint extends Point {
  label?: string;
  metadata?: Record<string, any>;
}

export interface ScatterSeries {
  name: string;
  data: ScatterPoint[];
  color?: string;
  radius?: number;
  opacity?: number;
  cluster?: number; // Optional cluster assignment
}

export interface Axis {
  label?: string;
  domain?: [number, number] | "auto";
  type?: "number" | "time";
  timezone?: string;
  formatter?: (value: number) => string;
}

export type ScatterPlotVariant =
  | "default"
  | "minimal"
  | "scientific"
  | "dashboard";

export interface ScatterPlotRootProps {
  series: ScatterSeries[];
  xAxis?: Axis;
  yAxis?: Axis;
  width?: number;
  height?: number;
  /** Visual variant style */
  variant?: ScatterPlotVariant;
  /** Enable zoom and pan interactions */
  enableZoom?: boolean;
  /** Enable animations */
  animate?: boolean;
  /** Show regression line */
  showRegression?: boolean;
  /** Snap radius in pixels for point detection (default: 30) */
  snapRadius?: number;
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface ScatterPlotContext {
  series: ScatterSeries[];
  xAxis: Axis;
  yAxis: Axis;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
  hoveredPoint: { seriesIdx: number; pointIdx: number } | null;
  setHoveredPoint: (
    point: { seriesIdx: number; pointIdx: number } | null
  ) => void;
  hiddenSeries: Set<number>;
  toggleSeries: (idx: number) => void;
  variant: ScatterPlotVariant;
  animate: boolean;
  enableZoom: boolean;
  showRegression: boolean;
  snapRadius: number;
}

const ScatterPlotContext = React.createContext<ScatterPlotContext | null>(null);

function useScatterPlot() {
  const ctx = React.useContext(ScatterPlotContext);
  if (!ctx)
    throw new Error("useScatterPlot must be used within ScatterPlot.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function calculateLinearRegression(points: ScatterPoint[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

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

  const yMean = sumY / n;
  const ssTotal = sumYY - n * yMean * yMean;
  const ssResidual = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);
  const r2 = 1 - ssResidual / ssTotal;

  return { slope, intercept, r2 };
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const ScatterPlotRoot = React.forwardRef<HTMLDivElement, ScatterPlotRootProps>(
  (
    {
      series,
      xAxis = {},
      yAxis = {},
      width = 800,
      height = 400,
      variant = "default",
      enableZoom = false,
      animate = false,
      showRegression = false,
      snapRadius = 30,
      className,
      children,
    },
    ref
  ) => {
    const [hoveredPoint, setHoveredPoint] = React.useState<{
      seriesIdx: number;
      pointIdx: number;
    } | null>(null);
    const [hiddenSeries, setHiddenSeries] = React.useState<Set<number>>(
      new Set()
    );

    const toggleSeries = React.useCallback((idx: number) => {
      setHiddenSeries((prev) => {
        const next = new Set(prev);
        if (next.has(idx)) {
          next.delete(idx);
        } else {
          next.add(idx);
        }
        return next;
      });
    }, []);

    // Margins
    const margin = React.useMemo(
      () => ({
        top: 30,
        right: 30,
        bottom: 60,
        left: 70,
      }),
      []
    );

    // Calculate domains
    const allPoints = series.flatMap((s) => s.data);
    const xDomain: [number, number] =
      xAxis.domain === "auto" || !xAxis.domain
        ? getDomain(allPoints, (p) => p.x, false)
        : xAxis.domain;
    const yDomain: [number, number] =
      yAxis.domain === "auto" || !yAxis.domain
        ? getDomain(allPoints, (p) => p.y, true)
        : yAxis.domain;

    // Create scales
    const xScale = React.useMemo(
      () => createScale(xDomain, [margin.left, width - margin.right]),
      [xDomain, margin.left, margin.right, width]
    );

    const yScale = React.useMemo(
      () => createScale(yDomain, [height - margin.bottom, margin.top]),
      [yDomain, height, margin.bottom, margin.top]
    );

    // Generate ticks
    const xTicks = React.useMemo(() => getTicks(xDomain, 6), [xDomain]);
    const yTicks = React.useMemo(() => getTicks(yDomain, 6), [yDomain]);

    const contextValue: ScatterPlotContext = React.useMemo(
      () => ({
        series,
        xAxis,
        yAxis,
        width,
        height,
        margin,
        xScale,
        yScale,
        xDomain,
        yDomain,
        xTicks,
        yTicks,
        hoveredPoint,
        setHoveredPoint,
        hiddenSeries,
        toggleSeries,
        variant,
        animate,
        enableZoom,
        showRegression,
        snapRadius,
      }),
      [
        series,
        xAxis,
        yAxis,
        width,
        height,
        margin,
        xScale,
        yScale,
        xDomain,
        yDomain,
        xTicks,
        yTicks,
        hoveredPoint,
        hiddenSeries,
        toggleSeries,
        variant,
        animate,
        enableZoom,
        showRegression,
        snapRadius,
      ]
    );

    return (
      <ScatterPlotContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("scatter-plot", className)}
          style={{
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {children}
        </div>
      </ScatterPlotContext.Provider>
    );
  }
);

ScatterPlotRoot.displayName = "ScatterPlot.Root";

/**
 * Container component - wraps the SVG content
 */
const ScatterPlotContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, children, ...props }, ref) => {
  const { height } = useScatterPlot();

  return (
    <div
      ref={ref}
      className={cn("scatter-plot-container", className)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        height: `${height}px`,
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        overflow: "visible",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

ScatterPlotContainer.displayName = "ScatterPlot.Container";

/**
 * Viewport component - SVG canvas
 */
const ScatterPlotViewport = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, children, ...props }, ref) => {
  const { width, height } = useScatterPlot();

  return (
    <svg
      ref={ref}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("scatter-plot-svg", className)}
      style={{ display: "block", userSelect: "none", maxWidth: "100%" }}
      role="img"
      aria-label="Scatter plot"
      {...props}
    >
      {children}
    </svg>
  );
});

ScatterPlotViewport.displayName = "ScatterPlot.Viewport";

export interface ScatterPlotGridProps extends React.SVGProps<SVGGElement> {
  /** Stroke color for grid lines */
  stroke?: string;
  /** Stroke width for grid lines */
  strokeWidth?: number;
  /** Opacity for grid lines */
  opacity?: number;
}

/**
 * Grid component - renders grid lines
 */
const ScatterPlotGrid = React.forwardRef<SVGGElement, ScatterPlotGridProps>(
  ({ className, stroke = "currentColor", strokeWidth = 1, opacity = 0.1, ...props }, ref) => {
    const { xTicks, yTicks, xScale, yScale, margin, width, height, animate } =
      useScatterPlot();

    return (
      <g ref={ref} className={cn("scatter-plot-grid", className)} {...props}>
      {/* Vertical grid lines */}
      {xTicks.map((tick, i) => (
        <line
          key={`vgrid-${i}`}
          x1={xScale(tick)}
          y1={margin.top}
          x2={xScale(tick)}
          y2={height - margin.bottom}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          style={
            animate
              ? {
                  animation: `fadeIn 0.3s ease ${i * 0.03}s forwards`,
                  opacity: 0,
                }
              : undefined
          }
        />
      ))}
      {/* Horizontal grid lines */}
      {yTicks.map((tick, i) => (
        <line
          key={`hgrid-${i}`}
          x1={margin.left}
          y1={yScale(tick)}
          x2={width - margin.right}
          y2={yScale(tick)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          style={
            animate
              ? {
                  animation: `fadeIn 0.3s ease ${i * 0.03}s forwards`,
                  opacity: 0,
                }
              : undefined
          }
        />
      ))}
      </g>
    );
  }
);

ScatterPlotGrid.displayName = "ScatterPlot.Grid";

/**
 * Axes component - renders X and Y axes with labels
 */
const ScatterPlotAxes = React.forwardRef<
  SVGGElement,
  React.SVGProps<SVGGElement>
>(({ className, ...props }, ref) => {
  const {
    xTicks,
    yTicks,
    xScale,
    yScale,
    margin,
    width,
    height,
    xAxis,
    yAxis,
  } = useScatterPlot();

  const formatTick = (value: number, axis: Axis): string => {
    if (axis.formatter) return axis.formatter(value);
    if (axis.type === "time") {
      const timezone = axis.timezone || "UTC";
      return formatTime(value, timezone);
    }
    return formatValue(value);
  };

    return (
      <g ref={ref} className={cn("scatter-plot-axes", className)} {...props}>
      {/* X-axis */}
      <line
        x1={margin.left}
        y1={height - margin.bottom}
        x2={width - margin.right}
        y2={height - margin.bottom}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.2}
      />
      {xTicks.map((tick, i) => (
        <g key={`xtick-${i}`}>
          <line
            x1={xScale(tick)}
            y1={height - margin.bottom}
            x2={xScale(tick)}
            y2={height - margin.bottom + 6}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.2}
          />
          <text
            x={xScale(tick)}
            y={height - margin.bottom + 20}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            opacity={0.6}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatTick(tick, xAxis)}
          </text>
        </g>
      ))}
      {xAxis.label && (
        <text
          x={(margin.left + width - margin.right) / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize={12}
          fontWeight={500}
          fill="currentColor"
          opacity={0.7}
        >
          {xAxis.label}
        </text>
      )}

      {/* Y-axis */}
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={height - margin.bottom}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.2}
      />
      {yTicks.map((tick, i) => (
        <g key={`ytick-${i}`}>
          <line
            x1={margin.left - 6}
            y1={yScale(tick)}
            x2={margin.left}
            y2={yScale(tick)}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.2}
          />
          <text
            x={margin.left - 10}
            y={yScale(tick) + 4}
            textAnchor="end"
            fontSize={10}
            fill="currentColor"
            opacity={0.6}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatTick(tick, yAxis)}
          </text>
        </g>
      ))}
      {yAxis.label && (
        <text
          x={margin.left - 50}
          y={(margin.top + height - margin.bottom) / 2}
          textAnchor="middle"
          fontSize={12}
          fontWeight={500}
          fill="currentColor"
          opacity={0.7}
          transform={`rotate(-90 ${margin.left - 50} ${
            (margin.top + height - margin.bottom) / 2
          })`}
        >
          {yAxis.label}
        </text>
      )}
      </g>
    );
  }
);

ScatterPlotAxes.displayName = "ScatterPlot.Axes";

export interface ScatterPlotPointsProps extends React.SVGProps<SVGGElement> {
  /** Multiplier for point radius when hovered (default: 1.5) */
  hoverRadiusMultiplier?: number;
  /** Stroke width when point is hovered */
  hoverStrokeWidth?: number;
  /** Default stroke width for points */
  defaultStrokeWidth?: number;
}

/**
 * Points component - renders scatter points
 */
const ScatterPlotPoints = React.forwardRef<SVGGElement, ScatterPlotPointsProps>(
  ({ className, hoverRadiusMultiplier = 1.5, hoverStrokeWidth = 2, defaultStrokeWidth = 1, ...props }, ref) => {
    const { series, xScale, yScale, hiddenSeries, animate, hoveredPoint } =
      useScatterPlot();

    return (
      <g ref={ref} className={cn("scatter-plot-points", className)} {...props}>
      {series.map((s, seriesIdx) => {
        if (s.data.length === 0 || hiddenSeries.has(seriesIdx)) return null;

        const color = s.color || "#64748b";
        const radius = s.radius || 4;
        const opacity = s.opacity || 0.7;

        return (
          <g key={seriesIdx}>
            {s.data.map((point, pointIdx) => {
              const isHovered =
                hoveredPoint?.seriesIdx === seriesIdx &&
                hoveredPoint?.pointIdx === pointIdx;

              return (
                <circle
                  key={pointIdx}
                  cx={xScale(point.x)}
                  cy={yScale(point.y)}
                  r={isHovered ? radius * hoverRadiusMultiplier : radius}
                  fill={color}
                  strokeWidth={isHovered ? hoverStrokeWidth : defaultStrokeWidth}
                  opacity={isHovered ? 1 : opacity}
                  style={
                    animate
                      ? {
                          animation: `fadeIn 0.3s ease ${
                            pointIdx * 0.01
                          }s forwards`,
                          opacity: 0,
                        }
                      : undefined
                  }
                />
              );
            })}
          </g>
        );
      })}
      </g>
    );
  }
);

ScatterPlotPoints.displayName = "ScatterPlot.Points";

export interface ScatterPlotRegressionProps extends React.SVGProps<SVGGElement> {
  /** Stroke width for regression line */
  strokeWidth?: number;
  /** Stroke dash array for regression line */
  strokeDasharray?: string;
  /** Opacity for regression line */
  opacity?: number;
}

/**
 * Regression line component - shows trend line
 */
const ScatterPlotRegression = React.forwardRef<
  SVGGElement,
  ScatterPlotRegressionProps
>(({ className, strokeWidth = 2, strokeDasharray = "6,6", opacity = 0.5, ...props }, ref) => {
  const { series, xScale, yScale, xDomain, hiddenSeries, showRegression } =
    useScatterPlot();

  if (!showRegression) return null;

  return (
    <g ref={ref} className={cn("scatter-plot-regression", className)} {...props}>
      {series.map((s, seriesIdx) => {
        if (s.data.length === 0 || hiddenSeries.has(seriesIdx)) return null;

        const { slope, intercept, r2 } = calculateLinearRegression(s.data);
        const color = s.color || "#64748b";

        const x1 = xDomain[0];
        const y1 = slope * x1 + intercept;
        const x2 = xDomain[1];
        const y2 = slope * x2 + intercept;

        return (
          <g key={seriesIdx}>
            <line
              x1={xScale(x1)}
              y1={yScale(y1)}
              x2={xScale(x2)}
              y2={yScale(y2)}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              opacity={opacity}
            />
            <text
              x={xScale(x2)}
              y={yScale(y2) - 10}
              fontSize={10}
              fill={color}
              opacity={0.7}
            >
              R² = {r2.toFixed(3)}
            </text>
          </g>
        );
      })}
    </g>
  );
});

ScatterPlotRegression.displayName = "ScatterPlot.Regression";

/**
 * Tooltip component - interactive tooltip on hover
 */
const ScatterPlotTooltip = React.forwardRef<
  SVGGElement,
  React.SVGProps<SVGGElement>
>(({ className, ...props }, ref) => {
  const {
    hoveredPoint,
    series,
    xScale,
    yScale,
    xAxis,
    yAxis,
    width,
    height,
    margin,
  } = useScatterPlot();

  if (!hoveredPoint) return null;

  const s = series[hoveredPoint.seriesIdx];
  if (!s) return null;

  const point = s.data[hoveredPoint.pointIdx];
  const px = xScale(point.x);
  const py = yScale(point.y);
  const color = s.color || "#64748b";

  const xLabel =
    xAxis.type === "time"
      ? new Date(point.x).toLocaleString()
      : xAxis.formatter?.(point.x) ?? formatValue(point.x);
  const yLabel = yAxis.formatter?.(point.y) ?? formatValue(point.y);

  // Smart positioning
  const tooltipWidth = 180;
  const tooltipHeight = point.label ? 90 : 70;
  const offsetX = px > width / 2 ? -tooltipWidth - 10 : 10;
  const offsetY = py > height / 2 ? -tooltipHeight - 10 : 10;

  return (
    <g
      ref={ref}
      className={cn("scatter-plot-tooltip", className)}
      style={{ pointerEvents: "none" }}
      {...props}
    >
      {/* Crosshair - clipped to chart area */}
      <line
        x1={px}
        y1={margin.top}
        x2={px}
        y2={height - margin.bottom}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.3}
      />
      <line
        x1={margin.left}
        y1={py}
        x2={width - margin.right}
        y2={py}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.3}
      />

      {/* Point indicator */}
      <circle
        cx={px}
        cy={py}
        r={8}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={0.5}
      />

      {/* Tooltip box */}
      <rect
        x={px + offsetX}
        y={py + offsetY}
        width={tooltipWidth}
        height={tooltipHeight}
        rx={6}
        fill="currentColor"
        opacity={0.95}
      />
      <text
        x={px + offsetX + 10}
        y={py + offsetY + 20}
        fontSize={11}
        fontWeight={600}
        fill="white"
        style={{ mixBlendMode: "difference" }}
      >
        {s.name}
      </text>
      {point.label && (
        <text
          x={px + offsetX + 10}
          y={py + offsetY + 38}
          fontSize={10}
          fill="white"
          opacity={0.8}
          style={{ mixBlendMode: "difference" }}
        >
          {point.label}
        </text>
      )}
      <text
        x={px + offsetX + 10}
        y={py + offsetY + (point.label ? 54 : 38)}
        fontSize={10}
        fill="white"
        opacity={0.8}
        style={{ mixBlendMode: "difference" }}
      >
        {xAxis.label || "X"}: {xLabel}
      </text>
      <text
        x={px + offsetX + 10}
        y={py + offsetY + (point.label ? 70 : 54)}
        fontSize={10}
        fill="white"
        opacity={0.8}
        style={{ mixBlendMode: "difference" }}
      >
        {yAxis.label || "Y"}: {yLabel}
      </text>
    </g>
  );
});

ScatterPlotTooltip.displayName = "ScatterPlot.Tooltip";

export interface ScatterPlotInteractionProps extends React.SVGProps<SVGRectElement> {
  /** Callback when point is hovered */
  onPointHover?: (point: { seriesIdx: number; pointIdx: number } | null) => void;
  /** Callback when point is clicked */
  onPointClick?: (point: { seriesIdx: number; pointIdx: number }) => void;
}

/**
 * Interaction layer component - handles mouse events
 */
const ScatterPlotInteraction = React.forwardRef<
  SVGRectElement,
  ScatterPlotInteractionProps
>(({ className, onPointHover, onPointClick, ...props }, ref) => {
  const {
    margin,
    width,
    height,
    series,
    xScale,
    yScale,
    setHoveredPoint,
    hoveredPoint,
    snapRadius,
    hiddenSeries,
  } = useScatterPlot();

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;

      // Use SVG coordinate transformation to handle viewBox scaling correctly
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      const mouseX = svgP.x;
      const mouseY = svgP.y;

      let nearestSeriesIdx = 0;
      let nearestPointIdx = 0;
      let minDist = Infinity;

      series.forEach((s, seriesIdx) => {
        if (hiddenSeries.has(seriesIdx)) return;

        s.data.forEach((point, pointIdx) => {
          const px = xScale(point.x);
          const py = yScale(point.y);
          const dist = Math.sqrt(
            Math.pow(px - mouseX, 2) + Math.pow(py - mouseY, 2)
          );

          if (dist < minDist) {
            minDist = dist;
            nearestSeriesIdx = seriesIdx;
            nearestPointIdx = pointIdx;
          }
        });
      });

      const currentSnapRadius = snapRadius;
      const releaseRadius = snapRadius * 1.3;

      if (minDist < currentSnapRadius) {
        if (
          hoveredPoint?.seriesIdx !== nearestSeriesIdx ||
          hoveredPoint?.pointIdx !== nearestPointIdx
        ) {
          const point = { seriesIdx: nearestSeriesIdx, pointIdx: nearestPointIdx };
          setHoveredPoint(point);
          onPointHover?.(point);
        }
      } else if (minDist > releaseRadius) {
        if (hoveredPoint !== null) {
          setHoveredPoint(null);
          onPointHover?.(null);
        }
      }
    },
    [
      series,
      xScale,
      yScale,
      snapRadius,
      hiddenSeries,
      hoveredPoint,
      setHoveredPoint,
      onPointHover,
    ]
  );

  const handleMouseLeave = React.useCallback(() => {
    setHoveredPoint(null);
    onPointHover?.(null);
  }, [setHoveredPoint, onPointHover]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (!onPointClick) return;

      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;

      // Use SVG coordinate transformation to handle viewBox scaling correctly
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      const mouseX = svgP.x;
      const mouseY = svgP.y;

      let nearestSeriesIdx = 0;
      let nearestPointIdx = 0;
      let minDist = Infinity;

      series.forEach((s, seriesIdx) => {
        if (hiddenSeries.has(seriesIdx)) return;

        s.data.forEach((point, pointIdx) => {
          const px = xScale(point.x);
          const py = yScale(point.y);
          const dist = Math.sqrt(
            Math.pow(px - mouseX, 2) + Math.pow(py - mouseY, 2)
          );

          if (dist < minDist) {
            minDist = dist;
            nearestSeriesIdx = seriesIdx;
            nearestPointIdx = pointIdx;
          }
        });
      });

      if (minDist < snapRadius) {
        onPointClick({ seriesIdx: nearestSeriesIdx, pointIdx: nearestPointIdx });
      }
    },
    [onPointClick, series, xScale, yScale, snapRadius, hiddenSeries]
  );

  return (
    <rect
      ref={ref}
      x={margin.left}
      y={margin.top}
      width={width - margin.left - margin.right}
      height={height - margin.top - margin.bottom}
      fill="transparent"
      className={cn("scatter-plot-interaction", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ cursor: "crosshair" }}
      {...props}
    />
  );
});

ScatterPlotInteraction.displayName = "ScatterPlot.Interaction";

export interface ScatterPlotLegendProps extends React.SVGProps<SVGGElement> {
  interactive?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

/**
 * Legend component - SVG-based legend inside the chart
 */
const ScatterPlotLegend = React.forwardRef<
  SVGGElement,
  ScatterPlotLegendProps
>(({ className, interactive = false, position = "top-right", ...props }, ref) => {
    const { series, width, margin, height, hiddenSeries, toggleSeries } =
      useScatterPlot();

    // Calculate position based on prop
    const getPosition = () => {
      const padding = 10;
      switch (position) {
        case "top-left":
          return { x: margin.left + padding, y: margin.top + padding };
        case "bottom-left":
          return {
            x: margin.left + padding,
            y: height - margin.bottom - series.length * 24 - padding,
          };
        case "bottom-right":
          return {
            x: width - margin.right - 150,
            y: height - margin.bottom - series.length * 24 - padding,
          };
        case "top-right":
        default:
          return { x: width - margin.right - 150, y: margin.top + padding };
      }
    };

    const { x: baseX, y: baseY } = getPosition();

    return (
      <g ref={ref} className={cn("scatter-plot-legend", className)} {...props}>
        {/* Background for better readability */}
        <rect
          x={baseX - 5}
          y={baseY - 10}
          width={145}
          height={series.length * 24 + 10}
          fill="currentColor"
          opacity={0.05}
          rx={4}
        />
        {series.map((s, idx) => {
          const x = baseX;
          const y = baseY + idx * 24;
          const color = s.color || "#64748b";
          const radius = s.radius || 4;
          const isHidden = hiddenSeries.has(idx);

          return (
            <g
              key={idx}
              onClick={interactive ? () => toggleSeries(idx) : undefined}
              style={{ cursor: interactive ? "pointer" : "default" }}
              opacity={isHidden ? 0.4 : 1}
            >
              <circle cx={x + 10} cy={y} r={radius} fill={color} />
              <text
                x={x + 28}
                y={y + 4}
                fontSize={11}
                fill="currentColor"
                opacity={0.8}
              >
                {s.name}
              </text>
            </g>
          );
        })}
      </g>
    );
  });

ScatterPlotLegend.displayName = "ScatterPlot.Legend";

export interface ScatterPlotLegendHTMLProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  orientation?: "horizontal" | "vertical";
}

/**
 * HTML Legend component - flexible legend that sits outside the SVG
 */
const ScatterPlotLegendHTML = React.forwardRef<
  HTMLDivElement,
  ScatterPlotLegendHTMLProps
>(({ className, style, interactive = false, orientation = "horizontal", ...props }, ref) => {
    const { series, hiddenSeries, toggleSeries } = useScatterPlot();

    return (
      <div
        ref={ref}
        className={cn("scatter-plot-legend-html", className)}
        style={{
          display: "flex",
          flexDirection: orientation === "horizontal" ? "row" : "column",
          flexWrap: "wrap",
          gap: orientation === "horizontal" ? "16px" : "8px",
          alignItems: "center",
          padding: "12px",
          ...style,
        }}
        {...props}
      >
        {series.map((s, idx) => {
          const color = s.color || "#64748b";
          const radius = s.radius || 4;
          const isHidden = hiddenSeries.has(idx);

          return (
            <div
              key={idx}
              onClick={interactive ? () => toggleSeries(idx) : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: interactive ? "pointer" : "default",
                opacity: isHidden ? 0.4 : 1,
                transition: "opacity 0.2s ease",
              }}
            >
              <svg
                width={radius * 3}
                height={radius * 3}
                style={{ flexShrink: 0 }}
              >
                <circle
                  cx={radius * 1.5}
                  cy={radius * 1.5}
                  r={radius}
                  fill={color}
                />
              </svg>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "currentColor",
                }}
              >
                {s.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  });

ScatterPlotLegendHTML.displayName = "ScatterPlot.LegendHTML";

/**
 * Empty state component
 */
const ScatterPlotEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, children, ...props }, ref) => {
  const { width, height } = useScatterPlot();

  return (
    <div
      ref={ref}
      className={cn("scatter-plot-empty", className)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
        borderRadius: "8px",
        border: "1px solid currentColor",
        opacity: 0.1,
        ...style,
      }}
      {...props}
    >
      {children || (
        <>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            opacity="0.3"
          >
            <circle cx="12" cy="12" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="6" r="2" />
            <circle cx="6" cy="6" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
          <div style={{ fontSize: "14px", opacity: 0.5 }}>
            No data available
          </div>
        </>
      )}
    </div>
  );
});

ScatterPlotEmpty.displayName = "ScatterPlot.Empty";

/**
 * Loading state component
 */
const ScatterPlotLoading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const { width, height } = useScatterPlot();

  return (
    <div
      ref={ref}
      className={cn("scatter-plot-loading", className)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background, white)",
        opacity: 0.95,
        zIndex: 10,
        ...style,
      }}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid rgba(0, 0, 0, 0.1)",
            borderTop: "4px solid currentColor",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 12px",
          }}
        />
        <div style={{ fontSize: "14px", opacity: 0.7 }}>Loading chart...</div>
      </div>
    </div>
  );
});

ScatterPlotLoading.displayName = "ScatterPlot.Loading";

// ============================================================================
// Exports
// ============================================================================

export const ScatterPlot = Object.assign(ScatterPlotRoot, {
  Root: ScatterPlotRoot,
  Container: ScatterPlotContainer,
  Viewport: ScatterPlotViewport,
  Grid: ScatterPlotGrid,
  Axes: ScatterPlotAxes,
  Points: ScatterPlotPoints,
  Regression: ScatterPlotRegression,
  Tooltip: ScatterPlotTooltip,
  Interaction: ScatterPlotInteraction,
  Legend: ScatterPlotLegend,
  LegendHTML: ScatterPlotLegendHTML,
  Empty: ScatterPlotEmpty,
  Loading: ScatterPlotLoading,
});
