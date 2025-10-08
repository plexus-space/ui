"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  forwardRef,
  memo,
} from "react";
import { ChartTooltip } from "./chart-tooltip";
import { ChartLegend, type LegendItem } from "./chart-legend";

// ============================================================================
// Types
// ============================================================================

/**
 * A single data point for the histogram
 */
export type HistogramDataPoint = number;

/**
 * A bin in the histogram
 */
export interface HistogramBin {
  /** Lower edge of bin */
  x0: number;
  /** Upper edge of bin */
  x1: number;
  /** Number of values in bin */
  count: number;
  /** Density (count / (binWidth * totalCount)) */
  density: number;
}

/**
 * Binning algorithm type
 */
export type BinningMethod =
  | "auto"
  | "sturges"
  | "scott"
  | "freedman-diaconis"
  | "sqrt"
  | number;

/**
 * Normal distribution overlay configuration
 */
export interface NormalOverlay {
  /** Mean of the distribution */
  mean: number;
  /** Standard deviation */
  stdDev: number;
  /** Color of the overlay curve */
  color?: string;
}

/**
 * Axis configuration
 */
export interface Axis {
  /** Axis label */
  label?: string;
  /** Min/max values, or "auto" */
  domain?: [number, number] | "auto";
  /** Custom formatter function */
  formatter?: (value: number) => string;
}

/**
 * Props for the Histogram component
 */
export interface HistogramProps {
  /** Array of data values */
  data: HistogramDataPoint[];
  /** Number of bins or binning algorithm */
  bins?: BinningMethod;
  /** Show density instead of counts */
  showDensity?: boolean;
  /** Show normal distribution overlay */
  showNormal?: NormalOverlay;
  /** Show cumulative distribution */
  cumulative?: boolean;
  /** Normalize to sum to 1 */
  normalize?: boolean;
  /** X-axis configuration */
  xAxis?: Axis;
  /** Y-axis configuration */
  yAxis?: Axis;
  /** Bar color */
  color?: string;
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
  hoveredBin: number | null;
  setHoveredBin: (idx: number | null) => void;
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

function getTicks(domain: [number, number], count: number = 5): number[] {
  const [min, max] = domain;
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

/**
 * Calculate optimal number of bins using various algorithms
 * @see Sturges, H. A. (1926). "The choice of a class interval"
 * @see Scott, D. W. (1979). "On optimal and data-based histograms"
 * @see Freedman, D.; Diaconis, P. (1981). "On the histogram as a density estimator"
 */
function calculateBinCount(data: number[], method: BinningMethod): number {
  const n = data.length;
  if (typeof method === "number") return method;

  switch (method) {
    case "sturges":
      // Sturges' formula: k = ceil(log2(n) + 1)
      return Math.ceil(Math.log2(n) + 1);

    case "scott": {
      // Scott's rule: binWidth = 3.5 * σ / n^(1/3)
      const mean = data.reduce((a, b) => a + b, 0) / n;
      const variance =
        data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
      const stdDev = Math.sqrt(variance);
      const range = Math.max(...data) - Math.min(...data);
      const binWidth = (3.5 * stdDev) / Math.pow(n, 1 / 3);
      return Math.max(1, Math.ceil(range / binWidth));
    }

    case "freedman-diaconis": {
      // Freedman-Diaconis rule: binWidth = 2 * IQR / n^(1/3)
      const sorted = [...data].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(n * 0.25)];
      const q3 = sorted[Math.floor(n * 0.75)];
      const iqr = q3 - q1;
      const range = Math.max(...data) - Math.min(...data);
      const binWidth = (2 * iqr) / Math.pow(n, 1 / 3);
      return Math.max(1, Math.ceil(range / binWidth));
    }

    case "sqrt":
      // Square root rule: k = sqrt(n)
      return Math.ceil(Math.sqrt(n));

    case "auto":
    default:
      // Use Freedman-Diaconis for larger datasets, Sturges for smaller
      return n > 100
        ? calculateBinCount(data, "freedman-diaconis")
        : calculateBinCount(data, "sturges");
  }
}

/**
 * Create histogram bins from data
 */
function createBins(
  data: number[],
  binCount: number,
  cumulative: boolean = false,
  normalize: boolean = false
): HistogramBin[] {
  if (data.length === 0) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / binCount;

  // Initialize bins
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    x0: min + i * binWidth,
    x1: min + (i + 1) * binWidth,
    count: 0,
    density: 0,
  }));

  // Fill bins
  data.forEach((value) => {
    let binIndex = Math.floor((value - min) / binWidth);
    // Handle edge case where value === max
    if (binIndex >= binCount) binIndex = binCount - 1;
    bins[binIndex].count++;
  });

  // Calculate density
  const totalCount = data.length;
  bins.forEach((bin) => {
    bin.density = bin.count / (binWidth * totalCount);
  });

  // Apply cumulative if needed
  if (cumulative) {
    let cumulativeCount = 0;
    bins.forEach((bin) => {
      cumulativeCount += bin.count;
      bin.count = cumulativeCount;
      bin.density = cumulativeCount / totalCount;
    });
  }

  // Apply normalization if needed
  if (normalize && !cumulative) {
    bins.forEach((bin) => {
      bin.count = bin.count / totalCount;
    });
  }

  return bins;
}

/**
 * Calculate normal distribution PDF
 */
function normalPDF(x: number, mean: number, stdDev: number): number {
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return coefficient * Math.exp(exponent);
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
      {/* Horizontal lines only */}
      {yTicks.map((tick, i) => (
        <line
          key={`hgrid-${i}`}
          x1={margin.left}
          y1={yScale(tick)}
          x2={width - margin.right}
          y2={yScale(tick)}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.06}
        />
      ))}
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

const Axes = memo(
  ({ xTicks, yTicks, xLabel, yLabel, xAxis, yAxis, animate }: AxesProps) => {
    const { width, height, xScale, yScale } = useChart();
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    const formatTick = (value: number, axis?: Axis): string => {
      if (axis?.formatter) {
        return axis.formatter(value);
      }
      return formatValue(value);
    };

    return (
      <g className="axes">
        {/* X-axis */}
        {xTicks.map((tick, i) => (
          <text
            key={`xtick-${i}`}
            x={xScale(tick)}
            y={height - margin.bottom + 16}
            textAnchor="middle"
            fontSize={11}
            fontWeight={500}
            fill="currentColor"
            opacity={0.5}
            style={{
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.01em",
            }}
          >
            {formatTick(tick, xAxis)}
          </text>
        ))}
        {xLabel && (
          <text
            x={(margin.left + width - margin.right) / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize={12}
            fontWeight={600}
            fill="currentColor"
            opacity={0.7}
            style={{ letterSpacing: "-0.02em" }}
          >
            {xLabel}
          </text>
        )}

        {/* Y-axis */}
        {yTicks.map((tick, i) => (
          <text
            key={`ytick-${i}`}
            x={margin.left - 12}
            y={yScale(tick) + 3}
            textAnchor="end"
            fontSize={11}
            fontWeight={500}
            fill="currentColor"
            opacity={0.5}
            style={{
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.01em",
            }}
          >
            {formatTick(tick, yAxis)}
          </text>
        ))}
        {yLabel && (
          <text
            x={margin.left - 45}
            y={(margin.top + height - margin.bottom) / 2}
            textAnchor="middle"
            fontSize={12}
            fontWeight={600}
            fill="currentColor"
            transform={`rotate(-90 ${margin.left - 45} ${
              (margin.top + height - margin.bottom) / 2
            })`}
            opacity={0.7}
            style={{ letterSpacing: "-0.02em" }}
          >
            {yLabel}
          </text>
        )}
      </g>
    );
  }
);

Axes.displayName = "Axes";

interface BarsProps {
  bins: HistogramBin[];
  color: string;
  animate: boolean;
  showDensity: boolean;
}

const Bars = memo(({ bins, color, animate, showDensity }: BarsProps) => {
  const { xScale, yScale, setHoveredBin, hoveredBin } = useChart();
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };

  return (
    <g className="bars">
      {bins.map((bin, i) => {
        const x = xScale(bin.x0);
        const x2 = xScale(bin.x1);
        const barWidth = x2 - x;
        const value = showDensity ? bin.density : bin.count;
        const barHeight = yScale(0) - yScale(value);
        const isHovered = hoveredBin === i;

        return (
          <g key={i}>
            {/* Bar with rounded top */}
            <rect
              x={x}
              y={yScale(value)}
              width={Math.max(0, barWidth - 2)}
              height={Math.max(0, barHeight)}
              fill={color}
              opacity={isHovered ? 0.9 : animate ? 0 : 0.8}
              rx={2}
              style={{
                animation: animate
                  ? `fadeInBar 0.4s ease ${i * 0.008}s forwards`
                  : undefined,
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={() => setHoveredBin(i)}
              onMouseLeave={() => setHoveredBin(null)}
            />
          </g>
        );
      })}
      <style jsx>{`
        @keyframes fadeInBar {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.8;
          }
        }
      `}</style>
    </g>
  );
});

Bars.displayName = "Bars";

interface NormalCurveProps {
  mean: number;
  stdDev: number;
  bins: HistogramBin[];
  color: string;
  showDensity: boolean;
  animate: boolean;
}

const NormalCurve = memo(
  ({ mean, stdDev, bins, color, showDensity, animate }: NormalCurveProps) => {
    const { xScale, yScale } = useChart();

    const pathData = useMemo(() => {
      if (bins.length === 0) return "";

      const xMin = bins[0].x0;
      const xMax = bins[bins.length - 1].x1;
      const points = 200;
      const step = (xMax - xMin) / points;

      // Calculate scaling factor to match histogram height
      const totalArea = bins.reduce((sum, bin) => sum + bin.count, 0);
      const binWidth = bins[0].x1 - bins[0].x0;
      const scaleFactor = showDensity ? 1 : totalArea * binWidth;

      const coords = Array.from({ length: points }, (_, i) => {
        const x = xMin + i * step;
        const y = normalPDF(x, mean, stdDev) * scaleFactor;
        return `${xScale(x)},${yScale(y)}`;
      });

      return "M " + coords.join(" L ");
    }, [bins, mean, stdDev, showDensity, xScale, yScale]);

    return (
      <g className="normal-curve">
        {/* Subtle filled area under curve */}
        <path
          d={
            pathData +
            ` L ${xScale(bins[bins.length - 1].x1)},${yScale(0)} L ${xScale(
              bins[0].x0
            )},${yScale(0)} Z`
          }
          fill={color}
          opacity={0.1}
        />
        {/* Smooth curve line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />
      </g>
    );
  }
);

NormalCurve.displayName = "NormalCurve";

// ============================================================================
// Main Component
// ============================================================================

/**
 * A histogram chart for statistical distribution visualization
 *
 * Implements industry-standard binning algorithms including Sturges, Scott,
 * and Freedman-Diaconis methods. Supports density estimation, cumulative
 * distributions, and normal distribution overlays.
 *
 * @example
 * ```tsx
 * <Histogram
 *   data={measurements}
 *   bins="auto"
 *   showDensity
 *   showNormal={{ mean: 50, stdDev: 10 }}
 *   xAxis={{ label: "Value" }}
 *   yAxis={{ label: "Frequency" }}
 * />
 * ```
 *
 * @see Sturges, H. A. (1926). "The choice of a class interval"
 * @see Scott, D. W. (1979). "On optimal and data-based histograms"
 * @see Freedman & Diaconis (1981). "On the histogram as a density estimator"
 */
export const Histogram = memo(
  forwardRef<SVGSVGElement, HistogramProps>(
    (
      {
        data,
        bins: binsMethod = "auto",
        showDensity = false,
        showNormal,
        cumulative = false,
        normalize = false,
        xAxis = {},
        yAxis = {},
        color = "#3b82f6",
        width = 800,
        height = 400,
        showGrid = true,
        showLegend = false,
        animate = true,
        className = "",
      },
      ref
    ) => {
      const [hoveredBin, setHoveredBin] = useState<number | null>(null);

      const margin = useMemo(
        () => ({ top: 20, right: 20, bottom: 50, left: 60 }),
        []
      );

      // Calculate bins
      const bins = useMemo(() => {
        const binCount = calculateBinCount(data, binsMethod);
        return createBins(data, binCount, cumulative, normalize);
      }, [data, binsMethod, cumulative, normalize]);

      // Calculate domains
      const xDomain: [number, number] = useMemo(() => {
        if (xAxis.domain && xAxis.domain !== "auto") return xAxis.domain;
        if (bins.length === 0) return [0, 1];
        return [bins[0].x0, bins[bins.length - 1].x1];
      }, [bins, xAxis.domain]);

      const yDomain: [number, number] = useMemo(() => {
        if (yAxis.domain && yAxis.domain !== "auto") return yAxis.domain;
        if (bins.length === 0) return [0, 1];

        const values = bins.map((b) => (showDensity ? b.density : b.count));
        const maxValue = Math.max(...values);

        // If showing normal curve, ensure it fits
        if (showNormal && !cumulative) {
          const binWidth = bins[0].x1 - bins[0].x0;
          const totalArea = bins.reduce((sum, bin) => sum + bin.count, 0);
          const scaleFactor = showDensity ? 1 : totalArea * binWidth;
          const peakNormal =
            normalPDF(showNormal.mean, showNormal.mean, showNormal.stdDev) *
            scaleFactor;
          return [0, Math.max(maxValue, peakNormal) * 1.1];
        }

        return [0, maxValue * 1.1];
      }, [bins, yAxis.domain, showDensity, showNormal, cumulative]);

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
        () => ({ width, height, xScale, yScale, hoveredBin, setHoveredBin }),
        [width, height, xScale, yScale, hoveredBin]
      );

      // Legend items
      const legendItems: LegendItem[] = useMemo(() => {
        const items: LegendItem[] = [
          {
            name: cumulative
              ? "Cumulative"
              : showDensity
              ? "Density"
              : "Frequency",
            color: color,
            symbol: "square" as const,
          },
        ];
        if (showNormal) {
          items.push({
            name: "Normal",
            color: showNormal.color || "#ef4444",
            symbol: "line" as const,
            strokeWidth: 2.5,
          });
        }
        return items;
      }, [color, cumulative, showDensity, showNormal]);

      // Tooltip content
      const tooltipContent = useMemo(() => {
        if (hoveredBin === null || !bins[hoveredBin]) return null;
        const bin = bins[hoveredBin];
        const value = showDensity
          ? bin.density.toFixed(4)
          : bin.count.toString();
        return `[${bin.x0.toFixed(2)}, ${bin.x1.toFixed(2)}): ${value}`;
      }, [hoveredBin, bins, showDensity]);

      const tooltipPosition = useMemo(() => {
        if (hoveredBin === null || !bins[hoveredBin]) return null;
        const bin = bins[hoveredBin];
        const x = xScale((bin.x0 + bin.x1) / 2);
        const value = showDensity ? bin.density : bin.count;
        const y = yScale(value);
        return { x, y };
      }, [hoveredBin, bins, xScale, yScale, showDensity]);

      return (
        <Context.Provider value={contextValue}>
          <svg
            ref={ref}
            width={width}
            height={height}
            className={className}
            style={{ userSelect: "none" }}
          >
            {showGrid && (
              <Grid xTicks={xTicks} yTicks={yTicks} animate={animate} />
            )}
            <Axes
              xTicks={xTicks}
              yTicks={yTicks}
              xLabel={xAxis.label}
              yLabel={yAxis.label}
              xAxis={xAxis}
              yAxis={yAxis}
              animate={animate}
            />
            <Bars
              bins={bins}
              color={color}
              animate={animate}
              showDensity={showDensity}
            />
            {showNormal && !cumulative && (
              <NormalCurve
                mean={showNormal.mean}
                stdDev={showNormal.stdDev}
                bins={bins}
                color={showNormal.color || "#ef4444"}
                showDensity={showDensity}
                animate={animate}
              />
            )}
            {tooltipContent && tooltipPosition && (
              <ChartTooltip
                x={tooltipPosition.x}
                y={tooltipPosition.y}
                content={tooltipContent}
                showCrosshair
                crosshairBounds={[
                  margin.left,
                  margin.top,
                  width - margin.right,
                  height - margin.bottom,
                ]}
              />
            )}
            {showLegend && (
              <ChartLegend
                items={legendItems}
                x={width - 160}
                y={margin.top + 10}
              />
            )}
          </svg>
        </Context.Provider>
      );
    }
  )
);

Histogram.displayName = "Histogram";
