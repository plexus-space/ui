"use client";

import * as React from "react";
import {
  cn,
  getDomain,
  createScale,
  formatValue,
  formatTime,
  getTicks,
  generateSmoothPath,
  type Point,
} from "./utils";

// ============================================================================
// Types
// ============================================================================

/**
 * Series configuration for line chart data
 */
export interface Series {
  /** Display name for the series (shown in legend and tooltips) */
  name: string;
  /** Array of data points with x and y coordinates */
  data: Point[];
  /**
   * Line color in any CSS color format
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
   * Render line with dashed stroke
   * @default false
   */
  dashed?: boolean;
  /**
   * Fill area under the line with gradient
   * @default false
   */
  filled?: boolean;
}

/**
 * Axis configuration for x or y axis
 */
export interface Axis {
  /**
   * Axis label text (displayed along axis)
   * @example "Time (s)", "Altitude (km)", "Velocity (m/s)"
   */
  label?: string;
  /**
   * Domain range for axis values
   * @default "auto" (calculated from data)
   * @example [0, 100], [-50, 50]
   */
  domain?: [number, number] | "auto";
  /**
   * Data type for axis values
   * @default "number"
   */
  type?: "number" | "time";
  /**
   * Timezone for time axis formatting (IANA timezone identifier)
   * @default "UTC"
   * @example "America/New_York", "Europe/London"
   */
  timezone?: string;
  /**
   * Custom formatter function for axis tick labels
   * @example (value) => `${value.toFixed(2)} km`
   */
  formatter?: (value: number) => string;
}

/**
 * Visual variant styles for the chart
 */
export type LineChartVariant =
  | "default" // Balanced styling for general use
  | "minimal" // Minimal styling with reduced visual weight
  | "scientific" // Dense styling for data analysis
  | "dashboard"; // Polished styling for dashboards

/**
 * Props for LineChart.Root component
 */
export interface LineChartRootProps {
  /**
   * Array of data series to plot
   * @required
   */
  series: Series[];
  /**
   * X-axis configuration
   * @default { type: "number", domain: "auto" }
   */
  xAxis?: Axis;
  /**
   * Y-axis configuration
   * @default { type: "number", domain: "auto" }
   */
  yAxis?: Axis;
  /**
   * Chart width in pixels
   * @default 800
   * @example 600, 1200, 1920
   */
  width?: number;
  /**
   * Chart height in pixels
   * @default 400
   * @example 300, 600, 800
   */
  height?: number;
  /**
   * Maximum points per series before automatic decimation
   * Reduces large datasets for better performance
   * @default 2000
   * @example 1000, 5000, 10000
   */
  maxPoints?: number;
  /**
   * Enable magnetic crosshair that snaps to nearest data point
   * @default true
   */
  magneticCrosshair?: boolean;
  /**
   * Show unified tooltip with all series values at the same x-coordinate
   * When false, shows tooltip for single hovered point
   * @default false
   */
  unifiedTooltip?: boolean;
  /**
   * Visual variant style preset
   * @default "default"
   */
  variant?: LineChartVariant;
  /**
   * Snap radius in pixels for point detection during hover
   * Larger values make it easier to hover points
   * @default 40
   * @range 10-100
   */
  snapRadius?: number;
  /**
   * Enable zoom and pan interactions
   * @default false
   * @experimental Not yet implemented
   */
  enableZoom?: boolean;
  /**
   * Enable entrance animations for lines and grid
   * @default false
   */
  animate?: boolean;
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
  hoveredXIndex: number | null;
  setHoveredXIndex: (idx: number | null) => void;
  hiddenSeries: Set<number>;
  toggleSeries: (idx: number) => void;
  variant: LineChartVariant;
  animate: boolean;
  enableZoom: boolean;
  magneticCrosshair: boolean;
  unifiedTooltip: boolean;
  snapRadius: number;
}

const LineChartContext = React.createContext<LineChartContext | null>(null);

function useLineChart() {
  const ctx = React.useContext(LineChartContext);
  if (!ctx) throw new Error("useLineChart must be used within LineChart.Root");
  return ctx;
}

// ============================================================================
// Local Utilities (not generic enough for lib)
// ============================================================================

function decimateData(data: Point[], maxPoints: number): Point[] {
  if (data.length <= maxPoints) return data;
  const threshold = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % threshold === 0);
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
      unifiedTooltip = false,
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
        hoveredXIndex,
        setHoveredXIndex,
        hiddenSeries,
        toggleSeries,
        variant,
        animate,
        enableZoom,
        magneticCrosshair,
        unifiedTooltip,
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
        hoveredXIndex,
        hiddenSeries,
        toggleSeries,
        variant,
        animate,
        enableZoom,
        magneticCrosshair,
        unifiedTooltip,
        snapRadius,
      ]
    );

    return (
      <LineChartContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("line-chart", className)}
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
      </LineChartContext.Provider>
    );
  }
);

LineChartRoot.displayName = "LineChart.Root";

/**
 * Props for LineChart.Container component
 * Wraps the SVG viewport with proper dimensions and styling
 */
export interface LineChartContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Container component - wraps the SVG content
 */
const LineChartContainer = React.forwardRef<
  HTMLDivElement,
  LineChartContainerProps
>(({ className, style, children, ...props }, ref) => {
  const { height } = useLineChart();

  return (
    <div
      ref={ref}
      className={cn("line-chart-container", className)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        height: `${height}px`,
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        overflow: "visible",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

LineChartContainer.displayName = "LineChart.Container";

/**
 * Props for LineChart.Viewport component
 * SVG canvas that contains all visual elements
 */
export interface LineChartViewportProps extends React.SVGProps<SVGSVGElement> {}

/**
 * Viewport component - SVG canvas that contains all chart visual elements
 */
const LineChartViewport = React.forwardRef<
  SVGSVGElement,
  LineChartViewportProps
>(({ className, children, ...props }, ref) => {
  const { width, height } = useLineChart();

  return (
    <svg
      ref={ref}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("line-chart-svg", className)}
      style={{ display: "block", userSelect: "none", maxWidth: "100%" }}
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
 * Props for LineChart.Grid component
 * Renders horizontal and vertical grid lines
 */
export interface LineChartGridProps extends React.SVGProps<SVGGElement> {}

/**
 * Grid component - renders horizontal and vertical grid lines for the chart
 */
const LineChartGrid = React.forwardRef<SVGGElement, LineChartGridProps>(
  ({ className, ...props }, ref) => {
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
  }
);

LineChartGrid.displayName = "LineChart.Grid";

/**
 * Props for LineChart.Axes component
 * Renders X and Y axes with tick marks and labels
 */
export interface LineChartAxesProps extends React.SVGProps<SVGGElement> {}

/**
 * Axes component - renders X and Y axes with tick marks, tick labels, and axis labels
 */
const LineChartAxes = React.forwardRef<SVGGElement, LineChartAxesProps>(
  ({ className, ...props }, ref) => {
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
  }
);

LineChartAxes.displayName = "LineChart.Axes";

/**
 * Props for LineChart.Lines component
 * Renders the actual data lines for all series
 */
export interface LineChartLinesProps extends React.SVGProps<SVGGElement> {
  /**
   * Preferred renderer (auto-selects based on data size and browser support)
   * @default "auto"
   */
  renderer?: "auto" | "svg" | "webgpu";
  /**
   * Threshold for switching to WebGPU (number of total points)
   * @default 5000
   */
  webgpuThreshold?: number;
}

/**
 * Lines component - intelligently renders data lines using SVG or WebGPU
 * - Small datasets (< 5k points): SVG for universal support
 * - Large datasets (> 5k points): WebGPU for performance (if available)
 */
const LineChartLines = React.forwardRef<SVGGElement, LineChartLinesProps>(
  ({ className, renderer = "auto", webgpuThreshold = 5000, ...props }, ref) => {
    const {
      processedSeries,
      xScale,
      yScale,
      hiddenSeries,
      animate,
      width,
      height,
      margin,
      xDomain,
      yDomain,
    } = useLineChart();

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [useWebGPU, setUseWebGPU] = React.useState(false);
    const [webgpuError, setWebgpuError] = React.useState<string | null>(null);

    // Calculate total points across all series
    const totalPoints = React.useMemo(() => {
      return processedSeries.reduce(
        (sum, s) =>
          sum +
          (hiddenSeries.has(processedSeries.indexOf(s)) ? 0 : s.data.length),
        0
      );
    }, [processedSeries, hiddenSeries]);

    // Determine which renderer to use
    React.useEffect(() => {
      const shouldUseWebGPU = async () => {
        if (renderer === "svg") {
          setUseWebGPU(false);
          return;
        }

        if (renderer === "webgpu") {
          setUseWebGPU(true);
          return;
        }

        // Auto mode: check if we should use WebGPU
        if (totalPoints < webgpuThreshold) {
          setUseWebGPU(false);
          return;
        }

        // Check WebGPU support
        if (!("gpu" in navigator)) {
          console.warn(
            `[LineChart] Dataset has ${totalPoints} points (>${webgpuThreshold}), but WebGPU is not supported. Falling back to SVG.`
          );
          setUseWebGPU(false);
          return;
        }

        try {
          const adapter = await navigator.gpu?.requestAdapter();
          if (adapter) {
            console.log(
              `[LineChart] Using WebGPU renderer for ${totalPoints} points (performance mode)`
            );
            setUseWebGPU(true);
          } else {
            setUseWebGPU(false);
          }
        } catch (error) {
          console.warn("[LineChart] WebGPU initialization failed:", error);
          setWebgpuError((error as Error).message);
          setUseWebGPU(false);
        }
      };

      shouldUseWebGPU();
    }, [renderer, totalPoints, webgpuThreshold]);

    // WebGPU rendering (for large datasets)
    if (useWebGPU) {
      return (
        <>
          {/* Canvas for WebGPU rendering */}
          <foreignObject
            x={0}
            y={0}
            width={width}
            height={height}
            style={{ pointerEvents: "none" }}
          >
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </foreignObject>

          {/* WebGPU renderer component */}
          {canvasRef.current && (
            <WebGPULinesRenderer
              canvas={canvasRef.current}
              series={processedSeries}
              hiddenSeries={hiddenSeries}
              width={width}
              height={height}
              margin={margin}
              xDomain={xDomain}
              yDomain={yDomain}
            />
          )}
        </>
      );
    }

    // SVG rendering (default, for small datasets)
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
              ` L ${xScale(
                s.data[s.data.length - 1].x
              )} ${baselineY} L ${xScale(s.data[0].x)} ${baselineY} Z`
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
                      <stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity={0.02}
                      />
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
  }
);

LineChartLines.displayName = "LineChart.Lines";

// ============================================================================
// WebGPU Renderer Component (Internal)
// ============================================================================

interface WebGPULinesRendererProps {
  canvas: HTMLCanvasElement;
  series: Series[];
  hiddenSeries: Set<number>;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xDomain: [number, number];
  yDomain: [number, number];
}

function WebGPULinesRenderer({
  canvas,
  series,
  hiddenSeries,
  width,
  height,
  margin,
  xDomain,
  yDomain,
}: WebGPULinesRendererProps) {
  React.useEffect(() => {
    let mounted = true;
    let device: GPUDevice | null = null;
    let context: GPUCanvasContext | null = null;
    let pipeline: GPURenderPipeline | null = null;
    let uniformBuffer: GPUBuffer | null = null;
    let vertexBuffers: GPUBuffer[] = [];
    let animationFrameId: number | null = null;

    const initWebGPU = async () => {
      try {
        // Get WebGPU device
        if (!navigator.gpu) {
          console.error("WebGPU not supported");
          return;
        }

        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: "high-performance",
        });

        if (!adapter) {
          console.error("Failed to get WebGPU adapter");
          return;
        }

        device = await adapter.requestDevice();
        context = canvas.getContext("webgpu");

        if (!context) {
          console.error("Failed to get WebGPU context");
          return;
        }

        // Configure canvas
        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
          device,
          format,
          alphaMode: "premultiplied",
        });

        if (!mounted) return;

        // Create shader module (inlined WGSL)
        const shaderModule = device.createShaderModule({
          label: "Line Shader",
          code: `
            struct Uniforms {
              width: f32,
              height: f32,
              minX: f32,
              maxX: f32,
              minY: f32,
              maxY: f32,
              marginLeft: f32,
              marginRight: f32,
              marginTop: f32,
              marginBottom: f32,
              time: f32,
              _padding: f32,
            }

            @group(0) @binding(0) var<uniform> uniforms: Uniforms;

            struct VertexInput {
              @location(0) position: vec2f,
              @location(1) color: vec3f,
            }

            struct VertexOutput {
              @builtin(position) position: vec4f,
              @location(0) color: vec3f,
            }

            @vertex
            fn vs_main(in: VertexInput) -> VertexOutput {
              var out: VertexOutput;

              let plotWidth = uniforms.width - uniforms.marginLeft - uniforms.marginRight;
              let plotHeight = uniforms.height - uniforms.marginTop - uniforms.marginBottom;

              let normalizedX = (in.position.x - uniforms.minX) / (uniforms.maxX - uniforms.minX);
              let normalizedY = (in.position.y - uniforms.minY) / (uniforms.maxY - uniforms.minY);

              let screenX = uniforms.marginLeft + normalizedX * plotWidth;
              let screenY = uniforms.marginTop + (1.0 - normalizedY) * plotHeight;

              let ndcX = (screenX / uniforms.width) * 2.0 - 1.0;
              let ndcY = 1.0 - (screenY / uniforms.height) * 2.0;

              out.position = vec4f(ndcX, ndcY, 0.0, 1.0);
              out.color = in.color;

              return out;
            }

            @fragment
            fn fs_main(in: VertexOutput) -> @location(0) vec4f {
              return vec4f(in.color, 1.0);
            }
          `,
        });

        // Create pipeline
        pipeline = device.createRenderPipeline({
          label: "Line Render Pipeline",
          layout: "auto",
          vertex: {
            module: shaderModule,
            entryPoint: "vs_main",
            buffers: [
              {
                arrayStride: 20, // 2 floats (position) + 3 floats (color) = 20 bytes
                attributes: [
                  {
                    shaderLocation: 0,
                    offset: 0,
                    format: "float32x2", // position
                  },
                  {
                    shaderLocation: 1,
                    offset: 8,
                    format: "float32x3", // color
                  },
                ],
              },
            ],
          },
          fragment: {
            module: shaderModule,
            entryPoint: "fs_main",
            targets: [
              {
                format,
                blend: {
                  color: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                  },
                  alpha: {
                    srcFactor: "one",
                    dstFactor: "one-minus-src-alpha",
                  },
                },
              },
            ],
          },
          primitive: {
            topology: "line-strip",
            stripIndexFormat: undefined,
          },
        });

        // Create uniform buffer
        const uniformData = new Float32Array([
          width, // width
          height, // height
          xDomain[0], // minX
          xDomain[1], // maxX
          yDomain[0], // minY
          yDomain[1], // maxY
          margin.left, // marginLeft
          margin.right, // marginRight
          margin.top, // marginTop
          margin.bottom, // marginBottom
          0, // time
          0, // padding
        ]);

        uniformBuffer = device.createBuffer({
          label: "Uniform Buffer",
          size: uniformData.byteLength,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        // Create bind group
        const bindGroup = device.createBindGroup({
          label: "Bind Group",
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: { buffer: uniformBuffer },
            },
          ],
        });

        // Create vertex buffers for each series
        const seriesBuffers: Array<{
          buffer: GPUBuffer;
          vertexCount: number;
          color: [number, number, number];
        }> = [];

        series.forEach((s, idx) => {
          if (hiddenSeries.has(idx) || s.data.length === 0) return;

          // Parse color
          const color = s.color || "#64748b";
          const rgb = hexToRgb(color);

          // Create vertex data: [x, y, r, g, b, x, y, r, g, b, ...]
          const vertexData = new Float32Array(s.data.length * 5);
          s.data.forEach((point, i) => {
            const offset = i * 5;
            vertexData[offset + 0] = point.x;
            vertexData[offset + 1] = point.y;
            vertexData[offset + 2] = rgb[0];
            vertexData[offset + 3] = rgb[1];
            vertexData[offset + 4] = rgb[2];
          });

          const buffer = device.createBuffer({
            label: `Vertex Buffer ${idx}`,
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          });
          device.queue.writeBuffer(buffer, 0, vertexData);

          vertexBuffers.push(buffer);
          seriesBuffers.push({
            buffer,
            vertexCount: s.data.length,
            color: rgb,
          });
        });

        if (!mounted) return;

        console.log(
          `[WebGPU] Rendering ${
            seriesBuffers.length
          } series with ${seriesBuffers.reduce(
            (sum, s) => sum + s.vertexCount,
            0
          )} total vertices`
        );

        // Render function
        const render = () => {
          if (!mounted || !device || !context || !pipeline) return;

          const commandEncoder = device.createCommandEncoder();
          const textureView = context.getCurrentTexture().createView();

          const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [
              {
                view: textureView,
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                loadOp: "clear",
                storeOp: "store",
              },
            ],
          });

          renderPass.setPipeline(pipeline);
          renderPass.setBindGroup(0, bindGroup);

          // Draw each series
          seriesBuffers.forEach((s) => {
            renderPass.setVertexBuffer(0, s.buffer);
            renderPass.draw(s.vertexCount);
          });

          renderPass.end();
          device.queue.submit([commandEncoder.finish()]);
        };

        // Initial render
        render();
      } catch (error) {
        console.error("[WebGPU] Initialization error:", error);
      }
    };

    initWebGPU();

    return () => {
      mounted = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (device) {
        device.destroy();
      }
      vertexBuffers.forEach((buffer) => buffer.destroy());
      if (uniformBuffer) {
        uniformBuffer.destroy();
      }
    };
  }, [canvas, series, hiddenSeries, width, height, margin, xDomain, yDomain]);

  return null;
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
  // Remove # if present
  hex = hex.replace("#", "");

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return [r, g, b];
}

/**
 * Props for LineChart.Points component
 */
export interface LineChartPointsProps extends React.SVGProps<SVGGElement> {
  /**
   * Radius of point circles in pixels
   * @default 3
   * @range 1-10
   */
  radius?: number;
}

/**
 * Points component - renders individual data point markers as circles
 */
const LineChartPoints = React.forwardRef<SVGGElement, LineChartPointsProps>(
  ({ className, radius = 3, ...props }, ref) => {
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
  }
);

LineChartPoints.displayName = "LineChart.Points";

/**
 * Props for LineChart.Tooltip component
 * Displays data values on hover with crosshair
 */
export interface LineChartTooltipProps extends React.SVGProps<SVGGElement> {}

/**
 * Tooltip component - displays interactive tooltip with data values on hover
 * Shows crosshair and formatted data values for hovered points
 */
const LineChartTooltip = React.forwardRef<SVGGElement, LineChartTooltipProps>(
  ({ className, ...props }, ref) => {
    const {
      hoveredPoint,
      hoveredXIndex,
      processedSeries,
      xScale,
      yScale,
      xAxis,
      yAxis,
      width,
      height,
      margin,
      unifiedTooltip,
      hiddenSeries,
    } = useLineChart();

    // Unified tooltip mode: show all series at the same x-coordinate
    if (unifiedTooltip && hoveredXIndex !== null) {
      // Get all visible series data at this x index
      const seriesData = processedSeries
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

      // Smart positioning
      const tooltipWidth = 200;
      const lineHeight = 18;
      const tooltipHeight = 40 + seriesData.length * lineHeight;
      const offsetX = px > width / 2 ? -tooltipWidth - 15 : 15;
      const tooltipY = margin.top + 10;

      return (
        <g
          ref={ref}
          className={cn("line-chart-tooltip", className)}
          style={{ pointerEvents: "none" }}
          {...props}
        >
          {/* Vertical crosshair */}
          <line
            x1={px}
            y1={margin.top}
            x2={px}
            y2={height - margin.bottom}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="4,4"
            opacity={0.4}
          />

          {/* Point indicators for each series */}
          {seriesData.map(({ series, point }) => {
            const py = yScale(point.y);
            const color = series.color || "#64748b";
            return (
              <g key={series.name}>
                <circle
                  cx={px}
                  cy={py}
                  r={6}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  opacity={0.5}
                />
                <circle
                  cx={px}
                  cy={py}
                  r={4}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                />
              </g>
            );
          })}

          {/* Tooltip box */}
          <rect
            x={px + offsetX}
            y={tooltipY}
            width={tooltipWidth}
            height={tooltipHeight}
            rx={6}
            fill="currentColor"
            opacity={0.95}
          />

          {/* X-axis label */}
          <text
            x={px + offsetX + 10}
            y={tooltipY + 20}
            fontSize={11}
            fontWeight={600}
            fill="white"
            style={{ mixBlendMode: "difference" }}
          >
            {xAxis.label || "X"}: {xLabel}
          </text>

          {/* Series values */}
          {seriesData.map(({ series, point }, idx) => {
            const yLabel = yAxis.formatter?.(point.y) ?? formatValue(point.y);
            const color = series.color || "#64748b";
            return (
              <g key={series.name}>
                <circle
                  cx={px + offsetX + 15}
                  cy={tooltipY + 35 + idx * lineHeight}
                  r={4}
                  fill={color}
                />
                <text
                  x={px + offsetX + 25}
                  y={tooltipY + 39 + idx * lineHeight}
                  fontSize={10}
                  fill="white"
                  opacity={0.9}
                  style={{ mixBlendMode: "difference" }}
                >
                  {series.name}: {yLabel}
                </text>
              </g>
            );
          })}
        </g>
      );
    }

    // Individual tooltip mode: show single point
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
      <g
        ref={ref}
        className={cn("line-chart-tooltip", className)}
        style={{ pointerEvents: "none" }}
        {...props}
      >
        {/* Crosshair - clipped to chart area */}
        <line
          x1={px}
          y1={margin.top}
          x2={px}
          y2={height - margin.bottom}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="4,4"
          opacity={0.3}
        />
        <line
          x1={margin.left}
          y1={py}
          x2={width - margin.right}
          y2={py}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="4,4"
          opacity={0.3}
        />

        {/* Point indicator - static circles to avoid flicker */}
        <circle
          cx={px}
          cy={py}
          r={8}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.3}
        />
        <circle
          cx={px}
          cy={py}
          r={6}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.5}
        />
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
  }
);

LineChartTooltip.displayName = "LineChart.Tooltip";

/**
 * Props for LineChart.Interaction component
 * Transparent interaction layer for mouse/touch events
 */
export interface LineChartInteractionProps
  extends React.SVGProps<SVGRectElement> {}

/**
 * Interaction layer component - transparent overlay that handles mouse and touch events
 * Enables hover detection, point snapping, and tooltip triggering
 */
const LineChartInteraction = React.forwardRef<
  SVGRectElement,
  LineChartInteractionProps
>(({ className, ...props }, ref) => {
  const {
    margin,
    width,
    height,
    processedSeries,
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
  } = useLineChart();

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (!magneticCrosshair) return;

      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;

      // Use SVG coordinate transformation to handle viewBox scaling correctly
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      const mouseX = svgP.x;
      const mouseY = svgP.y;

      if (unifiedTooltip) {
        // Unified mode: find nearest x-coordinate across all visible series
        let nearestPointIdx = 0;
        let minXDist = Infinity;

        // Use first visible series to find x positions
        const firstVisibleSeries = processedSeries.find(
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

        const currentSnapRadius = snapRadius;
        const releaseRadius = snapRadius * 1.3;

        if (minXDist < currentSnapRadius) {
          if (hoveredXIndex !== nearestPointIdx) {
            setHoveredXIndex(nearestPointIdx);
          }
        } else if (minXDist > releaseRadius) {
          if (hoveredXIndex !== null) {
            setHoveredXIndex(null);
          }
        }
      } else {
        // Individual mode: find nearest point
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

        const currentSnapRadius = snapRadius;
        const releaseRadius = snapRadius * 1.3;

        if (minDist < currentSnapRadius) {
          if (
            hoveredPoint?.seriesIdx !== nearestSeriesIdx ||
            hoveredPoint?.pointIdx !== nearestPointIdx
          ) {
            setHoveredPoint({
              seriesIdx: nearestSeriesIdx,
              pointIdx: nearestPointIdx,
            });
          }
        } else if (minDist > releaseRadius) {
          if (hoveredPoint !== null) {
            setHoveredPoint(null);
          }
        }
      }
    },
    [
      magneticCrosshair,
      unifiedTooltip,
      processedSeries,
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
 * Props for LineChart.Legend component
 */
export interface LineChartLegendProps extends React.SVGProps<SVGGElement> {
  /**
   * Enable clicking legend items to toggle series visibility
   * @default false
   */
  interactive?: boolean;
}

/**
 * Legend component - displays series legend with optional click-to-toggle functionality
 */
const LineChartLegend = React.forwardRef<SVGGElement, LineChartLegendProps>(
  ({ className, interactive = false, ...props }, ref) => {
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
  }
);

LineChartLegend.displayName = "LineChart.Legend";

/**
 * Props for LineChart.Empty component
 * Displays when no data is available
 */
export interface LineChartEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Empty state component - displays placeholder when no data is available
 */
const LineChartEmpty = React.forwardRef<HTMLDivElement, LineChartEmptyProps>(
  ({ className, style, children, ...props }, ref) => {
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
  }
);

LineChartEmpty.displayName = "LineChart.Empty";

/**
 * Props for LineChart.Loading component
 * Displays loading spinner while data is being fetched
 */
export interface LineChartLoadingProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Loading state component - displays loading spinner while data is being fetched or processed
 */
const LineChartLoading = React.forwardRef<
  HTMLDivElement,
  LineChartLoadingProps
>(({ className, style, children, ...props }, ref) => {
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
        ...style,
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
