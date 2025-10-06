"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  memo,
} from "react";

// ============================================================================
// Types
// ============================================================================

/**
 * A single point on the chart
 */
export interface Point {
  /** X value (typically time) */
  x: number;
  /** Y value */
  y: number;
}

/**
 * A line series to plot
 */
export interface Series {
  /** Name shown in legend */
  name: string;
  /** Array of data points */
  data: Point[];
  /** Line color */
  color?: string;
  /** Line thickness in pixels */
  strokeWidth?: number;
  /** Dashed line style */
  dashed?: boolean;
}

/**
 * Configuration for an axis
 */
export interface Axis {
  /** Axis label */
  label?: string;
  /** Min/max values, or "auto" */
  domain?: [number, number] | "auto";
  /** Format type: "number" | "time" */
  type?: "number" | "time";
  /** Timezone for time formatting (IANA timezone, e.g., "UTC", "America/New_York") */
  timezone?: string;
  /** Custom formatter function */
  formatter?: (value: number) => string;
}

/**
 * Props for the LineChart component
 */
export interface LineChartProps {
  /** Array of line series to plot */
  series: Series[];
  /** X-axis configuration */
  xAxis?: Axis;
  /** Y-axis configuration */
  yAxis?: Axis;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Enable animations */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Context (Internal)
// ============================================================================

interface ChartContext {
  width: number;
  height: number;
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  hoveredPoint: { seriesIdx: number; pointIdx: number } | null;
  setHoveredPoint: (point: { seriesIdx: number; pointIdx: number } | null) => void;
}

const Context = createContext<ChartContext | null>(null);

function useChart() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Must be used within LineChart");
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

function createScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const slope = (r1 - r0) / (d1 - d0);
  return (value: number) => r0 + slope * (value - d0);
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(1);
  return value.toFixed(2);
}

/**
 * Format a timestamp for display with timezone support
 * @param timestamp - Unix timestamp in milliseconds
 * @param timezone - IANA timezone string (e.g., "UTC", "America/New_York")
 * @returns Formatted time string
 */
function formatTime(timestamp: number, timezone: string = "UTC"): string {
  try {
    const date = new Date(timestamp);

    // Format as HH:MM:SS in the specified timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone,
    });

    return formatter.format(date);
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    const date = new Date(timestamp);
    return date.toISOString().substr(11, 8);
  }
}

/**
 * Format a timestamp as date with timezone support
 * @param timestamp - Unix timestamp in milliseconds
 * @param timezone - IANA timezone string
 * @returns Formatted date string
 */
function formatDate(timestamp: number, timezone: string = "UTC"): string {
  try {
    const date = new Date(timestamp);

    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: timezone,
    });

    return formatter.format(date);
  } catch (error) {
    const date = new Date(timestamp);
    return date.toISOString().substr(5, 5).replace("-", "/");
  }
}

function getTicks(domain: [number, number], count: number = 5): number[] {
  const [min, max] = domain;
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
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
  const { width, height, xScale, yScale } = useChart();
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
          strokeWidth={1}
          strokeDasharray="2,4"
          opacity={animate ? 0 : 0.15}
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
          strokeWidth={1}
          strokeDasharray="2,4"
          opacity={animate ? 0 : 0.15}
          style={animate ? { animation: `fadeIn 0.3s ease ${i * 0.03}s forwards` } : undefined}
        />
      ))}
      <style jsx>{`
        @keyframes fadeIn {
          to { opacity: 0.15; }
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
  const { width, height, xScale, yScale } = useChart();
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };

  // Format tick value based on axis configuration
  const formatTick = (value: number, axis?: Axis): string => {
    // Use custom formatter if provided
    if (axis?.formatter) {
      return axis.formatter(value);
    }

    // Use time formatting if axis type is "time"
    if (axis?.type === "time") {
      const timezone = axis.timezone || "UTC";
      return formatTime(value, timezone);
    }

    // Default to numeric formatting
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
            fontSize={12}
            fill="currentColor"
            opacity={0.9}
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
            fontSize={12}
            fill="currentColor"
            opacity={0.9}
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

interface LineProps {
  series: Series;
  seriesIdx: number;
  animate: boolean;
}

const Line = memo(({ series, seriesIdx, animate }: LineProps) => {
  const { xScale, yScale, setHoveredPoint, hoveredPoint } = useChart();
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  const { data, color = "#3b82f6", strokeWidth = 2, dashed = false } = series;

  const pathData = useMemo(() => {
    if (data.length === 0) return "";
    return "M " + data.map(p => `${xScale(p.x)},${yScale(p.y)}`).join(" L ");
  }, [data, xScale, yScale]);

  useEffect(() => {
    if (pathRef.current && animate) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [pathData, animate]);

  return (
    <g className="line">
      <path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? "6,6" : animate ? pathLength : undefined}
        strokeDashoffset={animate ? pathLength : 0}
        style={animate ? { animation: `drawLine 1.2s ease-out ${seriesIdx * 0.15}s forwards` } : undefined}
      />
      {data.map((point, i) => {
        const isHovered = hoveredPoint?.seriesIdx === seriesIdx && hoveredPoint?.pointIdx === i;
        return (
          <circle
            key={i}
            cx={xScale(point.x)}
            cy={yScale(point.y)}
            r={isHovered ? 5 : 3}
            fill={color}
            stroke="var(--background)"
            strokeWidth={isHovered ? 2 : 1}
            opacity={animate ? 0 : 1}
            style={{
              animation: animate ? `fadeIn 0.2s ease ${1.2 + seriesIdx * 0.15 + i * 0.01}s forwards` : undefined,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={() => setHoveredPoint({ seriesIdx, pointIdx: i })}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        );
      })}
      <style jsx>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </g>
  );
});

Line.displayName = "Line";

interface LegendProps {
  series: Series[];
}

const Legend = memo(({ series }: LegendProps) => {
  const { width } = useChart();
  const margin = { top: 20, right: 20 };

  return (
    <g transform={`translate(${width - margin.right - 10}, ${margin.top + 10})`}>
      <rect
        x={-10}
        y={-5}
        width={140}
        height={series.length * 24 + 10}
        fill="var(--background)"
        stroke="currentColor"
        strokeWidth={1}
        strokeOpacity={0.3}
        rx={4}
      />
      {series.map((s, i) => (
        <g key={i} transform={`translate(0, ${i * 24})`}>
          <line
            x1={0}
            y1={8}
            x2={18}
            y2={8}
            stroke={s.color || "#3b82f6"}
            strokeWidth={s.strokeWidth || 2}
            strokeDasharray={s.dashed ? "4,4" : undefined}
          />
          <text x={24} y={12} fontSize={12} fill="currentColor">
            {s.name}
          </text>
        </g>
      ))}
    </g>
  );
});

Legend.displayName = "Legend";

interface TooltipProps {
  series: Series[];
}

const Tooltip = memo(({ series }: TooltipProps) => {
  const { xScale, yScale, hoveredPoint } = useChart();

  if (!hoveredPoint) return null;

  const s = series[hoveredPoint.seriesIdx];
  const point = s.data[hoveredPoint.pointIdx];
  const x = xScale(point.x);
  const y = yScale(point.y);
  const text = `${s.name}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;

  return (
    <g>
      <line x1={x} y1={20} x2={x} y2={380} stroke="currentColor" strokeWidth={1} strokeDasharray="3,3" opacity={0.4} pointerEvents="none" />
      <line x1={60} y1={y} x2={740} y2={y} stroke="currentColor" strokeWidth={1} strokeDasharray="3,3" opacity={0.4} pointerEvents="none" />
      <g transform={`translate(${x + 10}, ${y - 10})`}>
        <rect x={0} y={-18} width={text.length * 6.5} height={22} fill="var(--foreground)" rx={3} />
        <text x={4} y={-3} fill="var(--background)" fontSize={11} fontFamily="monospace">{text}</text>
      </g>
    </g>
  );
});

Tooltip.displayName = "Tooltip";

// ============================================================================
// Main Component
// ============================================================================

/**
 * A simple, animated line chart
 *
 * @example
 * ```tsx
 * <LineChart
 *   series={[
 *     {
 *       name: "Temperature",
 *       data: [{ x: 0, y: 20 }, { x: 1, y: 22 }, { x: 2, y: 19 }],
 *       color: "#ef4444"
 *     }
 *   ]}
 *   xAxis={{ label: "Time (s)" }}
 *   yAxis={{ label: "Temp (°C)" }}
 * />
 * ```
 */
export const LineChart = memo(
  forwardRef<SVGSVGElement, LineChartProps>(
    (
      {
        series,
        xAxis = {},
        yAxis = {},
        width = 800,
        height = 400,
        showGrid = true,
        showLegend = true,
        animate = true,
        className = "",
      },
      ref
    ) => {
      const [hoveredPoint, setHoveredPoint] = useState<{ seriesIdx: number; pointIdx: number } | null>(null);

      const margin = { top: 20, right: 20, bottom: 50, left: 60 };

      // Calculate domains
      const allPoints = series.flatMap(s => s.data);
      const xDomain = xAxis.domain === "auto" || !xAxis.domain ? getDomain(allPoints, p => p.x) : xAxis.domain;
      const yDomain = yAxis.domain === "auto" || !yAxis.domain ? getDomain(allPoints, p => p.y) : yAxis.domain;

      // Create scales
      const xScale = useMemo(
        () => createScale(xDomain, [margin.left, width - margin.right]),
        [xDomain, margin.left, margin.right, width]
      );

      const yScale = useMemo(
        () => createScale(yDomain, [height - margin.bottom, margin.top]),
        [yDomain, height, margin.bottom, margin.top]
      );

      const xTicks = useMemo(() => getTicks(xDomain, 8), [xDomain]);
      const yTicks = useMemo(() => getTicks(yDomain, 6), [yDomain]);

      const contextValue: ChartContext = useMemo(
        () => ({ width, height, xScale, yScale, hoveredPoint, setHoveredPoint }),
        [width, height, xScale, yScale, hoveredPoint]
      );

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
            {series.map((s, i) => (
              <Line key={i} series={s} seriesIdx={i} animate={animate} />
            ))}
            <Tooltip series={series} />
            {showLegend && <Legend series={series} />}
          </svg>
        </Context.Provider>
      );
    }
  )
);

LineChart.displayName = "LineChart";
