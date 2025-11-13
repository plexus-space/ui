/**
 * Waterfall Chart Component
 *
 * A GPU-accelerated spectrogram display for real-time frequency analysis.
 * Visualizes signal power across frequency and time dimensions.
 *
 * Features:
 * - Time-frequency heatmap visualization
 * - Multiple colormap support (viridis, plasma, inferno, thermal)
 * - Real-time streaming data support
 * - Efficient rendering of large frequency bins
 * - dBFS power scale
 * - WebGPU-accelerated rendering with WebGL fallback
 *
 * @example
 * ```tsx
 * import { WaterfallChart } from "@/components/charts";
 *
 * <WaterfallChart
 *   data={frequencyData}
 *   colormap="viridis"
 *   minDb={-100}
 *   maxDb={0}
 *   width={800}
 *   height={600}
 * />
 * ```
 *
 * @module waterfall-chart
 */
"use client";

import { createContext, useContext, useRef, useEffect, useState } from "react";
import {
  createWebGLRenderer,
  createWebGPURenderer,
  ChartRoot,
  ChartAxes,
  hexToRgb,
  type RendererProps,
  type WebGLRenderer,
  type WebGPURenderer,
  useBaseChart,
} from "./base-chart";

// ============================================================================
// Waterfall Chart Types
// ============================================================================

export interface WaterfallData {
  time: number;
  frequencies: number[]; // Array of intensity values (0-1) for each frequency bin
}

export interface WaterfallChartProps {
  data: WaterfallData[];
  minFrequency?: number;
  maxFrequency?: number;
  colormap?: "viridis" | "plasma" | "inferno" | "thermal";
  width?: number;
  height?: number;
  showAxes?: boolean;
  xAxis?: {
    label?: string;
    formatter?: (value: number) => string;
  };
  yAxis?: {
    label?: string;
    formatter?: (value: number) => string;
  };
  className?: string;
  preferWebGPU?: boolean;
}

interface WaterfallChartContextType {
  data: WaterfallData[];
  minFrequency: number;
  maxFrequency: number;
  colormap: "viridis" | "plasma" | "inferno" | "thermal";
}

const WaterfallChartContext = createContext<WaterfallChartContextType | null>(
  null
);

function useWaterfallChartData() {
  const ctx = useContext(WaterfallChartContext);
  if (!ctx) {
    throw new Error(
      "Waterfall components must be used within WaterfallChart.Root"
    );
  }
  return ctx;
}

function useWaterfallChart() {
  const baseCtx = useBaseChart();
  const waterfallCtx = useWaterfallChartData();
  return { ...baseCtx, ...waterfallCtx };
}

// ============================================================================
// Colormaps
// ============================================================================

const COLORMAPS = {
  viridis: [
    [68, 1, 84],
    [72, 40, 120],
    [62, 73, 137],
    [49, 104, 142],
    [38, 130, 142],
    [31, 158, 137],
    [53, 183, 121],
    [109, 205, 89],
    [180, 222, 44],
    [253, 231, 37],
  ],
  plasma: [
    [13, 8, 135],
    [75, 3, 161],
    [125, 3, 168],
    [168, 34, 150],
    [203, 70, 121],
    [229, 107, 93],
    [248, 148, 65],
    [253, 195, 40],
    [244, 237, 69],
    [240, 249, 33],
  ],
  inferno: [
    [0, 0, 4],
    [40, 11, 84],
    [101, 21, 110],
    [159, 42, 99],
    [212, 72, 66],
    [245, 125, 21],
    [250, 193, 39],
    [245, 239, 97],
    [252, 255, 164],
  ],
  thermal: [
    [0, 0, 0],
    [128, 0, 128],
    [255, 0, 0],
    [255, 128, 0],
    [255, 255, 0],
    [255, 255, 255],
  ],
};

function getColorFromMap(
  value: number,
  colormap: keyof typeof COLORMAPS
): [number, number, number] {
  const colors = COLORMAPS[colormap];
  const scaledValue = Math.max(0, Math.min(1, value));
  const index = scaledValue * (colors.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const t = index - lowerIndex;

  const lower = colors[lowerIndex];
  const upper = colors[upperIndex];

  return [
    Math.round(lower[0] + (upper[0] - lower[0]) * t),
    Math.round(lower[1] + (upper[1] - lower[1]) * t),
    Math.round(lower[2] + (upper[2] - lower[2]) * t),
  ];
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

// WGSL Shaders for WebGPU
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
  margin: vec4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  var position = vec2f(
    input.position.x + uniforms.margin.x,
    input.position.y + uniforms.margin.y
  );
  var clipSpace = (position / uniforms.resolution) * 2.0 - 1.0;
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
// Waterfall Renderers
// ============================================================================

interface WaterfallRendererProps extends RendererProps {
  data: WaterfallData[];
  colormap: keyof typeof COLORMAPS;
}

function createWebGLWaterfallRenderer(
  canvas: HTMLCanvasElement
): WebGLRenderer<WaterfallRendererProps> {
  const buffers = {
    position: null as WebGLBuffer | null,
    color: null as WebGLBuffer | null,
  };

  const renderer = createWebGLRenderer<WaterfallRendererProps>({
    canvas,
    createShaders: () => ({
      vertexSource: VERTEX_SHADER,
      fragmentSource: FRAGMENT_SHADER,
    }),
    onRender: (gl, program, props) => {
      const { data, colormap, width, height, margin } = props;

      if (data.length === 0) return;

      gl.useProgram(program);

      const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
      gl.uniform2f(resolutionLoc, width, height);

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      const matrix = [1, 0, 0, 0, 1, 0, margin.left, margin.top, 1];
      const matrixLoc = gl.getUniformLocation(program, "u_matrix");
      gl.uniformMatrix3fv(matrixLoc, false, matrix);

      const positions: number[] = [];
      const colors: number[] = [];

      const binCount = data[0].frequencies.length;
      const binWidth = innerWidth / binCount;
      const rowHeight = innerHeight / data.length;

      // Render each time slice as a row
      for (let t = 0; t < data.length; t++) {
        const slice = data[t];
        const y = t * rowHeight;

        for (let f = 0; f < slice.frequencies.length; f++) {
          const x = f * binWidth;
          const intensity = slice.frequencies[f];
          const color = getColorFromMap(intensity, colormap);

          // Create a quad for this bin
          const x1 = x;
          const y1 = y;
          const x2 = x + binWidth;
          const y2 = y + rowHeight;

          // Triangle 1
          positions.push(x1, y1, x2, y1, x1, y2);
          // Triangle 2
          positions.push(x2, y1, x2, y2, x1, y2);

          // Colors for both triangles
          for (let i = 0; i < 6; i++) {
            colors.push(color[0] / 255, color[1] / 255, color[2] / 255, 1);
          }
        }
      }

      if (!buffers.position) {
        buffers.position = gl.createBuffer();
      }
      if (!buffers.color) {
        buffers.color = gl.createBuffer();
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.DYNAMIC_DRAW
      );
      const positionLoc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
      const colorLoc = gl.getAttribLocation(program, "a_color");
      gl.enableVertexAttribArray(colorLoc);
      gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    },
  });

  return renderer;
}

async function createWebGPUWaterfallRenderer(
  canvas: HTMLCanvasElement,
  device: GPUDevice
): Promise<WebGPURenderer<WaterfallRendererProps>> {
  const buffers: {
    position: GPUBuffer | null;
    color: GPUBuffer | null;
    uniform: GPUBuffer | null;
  } = {
    position: null,
    color: null,
    uniform: null,
  };

  return createWebGPURenderer<WaterfallRendererProps>({
    canvas,
    device,
    createPipeline: (device: GPUDevice, format: GPUTextureFormat) => {
      const shaderModule = device.createShaderModule({
        code: WGSL_SHADER,
      });

      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vertexMain",
          buffers: [
            {
              arrayStride: 2 * 4,
              attributes: [
                {
                  shaderLocation: 0,
                  offset: 0,
                  format: "float32x2",
                },
              ],
            },
            {
              arrayStride: 4 * 4,
              attributes: [
                {
                  shaderLocation: 1,
                  offset: 0,
                  format: "float32x4",
                },
              ],
            },
          ],
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fragmentMain",
          targets: [
            {
              format,
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
        primitive: {
          topology: "triangle-list",
        },
      });

      return pipeline;
    },
    onRender: async (device, context, pipeline, props) => {
      const { data, colormap, width, height, margin } = props;

      if (data.length === 0) return;

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const positions: number[] = [];
      const colors: number[] = [];

      const binCount = data[0].frequencies.length;
      const binWidth = innerWidth / binCount;
      const rowHeight = innerHeight / data.length;

      // Render each time slice as a row
      for (let t = 0; t < data.length; t++) {
        const slice = data[t];
        const y = t * rowHeight;

        for (let f = 0; f < slice.frequencies.length; f++) {
          const x = f * binWidth;
          const intensity = slice.frequencies[f];
          const color = getColorFromMap(intensity, colormap);

          const x1 = x;
          const y1 = y;
          const x2 = x + binWidth;
          const y2 = y + rowHeight;

          // Triangle 1
          positions.push(x1, y1, x2, y1, x1, y2);
          // Triangle 2
          positions.push(x2, y1, x2, y2, x1, y2);

          // Colors for both triangles
          for (let i = 0; i < 6; i++) {
            colors.push(color[0] / 255, color[1] / 255, color[2] / 255, 1);
          }
        }
      }

      // Create or update buffers
      const positionData = new Float32Array(positions);
      const colorData = new Float32Array(colors);

      if (
        !buffers.position ||
        buffers.position.size < positionData.byteLength * 1.5
      ) {
        buffers.position?.destroy();
        buffers.position = device.createBuffer({
          size: Math.ceil(positionData.byteLength * 1.5),
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
      }

      if (!buffers.color || buffers.color.size < colorData.byteLength * 1.5) {
        buffers.color?.destroy();
        buffers.color = device.createBuffer({
          size: Math.ceil(colorData.byteLength * 1.5),
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
      }

      device.queue.writeBuffer(buffers.position, 0, positionData);
      device.queue.writeBuffer(buffers.color, 0, colorData);

      // Create uniform buffer
      const uniformData = new Float32Array([
        width,
        height,
        margin.left,
        margin.top,
      ]);
      if (!buffers.uniform) {
        buffers.uniform = device.createBuffer({
          size: 32,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
      }
      device.queue.writeBuffer(buffers.uniform, 0, uniformData);

      // Create bind group
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: buffers.uniform,
            },
          },
        ],
      });

      // Render
      const commandEncoder = device.createCommandEncoder();
      const textureView = context.getCurrentTexture().createView();

      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      };

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      passEncoder.setPipeline(pipeline);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.setVertexBuffer(0, buffers.position);
      passEncoder.setVertexBuffer(1, buffers.color);
      passEncoder.draw(positions.length / 2, 1, 0, 0);
      passEncoder.end();

      device.queue.submit([commandEncoder.finish()]);
    },
    onDestroy: () => {
      buffers.position?.destroy();
      buffers.color?.destroy();
      buffers.uniform?.destroy();
    },
  });
}

// ============================================================================
// Root Component
// ============================================================================

interface RootProps extends WaterfallChartProps {
  children: React.ReactNode;
}

function Root({
  children,
  data,
  minFrequency = 0,
  maxFrequency = 1000,
  colormap = "viridis",
  width = 800,
  height = 600,
  preferWebGPU = false,
  className,
}: RootProps) {
  const waterfallData: WaterfallChartContextType = {
    data,
    minFrequency,
    maxFrequency,
    colormap,
  };

  return (
    <WaterfallChartContext.Provider value={waterfallData}>
      <ChartRoot
        width={width}
        height={height}
        preferWebGPU={preferWebGPU}
        className={className}
        margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
      >
        {children}
      </ChartRoot>
    </WaterfallChartContext.Provider>
  );
}

// ============================================================================
// Canvas Component
// ============================================================================

function Canvas() {
  const ctx = useWaterfallChart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<
    | WebGLRenderer<WaterfallRendererProps>
    | WebGPURenderer<WaterfallRendererProps>
    | null
  >(null);

  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || isInitializing) return;
    if (ctx.renderMode === null) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = ctx.width * dpr;
    canvas.height = ctx.height * dpr;
    canvas.style.width = `${ctx.width}px`;
    canvas.style.height = `${ctx.height}px`;

    const renderProps = () => {
      const props: WaterfallRendererProps = {
        data: ctx.data,
        colormap: ctx.colormap,
        width: canvas.width,
        height: canvas.height,
        margin: ctx.margin,
        xDomain: [0, 1],
        yDomain: [0, 1],
        xTicks: [],
        yTicks: [],
        showGrid: false,
      };
      if (rendererRef.current) {
        rendererRef.current.render(props);
      }
    };

    if (!rendererRef.current) {
      if (ctx.renderMode === "webgpu" && ctx.gpuDevice) {
        setIsInitializing(true);
        createWebGPUWaterfallRenderer(canvas, ctx.gpuDevice)
          .then((renderer) => {
            rendererRef.current = renderer;
            setIsInitializing(false);
            renderProps();
          })
          .catch((error) => {
            console.error("Failed to create WebGPU renderer:", error);
            rendererRef.current = createWebGLWaterfallRenderer(canvas);
            setIsInitializing(false);
            renderProps();
          });
        return;
      } else {
        rendererRef.current = createWebGLWaterfallRenderer(canvas);
      }
    }

    renderProps();
  }, [ctx, isInitializing]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// ============================================================================
// Colorbar Legend Component
// ============================================================================

function Colorbar() {
  const ctx = useWaterfallChart();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const width = 30;
    const height = 200;
    canvas.width = width;
    canvas.height = height;

    // Draw color gradient
    for (let i = 0; i < height; i++) {
      const value = 1 - i / height;
      const color = getColorFromMap(value, ctx.colormap);
      context.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      context.fillRect(0, i, width, 1);
    }
  }, [ctx.colormap]);

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
      <div className="text-xs text-zinc-500">High</div>
      <canvas ref={canvasRef} className="border border-zinc-700" />
      <div className="text-xs text-zinc-500">Low</div>
    </div>
  );
}

// ============================================================================
// Composed Component
// ============================================================================

export function WaterfallChart({
  data,
  minFrequency = 0,
  maxFrequency = 1000,
  colormap = "viridis",
  width = 800,
  height = 600,
  showAxes = true,
  preferWebGPU = false,
  className,
}: WaterfallChartProps) {
  return (
    <Root
      data={data}
      minFrequency={minFrequency}
      maxFrequency={maxFrequency}
      colormap={colormap}
      width={width}
      height={height}
      preferWebGPU={preferWebGPU}
      className={className}
    >
      <Canvas />
      {showAxes && <ChartAxes />}
      <Colorbar />
    </Root>
  );
}

WaterfallChart.Root = Root;
WaterfallChart.Canvas = Canvas;
WaterfallChart.Axes = ChartAxes;
WaterfallChart.Colorbar = Colorbar;

export default WaterfallChart;
