"use client";

import * as React from "react";
import { cn, getDomain, createScale, formatValue, getTicks } from "./lib";

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for histogram bins
 */
export interface BinConfig {
  /**
   * Number of bins for automatic binning
   * @default 10
   * @range 3-100
   */
  count?: number;
  /**
   * Explicit bin edges [min, max] for each bin
   * When provided, overrides automatic binning
   * @example [[0, 10], [10, 20], [20, 30]]
   */
  edges?: [number, number][];
  /**
   * Bin width for uniform binning
   * When provided, overrides count-based binning
   * @example 5, 10, 0.5
   */
  width?: number;
}

/**
 * Individual bin data after computation
 */
export interface HistogramBin {
  /** Lower edge of the bin */
  x0: number;
  /** Upper edge of the bin */
  x1: number;
  /** Number of data points in this bin */
  count: number;
  /** Center point of the bin (x0 + x1) / 2 */
  center: number;
  /** Normalized density (count / (totalCount * binWidth)) */
  density: number;
}

/**
 * Axis configuration for histogram
 */
export interface HistogramAxis {
  /**
   * Axis label text
   * @example "Values", "Frequency", "Temperature (°C)"
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
 * Visual variant styles for the histogram
 */
export type HistogramVariant =
  | "default" // Balanced styling for general use
  | "minimal" // Minimal styling with reduced visual weight
  | "scientific" // Dense styling for data analysis
  | "dashboard"; // Polished styling for dashboards

/**
 * Props for Histogram.Root component
 */
export interface HistogramRootProps {
  /**
   * Raw data values to bin and visualize
   * @required
   * @example [1, 2, 2, 3, 3, 3, 4, 4, 5]
   */
  data: number[];
  /**
   * Bin configuration for histogram
   * @default { count: 10 }
   */
  bins?: BinConfig;
  /**
   * X-axis (value axis) configuration
   * @default { domain: "auto" }
   */
  xAxis?: HistogramAxis;
  /**
   * Y-axis (frequency/density axis) configuration
   * @default { domain: "auto" }
   */
  yAxis?: HistogramAxis;
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
   * Bar fill color in any CSS color format
   * @default "#06b6d4"
   * @example "#3b82f6", "rgb(59, 130, 246)", "hsl(217, 91%, 60%)"
   */
  color?: string;
  /**
   * Display mode for Y-axis values
   * @default "count"
   */
  mode?: "count" | "density";
  /**
   * Visual variant style preset
   * @default "default"
   */
  variant?: HistogramVariant;
  /**
   * Enable entrance animations for bars and grid
   * @default false
   */
  animate?: boolean;
  /**
   * Display statistical overlay (mean, median, std dev)
   * @default false
   */
  showStats?: boolean;
  /**
   * Display vertical line at mean value
   * @default false
   */
  showMean?: boolean;
  /**
   * Display vertical line at median value
   * @default false
   */
  showMedian?: boolean;
  /**
   * Bar opacity level
   * @default 0.8
   * @range 0.0-1.0
   */
  barOpacity?: number;
  /**
   * Gap between bars as fraction of bar width
   * @default 0.1
   * @range 0.0-0.5
   */
  barGap?: number;
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

interface HistogramContext {
  data: number[];
  bins: HistogramBin[];
  xAxis: HistogramAxis;
  yAxis: HistogramAxis;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
  hoveredBin: number | null;
  setHoveredBin: (idx: number | null) => void;
  color: string;
  mode: "count" | "density";
  variant: HistogramVariant;
  animate: boolean;
  showStats: boolean;
  showMean: boolean;
  showMedian: boolean;
  barOpacity: number;
  barGap: number;
  stats: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
}

const HistogramContext = React.createContext<HistogramContext | null>(null);

function useHistogram() {
  const ctx = React.useContext(HistogramContext);
  if (!ctx) throw new Error("useHistogram must be used within Histogram.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Calculate histogram bins from raw data
 */
function calculateBins(data: number[], config: BinConfig): HistogramBin[] {
  if (data.length === 0) return [];

  const sortedData = [...data].sort((a, b) => a - b);
  const min = sortedData[0];
  const max = sortedData[sortedData.length - 1];

  let edges: [number, number][];

  if (config.edges) {
    // Use explicit bin edges
    edges = config.edges;
  } else if (config.width) {
    // Use fixed bin width
    edges = [];
    let start = min;
    while (start < max) {
      const end = Math.min(start + config.width, max);
      edges.push([start, end]);
      start = end;
    }
  } else {
    // Use bin count (default)
    const count = config.count || 10;
    const binWidth = (max - min) / count;
    edges = [];
    for (let i = 0; i < count; i++) {
      edges.push([min + i * binWidth, min + (i + 1) * binWidth]);
    }
  }

  // Count data points in each bin
  const bins: HistogramBin[] = edges.map(([x0, x1]) => {
    const count = sortedData.filter((v) => v >= x0 && v < x1).length;
    // Handle last bin inclusively
    const isLastBin = x1 === max;
    const finalCount = isLastBin
      ? sortedData.filter((v) => v >= x0 && v <= x1).length
      : count;

    const binWidth = x1 - x0;
    const density = data.length > 0 ? finalCount / (data.length * binWidth) : 0;

    return {
      x0,
      x1,
      count: finalCount,
      center: (x0 + x1) / 2,
      density,
    };
  });

  return bins;
}

/**
 * Calculate statistical measures
 */
function calculateStats(data: number[]) {
  if (data.length === 0) {
    return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const mean = data.reduce((sum, v) => sum + v, 0) / data.length;
  const median =
    data.length % 2 === 0
      ? (sorted[data.length / 2 - 1] + sorted[data.length / 2]) / 2
      : sorted[Math.floor(data.length / 2)];

  const variance =
    data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    median,
    stdDev,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const HistogramRoot = React.forwardRef<HTMLDivElement, HistogramRootProps>(
  (
    {
      data,
      bins: binConfig = { count: 10 },
      xAxis = {},
      yAxis = {},
      width = 800,
      height = 400,
      color = "#06b6d4",
      mode = "count",
      variant = "default",
      animate = false,
      showStats = false,
      showMean = false,
      showMedian = false,
      barOpacity = 0.8,
      barGap = 0.1,
      className,
      children,
    },
    ref
  ) => {
    const [hoveredBin, setHoveredBin] = React.useState<number | null>(null);

    // Calculate bins
    const bins = React.useMemo(
      () => calculateBins(data, binConfig),
      [data, binConfig]
    );

    // Calculate statistics
    const stats = React.useMemo(() => calculateStats(data), [data]);

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
    const allValues = bins.flatMap((b) => [b.x0, b.x1]);
    const xDomain: [number, number] =
      xAxis.domain === "auto" || !xAxis.domain
        ? [Math.min(...allValues), Math.max(...allValues)]
        : xAxis.domain;

    const yValues = bins.map((b) => (mode === "density" ? b.density : b.count));
    const yDomain: [number, number] =
      yAxis.domain === "auto" || !yAxis.domain
        ? [0, Math.max(...yValues, 1)]
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

    const contextValue: HistogramContext = React.useMemo(
      () => ({
        data,
        bins,
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
        hoveredBin,
        setHoveredBin,
        color,
        mode,
        variant,
        animate,
        showStats,
        showMean,
        showMedian,
        barOpacity,
        barGap,
        stats,
      }),
      [
        data,
        bins,
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
        hoveredBin,
        color,
        mode,
        variant,
        animate,
        showStats,
        showMean,
        showMedian,
        barOpacity,
        barGap,
        stats,
      ]
    );

    return (
      <HistogramContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("histogram", className)}
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
      </HistogramContext.Provider>
    );
  }
);

HistogramRoot.displayName = "Histogram.Root";

/**
 * Props for Histogram.Container component
 * Wraps the SVG viewport with proper dimensions and styling
 */
export interface HistogramContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Container component - wraps the SVG content
 */
const HistogramContainer = React.forwardRef<
  HTMLDivElement,
  HistogramContainerProps
>(({ className, style, children, ...props }, ref) => {
  const { height } = useHistogram();

  return (
    <div
      ref={ref}
      className={cn("histogram-container", className)}
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

HistogramContainer.displayName = "Histogram.Container";

/**
 * Props for Histogram.Viewport component
 * SVG canvas that contains all visual elements
 */
export interface HistogramViewportProps extends React.SVGProps<SVGSVGElement> {}

/**
 * Viewport component - SVG canvas that contains all chart visual elements
 */
const HistogramViewport = React.forwardRef<
  SVGSVGElement,
  HistogramViewportProps
>(({ className, children, ...props }, ref) => {
  const { width, height } = useHistogram();

  return (
    <svg
      ref={ref}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("histogram-svg", className)}
      style={{ display: "block", userSelect: "none", maxWidth: "100%" }}
      role="img"
      aria-label="Histogram"
      {...props}
    >
      {children}
    </svg>
  );
});

HistogramViewport.displayName = "Histogram.Viewport";

/**
 * Props for Histogram.Grid component
 * Renders horizontal and vertical grid lines
 */
export interface HistogramGridProps extends React.SVGProps<SVGGElement> {
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
 * Grid component - renders horizontal and vertical grid lines for the chart
 */
const HistogramGrid = React.forwardRef<SVGGElement, HistogramGridProps>(
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
    const { xTicks, yTicks, xScale, yScale, margin, width, height, animate } =
      useHistogram();

    return (
      <g ref={ref} className={cn("histogram-grid", className)} {...props}>
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

HistogramGrid.displayName = "Histogram.Grid";

/**
 * Props for Histogram.Axes component
 * Renders X and Y axes with tick marks and labels
 */
export interface HistogramAxesProps extends React.SVGProps<SVGGElement> {}

/**
 * Axes component - renders X and Y axes with tick marks, tick labels, and axis labels
 */
const HistogramAxes = React.forwardRef<SVGGElement, HistogramAxesProps>(
  ({ className, ...props }, ref) => {
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
    } = useHistogram();

    const formatTick = (value: number, axis: HistogramAxis): string => {
      if (axis.formatter) return axis.formatter(value);
      return formatValue(value);
    };

    return (
      <g ref={ref} className={cn("histogram-axes", className)} {...props}>
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

HistogramAxes.displayName = "Histogram.Axes";

/**
 * Props for Histogram.Bars component
 * Renders the histogram bars
 */
export interface HistogramBarsProps extends React.SVGProps<SVGGElement> {}

/**
 * Bars component - renders the histogram bars with optional hover effects
 */
const HistogramBars = React.forwardRef<SVGGElement, HistogramBarsProps>(
  ({ className, ...props }, ref) => {
    const {
      bins,
      xScale,
      yScale,
      height,
      margin,
      color,
      mode,
      animate,
      barOpacity,
      barGap,
      hoveredBin,
      setHoveredBin,
    } = useHistogram();

    const baselineY = yScale(0);

    return (
      <g ref={ref} className={cn("histogram-bars", className)} {...props}>
        {bins.map((bin, i) => {
          const x = xScale(bin.x0);
          const barWidth = xScale(bin.x1) - xScale(bin.x0);
          const gap = barWidth * barGap;
          const yValue = mode === "density" ? bin.density : bin.count;
          const barHeight = baselineY - yScale(yValue);
          const isHovered = hoveredBin === i;

          return (
            <rect
              key={`bar-${i}`}
              x={x + gap / 2}
              y={yScale(yValue)}
              width={Math.max(0, barWidth - gap)}
              height={Math.max(0, barHeight)}
              fill={color}
              opacity={isHovered ? 1 : barOpacity}
              stroke={isHovered ? color : "none"}
              strokeWidth={isHovered ? 2 : 0}
              onMouseEnter={() => setHoveredBin(i)}
              onMouseLeave={() => setHoveredBin(null)}
              style={
                animate
                  ? {
                      animation: `growIn 0.5s ease ${i * 0.02}s forwards`,
                      transformOrigin: "bottom",
                      transform: "scaleY(0)",
                      cursor: "pointer",
                      transition: "opacity 0.2s ease, stroke-width 0.2s ease",
                    }
                  : {
                      cursor: "pointer",
                      transition: "opacity 0.2s ease, stroke-width 0.2s ease",
                    }
              }
            />
          );
        })}
        <style jsx>{`
          @keyframes growIn {
            to {
              transform: scaleY(1);
            }
          }
        `}</style>
      </g>
    );
  }
);

HistogramBars.displayName = "Histogram.Bars";

/**
 * Props for Histogram.Statistics component
 * Renders statistical overlays (mean, median, std dev)
 */
export interface HistogramStatisticsProps extends React.SVGProps<SVGGElement> {}

/**
 * Statistics component - displays mean and median lines with labels
 */
const HistogramStatistics = React.forwardRef<
  SVGGElement,
  HistogramStatisticsProps
>(({ className, ...props }, ref) => {
  const { stats, showMean, showMedian, xScale, margin, height, showStats } =
    useHistogram();

  if (!showStats && !showMean && !showMedian) return null;

  return (
    <g ref={ref} className={cn("histogram-statistics", className)} {...props}>
      {(showMean || showStats) && (
        <g>
          <line
            x1={xScale(stats.mean)}
            y1={margin.top}
            x2={xScale(stats.mean)}
            y2={height - margin.bottom}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="6,4"
            opacity={0.7}
          />
          <text
            x={xScale(stats.mean) + 8}
            y={margin.top + 15}
            fontSize={11}
            fontWeight={600}
            fill="#ef4444"
          >
            Mean: {formatValue(stats.mean)}
          </text>
        </g>
      )}
      {(showMedian || showStats) && (
        <g>
          <line
            x1={xScale(stats.median)}
            y1={margin.top}
            x2={xScale(stats.median)}
            y2={height - margin.bottom}
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="6,4"
            opacity={0.7}
          />
          <text
            x={xScale(stats.median) + 8}
            y={margin.top + 35}
            fontSize={11}
            fontWeight={600}
            fill="#8b5cf6"
          >
            Median: {formatValue(stats.median)}
          </text>
        </g>
      )}
    </g>
  );
});

HistogramStatistics.displayName = "Histogram.Statistics";

/**
 * Props for Histogram.Tooltip component
 * Displays bin information on hover
 */
export interface HistogramTooltipProps extends React.SVGProps<SVGGElement> {}

/**
 * Tooltip component - displays interactive tooltip with bin data on hover
 */
const HistogramTooltip = React.forwardRef<SVGGElement, HistogramTooltipProps>(
  ({ className, ...props }, ref) => {
    const {
      hoveredBin,
      bins,
      xScale,
      yScale,
      xAxis,
      yAxis,
      width,
      height,
      margin,
      mode,
    } = useHistogram();

    if (hoveredBin === null) return null;

    const bin = bins[hoveredBin];
    if (!bin) return null;

    const barCenter = (xScale(bin.x0) + xScale(bin.x1)) / 2;
    const yValue = mode === "density" ? bin.density : bin.count;
    const barTop = yScale(yValue);

    const rangeLabel = `${formatValue(bin.x0)} - ${formatValue(bin.x1)}`;
    const countLabel = `Count: ${bin.count}`;
    const densityLabel = `Density: ${formatValue(bin.density)}`;

    // Smart positioning
    const tooltipWidth = 180;
    const tooltipHeight = mode === "density" ? 75 : 60;
    const offsetX = barCenter > width / 2 ? -tooltipWidth - 10 : 10;
    const offsetY = barTop > height / 2 ? -tooltipHeight - 10 : 10;

    return (
      <g
        ref={ref}
        className={cn("histogram-tooltip", className)}
        style={{ pointerEvents: "none" }}
        {...props}
      >
        {/* Tooltip box */}
        <rect
          x={barCenter + offsetX}
          y={barTop + offsetY}
          width={tooltipWidth}
          height={tooltipHeight}
          rx={6}
          fill="currentColor"
          opacity={0.95}
        />
        <text
          x={barCenter + offsetX + 10}
          y={barTop + offsetY + 20}
          fontSize={11}
          fontWeight={600}
          fill="white"
          style={{ mixBlendMode: "difference" }}
        >
          {rangeLabel}
        </text>
        <text
          x={barCenter + offsetX + 10}
          y={barTop + offsetY + 38}
          fontSize={10}
          fill="white"
          opacity={0.8}
          style={{ mixBlendMode: "difference" }}
        >
          {countLabel}
        </text>
        {mode === "density" && (
          <text
            x={barCenter + offsetX + 10}
            y={barTop + offsetY + 54}
            fontSize={10}
            fill="white"
            opacity={0.8}
            style={{ mixBlendMode: "difference" }}
          >
            {densityLabel}
          </text>
        )}
      </g>
    );
  }
);

HistogramTooltip.displayName = "Histogram.Tooltip";

/**
 * Props for Histogram.Empty component
 * Displays when no data is available
 */
export interface HistogramEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Empty state component - displays placeholder when no data is available
 */
const HistogramEmpty = React.forwardRef<HTMLDivElement, HistogramEmptyProps>(
  ({ className, style, children, ...props }, ref) => {
    const { width, height } = useHistogram();

    return (
      <div
        ref={ref}
        className={cn("histogram-empty", className)}
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
              <rect x="3" y="12" width="3" height="9" strokeWidth="2" />
              <rect x="8" y="8" width="3" height="13" strokeWidth="2" />
              <rect x="13" y="5" width="3" height="16" strokeWidth="2" />
              <rect x="18" y="10" width="3" height="11" strokeWidth="2" />
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

HistogramEmpty.displayName = "Histogram.Empty";

/**
 * Props for Histogram.Loading component
 * Displays loading spinner while data is being fetched
 */
export interface HistogramLoadingProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Loading state component - displays loading spinner while data is being fetched or processed
 */
const HistogramLoading = React.forwardRef<
  HTMLDivElement,
  HistogramLoadingProps
>(({ className, style, ...props }, ref) => {
  const { width, height } = useHistogram();

  return (
    <div
      ref={ref}
      className={cn("histogram-loading", className)}
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

HistogramLoading.displayName = "Histogram.Loading";

// ============================================================================
// Exports
// ============================================================================

export const Histogram = Object.assign(HistogramRoot, {
  Root: HistogramRoot,
  Container: HistogramContainer,
  Viewport: HistogramViewport,
  Grid: HistogramGrid,
  Axes: HistogramAxes,
  Bars: HistogramBars,
  Statistics: HistogramStatistics,
  Tooltip: HistogramTooltip,
  Empty: HistogramEmpty,
  Loading: HistogramLoading,
});
