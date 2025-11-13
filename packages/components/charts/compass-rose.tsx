/**
 * Compass Rose Component
 *
 * A GPU-accelerated rotating compass display for navigation and heading indication.
 * Shows current heading, desired heading bug, and cardinal/intercardinal directions.
 *
 * Features:
 * - 360-degree rotating compass card
 * - Heading bug for desired course
 * - Cardinal and intercardinal direction labels (N, NE, E, SE, S, SW, W, NW)
 * - Full and minimal display variants
 * - Degree markings every 10 degrees
 * - WebGPU-accelerated rendering with WebGL fallback
 *
 * @example
 * ```tsx
 * import { CompassRose } from "@/components/charts";
 *
 * <CompassRose
 *   heading={315}
 *   headingBug={340}
 *   variant="full"
 *   width={400}
 *   height={400}
 * />
 * ```
 *
 * @module compass-rose
 */
"use client";

import { createContext, useContext, useRef, useEffect, useState } from "react";
import {
  createWebGLRenderer,
  createWebGPURenderer,
  ChartRoot,
  hexToRgb,
  type RendererProps,
  type WebGLRenderer,
  type WebGPURenderer,
  useBaseChart,
} from "./base-chart";

// ============================================================================
// Compass Rose Types
// ============================================================================

export interface CompassRoseProps {
  heading?: number; // Degrees (0-360, 0 = North)
  desiredHeading?: number; // Optional heading bug
  showHeadingBug?: boolean;
  variant?: "full" | "minimal"; // full shows all degrees, minimal shows only cardinals
  width?: number;
  height?: number;
  roseColor?: string;
  headingColor?: string;
  bugColor?: string;
  className?: string;
  preferWebGPU?: boolean;
}

interface CompassRoseContextType {
  heading: number;
  desiredHeading?: number;
  showHeadingBug: boolean;
  variant: "full" | "minimal";
  roseColor: string;
  headingColor: string;
  bugColor: string;
}

const CompassRoseContext = createContext<CompassRoseContextType | null>(null);

function useCompassRoseData() {
  const ctx = useContext(CompassRoseContext);
  if (!ctx) {
    throw new Error("CompassRose components must be used within CompassRose.Root");
  }
  return ctx;
}

function useCompassRose() {
  const baseCtx = useBaseChart();
  const compassCtx = useCompassRoseData();
  return { ...baseCtx, ...compassCtx };
}

// ============================================================================
// Shaders
// ============================================================================

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec4 a_color;

uniform vec2 u_resolution;

varying vec4 v_color;

void main() {
  vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
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
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  var clipSpace = (input.position / uniforms.resolution) * 2.0 - 1.0;
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
// Geometry Helpers
// ============================================================================

function createLineGeometry(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  color: [number, number, number],
  alpha: number = 1
) {
  const positions: number[] = [];
  const colors: number[] = [];

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny = dx / len;

  const halfWidth = width / 2;

  positions.push(
    x1 + nx * halfWidth,
    y1 + ny * halfWidth,
    x2 + nx * halfWidth,
    y2 + ny * halfWidth,
    x1 - nx * halfWidth,
    y1 - ny * halfWidth
  );
  positions.push(
    x2 + nx * halfWidth,
    y2 + ny * halfWidth,
    x2 - nx * halfWidth,
    y2 - ny * halfWidth,
    x1 - nx * halfWidth,
    y1 - ny * halfWidth
  );

  for (let i = 0; i < 6; i++) {
    colors.push(...color, alpha);
  }

  return { positions, colors };
}

function createCompassCard(
  centerX: number,
  centerY: number,
  radius: number,
  heading: number,
  variant: "full" | "minimal",
  color: [number, number, number]
) {
  const positions: number[] = [];
  const colors: number[] = [];

  const headingRad = (heading * Math.PI) / 180;

  // Draw degree marks
  for (let deg = 0; deg < 360; deg += variant === "full" ? 5 : 30) {
    const angleRad = ((deg - 90) * Math.PI) / 180 - headingRad;

    const isCardinal = deg % 90 === 0;
    const isMajor = deg % 30 === 0;

    let innerRadius: number;
    let outerRadius: number;
    let lineWidth: number;
    let alpha: number;

    if (isCardinal) {
      innerRadius = radius - 35;
      outerRadius = radius - 5;
      lineWidth = 4;
      alpha = 1;
    } else if (isMajor) {
      innerRadius = radius - 25;
      outerRadius = radius - 5;
      lineWidth = 3;
      alpha = 0.8;
    } else {
      innerRadius = radius - 15;
      outerRadius = radius - 5;
      lineWidth = 2;
      alpha = 0.5;
    }

    const x1 = centerX + innerRadius * Math.cos(angleRad);
    const y1 = centerY + innerRadius * Math.sin(angleRad);
    const x2 = centerX + outerRadius * Math.cos(angleRad);
    const y2 = centerY + outerRadius * Math.sin(angleRad);

    const geom = createLineGeometry(x1, y1, x2, y2, lineWidth, color, alpha);
    positions.push(...geom.positions);
    colors.push(...geom.colors);
  }

  // Draw outer circle
  const segments = 64;
  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * Math.PI * 2;
    const a2 = ((i + 1) / segments) * Math.PI * 2;

    const innerR = radius - 3;
    const outerR = radius;

    const x1o = centerX + outerR * Math.cos(a1);
    const y1o = centerY + outerR * Math.sin(a1);
    const x2o = centerX + outerR * Math.cos(a2);
    const y2o = centerY + outerR * Math.sin(a2);

    const x1i = centerX + innerR * Math.cos(a1);
    const y1i = centerY + innerR * Math.sin(a1);
    const x2i = centerX + innerR * Math.cos(a2);
    const y2i = centerY + innerR * Math.sin(a2);

    positions.push(x1o, y1o, x2o, y2o, x1i, y1i);
    colors.push(...color, 0.6, ...color, 0.6, ...color, 0.6);

    positions.push(x2o, y2o, x2i, y2i, x1i, y1i);
    colors.push(...color, 0.6, ...color, 0.6, ...color, 0.6);
  }

  return { positions, colors };
}

function createHeadingIndicator(
  centerX: number,
  centerY: number,
  radius: number,
  color: [number, number, number]
) {
  const positions: number[] = [];
  const colors: number[] = [];

  // Triangle pointer at top
  const tipY = centerY - radius - 15;
  const baseY = centerY - radius + 5;
  const baseWidth = 12;

  positions.push(centerX, tipY, centerX - baseWidth, baseY, centerX + baseWidth, baseY);
  colors.push(...color, 1, ...color, 1, ...color, 1);

  // Vertical line from center to pointer
  const lineGeom = createLineGeometry(centerX, centerY, centerX, centerY - radius - 5, 3, color, 1);
  positions.push(...lineGeom.positions);
  colors.push(...lineGeom.colors);

  return { positions, colors };
}

function createHeadingBug(
  centerX: number,
  centerY: number,
  radius: number,
  heading: number,
  desiredHeading: number,
  color: [number, number, number]
) {
  const positions: number[] = [];
  const colors: number[] = [];

  // Calculate angle for the bug relative to current heading
  const headingDiff = desiredHeading - heading;
  const bugAngleRad = ((headingDiff - 90) * Math.PI) / 180;

  // Bug position on the outer circle
  const bugX = centerX + (radius + 10) * Math.cos(bugAngleRad);
  const bugY = centerY + (radius + 10) * Math.sin(bugAngleRad);

  // Triangle bug pointing inward
  const triangleSize = 10;
  const perpAngle1 = bugAngleRad + (2 * Math.PI) / 3;
  const perpAngle2 = bugAngleRad - (2 * Math.PI) / 3;

  const tipX = centerX + (radius + 2) * Math.cos(bugAngleRad);
  const tipY = centerY + (radius + 2) * Math.sin(bugAngleRad);

  const p1x = tipX;
  const p1y = tipY;
  const p2x = bugX + (triangleSize / 2) * Math.cos(perpAngle1);
  const p2y = bugY + (triangleSize / 2) * Math.sin(perpAngle1);
  const p3x = bugX + (triangleSize / 2) * Math.cos(perpAngle2);
  const p3y = bugY + (triangleSize / 2) * Math.sin(perpAngle2);

  positions.push(p1x, p1y, p2x, p2y, p3x, p3y);
  colors.push(...color, 1, ...color, 1, ...color, 1);

  return { positions, colors };
}

// ============================================================================
// Renderer
// ============================================================================

interface CompassRendererProps extends RendererProps {
  heading: number;
  desiredHeading?: number;
  showHeadingBug: boolean;
  variant: "full" | "minimal";
  roseColor: string;
  headingColor: string;
  bugColor: string;
}

function createWebGLCompassRenderer(
  canvas: HTMLCanvasElement
): WebGLRenderer<CompassRendererProps> {
  const buffers = {
    position: null as WebGLBuffer | null,
    color: null as WebGLBuffer | null,
  };

  const renderer = createWebGLRenderer<CompassRendererProps>({
    canvas,
    createShaders: () => ({
      vertexSource: VERTEX_SHADER,
      fragmentSource: FRAGMENT_SHADER,
    }),
    onRender: (gl, program, props) => {
      const {
        heading,
        desiredHeading,
        showHeadingBug,
        variant,
        roseColor,
        headingColor,
        bugColor,
        width,
        height,
      } = props;

      gl.useProgram(program);

      const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
      gl.uniform2f(resolutionLoc, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.38;

      let allPositions: number[] = [];
      let allColors: number[] = [];

      // Draw compass card
      const roseRgb = hexToRgb(roseColor);
      const cardGeom = createCompassCard(centerX, centerY, radius, heading, variant, roseRgb);
      allPositions.push(...cardGeom.positions);
      allColors.push(...cardGeom.colors);

      // Draw heading bug if enabled
      if (showHeadingBug && desiredHeading !== undefined) {
        const bugRgb = hexToRgb(bugColor);
        const bugGeom = createHeadingBug(centerX, centerY, radius, heading, desiredHeading, bugRgb);
        allPositions.push(...bugGeom.positions);
        allColors.push(...bugGeom.colors);
      }

      // Draw fixed heading indicator (always at top)
      const headingRgb = hexToRgb(headingColor);
      const indicatorGeom = createHeadingIndicator(centerX, centerY, radius, headingRgb);
      allPositions.push(...indicatorGeom.positions);
      allColors.push(...indicatorGeom.colors);

      // Upload buffers
      if (!buffers.position) {
        buffers.position = gl.createBuffer();
      }
      if (!buffers.color) {
        buffers.color = gl.createBuffer();
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allPositions), gl.STATIC_DRAW);
      const positionLoc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allColors), gl.STATIC_DRAW);
      const colorLoc = gl.getAttribLocation(program, "a_color");
      gl.enableVertexAttribArray(colorLoc);
      gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, allPositions.length / 2);
    },
  });

  return renderer;
}

async function createWebGPUCompassRenderer(
  canvas: HTMLCanvasElement,
  device: GPUDevice
): Promise<WebGPURenderer<CompassRendererProps>> {
  const buffers: {
    position: GPUBuffer | null;
    color: GPUBuffer | null;
    uniform: GPUBuffer | null;
  } = {
    position: null,
    color: null,
    uniform: null,
  };

  return createWebGPURenderer<CompassRendererProps>({
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
      const {
        heading,
        desiredHeading,
        showHeadingBug,
        variant,
        roseColor,
        headingColor,
        bugColor,
        width,
        height,
      } = props;

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.38;

      let allPositions: number[] = [];
      let allColors: number[] = [];

      // Draw compass card
      const roseRgb = hexToRgb(roseColor);
      const cardGeom = createCompassCard(centerX, centerY, radius, heading, variant, roseRgb);
      allPositions.push(...cardGeom.positions);
      allColors.push(...cardGeom.colors);

      // Draw heading bug if enabled
      if (showHeadingBug && desiredHeading !== undefined) {
        const bugRgb = hexToRgb(bugColor);
        const bugGeom = createHeadingBug(centerX, centerY, radius, heading, desiredHeading, bugRgb);
        allPositions.push(...bugGeom.positions);
        allColors.push(...bugGeom.colors);
      }

      // Draw fixed heading indicator (always at top)
      const headingRgb = hexToRgb(headingColor);
      const indicatorGeom = createHeadingIndicator(centerX, centerY, radius, headingRgb);
      allPositions.push(...indicatorGeom.positions);
      allColors.push(...indicatorGeom.colors);

      // Create or update buffers
      const positionData = new Float32Array(allPositions);
      const colorData = new Float32Array(allColors);

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
      const uniformData = new Float32Array([width, height]);
      if (!buffers.uniform) {
        buffers.uniform = device.createBuffer({
          size: 16,
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
      passEncoder.draw(allPositions.length / 2, 1, 0, 0);
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

interface RootProps extends CompassRoseProps {
  children: React.ReactNode;
}

function Root({
  children,
  heading = 0,
  desiredHeading,
  showHeadingBug = false,
  variant = "full",
  width = 400,
  height = 400,
  roseColor = "#ffffff",
  headingColor = "#ffff00",
  bugColor = "#00ff00",
  preferWebGPU = false,
  className,
}: RootProps) {
  const compassData: CompassRoseContextType = {
    heading,
    desiredHeading,
    showHeadingBug,
    variant,
    roseColor,
    headingColor,
    bugColor,
  };

  return (
    <CompassRoseContext.Provider value={compassData}>
      <ChartRoot
        width={width}
        height={height}
        preferWebGPU={preferWebGPU}
        className={className}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        {children}
      </ChartRoot>
    </CompassRoseContext.Provider>
  );
}

// ============================================================================
// Canvas Component
// ============================================================================

function Canvas() {
  const ctx = useCompassRose();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<
    WebGLRenderer<CompassRendererProps> | WebGPURenderer<CompassRendererProps> | null
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
      const props: CompassRendererProps = {
        heading: ctx.heading,
        desiredHeading: ctx.desiredHeading,
        showHeadingBug: ctx.showHeadingBug,
        variant: ctx.variant,
        roseColor: ctx.roseColor,
        headingColor: ctx.headingColor,
        bugColor: ctx.bugColor,
        width: canvas.width,
        height: canvas.height,
        margin: ctx.margin,
        xDomain: [0, 1],
        yDomain: [0, 1],
        xTicks: [],
        yTicks: [],
        showGrid: false,
        canvas,
      };

      if (rendererRef.current) {
        rendererRef.current.render(props);
      }
    };

    if (!rendererRef.current) {
      if (ctx.renderMode === "webgpu" && ctx.gpuDevice) {
        setIsInitializing(true);
        createWebGPUCompassRenderer(canvas, ctx.gpuDevice)
          .then((renderer) => {
            rendererRef.current = renderer;
            setIsInitializing(false);
            renderProps();
          })
          .catch((error) => {
            console.error("Failed to create WebGPU renderer:", error);
            rendererRef.current = createWebGLCompassRenderer(canvas);
            setIsInitializing(false);
            renderProps();
          });
        return;
      } else {
        rendererRef.current = createWebGLCompassRenderer(canvas);
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
// Labels Component
// ============================================================================

function Labels() {
  const ctx = useCompassRose();

  const centerX = ctx.width / 2;
  const centerY = ctx.height / 2;
  const radius = Math.min(ctx.width, ctx.height) * 0.38;
  const labelRadius = radius - 50;

  const headingRad = (ctx.heading * Math.PI) / 180;

  const cardinals = [
    { angle: 0, label: "N" },
    { angle: 90, label: "E" },
    { angle: 180, label: "S" },
    { angle: 270, label: "W" },
  ];

  return (
    <>
      {cardinals.map(({ angle, label }) => {
        const angleRad = ((angle - 90) * Math.PI) / 180 - headingRad;
        const x = centerX + labelRadius * Math.cos(angleRad);
        const y = centerY + labelRadius * Math.sin(angleRad);

        return (
          <div
            key={angle}
            className="absolute text-lg font-bold text-white pointer-events-none"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {label}
          </div>
        );
      })}
    </>
  );
}

// ============================================================================
// Value Display Component
// ============================================================================

function ValueDisplay() {
  const ctx = useCompassRose();

  const normalizedHeading = ((ctx.heading % 360) + 360) % 360;

  // Get cardinal direction
  const getCardinalDirection = (hdg: number) => {
    const dirs = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round(hdg / 22.5) % 16;
    return dirs[index];
  };

  const cardinalDir = getCardinalDirection(normalizedHeading);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Heading display */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="bg-black/80 px-6 py-3 rounded-lg border border-zinc-700">
          <div className="text-4xl font-bold tabular-nums">
            {normalizedHeading.toFixed(0).padStart(3, "0")}°
          </div>
          <div className="text-sm text-zinc-400 mt-1">{cardinalDir}</div>
        </div>
      </div>

      {/* Desired heading display */}
      {ctx.showHeadingBug && ctx.desiredHeading !== undefined && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded text-xs font-mono">
          <span className="text-zinc-400">TARGET:</span>{" "}
          <span className="text-green-400 font-bold tabular-nums">
            {(((ctx.desiredHeading % 360) + 360) % 360).toFixed(0).padStart(3, "0")}°
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Composed Component
// ============================================================================

export function CompassRose(props: CompassRoseProps) {
  return (
    <Root {...props}>
      <Canvas />
      <Labels />
      <ValueDisplay />
    </Root>
  );
}

CompassRose.Root = Root;
CompassRose.Canvas = Canvas;
CompassRose.Labels = Labels;
CompassRose.ValueDisplay = ValueDisplay;

export default CompassRose;
