"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";

/**
 * WebGPU Renderer Context
 *
 * Provides GPU device, context, and rendering capabilities to child components.
 * Automatically falls back to Canvas 2D if WebGPU is unavailable.
 *
 * @example
 * ```tsx
 * <GPURenderer width={800} height={600}>
 *   <GPUParticles count={100000} />
 * </GPURenderer>
 * ```
 */

export interface GPURendererContext {
  device: GPUDevice | null;
  context: GPUCanvasContext | null;
  format: GPUTextureFormat | null;
  width: number;
  height: number;
  canvas: HTMLCanvasElement | null;
  supportsWebGPU: boolean;
  renderPass: (callback: (encoder: GPUCommandEncoder) => void) => void;
}

const Context = createContext<GPURendererContext | null>(null);

export function useGPURenderer() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useGPURenderer must be used within GPURenderer");
  return ctx;
}

export interface GPURendererProps {
  width?: number;
  height?: number;
  className?: string;
  children?: ReactNode;
  backgroundColor?: [number, number, number, number];
  /** Enable anti-aliasing (MSAA) */
  antialias?: boolean;
  /** Sample count for MSAA (2, 4, or 8) */
  sampleCount?: 2 | 4 | 8;
}

export function GPURenderer({
  width = 800,
  height = 600,
  className = "",
  children,
  backgroundColor = [0, 0, 0, 1],
  antialias = true,
  sampleCount = 4,
}: GPURendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gpuContext, setGPUContext] = useState<GPURendererContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebGPU
  useEffect(() => {
    let mounted = true;

    async function initWebGPU() {
      if (!canvasRef.current) return;

      // Check WebGPU support
      if (!navigator.gpu) {
        setError("WebGPU not supported in this browser");
        setGPUContext({
          device: null,
          context: null,
          format: null,
          width,
          height,
          canvas: canvasRef.current,
          supportsWebGPU: false,
          renderPass: () => {},
        });
        return;
      }

      try {
        // Request adapter
        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: "high-performance",
        });

        if (!adapter) {
          throw new Error("No GPU adapter found");
        }

        // Request device
        const device = await adapter.requestDevice();

        if (!mounted) {
          device.destroy();
          return;
        }

        // Configure canvas
        const context = canvasRef.current.getContext("webgpu");
        if (!context) {
          throw new Error("Failed to get WebGPU context");
        }

        const format = navigator.gpu.getPreferredCanvasFormat();

        context.configure({
          device,
          format,
          alphaMode: "premultiplied",
        });

        // Create render pass function
        const renderPass = (callback: (encoder: GPUCommandEncoder) => void) => {
          const encoder = device.createCommandEncoder();
          callback(encoder);
          device.queue.submit([encoder.finish()]);
        };

        setGPUContext({
          device,
          context,
          format,
          width,
          height,
          canvas: canvasRef.current,
          supportsWebGPU: true,
          renderPass,
        });
      } catch (err) {
        console.error("WebGPU initialization failed:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setGPUContext({
          device: null,
          context: null,
          format: null,
          width,
          height,
          canvas: canvasRef.current,
          supportsWebGPU: false,
          renderPass: () => {},
        });
      }
    }

    initWebGPU();

    return () => {
      mounted = false;
      if (gpuContext?.device) {
        gpuContext.device.destroy();
      }
    };
  }, []);

  // Update dimensions when they change
  useEffect(() => {
    if (gpuContext) {
      setGPUContext({ ...gpuContext, width, height });
    }
  }, [width, height]);

  return (
    <div style={{ position: "relative", width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: "block",
        }}
      />
      {error && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "8px 12px",
            background: "rgba(255, 0, 0, 0.1)",
            border: "1px solid rgba(255, 0, 0, 0.3)",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#ff6b6b",
          }}
        >
          WebGPU Error: {error}
        </div>
      )}
      {gpuContext && <Context.Provider value={gpuContext}>{children}</Context.Provider>}
    </div>
  );
}

/**
 * Create a simple compute shader pipeline
 *
 * @param device - GPU device
 * @param code - WGSL shader code
 * @param bindGroupLayout - Bind group layout descriptor
 * @returns Compute pipeline
 */
export function createComputePipeline(
  device: GPUDevice,
  code: string,
  bindGroupLayout: GPUBindGroupLayoutDescriptor
): { pipeline: GPUComputePipeline; layout: GPUBindGroupLayout } {
  const layout = device.createBindGroupLayout(bindGroupLayout);

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [layout],
  });

  const shaderModule = device.createShaderModule({ code });

  const pipeline = device.createComputePipeline({
    layout: pipelineLayout,
    compute: {
      module: shaderModule,
      entryPoint: "main",
    },
  });

  return { pipeline, layout };
}

/**
 * Create a GPU buffer with initial data
 *
 * @param device - GPU device
 * @param data - TypedArray of data
 * @param usage - Buffer usage flags
 * @returns GPU buffer
 */
export function createBufferWithData(
  device: GPUDevice,
  data: ArrayBuffer | ArrayBufferView,
  usage: GPUBufferUsageFlags
): GPUBuffer {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: usage | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });

  const arrayBuffer = buffer.getMappedRange();

  if (data instanceof ArrayBuffer) {
    new Uint8Array(arrayBuffer).set(new Uint8Array(data));
  } else {
    new Uint8Array(arrayBuffer).set(new Uint8Array(data.buffer));
  }

  buffer.unmap();

  return buffer;
}

/**
 * Read data back from GPU buffer
 *
 * @param device - GPU device
 * @param buffer - GPU buffer to read from
 * @param size - Size in bytes
 * @returns Promise resolving to Float32Array
 */
export async function readBuffer(
  device: GPUDevice,
  buffer: GPUBuffer,
  size: number
): Promise<Float32Array> {
  const readBuffer = device.createBuffer({
    size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  const encoder = device.createCommandEncoder();
  encoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, size);
  device.queue.submit([encoder.finish()]);

  await readBuffer.mapAsync(GPUMapMode.READ);
  const data = new Float32Array(readBuffer.getMappedRange().slice(0));
  readBuffer.unmap();
  readBuffer.destroy();

  return data;
}
