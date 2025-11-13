/**
 * Timeline Component
 *
 * A GPU-accelerated event timeline for mission logs, system events, and temporal data.
 * Displays events across multiple lanes with color-coded severity levels.
 *
 * Features:
 * - Multi-lane event visualization
 * - Event types: info, warning, error, success, milestone
 * - Duration spans and point events
 * - Metadata support for additional event details
 * - Horizontal scrolling for large timespans
 * - WebGPU-accelerated rendering with WebGL fallback
 *
 * @example
 * ```tsx
 * import { Timeline } from "@/components/charts";
 *
 * <Timeline
 *   lanes={[
 *     {
 *       id: "system",
 *       label: "System Events",
 *       events: [
 *         { id: "1", timestamp: 100, type: "info", label: "Boot" }
 *       ]
 *     }
 *   ]}
 *   width={1000}
 *   height={400}
 * />
 * ```
 *
 * @module timeline
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
// Timeline Types
// ============================================================================

export type EventType = "info" | "warning" | "error" | "success" | "milestone";

export interface TimelineEvent {
  id: string;
  timestamp: number;
  label: string;
  description?: string;
  type?: EventType;
  duration?: number; // For event spans
  metadata?: Record<string, unknown>;
}

export interface TimelineLane {
  id: string;
  name: string;
  events: TimelineEvent[];
  color?: string;
}

export interface TimelineProps {
  lanes: TimelineLane[];
  orientation?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  showAxes?: boolean;
  minTime?: number;
  maxTime?: number;
  className?: string;
  preferWebGPU?: boolean;
}

interface TimelineContextType {
  lanes: TimelineLane[];
  orientation: "horizontal" | "vertical";
  minTime: number;
  maxTime: number;
  hoveredEvent: TimelineEvent | null;
  setHoveredEvent: (event: TimelineEvent | null) => void;
}

const TimelineContext = createContext<TimelineContextType | null>(null);

function useTimelineData() {
  const ctx = useContext(TimelineContext);
  if (!ctx) {
    throw new Error("Timeline components must be used within Timeline.Root");
  }
  return ctx;
}

function useTimeline() {
  const baseCtx = useBaseChart();
  const timelineCtx = useTimelineData();
  return { ...baseCtx, ...timelineCtx };
}

// ============================================================================
// Event Colors
// ============================================================================

const EVENT_COLORS = {
  info: "#3b82f6",
  warning: "#f59e0b",
  error: "#ef4444",
  success: "#10b981",
  milestone: "#8b5cf6",
};

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

const POINT_VERTEX_SHADER = `
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

const POINT_FRAGMENT_SHADER = `
precision mediump float;
varying vec4 v_color;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) {
    discard;
  }
  float alpha = v_color.a * (1.0 - dist * 2.0);
  gl_FragColor = vec4(v_color.rgb, alpha);
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
// Timeline Renderers
// ============================================================================

interface TimelineRendererProps extends RendererProps {
  lanes: TimelineLane[];
  minTime: number;
  maxTime: number;
  orientation: "horizontal" | "vertical";
}

function createWebGLTimelineRenderer(
  canvas: HTMLCanvasElement
): WebGLRenderer<TimelineRendererProps> {
  const lineBuffers = {
    position: null as WebGLBuffer | null,
    color: null as WebGLBuffer | null,
  };

  const pointBuffers = {
    position: null as WebGLBuffer | null,
    color: null as WebGLBuffer | null,
    size: null as WebGLBuffer | null,
  };

  let lineProgram: WebGLProgram | null = null;
  let pointProgram: WebGLProgram | null = null;

  const renderer = createWebGLRenderer<TimelineRendererProps>({
    canvas,
    createShaders: () => ({
      vertexSource: VERTEX_SHADER,
      fragmentSource: FRAGMENT_SHADER,
    }),
    onRender: (gl, program, props) => {
      const { lanes, minTime, maxTime, width, height, margin } = props;

      if (!lineProgram) {
        lineProgram = program;
      }

      // Create point program
      if (!pointProgram) {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, POINT_VERTEX_SHADER);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fragmentShader, POINT_FRAGMENT_SHADER);
        gl.compileShader(fragmentShader);

        pointProgram = gl.createProgram()!;
        gl.attachShader(pointProgram, vertexShader);
        gl.attachShader(pointProgram, fragmentShader);
        gl.linkProgram(pointProgram);
      }

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const matrix = [1, 0, 0, 0, 1, 0, margin.left, margin.top, 1];

      // Draw lane lines
      gl.useProgram(lineProgram);
      gl.uniform2f(gl.getUniformLocation(lineProgram, "u_resolution"), width, height);
      gl.uniformMatrix3fv(gl.getUniformLocation(lineProgram, "u_matrix"), false, matrix);

      const linePositions: number[] = [];
      const lineColors: number[] = [];
      const laneColor = hexToRgb("#334155");

      const laneHeight = innerHeight / lanes.length;

      for (let i = 0; i < lanes.length; i++) {
        const y = i * laneHeight;

        // Lane separator line
        linePositions.push(0, y, innerWidth, y);
        lineColors.push(...laneColor, 0.3, ...laneColor, 0.3);
      }

      if (!lineBuffers.position) {
        lineBuffers.position = gl.createBuffer();
      }
      if (!lineBuffers.color) {
        lineBuffers.color = gl.createBuffer();
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffers.position);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePositions), gl.STATIC_DRAW);
      const linePosLoc = gl.getAttribLocation(lineProgram, "a_position");
      gl.enableVertexAttribArray(linePosLoc);
      gl.vertexAttribPointer(linePosLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffers.color);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineColors), gl.STATIC_DRAW);
      const lineColorLoc = gl.getAttribLocation(lineProgram, "a_color");
      gl.enableVertexAttribArray(lineColorLoc);
      gl.vertexAttribPointer(lineColorLoc, 4, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.LINES, 0, linePositions.length / 2);

      // Draw events
      gl.useProgram(pointProgram);
      gl.uniform2f(gl.getUniformLocation(pointProgram, "u_resolution"), width, height);
      gl.uniformMatrix3fv(gl.getUniformLocation(pointProgram, "u_matrix"), false, matrix);

      const pointPositions: number[] = [];
      const pointColors: number[] = [];
      const pointSizes: number[] = [];

      const timeRange = maxTime - minTime;

      for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i];
        const y = i * laneHeight + laneHeight / 2;

        for (const event of lane.events) {
          const x = ((event.timestamp - minTime) / timeRange) * innerWidth;
          const color = hexToRgb(EVENT_COLORS[event.type || "info"]);

          pointPositions.push(x, y);
          pointColors.push(...color, 1);
          pointSizes.push(12);

          // Draw duration span if present
          if (event.duration) {
            const endX = ((event.timestamp + event.duration - minTime) / timeRange) * innerWidth;
            const spanHeight = laneHeight * 0.4;

            // Add to line geometry
            const y1 = y - spanHeight / 2;
            const y2 = y + spanHeight / 2;

            linePositions.push(x, y1, endX, y1);
            linePositions.push(endX, y1, endX, y2);
            linePositions.push(endX, y2, x, y2);
            linePositions.push(x, y2, x, y1);

            for (let j = 0; j < 8; j++) {
              lineColors.push(...color, 0.3);
            }
          }
        }
      }

      // Redraw lines with event durations
      if (linePositions.length > lineColors.length / 4) {
        // biome-ignore lint/correctness/useHookAtTopLevel: These are WebGL API calls, not React hooks
        gl.useProgram(lineProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePositions), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffers.color);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineColors), gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.LINES, 0, linePositions.length / 2);
        // biome-ignore lint/correctness/useHookAtTopLevel: These are WebGL API calls, not React hooks
        gl.useProgram(pointProgram);
      }

      // Draw event points
      if (!pointBuffers.position) {
        pointBuffers.position = gl.createBuffer();
      }
      if (!pointBuffers.color) {
        pointBuffers.color = gl.createBuffer();
      }
      if (!pointBuffers.size) {
        pointBuffers.size = gl.createBuffer();
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffers.position);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPositions), gl.STATIC_DRAW);
      const pointPosLoc = gl.getAttribLocation(pointProgram, "a_position");
      gl.enableVertexAttribArray(pointPosLoc);
      gl.vertexAttribPointer(pointPosLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffers.color);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointColors), gl.STATIC_DRAW);
      const pointColorLoc = gl.getAttribLocation(pointProgram, "a_color");
      gl.enableVertexAttribArray(pointColorLoc);
      gl.vertexAttribPointer(pointColorLoc, 4, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffers.size);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointSizes), gl.STATIC_DRAW);
      const pointSizeLoc = gl.getAttribLocation(pointProgram, "a_size");
      gl.enableVertexAttribArray(pointSizeLoc);
      gl.vertexAttribPointer(pointSizeLoc, 1, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, pointPositions.length / 2);
    },
  });

  return renderer;
}

async function createWebGPUTimelineRenderer(
  canvas: HTMLCanvasElement,
  device: GPUDevice
): Promise<WebGPURenderer<TimelineRendererProps>> {
  const buffers: {
    position: GPUBuffer | null;
    color: GPUBuffer | null;
    uniform: GPUBuffer | null;
  } = {
    position: null,
    color: null,
    uniform: null,
  };

  return createWebGPURenderer<TimelineRendererProps>({
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
          topology: "line-list",
        },
      });

      return pipeline;
    },
    onRender: async (device, context, pipeline, props) => {
      const { lanes, minTime, maxTime, width, height, margin } = props;

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const linePositions: number[] = [];
      const lineColors: number[] = [];
      const laneColor = hexToRgb("#334155");

      const laneHeight = innerHeight / lanes.length;

      for (let i = 0; i < lanes.length; i++) {
        const y = i * laneHeight;

        // Lane separator line
        linePositions.push(0, y, innerWidth, y);
        lineColors.push(...laneColor, 0.3, ...laneColor, 0.3);
      }

      const timeRange = maxTime - minTime;

      for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i];
        const y = i * laneHeight + laneHeight / 2;

        for (const event of lane.events) {
          const x = ((event.timestamp - minTime) / timeRange) * innerWidth;
          const color = hexToRgb(EVENT_COLORS[event.type || "info"]);

          // Draw duration span if present
          if (event.duration) {
            const endX = ((event.timestamp + event.duration - minTime) / timeRange) * innerWidth;
            const spanHeight = laneHeight * 0.4;

            const y1 = y - spanHeight / 2;
            const y2 = y + spanHeight / 2;

            linePositions.push(x, y1, endX, y1);
            linePositions.push(endX, y1, endX, y2);
            linePositions.push(endX, y2, x, y2);
            linePositions.push(x, y2, x, y1);

            for (let j = 0; j < 8; j++) {
              lineColors.push(...color, 0.3);
            }
          }
        }
      }

      // Create or update buffers
      const positionData = new Float32Array(linePositions);
      const colorData = new Float32Array(lineColors);

      if (!buffers.position || buffers.position.size < positionData.byteLength * 1.5) {
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
      const uniformData = new Float32Array([width, height, margin.left, margin.top]);
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
      passEncoder.draw(linePositions.length / 2, 1, 0, 0);
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

interface RootProps extends TimelineProps {
  children: React.ReactNode;
}

function Root({
  children,
  lanes,
  orientation = "horizontal",
  width = 1000,
  height = 400,
  minTime,
  maxTime,
  preferWebGPU = false,
  className,
}: RootProps) {
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);

  // Calculate min/max time from data if not provided
  const calculatedMinTime =
    minTime ?? Math.min(...lanes.flatMap((lane) => lane.events.map((e) => e.timestamp)));
  const calculatedMaxTime =
    maxTime ??
    Math.max(...lanes.flatMap((lane) => lane.events.map((e) => e.timestamp + (e.duration || 0))));

  const timelineData: TimelineContextType = {
    lanes,
    orientation,
    minTime: calculatedMinTime,
    maxTime: calculatedMaxTime,
    hoveredEvent,
    setHoveredEvent,
  };

  return (
    <TimelineContext.Provider value={timelineData}>
      <ChartRoot
        width={width}
        height={height}
        preferWebGPU={preferWebGPU}
        className={className}
        margin={{ top: 40, right: 40, bottom: 60, left: 120 }}
      >
        {children}
      </ChartRoot>
    </TimelineContext.Provider>
  );
}

// ============================================================================
// Canvas Component
// ============================================================================

function Canvas() {
  const ctx = useTimeline();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<
    WebGLRenderer<TimelineRendererProps> | WebGPURenderer<TimelineRendererProps> | null
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
      const props: TimelineRendererProps = {
        canvas,
        lanes: ctx.lanes,
        minTime: ctx.minTime,
        maxTime: ctx.maxTime,
        orientation: ctx.orientation,
        width: canvas.width,
        height: canvas.height,
        margin: ctx.margin,
        xDomain: [ctx.minTime, ctx.maxTime],
        yDomain: [0, ctx.lanes.length],
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
        createWebGPUTimelineRenderer(canvas, ctx.gpuDevice)
          .then((renderer) => {
            rendererRef.current = renderer;
            setIsInitializing(false);
            renderProps();
          })
          .catch((error) => {
            console.error("Failed to create WebGPU renderer:", error);
            rendererRef.current = createWebGLTimelineRenderer(canvas);
            setIsInitializing(false);
            renderProps();
          });
        return;
      } else {
        rendererRef.current = createWebGLTimelineRenderer(canvas);
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
// Lane Labels Component
// ============================================================================

function LaneLabels() {
  const ctx = useTimeline();

  const laneHeight = (ctx.height - ctx.margin.top - ctx.margin.bottom) / ctx.lanes.length;

  return (
    <>
      {ctx.lanes.map((lane, i) => {
        const y = ctx.margin.top + i * laneHeight + laneHeight / 2;

        return (
          <div
            key={lane.id}
            className="absolute text-sm font-medium text-zinc-400 pointer-events-none"
            style={{
              left: 10,
              top: y,
              transform: "translateY(-50%)",
            }}
          >
            {lane.name}
          </div>
        );
      })}
    </>
  );
}

// ============================================================================
// Composed Component
// ============================================================================

export function Timeline({
  lanes,
  orientation = "horizontal",
  width = 1000,
  height = 400,
  showAxes = true,
  minTime,
  maxTime,
  preferWebGPU = false,
  className,
}: TimelineProps) {
  return (
    <Root
      lanes={lanes}
      orientation={orientation}
      width={width}
      height={height}
      minTime={minTime}
      maxTime={maxTime}
      preferWebGPU={preferWebGPU}
      className={className}
    >
      <Canvas />
      <LaneLabels />
      {showAxes && <ChartAxes />}
    </Root>
  );
}

Timeline.Root = Root;
Timeline.Canvas = Canvas;
Timeline.LaneLabels = LaneLabels;
Timeline.Axes = ChartAxes;

export default Timeline;
