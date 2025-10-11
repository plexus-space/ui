"use client";

import * as React from "react";
import {
  cn,
  getDomain,
  createScale,
  formatValue,
  getTicks,
} from "./lib";

// ============================================================================
// Types
// ============================================================================

/**
 * Violin plot data for a single category or series
 */
export interface ViolinPlotData {
  /** Category or series name */
  name: string;
  /** Raw data values for this category */
  values: number[];
  /**
   * Violin color in any CSS color format
   * @default "#06b6d4"
   * @example "#3b82f6", "rgb(59, 130, 246)", "hsl(217, 91%, 60%)"
   */
  color?: string;
}

/**
 * Computed statistics for a violin plot
 */
export interface ViolinPlotStatistics {
  /** Minimum value */
  min: number;
  /** First quartile (25th percentile) */
  q1: number;
  /** Median (50th percentile) */
  median: number;
  /** Third quartile (75th percentile) */
  q3: number;
  /** Maximum value */
  max: number;
  /** Mean value */
  mean: number;
  /** Kernel density estimation points */
  kde: { value: number; density: number }[];
  /** Maximum density for normalization */
  maxDensity: number;
}

/**
 * Axis configuration for violin plot
 */
export interface ViolinPlotAxis {
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
 * Visual variant styles for the violin plot
 */
export type ViolinPlotVariant =
  | "default"    // Balanced styling for general use
  | "minimal"    // Minimal styling with reduced visual weight
  | "scientific" // Dense styling for data analysis
  | "dashboard"; // Polished styling for dashboards

/**
 * Orientation for the violin plot
 */
export type ViolinPlotOrientation = "vertical" | "horizontal";

/**
 * Props for ViolinPlot.Root component
 */
export interface ViolinPlotRootProps {
  /**
   * Array of violin plot data series
   * @required
   */
  data: ViolinPlotData[];
  /**
   * X-axis configuration (category axis for vertical, value axis for horizontal)
   * @default { domain: "auto" }
   */
  xAxis?: ViolinPlotAxis;
  /**
   * Y-axis configuration (value axis for vertical, category axis for horizontal)
   * @default { domain: "auto" }
   */
  yAxis?: ViolinPlotAxis;
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
  variant?: ViolinPlotVariant;
  /**
   * Orientation of the violin plot
   * @default "vertical"
   */
  orientation?: ViolinPlotOrientation;
  /**
   * Enable entrance animations
   * @default false
   */
  animate?: boolean;
  /**
   * Show inner box plot
   * @default true
   */
  showBox?: boolean;
  /**
   * Show mean value as a point
   * @default false
   */
  showMean?: boolean;
  /**
   * Violin opacity level
   * @default 0.85
   * @range 0.0-1.0
   */
  violinOpacity?: number;
  /**
   * Number of points for KDE calculation
   * @default 50
   * @range 20-200
   */
  kdePoints?: number;
  /**
   * Bandwidth for KDE (automatic if not specified)
   * @default "auto"
   */
  kdeBandwidth?: number | "auto";
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

interface ViolinPlotContext {
  data: ViolinPlotData[];
  statistics: ViolinPlotStatistics[];
  xAxis: ViolinPlotAxis;
  yAxis: ViolinPlotAxis;
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
  hoveredViolin: number | null;
  setHoveredViolin: (idx: number | null) => void;
  variant: ViolinPlotVariant;
  orientation: ViolinPlotOrientation;
  animate: boolean;
  showBox: boolean;
  showMean: boolean;
  violinOpacity: number;
}

const ViolinPlotContext = React.createContext<ViolinPlotContext | null>(null);

function useViolinPlot() {
  const ctx = React.useContext(ViolinPlotContext);
  if (!ctx) throw new Error("useViolinPlot must be used within ViolinPlot.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Gaussian kernel function for KDE
 */
function gaussianKernel(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Calculate Silverman's rule of thumb for bandwidth
 */
function silvermanBandwidth(values: number[]): number {
  if (values.length < 2) return 1;

  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Silverman's rule: 0.9 * min(std, IQR/1.34) * n^(-1/5)
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  const scale = Math.min(stdDev, iqr / 1.34);
  return 0.9 * scale * Math.pow(n, -0.2);
}

/**
 * Calculate kernel density estimation
 */
function calculateKDE(
  values: number[],
  numPoints: number,
  bandwidth: number | "auto",
  domain: [number, number]
): { value: number; density: number }[] {
  if (values.length === 0) return [];

  const h = bandwidth === "auto" ? silvermanBandwidth(values) : bandwidth;
  const [min, max] = domain;
  const step = (max - min) / (numPoints - 1);

  const kde: { value: number; density: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const x = min + i * step;
    let density = 0;

    for (const value of values) {
      density += gaussianKernel((x - value) / h);
    }

    density = density / (values.length * h);
    kde.push({ value: x, density });
  }

  return kde;
}

/**
 * Calculate violin plot statistics
 */
function calculateViolinStatistics(
  values: number[],
  kdePoints: number,
  kdeBandwidth: number | "auto",
  domain: [number, number]
): ViolinPlotStatistics {
  if (values.length === 0) {
    return {
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      mean: 0,
      kde: [],
      maxDensity: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate quartiles
  const q1 = sorted[Math.floor(n * 0.25)];
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  const q3 = sorted[Math.floor(n * 0.75)];

  const mean = values.reduce((sum, v) => sum + v, 0) / n;

  // Calculate KDE
  const kde = calculateKDE(values, kdePoints, kdeBandwidth, domain);
  const maxDensity = Math.max(...kde.map(k => k.density), 0.0001);

  return {
    min: sorted[0],
    q1,
    median,
    q3,
    max: sorted[n - 1],
    mean,
    kde,
    maxDensity,
  };
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const ViolinPlotRoot = React.forwardRef<HTMLDivElement, ViolinPlotRootProps>(
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
      showBox = true,
      showMean = false,
      violinOpacity = 0.85,
      kdePoints = 50,
      kdeBandwidth = "auto",
      className,
      children,
    },
    ref
  ) => {
    const [hoveredViolin, setHoveredViolin] = React.useState<number | null>(null);

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

    // Calculate value domain first for KDE calculation
    const allValues = data.flatMap((d) => d.values);
    const valueDomain: [number, number] =
      orientation === "vertical"
        ? yAxis.domain === "auto" || !yAxis.domain
          ? [Math.min(...allValues), Math.max(...allValues)]
          : yAxis.domain
        : xAxis.domain === "auto" || !xAxis.domain
        ? [Math.min(...allValues), Math.max(...allValues)]
        : xAxis.domain;

    // Calculate statistics for each series (including KDE)
    const statistics = React.useMemo(
      () =>
        data.map((d) =>
          calculateViolinStatistics(d.values, kdePoints, kdeBandwidth, valueDomain)
        ),
      [data, kdePoints, kdeBandwidth, valueDomain]
    );

    const categoryDomain: [number, number] = [0, data.length - 1];

    const xDomain = orientation === "vertical" ? categoryDomain : valueDomain;
    const yDomain = orientation === "vertical" ? valueDomain : categoryDomain;

    // Create scales
    const valueScale = React.useMemo(() => {
      const range: [number, number] = orientation === "vertical"
        ? [height - margin.bottom, margin.top]
        : [margin.left, width - margin.right];
      return createScale(valueDomain, range);
    }, [valueDomain, orientation, height, width, margin]);

    const categoryScale = React.useCallback(
      (index: number) => {
        const range = orientation === "vertical"
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
    const valueTicks = React.useMemo(() => getTicks(valueDomain, 6), [valueDomain]);
    const xTicks = orientation === "vertical" ? [] : valueTicks;
    const yTicks = orientation === "vertical" ? valueTicks : [];

    const contextValue: ViolinPlotContext = React.useMemo(
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
        hoveredViolin,
        setHoveredViolin,
        variant,
        orientation,
        animate,
        showBox,
        showMean,
        violinOpacity,
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
        hoveredViolin,
        variant,
        orientation,
        animate,
        showBox,
        showMean,
        violinOpacity,
      ]
    );

    return (
      <ViolinPlotContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("violin-plot", className)}
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
      </ViolinPlotContext.Provider>
    );
  }
);

ViolinPlotRoot.displayName = "ViolinPlot.Root";

/**
 * Props for ViolinPlot.Container component
 */
export interface ViolinPlotContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Container component - wraps the SVG content
 */
const ViolinPlotContainer = React.forwardRef<
  HTMLDivElement,
  ViolinPlotContainerProps
>(({ className, style, children, ...props }, ref) => {
  const { height } = useViolinPlot();

  return (
    <div
      ref={ref}
      className={cn("violin-plot-container", className)}
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

ViolinPlotContainer.displayName = "ViolinPlot.Container";

/**
 * Props for ViolinPlot.Viewport component
 */
export interface ViolinPlotViewportProps extends React.SVGProps<SVGSVGElement> {}

/**
 * Viewport component - SVG canvas that contains all chart visual elements
 */
const ViolinPlotViewport = React.forwardRef<
  SVGSVGElement,
  ViolinPlotViewportProps
>(({ className, children, ...props }, ref) => {
  const { width, height } = useViolinPlot();

  return (
    <svg
      ref={ref}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("violin-plot-svg", className)}
      style={{ display: "block", userSelect: "none", maxWidth: "100%" }}
      role="img"
      aria-label="Violin plot"
      {...props}
    >
      {children}
    </svg>
  );
});

ViolinPlotViewport.displayName = "ViolinPlot.Viewport";

/**
 * Props for ViolinPlot.Grid component
 */
export interface ViolinPlotGridProps extends React.SVGProps<SVGGElement> {
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
const ViolinPlotGrid = React.forwardRef<SVGGElement, ViolinPlotGridProps>(
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
    const { xTicks, yTicks, xScale, yScale, margin, width, height, animate, orientation } =
      useViolinPlot();

    return (
      <g ref={ref} className={cn("violin-plot-grid", className)} {...props}>
        {/* Horizontal grid lines (for value axis) */}
        {orientation === "vertical" && yTicks.map((tick, i) => (
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
        {orientation === "horizontal" && xTicks.map((tick, i) => (
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

ViolinPlotGrid.displayName = "ViolinPlot.Grid";

/**
 * Props for ViolinPlot.Axes component
 */
export interface ViolinPlotAxesProps extends React.SVGProps<SVGGElement> {}

/**
 * Axes component - renders X and Y axes with tick marks and labels
 */
const ViolinPlotAxes = React.forwardRef<SVGGElement, ViolinPlotAxesProps>(
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
    } = useViolinPlot();

    const formatTick = (value: number, axis: ViolinPlotAxis): string => {
      if (axis.formatter) return axis.formatter(value);
      return formatValue(value);
    };

    return (
      <g ref={ref} className={cn("violin-plot-axes", className)} {...props}>
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
        {orientation === "vertical" ? (
          // Category labels for vertical orientation
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
                transform={`rotate(-45 ${categoryScale(i)} ${height - margin.bottom + 20})`}
              >
                {d.name}
              </text>
            </g>
          ))
        ) : (
          // Value ticks for horizontal orientation
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
          ))
        )}
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
        {orientation === "vertical" ? (
          // Value ticks for vertical orientation
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
        ) : (
          // Category labels for horizontal orientation
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
          ))
        )}
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

ViolinPlotAxes.displayName = "ViolinPlot.Axes";

/**
 * Props for ViolinPlot.Violins component
 */
export interface ViolinPlotViolinsProps extends React.SVGProps<SVGGElement> {}

/**
 * Violins component - renders the violin plot shapes
 */
const ViolinPlotViolins = React.forwardRef<SVGGElement, ViolinPlotViolinsProps>(
  ({ className, ...props }, ref) => {
    const {
      data,
      statistics,
      categoryScale,
      xScale,
      yScale,
      animate,
      violinOpacity,
      hoveredViolin,
      setHoveredViolin,
      showBox,
      showMean,
      orientation,
      width,
      height,
      margin,
    } = useViolinPlot();

    const violinWidth = orientation === "vertical"
      ? Math.min(80, (width - margin.left - margin.right) / data.length * 0.7)
      : Math.min(80, (height - margin.top - margin.bottom) / data.length * 0.7);

    return (
      <g ref={ref} className={cn("violin-plot-violins", className)} {...props}>
        {data.map((d, i) => {
          const stats = statistics[i];
          const color = d.color || "#06b6d4";
          const isHovered = hoveredViolin === i;
          const center = categoryScale(i);

          if (stats.kde.length === 0) return null;

          // Create path for violin shape
          let path = "";

          if (orientation === "vertical") {
            // Right side of violin
            stats.kde.forEach((point, j) => {
              const y = yScale(point.value);
              const widthScale = (point.density / stats.maxDensity) * (violinWidth / 2);
              const x = center + widthScale;
              path += j === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
            });

            // Left side of violin (reversed)
            for (let j = stats.kde.length - 1; j >= 0; j--) {
              const point = stats.kde[j];
              const y = yScale(point.value);
              const widthScale = (point.density / stats.maxDensity) * (violinWidth / 2);
              const x = center - widthScale;
              path += ` L ${x} ${y}`;
            }

            path += " Z";
          } else {
            // Bottom side of violin
            stats.kde.forEach((point, j) => {
              const x = xScale(point.value);
              const widthScale = (point.density / stats.maxDensity) * (violinWidth / 2);
              const y = center + widthScale;
              path += j === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
            });

            // Top side of violin (reversed)
            for (let j = stats.kde.length - 1; j >= 0; j--) {
              const point = stats.kde[j];
              const x = xScale(point.value);
              const widthScale = (point.density / stats.maxDensity) * (violinWidth / 2);
              const y = center - widthScale;
              path += ` L ${x} ${y}`;
            }

            path += " Z";
          }

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredViolin(i)}
              onMouseLeave={() => setHoveredViolin(null)}
              style={{
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
            >
              {/* Violin shape with gradient */}
              <defs>
                <linearGradient id={`violinGradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity={isHovered ? 0.85 : 0.7} />
                  <stop offset="50%" stopColor={color} stopOpacity={isHovered ? 0.75 : 0.6} />
                  <stop offset="100%" stopColor={color} stopOpacity={isHovered ? 0.85 : 0.7} />
                </linearGradient>
              </defs>
              <path
                d={path}
                fill={`url(#violinGradient-${i})`}
                stroke={color}
                strokeWidth={isHovered ? 2.5 : 2}
                strokeLinejoin="round"
                style={{
                  filter: isHovered ? "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))" : "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.1))",
                  transition: "all 0.3s ease",
                  ...(animate
                    ? {
                        animation: `fadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s forwards`,
                        opacity: 0,
                      }
                    : undefined),
                }}
              />

              {/* Inner box plot - vertical */}
              {showBox && orientation === "vertical" && (
                <g>
                  {/* IQR box with shadow */}
                  <rect
                    x={center - 8}
                    y={yScale(stats.q3)}
                    width={16}
                    height={yScale(stats.q1) - yScale(stats.q3)}
                    fill="white"
                    opacity={0.95}
                    stroke={color}
                    strokeWidth={isHovered ? 2.5 : 2}
                    rx={2}
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12))",
                      transition: "all 0.2s ease",
                    }}
                  />
                  {/* Median line - prominent */}
                  <line
                    x1={center - 8}
                    y1={yScale(stats.median)}
                    x2={center + 8}
                    y2={yScale(stats.median)}
                    stroke={color}
                    strokeWidth={isHovered ? 3 : 2.5}
                    strokeLinecap="round"
                    style={{
                      transition: "all 0.2s ease",
                    }}
                  />
                </g>
              )}

              {/* Inner box plot - horizontal */}
              {showBox && orientation === "horizontal" && (
                <g>
                  {/* IQR box with shadow */}
                  <rect
                    x={xScale(stats.q1)}
                    y={center - 8}
                    width={xScale(stats.q3) - xScale(stats.q1)}
                    height={16}
                    fill="white"
                    opacity={0.95}
                    stroke={color}
                    strokeWidth={isHovered ? 2.5 : 2}
                    rx={2}
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12))",
                      transition: "all 0.2s ease",
                    }}
                  />
                  {/* Median line - prominent */}
                  <line
                    x1={xScale(stats.median)}
                    y1={center - 8}
                    x2={xScale(stats.median)}
                    y2={center + 8}
                    stroke={color}
                    strokeWidth={isHovered ? 3 : 2.5}
                    strokeLinecap="round"
                    style={{
                      transition: "all 0.2s ease",
                    }}
                  />
                </g>
              )}

              {/* Mean marker - vertical (matching box plot style) */}
              {showMean && orientation === "vertical" && (
                <>
                  <circle
                    cx={center}
                    cy={yScale(stats.mean)}
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
                    cy={yScale(stats.mean)}
                    r={isHovered ? 2.5 : 2}
                    fill={color}
                    opacity={0.8}
                  />
                </>
              )}

              {/* Mean marker - horizontal (matching box plot style) */}
              {showMean && orientation === "horizontal" && (
                <>
                  <circle
                    cx={xScale(stats.mean)}
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
                    cx={xScale(stats.mean)}
                    cy={center}
                    r={isHovered ? 2.5 : 2}
                    fill={color}
                    opacity={0.8}
                  />
                </>
              )}
            </g>
          );
        })}
        <style jsx>{`
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

ViolinPlotViolins.displayName = "ViolinPlot.Violins";

/**
 * Props for ViolinPlot.Tooltip component
 */
export interface ViolinPlotTooltipProps extends React.SVGProps<SVGGElement> {}

/**
 * Tooltip component - displays violin plot statistics on hover
 */
const ViolinPlotTooltip = React.forwardRef<SVGGElement, ViolinPlotTooltipProps>(
  ({ className, ...props }, ref) => {
    const {
      hoveredViolin,
      data,
      statistics,
      categoryScale,
      xScale,
      yScale,
      width,
      height,
      margin,
      orientation,
    } = useViolinPlot();

    if (hoveredViolin === null) return null;

    const d = data[hoveredViolin];
    const stats = statistics[hoveredViolin];
    if (!d || !stats) return null;

    const center = categoryScale(hoveredViolin);

    // Smart positioning with viewport awareness
    const tooltipWidth = 180;
    const tooltipHeight = 120;
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
        className={cn("violin-plot-tooltip", className)}
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
          `Mean: ${formatValue(stats.mean)}`,
          `Q1: ${formatValue(stats.q1)}`,
          `Min: ${formatValue(stats.min)}`,
        ].map((text, i) => (
          <text
            key={i}
            x={tooltipX + 10}
            y={tooltipY + 40 + i * 14}
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

ViolinPlotTooltip.displayName = "ViolinPlot.Tooltip";

/**
 * Props for ViolinPlot.Empty component
 */
export interface ViolinPlotEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Empty state component - displays placeholder when no data is available
 */
const ViolinPlotEmpty = React.forwardRef<HTMLDivElement, ViolinPlotEmptyProps>(
  ({ className, style, children, ...props }, ref) => {
    const { width, height } = useViolinPlot();

    return (
      <div
        ref={ref}
        className={cn("violin-plot-empty", className)}
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
              <ellipse cx="12" cy="12" rx="3" ry="8" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="16" strokeWidth="2" />
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

ViolinPlotEmpty.displayName = "ViolinPlot.Empty";

/**
 * Props for ViolinPlot.Loading component
 */
export interface ViolinPlotLoadingProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Loading state component - displays loading spinner
 */
const ViolinPlotLoading = React.forwardRef<
  HTMLDivElement,
  ViolinPlotLoadingProps
>(({ className, style, ...props }, ref) => {
  const { width, height } = useViolinPlot();

  return (
    <div
      ref={ref}
      className={cn("violin-plot-loading", className)}
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

ViolinPlotLoading.displayName = "ViolinPlot.Loading";

// ============================================================================
// Exports
// ============================================================================

export const ViolinPlot = Object.assign(ViolinPlotRoot, {
  Root: ViolinPlotRoot,
  Container: ViolinPlotContainer,
  Viewport: ViolinPlotViewport,
  Grid: ViolinPlotGrid,
  Axes: ViolinPlotAxes,
  Violins: ViolinPlotViolins,
  Tooltip: ViolinPlotTooltip,
  Empty: ViolinPlotEmpty,
  Loading: ViolinPlotLoading,
});
