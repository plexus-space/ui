"use client";

import * as React from "react";
import {
  BaseWebGLRenderer,
  BaseWebGPURenderer,
  ChartAxes,
  ChartRoot,
  ChartTooltip,
  getDomain,
  hexToRgb,
  type Point,
  type RendererProps,
  useBaseChart,
} from "./base-chart";

// ============================================================================
// Area Chart Types
// ============================================================================

export type DataPoint = Point;

export interface Series {
  name: string;
  data: Point[];
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  baseline?: number; // Y value for baseline (default: 0)
}

export interface AreaChartProps {
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
  showTooltip?: boolean;
  className?: string;
  preferWebGPU?: boolean;
  stacked?: boolean; // Stack areas on top of each other
}

// Extended context for area chart
interface AreaChartContextType {
  series: Series[];
  stacked: boolean;
}

const AreaChartContext = React.createContext<AreaChartContextType | null>(null);

function useAreaChartData() {
  const ctx = React.useContext(AreaChartContext);
  if (!ctx) {
    throw new Error("AreaChart components must be used within AreaChart.Root");
  }
  return ctx;
}

function useAreaChart() {
  const baseCtx = useBaseChart();
  const areaCtx = useAreaChartData();
  return { ...baseCtx, ...areaCtx };
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
// Area Renderers
// ============================================================================

interface AreaRendererProps extends RendererProps {
  series: Series[];
  stacked: boolean;
}

class WebGLAreaRenderer extends BaseWebGLRenderer {
  private positionBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.program = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
    this.positionBuffer = this.gl.createBuffer();
    this.colorBuffer = this.gl.createBuffer();
  }

  private createAreaGeometry(
    points: Point[],
    xScale: (x: number) => number,
    yScale: (y: number) => number,
    color: [number, number, number],
    fillOpacity: number,
    baseline: number,
    previousY?: (x: number) => number
  ) {
    const positions: number[] = [];
    const colors: number[] = [];

    if (points.length < 2) return { positions, colors };

    // Create filled area using triangle strip
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const x1 = xScale(p1.x);
      const y1 = yScale(p1.y);
      const x2 = xScale(p2.x);
      const y2 = yScale(p2.y);

      const baseY1 = previousY ? yScale(previousY(p1.x)) : yScale(baseline);
      const baseY2 = previousY ? yScale(previousY(p2.x)) : yScale(baseline);

      // Two triangles per segment
      positions.push(
        x1,
        y1,
        x2,
        y2,
        x1,
        baseY1,
        x2,
        y2,
        x2,
        baseY2,
        x1,
        baseY1
      );

      // Semi-transparent fill
      for (let j = 0; j < 6; j++) {
        colors.push(...color, fillOpacity);
      }
    }

    return { positions, colors };
  }

  private createLineGeometry(
    points: Point[],
    xScale: (x: number) => number,
    yScale: (y: number) => number,
    color: [number, number, number],
    lineWidth: number
  ) {
    const positions: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const x1 = xScale(p1.x);
      const y1 = yScale(p1.y);
      const x2 = xScale(p2.x);
      const y2 = yScale(p2.y);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;

      positions.push(x1, y1, x2, y2, x1, y1);
      positions.push(x2, y2, x1, y1, x2, y2);

      const normals = [-nx, -ny, -nx, -ny, nx, ny, -nx, -ny, nx, ny, nx, ny];

      // Create offset vertices for line width
      for (let j = 0; j < 6; j++) {
        const idx = j * 2;
        const vx = positions[positions.length - 12 + idx];
        const vy = positions[positions.length - 11 + idx];
        positions[positions.length - 12 + idx] =
          vx + normals[idx] * lineWidth * 0.5;
        positions[positions.length - 11 + idx] =
          vy + normals[idx + 1] * lineWidth * 0.5;
        colors.push(...color, 1.0);
      }
    }

    return { positions, colors };
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

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor: [number, number, number] = isDark
      ? [0.4, 0.4, 0.4]
      : [0.6, 0.6, 0.6];

    // Vertical grid lines
    for (const tick of xTicks) {
      const x = xScale(tick);
      positions.push(
        x,
        0,
        x + 1,
        0,
        x,
        height,
        x + 1,
        0,
        x + 1,
        height,
        x,
        height
      );
      for (let i = 0; i < 6; i++) {
        colors.push(...gridColor, 0.2);
      }
    }

    // Horizontal grid lines
    for (const tick of yTicks) {
      const y = yScale(tick);
      positions.push(
        0,
        y,
        width,
        y,
        0,
        y + 1,
        width,
        y,
        width,
        y + 1,
        0,
        y + 1
      );
      for (let i = 0; i < 6; i++) {
        colors.push(...gridColor, 0.2);
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

    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
  }

  render(props: AreaRendererProps) {
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
      stacked,
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

    // Track cumulative Y values for stacking
    const cumulativeY = new Map<number, number>();

    for (const s of series) {
      if (s.data.length < 2) continue;

      const color = hexToRgb(s.color || "#3b82f6");
      const fillOpacity = s.fillOpacity ?? 0.3;
      const baseline = Math.max(yDomain[0], s.baseline ?? yDomain[0]);

      // Get previous Y function for stacking
      const previousY = stacked
        ? (x: number) => {
            const prev = cumulativeY.get(x) ?? baseline;
            return prev;
          }
        : undefined;

      // Draw filled area
      const areaGeometry = this.createAreaGeometry(
        s.data,
        xScale,
        yScaleFlipped,
        color,
        fillOpacity,
        baseline,
        previousY
      );

      if (areaGeometry.positions.length > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(areaGeometry.positions),
          gl.STATIC_DRAW
        );
        const positionLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(areaGeometry.colors),
          gl.STATIC_DRAW
        );
        const colorLoc = gl.getAttribLocation(program, "a_color");
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, areaGeometry.positions.length / 2);
      }

      // Update cumulative Y for stacking
      if (stacked) {
        for (const point of s.data) {
          const current = cumulativeY.get(point.x) ?? baseline;
          cumulativeY.set(point.x, current + point.y - baseline);
        }
      }
    }

    // Draw lines on top of areas
    for (const s of series) {
      if (s.data.length < 2) continue;

      const color = hexToRgb(s.color || "#3b82f6");
      const strokeWidth = s.strokeWidth || 2;

      const lineGeometry = this.createLineGeometry(
        s.data,
        xScale,
        yScaleFlipped,
        color,
        strokeWidth
      );

      if (lineGeometry.positions.length > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(lineGeometry.positions),
          gl.STATIC_DRAW
        );
        const positionLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(lineGeometry.colors),
          gl.STATIC_DRAW
        );
        const colorLoc = gl.getAttribLocation(program, "a_color");
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, lineGeometry.positions.length / 2);
      }
    }
  }

  destroy() {
    const { gl } = this;
    if (this.program) gl.deleteProgram(this.program);
    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
    if (this.colorBuffer) gl.deleteBuffer(this.colorBuffer);
  }
}

class WebGPUAreaRenderer extends BaseWebGPURenderer {
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

  private createAreaGeometry(
    points: Point[],
    xScale: (x: number) => number,
    yScale: (y: number) => number,
    color: [number, number, number],
    fillOpacity: number,
    baseline: number,
    previousY?: (x: number) => number
  ) {
    const positions: number[] = [];
    const colors: number[] = [];

    if (points.length < 2) return { positions, colors };

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const x1 = xScale(p1.x);
      const y1 = yScale(p1.y);
      const x2 = xScale(p2.x);
      const y2 = yScale(p2.y);

      const baseY1 = previousY ? yScale(previousY(p1.x)) : yScale(baseline);
      const baseY2 = previousY ? yScale(previousY(p2.x)) : yScale(baseline);

      positions.push(
        x1,
        y1,
        x2,
        y2,
        x1,
        baseY1,
        x2,
        y2,
        x2,
        baseY2,
        x1,
        baseY1
      );

      for (let j = 0; j < 6; j++) {
        colors.push(...color, fillOpacity);
      }
    }

    return { positions, colors };
  }

  private createLineGeometry(
    points: Point[],
    xScale: (x: number) => number,
    yScale: (y: number) => number,
    color: [number, number, number],
    lineWidth: number
  ) {
    const positions: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const x1 = xScale(p1.x);
      const y1 = yScale(p1.y);
      const x2 = xScale(p2.x);
      const y2 = yScale(p2.y);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;

      positions.push(x1, y1, x2, y2, x1, y1);
      positions.push(x2, y2, x1, y1, x2, y2);

      const normals = [-nx, -ny, -nx, -ny, nx, ny, -nx, -ny, nx, ny, nx, ny];

      for (let j = 0; j < 6; j++) {
        const idx = j * 2;
        const vx = positions[positions.length - 12 + idx];
        const vy = positions[positions.length - 11 + idx];
        positions[positions.length - 12 + idx] =
          vx + normals[idx] * lineWidth * 0.5;
        positions[positions.length - 11 + idx] =
          vy + normals[idx + 1] * lineWidth * 0.5;
        colors.push(...color, 1.0);
      }
    }

    return { positions, colors };
  }

  async render(props: AreaRendererProps) {
    const { device, pipeline, uniformBuffer, bindGroup } = this;
    const { series, xDomain, yDomain, width, height, margin, stacked } = props;

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

    const cumulativeY = new Map<number, number>();

    // Draw areas
    for (const s of series) {
      if (s.data.length < 2) continue;

      const color = hexToRgb(s.color || "#3b82f6");
      const fillOpacity = s.fillOpacity ?? 0.3;
      const baseline = Math.max(yDomain[0], s.baseline ?? yDomain[0]);

      const previousY = stacked
        ? (x: number) => cumulativeY.get(x) ?? baseline
        : undefined;

      const areaGeometry = this.createAreaGeometry(
        s.data,
        xScale,
        yScaleFlipped,
        color,
        fillOpacity,
        baseline,
        previousY
      );

      if (areaGeometry.positions.length > 0) {
        const positionBuffer = device.createBuffer({
          size: areaGeometry.positions.length * 4,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(
          positionBuffer,
          0,
          new Float32Array(areaGeometry.positions)
        );

        const colorBuffer = device.createBuffer({
          size: areaGeometry.colors.length * 4,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(
          colorBuffer,
          0,
          new Float32Array(areaGeometry.colors)
        );

        passEncoder.setVertexBuffer(0, positionBuffer);
        passEncoder.setVertexBuffer(1, colorBuffer);
        passEncoder.draw(areaGeometry.positions.length / 2);
      }

      if (stacked) {
        for (const point of s.data) {
          const current = cumulativeY.get(point.x) ?? baseline;
          cumulativeY.set(point.x, current + point.y - baseline);
        }
      }
    }

    // Draw lines
    for (const s of series) {
      if (s.data.length < 2) continue;

      const color = hexToRgb(s.color || "#3b82f6");
      const strokeWidth = s.strokeWidth || 2;

      const lineGeometry = this.createLineGeometry(
        s.data,
        xScale,
        yScaleFlipped,
        color,
        strokeWidth
      );

      if (lineGeometry.positions.length > 0) {
        const positionBuffer = device.createBuffer({
          size: lineGeometry.positions.length * 4,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(
          positionBuffer,
          0,
          new Float32Array(lineGeometry.positions)
        );

        const colorBuffer = device.createBuffer({
          size: lineGeometry.colors.length * 4,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(
          colorBuffer,
          0,
          new Float32Array(lineGeometry.colors)
        );

        passEncoder.setVertexBuffer(0, positionBuffer);
        passEncoder.setVertexBuffer(1, colorBuffer);
        passEncoder.draw(lineGeometry.positions.length / 2);
      }
    }

    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
  }

  destroy() {
    if (this.uniformBuffer) this.uniformBuffer.destroy();
  }
}

// ============================================================================
// Area Chart Components
// ============================================================================

function Root({
  series,
  xAxis = {},
  yAxis = {},
  width = 800,
  height = 400,
  preferWebGPU = true,
  stacked = false,
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
  stacked?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const allPoints = series.flatMap((s) => s.data);

  const xDomain: [number, number] =
    xAxis.domain === "auto" || !xAxis.domain
      ? getDomain(allPoints, (p) => p.x)
      : xAxis.domain;
  const yDomain: [number, number] =
    yAxis.domain === "auto" || !yAxis.domain
      ? getDomain(allPoints, (p) => p.y)
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
      <AreaChartContext.Provider value={{ series, stacked }}>
        {children}
      </AreaChartContext.Provider>
    </ChartRoot>
  );
}

function Canvas({ showGrid = true }: { showGrid?: boolean }) {
  const ctx = useAreaChart();
  const rendererRef = React.useRef<
    WebGLAreaRenderer | WebGPUAreaRenderer | null
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
            const renderer = new WebGPUAreaRenderer(canvas, device);

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
              stacked: ctx.stacked,
            });
            return;
          }
        }
      } catch (error) {
        console.warn("WebGPU failed, falling back to WebGL:", error);
      }

      try {
        const renderer = new WebGLAreaRenderer(canvas);

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
          stacked: ctx.stacked,
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
  const ctx = useAreaChart();

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
    let closestPoint: Point | undefined;
    let closestScreenX = 0;
    let closestScreenY = 0;

    ctx.series.forEach((s, seriesIdx) => {
      s.data.forEach((point) => {
        const px = ctx.xScale(point.x);
        const py = ctx.yScale(point.y);
        const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);

        if (dist < 50 && dist < closestDist) {
          closestDist = dist;
          closestSeriesIdx = seriesIdx;
          closestPoint = { ...point };
          closestScreenX = px;
          closestScreenY = py;
        }
      });
    });

    if (closestSeriesIdx !== -1 && closestPoint) {
      const point = closestPoint; // Create const for proper type narrowing
      const currentX = ctx.hoveredPoint?.data?.xValue as number | undefined;
      const currentSeriesIdx = ctx.hoveredPoint?.seriesIdx;

      // Calculate adaptive threshold
      const domainRange = ctx.xDomain[1] - ctx.xDomain[0];
      const threshold = domainRange * 0.001;

      // Only update if the hovered point has changed
      if (
        currentX === undefined ||
        currentSeriesIdx !== closestSeriesIdx ||
        Math.abs(currentX - point.x) > threshold
      ) {
        const series = ctx.series[closestSeriesIdx];
        const xFormatter = ctx.xAxis?.formatter;
        const yFormatter = ctx.yAxis?.formatter;

        ctx.setHoveredPoint({
          seriesIdx: closestSeriesIdx,
          pointIdx: 0, // Not used, keeping for backwards compatibility
          screenX: closestScreenX,
          screenY: closestScreenY,
          data: {
            xValue: point.x,
            point: point,
          },
        });

        ctx.setTooltipData({
          title: series.name,
          items: [
            {
              label: "X",
              value: xFormatter
                ? xFormatter(point.x)
                : point.x.toFixed(2),
            },
            {
              label: "Y",
              value: yFormatter
                ? yFormatter(point.y)
                : point.y.toFixed(2),
              color: series.color,
            },
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

  // Recalculate dot position based on current data for streaming scenarios
  const dot = React.useMemo(() => {
    if (!ctx.hoveredPoint?.data?.point) return null;

    const point = ctx.hoveredPoint.data.point as Point;
    const series = ctx.series[ctx.hoveredPoint.seriesIdx];

    // Find current position of this point (in case data shifted)
    const currentPoint = series.data.find(
      (p) => Math.abs(p.x - point.x) < 0.0001
    );

    if (currentPoint) {
      return {
        screenX: ctx.xScale(currentPoint.x),
        screenY: ctx.yScale(currentPoint.y),
        color: series.color || "#3b82f6",
      };
    }
    return null;
  }, [ctx.hoveredPoint, ctx.series, ctx.xScale, ctx.yScale]);

  return (
    <>
      <ChartTooltip onHover={handleHover} />
      {ctx.hoveredPoint && ctx.tooltipData && dot && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: dot.screenX - 6,
            top: dot.screenY - 6,
          }}
        >
          <div
            className="w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900"
            style={{ backgroundColor: dot.color }}
          />
        </div>
      )}
    </>
  );
}

// ============================================================================
// Composed Component
// ============================================================================

export function AreaChart({
  series,
  xAxis = {},
  yAxis = {},
  width = 800,
  height = 400,
  showGrid = true,
  showAxes = true,
  showTooltip = false,
  preferWebGPU = true,
  stacked = false,
  className,
}: AreaChartProps) {
  return (
    <Root
      series={series}
      xAxis={xAxis}
      yAxis={yAxis}
      width={width}
      height={height}
      preferWebGPU={preferWebGPU}
      stacked={stacked}
      className={className}
    >
      <Canvas showGrid={showGrid} />
      {showAxes && <ChartAxes />}
      {showTooltip && <Tooltip />}
    </Root>
  );
}

AreaChart.Root = Root;
AreaChart.Canvas = Canvas;
AreaChart.Axes = ChartAxes;
AreaChart.Tooltip = Tooltip;

export default AreaChart;
