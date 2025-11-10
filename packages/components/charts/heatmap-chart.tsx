"use client";

import * as React from "react";
import {
  BaseWebGLRenderer,
  BaseWebGPURenderer,
  ChartAxes,
  ChartRoot,
  ChartTooltip,
  hexToRgb,
  type RendererProps,
  useBaseChart,
} from "./base-chart";

// ============================================================================
// Heatmap Chart Types
// ============================================================================

export interface DataPoint {
  x: number | string;
  y: number | string;
  value: number;
  label?: string;
}

export interface HeatmapChartProps {
  data: DataPoint[];
  xAxis?: {
    label?: string;
    categories?: (string | number)[];
    formatter?: (value: number | string) => string;
  };
  yAxis?: {
    label?: string;
    categories?: (string | number)[];
    formatter?: (value: number | string) => string;
  };
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
  preferWebGPU?: boolean;
  colorScale?: (value: number) => string; // Function to map value to color
  minValue?: number;
  maxValue?: number;
  cellGap?: number;
}

// Extended context for heatmap chart
interface HeatmapChartContextType {
  data: DataPoint[];
  xCategories: (string | number)[];
  yCategories: (string | number)[];
  xCategoryMap: Map<string | number, number>;
  yCategoryMap: Map<string | number, number>;
  colorScale: (value: number) => string;
  minValue: number;
  maxValue: number;
  cellGap: number;
}

const HeatmapChartContext = React.createContext<HeatmapChartContextType | null>(
  null
);

function useHeatmapChartData() {
  const ctx = React.useContext(HeatmapChartContext);
  if (!ctx) {
    throw new Error(
      "HeatmapChart components must be used within HeatmapChart.Root"
    );
  }
  return ctx;
}

function useHeatmapChart() {
  const baseCtx = useBaseChart();
  const heatmapCtx = useHeatmapChartData();
  return { ...baseCtx, ...heatmapCtx };
}

// ============================================================================
// Default Color Scales
// ============================================================================

function defaultColorScale(value: number): string {
  // Viridis-inspired color scale
  const colors = [
    [68, 1, 84], // Purple
    [59, 82, 139], // Blue
    [33, 145, 140], // Cyan
    [94, 201, 98], // Green
    [253, 231, 37], // Yellow
  ];

  const clamped = Math.max(0, Math.min(1, value));
  const scaled = clamped * (colors.length - 1);
  const i = Math.floor(scaled);
  const f = scaled - i;

  if (i >= colors.length - 1) {
    const c = colors[colors.length - 1];
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }

  const c1 = colors[i];
  const c2 = colors[i + 1];
  const r = Math.round(c1[0] + f * (c2[0] - c1[0]));
  const g = Math.round(c1[1] + f * (c2[1] - c1[1]));
  const b = Math.round(c1[2] + f * (c2[2] - c1[2]));

  return `rgb(${r}, ${g}, ${b})`;
}

// ============================================================================
// Shaders
// ============================================================================

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec4 a_color;

uniform vec2 u_resolution;
uniform mat3 u_matrix;

varying vec4 v_color;

void main() {
  vec2 position = (u_matrix * vec3(a_position, 1.0)).xy;
  vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
  clipSpace.y *= -1.0;

  gl_Position = vec4(clipSpace, 0.0, 1.0);
  v_color = a_color;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
`;

const WGSL_SHADER = `
struct VertexInput {
  @location(0) position: vec2f,
  @location(1) color: vec4f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}

struct Uniforms {
  resolution: vec2f,
  transform: mat3x3f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  let transformed = uniforms.transform * vec3f(input.position, 1.0);
  var clipSpace = (transformed.xy / uniforms.resolution) * 2.0 - 1.0;
  clipSpace.y *= -1.0;

  output.position = vec4f(clipSpace, 0.0, 1.0);
  output.color = input.color;
  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  return input.color;
}
`;

// ============================================================================
// Heatmap Renderers
// ============================================================================

interface HeatmapRendererProps extends RendererProps {
  data: DataPoint[];
  xCategoryMap: Map<string | number, number>;
  yCategoryMap: Map<string | number, number>;
  colorScale: (value: number) => string;
  minValue: number;
  maxValue: number;
  cellGap: number;
}

class WebGLHeatmapRenderer extends BaseWebGLRenderer {
  private positionBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.program = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
    this.positionBuffer = this.gl.createBuffer();
    this.colorBuffer = this.gl.createBuffer();
  }

  private createHeatmapGeometry(
    data: DataPoint[],
    xScale: (x: number) => number,
    yScale: (y: number) => number,
    xCategoryMap: Map<string | number, number>,
    yCategoryMap: Map<string | number, number>,
    colorScale: (value: number) => string,
    minValue: number,
    maxValue: number,
    cellWidth: number,
    cellHeight: number,
    cellGap: number
  ) {
    const positions: number[] = [];
    const colors: number[] = [];

    for (const point of data) {
      const xIdx = xCategoryMap.get(point.x);
      const yIdx = yCategoryMap.get(point.y);

      if (xIdx === undefined || yIdx === undefined) continue;

      const x = xScale(xIdx);
      const y = yScale(yIdx);
      const w = cellWidth - cellGap;
      const h = cellHeight - cellGap;

      // Normalize value to [0, 1]
      const normalizedValue = (point.value - minValue) / (maxValue - minValue);
      const colorStr = colorScale(normalizedValue);
      const rgb = hexToRgb(colorStr);

      // Two triangles for rectangle
      positions.push(
        x,
        y,
        x + w,
        y,
        x,
        y + h,
        x + w,
        y,
        x + w,
        y + h,
        x,
        y + h
      );

      // Same color for all 6 vertices
      for (let i = 0; i < 6; i++) {
        colors.push(...rgb, 1.0);
      }
    }

    return { positions, colors };
  }

  render(props: HeatmapRendererProps) {
    const { gl, program } = this;
    const {
      data,
      xDomain,
      yDomain,
      width,
      height,
      margin,
      xCategoryMap,
      yCategoryMap,
      colorScale,
      minValue,
      maxValue,
      cellGap,
    } = props;

    if (!program) return;

    this.clear(width, height);
    this.setupBlending();

    // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL method
    gl.useProgram(program);

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLoc, width, height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const matrix = [1, 0, 0, 0, 1, 0, margin.left, margin.top, 1];
    const matrixLoc = gl.getUniformLocation(program, "u_matrix");
    gl.uniformMatrix3fv(matrixLoc, false, matrix);

    const xScale = (x: number) =>
      ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * innerWidth;
    const yScale = (y: number) =>
      ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * innerHeight;
    const yScaleFlipped = (y: number) => innerHeight - yScale(y);

    const cellWidth = innerWidth / xCategoryMap.size;
    const cellHeight = innerHeight / yCategoryMap.size;

    const geometry = this.createHeatmapGeometry(
      data,
      xScale,
      yScaleFlipped,
      xCategoryMap,
      yCategoryMap,
      colorScale,
      minValue,
      maxValue,
      cellWidth,
      cellHeight,
      cellGap
    );

    if (geometry.positions.length === 0) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(geometry.positions),
      gl.STATIC_DRAW
    );
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(geometry.colors),
      gl.STATIC_DRAW
    );
    const colorLoc = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, geometry.positions.length / 2);
  }

  destroy() {
    const { gl } = this;
    if (this.program) gl.deleteProgram(this.program);
    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
    if (this.colorBuffer) gl.deleteBuffer(this.colorBuffer);
  }
}

class WebGPUHeatmapRenderer extends BaseWebGPURenderer {
  private uniformBuffer: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;

  constructor(canvas: HTMLCanvasElement, device: GPUDevice) {
    super(canvas, device);
    this.initPipeline();
  }

  private initPipeline() {
    const { device } = this;
    const shaderModule = this.createShaderModule(WGSL_SHADER);

    this.uniformBuffer = device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
      ],
    });

    this.bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });

    this.pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      }),
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: 8,
            attributes: [{ shaderLocation: 0, offset: 0, format: "float32x2" }],
          },
          {
            arrayStride: 16,
            attributes: [{ shaderLocation: 1, offset: 0, format: "float32x4" }],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [
          {
            format: this.format,
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add",
              },
              alpha: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
                operation: "add",
              },
            },
          },
        ],
      },
      primitive: { topology: "triangle-list" },
    });
  }

  private createHeatmapGeometry(
    data: DataPoint[],
    xScale: (x: number) => number,
    yScale: (y: number) => number,
    xCategoryMap: Map<string | number, number>,
    yCategoryMap: Map<string | number, number>,
    colorScale: (value: number) => string,
    minValue: number,
    maxValue: number,
    cellWidth: number,
    cellHeight: number,
    cellGap: number
  ) {
    const positions: number[] = [];
    const colors: number[] = [];

    for (const point of data) {
      const xIdx = xCategoryMap.get(point.x);
      const yIdx = yCategoryMap.get(point.y);

      if (xIdx === undefined || yIdx === undefined) continue;

      const x = xScale(xIdx);
      const y = yScale(yIdx);
      const w = cellWidth - cellGap;
      const h = cellHeight - cellGap;

      const normalizedValue = (point.value - minValue) / (maxValue - minValue);
      const colorStr = colorScale(normalizedValue);
      const rgb = hexToRgb(colorStr);

      positions.push(
        x,
        y,
        x + w,
        y,
        x,
        y + h,
        x + w,
        y,
        x + w,
        y + h,
        x,
        y + h
      );

      for (let i = 0; i < 6; i++) {
        colors.push(...rgb, 1.0);
      }
    }

    return { positions, colors };
  }

  async render(props: HeatmapRendererProps) {
    const { device, pipeline, uniformBuffer, bindGroup } = this;
    const {
      data,
      xDomain,
      yDomain,
      width,
      height,
      margin,
      xCategoryMap,
      yCategoryMap,
      colorScale,
      minValue,
      maxValue,
      cellGap,
    } = props;

    if (!pipeline || !uniformBuffer || !bindGroup) return;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const uniformData = new Float32Array([
      width,
      height,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      margin.left,
      margin.top,
      1,
      0,
    ]);
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    const xScale = (x: number) =>
      ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * innerWidth;
    const yScale = (y: number) =>
      ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * innerHeight;
    const yScaleFlipped = (y: number) => innerHeight - yScale(y);

    const cellWidth = innerWidth / xCategoryMap.size;
    const cellHeight = innerHeight / yCategoryMap.size;

    const geometry = this.createHeatmapGeometry(
      data,
      xScale,
      yScaleFlipped,
      xCategoryMap,
      yCategoryMap,
      colorScale,
      minValue,
      maxValue,
      cellWidth,
      cellHeight,
      cellGap
    );

    if (geometry.positions.length === 0) return;

    const commandEncoder = device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);

    const positionBuffer = device.createBuffer({
      size: geometry.positions.length * 4,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(
      positionBuffer,
      0,
      new Float32Array(geometry.positions)
    );

    const colorBuffer = device.createBuffer({
      size: geometry.colors.length * 4,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(colorBuffer, 0, new Float32Array(geometry.colors));

    passEncoder.setVertexBuffer(0, positionBuffer);
    passEncoder.setVertexBuffer(1, colorBuffer);

    passEncoder.draw(geometry.positions.length / 2);

    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
  }

  destroy() {
    if (this.uniformBuffer) this.uniformBuffer.destroy();
  }
}

// ============================================================================
// Heatmap Chart Components
// ============================================================================

function Root({
  data,
  xAxis = {},
  yAxis = {},
  width = 800,
  height = 400,
  preferWebGPU = true,
  colorScale = defaultColorScale,
  minValue,
  maxValue,
  cellGap = 2,
  className,
  children,
}: {
  data: DataPoint[];
  xAxis?: {
    label?: string;
    categories?: (string | number)[];
    formatter?: (value: number | string) => string;
  };
  yAxis?: {
    label?: string;
    categories?: (string | number)[];
    formatter?: (value: number | string) => string;
  };
  width?: number;
  height?: number;
  preferWebGPU?: boolean;
  colorScale?: (value: number) => string;
  minValue?: number;
  maxValue?: number;
  cellGap?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  // Extract categories
  const xCategories = React.useMemo(() => {
    if (xAxis.categories) return xAxis.categories;
    const cats = new Set<string | number>();
    data.forEach((d) => {
      cats.add(d.x);
    });
    return Array.from(cats).sort((a, b) => {
      if (typeof a === "number" && typeof b === "number") return a - b;
      return String(a).localeCompare(String(b));
    });
  }, [data, xAxis.categories]);

  const yCategories = React.useMemo(() => {
    if (yAxis.categories) return yAxis.categories;
    const cats = new Set<string | number>();
    data.forEach((d) => {
      cats.add(d.y);
    });
    return Array.from(cats).sort((a, b) => {
      if (typeof a === "number" && typeof b === "number") return a - b;
      return String(a).localeCompare(String(b));
    });
  }, [data, yAxis.categories]);

  // Create category mappings
  const xCategoryMap = React.useMemo(() => {
    const map = new Map<string | number, number>();
    xCategories.forEach((cat, idx) => {
      map.set(cat, idx);
    });
    return map;
  }, [xCategories]);

  const yCategoryMap = React.useMemo(() => {
    const map = new Map<string | number, number>();
    yCategories.forEach((cat, idx) => {
      map.set(cat, idx);
    });
    return map;
  }, [yCategories]);

  // Calculate value range
  const calculatedMinValue = React.useMemo(() => {
    if (minValue !== undefined) return minValue;
    return Math.min(...data.map((d) => d.value));
  }, [data, minValue]);

  const calculatedMaxValue = React.useMemo(() => {
    if (maxValue !== undefined) return maxValue;
    return Math.max(...data.map((d) => d.value));
  }, [data, maxValue]);

  // Domains for rendering
  const xDomain: [number, number] = [-0.5, xCategories.length - 0.5];
  const yDomain: [number, number] = [-0.5, yCategories.length - 0.5];

  return (
    <ChartRoot
      width={width}
      height={height}
      xAxis={xAxis}
      yAxis={yAxis}
      xDomain={xDomain}
      yDomain={yDomain}
      preferWebGPU={preferWebGPU}
      className={className}
    >
      <HeatmapChartContext.Provider
        value={{
          data,
          xCategories,
          yCategories,
          xCategoryMap,
          yCategoryMap,
          colorScale,
          minValue: calculatedMinValue,
          maxValue: calculatedMaxValue,
          cellGap,
        }}
      >
        {children}
      </HeatmapChartContext.Provider>
    </ChartRoot>
  );
}

function Canvas({ showGrid = false }: { showGrid?: boolean }) {
  const ctx = useHeatmapChart();
  const rendererRef = React.useRef<
    WebGLHeatmapRenderer | WebGPUHeatmapRenderer | null
  >(null);

  React.useEffect(() => {
    const canvas = ctx.canvasRef.current;
    if (!canvas) return;

    const dpr = ctx.devicePixelRatio;
    canvas.width = ctx.width * dpr;
    canvas.height = ctx.height * dpr;
    canvas.style.width = `${ctx.width}px`;
    canvas.style.height = `${ctx.height}px`;

    let mounted = true;

    async function initRenderer() {
      if (!canvas) return;

      try {
        if (ctx.preferWebGPU && "gpu" in navigator) {
          const adapter = await navigator.gpu?.requestAdapter();
          if (adapter) {
            const device = await adapter.requestDevice();
            const renderer = new WebGPUHeatmapRenderer(canvas, device);

            if (!mounted) {
              renderer.destroy();
              return;
            }

            rendererRef.current = renderer;
            ctx.setRenderMode("webgpu");

            await renderer.render({
              canvas,
              data: ctx.data,
              xDomain: ctx.xDomain,
              yDomain: ctx.yDomain,
              xTicks: ctx.xTicks,
              yTicks: ctx.yTicks,
              width: ctx.width * dpr,
              height: ctx.height * dpr,
              margin: {
                top: ctx.margin.top * dpr,
                right: ctx.margin.right * dpr,
                bottom: ctx.margin.bottom * dpr,
                left: ctx.margin.left * dpr,
              },
              showGrid,
              xCategoryMap: ctx.xCategoryMap,
              yCategoryMap: ctx.yCategoryMap,
              colorScale: ctx.colorScale,
              minValue: ctx.minValue,
              maxValue: ctx.maxValue,
              cellGap: ctx.cellGap * dpr,
            });
            return;
          }
        }
      } catch (error) {
        console.warn("WebGPU failed, falling back to WebGL:", error);
      }

      try {
        const renderer = new WebGLHeatmapRenderer(canvas);

        if (!mounted) {
          renderer.destroy();
          return;
        }

        rendererRef.current = renderer;
        ctx.setRenderMode("webgl");

        renderer.render({
          canvas,
          data: ctx.data,
          xDomain: ctx.xDomain,
          yDomain: ctx.yDomain,
          xTicks: ctx.xTicks,
          yTicks: ctx.yTicks,
          width: ctx.width * dpr,
          height: ctx.height * dpr,
          margin: {
            top: ctx.margin.top * dpr,
            right: ctx.margin.right * dpr,
            bottom: ctx.margin.bottom * dpr,
            left: ctx.margin.left * dpr,
          },
          showGrid,
          xCategoryMap: ctx.xCategoryMap,
          yCategoryMap: ctx.yCategoryMap,
          colorScale: ctx.colorScale,
          minValue: ctx.minValue,
          maxValue: ctx.maxValue,
          cellGap: ctx.cellGap * dpr,
        });
      } catch (error) {
        console.error("WebGL failed:", error);
      }
    }

    initRenderer();

    return () => {
      mounted = false;
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [ctx, showGrid]);

  return (
    <canvas
      ref={ctx.canvasRef}
      className="absolute inset-0"
      style={{
        width: `${ctx.width}px`,
        height: `${ctx.height}px`,
      }}
    />
  );
}

function Tooltip() {
  const ctx = useHeatmapChart();

  const handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x < ctx.margin.left ||
      x > ctx.width - ctx.margin.right ||
      y < ctx.margin.top ||
      y > ctx.height - ctx.margin.bottom
    ) {
      ctx.setHoveredPoint(null);
      ctx.setTooltipData(null);
      return;
    }

    const innerWidth = ctx.width - ctx.margin.left - ctx.margin.right;
    const innerHeight = ctx.height - ctx.margin.top - ctx.margin.bottom;
    const cellWidth = innerWidth / ctx.xCategoryMap.size;
    const cellHeight = innerHeight / ctx.yCategoryMap.size;

    const relX = x - ctx.margin.left;
    const relY = y - ctx.margin.top;

    const xIdx = Math.floor(relX / cellWidth);
    const yIdx = Math.floor((innerHeight - relY) / cellHeight);

    if (
      xIdx < 0 ||
      xIdx >= ctx.xCategories.length ||
      yIdx < 0 ||
      yIdx >= ctx.yCategories.length
    ) {
      ctx.setHoveredPoint(null);
      ctx.setTooltipData(null);
      return;
    }

    const xCat = ctx.xCategories[xIdx];
    const yCat = ctx.yCategories[yIdx];

    // Find the data point
    const dataPoint = ctx.data.find((d) => d.x === xCat && d.y === yCat);

    if (dataPoint) {
      // Only update if the hovered cell has changed
      const cellChanged =
        !ctx.hoveredPoint ||
        !ctx.tooltipData ||
        ctx.tooltipData.items[0].value !== String(dataPoint.x) ||
        ctx.tooltipData.items[1].value !== String(dataPoint.y);

      if (cellChanged) {
        const screenX = ctx.margin.left + xIdx * cellWidth + cellWidth / 2;
        const screenY =
          ctx.margin.top +
          (ctx.yCategories.length - yIdx - 1) * cellHeight +
          cellHeight / 2;

        ctx.setHoveredPoint({
          seriesIdx: 0,
          pointIdx: 0,
          screenX,
          screenY,
        });

        ctx.setTooltipData({
          title: "Heatmap Cell",
          items: [
            { label: "X", value: String(dataPoint.x) },
            { label: "Y", value: String(dataPoint.y) },
            { label: "Value", value: dataPoint.value.toFixed(2) },
          ],
        });
      }
    } else {
      if (ctx.hoveredPoint !== null) {
        ctx.setHoveredPoint(null);
        ctx.setTooltipData(null);
      }
    }
  };

  return <ChartTooltip onHover={handleHover} />;
}

function ColorLegend() {
  const ctx = useHeatmapChart();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = ctx.devicePixelRatio;
    const width = 200;
    const height = 30;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(dpr, dpr);

    // Draw gradient
    const gradient = context.createLinearGradient(0, 0, width - 40, 0);
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const value = i / steps;
      const color = ctx.colorScale(value);
      gradient.addColorStop(value, color);
    }

    context.fillStyle = gradient;
    context.fillRect(10, 5, width - 50, 15);

    // Draw border
    context.strokeStyle = "#666";
    context.lineWidth = 1;
    context.strokeRect(10, 5, width - 50, 15);

    // Labels
    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#e4e4e7" : "#18181b";

    context.fillStyle = textColor;
    context.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
    context.textAlign = "left";
    context.fillText(ctx.minValue.toFixed(1), 10, 27);

    context.textAlign = "right";
    context.fillText(ctx.maxValue.toFixed(1), width - 40, 27);
  }, [ctx]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{
        width: 200,
        height: 30,
        top: ctx.margin.top,
        right: ctx.margin.right,
      }}
    />
  );
}

// ============================================================================
// Composed Component
// ============================================================================

export function HeatmapChart({
  data,
  xAxis = {},
  yAxis = {},
  width = 800,
  height = 400,
  showGrid = false,
  showAxes = true,
  showLegend = true,
  showTooltip = false,
  preferWebGPU = true,
  colorScale = defaultColorScale,
  minValue,
  maxValue,
  cellGap = 2,
  className,
}: HeatmapChartProps) {
  return (
    <Root
      data={data}
      xAxis={xAxis}
      yAxis={yAxis}
      width={width}
      height={height}
      preferWebGPU={preferWebGPU}
      colorScale={colorScale}
      minValue={minValue}
      maxValue={maxValue}
      cellGap={cellGap}
      className={className}
    >
      <Canvas showGrid={showGrid} />
      {showAxes && <ChartAxes />}
      {showTooltip && <Tooltip />}
      {showLegend && <ColorLegend />}
    </Root>
  );
}

HeatmapChart.Root = Root;
HeatmapChart.Canvas = Canvas;
HeatmapChart.Axes = ChartAxes;
HeatmapChart.Tooltip = Tooltip;
HeatmapChart.Legend = ColorLegend;

export default HeatmapChart;
