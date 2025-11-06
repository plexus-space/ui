"use client";

/**
 * WebGPU Line Renderer
 *
 * High-performance GPU-accelerated line rendering for waveforms and time-series data.
 * Built for medical, defense, and robotics applications.
 *
 * Features:
 * - Multi-trace support (render multiple series on one canvas)
 * - 10,000+ points per trace @ 60fps
 * - Auto-scaling domains
 * - WebGPU acceleration with automatic fallback detection
 *
 * @example
 * ```tsx
 * <LineRenderer
 *   traces={[
 *     { id: "ecg", data: [[0, 0.5], [1, 0.8]], color: [1, 0, 0] },
 *     { id: "spo2", data: [[0, 0.9], [1, 0.95]], color: [0, 0, 1] }
 *   ]}
 *   width={800}
 *   height={400}
 * />
 * ```
 */

import * as React from "react";
import { getWebGPUDevice, isWebGPUAvailable } from "./device";

// ============================================================================
// Types
// ============================================================================

export interface LineTrace {
  readonly id: string;
  readonly data: ReadonlyArray<readonly [number, number]>;
  readonly color?: readonly [number, number, number];
  readonly lineWidth?: number;
}

export interface LineRendererProps {
  readonly traces: ReadonlyArray<LineTrace>;
  readonly width: number;
  readonly height: number;
  readonly margin?: {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  };
  readonly xDomain?: readonly [number, number];
  readonly yDomain?: readonly [number, number];
  readonly backgroundColor?: readonly [number, number, number, number];
  readonly onReady?: () => void;
  readonly onError?: (error: Error) => void;
  readonly className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MARGIN = { top: 30, right: 30, bottom: 60, left: 70 };
const DEFAULT_COLOR: readonly [number, number, number] = [0.4, 0.7, 0.9];
const DEFAULT_BG_COLOR: readonly [number, number, number, number] = [
  0, 0, 0, 1,
];

// ============================================================================
// Shader
// ============================================================================

const SHADER = `
struct Uniforms {
  width: f32,
  height: f32,
  margin_left: f32,
  margin_top: f32,
  margin_right: f32,
  margin_bottom: f32,
  domain_x_min: f32,
  domain_x_max: f32,
  domain_y_min: f32,
  domain_y_max: f32,
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
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  // Calculate plot area
  let plot_width = uniforms.width - uniforms.margin_left - uniforms.margin_right;
  let plot_height = uniforms.height - uniforms.margin_top - uniforms.margin_bottom;

  // Normalize data to [0, 1]
  let x_norm = (input.position.x - uniforms.domain_x_min) / (uniforms.domain_x_max - uniforms.domain_x_min);
  let y_norm = (input.position.y - uniforms.domain_y_min) / (uniforms.domain_y_max - uniforms.domain_y_min);

  // Map to plot area (flip Y for screen coordinates)
  let x_plot = uniforms.margin_left + x_norm * plot_width;
  let y_plot = uniforms.margin_top + (1.0 - y_norm) * plot_height;

  // Convert to NDC [-1, 1]
  let x_ndc = (x_plot / uniforms.width) * 2.0 - 1.0;
  let y_ndc = 1.0 - (y_plot / uniforms.height) * 2.0;

  output.position = vec4f(x_ndc, y_ndc, 0.0, 1.0);
  output.color = input.color;

  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  return vec4f(input.color, 1.0);
}
`;

// ============================================================================
// Utility Functions
// ============================================================================

function calculateDomain(traces: ReadonlyArray<LineTrace>): {
  x: [number, number];
  y: [number, number];
} {
  if (traces.length === 0 || traces.every((t) => t.data.length === 0)) {
    return { x: [0, 1], y: [0, 1] };
  }

  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;

  for (const trace of traces) {
    for (const [x, y] of trace.data) {
      if (x < xMin) xMin = x;
      if (x > xMax) xMax = x;
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
  }

  // Add 5% padding
  const xPadding = (xMax - xMin) * 0.05 || 0.1;
  const yPadding = (yMax - yMin) * 0.05 || 0.1;

  return {
    x: [xMin - xPadding, xMax + xPadding],
    y: [yMin - yPadding, yMax + yPadding],
  };
}

function createVertexData(traces: ReadonlyArray<LineTrace>): Float32Array {
  // Count vertices: each line segment = 2 vertices
  let vertexCount = 0;
  for (const trace of traces) {
    if (trace.data.length >= 2) {
      vertexCount += (trace.data.length - 1) * 2;
    }
  }

  // 5 floats per vertex: x, y, r, g, b
  const data = new Float32Array(vertexCount * 5);
  let offset = 0;

  for (const trace of traces) {
    if (trace.data.length < 2) continue;

    const color = trace.color || DEFAULT_COLOR;
    const points = trace.data;

    // Convert line strip to line segments
    for (let i = 0; i < points.length - 1; i++) {
      // First vertex
      data[offset++] = points[i][0];
      data[offset++] = points[i][1];
      data[offset++] = color[0];
      data[offset++] = color[1];
      data[offset++] = color[2];

      // Second vertex
      data[offset++] = points[i + 1][0];
      data[offset++] = points[i + 1][1];
      data[offset++] = color[0];
      data[offset++] = color[1];
      data[offset++] = color[2];
    }
  }

  return data;
}

function createUniformData(
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number },
  xDomain: readonly [number, number],
  yDomain: readonly [number, number]
): Float32Array {
  return new Float32Array([
    width,
    height,
    margin.left,
    margin.top,
    margin.right,
    margin.bottom,
    xDomain[0],
    xDomain[1],
    yDomain[0],
    yDomain[1],
  ]);
}

// ============================================================================
// Renderer Hook
// ============================================================================

interface RendererState {
  device: GPUDevice;
  context: GPUCanvasContext;
  pipeline: GPURenderPipeline;
}

function useRenderer(
  canvas: HTMLCanvasElement | null,
  width: number,
  height: number,
  onReady: (() => void) | undefined,
  onError: ((error: Error) => void) | undefined
) {
  const [state, setState] = React.useState<RendererState | null>(null);

  React.useEffect(() => {
    if (!canvas) return;

    let mounted = true;

    (async () => {
      try {
        if (!isWebGPUAvailable()) {
          throw new Error("WebGPU not supported in this browser");
        }

        const deviceInfo = await getWebGPUDevice({ canvas });
        if (!deviceInfo?.context) {
          throw new Error("Failed to initialize WebGPU");
        }

        const { device, context } = deviceInfo;
        const format = navigator.gpu.getPreferredCanvasFormat();

        const shaderModule = device.createShaderModule({
          label: "Line Shader",
          code: SHADER,
        });

        const pipeline = device.createRenderPipeline({
          label: "Line Pipeline",
          layout: "auto",
          vertex: {
            module: shaderModule,
            entryPoint: "vertexMain",
            buffers: [
              {
                arrayStride: 5 * 4, // 5 floats × 4 bytes
                attributes: [
                  { shaderLocation: 0, offset: 0, format: "float32x2" }, // position
                  { shaderLocation: 1, offset: 8, format: "float32x3" }, // color
                ],
              },
            ],
          },
          fragment: {
            module: shaderModule,
            entryPoint: "fragmentMain",
            targets: [{ format }],
          },
          primitive: {
            topology: "line-list",
          },
        });

        if (mounted) {
          setState({ device, context, pipeline });
          onReady?.();
        }
      } catch (error) {
        if (mounted) {
          onError?.(error as Error);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [canvas, width, height, onReady, onError]);

  return state;
}

// ============================================================================
// Render Function
// ============================================================================

function render(
  state: RendererState,
  traces: ReadonlyArray<LineTrace>,
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number },
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
  backgroundColor: readonly [number, number, number, number]
): void {
  const { device, context, pipeline } = state;

  // Create vertex data
  const vertexData = createVertexData(traces);
  if (vertexData.length === 0) return;

  const vertexBuffer = device.createBuffer({
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertexData.buffer);

  // Create uniform data
  const uniformData = createUniformData(
    width,
    height,
    margin,
    xDomain,
    yDomain
  );
  const uniformBuffer = device.createBuffer({
    size: uniformData.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(uniformBuffer, 0, uniformData.buffer);

  // Create bind group
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  // Render
  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();

  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        clearValue: {
          r: backgroundColor[0],
          g: backgroundColor[1],
          b: backgroundColor[2],
          a: backgroundColor[3],
        },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });

  renderPass.setPipeline(pipeline);
  renderPass.setVertexBuffer(0, vertexBuffer);
  renderPass.setBindGroup(0, bindGroup);
  renderPass.draw(vertexData.length / 5);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);

  // Cleanup
  vertexBuffer.destroy();
  uniformBuffer.destroy();
}

// ============================================================================
// React Component
// ============================================================================

export const LineRenderer: React.FC<LineRendererProps> = ({
  traces,
  width,
  height,
  margin = DEFAULT_MARGIN,
  xDomain,
  yDomain,
  backgroundColor = DEFAULT_BG_COLOR,
  onReady,
  onError,
  className,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const state = useRenderer(canvasRef.current, width, height, onReady, onError);
  const frameRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (!state || traces.length === 0) return;

    // Calculate domains
    const autoDomain = calculateDomain(traces);
    const finalXDomain = xDomain || autoDomain.x;
    const finalYDomain = yDomain || autoDomain.y;

    // Render loop
    const renderLoop = () => {
      render(
        state,
        traces,
        width,
        height,
        margin,
        finalXDomain,
        finalYDomain,
        backgroundColor
      );
      frameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [state, traces, width, height, margin, xDomain, yDomain, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: "block", width: "100%", height: "100%" }}
      className={className}
    />
  );
};

export const WebGPULineRenderer = LineRenderer;
