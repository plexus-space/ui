"use client";

import * as React from "react";
import { cn, getDomain, createScale, formatValue, getTicks } from "./lib";

// ============================================================================
// Types
// ============================================================================

/**
 * Box plot data for a single category or series
 */
export interface BoxPlotData {
  /** Category or series name */
  name: string;
  /** Raw data values for this category */
  values: number[];
  /**
   * Box color in any CSS color format
   * @default "#06b6d4"
   * @example "#3b82f6", "rgb(59, 130, 246)", "hsl(217, 91%, 60%)"
   */
  color?: string;
}

/**
 * Computed statistics for a box plot
 */
export interface BoxPlotStatistics {
  /** Minimum value (excluding outliers) */
  min: number;
  /** First quartile (25th percentile) */
  q1: number;
  /** Median (50th percentile) */
  median: number;
  /** Third quartile (75th percentile) */
  q3: number;
  /** Maximum value (excluding outliers) */
  max: number;
  /** Interquartile range (Q3 - Q1) */
  iqr: number;
  /** Lower whisker bound */
  lowerWhisker: number;
  /** Upper whisker bound */
  upperWhisker: number;
  /** Outlier values */
  outliers: number[];
  /** Mean value */
  mean: number;
}

/**
 * Axis configuration for box plot
 */
export interface BoxPlotAxis {
  /**
   * Axis label text
   * @example "Categories", "Values", "Temperature (°C)"
   */
  label?: string;
  /**
   * Domain range for axis values
   * @default "auto" (calculated from data)
   * @example [0, 100], [-50, 50]
   */
  domain?: [number, number] | "auto";
  /**
   * Custom formatter function for axis tick labels
   * @example (value) => `${value.toFixed(1)}%`
   */
  formatter?: (value: number) => string;
}

/**
 * Visual variant styles for the box plot
 */
export type BoxPlotVariant =
  | "default" // Balanced styling for general use
  | "minimal" // Minimal styling with reduced visual weight
  | "scientific" // Dense styling for data analysis
  | "dashboard"; // Polished styling for dashboards

/**
 * Orientation for the box plot
 */
export type BoxPlotOrientation = "vertical" | "horizontal";

/**
 * Props for BoxPlot.Root component
 */
export interface BoxPlotRootProps {
  /**
   * Array of box plot data series
   * @required
   */
  data: BoxPlotData[];
  /**
   * X-axis configuration (category axis for vertical, value axis for horizontal)
   * @default { domain: "auto" }
   */
  xAxis?: BoxPlotAxis;
  /**
   * Y-axis configuration (value axis for vertical, category axis for horizontal)
   * @default { domain: "auto" }
   */
  yAxis?: BoxPlotAxis;
  /**
   * Chart width in pixels
   * @default 800
   * @example 600, 1200, 1920
   */
  width?: number;
  /**
   * Chart height in pixels
   * @default 400
   * @example 300, 600, 800
   */
  height?: number;
  /**
   * Visual variant style preset
   * @default "default"
   */
  variant?: BoxPlotVariant;
  /**
   * Orientation of the box plot
   * @default "vertical"
   */
  orientation?: BoxPlotOrientation;
  /**
   * Enable entrance animations
   * @default false
   */
  animate?: boolean;
  /**
   * Show mean value as a point on each box
   * @default false
   */
  showMean?: boolean;
  /**
   * Box opacity level
   * @default 0.8
   * @range 0.0-1.0
   */
  boxOpacity?: number;
  /**
   * IQR multiplier for outlier detection
   * @default 1.5
   * @range 1.0-3.0
   */
  outlierThreshold?: number;
  /**
   * Show notches for confidence intervals
   * @default false
   */
  showNotches?: boolean;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * Child components (Container, Viewport, etc.)
   */
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface BoxPlotContext {
  data: BoxPlotData[];
  statistics: BoxPlotStatistics[];
  xAxis: BoxPlotAxis;
  yAxis: BoxPlotAxis;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  categoryScale: (index: number) => number;
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
  hoveredBox: number | null;
  setHoveredBox: (idx: number | null) => void;
  variant: BoxPlotVariant;
  orientation: BoxPlotOrientation;
  animate: boolean;
  showMean: boolean;
  boxOpacity: number;
  showNotches: boolean;
}

const BoxPlotContext = React.createContext<BoxPlotContext | null>(null);

function useBoxPlot() {
  const ctx = React.useContext(BoxPlotContext);
  if (!ctx) throw new Error("useBoxPlot must be used within BoxPlot.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Calculate box plot statistics from raw data
 */
function calculateBoxStatistics(
  values: number[],
  outlierThreshold: number = 1.5
): BoxPlotStatistics {
  if (values.length === 0) {
    return {
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      iqr: 0,
      lowerWhisker: 0,
      upperWhisker: 0,
      outliers: [],
      mean: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate quartiles
  const q1 = sorted[Math.floor(n * 0.25)];
  const median =
    n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
  const q3 = sorted[Math.floor(n * 0.75)];

  const iqr = q3 - q1;
  const lowerBound = q1 - outlierThreshold * iqr;
  const upperBound = q3 + outlierThreshold * iqr;

  // Find outliers and whisker bounds
  const outliers: number[] = [];
  let lowerWhisker = q1;
  let upperWhisker = q3;

  for (const value of sorted) {
    if (value < lowerBound || value > upperBound) {
      outliers.push(value);
    } else {
      if (value < lowerWhisker) lowerWhisker = value;
      if (value > upperWhisker) upperWhisker = value;
    }
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / n;

  return {
    min: sorted[0],
    q1,
    median,
    q3,
    max: sorted[n - 1],
    iqr,
    lowerWhisker,
    upperWhisker,
    outliers,
    mean,
  };
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const BoxPlotRoot = React.forwardRef<HTMLDivElement, BoxPlotRootProps>(
  (
    {
      data,
      xAxis = {},
      yAxis = {},
      width = 800,
      height = 400,
      variant = "default",
      orientation = "vertical",
      animate = false,
      showMean = false,
      boxOpacity = 0.8,
      outlierThreshold = 1.5,
      showNotches = false,
      className,
      children,
    },
    ref
  ) => {
    const [hoveredBox, setHoveredBox] = React.useState<number | null>(null);

    // Calculate statistics for each series
    const statistics = React.useMemo(
      () => data.map((d) => calculateBoxStatistics(d.values, outlierThreshold)),
      [data, outlierThreshold]
    );

    // Margins
    const margin = React.useMemo(
      () => ({
        top: 30,
        right: 30,
        bottom: 80,
        left: 70,
      }),
      []
    );

    // Calculate domains
    const allValues = statistics.flatMap((s) => [
      s.lowerWhisker,
      s.upperWhisker,
      ...s.outliers,
    ]);

    const valueDomain: [number, number] =
      orientation === "vertical"
        ? yAxis.domain === "auto" || !yAxis.domain
          ? [Math.min(...allValues), Math.max(...allValues)]
          : yAxis.domain
        : xAxis.domain === "auto" || !xAxis.domain
        ? [Math.min(...allValues), Math.max(...allValues)]
        : xAxis.domain;

    const categoryDomain: [number, number] = [0, data.length - 1];

    const xDomain = orientation === "vertical" ? categoryDomain : valueDomain;
    const yDomain = orientation === "vertical" ? valueDomain : categoryDomain;

    // Create scales
    const valueScale = React.useMemo(() => {
      const range: [number, number] =
        orientation === "vertical"
          ? [height - margin.bottom, margin.top]
          : [margin.left, width - margin.right];
      return createScale(valueDomain, range);
    }, [valueDomain, orientation, height, width, margin]);

    const categoryScale = React.useCallback(
      (index: number) => {
        const range =
          orientation === "vertical"
            ? [margin.left, width - margin.right]
            : [height - margin.bottom, margin.top];
        const step = (range[1] - range[0]) / data.length;
        return range[0] + step * (index + 0.5);
      },
      [data.length, orientation, margin, width, height]
    );

    const xScale = orientation === "vertical" ? categoryScale : valueScale;
    const yScale = orientation === "vertical" ? valueScale : categoryScale;

    // Generate ticks
    const valueTicks = React.useMemo(
      () => getTicks(valueDomain, 6),
      [valueDomain]
    );
    const xTicks = orientation === "vertical" ? [] : valueTicks;
    const yTicks = orientation === "vertical" ? valueTicks : [];

    const contextValue: BoxPlotContext = React.useMemo(
      () => ({
        data,
        statistics,
        xAxis,
        yAxis,
        width,
        height,
        margin,
        xScale,
        yScale,
        categoryScale,
        xDomain,
        yDomain,
        xTicks,
        yTicks,
        hoveredBox,
        setHoveredBox,
        variant,
        orientation,
        animate,
        showMean,
        boxOpacity,
        showNotches,
      }),
      [
        data,
        statistics,
        xAxis,
        yAxis,
        width,
        height,
        margin,
        xScale,
        yScale,
        categoryScale,
        xDomain,
        yDomain,
        xTicks,
        yTicks,
        hoveredBox,
        variant,
        orientation,
        animate,
        showMean,
        boxOpacity,
        showNotches,
      ]
    );

    return (
      <BoxPlotContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("box-plot", className)}
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
      </BoxPlotContext.Provider>
    );
  }
);

BoxPlotRoot.displayName = "BoxPlot.Root";

/**
 * Props for BoxPlot.Container component
 */
export interface BoxPlotContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Container component - wraps the SVG content
 */
const BoxPlotContainer = React.forwardRef<
  HTMLDivElement,
  BoxPlotContainerProps
>(({ className, style, children, ...props }, ref) => {
  const { height } = useBoxPlot();

  return (
    <div
      ref={ref}
      className={cn("box-plot-container", className)}
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

BoxPlotContainer.displayName = "BoxPlot.Container";

/**
 * Props for BoxPlot.Viewport component
 */
export interface BoxPlotViewportProps extends React.SVGProps<SVGSVGElement> {}

/**
 * Viewport component - SVG canvas that contains all chart visual elements
 */
const BoxPlotViewport = React.forwardRef<SVGSVGElement, BoxPlotViewportProps>(
  ({ className, children, ...props }, ref) => {
    const { width, height } = useBoxPlot();

    return (
      <svg
        ref={ref}
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className={cn("box-plot-svg", className)}
        style={{ display: "block", userSelect: "none", maxWidth: "100%" }}
        role="img"
        aria-label="Box plot"
        {...props}
      >
        {children}
      </svg>
    );
  }
);

BoxPlotViewport.displayName = "BoxPlot.Viewport";

/**
 * Props for BoxPlot.Grid component
 */
export interface BoxPlotGridProps extends React.SVGProps<SVGGElement> {
  /**
   * Stroke color for grid lines
   * @default "currentColor"
   */
  stroke?: string;
  /**
   * Stroke width for grid lines in pixels
   * @default 1
   * @range 0.5-3
   */
  strokeWidth?: number;
  /**
   * Opacity for grid lines
   * @default 0.1
   * @range 0.0-1.0
   */
  opacity?: number;
}

/**
 * Grid component - renders horizontal and vertical grid lines
 */
const BoxPlotGrid = React.forwardRef<SVGGElement, BoxPlotGridProps>(
  (
    {
      className,
      stroke = "currentColor",
      strokeWidth = 1,
      opacity = 0.1,
      ...props
    },
    ref
  ) => {
    const {
      xTicks,
      yTicks,
      xScale,
      yScale,
      margin,
      width,
      height,
      animate,
      orientation,
    } = useBoxPlot();

    return (
      <g ref={ref} className={cn("box-plot-grid", className)} {...props}>
        {/* Horizontal grid lines (for value axis) */}
        {orientation === "vertical" &&
          yTicks.map((tick, i) => (
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
        {/* Vertical grid lines (for value axis) */}
        {orientation === "horizontal" &&
          xTicks.map((tick, i) => (
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
      </g>
    );
  }
);

BoxPlotGrid.displayName = "BoxPlot.Grid";

/**
 * Props for BoxPlot.Axes component
 */
export interface BoxPlotAxesProps extends React.SVGProps<SVGGElement> {}

/**
 * Axes component - renders X and Y axes with tick marks and labels
 */
const BoxPlotAxes = React.forwardRef<SVGGElement, BoxPlotAxesProps>(
  ({ className, ...props }, ref) => {
    const {
      xTicks,
      yTicks,
      xScale,
      yScale,
      categoryScale,
      margin,
      width,
      height,
      xAxis,
      yAxis,
      data,
      orientation,
    } = useBoxPlot();

    const formatTick = (value: number, axis: BoxPlotAxis): string => {
      if (axis.formatter) return axis.formatter(value);
      return formatValue(value);
    };

    return (
      <g ref={ref} className={cn("box-plot-axes", className)} {...props}>
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
        {orientation === "vertical"
          ? // Category labels for vertical orientation
            data.map((d, i) => (
              <g key={`xlabel-${i}`}>
                <line
                  x1={categoryScale(i)}
                  y1={height - margin.bottom}
                  x2={categoryScale(i)}
                  y2={height - margin.bottom + 6}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  opacity={0.2}
                />
                <text
                  x={categoryScale(i)}
                  y={height - margin.bottom + 20}
                  textAnchor="middle"
                  fontSize={10}
                  fill="currentColor"
                  opacity={0.6}
                  transform={`rotate(-45 ${categoryScale(i)} ${
                    height - margin.bottom + 20
                  })`}
                >
                  {d.name}
                </text>
              </g>
            ))
          : // Value ticks for horizontal orientation
            xTicks.map((tick, i) => (
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
        {orientation === "vertical"
          ? // Value ticks for vertical orientation
            yTicks.map((tick, i) => (
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
            ))
          : // Category labels for horizontal orientation
            data.map((d, i) => (
              <g key={`ylabel-${i}`}>
                <line
                  x1={margin.left - 6}
                  y1={categoryScale(i)}
                  x2={margin.left}
                  y2={categoryScale(i)}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  opacity={0.2}
                />
                <text
                  x={margin.left - 10}
                  y={categoryScale(i) + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="currentColor"
                  opacity={0.6}
                >
                  {d.name}
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

BoxPlotAxes.displayName = "BoxPlot.Axes";

/**
 * Props for BoxPlot.Boxes component
 */
export interface BoxPlotBoxesProps extends React.SVGProps<SVGGElement> {}

/**
 * Boxes component - renders the box plot elements
 */
const BoxPlotBoxes = React.forwardRef<SVGGElement, BoxPlotBoxesProps>(
  ({ className, ...props }, ref) => {
    const {
      data,
      statistics,
      categoryScale,
      xScale,
      yScale,
      animate,
      boxOpacity,
      hoveredBox,
      setHoveredBox,
      showMean,
      orientation,
      width,
      height,
      margin,
    } = useBoxPlot();

    const boxWidth =
      orientation === "vertical"
        ? Math.min(
            60,
            ((width - margin.left - margin.right) / data.length) * 0.6
          )
        : Math.min(
            60,
            ((height - margin.top - margin.bottom) / data.length) * 0.6
          );

    return (
      <g ref={ref} className={cn("box-plot-boxes", className)} {...props}>
        {data.map((d, i) => {
          const stats = statistics[i];
          const color = d.color || "#06b6d4";
          const isHovered = hoveredBox === i;
          const center = categoryScale(i);

          if (orientation === "vertical") {
            const q1Y = yScale(stats.q1);
            const medianY = yScale(stats.median);
            const q3Y = yScale(stats.q3);
            const lowerWhiskerY = yScale(stats.lowerWhisker);
            const upperWhiskerY = yScale(stats.upperWhisker);
            const meanY = yScale(stats.mean);

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredBox(i)}
                onMouseLeave={() => setHoveredBox(null)}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                }}
              >
                {/* Lower whisker line */}
                <line
                  x1={center}
                  y1={q1Y}
                  x2={center}
                  y2={lowerWhiskerY}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeDasharray="4,3"
                  opacity={isHovered ? 0.9 : 0.65}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                />
                {/* Lower whisker cap */}
                <line
                  x1={center - boxWidth / 3}
                  y1={lowerWhiskerY}
                  x2={center + boxWidth / 3}
                  y2={lowerWhiskerY}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeLinecap="round"
                  opacity={isHovered ? 1 : 0.8}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                />

                {/* Box with gradient */}
                <defs>
                  <linearGradient
                    id={`boxGradient-${i}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor={color}
                      stopOpacity={isHovered ? 0.95 : 0.85}
                    />
                    <stop
                      offset="100%"
                      stopColor={color}
                      stopOpacity={isHovered ? 0.75 : 0.65}
                    />
                  </linearGradient>
                </defs>
                <rect
                  x={center - boxWidth / 2}
                  y={q3Y}
                  width={boxWidth}
                  height={q1Y - q3Y}
                  fill={`url(#boxGradient-${i})`}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  rx={isHovered ? 3 : 2}
                  style={{
                    filter: isHovered
                      ? "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))"
                      : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))",
                    transition: "all 0.2s ease",
                    ...(animate
                      ? {
                          animation: `growIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                            i * 0.1
                          }s forwards`,
                          transformOrigin: `${center}px ${medianY}px`,
                          transform: "scaleY(0)",
                        }
                      : undefined),
                  }}
                />

                {/* Median line - more prominent */}
                <line
                  x1={center - boxWidth / 2}
                  y1={medianY}
                  x2={center + boxWidth / 2}
                  y2={medianY}
                  stroke="white"
                  strokeWidth={isHovered ? 3.5 : 3}
                  strokeLinecap="round"
                  opacity={0.95}
                  style={{
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))",
                    transition: "all 0.2s ease",
                  }}
                />

                {/* Upper whisker line */}
                <line
                  x1={center}
                  y1={q3Y}
                  x2={center}
                  y2={upperWhiskerY}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeDasharray="4,3"
                  opacity={isHovered ? 0.9 : 0.65}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                />
                {/* Upper whisker cap */}
                <line
                  x1={center - boxWidth / 3}
                  y1={upperWhiskerY}
                  x2={center + boxWidth / 3}
                  y2={upperWhiskerY}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeLinecap="round"
                  opacity={isHovered ? 1 : 0.8}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                />

                {/* Mean marker - diamond shape */}
                {showMean && (
                  <>
                    <circle
                      cx={center}
                      cy={meanY}
                      r={isHovered ? 6 : 5}
                      fill="white"
                      stroke={color}
                      strokeWidth={2.5}
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))",
                        transition: "all 0.2s ease",
                      }}
                    />
                    <circle
                      cx={center}
                      cy={meanY}
                      r={isHovered ? 2.5 : 2}
                      fill={color}
                      opacity={0.8}
                    />
                  </>
                )}

                {/* Outliers - more prominent */}
                {stats.outliers.map((outlier, j) => (
                  <circle
                    key={`outlier-${j}`}
                    cx={center}
                    cy={yScale(outlier)}
                    r={isHovered ? 5 : 4}
                    fill={color}
                    opacity={isHovered ? 0.6 : 0.5}
                    stroke={color}
                    strokeWidth={isHovered ? 2 : 1.5}
                    style={{
                      filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </g>
            );
          } else {
            // Horizontal orientation
            const q1X = xScale(stats.q1);
            const medianX = xScale(stats.median);
            const q3X = xScale(stats.q3);
            const lowerWhiskerX = xScale(stats.lowerWhisker);
            const upperWhiskerX = xScale(stats.upperWhisker);
            const meanX = xScale(stats.mean);

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredBox(i)}
                onMouseLeave={() => setHoveredBox(null)}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                }}
              >
                {/* Lower whisker line */}
                <line
                  x1={q1X}
                  y1={center}
                  x2={lowerWhiskerX}
                  y2={center}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeDasharray="4,3"
                  opacity={isHovered ? 0.9 : 0.65}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                />
                {/* Lower whisker cap */}
                <line
                  x1={lowerWhiskerX}
                  y1={center - boxWidth / 3}
                  x2={lowerWhiskerX}
                  y2={center + boxWidth / 3}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeLinecap="round"
                  opacity={isHovered ? 1 : 0.8}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                />

                {/* Box with gradient */}
                <defs>
                  <linearGradient
                    id={`boxGradientH-${i}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor={color}
                      stopOpacity={isHovered ? 0.95 : 0.85}
                    />
                    <stop
                      offset="100%"
                      stopColor={color}
                      stopOpacity={isHovered ? 0.75 : 0.65}
                    />
                  </linearGradient>
                </defs>
                <rect
                  x={q1X}
                  y={center - boxWidth / 2}
                  width={q3X - q1X}
                  height={boxWidth}
                  fill={`url(#boxGradientH-${i})`}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  rx={isHovered ? 3 : 2}
                  style={{
                    filter: isHovered
                      ? "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))"
                      : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))",
                    transition: "all 0.2s ease",
                    ...(animate
                      ? {
                          animation: `growIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                            i * 0.1
                          }s forwards`,
                          transformOrigin: `${medianX}px ${center}px`,
                          transform: "scaleX(0)",
                        }
                      : undefined),
                  }}
                />

                {/* Median line - more prominent */}
                <line
                  x1={medianX}
                  y1={center - boxWidth / 2}
                  x2={medianX}
                  y2={center + boxWidth / 2}
                  stroke="white"
                  strokeWidth={isHovered ? 3.5 : 3}
                  strokeLinecap="round"
                  opacity={0.95}
                  style={{
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))",
                    transition: "all 0.2s ease",
                  }}
                />

                {/* Upper whisker line */}
                <line
                  x1={q3X}
                  y1={center}
                  x2={upperWhiskerX}
                  y2={center}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeDasharray="4,3"
                  opacity={isHovered ? 0.9 : 0.65}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                />
                {/* Upper whisker cap */}
                <line
                  x1={upperWhiskerX}
                  y1={center - boxWidth / 3}
                  x2={upperWhiskerX}
                  y2={center + boxWidth / 3}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeLinecap="round"
                  opacity={isHovered ? 1 : 0.8}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                />

                {/* Mean marker - diamond shape */}
                {showMean && (
                  <>
                    <circle
                      cx={meanX}
                      cy={center}
                      r={isHovered ? 6 : 5}
                      fill="white"
                      stroke={color}
                      strokeWidth={2.5}
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))",
                        transition: "all 0.2s ease",
                      }}
                    />
                    <circle
                      cx={meanX}
                      cy={center}
                      r={isHovered ? 2.5 : 2}
                      fill={color}
                      opacity={0.8}
                    />
                  </>
                )}

                {/* Outliers - more prominent */}
                {stats.outliers.map((outlier, j) => (
                  <circle
                    key={`outlier-${j}`}
                    cx={xScale(outlier)}
                    cy={center}
                    r={isHovered ? 5 : 4}
                    fill={color}
                    opacity={isHovered ? 0.6 : 0.5}
                    stroke={color}
                    strokeWidth={isHovered ? 2 : 1.5}
                    style={{
                      filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </g>
            );
          }
        })}
        <style jsx>{`
          @keyframes growIn {
            to {
              transform: scale(1);
            }
          }
          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }
        `}</style>
      </g>
    );
  }
);

BoxPlotBoxes.displayName = "BoxPlot.Boxes";

/**
 * Props for BoxPlot.Tooltip component
 */
export interface BoxPlotTooltipProps extends React.SVGProps<SVGGElement> {}

/**
 * Tooltip component - displays box plot statistics on hover
 */
const BoxPlotTooltip = React.forwardRef<SVGGElement, BoxPlotTooltipProps>(
  ({ className, ...props }, ref) => {
    const {
      hoveredBox,
      data,
      statistics,
      categoryScale,
      xScale,
      yScale,
      width,
      height,
      margin,
      orientation,
    } = useBoxPlot();

    if (hoveredBox === null) return null;

    const d = data[hoveredBox];
    const stats = statistics[hoveredBox];
    if (!d || !stats) return null;

    const center = categoryScale(hoveredBox);

    // Smart positioning with viewport awareness
    const tooltipWidth = 180;
    const tooltipHeight = 140;
    const padding = 15;

    // Determine position based on orientation and available space
    let tooltipX: number;
    let tooltipY: number;

    if (orientation === "vertical") {
      // Horizontal positioning: check if tooltip fits on right, otherwise place on left
      const centerInPlotArea = center - margin.left;
      const plotAreaWidth = width - margin.left - margin.right;

      if (centerInPlotArea < plotAreaWidth / 2) {
        // Place on right
        tooltipX = center + padding;
        // Ensure it doesn't go off the right edge
        if (tooltipX + tooltipWidth > width - margin.right) {
          tooltipX = width - margin.right - tooltipWidth - padding;
        }
      } else {
        // Place on left
        tooltipX = center - tooltipWidth - padding;
        // Ensure it doesn't go off the left edge
        if (tooltipX < margin.left) {
          tooltipX = margin.left + padding;
        }
      }

      // Vertical positioning: center on median, but keep within bounds
      const medianY = yScale(stats.median);
      tooltipY = medianY - tooltipHeight / 2;

      // Keep within top boundary
      if (tooltipY < margin.top + padding) {
        tooltipY = margin.top + padding;
      }
      // Keep within bottom boundary
      if (tooltipY + tooltipHeight > height - margin.bottom - padding) {
        tooltipY = height - margin.bottom - tooltipHeight - padding;
      }
    } else {
      // Horizontal orientation
      // Horizontal positioning: center on median, but keep within bounds
      const medianX = xScale(stats.median);
      tooltipX = medianX - tooltipWidth / 2;

      // Keep within left boundary
      if (tooltipX < margin.left + padding) {
        tooltipX = margin.left + padding;
      }
      // Keep within right boundary
      if (tooltipX + tooltipWidth > width - margin.right - padding) {
        tooltipX = width - margin.right - tooltipWidth - padding;
      }

      // Vertical positioning: check if tooltip fits above, otherwise place below
      const centerInPlotArea = center - margin.top;
      const plotAreaHeight = height - margin.top - margin.bottom;

      if (centerInPlotArea < plotAreaHeight / 2) {
        // Place below
        tooltipY = center + padding;
        // Ensure it doesn't go off the bottom edge
        if (tooltipY + tooltipHeight > height - margin.bottom) {
          tooltipY = height - margin.bottom - tooltipHeight - padding;
        }
      } else {
        // Place above
        tooltipY = center - tooltipHeight - padding;
        // Ensure it doesn't go off the top edge
        if (tooltipY < margin.top) {
          tooltipY = margin.top + padding;
        }
      }
    }

    return (
      <g
        ref={ref}
        className={cn("box-plot-tooltip", className)}
        style={{ pointerEvents: "none" }}
        {...props}
      >
        {/* Tooltip box */}
        <rect
          x={tooltipX}
          y={tooltipY}
          width={tooltipWidth}
          height={tooltipHeight}
          rx={6}
          fill="currentColor"
          opacity={0.95}
        />
        <text
          x={tooltipX + 10}
          y={tooltipY + 20}
          fontSize={11}
          fontWeight={600}
          fill="white"
          style={{ mixBlendMode: "difference" }}
        >
          {d.name}
        </text>
        {[
          `Max: ${formatValue(stats.max)}`,
          `Q3: ${formatValue(stats.q3)}`,
          `Median: ${formatValue(stats.median)}`,
          `Q1: ${formatValue(stats.q1)}`,
          `Min: ${formatValue(stats.min)}`,
          `Outliers: ${stats.outliers.length}`,
        ].map((text, i) => (
          <text
            key={i}
            x={tooltipX + 10}
            y={tooltipY + 40 + i * 16}
            fontSize={10}
            fill="white"
            opacity={0.8}
            style={{ mixBlendMode: "difference" }}
          >
            {text}
          </text>
        ))}
      </g>
    );
  }
);

BoxPlotTooltip.displayName = "BoxPlot.Tooltip";

/**
 * Props for BoxPlot.Empty component
 */
export interface BoxPlotEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Empty state component - displays placeholder when no data is available
 */
const BoxPlotEmpty = React.forwardRef<HTMLDivElement, BoxPlotEmptyProps>(
  ({ className, style, children, ...props }, ref) => {
    const { width, height } = useBoxPlot();

    return (
      <div
        ref={ref}
        className={cn("box-plot-empty", className)}
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
              <rect x="6" y="8" width="4" height="8" strokeWidth="2" />
              <line x1="8" y1="6" x2="8" y2="8" strokeWidth="2" />
              <line x1="8" y1="16" x2="8" y2="18" strokeWidth="2" />
              <line x1="8" y1="12" x2="8" y2="12" strokeWidth="3" />
            </svg>
            <div style={{ fontSize: "14px", opacity: 0.5 }}>
              No data available
            </div>
          </>
        )}
      </div>
    );
  }
);

BoxPlotEmpty.displayName = "BoxPlot.Empty";

/**
 * Props for BoxPlot.Loading component
 */
export interface BoxPlotLoadingProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Loading state component - displays loading spinner
 */
const BoxPlotLoading = React.forwardRef<HTMLDivElement, BoxPlotLoadingProps>(
  ({ className, style, ...props }, ref) => {
    const { width, height } = useBoxPlot();

    return (
      <div
        ref={ref}
        className={cn("box-plot-loading", className)}
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
  }
);

BoxPlotLoading.displayName = "BoxPlot.Loading";

// ============================================================================
// Exports
// ============================================================================

export const BoxPlot = Object.assign(BoxPlotRoot, {
  Root: BoxPlotRoot,
  Container: BoxPlotContainer,
  Viewport: BoxPlotViewport,
  Grid: BoxPlotGrid,
  Axes: BoxPlotAxes,
  Boxes: BoxPlotBoxes,
  Tooltip: BoxPlotTooltip,
  Empty: BoxPlotEmpty,
  Loading: BoxPlotLoading,
});
