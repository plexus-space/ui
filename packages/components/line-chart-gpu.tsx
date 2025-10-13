"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import {
  cn,
  getDomain,
  createScale,
  formatValue,
  formatTime,
  getTicks,
  type Point,
} from "./lib";
import { LineRenderer } from "./primitives";

// ============================================================================
// Types
// ============================================================================

/**
 * Series configuration for GPU-accelerated line chart
 */
export interface SeriesGPU {
  /** Display name for the series (shown in legend and tooltips) */
  name: string;
  /** Array of data points with x and y coordinates */
  data: Point[];
  /**
   * Line color as THREE.Color or hex number
   * @default 0x64748b
   * @example 0x06b6d4, new THREE.Color("#06b6d4")
   */
  color?: number | THREE.Color;
  /**
   * Line stroke width in pixels
   * @default 2
   * @range 1-10
   */
  strokeWidth?: number;
  /**
   * Enable streaming mode with circular buffer
   * @default false
   */
  streaming?: boolean;
  /**
   * Buffer capacity for streaming mode
   * @default 10000
   */
  capacity?: number;
}

/**
 * Axis configuration for x or y axis
 */
export interface AxisGPU {
  /** Axis label text */
  label?: string;
  /** Domain range for axis values */
  domain?: [number, number] | "auto";
  /** Data type for axis values */
  type?: "number" | "time";
  /** Timezone for time axis formatting */
  timezone?: string;
  /** Custom formatter function for axis tick labels */
  formatter?: (value: number) => string;
}

/**
 * Visual variant styles for the chart
 */
export type LineChartGPUVariant =
  | "default"
  | "minimal"
  | "scientific"
  | "dashboard";

/**
 * Props for LineChartGPU.Root component
 */
export interface LineChartGPURootProps {
  /**
   * Array of data series to plot
   * @required
   */
  series: SeriesGPU[];
  /**
   * X-axis configuration
   */
  xAxis?: AxisGPU;
  /**
   * Y-axis configuration
   */
  yAxis?: AxisGPU;
  /**
   * Chart width in pixels
   * @default 800
   */
  width?: number;
  /**
   * Chart height in pixels
   * @default 400
   */
  height?: number;
  /**
   * Maximum points per series (GPU can handle 10k-100k+)
   * @default 50000
   */
  maxPoints?: number;
  /**
   * Enable magnetic crosshair that snaps to nearest data point
   * @default true
   */
  magneticCrosshair?: boolean;
  /**
   * Show unified tooltip with all series values at the same x-coordinate
   * @default false
   */
  unifiedTooltip?: boolean;
  /**
   * Visual variant style preset
   * @default "default"
   */
  variant?: LineChartGPUVariant;
  /**
   * Snap radius in pixels for point detection during hover
   * @default 40
   */
  snapRadius?: number;
  /**
   * Enable entrance animations
   * @default false
   */
  animate?: boolean;
  /**
   * Performance mode: skip anti-aliasing for better FPS
   * @default false
   */
  performanceMode?: boolean;
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

interface LineChartGPUContext {
  series: SeriesGPU[];
  xAxis: AxisGPU;
  yAxis: AxisGPU;
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
  hoveredXIndex: number | null;
  setHoveredXIndex: (idx: number | null) => void;
  hiddenSeries: Set<number>;
  toggleSeries: (idx: number) => void;
  variant: LineChartGPUVariant;
  animate: boolean;
  magneticCrosshair: boolean;
  unifiedTooltip: boolean;
  snapRadius: number;
  maxPoints: number;
}

const LineChartGPUContext = React.createContext<LineChartGPUContext | null>(
  null
);

function useLineChartGPU() {
  const ctx = React.useContext(LineChartGPUContext);
  if (!ctx)
    throw new Error("useLineChartGPU must be used within LineChartGPU.Root");
  return ctx;
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const LineChartGPURoot = React.forwardRef<
  HTMLDivElement,
  LineChartGPURootProps
>(
  (
    {
      series,
      xAxis = {},
      yAxis = {},
      width = 800,
      height = 400,
      maxPoints = 50000,
      magneticCrosshair = true,
      unifiedTooltip = false,
      variant = "default",
      snapRadius = 40,
      animate = false,
      performanceMode = false,
      className,
      children,
    },
    ref
  ) => {
    const [hoveredPoint, setHoveredPoint] = React.useState<{
      seriesIdx: number;
      pointIdx: number;
    } | null>(null);
    const [hoveredXIndex, setHoveredXIndex] = React.useState<number | null>(
      null
    );
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

    // Calculate domains (no decimation needed - GPU handles it)
    const allPoints = series.flatMap((s) => s.data.slice(0, maxPoints));
    const xDomain: [number, number] =
      xAxis.domain === "auto" || !xAxis.domain
        ? getDomain(allPoints, (p) => p.x, false)
        : xAxis.domain;
    const yDomain: [number, number] =
      yAxis.domain === "auto" || !yAxis.domain
        ? getDomain(allPoints, (p) => p.y, true)
        : yAxis.domain;

    // Create scales - map data coordinates to pixel coordinates
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

    const contextValue: LineChartGPUContext = React.useMemo(
      () => ({
        series,
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
        hoveredXIndex,
        setHoveredXIndex,
        hiddenSeries,
        toggleSeries,
        variant,
        animate,
        magneticCrosshair,
        unifiedTooltip,
        snapRadius,
        maxPoints,
      }),
      [
        series,
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
        hoveredXIndex,
        hiddenSeries,
        toggleSeries,
        variant,
        animate,
        magneticCrosshair,
        unifiedTooltip,
        snapRadius,
        maxPoints,
      ]
    );

    return (
      <LineChartGPUContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("line-chart-gpu", className)}
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
      </LineChartGPUContext.Provider>
    );
  }
);

LineChartGPURoot.displayName = "LineChartGPU.Root";

/**
 * Container component - wraps the Three.js canvas
 */
export interface LineChartGPUContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Performance mode: skip anti-aliasing for better FPS
   * @default false
   */
  performanceMode?: boolean;
}

const LineChartGPUContainer = React.forwardRef<
  HTMLDivElement,
  LineChartGPUContainerProps
>(({ className, style, performanceMode = false, children, ...props }, ref) => {
  const { height, width } = useLineChartGPU();

  return (
    <div
      ref={ref}
      className={cn("line-chart-gpu-container", className)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        height: `${height}px`,
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        ...style,
      }}
      {...props}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 100], zoom: 1 }}
        gl={{
          antialias: !performanceMode,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <OrthographicCamera
          makeDefault
          position={[width / 2, height / 2, 100]}
          zoom={1}
          near={0.1}
          far={1000}
        />
        {children}
      </Canvas>
    </div>
  );
});

LineChartGPUContainer.displayName = "LineChartGPU.Container";

/**
 * Grid component - renders grid lines using Three.js line geometry
 */
export interface LineChartGPUGridProps {}

const LineChartGPUGrid = React.forwardRef<THREE.Group, LineChartGPUGridProps>(
  (props, ref) => {
    const { xTicks, yTicks, xScale, yScale, margin, width, height } =
      useLineChartGPU();

    const gridLines = React.useMemo(() => {
      const lines: Array<{ points: [number, number, number][]; key: string }> =
        [];

      // Vertical grid lines
      xTicks.forEach((tick, i) => {
        const x = xScale(tick);
        lines.push({
          key: `vgrid-${i}`,
          points: [
            [x, margin.top, 0],
            [x, height - margin.bottom, 0],
          ],
        });
      });

      // Horizontal grid lines
      yTicks.forEach((tick, i) => {
        const y = yScale(tick);
        lines.push({
          key: `hgrid-${i}`,
          points: [
            [margin.left, y, 0],
            [width - margin.right, y, 0],
          ],
        });
      });

      return lines;
    }, [xTicks, yTicks, xScale, yScale, margin, width, height]);

    return (
      <group ref={ref}>
        {gridLines.map(({ key, points }) => (
          <line key={key}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array(points.flat())}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={0x000000} opacity={0.1} transparent />
          </line>
        ))}
      </group>
    );
  }
);

LineChartGPUGrid.displayName = "LineChartGPU.Grid";

/**
 * Axes component - renders axes with tick marks (HTML overlay)
 */
export interface LineChartGPUAxesProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const LineChartGPUAxes = React.forwardRef<
  HTMLDivElement,
  LineChartGPUAxesProps
>(({ className, style, ...props }, ref) => {
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
  } = useLineChartGPU();

  const formatTick = (value: number, axis: AxisGPU): string => {
    if (axis.formatter) return axis.formatter(value);
    if (axis.type === "time") {
      const timezone = axis.timezone || "UTC";
      return formatTime(value, timezone);
    }
    return formatValue(value);
  };

  return (
    <div
      ref={ref}
      className={cn("line-chart-gpu-axes", className)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
      }}
      {...props}
    >
      {/* X-axis ticks */}
      {xTicks.map((tick, i) => (
        <div
          key={`xtick-${i}`}
          style={{
            position: "absolute",
            left: `${xScale(tick)}px`,
            top: `${height - margin.bottom + 5}px`,
            transform: "translateX(-50%)",
            fontSize: "10px",
            color: "currentColor",
            opacity: 0.6,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTick(tick, xAxis)}
        </div>
      ))}
      {xAxis.label && (
        <div
          style={{
            position: "absolute",
            left: `${(margin.left + width - margin.right) / 2}px`,
            top: `${height - 5}px`,
            transform: "translateX(-50%)",
            fontSize: "12px",
            fontWeight: 500,
            color: "currentColor",
            opacity: 0.7,
          }}
        >
          {xAxis.label}
        </div>
      )}

      {/* Y-axis ticks */}
      {yTicks.map((tick, i) => (
        <div
          key={`ytick-${i}`}
          style={{
            position: "absolute",
            left: `${margin.left - 10}px`,
            top: `${yScale(tick)}px`,
            transform: "translate(-100%, -50%)",
            fontSize: "10px",
            color: "currentColor",
            opacity: 0.6,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTick(tick, yAxis)}
        </div>
      ))}
      {yAxis.label && (
        <div
          style={{
            position: "absolute",
            left: `${margin.left - 50}px`,
            top: `${(margin.top + height - margin.bottom) / 2}px`,
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            fontSize: "12px",
            fontWeight: 500,
            color: "currentColor",
            opacity: 0.7,
            whiteSpace: "nowrap",
          }}
        >
          {yAxis.label}
        </div>
      )}
    </div>
  );
});

LineChartGPUAxes.displayName = "LineChartGPU.Axes";

/**
 * Lines component - renders GPU-accelerated lines using LineRenderer primitive
 */
export interface LineChartGPULinesProps {}

const LineChartGPULines = React.forwardRef<THREE.Group, LineChartGPULinesProps>(
  (props, ref) => {
    const { series, xScale, yScale, hiddenSeries, maxPoints } =
      useLineChartGPU();

    return (
      <group ref={ref}>
        {series.map((s, seriesIdx) => {
          if (s.data.length === 0 || hiddenSeries.has(seriesIdx)) return null;

          // Transform data points to screen coordinates
          const points: [number, number, number][] = s.data
            .slice(0, maxPoints)
            .map((p) => [xScale(p.x), yScale(p.y), 0]);

          // Convert color
          const color =
            typeof s.color === "number"
              ? s.color
              : new THREE.Color(s.color || 0x64748b).getHex();

          return (
            <LineRenderer
              key={seriesIdx}
              points={points}
              color={color}
              width={s.strokeWidth || 2}
              streaming={s.streaming || false}
              capacity={s.capacity || maxPoints}
            />
          );
        })}
      </group>
    );
  }
);

LineChartGPULines.displayName = "LineChartGPU.Lines";

/**
 * Tooltip component - displays interactive tooltip (HTML overlay)
 */
export interface LineChartGPUTooltipProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const LineChartGPUTooltip = React.forwardRef<
  HTMLDivElement,
  LineChartGPUTooltipProps
>(({ className, style, ...props }, ref) => {
  const {
    hoveredPoint,
    hoveredXIndex,
    series,
    xScale,
    yScale,
    xAxis,
    yAxis,
    width,
    height,
    margin,
    unifiedTooltip,
    hiddenSeries,
  } = useLineChartGPU();

  // Unified tooltip mode
  if (unifiedTooltip && hoveredXIndex !== null) {
    const seriesData = series
      .map((s, idx) => ({ series: s, seriesIdx: idx }))
      .filter(({ seriesIdx }) => !hiddenSeries.has(seriesIdx))
      .map(({ series, seriesIdx }) => ({
        series,
        seriesIdx,
        point: series.data[hoveredXIndex],
      }))
      .filter(({ point }) => point !== undefined);

    if (seriesData.length === 0) return null;

    const xValue = seriesData[0].point.x;
    const px = xScale(xValue);

    const xLabel =
      xAxis.type === "time"
        ? new Date(xValue).toLocaleString()
        : xAxis.formatter?.(xValue) ?? formatValue(xValue);

    const tooltipWidth = 200;
    const lineHeight = 20;
    const tooltipHeight = 50 + seriesData.length * lineHeight;
    const offsetX = px > width / 2 ? -tooltipWidth - 15 : 15;
    const tooltipY = margin.top + 10;

    return (
      <div
        ref={ref}
        className={cn("line-chart-gpu-tooltip", className)}
        style={{
          position: "absolute",
          left: `${px + offsetX}px`,
          top: `${tooltipY}px`,
          width: `${tooltipWidth}px`,
          padding: "12px",
          background: "rgba(0, 0, 0, 0.95)",
          color: "white",
          borderRadius: "6px",
          pointerEvents: "none",
          fontSize: "11px",
          ...style,
        }}
        {...props}
      >
        <div style={{ fontWeight: 600, marginBottom: "8px" }}>
          {xAxis.label || "X"}: {xLabel}
        </div>
        {seriesData.map(({ series, point }) => {
          const yLabel = yAxis.formatter?.(point.y) ?? formatValue(point.y);
          const color =
            typeof series.color === "number"
              ? `#${series.color.toString(16).padStart(6, "0")}`
              : (series.color as THREE.Color)?.getStyle?.() || "#64748b";

          return (
            <div
              key={series.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: color,
                }}
              />
              <span>
                {series.name}: {yLabel}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Individual tooltip mode
  if (!hoveredPoint) return null;

  const s = series[hoveredPoint.seriesIdx];
  if (!s) return null;

  const point = s.data[hoveredPoint.pointIdx];
  const px = xScale(point.x);
  const py = yScale(point.y);

  const xLabel =
    xAxis.type === "time"
      ? new Date(point.x).toLocaleString()
      : xAxis.formatter?.(point.x) ?? formatValue(point.x);
  const yLabel = yAxis.formatter?.(point.y) ?? formatValue(point.y);

  const tooltipWidth = 180;
  const tooltipHeight = 80;
  const offsetX = px > width / 2 ? -tooltipWidth - 10 : 10;
  const offsetY = py > height / 2 ? -tooltipHeight - 10 : 10;

  return (
    <div
      ref={ref}
      className={cn("line-chart-gpu-tooltip", className)}
      style={{
        position: "absolute",
        left: `${px + offsetX}px`,
        top: `${py + offsetY}px`,
        width: `${tooltipWidth}px`,
        padding: "10px",
        background: "rgba(0, 0, 0, 0.95)",
        color: "white",
        borderRadius: "6px",
        pointerEvents: "none",
        fontSize: "10px",
        ...style,
      }}
      {...props}
    >
      <div style={{ fontWeight: 600, marginBottom: "6px" }}>{s.name}</div>
      <div>
        {xAxis.label || "X"}: {xLabel}
      </div>
      <div>
        {yAxis.label || "Y"}: {yLabel}
      </div>
    </div>
  );
});

LineChartGPUTooltip.displayName = "LineChartGPU.Tooltip";

/**
 * Interaction layer - transparent overlay for mouse events
 */
export interface LineChartGPUInteractionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const LineChartGPUInteraction = React.forwardRef<
  HTMLDivElement,
  LineChartGPUInteractionProps
>(({ className, style, ...props }, ref) => {
  const {
    margin,
    width,
    height,
    series,
    xScale,
    yScale,
    setHoveredPoint,
    hoveredPoint,
    setHoveredXIndex,
    hoveredXIndex,
    magneticCrosshair,
    unifiedTooltip,
    snapRadius,
    hiddenSeries,
  } = useLineChartGPU();

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!magneticCrosshair) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (unifiedTooltip) {
        // Find nearest x-coordinate
        let nearestPointIdx = 0;
        let minXDist = Infinity;

        const firstVisibleSeries = series.find(
          (_, idx) => !hiddenSeries.has(idx)
        );
        if (!firstVisibleSeries) return;

        firstVisibleSeries.data.forEach((point, pointIdx) => {
          const px = xScale(point.x);
          const xDist = Math.abs(px - mouseX);

          if (xDist < minXDist) {
            minXDist = xDist;
            nearestPointIdx = pointIdx;
          }
        });

        if (minXDist < snapRadius) {
          if (hoveredXIndex !== nearestPointIdx) {
            setHoveredXIndex(nearestPointIdx);
          }
        } else if (minXDist > snapRadius * 1.3) {
          if (hoveredXIndex !== null) {
            setHoveredXIndex(null);
          }
        }
      } else {
        // Find nearest point
        let nearestSeriesIdx = 0;
        let nearestPointIdx = 0;
        let minDist = Infinity;

        series.forEach((s, seriesIdx) => {
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
          if (
            hoveredPoint?.seriesIdx !== nearestSeriesIdx ||
            hoveredPoint?.pointIdx !== nearestPointIdx
          ) {
            setHoveredPoint({
              seriesIdx: nearestSeriesIdx,
              pointIdx: nearestPointIdx,
            });
          }
        } else if (minDist > snapRadius * 1.3) {
          if (hoveredPoint !== null) {
            setHoveredPoint(null);
          }
        }
      }
    },
    [
      magneticCrosshair,
      unifiedTooltip,
      series,
      xScale,
      yScale,
      snapRadius,
      hiddenSeries,
      hoveredPoint,
      hoveredXIndex,
      setHoveredPoint,
      setHoveredXIndex,
    ]
  );

  const handleMouseLeave = React.useCallback(() => {
    setHoveredPoint(null);
    setHoveredXIndex(null);
  }, [setHoveredPoint, setHoveredXIndex]);

  return (
    <div
      ref={ref}
      className={cn("line-chart-gpu-interaction", className)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        cursor: magneticCrosshair ? "crosshair" : "default",
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  );
});

LineChartGPUInteraction.displayName = "LineChartGPU.Interaction";

/**
 * Legend component - displays series legend
 */
export interface LineChartGPULegendProps
  extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

const LineChartGPULegend = React.forwardRef<
  HTMLDivElement,
  LineChartGPULegendProps
>(({ className, style, interactive = false, ...props }, ref) => {
  const { series, hiddenSeries, toggleSeries } = useLineChartGPU();

  return (
    <div
      ref={ref}
      className={cn("line-chart-gpu-legend", className)}
      style={{
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        padding: "8px 0",
        ...style,
      }}
      {...props}
    >
      {series.map((s, idx) => {
        const color =
          typeof s.color === "number"
            ? `#${s.color.toString(16).padStart(6, "0")}`
            : (s.color as THREE.Color)?.getStyle?.() || "#64748b";
        const isHidden = hiddenSeries.has(idx);

        return (
          <div
            key={idx}
            onClick={interactive ? () => toggleSeries(idx) : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: interactive ? "pointer" : "default",
              opacity: isHidden ? 0.4 : 1,
              fontSize: "11px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "2.5px",
                background: color,
              }}
            />
            <span style={{ color: "currentColor", opacity: 0.8 }}>
              {s.name}
            </span>
          </div>
        );
      })}
    </div>
  );
});

LineChartGPULegend.displayName = "LineChartGPU.Legend";

// ============================================================================
// Exports
// ============================================================================

export const LineChartGPU = Object.assign(LineChartGPURoot, {
  Root: LineChartGPURoot,
  Container: LineChartGPUContainer,
  Grid: LineChartGPUGrid,
  Axes: LineChartGPUAxes,
  Lines: LineChartGPULines,
  Tooltip: LineChartGPUTooltip,
  Interaction: LineChartGPUInteraction,
  Legend: LineChartGPULegend,
});
