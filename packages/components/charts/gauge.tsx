"use client";

import { createContext, useContext, useRef, useEffect, useMemo, useState } from "react";
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
// Gauge Types
// ============================================================================

export interface Zone {
  from: number;
  to: number;
  color: string;
}

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  zones?: Zone[];
  label?: string;
  unit?: string;
  variant?: "circular" | "semi" | "linear";
  width?: number;
  height?: number;
  showValue?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  needleColor?: string;
  className?: string;
  preferWebGPU?: boolean;
}

// Export types for external use
export type { GaugeProps as GaugeConfig };

interface GaugeContextType {
  value: number;
  min: number;
  max: number;
  zones: Zone[];
  label?: string;
  unit?: string;
  variant: "circular" | "semi" | "linear";
  showValue: boolean;
  showTicks: boolean;
  tickCount: number;
  needleColor: string;
}

const GaugeContext = createContext<GaugeContextType | null>(null);

function useGaugeData() {
  const ctx = useContext(GaugeContext);
  if (!ctx) {
    throw new Error("Gauge components must be used within Gauge.Root");
  }
  return ctx;
}

function useGauge() {
  const baseCtx = useBaseChart();
  const gaugeCtx = useGaugeData();
  return { ...baseCtx, ...gaugeCtx };
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
// Gauge Renderers
// ============================================================================

interface GaugeRendererProps extends RendererProps {
  value: number;
  min: number;
  max: number;
  zones: Zone[];
  variant: "circular" | "semi" | "linear";
  showTicks: boolean;
  tickCount: number;
  needleColor: string;
}

function createArcGeometry(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: [number, number, number],
  thickness: number,
  segments = 64,
  opacity = 1
) {
  const positions: number[] = [];
  const colors: number[] = [];

  const innerRadius = radius - thickness;
  const angleStep = (endAngle - startAngle) / segments;

  for (let i = 0; i < segments; i++) {
    const a1 = startAngle + i * angleStep;
    const a2 = startAngle + (i + 1) * angleStep;

    const cos1 = Math.cos(a1);
    const sin1 = Math.sin(a1);
    const cos2 = Math.cos(a2);
    const sin2 = Math.sin(a2);

    // Outer arc
    const x1o = centerX + radius * cos1;
    const y1o = centerY + radius * sin1;
    const x2o = centerX + radius * cos2;
    const y2o = centerY + radius * sin2;

    // Inner arc
    const x1i = centerX + innerRadius * cos1;
    const y1i = centerY + innerRadius * sin1;
    const x2i = centerX + innerRadius * cos2;
    const y2i = centerY + innerRadius * sin2;

    // First triangle
    positions.push(x1o, y1o, x2o, y2o, x1i, y1i);
    colors.push(...color, opacity, ...color, opacity, ...color, opacity);

    // Second triangle
    positions.push(x2o, y2o, x2i, y2i, x1i, y1i);
    colors.push(...color, opacity, ...color, opacity, ...color, opacity);
  }

  return { positions, colors };
}

function createNeedleGeometry(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  color: [number, number, number],
  needleWidth = 2
) {
  const positions: number[] = [];
  const colors: number[] = [];

  const tipX = centerX + radius * 0.9 * Math.cos(angle);
  const tipY = centerY + radius * 0.9 * Math.sin(angle);

  const perpAngle1 = angle + Math.PI / 2;
  const perpAngle2 = angle - Math.PI / 2;

  const baseX1 = centerX + needleWidth * Math.cos(perpAngle1);
  const baseY1 = centerY + needleWidth * Math.sin(perpAngle1);
  const baseX2 = centerX + needleWidth * Math.cos(perpAngle2);
  const baseY2 = centerY + needleWidth * Math.sin(perpAngle2);

  // Needle triangle (minimal design)
  positions.push(tipX, tipY, baseX1, baseY1, baseX2, baseY2);
  colors.push(...color, 0.9, ...color, 0.9, ...color, 0.9);

  // Center circle (small and simple)
  const circleRadius = 6;
  const circleSegments = 20;
  for (let i = 0; i < circleSegments; i++) {
    const a1 = (i / circleSegments) * Math.PI * 2;
    const a2 = ((i + 1) / circleSegments) * Math.PI * 2;

    const x1 = centerX + circleRadius * Math.cos(a1);
    const y1 = centerY + circleRadius * Math.sin(a1);
    const x2 = centerX + circleRadius * Math.cos(a2);
    const y2 = centerY + circleRadius * Math.sin(a2);

    positions.push(centerX, centerY, x1, y1, x2, y2);
    colors.push(...color, 1, ...color, 1, ...color, 1);
  }

  return { positions, colors };
}

function createTickGeometry(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  tickCount: number,
  color: [number, number, number]
) {
  const positions: number[] = [];
  const colors: number[] = [];

  const angleRange = endAngle - startAngle;
  const angleStep = angleRange / (tickCount - 1);

  for (let i = 0; i < tickCount; i++) {
    const angle = startAngle + i * angleStep;
    const isMajor = i % 2 === 0;
    const tickLength = isMajor ? 12 : 6;
    const tickWidth = isMajor ? 2.5 : 1.5;
    const tickOpacity = isMajor ? 0.7 : 0.4;

    const innerRadius = radius - 22;
    const outerRadius = innerRadius - tickLength;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x1 = centerX + innerRadius * cos;
    const y1 = centerY + innerRadius * sin;
    const x2 = centerX + outerRadius * cos;
    const y2 = centerY + outerRadius * sin;

    const perpCos = Math.cos(angle + Math.PI / 2);
    const perpSin = Math.sin(angle + Math.PI / 2);

    const dx = perpCos * tickWidth * 0.5;
    const dy = perpSin * tickWidth * 0.5;

    positions.push(x1 + dx, y1 + dy, x1 - dx, y1 - dy, x2 + dx, y2 + dy);
    positions.push(x2 + dx, y2 + dy, x1 - dx, y1 - dy, x2 - dx, y2 - dy);

    for (let j = 0; j < 6; j++) {
      colors.push(...color, tickOpacity);
    }
  }

  return { positions, colors };
}

function createLinearBarGeometry(
  x: number,
  y: number,
  width: number,
  height: number,
  color: [number, number, number],
  opacity = 1
) {
  const positions: number[] = [];
  const colors: number[] = [];

  // Two triangles to form a rectangle
  positions.push(
    x, y,
    x + width, y,
    x, y + height,
    x + width, y,
    x + width, y + height,
    x, y + height
  );

  for (let i = 0; i < 6; i++) {
    colors.push(...color, opacity);
  }

  return { positions, colors };
}

function createLinearIndicatorGeometry(
  x: number,
  y: number,
  height: number,
  color: [number, number, number],
  indicatorWidth = 4
) {
  const positions: number[] = [];
  const colors: number[] = [];

  const halfWidth = indicatorWidth / 2;

  // Triangle pointing down
  const tipY = y - 8;
  const baseY = y;

  positions.push(
    x, tipY,
    x - halfWidth * 2, baseY,
    x + halfWidth * 2, baseY
  );

  colors.push(...color, 0.95, ...color, 0.95, ...color, 0.95);

  // Vertical line from base to bottom
  positions.push(
    x - halfWidth, baseY,
    x + halfWidth, baseY,
    x - halfWidth, y + height,
    x + halfWidth, baseY,
    x + halfWidth, y + height,
    x - halfWidth, y + height
  );

  for (let i = 0; i < 6; i++) {
    colors.push(...color, 0.95);
  }

  return { positions, colors };
}

function createWebGLGaugeRenderer(canvas: HTMLCanvasElement): WebGLRenderer<GaugeRendererProps> {
  const buffers = {
    position: null as WebGLBuffer | null,
    color: null as WebGLBuffer | null,
  };

  const renderer = createWebGLRenderer<GaugeRendererProps>({
    canvas,
    createShaders: () => ({
      vertexSource: VERTEX_SHADER,
      fragmentSource: FRAGMENT_SHADER,
    }),
    onRender: (gl, program, props) => {
      const { value, min, max, zones, variant, showTicks, tickCount, needleColor, width, height } =
        props;

      gl.useProgram(program);

      const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
      gl.uniform2f(resolutionLoc, width, height);

      const allPositions: number[] = [];
      const allColors: number[] = [];

      if (variant === "linear") {
        // Linear gauge rendering
        const barHeight = 40;
        const barY = height / 2 - barHeight / 2;
        const margin = 80;
        const barWidth = width - margin * 2;
        const barX = margin;

        const ratio = (value - min) / (max - min);

        // Draw zone backgrounds
        if (zones.length > 0) {
          for (const zone of zones) {
            const zoneStartRatio = (zone.from - min) / (max - min);
            const zoneEndRatio = (zone.to - min) / (max - min);
            const zoneX = barX + zoneStartRatio * barWidth;
            const zoneWidth = (zoneEndRatio - zoneStartRatio) * barWidth;

            const color = hexToRgb(zone.color);
            const { positions, colors } = createLinearBarGeometry(
              zoneX,
              barY,
              zoneWidth,
              barHeight,
              color,
              0.25
            );
            allPositions.push(...positions);
            allColors.push(...colors);
          }
        } else {
          // Default background
          const bgColor = hexToRgb("#27272a");
          const { positions, colors } = createLinearBarGeometry(
            barX,
            barY,
            barWidth,
            barHeight,
            bgColor,
            0.2
          );
          allPositions.push(...positions);
          allColors.push(...colors);
        }

        // Draw progress bar
        const progressWidth = ratio * barWidth;
        let progressColor = hexToRgb(needleColor);
        if (zones.length > 0) {
          for (const zone of zones) {
            if (value >= zone.from && value <= zone.to) {
              progressColor = hexToRgb(zone.color);
              break;
            }
          }
        }

        const { positions: progPos, colors: progCol } = createLinearBarGeometry(
          barX,
          barY,
          progressWidth,
          barHeight,
          progressColor,
          1.0
        );
        allPositions.push(...progPos);
        allColors.push(...progCol);

        // Draw indicator
        const indicatorX = barX + ratio * barWidth;
        const { positions: indPos, colors: indCol } = createLinearIndicatorGeometry(
          indicatorX,
          barY,
          barHeight,
          progressColor
        );
        allPositions.push(...indPos);
        allColors.push(...indCol);

      } else {
        // Circular/Semi gauge rendering
        const centerX = width / 2;
        const centerY = variant === "semi" ? height * 0.85 : height / 2;
        const radius = Math.min(width, height) * 0.35;

        const startAngle = variant === "semi" ? Math.PI : Math.PI * 0.75;
        const endAngle = variant === "semi" ? 0 : Math.PI * 2.25;

        // Draw zone boundaries first (background, dimmed)
        if (zones.length > 0) {
          for (const zone of zones) {
            const zoneStartRatio = (zone.from - min) / (max - min);
            const zoneEndRatio = (zone.to - min) / (max - min);
            const angleRange = endAngle - startAngle;
            const zoneStartAngle = startAngle + zoneStartRatio * angleRange;
            const zoneEndAngle = startAngle + zoneEndRatio * angleRange;

            const color = hexToRgb(zone.color);
            const { positions, colors } = createArcGeometry(
              centerX,
              centerY,
              radius,
              zoneStartAngle,
              zoneEndAngle,
              color,
              24,
              64,
              0.25  // Dimmed to show boundaries
            );
            allPositions.push(...positions);
            allColors.push(...colors);
          }
        } else {
          // Default background arc if no zones
          const bgColor = hexToRgb("#27272a");
          const bgGeometry = createArcGeometry(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle,
            bgColor,
            24,
            64,
            0.2
          );
          allPositions.push(...bgGeometry.positions);
          allColors.push(...bgGeometry.colors);
        }

        // Draw progress arc on top (bright)
        const ratio = (value - min) / (max - min);
        const angleRange = endAngle - startAngle;
        const valueAngle = startAngle + ratio * angleRange;

        // Determine color based on zones or use default
        let progressColor = hexToRgb(needleColor);
        if (zones.length > 0) {
          for (const zone of zones) {
            if (value >= zone.from && value <= zone.to) {
              progressColor = hexToRgb(zone.color);
              break;
            }
          }
        }

        const { positions, colors } = createArcGeometry(
          centerX,
          centerY,
          radius,
          startAngle,
          valueAngle,
          progressColor,
          24,
          64,
          1.0  // Full opacity for progress
        );
        allPositions.push(...positions);
        allColors.push(...colors);

        // Draw ticks (if enabled)
        if (showTicks) {
          const tickColor = hexToRgb("#64748b");
          const { positions, colors } = createTickGeometry(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle,
            tickCount,
            tickColor
          );
          allPositions.push(...positions);
          allColors.push(...colors);
        }
      }

      // Create or update buffers
      if (!buffers.position) {
        buffers.position = gl.createBuffer();
      }
      if (!buffers.color) {
        buffers.color = gl.createBuffer();
      }

      // Upload position data
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allPositions), gl.STATIC_DRAW);
      const positionLoc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      // Upload color data
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

async function createWebGPUGaugeRenderer(
  canvas: HTMLCanvasElement,
  device: GPUDevice
): Promise<WebGPURenderer<GaugeRendererProps>> {
  const buffers: {
    position: GPUBuffer | null;
    color: GPUBuffer | null;
    uniform: GPUBuffer | null;
  } = {
    position: null,
    color: null,
    uniform: null,
  };

  return createWebGPURenderer<GaugeRendererProps>({
    canvas,
    device,
    createPipeline: (device: GPUDevice, format: GPUTextureFormat) => {
      // Create shader module
      const shaderModule = device.createShaderModule({
        code: WGSL_SHADER,
      });

      // Create pipeline
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vertexMain",
          buffers: [
            {
              // Position buffer
              arrayStride: 2 * 4, // 2 floats * 4 bytes
              attributes: [
                {
                  shaderLocation: 0,
                  offset: 0,
                  format: "float32x2",
                },
              ],
            },
            {
              // Color buffer
              arrayStride: 4 * 4, // 4 floats * 4 bytes
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
        value,
        min,
        max,
        zones,
        variant,
        showTicks,
        tickCount,
        needleColor,
        width,
        height,
        margin,
      } = props;

      const allPositions: number[] = [];
      const allColors: number[] = [];

      if (variant === "linear") {
        // Linear gauge rendering
        const barHeight = 40;
        const barY = height / 2 - barHeight / 2;
        const marginX = 80;
        const barWidth = width - marginX * 2;
        const barX = marginX;

        const ratio = (value - min) / (max - min);

        // Draw zone backgrounds
        if (zones.length > 0) {
          for (const zone of zones) {
            const zoneStartRatio = (zone.from - min) / (max - min);
            const zoneEndRatio = (zone.to - min) / (max - min);
            const zoneX = barX + zoneStartRatio * barWidth;
            const zoneWidth = (zoneEndRatio - zoneStartRatio) * barWidth;

            const color = hexToRgb(zone.color);
            const { positions, colors } = createLinearBarGeometry(
              zoneX,
              barY,
              zoneWidth,
              barHeight,
              color,
              0.25
            );
            allPositions.push(...positions);
            allColors.push(...colors);
          }
        } else {
          // Default background
          const bgColor = hexToRgb("#27272a");
          const { positions, colors } = createLinearBarGeometry(
            barX,
            barY,
            barWidth,
            barHeight,
            bgColor,
            0.2
          );
          allPositions.push(...positions);
          allColors.push(...colors);
        }

        // Draw progress bar
        const progressWidth = ratio * barWidth;
        let progressColor = hexToRgb(needleColor);
        if (zones.length > 0) {
          for (const zone of zones) {
            if (value >= zone.from && value <= zone.to) {
              progressColor = hexToRgb(zone.color);
              break;
            }
          }
        }

        const { positions: progPos, colors: progCol } = createLinearBarGeometry(
          barX,
          barY,
          progressWidth,
          barHeight,
          progressColor,
          1.0
        );
        allPositions.push(...progPos);
        allColors.push(...progCol);

        // Draw indicator
        const indicatorX = barX + ratio * barWidth;
        const { positions: indPos, colors: indCol } = createLinearIndicatorGeometry(
          indicatorX,
          barY,
          barHeight,
          progressColor
        );
        allPositions.push(...indPos);
        allColors.push(...indCol);

      } else {
        // Circular/Semi gauge rendering
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const centerX = innerWidth / 2 + margin.left;
        const centerY = variant === "semi" ? innerHeight * 0.85 + margin.top : innerHeight / 2 + margin.top;
        const radius = Math.min(innerWidth, innerHeight) * 0.35;

        const startAngle = variant === "circular" ? -Math.PI : -Math.PI * 0.75;
        const endAngle = variant === "circular" ? Math.PI : Math.PI * 0.75;
        const angleRange = endAngle - startAngle;

        // Draw zone boundaries first (background, dimmed)
        if (zones.length > 0) {
          for (const zone of zones) {
            const zoneStartRatio = (zone.from - min) / (max - min);
            const zoneEndRatio = (zone.to - min) / (max - min);
            const zoneStartAngle = startAngle + zoneStartRatio * angleRange;
            const zoneEndAngle = startAngle + zoneEndRatio * angleRange;

            const color = hexToRgb(zone.color);
            const { positions, colors } = createArcGeometry(
              centerX,
              centerY,
              radius,
              zoneStartAngle,
              zoneEndAngle,
              color,
              24,
              64,
              0.25  // Dimmed to show boundaries
            );
            allPositions.push(...positions);
            allColors.push(...colors);
          }
        } else {
          // Default background arc if no zones
          const bgColor = hexToRgb("#27272a");
          const bgGeometry = createArcGeometry(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle,
            bgColor,
            24,
            64,
            0.2
          );
          allPositions.push(...bgGeometry.positions);
          allColors.push(...bgGeometry.colors);
        }

        // Draw progress arc on top (bright)
        const normalizedValue = (value - min) / (max - min);
        const valueAngle = startAngle + normalizedValue * angleRange;

        // Determine color based on zones or use default
        let progressColor = hexToRgb(needleColor);
        if (zones.length > 0) {
          for (const zone of zones) {
            if (value >= zone.from && value <= zone.to) {
              progressColor = hexToRgb(zone.color);
              break;
            }
          }
        }

        const { positions, colors } = createArcGeometry(
          centerX,
          centerY,
          radius,
          startAngle,
          valueAngle,
          progressColor,
          24,
          64,
          1.0  // Full opacity for progress
        );
        allPositions.push(...positions);
        allColors.push(...colors);

        // Draw tick marks (if enabled)
        if (showTicks) {
          for (let i = 0; i < tickCount; i++) {
            const t = i / (tickCount - 1);
            const angle = startAngle + t * angleRange;
            const tickLength = i % 2 === 0 ? 10 : 5;
            const color = hexToRgb("#71717a");

            const { positions, colors } = createTickGeometry(
              centerX,
              centerY,
              radius - 15,
              angle,
              tickLength,
              2,
              color
            );
            allPositions.push(...positions);
            allColors.push(...colors);
          }
        }
      }

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
          size: 16, // vec2f padded to 16 bytes
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

interface RootProps extends GaugeProps {
  children: React.ReactNode;
}

function Root({
  children,
  value,
  min = 0,
  max = 100,
  zones = [],
  label,
  unit,
  variant = "semi",
  width = 400,
  height = 300,
  showValue = true,
  showTicks = false,
  tickCount = 11,
  needleColor = "#ef4444",
  preferWebGPU = false,
  className,
}: RootProps) {
  const gaugeData: GaugeContextType = {
    value,
    min,
    max,
    zones,
    label,
    unit,
    variant,
    showValue,
    showTicks,
    tickCount,
    needleColor,
  };

  return (
    <GaugeContext.Provider value={gaugeData}>
      <ChartRoot
        width={width}
        height={height}
        preferWebGPU={preferWebGPU}
        className={className}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        {children}
      </ChartRoot>
    </GaugeContext.Provider>
  );
}

// ============================================================================
// Canvas Component
// ============================================================================

function Canvas({ showTicks }: { showTicks?: boolean } = {}) {
  const ctx = useGauge();
  const shouldShowTicks = showTicks ?? ctx.showTicks;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<
    WebGLRenderer<GaugeRendererProps> | WebGPURenderer<GaugeRendererProps> | null
  >(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize renderer when render mode is determined
  useEffect(() => {
    if (!canvasRef.current || isInitializing) return;
    if (ctx.renderMode === null) return; // Wait for render mode to be determined

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = ctx.width * dpr;
    canvas.height = ctx.height * dpr;
    canvas.style.width = `${ctx.width}px`;
    canvas.style.height = `${ctx.height}px`;

    if (!rendererRef.current) {
      if (ctx.renderMode === "webgpu" && ctx.gpuDevice) {
        setIsInitializing(true);
        createWebGPUGaugeRenderer(canvas, ctx.gpuDevice)
          .then((renderer) => {
            rendererRef.current = renderer;
            setIsInitializing(false);
          })
          .catch((error) => {
            console.error("Failed to create WebGPU renderer:", error);
            rendererRef.current = createWebGLGaugeRenderer(canvas);
            setIsInitializing(false);
          });
        return;
      } else {
        rendererRef.current = createWebGLGaugeRenderer(canvas);
      }
    }

    const props: GaugeRendererProps = {
      canvas,
      value: ctx.value,
      min: ctx.min,
      max: ctx.max,
      zones: ctx.zones,
      variant: ctx.variant,
      showTicks: shouldShowTicks,
      tickCount: ctx.tickCount,
      needleColor: ctx.needleColor,
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
  }, [ctx, isInitializing, shouldShowTicks]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// ============================================================================
// Value Display Component
// ============================================================================

function ValueDisplay({ format }: { format?: (value: number) => string } = {}) {
  const ctx = useGauge();

  if (!ctx.showValue) return null;

  const displayValue = format ? format(ctx.value) : Math.round(ctx.value).toString();

  // For linear variant, show value on the left side
  if (ctx.variant === "linear") {
    return (
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <div className="flex flex-col items-start gap-1">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wide">
            {ctx.label || "Value"}
          </div>
          <div className="text-4xl font-bold tabular-nums leading-none">
            {displayValue}
          </div>
          {ctx.unit && (
            <div className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
              {ctx.unit}
            </div>
          )}
        </div>
      </div>
    );
  }

  // For circular/semi variants, show in center
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div
        className="flex flex-col items-center gap-3"
        style={{ marginTop: ctx.variant === "semi" ? "20%" : "0%" }}
      >
        <div className="text-[220px] font-bold tabular-nums leading-none tracking-[-0.05em]">
          {displayValue}
        </div>
        <div className="text-lg text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
          {ctx.label && ctx.unit ? `${ctx.value.toFixed(0)} ${ctx.unit}` :
           ctx.unit ? ctx.unit :
           ctx.label ? ctx.label : ''}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Tick Labels Component
// ============================================================================

function TickLabels() {
  const ctx = useGauge();

  if (!ctx.showTicks) return null;

  // For linear variant, show labels below the bar
  if (ctx.variant === "linear") {
    const margin = 80;
    const barWidth = ctx.width - margin * 2;
    const barY = ctx.height / 2 + 20; // Below the bar
    const labels = [];
    const majorTickIndices = [0, Math.floor(ctx.tickCount / 2), ctx.tickCount - 1];

    for (const i of majorTickIndices) {
      const ratio = i / (ctx.tickCount - 1);
      const x = margin + ratio * barWidth;
      const value = ctx.min + ratio * (ctx.max - ctx.min);

      labels.push(
        <div
          key={i}
          className="absolute text-xs text-zinc-600 dark:text-zinc-400 font-medium tabular-nums pointer-events-none"
          style={{
            left: x,
            top: barY + 30,
            transform: "translateX(-50%)",
          }}
        >
          {value.toFixed(0)}
        </div>
      );
    }

    return <>{labels}</>;
  }

  // For circular/semi variants
  const centerX = ctx.width / 2;
  const centerY = ctx.variant === "semi" ? ctx.height * 0.85 : ctx.height / 2;
  const radius = Math.min(ctx.width, ctx.height) * 0.35;
  const labelRadius = radius - 50;

  const startAngle = ctx.variant === "semi" ? Math.PI : Math.PI * 0.75;
  const endAngle = ctx.variant === "semi" ? 0 : Math.PI * 2.25;
  const angleRange = endAngle - startAngle;

  const labels = [];
  const majorTickIndices = [0, Math.floor(ctx.tickCount / 2), ctx.tickCount - 1];

  for (const i of majorTickIndices) {
    const angle = startAngle + (i / (ctx.tickCount - 1)) * angleRange;
    const value = ctx.min + (i / (ctx.tickCount - 1)) * (ctx.max - ctx.min);

    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);

    labels.push(
      <div
        key={i}
        className="absolute text-xs text-zinc-600 dark:text-zinc-400 font-medium tabular-nums pointer-events-none"
        style={{
          left: x,
          top: y,
          transform: "translate(-50%, -50%)",
        }}
      >
        {value.toFixed(0)}
      </div>
    );
  }

  return <>{labels}</>;
}

// ============================================================================
// Composed Component
// ============================================================================

export function Gauge(props: GaugeProps) {
  return (
    <Root {...props}>
      <Canvas />
      <ValueDisplay />
      <TickLabels />
    </Root>
  );
}

Gauge.Root = Root;
Gauge.Canvas = Canvas;
Gauge.ValueDisplay = ValueDisplay;
Gauge.TickLabels = TickLabels;

export default Gauge;
