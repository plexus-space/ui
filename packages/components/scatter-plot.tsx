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
  useCallback,
} from "react";
import { ChartTooltip } from "./chart-tooltip";
import { ChartLegend, type LegendItem } from "./chart-legend";

// ============================================================================
// Types
// ============================================================================

export interface Point {
  x: number;
  y: number;
  /** Optional size for bubble charts */
  size?: number;
  /** Optional category/label */
  label?: string;
}

export interface ScatterSeries {
  name: string;
  data: Point[];
  color?: string;
  /** Marker shape */
  symbol?: "circle" | "square" | "diamond" | "triangle" | "cross" | "plus";
  /** Base marker size in pixels */
  size?: number;
  /** Enable size scaling (bubble chart) */
  sizeScale?: [number, number]; // [minSize, maxSize]
  /** Opacity */
  opacity?: number;
  /** Show trendline */
  trendline?: boolean | "linear" | "polynomial" | "exponential";
}

export interface Axis {
  label?: string;
  domain?: [number, number] | "auto";
  type?: "number" | "log";
  formatter?: (value: number) => string;
}

export interface ScatterPlotProps {
  series: ScatterSeries[];
  xAxis?: Axis;
  yAxis?: Axis;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  /** Show data density contours */
  showDensity?: boolean;
  /** Enable responsive container */
  responsive?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Allow series visibility toggle */
  toggleableSeries?: boolean;
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
  hiddenSeries: Set<number>;
  toggleSeries: (idx: number) => void;
}

const Context = createContext<ChartContext | null>(null);

function useChart() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Must be used within ScatterPlot");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function useResizeObserver(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

function getDomain(points: Point[], accessor: (p: Point) => number, addPadding: boolean = true): [number, number] {
  if (points.length === 0) return [0, 1];
  const values = points.map(accessor);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (!addPadding) return [min, max];

  const padding = (max - min) * 0.1 || 1;
  return [min - padding, max + padding];
}

function createScale(domain: [number, number], range: [number, number], type: "number" | "log" = "number") {
  const [d0, d1] = domain;
  const [r0, r1] = range;

  if (type === "log") {
    const logMin = Math.log10(d0 || 1);
    const logMax = Math.log10(d1 || 1);
    const slope = (r1 - r0) / (logMax - logMin);
    return (value: number) => {
      const logValue = Math.log10(Math.max(value, 0.0001));
      return r0 + slope * (logValue - logMin);
    };
  }

  const slope = (r1 - r0) / (d1 - d0);
  return (value: number) => r0 + slope * (value - d0);
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(1);
  return value.toFixed(2);
}

function getTicks(domain: [number, number], count: number = 5): number[] {
  const [min, max] = domain;
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

// Calculate linear regression
function linearRegression(points: Point[]): { slope: number; intercept: number } {
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  points.forEach(p => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
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
          strokeWidth={1}
          opacity={animate ? 0 : 0.15}
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
          strokeWidth={1}
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
  margin: { top: number; right: number; bottom: number; left: number };
}

const Axes = memo(({ xTicks, yTicks, xLabel, yLabel, xAxis, yAxis, animate, margin }: AxesProps) => {
  const { width, height, xScale, yScale } = useChart();

  const formatTick = (value: number, axis?: Axis): string => {
    if (axis?.formatter) return axis.formatter(value);
    return formatValue(value);
  };

  return (
    <g className="axes">
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

interface PointsProps {
  series: ScatterSeries[];
  animate: boolean;
}

const Points = memo(({ series, animate }: PointsProps) => {
  const { xScale, yScale, hiddenSeries, setHoveredPoint } = useChart();

  return (
    <g className="points">
      {series.map((s, seriesIdx) => {
        if (s.data.length === 0 || hiddenSeries.has(seriesIdx)) return null;

        const color = s.color || "#64748b";
        const baseSize = s.size || 6;
        const opacity = s.opacity ?? 0.7;
        const symbol = s.symbol || "circle";

        // Calculate size domain for bubble scaling
        const sizeDomain = s.sizeScale && s.data.some(p => p.size !== undefined)
          ? [Math.min(...s.data.filter(p => p.size).map(p => p.size!)), Math.max(...s.data.filter(p => p.size).map(p => p.size!))]
          : null;

        return (
          <g key={seriesIdx}>
            {s.data.map((point, pointIdx) => {
              const px = xScale(point.x);
              const py = yScale(point.y);

              // Calculate point size (bubble scaling)
              let pointSize = baseSize;
              if (s.sizeScale && point.size !== undefined && sizeDomain) {
                const [minDomain, maxDomain] = sizeDomain;
                const [minSize, maxSize] = s.sizeScale;
                const normalized = (point.size - minDomain) / (maxDomain - minDomain);
                pointSize = minSize + normalized * (maxSize - minSize);
              }

              const renderMarker = () => {
                switch (symbol) {
                  case "circle":
                    return (
                      <circle
                        cx={px}
                        cy={py}
                        r={pointSize}
                        fill={color}
                        opacity={opacity}
                        stroke="white"
                        strokeWidth={1}
                      />
                    );
                  case "square":
                    return (
                      <rect
                        x={px - pointSize}
                        y={py - pointSize}
                        width={pointSize * 2}
                        height={pointSize * 2}
                        fill={color}
                        opacity={opacity}
                        stroke="white"
                        strokeWidth={1}
                      />
                    );
                  case "diamond":
                    return (
                      <path
                        d={`M ${px},${py - pointSize} L ${px + pointSize},${py} L ${px},${py + pointSize} L ${px - pointSize},${py} Z`}
                        fill={color}
                        opacity={opacity}
                        stroke="white"
                        strokeWidth={1}
                      />
                    );
                  case "triangle":
                    return (
                      <path
                        d={`M ${px},${py - pointSize} L ${px + pointSize},${py + pointSize * 0.6} L ${px - pointSize},${py + pointSize * 0.6} Z`}
                        fill={color}
                        opacity={opacity}
                        stroke="white"
                        strokeWidth={1}
                      />
                    );
                  case "cross":
                    return (
                      <g>
                        <line
                          x1={px - pointSize}
                          y1={py}
                          x2={px + pointSize}
                          y2={py}
                          stroke={color}
                          strokeWidth={2}
                          opacity={opacity}
                        />
                        <line
                          x1={px}
                          y1={py - pointSize}
                          x2={px}
                          y2={py + pointSize}
                          stroke={color}
                          strokeWidth={2}
                          opacity={opacity}
                        />
                      </g>
                    );
                  case "plus":
                    return (
                      <g>
                        <line
                          x1={px - pointSize}
                          y1={py - pointSize}
                          x2={px + pointSize}
                          y2={py + pointSize}
                          stroke={color}
                          strokeWidth={2}
                          opacity={opacity}
                        />
                        <line
                          x1={px - pointSize}
                          y1={py + pointSize}
                          x2={px + pointSize}
                          y2={py - pointSize}
                          stroke={color}
                          strokeWidth={2}
                          opacity={opacity}
                        />
                      </g>
                    );
                  default:
                    return null;
                }
              };

              return (
                <g
                  key={pointIdx}
                  opacity={animate ? 0 : 1}
                  style={animate ? { animation: `fadeIn 0.5s ease ${seriesIdx * 0.1 + pointIdx * 0.002}s forwards`, cursor: "pointer" } : { cursor: "pointer" }}
                  onMouseEnter={() => setHoveredPoint({ seriesIdx, pointIdx })}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {renderMarker()}
                </g>
              );
            })}

            {/* Trendline */}
            {s.trendline && s.data.length >= 2 && (
              (() => {
                const { slope, intercept } = linearRegression(s.data);
                const xMin = Math.min(...s.data.map(p => p.x));
                const xMax = Math.max(...s.data.map(p => p.x));
                const y1 = slope * xMin + intercept;
                const y2 = slope * xMax + intercept;

                return (
                  <line
                    x1={xScale(xMin)}
                    y1={yScale(y1)}
                    x2={xScale(xMax)}
                    y2={yScale(y2)}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                    opacity={0.5}
                  />
                );
              })()
            )}
          </g>
        );
      })}
      <style jsx>{`
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </g>
  );
});

Points.displayName = "Points";

// ============================================================================
// Main Component
// ============================================================================

export const ScatterPlot = memo(
  forwardRef<SVGSVGElement, ScatterPlotProps>(
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
        responsive = false,
        loading = false,
        emptyMessage = "No data available",
        toggleableSeries = false,
        className = "",
      },
      ref
    ) => {
      const [hoveredPoint, setHoveredPoint] = useState<{ seriesIdx: number; pointIdx: number } | null>(null);
      const [hiddenSeries, setHiddenSeries] = useState<Set<number>>(new Set());
      const containerRef = useRef<HTMLDivElement>(null);
      const svgRef = useRef<SVGSVGElement>(null);

      const containerSize = useResizeObserver(containerRef);
      const actualWidth = responsive && containerSize.width > 0 ? containerSize.width : width;
      const actualHeight = responsive && containerSize.height > 0 ? containerSize.height : height;

      const toggleSeries = useCallback((idx: number) => {
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

      const margin = useMemo(
        () => ({
          top: actualHeight < 300 ? 20 : 30,
          right: showLegend ? (actualWidth < 600 ? 120 : 180) : (actualWidth < 400 ? 20 : 30),
          bottom: actualHeight < 300 ? 40 : 60,
          left: actualWidth < 400 ? 50 : 70,
        }),
        [showLegend, actualWidth, actualHeight]
      );

      const allPoints = series.flatMap((s) => s.data);
      const xDomain = xAxis.domain === "auto" || !xAxis.domain ? getDomain(allPoints, (p) => p.x, true) : xAxis.domain;
      const yDomain = yAxis.domain === "auto" || !yAxis.domain ? getDomain(allPoints, (p) => p.y, true) : yAxis.domain;

      const xScale = useMemo(
        () => createScale(xDomain, [margin.left, actualWidth - margin.right], xAxis.type),
        [xDomain, margin.left, margin.right, actualWidth, xAxis.type]
      );

      const yScale = useMemo(
        () => createScale(yDomain, [actualHeight - margin.bottom, margin.top], yAxis.type),
        [yDomain, actualHeight, margin.bottom, margin.top, yAxis.type]
      );

      const xTicks = useMemo(() => getTicks(xDomain, 8), [xDomain]);
      const yTicks = useMemo(() => getTicks(yDomain, 8), [yDomain]);

      const contextValue: ChartContext = useMemo(
        () => ({
          width: actualWidth,
          height: actualHeight,
          xScale,
          yScale,
          hoveredPoint,
          setHoveredPoint,
          hiddenSeries,
          toggleSeries,
        }),
        [actualWidth, actualHeight, xScale, yScale, hoveredPoint, hiddenSeries, toggleSeries]
      );

      const legendItems: LegendItem[] = useMemo(
        () =>
          series.map((s, idx) => ({
            name: s.name,
            color: s.color || "#64748b",
            symbol: s.symbol || "circle",
            active: !hiddenSeries.has(idx),
            onClick: toggleableSeries ? () => toggleSeries(idx) : undefined,
          })),
        [series, hiddenSeries, toggleableSeries, toggleSeries]
      );

      const tooltipContent = useMemo(() => {
        if (!hoveredPoint) return null;
        const s = series[hoveredPoint.seriesIdx];
        if (!s) return null;
        const point = s.data[hoveredPoint.pointIdx];

        const xLabel = xAxis.formatter?.(point.x) ?? formatValue(point.x);
        const yLabel = yAxis.formatter?.(point.y) ?? formatValue(point.y);

        let content = `${s.name}\n${xAxis.label || "X"}: ${xLabel}\n${yAxis.label || "Y"}: ${yLabel}`;
        if (point.size !== undefined) {
          content += `\nSize: ${formatValue(point.size)}`;
        }
        if (point.label) {
          content += `\n${point.label}`;
        }

        return content;
      }, [hoveredPoint, series, xAxis, yAxis]);

      const tooltipPosition = useMemo(() => {
        if (!hoveredPoint) return null;
        const s = series[hoveredPoint.seriesIdx];
        if (!s) return null;
        const point = s.data[hoveredPoint.pointIdx];
        const x = xScale(point.x);
        const y = yScale(point.y);

        const offsetX = x > actualWidth / 2 ? -10 : 10;
        const offsetY = y > actualHeight / 2 ? -10 : 10;

        return { x: x + offsetX, y: y + offsetY };
      }, [hoveredPoint, series, xScale, yScale, actualWidth, actualHeight]);

      const isEmpty = series.length === 0 || series.every(s => s.data.length === 0);

      return (
        <Context.Provider value={contextValue}>
          <div
            ref={containerRef}
            style={{
              position: "relative",
              width: responsive ? "100%" : `${width}px`,
              height: responsive ? "100%" : `${height}px`,
              display: responsive ? "block" : "inline-block",
              minHeight: responsive ? "200px" : undefined,
            }}
            className={className}
          >
            {loading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "hsl(var(--background) / 0.9)",
                  backdropFilter: "blur(4px)",
                  zIndex: 10,
                }}
                role="status"
                aria-live="polite"
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "4px solid hsl(var(--muted) / 0.2)",
                      borderTop: "4px solid hsl(var(--primary))",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 12px",
                    }}
                  />
                  <div style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>Loading chart...</div>
                </div>
                <style jsx>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}

            {!loading && isEmpty && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "12px",
                }}
                role="status"
              >
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" opacity="0.3">
                  <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  <circle cx="5" cy="7" r="2" strokeWidth="2" />
                  <circle cx="19" cy="17" r="2" strokeWidth="2" />
                </svg>
                <div style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>{emptyMessage}</div>
              </div>
            )}

            {!loading && !isEmpty && (
              <svg
                ref={(node) => {
                  if (typeof ref === "function") {
                    ref(node);
                  } else if (ref) {
                    ref.current = node;
                  }
                  if (node) {
                    (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = node;
                  }
                }}
                width={actualWidth}
                height={actualHeight}
                style={{ userSelect: "none" }}
                role="img"
                aria-label={`Scatter plot with ${series.length} series`}
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
                <Points series={series} animate={animate} />
                {tooltipContent && tooltipPosition && (
                  <ChartTooltip
                    x={tooltipPosition.x}
                    y={tooltipPosition.y}
                    content={tooltipContent}
                  />
                )}
                {showLegend && (
                  <ChartLegend
                    items={legendItems}
                    x={actualWidth - margin.right + 10}
                    y={margin.top}
                  />
                )}
              </svg>
            )}
          </div>
        </Context.Provider>
      );
    }
  )
);

ScatterPlot.displayName = "ScatterPlot";
