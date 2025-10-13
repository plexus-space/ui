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
import { PointCloud, LineRenderer } from "./primitives";

// ============================================================================
// Types
// ============================================================================

/**
 * Extended point data for GPU scatter plots with optional labeling and metadata
 */
export interface ScatterPointGPU extends Point {
  /** Optional text label for the data point displayed in tooltips */
  label?: string;
  /** Additional metadata associated with the point for custom processing */
  metadata?: Record<string, any>;
}

/**
 * Series configuration for GPU scatter plot data
 */
export interface ScatterSeriesGPU {
  /** Display name for the series (shown in legend and tooltips) */
  name: string;
  /** Array of data points with x and y coordinates */
  data: ScatterPointGPU[];
  /**
   * Point color as THREE.Color or hex number
   * @default 0x64748b
   * @example 0x06b6d4, new THREE.Color("#06b6d4")
   */
  color?: number | THREE.Color;
  /**
   * Point radius in pixels
   * @default 4
   * @range 1-20
   */
  radius?: number;
  /**
   * Point opacity level
   * @default 0.7
   * @range 0.0-1.0
   */
  opacity?: number;
  /**
   * Optional cluster assignment for grouping related points
   * @example 0, 1, 2
   */
  cluster?: number;
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
 * Visual variant styles for the scatter plot
 */
export type ScatterPlotGPUVariant = "default" | "minimal" | "scientific" | "dashboard";

/**
 * Props for ScatterPlotGPU.Root component
 */
export interface ScatterPlotGPURootProps {
  /**
   * Array of data series to plot
   * @required
   */
  series: ScatterSeriesGPU[];
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
   * Maximum points per series (GPU can handle 100k-1M+)
   * @default 100000
   */
  maxPoints?: number;
  /**
   * Visual variant style preset
   * @default "default"
   */
  variant?: ScatterPlotGPUVariant;
  /**
   * Enable entrance animations
   * @default false
   */
  animate?: boolean;
  /**
   * Display linear regression line and R² value
   * @default false
   */
  showRegression?: boolean;
  /**
   * Snap radius in pixels for point detection during hover
   * @default 30
   */
  snapRadius?: number;
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
   * Child components (Container, Points, etc.)
   */
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface ScatterPlotGPUContext {
  series: ScatterSeriesGPU[];
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
  setHoveredPoint: (point: { seriesIdx: number; pointIdx: number } | null) => void;
  hiddenSeries: Set<number>;
  toggleSeries: (idx: number) => void;
  variant: ScatterPlotGPUVariant;
  animate: boolean;
  showRegression: boolean;
  snapRadius: number;
  maxPoints: number;
}

const ScatterPlotGPUContext = React.createContext<ScatterPlotGPUContext | null>(null);

function useScatterPlotGPU() {
  const ctx = React.useContext(ScatterPlotGPUContext);
  if (!ctx) throw new Error("useScatterPlotGPU must be used within ScatterPlotGPU.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function calculateLinearRegression(points: ScatterPointGPU[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0,
    sumYY = 0;

  points.forEach((p) => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  const ssTotal = sumYY - n * yMean * yMean;
  const ssResidual = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);
  const r2 = 1 - ssResidual / ssTotal;

  return { slope, intercept, r2 };
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const ScatterPlotGPURoot = React.forwardRef<HTMLDivElement, ScatterPlotGPURootProps>(
  (
    {
      series,
      xAxis = {},
      yAxis = {},
      width = 800,
      height = 400,
      maxPoints = 100000,
      variant = "default",
      animate = false,
      showRegression = false,
      snapRadius = 30,
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
    const [hiddenSeries, setHiddenSeries] = React.useState<Set<number>>(new Set());

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

    // Calculate domains (GPU can handle full dataset - no sampling needed)
    const allPoints = series.flatMap((s) => s.data.slice(0, maxPoints));
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

    const contextValue: ScatterPlotGPUContext = React.useMemo(
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
        hiddenSeries,
        toggleSeries,
        variant,
        animate,
        showRegression,
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
        hiddenSeries,
        toggleSeries,
        variant,
        animate,
        showRegression,
        snapRadius,
        maxPoints,
      ]
    );

    return (
      <ScatterPlotGPUContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("scatter-plot-gpu", className)}
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
      </ScatterPlotGPUContext.Provider>
    );
  }
);

ScatterPlotGPURoot.displayName = "ScatterPlotGPU.Root";

/**
 * Container component - wraps the Three.js canvas
 */
export interface ScatterPlotGPUContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Performance mode: skip anti-aliasing for better FPS
   * @default false
   */
  performanceMode?: boolean;
}

const ScatterPlotGPUContainer = React.forwardRef<HTMLDivElement, ScatterPlotGPUContainerProps>(
  ({ className, style, performanceMode = false, children, ...props }, ref) => {
    const { height, width } = useScatterPlotGPU();

    return (
      <div
        ref={ref}
        className={cn("scatter-plot-gpu-container", className)}
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
  }
);

ScatterPlotGPUContainer.displayName = "ScatterPlotGPU.Container";

/**
 * Grid component - renders grid lines using Three.js
 */
export interface ScatterPlotGPUGridProps {}

const ScatterPlotGPUGrid = React.forwardRef<THREE.Group, ScatterPlotGPUGridProps>(
  (props, ref) => {
    const { xTicks, yTicks, xScale, yScale, margin, width, height } = useScatterPlotGPU();

    const gridLines = React.useMemo(() => {
      const lines: Array<{ points: [number, number, number][]; key: string }> = [];

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

ScatterPlotGPUGrid.displayName = "ScatterPlotGPU.Grid";

/**
 * Axes component - renders axes with tick marks (HTML overlay)
 */
export interface ScatterPlotGPUAxesProps extends React.HTMLAttributes<HTMLDivElement> {}

const ScatterPlotGPUAxes = React.forwardRef<HTMLDivElement, ScatterPlotGPUAxesProps>(
  ({ className, style, ...props }, ref) => {
    const { xTicks, yTicks, xScale, yScale, margin, width, height, xAxis, yAxis } =
      useScatterPlotGPU();

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
        className={cn("scatter-plot-gpu-axes", className)}
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
  }
);

ScatterPlotGPUAxes.displayName = "ScatterPlotGPU.Axes";

/**
 * Points component - renders GPU-accelerated points using PointCloud primitive
 */
export interface ScatterPlotGPUPointsProps {}

const ScatterPlotGPUPoints = React.forwardRef<THREE.Group, ScatterPlotGPUPointsProps>(
  (props, ref) => {
    const { series, xScale, yScale, hiddenSeries, maxPoints, hoveredPoint } =
      useScatterPlotGPU();

    return (
      <group ref={ref}>
        {series.map((s, seriesIdx) => {
          if (s.data.length === 0 || hiddenSeries.has(seriesIdx)) return null;

          // Transform data points to screen coordinates
          const positions: [number, number, number][] = s.data
            .slice(0, maxPoints)
            .map((p) => [xScale(p.x), yScale(p.y), 0]);

          // Convert color
          const color =
            typeof s.color === "number"
              ? s.color
              : new THREE.Color(s.color || 0x64748b).getHex();

          // Size
          const radius = s.radius || 4;
          const sizes = new Float32Array(positions.length).fill(radius);

          // Check if any point is hovered in this series
          const isHoveredSeries = hoveredPoint?.seriesIdx === seriesIdx;

          // If hovered, make that point larger
          if (isHoveredSeries && hoveredPoint?.pointIdx !== undefined) {
            sizes[hoveredPoint.pointIdx] = radius * 1.5;
          }

          return (
            <PointCloud
              key={seriesIdx}
              positions={positions}
              colors={color}
              sizes={sizes}
              capacity={maxPoints}
              opacity={s.opacity || 0.7}
              roundPoints={true}
            />
          );
        })}
      </group>
    );
  }
);

ScatterPlotGPUPoints.displayName = "ScatterPlotGPU.Points";

/**
 * Regression component - renders linear regression lines using LineRenderer
 */
export interface ScatterPlotGPURegressionProps {}

const ScatterPlotGPURegression = React.forwardRef<THREE.Group, ScatterPlotGPURegressionProps>(
  (props, ref) => {
    const { series, xScale, yScale, xDomain, hiddenSeries, showRegression } =
      useScatterPlotGPU();

    if (!showRegression) return null;

    return (
      <group ref={ref}>
        {series.map((s, seriesIdx) => {
          if (s.data.length === 0 || hiddenSeries.has(seriesIdx)) return null;

          const { slope, intercept } = calculateLinearRegression(s.data);

          const x1 = xDomain[0];
          const y1 = slope * x1 + intercept;
          const x2 = xDomain[1];
          const y2 = slope * x2 + intercept;

          const points: [number, number, number][] = [
            [xScale(x1), yScale(y1), 0],
            [xScale(x2), yScale(y2), 0],
          ];

          const color =
            typeof s.color === "number"
              ? s.color
              : new THREE.Color(s.color || 0x64748b).getHex();

          return (
            <LineRenderer
              key={seriesIdx}
              points={points}
              color={color}
              width={2}
              // Note: dashed lines would require custom shader
            />
          );
        })}
      </group>
    );
  }
);

ScatterPlotGPURegression.displayName = "ScatterPlotGPU.Regression";

/**
 * Tooltip component - displays interactive tooltip (HTML overlay)
 */
export interface ScatterPlotGPUTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

const ScatterPlotGPUTooltip = React.forwardRef<HTMLDivElement, ScatterPlotGPUTooltipProps>(
  ({ className, style, ...props }, ref) => {
    const { hoveredPoint, series, xScale, yScale, xAxis, yAxis, width, height } =
      useScatterPlotGPU();

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
    const tooltipHeight = point.label ? 100 : 80;
    const offsetX = px > width / 2 ? -tooltipWidth - 10 : 10;
    const offsetY = py > height / 2 ? -tooltipHeight - 10 : 10;

    return (
      <div
        ref={ref}
        className={cn("scatter-plot-gpu-tooltip", className)}
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
        {point.label && <div style={{ marginBottom: "6px", opacity: 0.8 }}>{point.label}</div>}
        <div>
          {xAxis.label || "X"}: {xLabel}
        </div>
        <div>
          {yAxis.label || "Y"}: {yLabel}
        </div>
      </div>
    );
  }
);

ScatterPlotGPUTooltip.displayName = "ScatterPlotGPU.Tooltip";

/**
 * Interaction layer - transparent overlay for mouse events
 */
export interface ScatterPlotGPUInteractionProps extends React.HTMLAttributes<HTMLDivElement> {
  onPointHover?: (point: { seriesIdx: number; pointIdx: number } | null) => void;
  onPointClick?: (point: { seriesIdx: number; pointIdx: number }) => void;
}

const ScatterPlotGPUInteraction = React.forwardRef<
  HTMLDivElement,
  ScatterPlotGPUInteractionProps
>(({ className, style, onPointHover, onPointClick, ...props }, ref) => {
  const {
    margin,
    width,
    height,
    series,
    xScale,
    yScale,
    setHoveredPoint,
    hoveredPoint,
    snapRadius,
    hiddenSeries,
  } = useScatterPlotGPU();

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let nearestSeriesIdx = 0;
      let nearestPointIdx = 0;
      let minDist = Infinity;

      series.forEach((s, seriesIdx) => {
        if (hiddenSeries.has(seriesIdx)) return;

        s.data.forEach((point, pointIdx) => {
          const px = xScale(point.x);
          const py = yScale(point.y);
          const dist = Math.sqrt(Math.pow(px - mouseX, 2) + Math.pow(py - mouseY, 2));

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
          const point = { seriesIdx: nearestSeriesIdx, pointIdx: nearestPointIdx };
          setHoveredPoint(point);
          onPointHover?.(point);
        }
      } else if (minDist > snapRadius * 1.3) {
        if (hoveredPoint !== null) {
          setHoveredPoint(null);
          onPointHover?.(null);
        }
      }
    },
    [
      series,
      xScale,
      yScale,
      snapRadius,
      hiddenSeries,
      hoveredPoint,
      setHoveredPoint,
      onPointHover,
    ]
  );

  const handleMouseLeave = React.useCallback(() => {
    setHoveredPoint(null);
    onPointHover?.(null);
  }, [setHoveredPoint, onPointHover]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onPointClick) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let nearestSeriesIdx = 0;
      let nearestPointIdx = 0;
      let minDist = Infinity;

      series.forEach((s, seriesIdx) => {
        if (hiddenSeries.has(seriesIdx)) return;

        s.data.forEach((point, pointIdx) => {
          const px = xScale(point.x);
          const py = yScale(point.y);
          const dist = Math.sqrt(Math.pow(px - mouseX, 2) + Math.pow(py - mouseY, 2));

          if (dist < minDist) {
            minDist = dist;
            nearestSeriesIdx = seriesIdx;
            nearestPointIdx = pointIdx;
          }
        });
      });

      if (minDist < snapRadius) {
        onPointClick({ seriesIdx: nearestSeriesIdx, pointIdx: nearestPointIdx });
      }
    },
    [onPointClick, series, xScale, yScale, snapRadius, hiddenSeries]
  );

  return (
    <div
      ref={ref}
      className={cn("scatter-plot-gpu-interaction", className)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        cursor: "crosshair",
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    />
  );
});

ScatterPlotGPUInteraction.displayName = "ScatterPlotGPU.Interaction";

/**
 * Legend component - displays series legend
 */
export interface ScatterPlotGPULegendProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

const ScatterPlotGPULegend = React.forwardRef<HTMLDivElement, ScatterPlotGPULegendProps>(
  ({ className, style, interactive = false, ...props }, ref) => {
    const { series, hiddenSeries, toggleSeries } = useScatterPlotGPU();

    return (
      <div
        ref={ref}
        className={cn("scatter-plot-gpu-legend", className)}
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
          const radius = s.radius || 4;

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
              <svg width={radius * 3} height={radius * 3} style={{ flexShrink: 0 }}>
                <circle cx={radius * 1.5} cy={radius * 1.5} r={radius} fill={color} />
              </svg>
              <span style={{ color: "currentColor", opacity: 0.8 }}>{s.name}</span>
            </div>
          );
        })}
      </div>
    );
  }
);

ScatterPlotGPULegend.displayName = "ScatterPlotGPU.Legend";

// ============================================================================
// Exports
// ============================================================================

export const ScatterPlotGPU = Object.assign(ScatterPlotGPURoot, {
  Root: ScatterPlotGPURoot,
  Container: ScatterPlotGPUContainer,
  Grid: ScatterPlotGPUGrid,
  Axes: ScatterPlotGPUAxes,
  Points: ScatterPlotGPUPoints,
  Regression: ScatterPlotGPURegression,
  Tooltip: ScatterPlotGPUTooltip,
  Interaction: ScatterPlotGPUInteraction,
  Legend: ScatterPlotGPULegend,
});
