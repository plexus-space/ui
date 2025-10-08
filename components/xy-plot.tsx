"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  forwardRef,
  memo,
} from "react";
import { ChartTooltip } from "./chart-tooltip";
import { ChartLegend, type LegendItem } from "./chart-legend";

// ============================================================================
// Types
// ============================================================================

/**
 * A single point on the plot
 */
export interface Point {
  /** X value */
  x: number;
  /** Y value */
  y: number;
  /** Optional metadata for the point */
  metadata?: Record<string, any>;
}

/**
 * Point style options
 */
export type PointStyle = "circle" | "cross" | "plus" | "square" | "diamond" | "triangle";

/**
 * Scale type options
 */
export type ScaleType = "linear" | "log";

/**
 * Color mapping options
 */
export type ColorMapping = string | "density" | ((point: Point, index: number) => string);

/**
 * Configuration for an axis
 */
export interface Axis {
  /** Axis label */
  label?: string;
  /** Min/max values, or "auto" */
  domain?: [number, number] | "auto";
  /** Scale type: "linear" | "log" */
  scale?: ScaleType;
  /** Custom formatter function */
  formatter?: (value: number) => string;
}

/**
 * Trendline configuration
 */
export interface Trendline {
  /** Show trendline */
  show?: boolean;
  /** Trendline color */
  color?: string;
  /** Line style */
  dashed?: boolean;
  /** Trendline type */
  type?: "linear" | "polynomial";
  /** Polynomial degree (if type is "polynomial") */
  degree?: number;
}

/**
 * Props for the XYPlot component
 */
export interface XYPlotProps {
  /** Array of data points */
  data: Point[];
  /** X-axis configuration */
  xAxis?: Axis;
  /** Y-axis configuration */
  yAxis?: Axis;
  /** Plot width in pixels */
  width?: number;
  /** Plot height in pixels */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Point style */
  pointStyle?: PointStyle;
  /** Point size in pixels */
  pointSize?: number;
  /** Color configuration */
  color?: ColorMapping;
  /** Show trendline */
  showTrendline?: boolean | Trendline;
  /** Enable animations */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Context (Internal)
// ============================================================================

interface PlotContext {
  width: number;
  height: number;
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  hoveredPointIdx: number | null;
  setHoveredPointIdx: (idx: number | null) => void;
}

const Context = createContext<PlotContext | null>(null);

function usePlot() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Must be used within XYPlot");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function getDomain(points: Point[], accessor: (p: Point) => number): [number, number] {
  if (points.length === 0) return [0, 1];
  const values = points.map(accessor);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || 1;
  return [min - padding, max + padding];
}

function createLinearScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const slope = (r1 - r0) / (d1 - d0);
  return (value: number) => r0 + slope * (value - d0);
}

function createLogScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const logD0 = Math.log10(d0);
  const logD1 = Math.log10(d1);
  const slope = (r1 - r0) / (logD1 - logD0);
  return (value: number) => r0 + slope * (Math.log10(value) - logD0);
}

function createScale(domain: [number, number], range: [number, number], type: ScaleType = "linear") {
  if (type === "log") {
    return createLogScale(domain, range);
  }
  return createLinearScale(domain, range);
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(1);
  return value.toFixed(2);
}

function getTicks(domain: [number, number], count: number = 5, scaleType: ScaleType = "linear"): number[] {
  const [min, max] = domain;

  if (scaleType === "log") {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    const step = (logMax - logMin) / (count - 1);
    return Array.from({ length: count }, (_, i) => Math.pow(10, logMin + i * step));
  }

  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

/**
 * Calculate density-based color for a point
 */
function calculateDensity(points: Point[], index: number, xScale: (x: number) => number, yScale: (y: number) => number): string {
  const point = points[index];
  const px = xScale(point.x);
  const py = yScale(point.y);
  const radius = 30; // pixels

  let nearby = 0;
  for (let i = 0; i < points.length; i++) {
    if (i === index) continue;
    const qx = xScale(points[i].x);
    const qy = yScale(points[i].y);
    const dist = Math.sqrt((px - qx) ** 2 + (py - qy) ** 2);
    if (dist < radius) nearby++;
  }

  // Map density to color (blue to red)
  const maxDensity = 20;
  const ratio = Math.min(nearby / maxDensity, 1);

  const r = Math.floor(ratio * 239 + (1 - ratio) * 59);
  const g = Math.floor((1 - ratio) * 130 + ratio * 68);
  const b = Math.floor((1 - ratio) * 246 + ratio * 68);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Calculate linear regression trendline
 */
function calculateLinearTrendline(points: Point[]): { slope: number; intercept: number } {
  if (points.length < 2) return { slope: 0, intercept: 0 };

  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// ============================================================================
// Components
// ============================================================================

interface GridProps {
  xTicks: number[];
  yTicks: number[];
  animate: boolean;
}

const Grid = memo(({ xTicks, yTicks, animate }: GridProps) => {
  const { width, height, xScale, yScale } = usePlot();
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };

  return (
    <g className="grid">
      {/* Vertical lines */}
      {xTicks.map((tick, i) => (
        <line
          key={`vgrid-${i}`}
          x1={xScale(tick)}
          y1={margin.top}
          x2={xScale(tick)}
          y2={height - margin.bottom}
          stroke="currentColor"
          strokeWidth={0.5}
          strokeDasharray="2,4"
          opacity={animate ? 0 : 0.08}
          style={animate ? { animation: `fadeIn 0.3s ease ${i * 0.03}s forwards` } : undefined}
        />
      ))}
      {/* Horizontal lines */}
      {yTicks.map((tick, i) => (
        <line
          key={`hgrid-${i}`}
          x1={margin.left}
          y1={yScale(tick)}
          x2={width - margin.right}
          y2={yScale(tick)}
          stroke="currentColor"
          strokeWidth={0.5}
          strokeDasharray="2,4"
          opacity={animate ? 0 : 0.08}
          style={animate ? { animation: `fadeIn 0.3s ease ${i * 0.03}s forwards` } : undefined}
        />
      ))}
      <style jsx>{`
        @keyframes fadeIn {
          to { opacity: 0.08; }
        }
      `}</style>
    </g>
  );
});

Grid.displayName = "Grid";

interface AxesProps {
  xTicks: number[];
  yTicks: number[];
  xLabel?: string;
  yLabel?: string;
  xAxis?: Axis;
  yAxis?: Axis;
  animate: boolean;
}

const Axes = memo(({ xTicks, yTicks, xLabel, yLabel, xAxis, yAxis, animate }: AxesProps) => {
  const { width, height, xScale, yScale } = usePlot();
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };

  // Format tick value based on axis configuration
  const formatTick = (value: number, axis?: Axis): string => {
    if (axis?.formatter) {
      return axis.formatter(value);
    }
    return formatValue(value);
  };

  return (
    <g className="axes">
      {/* X-axis */}
      <line
        x1={margin.left}
        y1={height - margin.bottom}
        x2={width - margin.right}
        y2={height - margin.bottom}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={animate ? 0 : 1}
        style={animate ? { animation: "fadeIn 0.4s ease 0.2s forwards" } : undefined}
      />
      {xTicks.map((tick, i) => (
        <g key={`xtick-${i}`} opacity={animate ? 0 : 1} style={animate ? { animation: `fadeIn 0.3s ease ${0.3 + i * 0.04}s forwards` } : undefined}>
          <line
            x1={xScale(tick)}
            y1={height - margin.bottom}
            x2={xScale(tick)}
            y2={height - margin.bottom + 6}
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <text
            x={xScale(tick)}
            y={height - margin.bottom + 20}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            opacity={0.7}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatTick(tick, xAxis)}
          </text>
        </g>
      ))}
      {xLabel && (
        <text
          x={(margin.left + width - margin.right) / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize={13}
          fontWeight={500}
          fill="currentColor"
          opacity={animate ? 0 : 1}
          style={animate ? { animation: "fadeIn 0.4s ease 0.5s forwards" } : undefined}
        >
          {xLabel}
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
        opacity={animate ? 0 : 1}
        style={animate ? { animation: "fadeIn 0.4s ease 0.2s forwards" } : undefined}
      />
      {yTicks.map((tick, i) => (
        <g key={`ytick-${i}`} opacity={animate ? 0 : 1} style={animate ? { animation: `fadeIn 0.3s ease ${0.3 + i * 0.04}s forwards` } : undefined}>
          <line
            x1={margin.left - 6}
            y1={yScale(tick)}
            x2={margin.left}
            y2={yScale(tick)}
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <text
            x={margin.left - 10}
            y={yScale(tick) + 4}
            textAnchor="end"
            fontSize={10}
            fill="currentColor"
            opacity={0.7}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatTick(tick, yAxis)}
          </text>
        </g>
      ))}
      {yLabel && (
        <text
          x={margin.left - 45}
          y={(margin.top + height - margin.bottom) / 2}
          textAnchor="middle"
          fontSize={13}
          fontWeight={500}
          fill="currentColor"
          transform={`rotate(-90 ${margin.left - 45} ${(margin.top + height - margin.bottom) / 2})`}
          opacity={animate ? 0 : 1}
          style={animate ? { animation: "fadeIn 0.4s ease 0.5s forwards" } : undefined}
        >
          {yLabel}
        </text>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </g>
  );
});

Axes.displayName = "Axes";

interface PointShapeProps {
  cx: number;
  cy: number;
  size: number;
  style: PointStyle;
  color: string;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  animate: boolean;
  index: number;
}

const PointShape = memo(({ cx, cy, size, style, color, isHovered, onMouseEnter, onMouseLeave, animate, index }: PointShapeProps) => {
  const actualSize = isHovered ? size * 1.5 : size;
  const strokeWidth = isHovered ? 2 : 1;

  const commonProps = {
    opacity: animate ? 0 : 0.8,
    style: {
      animation: animate ? `fadeIn 0.2s ease ${0.5 + index * 0.005}s forwards` : undefined,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    onMouseEnter,
    onMouseLeave,
  };

  switch (style) {
    case "circle":
      return (
        <circle
          cx={cx}
          cy={cy}
          r={actualSize}
          fill={color}
          stroke="var(--background)"
          strokeWidth={strokeWidth}
          {...commonProps}
        />
      );

    case "square":
      return (
        <rect
          x={cx - actualSize}
          y={cy - actualSize}
          width={actualSize * 2}
          height={actualSize * 2}
          fill={color}
          stroke="var(--background)"
          strokeWidth={strokeWidth}
          {...commonProps}
        />
      );

    case "diamond":
      const diamondPath = `M ${cx},${cy - actualSize * 1.4} L ${cx + actualSize * 1.4},${cy} L ${cx},${cy + actualSize * 1.4} L ${cx - actualSize * 1.4},${cy} Z`;
      return (
        <path
          d={diamondPath}
          fill={color}
          stroke="var(--background)"
          strokeWidth={strokeWidth}
          {...commonProps}
        />
      );

    case "triangle":
      const trianglePath = `M ${cx},${cy - actualSize * 1.4} L ${cx + actualSize * 1.2},${cy + actualSize * 0.7} L ${cx - actualSize * 1.2},${cy + actualSize * 0.7} Z`;
      return (
        <path
          d={trianglePath}
          fill={color}
          stroke="var(--background)"
          strokeWidth={strokeWidth}
          {...commonProps}
        />
      );

    case "cross":
      return (
        <g {...commonProps}>
          <line
            x1={cx - actualSize * 1.2}
            y1={cy - actualSize * 1.2}
            x2={cx + actualSize * 1.2}
            y2={cy + actualSize * 1.2}
            stroke={color}
            strokeWidth={strokeWidth * 1.5}
            strokeLinecap="round"
          />
          <line
            x1={cx - actualSize * 1.2}
            y1={cy + actualSize * 1.2}
            x2={cx + actualSize * 1.2}
            y2={cy - actualSize * 1.2}
            stroke={color}
            strokeWidth={strokeWidth * 1.5}
            strokeLinecap="round"
          />
        </g>
      );

    case "plus":
      return (
        <g {...commonProps}>
          <line
            x1={cx - actualSize * 1.2}
            y1={cy}
            x2={cx + actualSize * 1.2}
            y2={cy}
            stroke={color}
            strokeWidth={strokeWidth * 1.5}
            strokeLinecap="round"
          />
          <line
            x1={cx}
            y1={cy - actualSize * 1.2}
            x2={cx}
            y2={cy + actualSize * 1.2}
            stroke={color}
            strokeWidth={strokeWidth * 1.5}
            strokeLinecap="round"
          />
        </g>
      );

    default:
      return null;
  }
});

PointShape.displayName = "PointShape";

interface ScatterPointsProps {
  data: Point[];
  pointStyle: PointStyle;
  pointSize: number;
  color: ColorMapping;
  animate: boolean;
}

const ScatterPoints = memo(({ data, pointStyle, pointSize, color, animate }: ScatterPointsProps) => {
  const { xScale, yScale, hoveredPointIdx, setHoveredPointIdx } = usePlot();

  return (
    <g className="scatter-points">
      {data.map((point, i) => {
        const cx = xScale(point.x);
        const cy = yScale(point.y);
        const isHovered = hoveredPointIdx === i;

        // Determine point color
        let pointColor: string;
        if (typeof color === "string") {
          if (color === "density") {
            pointColor = calculateDensity(data, i, xScale, yScale);
          } else {
            pointColor = color;
          }
        } else {
          pointColor = color(point, i);
        }

        return (
          <PointShape
            key={i}
            cx={cx}
            cy={cy}
            size={pointSize}
            style={pointStyle}
            color={pointColor}
            isHovered={isHovered}
            onMouseEnter={() => setHoveredPointIdx(i)}
            onMouseLeave={() => setHoveredPointIdx(null)}
            animate={animate}
            index={i}
          />
        );
      })}
      <style jsx>{`
        @keyframes fadeIn {
          to { opacity: 0.8; }
        }
      `}</style>
    </g>
  );
});

ScatterPoints.displayName = "ScatterPoints";

interface TrendlineProps {
  data: Point[];
  config: Trendline;
  xDomain: [number, number];
  animate: boolean;
}

const TrendlineComponent = memo(({ data, config, xDomain, animate }: TrendlineProps) => {
  const { xScale, yScale } = usePlot();

  const { slope, intercept } = useMemo(() => calculateLinearTrendline(data), [data]);

  const pathData = useMemo(() => {
    const [xMin, xMax] = xDomain;
    const y1 = slope * xMin + intercept;
    const y2 = slope * xMax + intercept;

    return `M ${xScale(xMin)},${yScale(y1)} L ${xScale(xMax)},${yScale(y2)}`;
  }, [slope, intercept, xDomain, xScale, yScale]);

  return (
    <g className="trendline">
      <path
        d={pathData}
        fill="none"
        stroke={config.color || "#ef4444"}
        strokeWidth={2}
        strokeDasharray={config.dashed ? "6,6" : undefined}
        strokeLinecap="round"
        opacity={animate ? 0 : 0.7}
        style={animate ? { animation: "fadeIn 0.5s ease 0.8s forwards" } : undefined}
      />
      <style jsx>{`
        @keyframes fadeIn {
          to { opacity: 0.7; }
        }
      `}</style>
    </g>
  );
});

TrendlineComponent.displayName = "TrendlineComponent";


// ============================================================================
// Main Component
// ============================================================================

/**
 * XY scatter and parametric plot component
 *
 * @example
 * ```tsx
 * // Simple scatter plot
 * <XYPlot
 *   data={phaseSpaceData}
 *   xAxis={{ label: "Position", scale: "linear" }}
 *   yAxis={{ label: "Velocity", scale: "linear" }}
 *   pointStyle="circle"
 *   pointSize={3}
 * />
 *
 * // With density coloring
 * <XYPlot
 *   data={data}
 *   color="density"
 *   showTrendline
 * />
 *
 * // Custom colors
 * <XYPlot
 *   data={data}
 *   color={(point, i) => point.y > 0 ? "#22c55e" : "#ef4444"}
 * />
 * ```
 */
export const XYPlot = memo(
  forwardRef<SVGSVGElement, XYPlotProps>(
    (
      {
        data,
        xAxis = {},
        yAxis = {},
        width = 800,
        height = 400,
        showGrid = true,
        pointStyle = "circle",
        pointSize = 3,
        color = "#64748b",
        showTrendline = false,
        animate = true,
        className = "",
      },
      ref
    ) => {
      const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

      const margin = { top: 20, right: 20, bottom: 50, left: 60 };

      // Calculate domains
      const xDomain = xAxis.domain === "auto" || !xAxis.domain ? getDomain(data, p => p.x) : xAxis.domain;
      const yDomain = yAxis.domain === "auto" || !yAxis.domain ? getDomain(data, p => p.y) : yAxis.domain;

      // Create scales
      const xScale = useMemo(
        () => createScale(xDomain, [margin.left, width - margin.right], xAxis.scale || "linear"),
        [xDomain, margin.left, margin.right, width, xAxis.scale]
      );

      const yScale = useMemo(
        () => createScale(yDomain, [height - margin.bottom, margin.top], yAxis.scale || "linear"),
        [yDomain, height, margin.bottom, margin.top, yAxis.scale]
      );

      const xTicks = useMemo(() => getTicks(xDomain, 8, xAxis.scale || "linear"), [xDomain, xAxis.scale]);
      const yTicks = useMemo(() => getTicks(yDomain, 6, yAxis.scale || "linear"), [yDomain, yAxis.scale]);

      const contextValue: PlotContext = useMemo(
        () => ({ width, height, xScale, yScale, hoveredPointIdx, setHoveredPointIdx }),
        [width, height, xScale, yScale, hoveredPointIdx]
      );

      // Parse trendline config
      const trendlineConfig: Trendline | null = useMemo(() => {
        if (!showTrendline) return null;
        if (typeof showTrendline === "boolean") {
          return { show: true, type: "linear" };
        }
        return { ...showTrendline, show: true };
      }, [showTrendline]);

      // Tooltip content
      const tooltipContent = useMemo(() => {
        if (hoveredPointIdx === null) return null;
        const point = data[hoveredPointIdx];
        return `(${point.x.toFixed(3)}, ${point.y.toFixed(3)})`;
      }, [hoveredPointIdx, data]);

      const tooltipPosition = useMemo(() => {
        if (hoveredPointIdx === null) return null;
        const point = data[hoveredPointIdx];
        return { x: xScale(point.x), y: yScale(point.y) };
      }, [hoveredPointIdx, data, xScale, yScale]);

      return (
        <Context.Provider value={contextValue}>
          <svg ref={ref} width={width} height={height} className={className} style={{ userSelect: "none" }}>
            {showGrid && <Grid xTicks={xTicks} yTicks={yTicks} animate={animate} />}
            <Axes
              xTicks={xTicks}
              yTicks={yTicks}
              xLabel={xAxis.label}
              yLabel={yAxis.label}
              xAxis={xAxis}
              yAxis={yAxis}
              animate={animate}
            />
            {trendlineConfig && trendlineConfig.show && (
              <TrendlineComponent data={data} config={trendlineConfig} xDomain={xDomain} animate={animate} />
            )}
            <ScatterPoints
              data={data}
              pointStyle={pointStyle}
              pointSize={pointSize}
              color={color}
              animate={animate}
            />
            {tooltipContent && tooltipPosition && (
              <ChartTooltip
                x={tooltipPosition.x}
                y={tooltipPosition.y}
                content={tooltipContent}
                showCrosshair
                crosshairBounds={[margin.left, margin.top, width - margin.right, height - margin.bottom]}
              />
            )}
          </svg>
        </Context.Provider>
      );
    }
  )
);

XYPlot.displayName = "XYPlot";
