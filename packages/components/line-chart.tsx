"use client";

import * as React from "react";

// Utility function for class names
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// ============================================================================
// Types
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Series {
  name: string;
  data: Point[];
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
  filled?: boolean;
}

export interface Axis {
  label?: string;
  domain?: [number, number] | "auto";
  type?: "number" | "time";
  timezone?: string;
  formatter?: (value: number) => string;
}

export type LineChartVariant =
  | "default"
  | "minimal"
  | "scientific"
  | "dashboard";

export interface LineChartRootProps {
  series: Series[];
  xAxis?: Axis;
  yAxis?: Axis;
  width?: number;
  height?: number;
  /** Maximum points per series before decimation (default: 2000) */
  maxPoints?: number;
  /** Enable magnetic crosshair that snaps to nearest point */
  magneticCrosshair?: boolean;
  /** Visual variant style */
  variant?: LineChartVariant;
  /** Snap radius in pixels for point detection (default: 30) */
  snapRadius?: number;
  /** Enable zoom and pan interactions */
  enableZoom?: boolean;
  /** Enable animations */
  animate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface LineChartContext {
  series: Series[];
  processedSeries: Series[];
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
  variant: LineChartVariant;
  animate: boolean;
  enableZoom: boolean;
  magneticCrosshair: boolean;
  snapRadius: number;
}

const LineChartContext = React.createContext<LineChartContext | null>(null);

function useLineChart() {
  const ctx = React.useContext(LineChartContext);
  if (!ctx) throw new Error("useLineChart must be used within LineChart.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function getDomain(
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

function createScale(
  domain: [number, number],
  range: [number, number]
): (value: number) => number {
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

function formatTime(timestamp: number, timezone: string = "UTC"): string {
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

function getTicks(domain: [number, number], count: number = 5): number[] {
  const [min, max] = domain;
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

function decimateData(data: Point[], maxPoints: number): Point[] {
  if (data.length <= maxPoints) return data;
  const threshold = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % threshold === 0);
}

function generateSmoothPath(
  points: Point[],
  xScale: (x: number) => number,
  yScale: (y: number) => number
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
  const tension = 0.3;

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
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const LineChartRoot = React.forwardRef<HTMLDivElement, LineChartRootProps>(
  (
    {
      series,
      xAxis = {},
      yAxis = {},
      width = 800,
      height = 400,
      maxPoints = 2000,
      magneticCrosshair = true,
      variant = "default",
      snapRadius = 40,
      enableZoom = false,
      animate = false,
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

    // Process series (decimation if needed)
    const processedSeries = React.useMemo(() => {
      return series.map((s) => ({
        ...s,
        data: decimateData(s.data, maxPoints),
      }));
    }, [series, maxPoints]);

    // Calculate domains
    const allPoints = processedSeries.flatMap((s) => s.data);
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

    const contextValue: LineChartContext = React.useMemo(
      () => ({
        series,
        processedSeries,
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
        magneticCrosshair,
        snapRadius,
      }),
      [
        series,
        processedSeries,
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
        magneticCrosshair,
        snapRadius,
      ]
    );

    return (
      <LineChartContext.Provider value={contextValue}>
        <div ref={ref} className={cn("line-chart", className)}>
          {children}
        </div>
      </LineChartContext.Provider>
    );
  }
);

LineChartRoot.displayName = "LineChart.Root";

/**
 * Container component - wraps the SVG content
 */
const LineChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { width, height } = useLineChart();

  return (
    <div
      ref={ref}
      className={cn("line-chart-container", className)}
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
      }}
      {...props}
    />
  );
});

LineChartContainer.displayName = "LineChart.Container";

/**
 * Viewport component - SVG canvas
 */
const LineChartViewport = React.forwardRef<
  SVGSVGElement,
  React.SVGAttributes<SVGSVGElement>
>(({ className, children, ...props }, ref) => {
  const { width, height } = useLineChart();

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      className={cn("line-chart-svg", className)}
      style={{ display: "block", userSelect: "none" }}
      role="img"
      aria-label="Line chart"
      {...props}
    >
      {children}
    </svg>
  );
});

LineChartViewport.displayName = "LineChart.Viewport";

/**
 * Grid component - renders grid lines
 */
const LineChartGrid = React.forwardRef<
  SVGGElement,
  React.SVGAttributes<SVGGElement>
>(({ className, ...props }, ref) => {
  const { xTicks, yTicks, xScale, yScale, margin, width, height, animate } =
    useLineChart();

  return (
    <g ref={ref} className={cn("line-chart-grid", className)} {...props}>
      {/* Vertical grid lines */}
      {xTicks.map((tick, i) => (
        <line
          key={`vgrid-${i}`}
          x1={xScale(tick)}
          y1={margin.top}
          x2={xScale(tick)}
          y2={height - margin.bottom}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.1}
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
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.1}
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
});

LineChartGrid.displayName = "LineChart.Grid";

/**
 * Axes component - renders X and Y axes with labels
 */
const LineChartAxes = React.forwardRef<
  SVGGElement,
  React.SVGAttributes<SVGGElement>
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
    animate,
  } = useLineChart();

  const formatTick = (value: number, axis: Axis): string => {
    if (axis.formatter) return axis.formatter(value);
    if (axis.type === "time") {
      const timezone = axis.timezone || "UTC";
      return formatTime(value, timezone);
    }
    return formatValue(value);
  };

  return (
    <g ref={ref} className={cn("line-chart-axes", className)} {...props}>
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
});

LineChartAxes.displayName = "LineChart.Axes";

/**
 * Lines component - renders the data lines
 */
const LineChartLines = React.forwardRef<
  SVGGElement,
  React.SVGAttributes<SVGGElement>
>(({ className, ...props }, ref) => {
  const { processedSeries, xScale, yScale, hiddenSeries, animate } =
    useLineChart();

  return (
    <g ref={ref} className={cn("line-chart-lines", className)} {...props}>
      {processedSeries.map((s, seriesIdx) => {
        if (s.data.length === 0 || hiddenSeries.has(seriesIdx)) return null;

        const pathData = generateSmoothPath(s.data, xScale, yScale);
        const color = s.color || "#64748b";

        // Build filled area path
        const baselineY = yScale(0);
        const filledPath = s.filled
          ? pathData +
            ` L ${xScale(s.data[s.data.length - 1].x)} ${baselineY} L ${xScale(
              s.data[0].x
            )} ${baselineY} Z`
          : undefined;

        return (
          <g key={seriesIdx}>
            {s.filled && filledPath && (
              <>
                <defs>
                  <linearGradient
                    id={`gradient-${seriesIdx}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <path
                  d={filledPath}
                  fill={`url(#gradient-${seriesIdx})`}
                  style={
                    animate
                      ? {
                          animation: `fadeIn 0.5s ease ${
                            seriesIdx * 0.1
                          }s forwards`,
                          opacity: 0,
                        }
                      : undefined
                  }
                />
              </>
            )}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth={s.strokeWidth || 2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={s.dashed ? "6,6" : undefined}
              style={
                animate
                  ? {
                      animation: `fadeIn 0.5s ease ${
                        seriesIdx * 0.1
                      }s forwards`,
                      opacity: 0,
                    }
                  : undefined
              }
            />
          </g>
        );
      })}
    </g>
  );
});

LineChartLines.displayName = "LineChart.Lines";

/**
 * Points component - renders data points
 */
const LineChartPoints = React.forwardRef<
  SVGGElement,
  React.SVGAttributes<SVGGElement> & { radius?: number }
>(({ className, radius = 3, ...props }, ref) => {
  const { processedSeries, xScale, yScale, hiddenSeries } = useLineChart();

  return (
    <g ref={ref} className={cn("line-chart-points", className)} {...props}>
      {processedSeries.map((s, seriesIdx) => {
        if (s.data.length === 0 || hiddenSeries.has(seriesIdx)) return null;

        const color = s.color || "#64748b";

        return (
          <g key={seriesIdx}>
            {s.data.map((point, i) => (
              <circle
                key={i}
                cx={xScale(point.x)}
                cy={yScale(point.y)}
                r={radius}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
});

LineChartPoints.displayName = "LineChart.Points";

/**
 * Tooltip component - interactive tooltip on hover
 */
const LineChartTooltip = React.forwardRef<
  SVGGElement,
  React.SVGAttributes<SVGGElement>
>(({ className, ...props }, ref) => {
  const {
    hoveredPoint,
    processedSeries,
    xScale,
    yScale,
    xAxis,
    yAxis,
    width,
    height,
  } = useLineChart();

  if (!hoveredPoint) return null;

  const s = processedSeries[hoveredPoint.seriesIdx];
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
  const tooltipHeight = 70;
  const offsetX = px > width / 2 ? -tooltipWidth - 10 : 10;
  const offsetY = py > height / 2 ? -tooltipHeight - 10 : 10;

  return (
    <g ref={ref} className={cn("line-chart-tooltip", className)} {...props}>
      {/* Crosshair */}
      <line
        x1={px}
        y1={0}
        x2={px}
        y2={height}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.3}
      />
      <line
        x1={0}
        y1={py}
        x2={width}
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
        r={6}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={0.6}
      >
        <animate
          attributeName="r"
          from="6"
          to="10"
          dur="0.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.6"
          to="0"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={px}
        cy={py}
        r={4}
        fill={color}
        stroke="white"
        strokeWidth={2}
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
      <text
        x={px + offsetX + 10}
        y={py + offsetY + 38}
        fontSize={10}
        fill="white"
        opacity={0.8}
        style={{ mixBlendMode: "difference" }}
      >
        {xAxis.label || "X"}: {xLabel}
      </text>
      <text
        x={px + offsetX + 10}
        y={py + offsetY + 54}
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

LineChartTooltip.displayName = "LineChart.Tooltip";

/**
 * Interaction layer component - handles mouse events
 */
const LineChartInteraction = React.forwardRef<
  SVGRectElement,
  React.SVGAttributes<SVGRectElement>
>(({ className, ...props }, ref) => {
  const {
    margin,
    width,
    height,
    processedSeries,
    xScale,
    yScale,
    setHoveredPoint,
    magneticCrosshair,
    snapRadius,
    hiddenSeries,
  } = useLineChart();

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (!magneticCrosshair) return;

      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let nearestSeriesIdx = 0;
      let nearestPointIdx = 0;
      let minDist = Infinity;

      processedSeries.forEach((s, seriesIdx) => {
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
        setHoveredPoint({
          seriesIdx: nearestSeriesIdx,
          pointIdx: nearestPointIdx,
        });
      } else {
        setHoveredPoint(null);
      }
    },
    [
      magneticCrosshair,
      processedSeries,
      xScale,
      yScale,
      snapRadius,
      hiddenSeries,
      setHoveredPoint,
    ]
  );

  const handleMouseLeave = React.useCallback(() => {
    setHoveredPoint(null);
  }, [setHoveredPoint]);

  return (
    <rect
      ref={ref}
      x={margin.left}
      y={margin.top}
      width={width - margin.left - margin.right}
      height={height - margin.top - margin.bottom}
      fill="transparent"
      className={cn("line-chart-interaction", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: magneticCrosshair ? "crosshair" : "default" }}
      {...props}
    />
  );
});

LineChartInteraction.displayName = "LineChart.Interaction";

/**
 * Legend component
 */
const LineChartLegend = React.forwardRef<
  SVGGElement,
  React.SVGAttributes<SVGGElement> & { interactive?: boolean }
>(({ className, interactive = false, ...props }, ref) => {
  const { processedSeries, width, margin, hiddenSeries, toggleSeries } =
    useLineChart();

  return (
    <g ref={ref} className={cn("line-chart-legend", className)} {...props}>
      {processedSeries.map((s, idx) => {
        const x = width - margin.right + 20;
        const y = margin.top + idx * 24;
        const color = s.color || "#64748b";
        const isHidden = hiddenSeries.has(idx);

        return (
          <g
            key={idx}
            onClick={interactive ? () => toggleSeries(idx) : undefined}
            style={{ cursor: interactive ? "pointer" : "default" }}
            opacity={isHidden ? 0.4 : 1}
          >
            <line
              x1={x}
              y1={y}
              x2={x + 20}
              y2={y}
              stroke={color}
              strokeWidth={2.5}
              strokeDasharray={s.dashed ? "4,4" : undefined}
            />
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

LineChartLegend.displayName = "LineChart.Legend";

/**
 * Empty state component
 */
const LineChartEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { width, height } = useLineChart();

  return (
    <div
      ref={ref}
      className={cn("line-chart-empty", className)}
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
            <polyline
              points="22 12 18 12 15 21 9 3 6 12 2 12"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ fontSize: "14px", opacity: 0.5 }}>
            No data available
          </div>
        </>
      )}
    </div>
  );
});

LineChartEmpty.displayName = "LineChart.Empty";

/**
 * Loading state component
 */
const LineChartLoading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { width, height } = useLineChart();

  return (
    <div
      ref={ref}
      className={cn("line-chart-loading", className)}
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

LineChartLoading.displayName = "LineChart.Loading";

// ============================================================================
// Exports
// ============================================================================

export const LineChart = Object.assign(LineChartRoot, {
  Root: LineChartRoot,
  Container: LineChartContainer,
  Viewport: LineChartViewport,
  Grid: LineChartGrid,
  Axes: LineChartAxes,
  Lines: LineChartLines,
  Points: LineChartPoints,
  Tooltip: LineChartTooltip,
  Interaction: LineChartInteraction,
  Legend: LineChartLegend,
  Empty: LineChartEmpty,
  Loading: LineChartLoading,
});
