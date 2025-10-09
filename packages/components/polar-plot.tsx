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

export interface PolarPoint {
  /** Angle in radians (0 = right, π/2 = top, π = left, 3π/2 = bottom) */
  theta: number;
  /** Radial distance from origin */
  r: number;
  /** Optional label */
  label?: string;
}

export interface PolarSeries {
  name: string;
  data: PolarPoint[];
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  /** Connect first and last point (true for radar charts) */
  closed?: boolean;
  /** Show markers at data points */
  showMarkers?: boolean;
}

export interface PolarAxis {
  /** Radial axis label */
  label?: string;
  /** Radial domain [min, max] or "auto" */
  domain?: [number, number] | "auto";
  /** Number of concentric circles to draw */
  rings?: number;
  /** Angle labels in degrees (e.g., ["0°", "90°", "180°", "270°"]) */
  angleLabels?: string[];
  /** Number of angle divisions (spokes) */
  angleCount?: number;
}

export interface PolarPlotProps {
  series: PolarSeries[];
  axis?: PolarAxis;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  /** Plot type */
  variant?: "polar" | "radar" | "rose";
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
  centerX: number;
  centerY: number;
  maxRadius: number;
  rScale: (r: number) => number;
  hoveredPoint: { seriesIdx: number; pointIdx: number } | null;
  setHoveredPoint: (point: { seriesIdx: number; pointIdx: number } | null) => void;
  hiddenSeries: Set<number>;
  toggleSeries: (idx: number) => void;
}

const Context = createContext<ChartContext | null>(null);

function useChart() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Must be used within PolarPlot");
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

function getRDomain(points: PolarPoint[]): [number, number] {
  if (points.length === 0) return [0, 1];
  const values = points.map(p => p.r);
  const max = Math.max(...values);
  return [0, max * 1.1]; // 10% padding on top
}

function createRScale(domain: [number, number], maxRadius: number) {
  const [d0, d1] = domain;
  const slope = maxRadius / (d1 - d0);
  return (value: number) => slope * (value - d0);
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(1);
  return value.toFixed(2);
}

// Convert polar to Cartesian coordinates
function polarToCartesian(theta: number, r: number, centerX: number, centerY: number, rScale: (r: number) => number): { x: number; y: number } {
  const scaledR = rScale(r);
  return {
    x: centerX + scaledR * Math.cos(theta),
    y: centerY - scaledR * Math.sin(theta), // Negative because SVG y increases downward
  };
}

// ============================================================================
// Components
// ============================================================================

interface PolarGridProps {
  rings: number;
  angleCount: number;
  angleLabels?: string[];
  animate: boolean;
}

const PolarGrid = memo(({ rings, angleCount, angleLabels, animate }: PolarGridProps) => {
  const { centerX, centerY, maxRadius, rScale } = useChart();

  // Concentric circles (rings)
  const ringRadii = Array.from({ length: rings }, (_, i) => ((i + 1) / rings) * maxRadius);

  // Radial lines (spokes)
  const angles = Array.from({ length: angleCount }, (_, i) => (i / angleCount) * 2 * Math.PI);

  return (
    <g className="polar-grid">
      {/* Concentric circles */}
      {ringRadii.map((radius, i) => (
        <circle
          key={`ring-${i}`}
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          opacity={animate ? 0 : 0.2}
          style={animate ? { animation: `fadeIn 0.3s ease ${i * 0.05}s forwards` } : undefined}
        />
      ))}

      {/* Radial lines (spokes) */}
      {angles.map((angle, i) => (
        <line
          key={`spoke-${i}`}
          x1={centerX}
          y1={centerY}
          x2={centerX + maxRadius * Math.cos(angle)}
          y2={centerY - maxRadius * Math.sin(angle)}
          stroke="currentColor"
          strokeWidth={1}
          opacity={animate ? 0 : 0.15}
          style={animate ? { animation: `fadeIn 0.3s ease ${i * 0.03}s forwards` } : undefined}
        />
      ))}

      {/* Angle labels */}
      {angleLabels && angles.map((angle, i) => {
        if (i >= angleLabels.length) return null;
        const labelRadius = maxRadius + 20;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY - labelRadius * Math.sin(angle);

        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="currentColor"
            opacity={animate ? 0 : 0.7}
            style={animate ? { animation: `fadeIn 0.4s ease ${0.3 + i * 0.05}s forwards` } : undefined}
          >
            {angleLabels[i]}
          </text>
        );
      })}

      <style jsx>{`
        @keyframes fadeIn {
          to { opacity: 0.2; }
        }
      `}</style>
    </g>
  );
});

PolarGrid.displayName = "PolarGrid";

interface PolarLinesProps {
  series: PolarSeries[];
  animate: boolean;
  variant: "polar" | "radar" | "rose";
}

const PolarLines = memo(({ series, animate, variant }: PolarLinesProps) => {
  const { centerX, centerY, rScale, hiddenSeries, setHoveredPoint } = useChart();

  return (
    <g className="polar-lines">
      {series.map((s, seriesIdx) => {
        if (s.data.length === 0 || hiddenSeries.has(seriesIdx)) return null;

        const color = s.color || "#64748b";
        const strokeWidth = s.strokeWidth || 2.5;
        const filled = s.filled ?? true;
        const closed = s.closed ?? variant === "radar";
        const showMarkers = s.showMarkers ?? true;

        // Convert polar points to Cartesian
        const cartesianPoints = s.data.map(p =>
          polarToCartesian(p.theta, p.r, centerX, centerY, rScale)
        );

        // Build path
        let pathData = "";
        if (variant === "rose") {
          // Rose diagram: draw wedges
          s.data.forEach((point, i) => {
            const nextPoint = s.data[(i + 1) % s.data.length];
            const angle1 = point.theta;
            const angle2 = nextPoint.theta;
            const r1 = rScale(point.r);

            const x1 = centerX + r1 * Math.cos(angle1);
            const y1 = centerY - r1 * Math.sin(angle1);

            if (i === 0) {
              pathData = `M ${centerX} ${centerY} L ${x1} ${y1}`;
            } else {
              pathData += ` L ${x1} ${y1}`;
            }
          });
          if (closed) pathData += " Z";
        } else {
          // Regular polar/radar: connect points
          cartesianPoints.forEach((point, i) => {
            if (i === 0) {
              pathData = `M ${point.x} ${point.y}`;
            } else {
              pathData += ` L ${point.x} ${point.y}`;
            }
          });
          if (closed) pathData += " Z";
        }

        return (
          <g key={seriesIdx}>
            {/* Filled area */}
            {filled && (
              <>
                <defs>
                  <linearGradient id={`polar-gradient-${seriesIdx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <path
                  d={pathData}
                  fill={`url(#polar-gradient-${seriesIdx})`}
                  opacity={animate ? 0 : 1}
                  style={animate ? { animation: `fadeIn 0.5s ease ${seriesIdx * 0.1}s forwards` } : undefined}
                />
              </>
            )}

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={animate ? 0 : 1}
              style={
                animate
                  ? {
                      animation: `fadeIn 0.5s ease ${seriesIdx * 0.1}s forwards`,
                      filter: "drop-shadow(0 0 2px currentColor)",
                    }
                  : { filter: "drop-shadow(0 0 2px currentColor)" }
              }
            />

            {/* Markers */}
            {showMarkers && cartesianPoints.map((point, pointIdx) => (
              <circle
                key={pointIdx}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={color}
                stroke="white"
                strokeWidth={2}
                opacity={animate ? 0 : 1}
                style={animate ? { animation: `fadeIn 0.5s ease ${seriesIdx * 0.1 + pointIdx * 0.02}s forwards` } : undefined}
                onMouseEnter={() => setHoveredPoint({ seriesIdx, pointIdx })}
                onMouseLeave={() => setHoveredPoint(null)}
                cursor="pointer"
              />
            ))}
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

PolarLines.displayName = "PolarLines";

// ============================================================================
// Main Component
// ============================================================================

export const PolarPlot = memo(
  forwardRef<SVGSVGElement, PolarPlotProps>(
    (
      {
        series,
        axis = {},
        width = 600,
        height = 600,
        showGrid = true,
        showLegend = true,
        animate = true,
        variant = "polar",
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

      // Calculate center and radius
      const centerX = actualWidth / 2;
      const centerY = actualHeight / 2;
      const maxRadius = Math.min(actualWidth, actualHeight) / 2 - 60; // Leave space for labels

      // Calculate radial domain
      const allPoints = series.flatMap((s) => s.data);
      const rDomain = axis.domain === "auto" || !axis.domain ? getRDomain(allPoints) : axis.domain;

      const rScale = useMemo(
        () => createRScale(rDomain, maxRadius),
        [rDomain, maxRadius]
      );

      const contextValue: ChartContext = useMemo(
        () => ({
          width: actualWidth,
          height: actualHeight,
          centerX,
          centerY,
          maxRadius,
          rScale,
          hoveredPoint,
          setHoveredPoint,
          hiddenSeries,
          toggleSeries,
        }),
        [actualWidth, actualHeight, centerX, centerY, maxRadius, rScale, hoveredPoint, hiddenSeries, toggleSeries]
      );

      const legendItems: LegendItem[] = useMemo(
        () =>
          series.map((s, idx) => ({
            name: s.name,
            color: s.color || "#64748b",
            symbol: "line" as const,
            strokeWidth: s.strokeWidth || 2,
            filled: s.filled,
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

        const thetaDeg = (point.theta * 180 / Math.PI).toFixed(1);
        const rLabel = formatValue(point.r);

        let content = `${s.name}\nθ: ${thetaDeg}°\nr: ${rLabel}`;
        if (point.label) {
          content += `\n${point.label}`;
        }

        return content;
      }, [hoveredPoint, series]);

      const tooltipPosition = useMemo(() => {
        if (!hoveredPoint) return null;
        const s = series[hoveredPoint.seriesIdx];
        if (!s) return null;
        const point = s.data[hoveredPoint.pointIdx];
        const { x, y } = polarToCartesian(point.theta, point.r, centerX, centerY, rScale);

        return { x, y };
      }, [hoveredPoint, series, centerX, centerY, rScale]);

      const isEmpty = series.length === 0 || series.every(s => s.data.length === 0);

      const rings = axis.rings ?? 5;
      const angleCount = axis.angleCount ?? (axis.angleLabels?.length || 8);

      return (
        <Context.Provider value={contextValue}>
          <div
            ref={containerRef}
            style={{
              position: "relative",
              width: responsive ? "100%" : `${width}px`,
              height: responsive ? "100%" : `${height}px`,
              display: responsive ? "block" : "inline-block",
              minHeight: responsive ? "300px" : undefined,
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
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="2" x2="12" y2="22" strokeWidth="2" />
                  <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
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
                aria-label={`Polar plot with ${series.length} series`}
              >
                {showGrid && (
                  <PolarGrid
                    rings={rings}
                    angleCount={angleCount}
                    angleLabels={axis.angleLabels}
                    animate={animate}
                  />
                )}
                <PolarLines series={series} animate={animate} variant={variant} />
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
                    x={actualWidth - 160}
                    y={20}
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

PolarPlot.displayName = "PolarPlot";
