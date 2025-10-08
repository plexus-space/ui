"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  forwardRef,
  memo,
} from "react";
import { ChartTooltip } from "./chart-tooltip";
import { ChartLegend, type LegendItem } from "./chart-legend";
import { CanvasRenderer } from "./canvas-renderer";
import { decimate } from "./decimation";

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

export interface LineChartProps {
  series: Series[];
  xAxis?: Axis;
  yAxis?: Axis;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  /** Rendering mode: svg (default), canvas (faster for >1k points), or auto */
  renderer?: "svg" | "canvas" | "auto";
  /** Maximum points per series before decimation (default: 2000) */
  maxPoints?: number;
  /** Decimation strategy */
  decimation?: "lttb" | "minmax" | "auto";
  /** Enable magnetic crosshair that snaps to nearest point */
  magneticCrosshair?: boolean;
  className?: string;
}

// ============================================================================
// Context
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
    return date.toISOString().substr(11, 8);
  }
}

function getTicks(domain: [number, number], count: number = 5): number[] {
  const [min, max] = domain;
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

/**
 * Find nearest point to mouse position using binary search (for sorted x-values)
 */
function findNearestPoint(
  data: Point[],
  mouseX: number,
  xScale: (x: number) => number
): number {
  if (data.length === 0) return -1;

  let minDist = Infinity;
  let nearestIdx = 0;

  for (let i = 0; i < data.length; i++) {
    const dist = Math.abs(xScale(data[i].x) - mouseX);
    if (dist < minDist) {
      minDist = dist;
      nearestIdx = i;
    }
  }

  return nearestIdx;
}

// ============================================================================
// Components
// ============================================================================

interface GridProps {
  xTicks: number[];
  yTicks: number[];
  animate: boolean;
  margin: { top: number; right: number; bottom: number; left: number };
}

const Grid = memo(({ xTicks, yTicks, animate, margin }: GridProps) => {
  const { width, height, xScale, yScale } = useChart();

  return (
    <g className="grid">
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
  margin: { top: number; right: number; bottom: number; left: number };
}

const Axes = memo(({ xTicks, yTicks, xLabel, yLabel, xAxis, yAxis, animate, margin }: AxesProps) => {
  const { width, height, xScale, yScale } = useChart();

  const formatTick = (value: number, axis?: Axis): string => {
    if (axis?.formatter) {
      return axis.formatter(value);
    }
    if (axis?.type === "time") {
      const timezone = axis.timezone || "UTC";
      return formatTime(value, timezone);
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
        <g
          key={`xtick-${i}`}
          opacity={animate ? 0 : 1}
          style={animate ? { animation: `fadeIn 0.3s ease ${0.3 + i * 0.04}s forwards` } : undefined}
        >
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
        <g
          key={`ytick-${i}`}
          opacity={animate ? 0 : 1}
          style={animate ? { animation: `fadeIn 0.3s ease ${0.3 + i * 0.04}s forwards` } : undefined}
        >
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

interface InteractionLayerProps {
  series: Series[];
  magneticCrosshair: boolean;
  margin: { top: number; right: number; bottom: number; left: number };
}

const InteractionLayer = memo(({ series, magneticCrosshair, margin }: InteractionLayerProps) => {
  const { width, height, xScale, setHoveredPoint } = useChart();

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    if (!magneticCrosshair) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find nearest point across all series
    let nearestSeriesIdx = 0;
    let nearestPointIdx = 0;
    let minDist = Infinity;

    series.forEach((s, seriesIdx) => {
      const idx = findNearestPoint(s.data, mouseX, xScale);
      if (idx >= 0) {
        const dist = Math.abs(xScale(s.data[idx].x) - mouseX);
        if (dist < minDist) {
          minDist = dist;
          nearestSeriesIdx = seriesIdx;
          nearestPointIdx = idx;
        }
      }
    });

    if (minDist < 50) { // Snap radius
      setHoveredPoint({ seriesIdx: nearestSeriesIdx, pointIdx: nearestPointIdx });
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <rect
      x={margin.left}
      y={margin.top}
      width={width - margin.left - margin.right}
      height={height - margin.top - margin.bottom}
      fill="transparent"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: magneticCrosshair ? "crosshair" : "default" }}
    />
  );
});

InteractionLayer.displayName = "InteractionLayer";

// ============================================================================
// Main Component
// ============================================================================

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
        renderer = "auto",
        maxPoints = 2000,
        decimation = "lttb",
        magneticCrosshair = true,
        className = "",
      },
      ref
    ) => {
      const [hoveredPoint, setHoveredPoint] = useState<{ seriesIdx: number; pointIdx: number } | null>(null);

      // Add more margin when legend is shown
      const margin = useMemo(
        () => ({
          top: 30,
          right: showLegend ? 180 : 30,
          bottom: 60,
          left: 70,
        }),
        [showLegend]
      );

      // Decimate data if needed
      const processedSeries = useMemo(() => {
        return series.map((s) => {
          if (s.data.length <= maxPoints) {
            return s;
          }
          return {
            ...s,
            data: decimate(s.data, maxPoints, decimation),
          };
        });
      }, [series, maxPoints, decimation]);

      // Calculate domains
      const allPoints = processedSeries.flatMap((s) => s.data);
      const xDomain = xAxis.domain === "auto" || !xAxis.domain ? getDomain(allPoints, (p) => p.x) : xAxis.domain;
      const yDomain = yAxis.domain === "auto" || !yAxis.domain ? getDomain(allPoints, (p) => p.y) : yAxis.domain;

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
        () => ({
          width,
          height,
          xScale,
          yScale,
          hoveredPoint,
          setHoveredPoint,
        }),
        [width, height, xScale, yScale, hoveredPoint]
      );

      // Determine rendering mode
      const useCanvas = useMemo(() => {
        if (renderer === "canvas") return true;
        if (renderer === "svg") return false;
        // Auto: use canvas if any series has >1000 points
        return processedSeries.some((s) => s.data.length > 1000);
      }, [renderer, processedSeries]);

      // Legend items
      const legendItems: LegendItem[] = useMemo(
        () =>
          processedSeries.map((s) => ({
            name: s.name,
            color: s.color || "#64748b",
            strokeWidth: s.strokeWidth || 2,
            dashed: s.dashed,
            filled: s.filled,
            symbol: "line" as const,
          })),
        [processedSeries]
      );

      // Tooltip content
      const tooltipContent = useMemo(() => {
        if (!hoveredPoint) return null;
        const s = processedSeries[hoveredPoint.seriesIdx];
        const point = s.data[hoveredPoint.pointIdx];
        return `${s.name}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
      }, [hoveredPoint, processedSeries]);

      const tooltipPosition = useMemo(() => {
        if (!hoveredPoint) return null;
        const s = processedSeries[hoveredPoint.seriesIdx];
        const point = s.data[hoveredPoint.pointIdx];
        return { x: xScale(point.x), y: yScale(point.y) };
      }, [hoveredPoint, processedSeries, xScale, yScale]);

      return (
        <Context.Provider value={contextValue}>
          <div style={{ position: "relative", width, height }}>
            {useCanvas && (
              <CanvasRenderer
                series={processedSeries.map((s) => ({
                  ...s,
                  color: s.color || "#64748b",
                }))}
                width={width}
                height={height}
                xScale={xScale}
                yScale={yScale}
                margin={margin}
              />
            )}
            <svg
              ref={ref}
              width={width}
              height={height}
              className={className}
              style={{ userSelect: "none", position: "absolute", top: 0, left: 0 }}
            >
              {showGrid && <Grid xTicks={xTicks} yTicks={yTicks} animate={animate} margin={margin} />}
              <Axes
                xTicks={xTicks}
                yTicks={yTicks}
                xLabel={xAxis.label}
                yLabel={yAxis.label}
                xAxis={xAxis}
                yAxis={yAxis}
                animate={animate}
                margin={margin}
              />
              <InteractionLayer series={processedSeries} magneticCrosshair={magneticCrosshair} margin={margin} />
              {tooltipContent && tooltipPosition && (
                <ChartTooltip
                  x={tooltipPosition.x}
                  y={tooltipPosition.y}
                  content={tooltipContent}
                  showCrosshair
                  crosshairBounds={[margin.left, margin.top, width - margin.right, height - margin.bottom]}
                />
              )}
              {showLegend && (
                <ChartLegend
                  items={legendItems}
                  x={width - margin.right + 10}
                  y={margin.top}
                />
              )}
            </svg>
          </div>
        </Context.Provider>
      );
    }
  )
);

LineChart.displayName = "LineChart";
