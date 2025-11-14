"use client";

import * as React from "react";

// ============================================================================
// Shared Types
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Axis {
  label?: string;
  domain?: [number, number] | "auto";
  type?: "number" | "time";
  formatter?: (value: number) => string;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface HoveredPoint {
  seriesIdx: number;
  pointIdx: number;
  screenX: number;
  screenY: number;
  data?: any; // Chart-specific data
}

export interface TooltipData {
  title: string;
  items: { label: string; value: string; color?: string }[];
}

// Time series state
export interface TimeSeriesState {
  isPlaying: boolean;
  currentTime: number;
  startTime: number;
  endTime: number;
  playbackSpeed: number;
}

// ============================================================================
// Base Chart Context
// ============================================================================

export interface BaseChartContext {
  // Dimensions
  width: number;
  height: number;
  margin: Margin;
  devicePixelRatio: number; // Unified DPR for all chart components

  // Axes
  xAxis: Axis;
  yAxis: Axis;
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];

  // Scales
  xScale: (x: number) => number;
  yScale: (y: number) => number;

  // Refs
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  overlayRef: React.RefObject<HTMLCanvasElement | null>;

  // GPU preference
  preferWebGPU: boolean;
  renderMode: "webgpu" | "webgl" | null;
  setRenderMode: (mode: "webgpu" | "webgl" | null) => void;
  gpuDevice: GPUDevice | null; // WebGPU device if available

  // Interaction state
  hoveredPoint: HoveredPoint | null;
  setHoveredPoint: (point: HoveredPoint | null) => void;

  // Tooltip data (chart-specific)
  tooltipData: TooltipData | null;
  setTooltipData: (data: TooltipData | null) => void;

  // Time series
  timeSeriesState: TimeSeriesState | null;
  setTimeSeriesState: React.Dispatch<
    React.SetStateAction<TimeSeriesState | null>
  >;
}

const BaseChartContext = React.createContext<BaseChartContext | null>(null);

export function useBaseChart() {
  const ctx = React.useContext(BaseChartContext);
  if (!ctx) {
    throw new Error("Chart components must be used within Chart.Root");
  }
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

export function getDomain(
  points: Point[],
  accessor: (p: Point) => number,
  paddingPercent: number = 0.05
): [number, number] {
  if (points.length === 0) return [0, 1];

  let min = accessor(points[0]);
  let max = accessor(points[0]);

  for (const point of points) {
    const value = accessor(point);
    if (value < min) min = value;
    if (value > max) max = value;
  }

  // Use configurable padding on each side, but don't go below 0 for positive data
  const range = max - min;
  const padding = range * paddingPercent || 1;

  const domainMin = min >= 0 ? Math.max(0, min - padding) : min - padding;
  const domainMax = max + padding;

  return [domainMin, domainMax];
}

export function getTicks(domain: [number, number], count: number): number[] {
  const [min, max] = domain;
  const step = (max - min) / (count - 1);
  const ticks: number[] = [];

  for (let i = 0; i < count; i++) {
    ticks.push(min + step * i);
  }

  return ticks;
}

export function formatValue(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(1);
}

export function hexToRgb(color: string): [number, number, number] {
  // Handle rgb(r, g, b) format
  const rgbMatch = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i.exec(color);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]) / 255,
      parseInt(rgbMatch[2]) / 255,
      parseInt(rgbMatch[3]) / 255,
    ];
  }

  // Handle hex format
  const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  return hexMatch
    ? [
        parseInt(hexMatch[1], 16) / 255,
        parseInt(hexMatch[2], 16) / 255,
        parseInt(hexMatch[3], 16) / 255,
      ]
    : [0, 0, 1];
}

// ============================================================================
// Base Renderer Types & Factory Functions
// ============================================================================

export interface RendererProps {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  margin: Margin;
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
  showGrid: boolean;
}

export interface WebGLRenderer<TProps extends RendererProps = RendererProps> {
  render: (props: TProps) => void;
  destroy: () => void;
  getGL: () => WebGL2RenderingContext;
  getProgram: () => WebGLProgram | null;
}

export interface WebGLRendererConfig<
  TProps extends RendererProps = RendererProps
> {
  canvas: HTMLCanvasElement;
  createShaders: (gl: WebGL2RenderingContext) => {
    vertexSource: string;
    fragmentSource: string;
  };
  onRender: (
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    props: TProps
  ) => void;
  onDestroy?: (
    gl: WebGL2RenderingContext,
    program: WebGLProgram | null
  ) => void;
}

export function createWebGLRenderer<
  TProps extends RendererProps = RendererProps
>(config: WebGLRendererConfig<TProps>): WebGLRenderer<TProps> {
  const gl = config.canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
  });

  if (!gl) {
    throw new Error("WebGL2 not supported");
  }

  const createShader = (type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const createProgram = (
    vertexSource: string,
    fragmentSource: string
  ): WebGLProgram => {
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) {
      throw new Error("Failed to create shaders");
    }

    const program = gl.createProgram();
    if (!program) throw new Error("Failed to create program");

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      throw new Error("Failed to link program");
    }

    return program;
  };

  const setupBlending = () => {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  };

  const clear = (width: number, height: number) => {
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0); // Transparent
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  // Initialize program
  const { vertexSource, fragmentSource } = config.createShaders(gl);
  const program = createProgram(vertexSource, fragmentSource);
  setupBlending();

  return {
    render: (props: TProps) => {
      clear(props.width, props.height);
      config.onRender(gl, program, props);
    },
    destroy: () => {
      if (config.onDestroy) {
        config.onDestroy(gl, program);
      }
      if (program) {
        gl.deleteProgram(program);
      }
    },
    getGL: () => gl,
    getProgram: () => program,
  };
}

export interface WebGPURenderer<TProps extends RendererProps = RendererProps> {
  render: (props: TProps) => Promise<void>;
  destroy: () => void;
  getDevice: () => GPUDevice;
  getContext: () => GPUCanvasContext;
  getPipeline: () => GPURenderPipeline | null;
}

export interface WebGPURendererConfig<
  TProps extends RendererProps = RendererProps
> {
  canvas: HTMLCanvasElement;
  device: GPUDevice;
  format?: GPUTextureFormat;
  createPipeline: (
    device: GPUDevice,
    format: GPUTextureFormat
  ) => GPURenderPipeline;
  onRender: (
    device: GPUDevice,
    context: GPUCanvasContext,
    pipeline: GPURenderPipeline,
    props: TProps
  ) => Promise<void>;
  onDestroy?: (device: GPUDevice, pipeline: GPURenderPipeline | null) => void;
}

export function createWebGPURenderer<
  TProps extends RendererProps = RendererProps
>(config: WebGPURendererConfig<TProps>): WebGPURenderer<TProps> {
  const device = config.device;
  const format = config.format ?? "bgra8unorm";

  const context = config.canvas.getContext("webgpu");
  if (!context) {
    throw new Error("WebGPU context not available");
  }

  const gpuContext = context as GPUCanvasContext;
  gpuContext.configure({
    device,
    format,
    alphaMode: "premultiplied",
  });

  // Initialize pipeline
  const pipeline = config.createPipeline(device, format);

  return {
    render: async (props: TProps) => {
      await config.onRender(device, gpuContext, pipeline, props);
    },
    destroy: () => {
      if (config.onDestroy) {
        config.onDestroy(device, pipeline);
      }
    },
    getDevice: () => device,
    getContext: () => gpuContext,
    getPipeline: () => pipeline,
  };
}

// ============================================================================
// Root Component
// ============================================================================

export interface BaseChartRootProps {
  width?: number | string; // Support "100%", "50vw", etc.
  height?: number | string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number; // e.g., 16/9, 4/3
  margin?: Margin;
  xAxis?: Axis;
  yAxis?: Axis;
  xDomain?: [number, number] | "auto";
  yDomain?: [number, number] | "auto";
  xTicks?: number[]; // Custom tick values
  yTicks?: number[]; // Custom tick values
  preferWebGPU?: boolean;
  className?: string;
  children?: React.ReactNode;
  // Time series support
  enableTimeSeries?: boolean;
  timeRange?: [number, number];
}

export function ChartRoot({
  width: widthProp = 800,
  height: heightProp = 400,
  minWidth = 200,
  minHeight = 150,
  maxWidth,
  maxHeight,
  aspectRatio,
  margin = { top: 20, right: 20, bottom: 50, left: 60 },
  xAxis = {},
  yAxis = {},
  xDomain: xDomainProp,
  yDomain: yDomainProp,
  xTicks: xTicksProp,
  yTicks: yTicksProp,
  preferWebGPU = true,
  className,
  children,
  enableTimeSeries = false,
  timeRange,
}: BaseChartRootProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const overlayRef = React.useRef<HTMLCanvasElement>(null);

  // Responsive dimensions state
  const [dimensions, setDimensions] = React.useState<{
    width: number;
    height: number;
  }>(() => {
    // Initialize with prop values or defaults
    const w = typeof widthProp === "number" ? widthProp : 800;
    const h = typeof heightProp === "number" ? heightProp : 400;
    return { width: w, height: h };
  });

  const [hoveredPoint, setHoveredPoint] = React.useState<HoveredPoint | null>(
    null
  );
  const [tooltipData, setTooltipData] = React.useState<TooltipData | null>(
    null
  );
  const [renderMode, setRenderMode] = React.useState<"webgpu" | "webgl" | null>(
    null
  );

  const [gpuDevice, setGpuDevice] = React.useState<GPUDevice | null>(null);

  // Initialize WebGPU device if preferred and available
  React.useEffect(() => {
    if (!preferWebGPU) {
      setRenderMode("webgl");
      return;
    }

    if (!navigator.gpu) {
      console.warn("WebGPU not supported, falling back to WebGL");
      setRenderMode("webgl");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          if (!cancelled) {
            console.warn("No WebGPU adapter found, falling back to WebGL");
            setRenderMode("webgl");
          }
          return;
        }

        const device = await adapter.requestDevice();
        if (!cancelled) {
          setGpuDevice(device);
          setRenderMode("webgpu");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to initialize WebGPU:", error);
          setRenderMode("webgl");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [preferWebGPU]);

  // Time series state
  const [timeSeriesState, setTimeSeriesState] =
    React.useState<TimeSeriesState | null>(() => {
      if (!enableTimeSeries || !timeRange) return null;
      return {
        isPlaying: false,
        currentTime: timeRange[0],
        startTime: timeRange[0],
        endTime: timeRange[1],
        playbackSpeed: 1,
      };
    });

  // ResizeObserver for responsive sizing - always active
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width: observedWidth, height: observedHeight } =
        entry.contentRect;

      let newWidth = observedWidth;
      let newHeight = observedHeight;

      // If dimensions are 0 (initial render), use prop defaults
      if (newWidth === 0 && newHeight === 0) {
        newWidth = typeof widthProp === "number" ? widthProp : 800;
        newHeight = typeof heightProp === "number" ? heightProp : 400;
      }

      // Apply constraints
      if (minWidth !== undefined) newWidth = Math.max(minWidth, newWidth);
      if (maxWidth !== undefined) newWidth = Math.min(maxWidth, newWidth);
      if (minHeight !== undefined) newHeight = Math.max(minHeight, newHeight);
      if (maxHeight !== undefined) newHeight = Math.min(maxHeight, newHeight);

      // For fixed pixel widths/heights, use them as max constraints
      if (typeof widthProp === "number") {
        newWidth = Math.min(widthProp, newWidth);
      }
      if (typeof heightProp === "number") {
        newHeight = Math.min(heightProp, newHeight);
      }

      // Apply aspect ratio if specified
      if (aspectRatio !== undefined) {
        const currentRatio = newWidth / newHeight;
        if (currentRatio > aspectRatio) {
          newWidth = newHeight * aspectRatio;
        } else {
          newHeight = newWidth / aspectRatio;
        }
      }

      setDimensions({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [
    widthProp,
    heightProp,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    aspectRatio,
  ]);

  // Use responsive dimensions
  const { width, height } = dimensions;

  // Default domains - subclasses will override via context
  const xDomain: [number, number] =
    xDomainProp === "auto" || !xDomainProp ? [0, 100] : xDomainProp;
  const yDomain: [number, number] =
    yDomainProp === "auto" || !yDomainProp ? [0, 100] : yDomainProp;

  const xTicks = React.useMemo(
    () => xTicksProp || getTicks(xDomain, 6),
    [xTicksProp, xDomain]
  );
  const yTicks = React.useMemo(
    () => yTicksProp || getTicks(yDomain, 6),
    [yTicksProp, yDomain]
  );

  // Create scale functions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = React.useCallback(
    (x: number) =>
      margin.left + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * innerWidth,
    [xDomain, margin.left, innerWidth]
  );

  const yScale = React.useCallback(
    (y: number) =>
      margin.top +
      innerHeight -
      ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * innerHeight,
    [yDomain, margin.top, innerHeight]
  );

  // Capture DPR once to ensure consistency across all chart components
  // Use 1 as default for SSR, will be updated on client mount
  const [devicePixelRatio, setDevicePixelRatio] = React.useState(1);

  React.useEffect(() => {
    // Set actual DPR on client mount
    setDevicePixelRatio(window.devicePixelRatio || 1);
  }, []);

  const contextValue: BaseChartContext = {
    width,
    height,
    margin,
    devicePixelRatio,
    xAxis,
    yAxis,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    xScale,
    yScale,
    canvasRef,
    overlayRef,
    preferWebGPU,
    renderMode,
    setRenderMode,
    gpuDevice,
    hoveredPoint,
    setHoveredPoint,
    tooltipData,
    setTooltipData,
    timeSeriesState,
    setTimeSeriesState,
  };

  // Container style with responsive support
  // For responsive behavior: always use 100% width/height and let constraints control size
  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: typeof widthProp === "string" ? widthProp : typeof widthProp === "number" ? `${widthProp}px` : "100%",
    height: typeof heightProp === "string" ? heightProp : typeof heightProp === "number" ? `${heightProp}px` : "100%",
    minWidth: minWidth,
    minHeight: minHeight,
    maxWidth: typeof widthProp === "number" ? widthProp : maxWidth,
    maxHeight: typeof heightProp === "number" ? heightProp : maxHeight,
    overflow: "visible",
  };

  return (
    <BaseChartContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={`bg-white dark:bg-zinc-950 rounded-lg ${className || ""}`}
        style={containerStyle}
      >
        {children}
      </div>
    </BaseChartContext.Provider>
  );
}

// ============================================================================
// Axes Component
// ============================================================================

export function ChartAxes() {
  const ctx = useBaseChart();

  React.useEffect(() => {
    const canvas = ctx.overlayRef.current;
    if (!canvas) return;

    const dpr = ctx.devicePixelRatio;
    canvas.width = ctx.width * dpr;
    canvas.height = ctx.height * dpr;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(dpr, dpr);
    context.clearRect(0, 0, ctx.width, ctx.height);

    // Get theme-aware colors
    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#6e6e6e" : "#999999";

    context.strokeStyle = textColor;
    context.fillStyle = textColor;
    context.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";

    // X-axis
    context.beginPath();
    context.moveTo(ctx.margin.left, ctx.height - ctx.margin.bottom);
    context.lineTo(
      ctx.width - ctx.margin.right,
      ctx.height - ctx.margin.bottom
    );
    context.stroke();

    // Calculate minimum spacing between x-axis labels to avoid overlap
    const getFilteredXTicks = () => {
      if (ctx.xTicks.length === 0) return [];

      // Measure a sample label to estimate width
      const sampleLabel = ctx.xAxis.formatter
        ? ctx.xAxis.formatter(ctx.xTicks[0])
        : formatValue(ctx.xTicks[0]);
      const labelWidth = context.measureText(sampleLabel).width;
      const minSpacing = labelWidth + 20; // Add 20px padding between labels

      const innerWidth = ctx.width - ctx.margin.left - ctx.margin.right;
      const availableSpace = innerWidth / ctx.xTicks.length;

      // If we have enough space, show all ticks
      if (availableSpace >= minSpacing) {
        return ctx.xTicks;
      }

      // Otherwise, intelligently skip ticks
      const skipFactor = Math.ceil(minSpacing / availableSpace);
      return ctx.xTicks.filter((_, i) => i % skipFactor === 0);
    };

    const visibleXTicks = getFilteredXTicks();

    // Draw all tick marks
    ctx.xTicks.forEach((tick) => {
      const x = ctx.xScale(tick);
      context.beginPath();
      context.moveTo(x, ctx.height - ctx.margin.bottom);
      context.lineTo(x, ctx.height - ctx.margin.bottom + 6);
      context.stroke();
    });

    // Draw only non-overlapping labels
    visibleXTicks.forEach((tick) => {
      const x = ctx.xScale(tick);
      context.textAlign = "center";
      const label = ctx.xAxis.formatter
        ? ctx.xAxis.formatter(tick)
        : formatValue(tick);
      context.fillText(label, x, ctx.height - ctx.margin.bottom + 20);
    });

    if (ctx.xAxis.label) {
      context.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
      context.textAlign = "center";
      context.fillText(ctx.xAxis.label, ctx.width / 2, ctx.height - 5);
    }

    // Y-axis
    context.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
    context.beginPath();
    context.moveTo(ctx.margin.left, ctx.margin.top);
    context.lineTo(ctx.margin.left, ctx.height - ctx.margin.bottom);
    context.stroke();

    ctx.yTicks.forEach((tick) => {
      const y = ctx.yScale(tick);
      context.beginPath();
      context.moveTo(ctx.margin.left - 6, y);
      context.lineTo(ctx.margin.left, y);
      context.stroke();

      context.textAlign = "right";
      context.textBaseline = "middle";
      const label = ctx.yAxis.formatter
        ? ctx.yAxis.formatter(tick)
        : formatValue(tick);
      context.fillText(label, ctx.margin.left - 10, y);
    });

    if (ctx.yAxis.label) {
      context.save();
      context.translate(15, ctx.height / 2);
      context.rotate(-Math.PI / 2);
      context.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
      context.textAlign = "center";
      context.fillText(ctx.yAxis.label, 0, 0);
      context.restore();
    }
  }, [ctx]);

  return (
    <canvas
      ref={ctx.overlayRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: ctx.width, height: ctx.height }}
    />
  );
}

// ============================================================================
// Tooltip Component
// ============================================================================

export function ChartTooltip({
  onHover,
}: {
  onHover?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const ctx = useBaseChart();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onHover) {
      onHover(e);
    }
  };

  const handleMouseLeave = () => {
    ctx.setHoveredPoint(null);
    ctx.setTooltipData(null);
  };

  if (!ctx.hoveredPoint || !ctx.tooltipData) {
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: Tooltip overlay requires mouse tracking
      <div
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    );
  }

  // Calculate tooltip position
  const tooltipWidth = 160;
  const tooltipHeight = 20 + ctx.tooltipData.items.length * 20 + 10;
  let tooltipX = ctx.hoveredPoint.screenX + 12;
  let tooltipY = ctx.hoveredPoint.screenY - tooltipHeight / 2;

  if (tooltipX + tooltipWidth > ctx.width) {
    tooltipX = ctx.hoveredPoint.screenX - tooltipWidth - 12;
  }
  if (tooltipY < 0) tooltipY = 4;
  if (tooltipY + tooltipHeight > ctx.height) {
    tooltipY = ctx.height - tooltipHeight - 4;
  }

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Tooltip overlay requires mouse tracking */}
      <div
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Crosshair */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: ctx.width, height: ctx.height }}
        aria-label="Crosshair indicator"
      >
        <title>Crosshair indicator</title>
        <line
          x1={ctx.hoveredPoint.screenX}
          y1={ctx.margin.top}
          x2={ctx.hoveredPoint.screenX}
          y2={ctx.height - ctx.margin.bottom}
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="text-zinc-400 dark:text-zinc-600"
          opacity="0.5"
        />
        <line
          x1={ctx.margin.left}
          y1={ctx.hoveredPoint.screenY}
          x2={ctx.width - ctx.margin.right}
          y2={ctx.hoveredPoint.screenY}
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="text-zinc-400 dark:text-zinc-600"
          opacity="0.5"
        />
      </svg>

      {/* Tooltip */}
      <div
        className="absolute z-50 px-3 py-2 bg-white dark:bg-zinc-950 text-sm rounded-lg shadow-xl pointer-events-none border border-zinc-200 dark:border-zinc-800"
        style={{ left: tooltipX, top: tooltipY }}
      >
        <div className="font-semibold mb-1">{ctx.tooltipData.title}</div>
        {ctx.tooltipData.items.map((item, idx) => (
          <div
            key={idx}
            className="text-zinc-700 dark:text-zinc-200 text-xs flex items-center gap-2"
          >
            {item.color && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="dark:text-zinc-200">
              {item.label}: <span className="font-mono">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
