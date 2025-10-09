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

export interface HistogramBin {
  /** Bin range start */
  x0: number;
  /** Bin range end */
  x1: number;
  /** Bin count/frequency */
  count: number;
  /** Bin center (for display) */
  center: number;
}

export interface HistogramSeries {
  name: string;
  /** Raw data values to bin */
  data: number[];
  color?: string;
  opacity?: number;
  /** Number of bins (auto-calculated if not provided) */
  bins?: number;
  /** Bin edges (overrides bins count) */
  binEdges?: number[];
}

export interface Axis {
  label?: string;
  domain?: [number, number] | "auto";
  formatter?: (value: number) => string;
}

export interface HistogramProps {
  series: HistogramSeries[];
  xAxis?: Axis;
  yAxis?: Axis;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  /** Histogram layout */
  layout?: "stacked" | "overlapping" | "grouped";
  /** Show distribution curve (KDE) */
  showDistribution?: boolean;
  /** Normalize to probability density */
  normalized?: boolean;
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
  hoveredBin: { seriesIdx: number; binIdx: number } | null;
  setHoveredBin: (bin: { seriesIdx: number; binIdx: number } | null) => void;
  hiddenSeries: Set<number>;
  toggleSeries: (idx: number) => void;
}

const Context = createContext<ChartContext | null>(null);

function useChart() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Must be used within Histogram");
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

function createScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const slope = (r1 - r0) / (d1 - d0);
  return (value: number) => r0 + slope * (value - d0);
}

// Sturges' formula for optimal bin count
function calculateBinCount(data: number[]): number {
  return Math.ceil(Math.log2(data.length) + 1);
}

// Create histogram bins from raw data
function createBins(data: number[], binCount?: number, binEdges?: number[]): HistogramBin[] {
  if (data.length === 0) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);

  let edges: number[];
  if (binEdges) {
    edges = binEdges;
  } else {
    const numBins = binCount || calculateBinCount(data);
    const binWidth = (max - min) / numBins;
    edges = Array.from({ length: numBins + 1 }, (_, i) => min + i * binWidth);
  }

  const bins: HistogramBin[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    bins.push({
      x0: edges[i],
      x1: edges[i + 1],
      count: 0,
      center: (edges[i] + edges[i + 1]) / 2,
    });
  }

  // Count data points in each bin
  data.forEach(value => {
    for (let i = 0; i < bins.length; i++) {
      if (value >= bins[i].x0 && (value < bins[i].x1 || (i === bins.length - 1 && value === bins[i].x1))) {
        bins[i].count++;
        break;
      }
    }
  });

  return bins;
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

interface BarsProps {
  binnedSeries: { series: HistogramSeries; bins: HistogramBin[] }[];
  layout: "stacked" | "overlapping" | "grouped";
  animate: boolean;
}

const Bars = memo(({ binnedSeries, layout, animate }: BarsProps) => {
  const { xScale, yScale, hiddenSeries, setHoveredBin } = useChart();

  const baseline = yScale(0);

  return (
    <g className="bars">
      {binnedSeries.map(({ series: s, bins }, seriesIdx) => {
        if (bins.length === 0 || hiddenSeries.has(seriesIdx)) return null;

        const color = s.color || "#64748b";
        const opacity = s.opacity ?? 0.7;

        return (
          <g key={seriesIdx}>
            {bins.map((bin, binIdx) => {
              const x0 = xScale(bin.x0);
              const x1 = xScale(bin.x1);
              const barWidth = x1 - x0;
              const barHeight = baseline - yScale(bin.count);

              // Adjust for layout
              let barX = x0;
              let adjustedWidth = barWidth;

              if (layout === "grouped") {
                const groupWidth = barWidth / binnedSeries.filter((_, i) => !hiddenSeries.has(i)).length;
                const visibleIdx = binnedSeries
                  .slice(0, seriesIdx)
                  .filter((_, i) => !hiddenSeries.has(i)).length;
                barX = x0 + visibleIdx * groupWidth;
                adjustedWidth = groupWidth * 0.9; // 10% gap
              }

              return (
                <rect
                  key={binIdx}
                  x={barX}
                  y={yScale(bin.count)}
                  width={adjustedWidth}
                  height={barHeight}
                  fill={color}
                  opacity={opacity}
                  stroke="white"
                  strokeWidth={layout === "overlapping" ? 1 : 0}
                  style={animate ? { animation: `growUp 0.5s ease ${seriesIdx * 0.1 + binIdx * 0.02}s forwards` } : undefined}
                  onMouseEnter={() => setHoveredBin({ seriesIdx, binIdx })}
                  onMouseLeave={() => setHoveredBin(null)}
                  cursor="pointer"
                />
              );
            })}
          </g>
        );
      })}
      <style jsx>{`
        @keyframes growUp {
          from {
            transform: scaleY(0);
            transform-origin: bottom;
          }
          to {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }
      `}</style>
    </g>
  );
});

Bars.displayName = "Bars";

// ============================================================================
// Main Component
// ============================================================================

export const Histogram = memo(
  forwardRef<SVGSVGElement, HistogramProps>(
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
        layout = "overlapping",
        normalized = false,
        responsive = false,
        loading = false,
        emptyMessage = "No data available",
        toggleableSeries = false,
        className = "",
      },
      ref
    ) => {
      const [hoveredBin, setHoveredBin] = useState<{ seriesIdx: number; binIdx: number } | null>(null);
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

      // Create bins for each series
      const binnedSeries = useMemo(
        () =>
          series.map(s => ({
            series: s,
            bins: createBins(s.data, s.bins, s.binEdges),
          })),
        [series]
      );

      // Calculate domains
      const allBins = binnedSeries.flatMap(({ bins }) => bins);
      const xDomain: [number, number] = useMemo(() => {
        if (xAxis.domain && xAxis.domain !== "auto") return xAxis.domain;
        if (allBins.length === 0) return [0, 1];
        return [Math.min(...allBins.map(b => b.x0)), Math.max(...allBins.map(b => b.x1))];
      }, [allBins, xAxis.domain]);

      const yDomain: [number, number] = useMemo(() => {
        if (yAxis.domain && yAxis.domain !== "auto") return yAxis.domain;
        if (allBins.length === 0) return [0, 1];
        const maxCount = Math.max(...allBins.map(b => b.count));
        return [0, maxCount * 1.1]; // 10% padding
      }, [allBins, yAxis.domain]);

      const margin = useMemo(
        () => ({
          top: actualHeight < 300 ? 20 : 30,
          right: showLegend ? (actualWidth < 600 ? 120 : 180) : (actualWidth < 400 ? 20 : 30),
          bottom: actualHeight < 300 ? 40 : 60,
          left: actualWidth < 400 ? 50 : 70,
        }),
        [showLegend, actualWidth, actualHeight]
      );

      const xScale = useMemo(
        () => createScale(xDomain, [margin.left, actualWidth - margin.right]),
        [xDomain, margin.left, margin.right, actualWidth]
      );

      const yScale = useMemo(
        () => createScale(yDomain, [actualHeight - margin.bottom, margin.top]),
        [yDomain, actualHeight, margin.bottom, margin.top]
      );

      const xTicks = useMemo(() => getTicks(xDomain, 8), [xDomain]);
      const yTicks = useMemo(() => getTicks(yDomain, 6), [yDomain]);

      const contextValue: ChartContext = useMemo(
        () => ({
          width: actualWidth,
          height: actualHeight,
          xScale,
          yScale,
          hoveredBin,
          setHoveredBin,
          hiddenSeries,
          toggleSeries,
        }),
        [actualWidth, actualHeight, xScale, yScale, hoveredBin, hiddenSeries, toggleSeries]
      );

      const legendItems: LegendItem[] = useMemo(
        () =>
          series.map((s, idx) => ({
            name: s.name,
            color: s.color || "#64748b",
            symbol: "square" as const,
            active: !hiddenSeries.has(idx),
            onClick: toggleableSeries ? () => toggleSeries(idx) : undefined,
          })),
        [series, hiddenSeries, toggleableSeries, toggleSeries]
      );

      const tooltipContent = useMemo(() => {
        if (!hoveredBin) return null;
        const { series: s, bins } = binnedSeries[hoveredBin.seriesIdx];
        if (!s || !bins) return null;
        const bin = bins[hoveredBin.binIdx];

        const rangeLabel = `${formatValue(bin.x0)} - ${formatValue(bin.x1)}`;
        const countLabel = normalized ? `${(bin.count / s.data.length).toFixed(3)}` : `${bin.count}`;

        return `${s.name}\nRange: ${rangeLabel}\n${normalized ? "Density" : "Count"}: ${countLabel}`;
      }, [hoveredBin, binnedSeries, normalized]);

      const tooltipPosition = useMemo(() => {
        if (!hoveredBin) return null;
        const { bins } = binnedSeries[hoveredBin.seriesIdx];
        const bin = bins[hoveredBin.binIdx];
        const x = xScale(bin.center);
        const y = yScale(bin.count);

        return { x, y: y - 10 };
      }, [hoveredBin, binnedSeries, xScale, yScale]);

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
                  <div style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>Loading histogram...</div>
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
                  <rect x="3" y="10" width="4" height="11" strokeWidth="2" />
                  <rect x="10" y="6" width="4" height="15" strokeWidth="2" />
                  <rect x="17" y="13" width="4" height="8" strokeWidth="2" />
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
                aria-label={`Histogram with ${series.length} series`}
              >
                {showGrid && <Grid xTicks={xTicks} yTicks={yTicks} animate={animate} margin={margin} />}
                <Axes
                  xTicks={xTicks}
                  yTicks={yTicks}
                  xLabel={xAxis.label}
                  yLabel={yAxis.label || (normalized ? "Density" : "Count")}
                  xAxis={xAxis}
                  yAxis={yAxis}
                  animate={animate}
                  margin={margin}
                />
                <Bars binnedSeries={binnedSeries} layout={layout} animate={animate} />
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

Histogram.displayName = "Histogram";
