"use client";

import * as React from "react";
import { cn, formatValue } from "./lib";

// ============================================================================
// Types
// ============================================================================

/**
 * Data point in polar coordinates
 */
export interface PolarPoint {
  /**
   * Angle in radians (0 = right, π/2 = top, π = left, 3π/2 = bottom)
   * @range 0-2π
   * @example 0, Math.PI/2, Math.PI, 3*Math.PI/2
   */
  theta: number;
  /**
   * Radial distance from origin
   * @range 0-Infinity
   * @example 0, 50, 100
   */
  r: number;
  /**
   * Optional text label for the data point
   * @example "North", "Peak", "Maximum"
   */
  label?: string;
}

/**
 * Series configuration for polar plot data
 */
export interface PolarSeries {
  /** Display name for the series (shown in legend and tooltips) */
  name: string;
  /** Array of data points in polar coordinates */
  data: PolarPoint[];
  /**
   * Line and fill color in any CSS color format
   * @default "#64748b"
   * @example "#06b6d4", "rgb(6, 182, 212)", "hsl(187, 95%, 43%)"
   */
  color?: string;
  /**
   * Line stroke width in pixels
   * @default 2.5
   * @range 1-10
   */
  strokeWidth?: number;
  /**
   * Fill area enclosed by the line with gradient
   * @default true
   */
  filled?: boolean;
  /**
   * Connect first and last point to close the shape (typical for radar charts)
   * @default true for radar variant, false otherwise
   */
  closed?: boolean;
  /**
   * Display circular markers at data points
   * @default true
   */
  showMarkers?: boolean;
}

/**
 * Polar axis configuration
 */
export interface PolarAxis {
  /**
   * Radial axis label text
   * @example "Magnitude", "Distance (km)", "Intensity"
   */
  label?: string;
  /**
   * Radial domain range [min, max] or automatic calculation
   * @default "auto" (calculated from data with 10% padding)
   * @example [0, 100], [0, 1]
   */
  domain?: [number, number] | "auto";
  /**
   * Number of concentric circles to draw
   * @default 5
   * @range 2-10
   */
  rings?: number;
  /**
   * Labels for angle positions (shown around the perimeter)
   * @example ["0°", "90°", "180°", "270°"], ["N", "E", "S", "W"]
   */
  angleLabels?: string[];
  /**
   * Number of radial divisions (spokes)
   * @default 8 (or angleLabels.length if provided)
   * @range 4-16
   */
  angleCount?: number;
}

/**
 * Polar plot variant types
 */
export type PolarVariant =
  | "polar" // Standard polar coordinate plot
  | "radar" // Radar/spider chart with closed shapes
  | "rose"; // Rose diagram showing wedges

/**
 * Props for PolarPlot.Root component
 */
export interface PolarPlotRootProps {
  /**
   * Array of data series to plot
   * @required
   */
  series: PolarSeries[];
  /**
   * Polar axis configuration
   * @default { domain: "auto", rings: 5, angleCount: 8 }
   */
  axis?: PolarAxis;
  /**
   * Chart width in pixels
   * @default 600
   * @example 400, 800, 1000
   */
  width?: number;
  /**
   * Chart height in pixels
   * @default 600
   * @example 400, 800, 1000
   */
  height?: number;
  /**
   * Display concentric circles and radial spokes
   * @default true
   */
  showGrid?: boolean;
  /**
   * Display series legend
   * @default true
   */
  showLegend?: boolean;
  /**
   * Enable entrance animations for lines and grid
   * @default true
   */
  animate?: boolean;
  /**
   * Plot variant style
   * @default "polar"
   */
  variant?: PolarVariant;
  /**
   * Enable responsive container that fills parent element
   * @default false
   */
  responsive?: boolean;
  /**
   * Allow clicking legend to toggle series visibility
   * @default false
   */
  toggleableSeries?: boolean;
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

interface PolarPlotContext {
  series: PolarSeries[];
  axis: PolarAxis;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  maxRadius: number;
  rScale: (r: number) => number;
  hoveredPoint: { seriesIdx: number; pointIdx: number } | null;
  setHoveredPoint: (
    point: { seriesIdx: number; pointIdx: number } | null
  ) => void;
  hiddenSeries: Set<number>;
  toggleSeries: (idx: number) => void;
  variant: PolarVariant;
  animate: boolean;
  showGrid: boolean;
  showLegend: boolean;
  toggleableSeries: boolean;
  responsive: boolean;
}

const PolarPlotContext = React.createContext<PolarPlotContext | null>(null);

function usePolarPlot() {
  const ctx = React.useContext(PolarPlotContext);
  if (!ctx) throw new Error("usePolarPlot must be used within PolarPlot.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function useResizeObserver(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
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
  const values = points.map((p) => p.r);
  const max = Math.max(...values);
  return [0, max * 1.1]; // 10% padding on top
}

function createRScale(domain: [number, number], maxRadius: number) {
  const [d0, d1] = domain;
  const slope = maxRadius / (d1 - d0);
  return (value: number) => slope * (value - d0);
}

// Convert polar to Cartesian coordinates
function polarToCartesian(
  theta: number,
  r: number,
  centerX: number,
  centerY: number,
  rScale: (r: number) => number
): { x: number; y: number } {
  const scaledR = rScale(r);
  return {
    x: centerX + scaledR * Math.cos(theta),
    y: centerY - scaledR * Math.sin(theta), // Negative because SVG y increases downward
  };
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const PolarPlotRoot = React.forwardRef<HTMLDivElement, PolarPlotRootProps>(
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
      toggleableSeries = false,
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
    const containerRef = React.useRef<HTMLDivElement>(null);

    const containerSize = useResizeObserver(containerRef);
    const actualWidth =
      responsive && containerSize.width > 0 ? containerSize.width : width;
    const actualHeight =
      responsive && containerSize.height > 0 ? containerSize.height : height;

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

    // Calculate center and radius
    const centerX = actualWidth / 2;
    const centerY = actualHeight / 2;
    const maxRadius = Math.min(actualWidth, actualHeight) / 2 - 60; // Leave space for labels

    // Calculate radial domain
    const allPoints = series.flatMap((s) => s.data);
    const rDomain =
      axis.domain === "auto" || !axis.domain
        ? getRDomain(allPoints)
        : axis.domain;

    const rScale = React.useMemo(
      () => createRScale(rDomain, maxRadius),
      [rDomain, maxRadius]
    );

    const contextValue: PolarPlotContext = React.useMemo(
      () => ({
        series,
        axis,
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
        variant,
        animate,
        showGrid,
        showLegend,
        toggleableSeries,
        responsive,
      }),
      [
        series,
        axis,
        actualWidth,
        actualHeight,
        centerX,
        centerY,
        maxRadius,
        rScale,
        hoveredPoint,
        hiddenSeries,
        toggleSeries,
        variant,
        animate,
        showGrid,
        showLegend,
        toggleableSeries,
        responsive,
      ]
    );

    return (
      <PolarPlotContext.Provider value={contextValue}>
        <div
          ref={(node) => {
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            if (node) {
              (
                containerRef as React.MutableRefObject<HTMLDivElement | null>
              ).current = node;
            }
          }}
          className={cn("polar-plot", className)}
        >
          {children}
        </div>
      </PolarPlotContext.Provider>
    );
  }
);

PolarPlotRoot.displayName = "PolarPlot.Root";

/**
 * Container component - wraps the SVG content
 */
export interface PolarPlotContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const PolarPlotContainer = React.forwardRef<
  HTMLDivElement,
  PolarPlotContainerProps
>(({ className, style, children, ...props }, ref) => {
  const { width, height, responsive } = usePolarPlot();

  return (
    <div
      ref={ref}
      className={cn("polar-plot-container", className)}
      style={{
        position: "relative",
        width: responsive ? "100%" : `${width}px`,
        height: responsive ? "100%" : `${height}px`,
        display: responsive ? "block" : "inline-block",
        minHeight: responsive ? "300px" : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

PolarPlotContainer.displayName = "PolarPlot.Container";

/**
 * Viewport component - SVG canvas
 */
export interface PolarPlotViewportProps extends React.SVGProps<SVGSVGElement> {}

const PolarPlotViewport = React.forwardRef<
  SVGSVGElement,
  PolarPlotViewportProps
>(({ className, children, ...props }, ref) => {
  const { width, height, series } = usePolarPlot();

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      className={cn("polar-plot-svg", className)}
      style={{ userSelect: "none" }}
      role="img"
      aria-label={`Polar plot with ${series.length} series`}
      {...props}
    >
      {children}
    </svg>
  );
});

PolarPlotViewport.displayName = "PolarPlot.Viewport";

/**
 * Grid component - renders concentric circles and radial lines
 */
export interface PolarPlotGridProps extends React.SVGProps<SVGGElement> {}

const PolarPlotGrid = React.forwardRef<SVGGElement, PolarPlotGridProps>(
  ({ className, children, ...props }, ref) => {
    const { centerX, centerY, maxRadius, axis, animate } = usePolarPlot();

    const rings = axis.rings ?? 5;
    const angleCount = axis.angleCount ?? (axis.angleLabels?.length || 8);

    // Concentric circles (rings)
    const ringRadii = Array.from(
      { length: rings },
      (_, i) => ((i + 1) / rings) * maxRadius
    );

    // Radial lines (spokes)
    const angles = Array.from(
      { length: angleCount },
      (_, i) => (i / angleCount) * 2 * Math.PI
    );

    return (
      <g ref={ref} className={cn("polar-plot-grid", className)} {...props}>
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
            style={
              animate
                ? { animation: `fadeIn 0.3s ease ${i * 0.05}s forwards` }
                : undefined
            }
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
            style={
              animate
                ? { animation: `fadeIn 0.3s ease ${i * 0.03}s forwards` }
                : undefined
            }
          />
        ))}

        {/* Angle labels */}
        {axis.angleLabels &&
          angles.map((angle, i) => {
            if (i >= axis.angleLabels!.length) return null;
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
                style={
                  animate
                    ? {
                        animation: `fadeIn 0.4s ease ${
                          0.3 + i * 0.05
                        }s forwards`,
                      }
                    : undefined
                }
              >
                {axis.angleLabels[i]}
              </text>
            );
          })}

        <style jsx>{`
          @keyframes fadeIn {
            to {
              opacity: 0.2;
            }
          }
        `}</style>
      </g>
    );
  }
);

PolarPlotGrid.displayName = "PolarPlot.Grid";

/**
 * Lines component - renders the data lines
 */
export interface PolarPlotLinesProps extends React.SVGProps<SVGGElement> {}

const PolarPlotLines = React.forwardRef<SVGGElement, PolarPlotLinesProps>(
  ({ className, children, ...props }, ref) => {
    const {
      series,
      centerX,
      centerY,
      rScale,
      hiddenSeries,
      setHoveredPoint,
      animate,
      variant,
    } = usePolarPlot();

    return (
      <g ref={ref} className={cn("polar-plot-lines", className)} {...props}>
        {series.map((s, seriesIdx) => {
          if (s.data.length === 0 || hiddenSeries.has(seriesIdx)) return null;

          const color = s.color || "#64748b";
          const strokeWidth = s.strokeWidth || 2.5;
          const filled = s.filled ?? true;
          const closed = s.closed ?? variant === "radar";
          const showMarkers = s.showMarkers ?? true;

          // Convert polar points to Cartesian
          const cartesianPoints = s.data.map((p) =>
            polarToCartesian(p.theta, p.r, centerX, centerY, rScale)
          );

          // Build path
          let pathData = "";
          if (variant === "rose") {
            // Rose diagram: draw wedges
            s.data.forEach((point, i) => {
              const angle1 = point.theta;
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
                    <linearGradient
                      id={`polar-gradient-${seriesIdx}`}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                      <stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d={pathData}
                    fill={`url(#polar-gradient-${seriesIdx})`}
                    opacity={animate ? 0 : 1}
                    style={
                      animate
                        ? {
                            animation: `fadeIn 0.5s ease ${
                              seriesIdx * 0.1
                            }s forwards`,
                          }
                        : undefined
                    }
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
                        animation: `fadeIn 0.5s ease ${
                          seriesIdx * 0.1
                        }s forwards`,
                        filter: "drop-shadow(0 0 2px currentColor)",
                      }
                    : { filter: "drop-shadow(0 0 2px currentColor)" }
                }
              />

              {/* Markers */}
              {showMarkers &&
                cartesianPoints.map((point, pointIdx) => (
                  <circle
                    key={pointIdx}
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill={color}
                    stroke="white"
                    strokeWidth={2}
                    opacity={animate ? 0 : 1}
                    style={
                      animate
                        ? {
                            animation: `fadeIn 0.5s ease ${
                              seriesIdx * 0.1 + pointIdx * 0.02
                            }s forwards`,
                          }
                        : undefined
                    }
                    onMouseEnter={() =>
                      setHoveredPoint({ seriesIdx, pointIdx })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                    cursor="pointer"
                  />
                ))}
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

PolarPlotLines.displayName = "PolarPlot.Lines";

/**
 * Legend component
 */
export interface PolarPlotLegendProps extends React.SVGProps<SVGGElement> {}

const PolarPlotLegend = React.forwardRef<SVGGElement, PolarPlotLegendProps>(
  ({ className, children, ...props }, ref) => {
    const { series, width, hiddenSeries, toggleSeries, toggleableSeries } =
      usePolarPlot();

    return (
      <g ref={ref} className={cn("polar-plot-legend", className)} {...props}>
        {series.map((s, idx) => {
          const x = width - 160;
          const y = 20 + idx * 24;
          const color = s.color || "#64748b";
          const isHidden = hiddenSeries.has(idx);

          return (
            <g
              key={idx}
              onClick={toggleableSeries ? () => toggleSeries(idx) : undefined}
              style={{ cursor: toggleableSeries ? "pointer" : "default" }}
              opacity={isHidden ? 0.4 : 1}
            >
              <rect
                x={x}
                y={y - 8}
                width={20}
                height={3}
                fill={color}
                rx={1.5}
              />
              {s.filled && (
                <rect
                  x={x}
                  y={y - 8}
                  width={20}
                  height={3}
                  fill={color}
                  opacity={0.3}
                  rx={1.5}
                />
              )}
              <text
                x={x + 28}
                y={y}
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
  }
);

PolarPlotLegend.displayName = "PolarPlot.Legend";

/**
 * Tooltip component - shows point information on hover
 */
export interface PolarPlotTooltipProps extends React.SVGProps<SVGGElement> {}

const PolarPlotTooltip = React.forwardRef<SVGGElement, PolarPlotTooltipProps>(
  ({ className, children, ...props }, ref) => {
    const { hoveredPoint, series, centerX, centerY, rScale } = usePolarPlot();

    if (!hoveredPoint) return null;

    const s = series[hoveredPoint.seriesIdx];
    if (!s) return null;

    const point = s.data[hoveredPoint.pointIdx];
    const { x, y } = polarToCartesian(
      point.theta,
      point.r,
      centerX,
      centerY,
      rScale
    );

    const thetaDeg = ((point.theta * 180) / Math.PI).toFixed(1);
    const rLabel = formatValue(point.r);

    return (
      <g
        ref={ref}
        className={cn("polar-plot-tooltip", className)}
        style={{ pointerEvents: "none" }}
        {...props}
      >
        {/* Point indicator - static circles to avoid flicker */}
        <circle
          cx={x}
          cy={y}
          r={8}
          fill="none"
          stroke={s.color || "#64748b"}
          strokeWidth={2}
          opacity={0.3}
        />
        <circle
          cx={x}
          cy={y}
          r={6}
          fill="none"
          stroke={s.color || "#64748b"}
          strokeWidth={2}
          opacity={0.5}
        />
        <circle
          cx={x}
          cy={y}
          r={4}
          fill={s.color || "#64748b"}
          stroke="white"
          strokeWidth={2}
        />

        {/* Tooltip box */}
        <rect
          x={x + 10}
          y={y - 40}
          width={160}
          height={point.label ? 65 : 50}
          rx={6}
          fill="currentColor"
          opacity={0.95}
        />
        <text
          x={x + 18}
          y={y - 24}
          fontSize={11}
          fontWeight={600}
          fill="white"
          style={{ mixBlendMode: "difference" }}
        >
          {s.name}
        </text>
        <text
          x={x + 18}
          y={y - 10}
          fontSize={10}
          fill="white"
          opacity={0.8}
          style={{ mixBlendMode: "difference" }}
        >
          θ: {thetaDeg}° | r: {rLabel}
        </text>
        {point.label && (
          <text
            x={x + 18}
            y={y + 4}
            fontSize={10}
            fill="white"
            opacity={0.8}
            style={{ mixBlendMode: "difference" }}
          >
            {point.label}
          </text>
        )}
      </g>
    );
  }
);

PolarPlotTooltip.displayName = "PolarPlot.Tooltip";

/**
 * Loading state component
 */
export interface PolarPlotLoadingProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const PolarPlotLoading = React.forwardRef<
  HTMLDivElement,
  PolarPlotLoadingProps
>(({ className, style, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("polar-plot-loading", className)}
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
        ...style,
      }}
      role="status"
      aria-live="polite"
      {...props}
    >
      {children || (
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
          <div
            style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))" }}
          >
            Loading chart...
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
});

PolarPlotLoading.displayName = "PolarPlot.Loading";

/**
 * Empty state component
 */
export interface PolarPlotEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const PolarPlotEmpty = React.forwardRef<HTMLDivElement, PolarPlotEmptyProps>(
  ({ className, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("polar-plot-empty", className)}
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
          ...style,
        }}
        role="status"
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
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="2" x2="12" y2="22" strokeWidth="2" />
              <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
            </svg>
            <div
              style={{
                fontSize: "14px",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              No data available
            </div>
          </>
        )}
      </div>
    );
  }
);

PolarPlotEmpty.displayName = "PolarPlot.Empty";

// ============================================================================
// Exports
// ============================================================================

export const PolarPlot = Object.assign(PolarPlotRoot, {
  Root: PolarPlotRoot,
  Container: PolarPlotContainer,
  Viewport: PolarPlotViewport,
  Grid: PolarPlotGrid,
  Lines: PolarPlotLines,
  Legend: PolarPlotLegend,
  Tooltip: PolarPlotTooltip,
  Loading: PolarPlotLoading,
  Empty: PolarPlotEmpty,
});
