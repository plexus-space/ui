"use client";

import {
  createWebGLRenderer,
  createWebGPURenderer,
  ChartAxes,
  ChartRoot,
  ChartTooltip,
  hexToRgb,
  type RendererProps,
  type WebGLRenderer,
  type WebGPURenderer,
  useBaseChart,
} from "./base-chart";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { viridis as defaultColorScale } from "../lib/color-scales";
import {
  generateSpectrogram,
  generateSpectrogramGPU,
  type WindowFunction,
  type SpectrogramPoint,
} from "../lib/data-utils";

// ============================================================================
// Waterfall Chart Types
// ============================================================================

/**
 * Waterfall/Spectrogram Chart for frequency-time analysis
 *
 * Use cases:
 * - RF spectrum analysis (aerospace/defense)
 * - EEG frequency bands (medical devices)
 * - Vibration analysis (industrial automation)
 * - Audio spectrogram (scientific computing)
 */

export interface WaterfallChartProps {
  /**
   * Time-series signal data
   */
  signal: number[];

  /**
   * Sampling rate in Hz (e.g., 1000 Hz = 1000 samples/second)
   */
  sampleRate: number;

  /**
   * FFT window size (must be power of 2)
   * Larger = better frequency resolution, worse time resolution
   * Smaller = better time resolution, worse frequency resolution
   * Typical: 256, 512, 1024, 2048
   */
  fftSize?: number;

  /**
   * Hop size (overlap between windows in samples)
   * Smaller = smoother transitions, more computation
   * Typical: fftSize / 2 (50% overlap)
   */
  hopSize?: number;

  /**
   * Window function to reduce spectral leakage
   */
  windowFunction?: WindowFunction;

  /**
   * Use decibel scale (true) or linear power (false)
   */
  useDb?: boolean;

  /**
   * Minimum magnitude for color scale
   * Auto-calculated if not provided
   */
  minMagnitude?: number;

  /**
   * Maximum magnitude for color scale
   * Auto-calculated if not provided
   */
  maxMagnitude?: number;

  /**
   * Frequency range to display [minHz, maxHz]
   * Defaults to [0, sampleRate / 2] (Nyquist limit)
   */
  frequencyRange?: [number, number];

  /**
   * Time range to display in samples
   * Defaults to entire signal
   */
  timeRange?: [number, number];

  xAxis?: {
    label?: string;
    formatter?: (value: number) => string;
  };
  yAxis?: {
    label?: string;
    formatter?: (value: number) => string;
  };
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showTooltip?: boolean;
  className?: string;
  preferWebGPU?: boolean;
  /**
   * Use GPU compute shaders for FFT (100x+ faster than CPU)
   * Requires WebGPU support
   * Falls back to CPU FFT if unavailable
   */
  useGPUFFT?: boolean;
  colorScale?: (value: number) => string;
}

// Extended context for waterfall chart
interface WaterfallChartContextType {
  spectrogramData: SpectrogramPoint[];
  frequencyBins: number[];
  timeBins: number[];
  colorScale: (value: number) => string;
  minMagnitude: number;
  maxMagnitude: number;
  sampleRate: number;
  useDb: boolean;
}

const WaterfallChartContext = createContext<WaterfallChartContextType | null>(
  null
);

function useWaterfallChartData() {
  const ctx = useContext(WaterfallChartContext);
  if (!ctx) {
    throw new Error(
      "WaterfallChart components must be used within WaterfallChart.Root"
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
// Shaders (reuse heatmap shaders - same rendering approach)
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
// Waterfall Renderers
// ============================================================================

interface WaterfallRendererProps extends RendererProps {
  spectrogramData: SpectrogramPoint[];
  timeBins: number[];
  frequencyBins: number[];
  colorScale: (value: number) => string;
  minMagnitude: number;
  maxMagnitude: number;
}

// Helper function to create waterfall geometry
function createWaterfallGeometry(
  spectrogramData: SpectrogramPoint[],
  timeBins: number[],
  frequencyBins: number[],
  xScale: (x: number) => number,
  yScale: (y: number) => number,
  colorScale: (value: number) => string,
  minMagnitude: number,
  maxMagnitude: number
) {
  const positions: number[] = [];
  const colors: number[] = [];

  if (timeBins.length === 0 || frequencyBins.length === 0) {
    return { positions, colors };
  }

  const cellWidth =
    timeBins.length > 1
      ? Math.abs(xScale(timeBins[1]) - xScale(timeBins[0]))
      : 10;
  const cellHeight =
    frequencyBins.length > 1
      ? Math.abs(yScale(frequencyBins[1]) - yScale(frequencyBins[0]))
      : 10;

  // Create a map for fast lookup
  const dataMap = new Map<string, number>();
  for (const point of spectrogramData) {
    const key = `${point.time},${point.frequency}`;
    dataMap.set(key, point.magnitude);
  }

  // Render cells
  for (let tIdx = 0; tIdx < timeBins.length; tIdx++) {
    for (let fIdx = 0; fIdx < frequencyBins.length; fIdx++) {
      const timeBin = timeBins[tIdx];
      const freqBin = frequencyBins[fIdx];
      const key = `${timeBin},${freqBin}`;
      const magnitude = dataMap.get(key);

      if (magnitude === undefined) continue;

      const x = xScale(timeBin);
      const y = yScale(freqBin);

      // Normalize magnitude to [0, 1]
      const normalizedMag =
        (magnitude - minMagnitude) / (maxMagnitude - minMagnitude);
      const clampedMag = Math.max(0, Math.min(1, normalizedMag));

      const colorStr = colorScale(clampedMag);
      const rgb = hexToRgb(colorStr);

      // Two triangles for rectangle
      positions.push(
        x,
        y,
        x + cellWidth,
        y,
        x,
        y + cellHeight,
        x + cellWidth,
        y,
        x + cellWidth,
        y + cellHeight,
        x,
        y + cellHeight
      );

      // Same color for all 6 vertices
      for (let i = 0; i < 6; i++) {
        colors.push(...rgb, 1.0);
      }
    }
  }

  return { positions, colors };
}

// Factory function to create WebGL waterfall renderer
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
      const {
        spectrogramData,
        timeBins,
        frequencyBins,
        xDomain,
        yDomain,
        width,
        height,
        margin,
        colorScale,
        minMagnitude,
        maxMagnitude,
      } = props;

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

      const geometry = createWaterfallGeometry(
        spectrogramData,
        timeBins,
        frequencyBins,
        xScale,
        yScaleFlipped,
        colorScale,
        minMagnitude,
        maxMagnitude
      );

      if (geometry.positions.length === 0) return;

      if (!buffers.position) buffers.position = gl.createBuffer();
      if (!buffers.color) buffers.color = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(geometry.positions),
        gl.STATIC_DRAW
      );
      const positionLoc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(geometry.colors),
        gl.STATIC_DRAW
      );
      const colorLoc = gl.getAttribLocation(program, "a_color");
      gl.enableVertexAttribArray(colorLoc);
      gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, geometry.positions.length / 2);
    },
    onDestroy: (gl) => {
      if (buffers.position) gl.deleteBuffer(buffers.position);
      if (buffers.color) gl.deleteBuffer(buffers.color);
    },
  });

  return renderer;
}

// Factory function to create WebGPU waterfall renderer
function createWebGPUWaterfallRenderer(
  canvas: HTMLCanvasElement,
  device: GPUDevice
): WebGPURenderer<WaterfallRendererProps> {
  const shaderModule = device.createShaderModule({ code: WGSL_SHADER });

  const uniformBuffer = device.createBuffer({
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

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  // Persistent buffers with 1.5x growth factor
  const waterfallBuffers = {
    position: null as GPUBuffer | null,
    color: null as GPUBuffer | null,
  };

  const renderer = createWebGPURenderer<WaterfallRendererProps>({
    canvas,
    device,
    createPipeline: (device, format) => {
      return device.createRenderPipeline({
        layout: device.createPipelineLayout({
          bindGroupLayouts: [bindGroupLayout],
        }),
        vertex: {
          module: shaderModule,
          entryPoint: "vertexMain",
          buffers: [
            {
              arrayStride: 8,
              attributes: [
                { shaderLocation: 0, offset: 0, format: "float32x2" },
              ],
            },
            {
              arrayStride: 16,
              attributes: [
                { shaderLocation: 1, offset: 0, format: "float32x4" },
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
        primitive: { topology: "triangle-list" },
      });
    },
    onRender: async (device, context, pipeline, props) => {
      const {
        spectrogramData,
        timeBins,
        frequencyBins,
        xDomain,
        yDomain,
        width,
        height,
        margin,
        colorScale,
        minMagnitude,
        maxMagnitude,
      } = props;

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

      const geometry = createWaterfallGeometry(
        spectrogramData,
        timeBins,
        frequencyBins,
        xScale,
        yScaleFlipped,
        colorScale,
        minMagnitude,
        maxMagnitude
      );

      if (geometry.positions.length === 0) return;

      const commandEncoder = device.createCommandEncoder();
      const textureView = context.getCurrentTexture().createView();

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

      const positionData = new Float32Array(geometry.positions);
      const colorData = new Float32Array(geometry.colors);

      // Create or resize position buffer with 1.5x growth factor
      if (
        !waterfallBuffers.position ||
        waterfallBuffers.position.size < positionData.byteLength * 1.5
      ) {
        waterfallBuffers.position?.destroy();
        waterfallBuffers.position = device.createBuffer({
          size: Math.ceil(positionData.byteLength * 1.5),
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
      }

      // Create or resize color buffer with 1.5x growth factor
      if (
        !waterfallBuffers.color ||
        waterfallBuffers.color.size < colorData.byteLength * 1.5
      ) {
        waterfallBuffers.color?.destroy();
        waterfallBuffers.color = device.createBuffer({
          size: Math.ceil(colorData.byteLength * 1.5),
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
      }

      // Write data to buffers
      device.queue.writeBuffer(waterfallBuffers.position, 0, positionData);
      device.queue.writeBuffer(waterfallBuffers.color, 0, colorData);

      passEncoder.setVertexBuffer(0, waterfallBuffers.position);
      passEncoder.setVertexBuffer(1, waterfallBuffers.color);

      passEncoder.draw(geometry.positions.length / 2);

      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
    },
    onDestroy: () => {
      uniformBuffer.destroy();
      waterfallBuffers.position?.destroy();
      waterfallBuffers.color?.destroy();
    },
  });

  return renderer;
}

// ============================================================================
// Waterfall Chart Components
// ============================================================================

function Root({
  signal,
  sampleRate,
  fftSize = 256,
  hopSize,
  windowFunction = "hann",
  useDb = true,
  minMagnitude,
  maxMagnitude,
  frequencyRange,
  timeRange,
  xAxis = {},
  yAxis = {},
  width = 800,
  height = 400,
  preferWebGPU = true,
  useGPUFFT = false,
  colorScale = defaultColorScale,
  className,
  children,
}: {
  signal: number[];
  sampleRate: number;
  fftSize?: number;
  hopSize?: number;
  windowFunction?: WindowFunction;
  useDb?: boolean;
  minMagnitude?: number;
  maxMagnitude?: number;
  frequencyRange?: [number, number];
  timeRange?: [number, number];
  xAxis?: {
    label?: string;
    formatter?: (value: number) => string;
  };
  yAxis?: {
    label?: string;
    formatter?: (value: number) => string;
  };
  width?: number;
  height?: number;
  preferWebGPU?: boolean;
  useGPUFFT?: boolean;
  colorScale?: (value: number) => string;
  className?: string;
  children?: React.ReactNode;
}) {
  // Store GPU device reference for compute shader
  const gpuDeviceRef = useRef<GPUDevice | null>(null);
  const [_isGPUReady, setIsGPUReady] = React.useState(false);

  // Initialize GPU device for compute shaders
  useEffect(() => {
    if (!useGPUFFT || !preferWebGPU || !("gpu" in navigator)) {
      return;
    }

    async function initGPU() {
      try {
        const adapter = await navigator.gpu?.requestAdapter();
        if (adapter) {
          const device = await adapter.requestDevice();
          gpuDeviceRef.current = device;
          setIsGPUReady(true);
        }
      } catch (error) {
        console.warn(
          "GPU FFT initialization failed, falling back to CPU:",
          error
        );
      }
    }

    initGPU();
  }, [useGPUFFT, preferWebGPU]);

  // Calculate spectrogram (GPU or CPU)
  const spectrogramData = useMemo(() => {
    if (signal.length === 0) return [];
    const actualHopSize = hopSize ?? Math.floor(fftSize / 2);

    // Use GPU FFT if enabled and device is ready
    if (useGPUFFT && gpuDeviceRef.current) {
      // Return empty data while GPU computes
      // Actual computation happens in useEffect below
      return [];
    }

    // CPU FFT (default)
    return generateSpectrogram(
      signal,
      fftSize,
      actualHopSize,
      sampleRate,
      windowFunction,
      useDb
    );
  }, [signal, fftSize, hopSize, sampleRate, windowFunction, useDb, useGPUFFT]);

  // GPU FFT computation (async)
  const [gpuSpectrogramData, setGpuSpectrogramData] = React.useState<
    SpectrogramPoint[]
  >([]);

  useEffect(() => {
    if (!useGPUFFT || !gpuDeviceRef.current || signal.length === 0) {
      return;
    }

    const actualHopSize = hopSize ?? Math.floor(fftSize / 2);

    async function computeGPUSpectrogram() {
      try {
        const data = await generateSpectrogramGPU(
          gpuDeviceRef.current!,
          signal,
          fftSize,
          actualHopSize,
          sampleRate,
          windowFunction,
          useDb
        );
        setGpuSpectrogramData(data);
      } catch (error) {
        console.error("GPU FFT failed, falling back to CPU:", error);
        // Fallback to CPU
        const data = generateSpectrogram(
          signal,
          fftSize,
          actualHopSize,
          sampleRate,
          windowFunction,
          useDb
        );
        setGpuSpectrogramData(data);
      }
    }

    computeGPUSpectrogram();
  }, [signal, fftSize, hopSize, sampleRate, windowFunction, useDb, useGPUFFT]);

  // Use GPU data if available, otherwise CPU data
  const finalSpectrogramData = useGPUFFT ? gpuSpectrogramData : spectrogramData;

  // Extract unique time and frequency bins
  const { timeBins, frequencyBins } = useMemo(() => {
    const timeSet = new Set<number>();
    const freqSet = new Set<number>();

    for (const point of finalSpectrogramData) {
      timeSet.add(point.time);
      freqSet.add(point.frequency);
    }

    const times = Array.from(timeSet).sort((a, b) => a - b);
    const freqs = Array.from(freqSet).sort((a, b) => a - b);

    // Apply frequency range filter if specified
    const filteredFreqs = frequencyRange
      ? freqs.filter((f) => f >= frequencyRange[0] && f <= frequencyRange[1])
      : freqs;

    // Apply time range filter if specified
    const filteredTimes = timeRange
      ? times.filter((t) => t >= timeRange[0] && t <= timeRange[1])
      : times;

    return { timeBins: filteredTimes, frequencyBins: filteredFreqs };
  }, [finalSpectrogramData, frequencyRange, timeRange]);

  // Calculate magnitude range
  const { calculatedMin, calculatedMax } = useMemo(() => {
    if (finalSpectrogramData.length === 0) {
      return { calculatedMin: 0, calculatedMax: 1 };
    }

    const magnitudes = finalSpectrogramData.map((d) => d.magnitude);
    return {
      calculatedMin: minMagnitude ?? Math.min(...magnitudes),
      calculatedMax: maxMagnitude ?? Math.max(...magnitudes),
    };
  }, [finalSpectrogramData, minMagnitude, maxMagnitude]);

  // Domains for rendering
  const xDomain: [number, number] = useMemo(() => {
    if (timeBins.length === 0) return [0, 1];
    return [timeBins[0], timeBins[timeBins.length - 1]];
  }, [timeBins]);

  const yDomain: [number, number] = useMemo(() => {
    if (frequencyBins.length === 0) return [0, sampleRate / 2];
    return [frequencyBins[0], frequencyBins[frequencyBins.length - 1]];
  }, [frequencyBins, sampleRate]);

  // Default formatters
  const xFormatter = useMemo(() => {
    return (
      xAxis.formatter ||
      ((value: number) => {
        // Format as time (samples or seconds)
        const timeInSeconds = value / sampleRate;
        return `${timeInSeconds.toFixed(2)}s`;
      })
    );
  }, [xAxis.formatter, sampleRate]);

  const yFormatter = useMemo(() => {
    return (
      yAxis.formatter ||
      ((value: number) => {
        // Format as frequency
        if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}kHz`;
        }
        return `${value.toFixed(0)}Hz`;
      })
    );
  }, [yAxis.formatter]);

  return (
    <ChartRoot
      width={width}
      height={height}
      xAxis={{ ...xAxis, label: xAxis.label || "Time", formatter: xFormatter }}
      yAxis={{
        ...yAxis,
        label: yAxis.label || "Frequency",
        formatter: yFormatter,
      }}
      xDomain={xDomain}
      yDomain={yDomain}
      preferWebGPU={preferWebGPU}
      className={className}
    >
      <WaterfallChartContext.Provider
        value={{
          spectrogramData: finalSpectrogramData,
          frequencyBins,
          timeBins,
          colorScale,
          minMagnitude: calculatedMin,
          maxMagnitude: calculatedMax,
          sampleRate,
          useDb,
        }}
      >
        {children}
      </WaterfallChartContext.Provider>
    </ChartRoot>
  );
}

function Canvas() {
  const ctx = useWaterfallChart();
  const rendererRef = useRef<
    | WebGLRenderer<WaterfallRendererProps>
    | WebGPURenderer<WaterfallRendererProps>
    | null
  >(null);
  const mountedRef = useRef(true);

  // Initialize renderer once
  useEffect(() => {
    const canvas = ctx.canvasRef.current;
    if (!canvas) return;

    const dpr = ctx.devicePixelRatio;
    canvas.width = ctx.width * dpr;
    canvas.height = ctx.height * dpr;
    canvas.style.width = `${ctx.width}px`;
    canvas.style.height = `${ctx.height}px`;

    mountedRef.current = true;

    async function initRenderer() {
      if (!canvas) return;

      try {
        if (ctx.preferWebGPU && "gpu" in navigator) {
          const adapter = await navigator.gpu?.requestAdapter();
          if (adapter) {
            const device = await adapter.requestDevice();
            const renderer = createWebGPUWaterfallRenderer(canvas, device);

            if (!mountedRef.current) {
              renderer.destroy();
              return;
            }

            rendererRef.current = renderer;
            ctx.setRenderMode("webgpu");
            return;
          }
        }
      } catch (error) {
        console.warn("WebGPU failed, falling back to WebGL:", error);
      }

      try {
        const renderer = createWebGLWaterfallRenderer(canvas);

        if (!mountedRef.current) {
          renderer.destroy();
          return;
        }

        rendererRef.current = renderer;
        ctx.setRenderMode("webgl");
      } catch (error) {
        console.error("WebGL failed:", error);
      }
    }

    initRenderer();

    return () => {
      mountedRef.current = false;
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only initialize once

  // Update render when data changes
  useEffect(() => {
    const canvas = ctx.canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return;

    const dpr = ctx.devicePixelRatio;

    const renderProps = {
      canvas,
      spectrogramData: ctx.spectrogramData,
      timeBins: ctx.timeBins,
      frequencyBins: ctx.frequencyBins,
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
      showGrid: false,
      colorScale: ctx.colorScale,
      minMagnitude: ctx.minMagnitude,
      maxMagnitude: ctx.maxMagnitude,
    };

    renderer.render(renderProps);
  }, [
    ctx.canvasRef,
    ctx.spectrogramData,
    ctx.timeBins,
    ctx.frequencyBins,
    ctx.xDomain,
    ctx.yDomain,
    ctx.xTicks,
    ctx.yTicks,
    ctx.width,
    ctx.height,
    ctx.devicePixelRatio,
    ctx.margin,
    ctx.colorScale,
    ctx.minMagnitude,
    ctx.maxMagnitude,
  ]);

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
  const ctx = useWaterfallChart();

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

    // Convert screen coordinates to data coordinates
    const innerWidth = ctx.width - ctx.margin.left - ctx.margin.right;
    const innerHeight = ctx.height - ctx.margin.top - ctx.margin.bottom;

    const relX = x - ctx.margin.left;
    const relY = y - ctx.margin.top;

    const dataX =
      ctx.xDomain[0] + (relX / innerWidth) * (ctx.xDomain[1] - ctx.xDomain[0]);
    const dataY =
      ctx.yDomain[0] +
      ((innerHeight - relY) / innerHeight) * (ctx.yDomain[1] - ctx.yDomain[0]);

    // Find closest data point
    let closestPoint: SpectrogramPoint | null = null;
    let minDist = Infinity;

    for (const point of ctx.spectrogramData) {
      const timeDist = Math.abs(point.time - dataX);
      const freqDist = Math.abs(point.frequency - dataY);
      const dist = Math.sqrt(timeDist * timeDist + freqDist * freqDist);

      if (dist < minDist) {
        minDist = dist;
        closestPoint = point;
      }
    }

    if (closestPoint) {
      const xFormatter = ctx.xAxis?.formatter;
      const yFormatter = ctx.yAxis?.formatter;

      ctx.setHoveredPoint({
        seriesIdx: 0,
        pointIdx: 0,
        screenX: x,
        screenY: y,
      });

      ctx.setTooltipData({
        title: "Spectrogram",
        items: [
          {
            label: "Time",
            value: xFormatter
              ? xFormatter(closestPoint.time)
              : `${(closestPoint.time / ctx.sampleRate).toFixed(3)}s`,
          },
          {
            label: "Frequency",
            value: yFormatter
              ? yFormatter(closestPoint.frequency)
              : `${closestPoint.frequency.toFixed(1)}Hz`,
          },
          {
            label: ctx.useDb ? "Power (dB)" : "Power",
            value: closestPoint.magnitude.toFixed(2),
          },
        ],
      });
    } else {
      ctx.setHoveredPoint(null);
      ctx.setTooltipData(null);
    }
  };

  return <ChartTooltip onHover={handleHover} />;
}

// ============================================================================
// Composed Component (Simple API)
// ============================================================================

export function WaterfallChart({
  signal,
  sampleRate,
  fftSize = 256,
  hopSize,
  windowFunction = "hann",
  useDb = true,
  minMagnitude,
  maxMagnitude,
  frequencyRange,
  timeRange,
  xAxis = {},
  yAxis = {},
  width = 800,
  height = 400,
  showGrid = false,
  showAxes = true,
  showTooltip = false,
  preferWebGPU = true,
  useGPUFFT = false,
  colorScale = defaultColorScale,
  className,
}: WaterfallChartProps) {
  return (
    <Root
      signal={signal}
      sampleRate={sampleRate}
      fftSize={fftSize}
      hopSize={hopSize}
      windowFunction={windowFunction}
      useDb={useDb}
      minMagnitude={minMagnitude}
      maxMagnitude={maxMagnitude}
      frequencyRange={frequencyRange}
      timeRange={timeRange}
      xAxis={xAxis}
      yAxis={yAxis}
      width={width}
      height={height}
      preferWebGPU={preferWebGPU}
      useGPUFFT={useGPUFFT}
      colorScale={colorScale}
      className={className}
    >
      <Canvas />
      {showAxes && <ChartAxes />}
      {showTooltip && <Tooltip />}
    </Root>
  );
}

// ============================================================================
// Primitive API (Composable)
// ============================================================================

/**
 * WaterfallChart Primitives - Composable chart components for custom layouts
 *
 * @example Simple usage (monolithic)
 * ```tsx
 * <WaterfallChart
 *   signal={audioData}
 *   sampleRate={48000}
 *   fftSize={512}
 *   showAxes
 *   showTooltip
 * />
 * ```
 *
 * @example Advanced usage (composable)
 * ```tsx
 * <WaterfallChart.Root
 *   signal={eegData}
 *   sampleRate={256}
 *   fftSize={256}
 *   colorScale={viridis}
 * >
 *   <WaterfallChart.Canvas />
 *   <WaterfallChart.Axes />
 *   <WaterfallChart.Tooltip />
 * </WaterfallChart.Root>
 * ```
 */
WaterfallChart.Root = Root;
WaterfallChart.Canvas = Canvas;
WaterfallChart.Axes = ChartAxes;
WaterfallChart.Tooltip = Tooltip;

// Export types
export type { SpectrogramPoint, WindowFunction };

export default WaterfallChart;
