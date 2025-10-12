"use client";

import * as React from "react";
import { cn, createScale, formatValue, getTicks } from "./lib";

// ============================================================================
// Types
// ============================================================================

/**
 * Waterfall plot data point representing a value at specific X, Y, Z coordinates
 */
export interface WaterfallDataPoint {
  /** X-axis value (e.g., wavelength, frequency) */
  x: number;
  /** Y-axis value (e.g., time, position) */
  y: number;
  /** Z-axis value (e.g., intensity, magnitude) */
  z: number;
}

/**
 * Axis configuration for waterfall plot
 */
export interface WaterfallAxis {
  /**
   * Axis label text
   * @example "Wavelength (nm)", "Excitation (nm)", "Intensity"
   */
  label?: string;
  /**
   * Domain range for axis values
   * @default "auto" (calculated from data)
   * @example [0, 100], [600, 850]
   */
  domain?: [number, number] | "auto";
  /**
   * Custom formatter function for axis tick labels
   * @example (value) => `${value.toFixed(0)} nm`
   */
  formatter?: (value: number) => string;
}

/**
 * Color scale configuration for Z-value visualization
 */
export type WaterfallColorScale =
  | "viridis"
  | "plasma"
  | "inferno"
  | "magma"
  | "jet"
  | "hot"
  | "cool"
  | "turbo"
  | "rainbow";

/**
 * Visual variant styles for the waterfall plot
 */
export type WaterfallVariant =
  | "default" // Balanced styling for general use
  | "minimal" // Minimal styling with reduced visual weight
  | "scientific" // Dense styling for data analysis
  | "dashboard"; // Polished styling for dashboards

/**
 * Props for WaterfallPlot.Root component
 */
export interface WaterfallPlotRootProps {
  /**
   * Waterfall plot data points
   * @required
   */
  data: WaterfallDataPoint[];
  /**
   * X-axis configuration
   * @default { domain: "auto" }
   */
  xAxis?: WaterfallAxis;
  /**
   * Y-axis configuration
   * @default { domain: "auto" }
   */
  yAxis?: WaterfallAxis;
  /**
   * Z-axis configuration
   * @default { domain: "auto" }
   */
  zAxis?: WaterfallAxis;
  /**
   * Chart width in pixels
   * @default 800
   */
  width?: number;
  /**
   * Chart height in pixels
   * @default 500
   */
  height?: number;
  /**
   * Color scale for Z-value visualization
   * @default "jet"
   */
  colorScale?: WaterfallColorScale;
  /**
   * Visual variant style preset
   * @default "default"
   */
  variant?: WaterfallVariant;
  /**
   * Enable entrance animations
   * @default false
   */
  animate?: boolean;
  /**
   * Show color bar legend
   * @default true
   */
  showColorBar?: boolean;
  /**
   * Line width for waterfall traces
   * @default 1.5
   */
  lineWidth?: number;
  /**
   * Enable fill under curves
   * @default true
   */
  fillLines?: boolean;
  /**
   * 3D viewing angle (0-90 degrees)
   * @default 30
   */
  viewAngle?: number;
  /**
   * Horizontal rotation angle (-180 to 180 degrees)
   * @default 0
   */
  rotationAngle?: number;
  /**
   * Enable interactive rotation via mouse drag
   * @default false
   */
  enableRotation?: boolean;
  /**
   * Show grid lines on base plane
   * @default true
   */
  showGrid?: boolean;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * Child components
   */
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface WaterfallPlotContext {
  data: WaterfallDataPoint[];
  xAxis: WaterfallAxis;
  yAxis: WaterfallAxis;
  zAxis: WaterfallAxis;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  zScale: (z: number) => number;
  xDomain: [number, number];
  yDomain: [number, number];
  zDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
  zTicks: number[];
  colorScale: WaterfallColorScale;
  variant: WaterfallVariant;
  animate: boolean;
  showColorBar: boolean;
  lineWidth: number;
  fillLines: boolean;
  viewAngle: number;
  rotationAngle: number;
  enableRotation: boolean;
  showGrid: boolean;
  hoveredLine: number | null;
  setHoveredLine: (line: number | null) => void;
  setRotationAngle: (angle: number) => void;
}

const WaterfallPlotContext = React.createContext<WaterfallPlotContext | null>(
  null
);

function useWaterfallPlot() {
  const ctx = React.useContext(WaterfallPlotContext);
  if (!ctx)
    throw new Error("useWaterfallPlot must be used within WaterfallPlot.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Color scale functions
 */
const colorScales: Record<WaterfallColorScale, (t: number) => string> = {
  viridis: (t) => {
    const r = Math.floor(68 + t * (253 - 68));
    const g = Math.floor(1 + t * (231 - 1));
    const b = Math.floor(84 + t * (37 - 84));
    return `rgb(${r}, ${g}, ${b})`;
  },
  plasma: (t) => {
    const r = Math.floor(13 + t * (240 - 13));
    const g = Math.floor(8 + t * (249 - 8));
    const b = Math.floor(135 - t * 135);
    return `rgb(${r}, ${g}, ${b})`;
  },
  inferno: (t) => {
    const r = Math.floor(0 + t * 252);
    const g = Math.floor(0 + t * 255);
    const b = Math.floor(4 + t * (164 - 4));
    return `rgb(${r}, ${g}, ${b})`;
  },
  magma: (t) => {
    const r = Math.floor(0 + t * 252);
    const g = Math.floor(0 + t * 253);
    const b = Math.floor(4 + t * (191 - 4));
    return `rgb(${r}, ${g}, ${b})`;
  },
  jet: (t) => {
    const r = Math.floor(
      Math.max(0, Math.min(255, 255 * (1.5 - Math.abs(4 * t - 3))))
    );
    const g = Math.floor(
      Math.max(0, Math.min(255, 255 * (1.5 - Math.abs(4 * t - 2))))
    );
    const b = Math.floor(
      Math.max(0, Math.min(255, 255 * (1.5 - Math.abs(4 * t - 1))))
    );
    return `rgb(${r}, ${g}, ${b})`;
  },
  hot: (t) => {
    const r = Math.floor(Math.min(255, t * 3 * 255));
    const g = Math.floor(Math.max(0, Math.min(255, (t * 3 - 1) * 255)));
    const b = Math.floor(Math.max(0, (t * 3 - 2) * 255));
    return `rgb(${r}, ${g}, ${b})`;
  },
  cool: (t) => {
    const r = Math.floor(t * 255);
    const g = Math.floor((1 - t) * 255);
    const b = 255;
    return `rgb(${r}, ${g}, ${b})`;
  },
  turbo: (t) => {
    const r = Math.floor(34 + t * (251 - 34));
    const g = Math.floor(15 + t * (232 - 15));
    const b = Math.floor(143 - t * 110);
    return `rgb(${r}, ${g}, ${b})`;
  },
  rainbow: (t) => {
    const hue = t * 300; // 0 to 300 degrees (red to blue)
    const c = 1;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = 0;
    let r = 0,
      g = 0,
      b = 0;

    if (hue >= 0 && hue < 60) {
      [r, g, b] = [c, x, 0];
    } else if (hue >= 60 && hue < 120) {
      [r, g, b] = [x, c, 0];
    } else if (hue >= 120 && hue < 180) {
      [r, g, b] = [0, c, x];
    } else if (hue >= 180 && hue < 240) {
      [r, g, b] = [0, x, c];
    } else if (hue >= 240 && hue < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }

    return `rgb(${Math.floor((r + m) * 255)}, ${Math.floor(
      (g + m) * 255
    )}, ${Math.floor((b + m) * 255)})`;
  },
};

/**
 * Transform 3D coordinates to 2D using isometric projection with rotation
 * X: horizontal axis (wavelength/frequency)
 * Y: depth axis (time/position) - recedes into page
 * Z: vertical axis (intensity/magnitude)
 */
function project3D(
  x: number,
  y: number,
  z: number,
  viewAngle: number,
  rotationAngle: number
): { x: number; y: number } {
  const viewRad = (viewAngle * Math.PI) / 180;
  const rotRad = (rotationAngle * Math.PI) / 180;

  // Apply horizontal rotation around Z-axis
  const cosRot = Math.cos(rotRad);
  const sinRot = Math.sin(rotRad);
  const xRot = x * cosRot - y * sinRot;
  const yRot = x * sinRot + y * cosRot;

  // Isometric projection with view angle
  const sinView = Math.sin(viewRad);
  const projX = xRot + yRot * 0.5;
  const projY = z - yRot * sinView;

  return { x: projX, y: projY };
}

// ============================================================================
// Root Component
// ============================================================================

const WaterfallPlotRoot = React.forwardRef<
  HTMLDivElement,
  WaterfallPlotRootProps
>(
  (
    {
      data,
      xAxis = {},
      yAxis = {},
      zAxis = {},
      width = 800,
      height = 500,
      colorScale = "jet",
      variant = "default",
      animate = false,
      showColorBar = true,
      lineWidth = 1.5,
      fillLines = true,
      viewAngle = 30,
      rotationAngle: initialRotation = 0,
      enableRotation = false,
      showGrid = true,
      className,
      children,
    },
    ref
  ) => {
    const [hoveredLine, setHoveredLine] = React.useState<number | null>(null);
    const [rotationAngle, setRotationAngle] = React.useState(initialRotation);

    // Margins - increased to prevent label overlap
    const margin = React.useMemo(
      () => ({
        top: 60,
        right: showColorBar ? 120 : 80,
        bottom: 100,
        left: 100,
      }),
      [showColorBar]
    );

    // Calculate domains
    const xValues = data.map((d) => d.x);
    const yValues = data.map((d) => d.y);
    const zValues = data.map((d) => d.z);

    const xDomain: [number, number] =
      xAxis.domain === "auto" || !xAxis.domain
        ? [Math.min(...xValues), Math.max(...xValues)]
        : xAxis.domain;

    const yDomain: [number, number] =
      yAxis.domain === "auto" || !yAxis.domain
        ? [Math.min(...yValues), Math.max(...yValues)]
        : yAxis.domain;

    const zDomain: [number, number] =
      zAxis.domain === "auto" || !zAxis.domain
        ? [Math.min(...zValues), Math.max(...zValues)]
        : zAxis.domain;

    // Create scales for the 3D space
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const xScale = React.useMemo(
      () => createScale(xDomain, [0, plotWidth * 0.75]),
      [xDomain, plotWidth]
    );

    const yScale = React.useMemo(
      () => createScale(yDomain, [0, plotWidth * 0.3]),
      [yDomain, plotWidth]
    );

    const zScale = React.useMemo(
      () => createScale(zDomain, [plotHeight * 0.8, plotHeight * 0.1]), // Invert: high Z at top, with padding
      [zDomain, plotHeight]
    );

    // Generate ticks
    const xTicks = React.useMemo(() => getTicks(xDomain, 8), [xDomain]);
    const yTicks = React.useMemo(() => getTicks(yDomain, 6), [yDomain]);
    const zTicks = React.useMemo(() => getTicks(zDomain, 6), [zDomain]);

    const contextValue: WaterfallPlotContext = React.useMemo(
      () => ({
        data,
        xAxis,
        yAxis,
        zAxis,
        width,
        height,
        margin,
        xScale,
        yScale,
        zScale,
        xDomain,
        yDomain,
        zDomain,
        xTicks,
        yTicks,
        zTicks,
        colorScale,
        variant,
        animate,
        showColorBar,
        lineWidth,
        fillLines,
        viewAngle,
        rotationAngle,
        enableRotation,
        showGrid,
        hoveredLine,
        setHoveredLine,
        setRotationAngle,
      }),
      [
        data,
        xAxis,
        yAxis,
        zAxis,
        width,
        height,
        margin,
        xScale,
        yScale,
        zScale,
        xDomain,
        yDomain,
        zDomain,
        xTicks,
        yTicks,
        zTicks,
        colorScale,
        variant,
        animate,
        showColorBar,
        lineWidth,
        fillLines,
        viewAngle,
        rotationAngle,
        enableRotation,
        showGrid,
        hoveredLine,
      ]
    );

    return (
      <WaterfallPlotContext.Provider value={contextValue}>
        <div ref={ref} className={cn("waterfall-plot", className)}>
          {children}
        </div>
      </WaterfallPlotContext.Provider>
    );
  }
);

WaterfallPlotRoot.displayName = "WaterfallPlot.Root";

// ============================================================================
// Container Component
// ============================================================================

export interface WaterfallPlotContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const WaterfallPlotContainer = React.forwardRef<
  HTMLDivElement,
  WaterfallPlotContainerProps
>(({ className, style, children, ...props }, ref) => {
  const { height } = useWaterfallPlot();

  return (
    <div
      ref={ref}
      className={cn("waterfall-plot-container", className)}
      style={{
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

WaterfallPlotContainer.displayName = "WaterfallPlot.Container";

// ============================================================================
// Viewport Component
// ============================================================================

export interface WaterfallPlotViewportProps
  extends React.SVGProps<SVGSVGElement> {}

const WaterfallPlotViewport = React.forwardRef<
  SVGSVGElement,
  WaterfallPlotViewportProps
>(({ className, children, ...props }, ref) => {
  const { width, height } = useWaterfallPlot();

  return (
    <svg
      ref={ref}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("waterfall-plot-svg", className)}
      role="img"
      aria-label="Waterfall Plot"
      {...props}
    >
      {children}
    </svg>
  );
});

WaterfallPlotViewport.displayName = "WaterfallPlot.Viewport";

// ============================================================================
// Axes Component
// ============================================================================

export interface WaterfallPlotAxesProps extends React.SVGProps<SVGGElement> {}

const WaterfallPlotAxes = React.forwardRef<SVGGElement, WaterfallPlotAxesProps>(
  ({ className, ...props }, ref) => {
    const {
      xTicks,
      yTicks,
      zTicks,
      xScale,
      yScale,
      zScale,
      xDomain,
      yDomain,
      zDomain,
      margin,
      xAxis,
      yAxis,
      zAxis,
      viewAngle,
      rotationAngle,
    } = useWaterfallPlot();

    const formatTick = (value: number, axis: WaterfallAxis): string => {
      if (axis.formatter) return axis.formatter(value);

      // Smarter formatting to avoid overlaps
      const absValue = Math.abs(value);
      if (absValue >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (absValue >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
      if (absValue >= 100) return value.toFixed(0);
      if (absValue >= 1) return value.toFixed(1);
      if (absValue > 0) return value.toFixed(2);
      return "0";
    };

    // Project axis endpoints to box corners
    const origin = project3D(
      0,
      0,
      zScale(zDomain[0]),
      viewAngle,
      rotationAngle
    );

    const xAxisStart = origin;
    const xAxisEnd = project3D(
      xScale(xDomain[1]),
      0,
      zScale(zDomain[0]),
      viewAngle,
      rotationAngle
    );

    const yAxisStart = origin;
    const yAxisEnd = project3D(
      0,
      yScale(yDomain[1]),
      zScale(zDomain[0]),
      viewAngle,
      rotationAngle
    );

    const zAxisStart = origin;
    const zAxisEnd = project3D(
      0,
      0,
      zScale(zDomain[1]),
      viewAngle,
      rotationAngle
    );

    return (
      <g ref={ref} className={cn("waterfall-plot-axes", className)} {...props}>
        {/* X-axis */}
        <line
          x1={margin.left + xAxisStart.x}
          y1={margin.top + xAxisStart.y}
          x2={margin.left + xAxisEnd.x}
          y2={margin.top + xAxisEnd.y}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.3}
        />
        {xTicks.map((tick, i) => {
          const pos = project3D(
            xScale(tick),
            0,
            zScale(zDomain[0]),
            viewAngle,
            rotationAngle
          );
          return (
            <g key={`xtick-${i}`}>
              <line
                x1={margin.left + pos.x}
                y1={margin.top + pos.y}
                x2={margin.left + pos.x}
                y2={margin.top + pos.y + 6}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.3}
              />
              <text
                x={margin.left + pos.x}
                y={margin.top + pos.y + 20}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
                opacity={0.6}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatTick(tick, xAxis)}
              </text>
            </g>
          );
        })}
        {xAxis.label && (
          <text
            x={margin.left + (xAxisStart.x + xAxisEnd.x) / 2}
            y={margin.top + Math.max(xAxisStart.y, xAxisEnd.y) + 45}
            textAnchor="middle"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
            opacity={0.7}
          >
            {xAxis.label}
          </text>
        )}

        {/* Z-axis - positioned on the left side */}
        <line
          x1={margin.left + zAxisStart.x}
          y1={margin.top + zAxisStart.y}
          x2={margin.left + zAxisEnd.x}
          y2={margin.top + zAxisEnd.y}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.3}
        />
        {zTicks.map((tick, i) => {
          const pos = project3D(0, 0, zScale(tick), viewAngle, rotationAngle);
          return (
            <g key={`ztick-${i}`}>
              <line
                x1={margin.left + pos.x}
                y1={margin.top + pos.y}
                x2={margin.left + pos.x - 6}
                y2={margin.top + pos.y}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.3}
              />
              <text
                x={margin.left + pos.x - 10}
                y={margin.top + pos.y + 4}
                textAnchor="end"
                fontSize={10}
                fill="currentColor"
                opacity={0.6}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatTick(tick, zAxis)}
              </text>
            </g>
          );
        })}
        {zAxis.label && (
          <text
            x={20}
            y={margin.top + (zAxisStart.y + zAxisEnd.y) / 2}
            textAnchor="middle"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
            opacity={0.7}
            transform={`rotate(-90 20 ${
              margin.top + (zAxisStart.y + zAxisEnd.y) / 2
            })`}
          >
            {zAxis.label}
          </text>
        )}

        {/* Y-axis - positioned on the right side */}
        <line
          x1={margin.left + yAxisStart.x}
          y1={margin.top + yAxisStart.y}
          x2={margin.left + yAxisEnd.x}
          y2={margin.top + yAxisEnd.y}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.3}
        />
        {yTicks.map((tick, i) => {
          // Project to right side of the plot
          const rightEdgeX = xScale(xDomain[1]);
          const pos = project3D(
            rightEdgeX,
            yScale(tick),
            zScale(zDomain[0]),
            viewAngle,
            rotationAngle
          );
          return (
            <g key={`ytick-${i}`}>
              <line
                x1={margin.left + pos.x}
                y1={margin.top + pos.y}
                x2={margin.left + pos.x + 6}
                y2={margin.top + pos.y}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.3}
              />
              <text
                x={margin.left + pos.x + 10}
                y={margin.top + pos.y + 4}
                textAnchor="start"
                fontSize={10}
                fill="currentColor"
                opacity={0.6}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatTick(tick, yAxis)}
              </text>
            </g>
          );
        })}
        {yAxis.label && (
          <text
            x={
              margin.left +
              project3D(
                xScale(xDomain[1]),
                yScale(yDomain[1]),
                zScale(zDomain[0]),
                viewAngle,
                rotationAngle
              ).x +
              15
            }
            y={
              margin.top +
              project3D(
                xScale(xDomain[1]),
                yScale(yDomain[1]),
                zScale(zDomain[0]),
                viewAngle,
                rotationAngle
              ).y -
              10
            }
            textAnchor="start"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
            opacity={0.7}
          >
            {yAxis.label}
          </text>
        )}
      </g>
    );
  }
);

WaterfallPlotAxes.displayName = "WaterfallPlot.Axes";

// ============================================================================
// Grid Component
// ============================================================================

export interface WaterfallPlotGridProps extends React.SVGProps<SVGGElement> {}

const WaterfallPlotGrid = React.forwardRef<SVGGElement, WaterfallPlotGridProps>(
  ({ className, ...props }, ref) => {
    const {
      xTicks,
      yTicks,
      xScale,
      yScale,
      zScale,
      xDomain,
      yDomain,
      zDomain,
      margin,
      viewAngle,
      rotationAngle,
      showGrid,
    } = useWaterfallPlot();

    if (!showGrid) return null;

    return (
      <g ref={ref} className={cn("waterfall-plot-grid", className)} {...props}>
        {/* X grid lines (parallel to X-axis) */}
        {yTicks.map((yTick, i) => {
          const start = project3D(
            0,
            yScale(yTick),
            zScale(zDomain[0]),
            viewAngle,
            rotationAngle
          );
          const end = project3D(
            xScale(xDomain[1]),
            yScale(yTick),
            zScale(zDomain[0]),
            viewAngle,
            rotationAngle
          );

          return (
            <line
              key={`xgrid-${i}`}
              x1={margin.left + start.x}
              y1={margin.top + start.y}
              x2={margin.left + end.x}
              y2={margin.top + end.y}
              stroke="currentColor"
              strokeWidth={0.5}
              opacity={0.1}
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Y grid lines (parallel to Y-axis) */}
        {xTicks.map((xTick, i) => {
          const start = project3D(
            xScale(xTick),
            0,
            zScale(zDomain[0]),
            viewAngle,
            rotationAngle
          );
          const end = project3D(
            xScale(xTick),
            yScale(yDomain[1]),
            zScale(zDomain[0]),
            viewAngle,
            rotationAngle
          );

          return (
            <line
              key={`ygrid-${i}`}
              x1={margin.left + start.x}
              y1={margin.top + start.y}
              x2={margin.left + end.x}
              y2={margin.top + end.y}
              stroke="currentColor"
              strokeWidth={0.5}
              opacity={0.1}
              strokeDasharray="2,2"
            />
          );
        })}
      </g>
    );
  }
);

WaterfallPlotGrid.displayName = "WaterfallPlot.Grid";

// ============================================================================
// Box Component
// ============================================================================

export interface WaterfallPlotBoxProps extends React.SVGProps<SVGGElement> {}

const WaterfallPlotBox = React.forwardRef<SVGGElement, WaterfallPlotBoxProps>(
  ({ className, ...props }, ref) => {
    const {
      xScale,
      yScale,
      zScale,
      xDomain,
      yDomain,
      zDomain,
      margin,
      viewAngle,
      rotationAngle,
    } = useWaterfallPlot();

    // Define the 8 corners of the 3D box
    const corners = {
      // Bottom corners
      bottomNearLeft: project3D(
        0,
        0,
        zScale(zDomain[0]),
        viewAngle,
        rotationAngle
      ),
      bottomNearRight: project3D(
        xScale(xDomain[1]),
        0,
        zScale(zDomain[0]),
        viewAngle,
        rotationAngle
      ),
      bottomFarLeft: project3D(
        0,
        yScale(yDomain[1]),
        zScale(zDomain[0]),
        viewAngle,
        rotationAngle
      ),
      bottomFarRight: project3D(
        xScale(xDomain[1]),
        yScale(yDomain[1]),
        zScale(zDomain[0]),
        viewAngle,
        rotationAngle
      ),
      // Top corners
      topNearLeft: project3D(
        0,
        0,
        zScale(zDomain[1]),
        viewAngle,
        rotationAngle
      ),
      topNearRight: project3D(
        xScale(xDomain[1]),
        0,
        zScale(zDomain[1]),
        viewAngle,
        rotationAngle
      ),
      topFarLeft: project3D(
        0,
        yScale(yDomain[1]),
        zScale(zDomain[1]),
        viewAngle,
        rotationAngle
      ),
      topFarRight: project3D(
        xScale(xDomain[1]),
        yScale(yDomain[1]),
        zScale(zDomain[1]),
        viewAngle,
        rotationAngle
      ),
    };

    // Back wall (left side)
    const leftWallPath = [
      `M ${margin.left + corners.bottomNearLeft.x} ${
        margin.top + corners.bottomNearLeft.y
      }`,
      `L ${margin.left + corners.bottomFarLeft.x} ${
        margin.top + corners.bottomFarLeft.y
      }`,
      `L ${margin.left + corners.topFarLeft.x} ${
        margin.top + corners.topFarLeft.y
      }`,
      `L ${margin.left + corners.topNearLeft.x} ${
        margin.top + corners.topNearLeft.y
      }`,
      `Z`,
    ].join(" ");

    // Back wall (rear)
    const rearWallPath = [
      `M ${margin.left + corners.bottomFarLeft.x} ${
        margin.top + corners.bottomFarLeft.y
      }`,
      `L ${margin.left + corners.bottomFarRight.x} ${
        margin.top + corners.bottomFarRight.y
      }`,
      `L ${margin.left + corners.topFarRight.x} ${
        margin.top + corners.topFarRight.y
      }`,
      `L ${margin.left + corners.topFarLeft.x} ${
        margin.top + corners.topFarLeft.y
      }`,
      `Z`,
    ].join(" ");

    // Floor
    const floorPath = [
      `M ${margin.left + corners.bottomNearLeft.x} ${
        margin.top + corners.bottomNearLeft.y
      }`,
      `L ${margin.left + corners.bottomNearRight.x} ${
        margin.top + corners.bottomNearRight.y
      }`,
      `L ${margin.left + corners.bottomFarRight.x} ${
        margin.top + corners.bottomFarRight.y
      }`,
      `L ${margin.left + corners.bottomFarLeft.x} ${
        margin.top + corners.bottomFarLeft.y
      }`,
      `Z`,
    ].join(" ");

    return (
      <g ref={ref} className={cn("waterfall-plot-box", className)} {...props}>
        {/* Floor plane */}
        <path
          d={floorPath}
          fill="currentColor"
          opacity={0.02}
          stroke="currentColor"
          strokeWidth={1}
          strokeOpacity={0.1}
        />

        {/* Left wall */}
        <path
          d={leftWallPath}
          fill="url(#leftWallGradient)"
          opacity={0.4}
          stroke="currentColor"
          strokeWidth={1}
          strokeOpacity={0.2}
        />

        {/* Rear wall */}
        <path
          d={rearWallPath}
          fill="url(#rearWallGradient)"
          opacity={0.4}
          stroke="currentColor"
          strokeWidth={1}
          strokeOpacity={0.2}
        />

        {/* Box frame edges */}
        {/* Bottom edges */}
        <line
          x1={margin.left + corners.bottomNearLeft.x}
          y1={margin.top + corners.bottomNearLeft.y}
          x2={margin.left + corners.bottomNearRight.x}
          y2={margin.top + corners.bottomNearRight.y}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.3}
        />
        <line
          x1={margin.left + corners.bottomNearRight.x}
          y1={margin.top + corners.bottomNearRight.y}
          x2={margin.left + corners.bottomFarRight.x}
          y2={margin.top + corners.bottomFarRight.y}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.3}
        />
        <line
          x1={margin.left + corners.bottomFarRight.x}
          y1={margin.top + corners.bottomFarRight.y}
          x2={margin.left + corners.bottomFarLeft.x}
          y2={margin.top + corners.bottomFarLeft.y}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.3}
        />

        {/* Top edges */}
        <line
          x1={margin.left + corners.topNearLeft.x}
          y1={margin.top + corners.topNearLeft.y}
          x2={margin.left + corners.topNearRight.x}
          y2={margin.top + corners.topNearRight.y}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.3}
        />
        <line
          x1={margin.left + corners.topNearRight.x}
          y1={margin.top + corners.topNearRight.y}
          x2={margin.left + corners.topFarRight.x}
          y2={margin.top + corners.topFarRight.y}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.3}
        />
        <line
          x1={margin.left + corners.topFarRight.x}
          y1={margin.top + corners.topFarRight.y}
          x2={margin.left + corners.topFarLeft.x}
          y2={margin.top + corners.topFarLeft.y}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.3}
        />

        {/* Right edge (front-right) - already drawn by Z-axis */}

        <defs>
          <linearGradient
            id="leftWallGradient"
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.03} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0.08} />
          </linearGradient>
          <linearGradient
            id="rearWallGradient"
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.03} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0.08} />
          </linearGradient>
        </defs>
      </g>
    );
  }
);

WaterfallPlotBox.displayName = "WaterfallPlot.Box";

// ============================================================================
// Lines Component
// ============================================================================

export interface WaterfallPlotLinesProps extends React.SVGProps<SVGGElement> {}

const WaterfallPlotLines = React.forwardRef<
  SVGGElement,
  WaterfallPlotLinesProps
>(({ className, ...props }, ref) => {
  const {
    data,
    xScale,
    yScale,
    zScale,
    margin,
    colorScale: colorScaleName,
    yDomain,
    zDomain,
    lineWidth,
    fillLines,
    viewAngle,
    rotationAngle,
    animate,
    hoveredLine,
    setHoveredLine,
  } = useWaterfallPlot();

  // Group data by Y value (each Y value is a separate line)
  const lines = React.useMemo(() => {
    const lineMap = new Map<number, WaterfallDataPoint[]>();
    data.forEach((point) => {
      if (!lineMap.has(point.y)) {
        lineMap.set(point.y, []);
      }
      lineMap.get(point.y)!.push(point);
    });

    // Sort points within each line by X
    lineMap.forEach((points) => {
      points.sort((a, b) => a.x - b.x);
    });

    // Convert to array and sort by Y (back to front for proper occlusion)
    return Array.from(lineMap.entries())
      .map(([y, points]) => ({ y, points }))
      .sort((a, b) => b.y - a.y); // Back to front
  }, [data]);

  return (
    <g ref={ref} className={cn("waterfall-plot-lines", className)} {...props}>
      <defs>
        {lines.map((line, lineIdx) => {
          const gradientId = `line-gradient-${lineIdx}`;
          return (
            <linearGradient
              key={gradientId}
              id={gradientId}
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="currentColor" stopOpacity={0} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.3} />
            </linearGradient>
          );
        })}
      </defs>

      {lines.map((line, lineIdx) => {
        const yNorm = (line.y - yDomain[0]) / (yDomain[1] - yDomain[0]);
        const lineColor = colorScales[colorScaleName](yNorm);
        const isHovered = hoveredLine === lineIdx;

        // Generate path for the line
        const pathData = line.points
          .map((point, i) => {
            const pos3D = project3D(
              xScale(point.x),
              yScale(point.y),
              zScale(point.z),
              viewAngle,
              rotationAngle
            );
            const x = margin.left + pos3D.x;
            const y = margin.top + pos3D.y;
            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
          })
          .join(" ");

        // Generate fill path (close to baseline at Z=0)
        let fillPath = "";
        if (fillLines) {
          const baseline = line.points.map((point) => {
            const pos3D = project3D(
              xScale(point.x),
              yScale(point.y),
              zScale(zDomain[0]), // Baseline at minimum Z
              viewAngle,
              rotationAngle
            );
            return { x: margin.left + pos3D.x, y: margin.top + pos3D.y };
          });

          fillPath =
            pathData +
            " " +
            baseline
              .reverse()
              .map((p, i) => (i === 0 ? `L ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
              .join(" ") +
            " Z";
        }

        return (
          <g
            key={lineIdx}
            onMouseEnter={() => setHoveredLine(lineIdx)}
            onMouseLeave={() => setHoveredLine(null)}
            style={{
              cursor: "pointer",
              transition: "opacity 0.15s ease",
              ...(animate
                ? {
                    animation: `fadeIn 0.6s ease ${lineIdx * 0.05}s forwards`,
                    opacity: 0,
                  }
                : undefined),
            }}
          >
            {/* Fill */}
            {fillLines && (
              <path
                d={fillPath}
                fill={lineColor}
                opacity={isHovered ? 0.4 : 0.25}
                style={{ transition: "opacity 0.15s ease" }}
              />
            )}

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke={lineColor}
              strokeWidth={isHovered ? lineWidth * 1.5 : lineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isHovered ? 1 : 0.9}
              style={{ transition: "all 0.15s ease" }}
            />
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
});

WaterfallPlotLines.displayName = "WaterfallPlot.Lines";

// ============================================================================
// ColorBar Component
// ============================================================================

export interface WaterfallPlotColorBarProps
  extends React.SVGProps<SVGGElement> {}

const WaterfallPlotColorBar = React.forwardRef<
  SVGGElement,
  WaterfallPlotColorBarProps
>(({ className, ...props }, ref) => {
  const {
    width,
    margin,
    height,
    yDomain,
    yAxis,
    colorScale: colorScaleName,
    showColorBar,
  } = useWaterfallPlot();

  if (!showColorBar) return null;

  const barWidth = 20;
  const plotHeight = height - margin.top - margin.bottom;
  const barHeight = plotHeight * 0.7; // Match the actual data height (70% of plot)
  const barX = width - margin.right + 20;
  const barY = margin.top + plotHeight * 0.1; // Start at 10% to match data offset
  const steps = 100;

  return (
    <g
      ref={ref}
      className={cn("waterfall-plot-colorbar", className)}
      {...props}
    >
      {/* Color gradient */}
      <defs>
        <linearGradient
          id="waterfall-colorbar-gradient"
          x1="0%"
          y1="100%"
          x2="0%"
          y2="0%"
        >
          {Array.from({ length: steps }, (_, i) => {
            const t = i / (steps - 1);
            const color = colorScales[colorScaleName](t);
            return <stop key={i} offset={`${t * 100}%`} stopColor={color} />;
          })}
        </linearGradient>
      </defs>

      {/* Bar */}
      <rect
        x={barX}
        y={barY}
        width={barWidth}
        height={barHeight}
        fill="url(#waterfall-colorbar-gradient)"
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.2}
        rx={2}
      />

      {/* Labels */}
      {[yDomain[1], (yDomain[0] + yDomain[1]) / 2, yDomain[0]].map(
        (value, i) => {
          const y = barY + (i * barHeight) / 2;
          const label = yAxis.formatter
            ? yAxis.formatter(value)
            : formatValue(value);

          return (
            <text
              key={i}
              x={barX + barWidth + 8}
              y={y + 4}
              fontSize={9}
              fill="currentColor"
              opacity={0.6}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {label}
            </text>
          );
        }
      )}

      {/* Title */}
      <text
        x={barX + barWidth / 2}
        y={barY - 10}
        textAnchor="middle"
        fontSize={10}
        fontWeight={500}
        fill="currentColor"
        opacity={0.7}
      >
        {yAxis.label || "Y"}
      </text>
    </g>
  );
});

WaterfallPlotColorBar.displayName = "WaterfallPlot.ColorBar";

// ============================================================================
// Tooltip Component
// ============================================================================

export interface WaterfallPlotTooltipProps
  extends React.SVGProps<SVGGElement> {}

const WaterfallPlotTooltip = React.forwardRef<
  SVGGElement,
  WaterfallPlotTooltipProps
>(({ className, ...props }, ref) => {
  const {
    hoveredLine,
    data,
    xScale,
    yScale,
    zScale,
    margin,
    xAxis,
    yAxis,
    zAxis,
    viewAngle,
    rotationAngle,
    width,
    height,
  } = useWaterfallPlot();

  if (hoveredLine === null) return null;

  // Group data by Y to get the hovered line
  const lineMap = new Map<number, WaterfallDataPoint[]>();
  data.forEach((point) => {
    if (!lineMap.has(point.y)) {
      lineMap.set(point.y, []);
    }
    lineMap.get(point.y)!.push(point);
  });

  const lines = Array.from(lineMap.entries())
    .map(([y, points]) => ({ y, points }))
    .sort((a, b) => b.y - a.y);

  const line = lines[hoveredLine];
  if (!line) return null;

  // Use the maximum Z value in the line for tooltip positioning
  const maxZPoint = line.points.reduce(
    (max, point) => (point.z > max.z ? point : max),
    line.points[0]
  );

  const pos3D = project3D(
    xScale(maxZPoint.x),
    yScale(maxZPoint.y),
    zScale(maxZPoint.z),
    viewAngle,
    rotationAngle
  );
  const px = margin.left + pos3D.x;
  const py = margin.top + pos3D.y;

  const yLabel = yAxis.formatter?.(line.y) ?? formatValue(line.y);
  const yAxisLabel = yAxis.label || "Y";

  // Smart positioning to keep tooltip visible
  const tooltipWidth = 140;
  const tooltipHeight = 60;
  const offsetX = px > width - tooltipWidth - 40 ? -tooltipWidth - 10 : 10;
  const offsetY = py < tooltipHeight + 40 ? 10 : -tooltipHeight - 10;

  return (
    <g
      ref={ref}
      className={cn("waterfall-plot-tooltip", className)}
      style={{ pointerEvents: "none" }}
      {...props}
    >
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
        y={py + offsetY + 25}
        fontSize={11}
        fontWeight={600}
        fill="white"
        style={{ mixBlendMode: "difference" }}
      >
        {`${yAxisLabel}: ${yLabel}`}
      </text>

      <text
        x={px + offsetX + 10}
        y={py + offsetY + 42}
        fontSize={10}
        fill="white"
        opacity={0.8}
        style={{ mixBlendMode: "difference" }}
      >
        {`${line.points.length} points`}
      </text>
    </g>
  );
});

WaterfallPlotTooltip.displayName = "WaterfallPlot.Tooltip";

// ============================================================================
// Crosshairs Component
// ============================================================================

export interface WaterfallPlotCrosshairsProps
  extends React.SVGProps<SVGGElement> {}

const WaterfallPlotCrosshairs = React.forwardRef<
  SVGGElement,
  WaterfallPlotCrosshairsProps
>(({ className, ...props }, ref) => {
  const {
    hoveredLine,
    data,
    xScale,
    yScale,
    zScale,
    margin,
    viewAngle,
    rotationAngle,
    width,
    height,
    xDomain,
    zDomain,
  } = useWaterfallPlot();

  if (hoveredLine === null) return null;

  // Group data by Y to get the hovered line
  const lineMap = new Map<number, WaterfallDataPoint[]>();
  data.forEach((point) => {
    if (!lineMap.has(point.y)) {
      lineMap.set(point.y, []);
    }
    lineMap.get(point.y)!.push(point);
  });

  const lines = Array.from(lineMap.entries())
    .map(([y, points]) => ({ y, points }))
    .sort((a, b) => b.y - a.y);

  const line = lines[hoveredLine];
  if (!line) return null;

  // Draw crosshair lines for the hovered Y value
  const yValue = line.y;

  // Draw a line along the Y-axis at this Y value
  const startPoint = project3D(
    0,
    yScale(yValue),
    zScale(zDomain[0]),
    viewAngle,
    rotationAngle
  );
  const endPoint = project3D(
    xScale(xDomain[1]),
    yScale(yValue),
    zScale(zDomain[0]),
    viewAngle,
    rotationAngle
  );

  return (
    <g
      ref={ref}
      className={cn("waterfall-plot-crosshairs", className)}
      style={{ pointerEvents: "none" }}
      {...props}
    >
      {/* Horizontal crosshair line */}
      <line
        x1={margin.left + startPoint.x}
        y1={margin.top + startPoint.y}
        x2={margin.left + endPoint.x}
        y2={margin.top + endPoint.y}
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth={1.5}
        strokeDasharray="4,4"
      />
    </g>
  );
});

WaterfallPlotCrosshairs.displayName = "WaterfallPlot.Crosshairs";

// ============================================================================
// Empty Component
// ============================================================================

export interface WaterfallPlotEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const WaterfallPlotEmpty = React.forwardRef<
  HTMLDivElement,
  WaterfallPlotEmptyProps
>(({ className, style, children, ...props }, ref) => {
  const { width, height } = useWaterfallPlot();

  return (
    <div
      ref={ref}
      className={cn("waterfall-plot-empty", className)}
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
        ...style,
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
            <path
              d="M3 20 L6 16 L9 18 L12 14 L15 17 L18 12 L21 15"
              strokeWidth="2"
            />
            <path
              d="M3 16 L6 12 L9 14 L12 10 L15 13 L18 8 L21 11"
              strokeWidth="2"
            />
            <path
              d="M3 12 L6 8 L9 10 L12 6 L15 9 L18 4 L21 7"
              strokeWidth="2"
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

WaterfallPlotEmpty.displayName = "WaterfallPlot.Empty";

// ============================================================================
// Exports
// ============================================================================

export const WaterfallPlot = Object.assign(WaterfallPlotRoot, {
  Root: WaterfallPlotRoot,
  Container: WaterfallPlotContainer,
  Viewport: WaterfallPlotViewport,
  Box: WaterfallPlotBox,
  Axes: WaterfallPlotAxes,
  Grid: WaterfallPlotGrid,
  Lines: WaterfallPlotLines,
  ColorBar: WaterfallPlotColorBar,
  Tooltip: WaterfallPlotTooltip,
  Crosshairs: WaterfallPlotCrosshairs,
  Empty: WaterfallPlotEmpty,
});
