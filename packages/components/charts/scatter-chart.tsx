"use client";

import * as React from "react";
import {
  BaseWebGLRenderer,
  BaseWebGPURenderer,
  ChartAxes,
  ChartLegend,
  ChartRoot,
  ChartTooltip,
  getDomain,
  hexToRgb,
  type Point,
  type RendererProps,
  useBaseChart,
} from "./base-chart";

// ============================================================================
// Scatter Chart Types
// ============================================================================

export type DataPoint = Point & {
  size?: number;
  label?: string;
};

export interface Series {
  name: string;
  data: DataPoint[];
  color?: string;
  size?: number; // Default point size for series
  opacity?: number;
}

export interface ScatterChartProps {
  series: Series[];
  xAxis?: {
    label?: string;
    domain?: [number, number] | "auto";
    formatter?: (value: number) => string;
  };
  yAxis?: {
    label?: string;
    domain?: [number, number] | "auto";
    formatter?: (value: number) => string;
  };
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
  preferWebGPU?: boolean;
}

// Extended context for scatter chart
interface ScatterChartContextType {
  series: Series[];
}

const ScatterChartContext = React.createContext<ScatterChartContextType | null>(
  null
);

function useScatterChartData() {
  const ctx = React.useContext(ScatterChartContext);
  if (!ctx) {
    throw new Error(
      "ScatterChart components must be used within ScatterChart.Root"
    );
  }
  return ctx;
}

function useScatterChart() {
  const baseCtx = useBaseChart();
  const scatterCtx = useScatterChartData();
  return { ...baseCtx, ...scatterCtx };
}

// ============================================================================
// Shaders
// ============================================================================

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec4 a_color;
attribute float a_size;

uniform vec2 u_resolution;
uniform mat3 u_matrix;

varying vec4 v_color;

void main() {
  vec2 position = (u_matrix * vec3(a_position, 1.0)).xy;
  vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
  clipSpace.y *= -1.0;

  gl_Position = vec4(clipSpace, 0.0, 1.0);
  gl_PointSize = a_size;
  v_color = a_color;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec4 v_color;

void main() {
  // Create circular points
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  if (dist > 0.5) {
    discard;
  }

  // Smooth edges with antialiasing
  float alpha = smoothstep(0.5, 0.45, dist);
  gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
}
`;

const WGSL_SHADER = `
struct VertexInput {
  @location(0) position: vec2f,
  @location(1) color: vec4f,
  @location(2) pointCoord: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) pointCoord: vec2f,
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
  output.pointCoord = input.pointCoord;
  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let center = input.pointCoord - vec2f(0.5);
  let dist = length(center);

  if (dist > 0.5) {
    discard;
  }

  let alpha = smoothstep(0.5, 0.45, dist);
  return vec4f(input.color.rgb, input.color.a * alpha);
}
`;

// ============================================================================
// Scatter Renderers
// ============================================================================

interface ScatterRendererProps extends RendererProps {
  series: Series[];
}

class WebGLScatterRenderer extends BaseWebGLRenderer {
  private positionBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;
  private sizeBuffer: WebGLBuffer | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.program = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
    this.positionBuffer = this.gl.createBuffer();
    this.colorBuffer = this.gl.createBuffer();
    this.sizeBuffer = this.gl.createBuffer();
  }

  private createPointGeometry(
    points: DataPoint[],
    xScale: (x: number) => number,
    yScale: (y: number) => number,
    color: [number, number, number],
    defaultSize: number,
    opacity: number
  ) {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];

    for (const point of points) {
      const x = xScale(point.x);
      const y = yScale(point.y);
      const size = (point.size || 1) * defaultSize;

      positions.push(x, y);
      colors.push(...color, opacity);
      sizes.push(size);
    }

    return { positions, colors, sizes };
  }

  protected drawGrid(
    xTicks: number[],
    yTicks: number[],
    xScale: (x: number) => number,
    yScale: (y: number) => number,
    width: number,
    height: number
  ) {
    const { gl, program } = this;
    if (!program) return;

    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor: [number, number, number] = isDark
      ? [0.4, 0.4, 0.4]
      : [0.6, 0.6, 0.6];

    // We'll draw grid as points along lines - not ideal but works with point rendering
    for (const tick of xTicks) {
      const x = xScale(tick);
      for (let y = 0; y <= height; y += 5) {
        positions.push(x, y);
        colors.push(...gridColor, 0.1);
        sizes.push(1);
      }
    }

    for (const tick of yTicks) {
      const y = yScale(tick);
      for (let x = 0; x <= width; x += 5) {
        positions.push(x, y);
        colors.push(...gridColor, 0.1);
        sizes.push(1);
      }
    }

    if (positions.length === 0) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    const colorLoc = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW);
    const sizeLoc = gl.getAttribLocation(program, "a_size");
    gl.enableVertexAttribArray(sizeLoc);
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, positions.length / 2);
  }

  render(props: ScatterRendererProps) {
    const { gl, program } = this;
    const {
      series,
      xDomain,
      yDomain,
      width,
      height,
      margin,
      showGrid,
      xTicks,
      yTicks,
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

    if (showGrid) {
      this.drawGrid(
        xTicks,
        yTicks,
        xScale,
        yScaleFlipped,
        innerWidth,
        innerHeight
      );
    }

    for (const s of series) {
      if (s.data.length === 0) continue;

      const color = hexToRgb(s.color || "#3b82f6");
      const defaultSize = s.size || 8;
      const opacity = s.opacity ?? 0.8;
      const geometry = this.createPointGeometry(
        s.data,
        xScale,
        yScaleFlipped,
        color,
        defaultSize,
        opacity
      );

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

      gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(geometry.sizes),
        gl.STATIC_DRAW
      );
      const sizeLoc = gl.getAttribLocation(program, "a_size");
      gl.enableVertexAttribArray(sizeLoc);
      gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, geometry.positions.length / 2);
    }
  }

  destroy() {
    const { gl } = this;
    if (this.program) gl.deleteProgram(this.program);
    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
    if (this.colorBuffer) gl.deleteBuffer(this.colorBuffer);
    if (this.sizeBuffer) gl.deleteBuffer(this.sizeBuffer);
  }
}

class WebGPUScatterRenderer extends BaseWebGPURenderer {
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
          {
            arrayStride: 8,
            attributes: [{ shaderLocation: 2, offset: 0, format: "float32x2" }],
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

  private createPointGeometry(
    points: DataPoint[],
    xScale: (x: number) => number,
    yScale: (y: number) => number,
    color: [number, number, number],
    defaultSize: number,
    opacity: number
  ) {
    const positions: number[] = [];
    const colors: number[] = [];
    const pointCoords: number[] = [];

    for (const point of points) {
      const x = xScale(point.x);
      const y = yScale(point.y);
      const size = (point.size || 1) * defaultSize;
      const halfSize = size / 2;

      // Create two triangles for a quad
      // Triangle 1
      positions.push(x - halfSize, y - halfSize);
      pointCoords.push(0, 0);
      colors.push(...color, opacity);

      positions.push(x + halfSize, y - halfSize);
      pointCoords.push(1, 0);
      colors.push(...color, opacity);

      positions.push(x - halfSize, y + halfSize);
      pointCoords.push(0, 1);
      colors.push(...color, opacity);

      // Triangle 2
      positions.push(x + halfSize, y - halfSize);
      pointCoords.push(1, 0);
      colors.push(...color, opacity);

      positions.push(x + halfSize, y + halfSize);
      pointCoords.push(1, 1);
      colors.push(...color, opacity);

      positions.push(x - halfSize, y + halfSize);
      pointCoords.push(0, 1);
      colors.push(...color, opacity);
    }

    return { positions, colors, pointCoords };
  }

  async render(props: ScatterRendererProps) {
    const { device, pipeline, uniformBuffer, bindGroup } = this;
    const { series, xDomain, yDomain, width, height, margin } = props;

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

    for (const s of series) {
      if (s.data.length === 0) continue;

      const color = hexToRgb(s.color || "#3b82f6");
      const defaultSize = s.size || 8;
      const opacity = s.opacity ?? 0.8;
      const geometry = this.createPointGeometry(
        s.data,
        xScale,
        yScaleFlipped,
        color,
        defaultSize,
        opacity
      );

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
      device.queue.writeBuffer(
        colorBuffer,
        0,
        new Float32Array(geometry.colors)
      );

      const pointCoordBuffer = device.createBuffer({
        size: geometry.pointCoords.length * 4,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(
        pointCoordBuffer,
        0,
        new Float32Array(geometry.pointCoords)
      );

      passEncoder.setVertexBuffer(0, positionBuffer);
      passEncoder.setVertexBuffer(1, colorBuffer);
      passEncoder.setVertexBuffer(2, pointCoordBuffer);

      passEncoder.draw(geometry.positions.length / 2);
    }

    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
  }

  destroy() {
    if (this.uniformBuffer) this.uniformBuffer.destroy();
  }
}

// ============================================================================
// Scatter Chart Components
// ============================================================================

function Root({
  series,
  xAxis = {},
  yAxis = {},
  width = 800,
  height = 400,
  preferWebGPU = true,
  className,
  children,
}: {
  series: Series[];
  xAxis?: {
    label?: string;
    domain?: [number, number] | "auto";
    formatter?: (value: number) => string;
  };
  yAxis?: {
    label?: string;
    domain?: [number, number] | "auto";
    formatter?: (value: number) => string;
  };
  width?: number;
  height?: number;
  preferWebGPU?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const allPoints = series.flatMap((s) => s.data);

  const xDomain: [number, number] =
    xAxis.domain === "auto" || !xAxis.domain
      ? getDomain(allPoints, (p) => p.x, 0.02)
      : xAxis.domain;
  const yDomain: [number, number] =
    yAxis.domain === "auto" || !yAxis.domain
      ? getDomain(allPoints, (p) => p.y, 0.02)
      : yAxis.domain;

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
      <ScatterChartContext.Provider value={{ series }}>
        {children}
      </ScatterChartContext.Provider>
    </ChartRoot>
  );
}

function Canvas({ showGrid = true }: { showGrid?: boolean }) {
  const ctx = useScatterChart();
  const rendererRef = React.useRef<
    WebGLScatterRenderer | WebGPUScatterRenderer | null
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
            const renderer = new WebGPUScatterRenderer(canvas, device);

            if (!mounted) {
              renderer.destroy();
              return;
            }

            rendererRef.current = renderer;
            ctx.setRenderMode("webgpu");

            await renderer.render({
              canvas,
              series: ctx.series,
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
            });
            return;
          }
        }
      } catch (error) {
        console.warn("WebGPU failed, falling back to WebGL:", error);
      }

      try {
        const renderer = new WebGLScatterRenderer(canvas);

        if (!mounted) {
          renderer.destroy();
          return;
        }

        rendererRef.current = renderer;
        ctx.setRenderMode("webgl");

        renderer.render({
          canvas,
          series: ctx.series,
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
  const ctx = useScatterChart();

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

    let closestDist = Infinity;
    let closestSeriesIdx = -1;
    let closestPointIdx = -1;
    let closestScreenX = 0;
    let closestScreenY = 0;

    ctx.series.forEach((s, seriesIdx) => {
      s.data.forEach((point, pointIdx) => {
        const px = ctx.xScale(point.x);
        const py = ctx.yScale(point.y);
        const pointSize = (point.size || 1) * (s.size || 8);
        const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);

        if (dist < pointSize && dist < closestDist) {
          closestDist = dist;
          closestSeriesIdx = seriesIdx;
          closestPointIdx = pointIdx;
          closestScreenX = px;
          closestScreenY = py;
        }
      });
    });

    if (closestSeriesIdx !== -1 && closestPointIdx !== -1) {
      // Only update if the hovered point has changed
      if (
        !ctx.hoveredPoint ||
        ctx.hoveredPoint.seriesIdx !== closestSeriesIdx ||
        ctx.hoveredPoint.pointIdx !== closestPointIdx
      ) {
        const closest = {
          seriesIdx: closestSeriesIdx,
          pointIdx: closestPointIdx,
          screenX: closestScreenX,
          screenY: closestScreenY,
        };

        ctx.setHoveredPoint(closest);
        const series = ctx.series[closestSeriesIdx];
        const point = series.data[closestPointIdx];

        const items = [
          { label: "X", value: point.x.toFixed(2) },
          { label: "Y", value: point.y.toFixed(2), color: series.color },
        ];

        if (point.label) {
          items.unshift({ label: "Label", value: point.label });
        }

        ctx.setTooltipData({
          title: series.name,
          items,
        });
      }
    } else {
      if (ctx.hoveredPoint !== null) {
        ctx.setHoveredPoint(null);
        ctx.setTooltipData(null);
      }
    }
  };

  return (
    <>
      <ChartTooltip onHover={handleHover} />
      {ctx.hoveredPoint && ctx.tooltipData && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: ctx.hoveredPoint.screenX - 8,
            top: ctx.hoveredPoint.screenY - 8,
          }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse"
            style={{
              backgroundColor:
                ctx.series[ctx.hoveredPoint.seriesIdx].color || "#3b82f6",
            }}
          />
        </div>
      )}
    </>
  );
}

function Legend() {
  const ctx = useScatterChart();
  const items = ctx.series.map((s) => ({
    name: s.name,
    color: s.color || "#3b82f6",
  }));

  return <ChartLegend items={items} />;
}

// ============================================================================
// Composed Component
// ============================================================================

export function ScatterChart({
  series,
  xAxis = {},
  yAxis = {},
  width = 800,
  height = 400,
  showGrid = true,
  showAxes = true,
  showLegend = true,
  showTooltip = false,
  preferWebGPU = true,
  className,
}: ScatterChartProps) {
  return (
    <Root
      series={series}
      xAxis={xAxis}
      yAxis={yAxis}
      width={width}
      height={height}
      preferWebGPU={preferWebGPU}
      className={className}
    >
      <Canvas showGrid={showGrid} />
      {showAxes && <ChartAxes />}
      {showTooltip && <Tooltip />}
      {showLegend && <Legend />}
    </Root>
  );
}

ScatterChart.Root = Root;
ScatterChart.Canvas = Canvas;
ScatterChart.Axes = ChartAxes;
ScatterChart.Tooltip = Tooltip;
ScatterChart.Legend = Legend;

export default ScatterChart;
