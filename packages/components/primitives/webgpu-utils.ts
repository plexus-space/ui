/**
 * WebGPU Utilities
 *
 * Core utilities for WebGPU initialization, context management, and uniform buffers.
 * Consolidates device, context, and uniform buffer management.
 */

import { getWebGPUDevice, isWebGPUAvailable } from "./device";

// ============================================================================
// WebGPU Context
// ============================================================================

export interface WebGPUContext {
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

/**
 * Creates a WebGPU context for the given canvas.
 * Handles all initialization and error checking.
 *
 * @param canvas - The canvas element to render to
 * @returns WebGPU context with device, context, and format
 * @throws Error if WebGPU is not supported or initialization fails
 */
export const createWebGPUContext = async (
  canvas: HTMLCanvasElement
): Promise<WebGPUContext> => {
  if (!isWebGPUAvailable()) {
    throw new Error("WebGPU is not supported in this browser");
  }

  const deviceInfo = await getWebGPUDevice({ canvas });

  if (!deviceInfo?.device || !deviceInfo?.context) {
    throw new Error("Failed to get WebGPU device or context");
  }

  const format = navigator.gpu.getPreferredCanvasFormat();

  return {
    device: deviceInfo.device,
    context: deviceInfo.context,
    format,
  };
};

/**
 * Configures the canvas context with the given format.
 *
 * @param context - The GPU canvas context
 * @param device - The GPU device
 * @param format - The texture format
 * @param alphaMode - The alpha mode (default: 'premultiplied')
 */
export const configureContext = (
  context: GPUCanvasContext,
  device: GPUDevice,
  format: GPUTextureFormat,
  alphaMode: GPUCanvasAlphaMode = "premultiplied"
): void => {
  context.configure({
    device,
    format,
    alphaMode,
  });
};

// ============================================================================
// Uniform Buffer Utilities
// ============================================================================

/**
 * WebGPU uniform buffer alignment requirement (256 bytes)
 */
export const UNIFORM_BUFFER_ALIGNMENT = 256;

/**
 * Creates a Float32Array with data aligned to the specified byte boundary.
 *
 * WebGPU requires uniform buffers to be aligned to 256 bytes.
 * This function pads the data to meet that requirement.
 *
 * @param data - Array of numbers to include in the uniform buffer
 * @param alignment - Byte alignment (default: 256)
 * @returns Float32Array aligned to the specified boundary
 */
export const createAlignedUniformData = (
  data: number[],
  alignment: number = UNIFORM_BUFFER_ALIGNMENT
): Float32Array => {
  const float32 = new Float32Array(data);
  const alignedSize = Math.ceil(float32.byteLength / alignment) * alignment;
  const alignedData = new Float32Array(alignedSize / 4); // 4 bytes per float
  alignedData.set(float32);
  return alignedData;
};

/**
 * Calculates the aligned size for a uniform buffer.
 *
 * @param byteLength - The size in bytes
 * @param alignment - Byte alignment (default: 256)
 * @returns Aligned size in bytes
 */
export const getAlignedUniformSize = (
  byteLength: number,
  alignment: number = UNIFORM_BUFFER_ALIGNMENT
): number => {
  return Math.ceil(byteLength / alignment) * alignment;
};

/**
 * Creates a GPU buffer for uniform data.
 *
 * @param device - The GPU device
 * @param data - The uniform data (already aligned)
 * @param label - Optional label for debugging
 * @returns GPU buffer
 */
export const createUniformBuffer = (
  device: GPUDevice,
  data: Float32Array,
  label?: string
): GPUBuffer => {
  const buffer = device.createBuffer({
    label,
    size: data.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(
    buffer,
    0,
    data.buffer,
    data.byteOffset,
    data.byteLength
  );

  return buffer;
};

/**
 * Updates a uniform buffer with new data.
 *
 * @param device - The GPU device
 * @param buffer - The uniform buffer to update
 * @param data - The new uniform data (already aligned)
 * @param offset - Byte offset (default: 0)
 */
export const updateUniformBuffer = (
  device: GPUDevice,
  buffer: GPUBuffer,
  data: Float32Array,
  offset: number = 0
): void => {
  device.queue.writeBuffer(
    buffer,
    offset,
    data.buffer,
    data.byteOffset,
    data.byteLength
  );
};

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Executes a function with error scope to catch WebGPU errors.
 * This is useful for debugging and identifying the source of WebGPU errors.
 *
 * @param device - The GPU device
 * @param fn - The function to execute
 * @param errorType - The type of error to catch ('validation', 'out-of-memory', or 'internal')
 * @returns Promise that resolves with the error (if any)
 *
 * @example
 * ```ts
 * await withErrorScope(device, () => {
 *   // WebGPU operations that might fail
 *   device.createBuffer({ ... });
 * }, 'validation');
 * ```
 */
export const withErrorScope = async (
  device: GPUDevice,
  fn: () => void | Promise<void>,
  errorType: "validation" | "out-of-memory" | "internal" = "validation"
): Promise<GPUError | null> => {
  device.pushErrorScope(errorType);
  await fn();
  return device.popErrorScope();
};

/**
 * Executes a function with all error scopes to catch any WebGPU errors.
 * This catches validation, out-of-memory, and internal errors.
 *
 * @param device - The GPU device
 * @param fn - The function to execute
 * @param onError - Optional callback when an error occurs
 * @returns Promise that resolves when complete
 *
 * @example
 * ```ts
 * await withAllErrorScopes(device, async () => {
 *   // WebGPU operations
 * }, (error, type) => {
 *   console.error(`${type} error:`, error.message);
 * });
 * ```
 */
export const withAllErrorScopes = async (
  device: GPUDevice,
  fn: () => void | Promise<void>,
  onError?: (error: GPUError, type: string) => void
): Promise<void> => {
  // Push all error scopes
  device.pushErrorScope("validation");
  device.pushErrorScope("out-of-memory");
  device.pushErrorScope("internal");

  // Execute function
  await fn();

  // Pop and check each error scope (in reverse order)
  const internalError = await device.popErrorScope();
  const outOfMemoryError = await device.popErrorScope();
  const validationError = await device.popErrorScope();

  // Report errors
  if (validationError) {
    console.error("WebGPU validation error:", validationError.message);
    onError?.(validationError, "validation");
  }
  if (outOfMemoryError) {
    console.error("WebGPU out-of-memory error:", outOfMemoryError.message);
    onError?.(outOfMemoryError, "out-of-memory");
  }
  if (internalError) {
    console.error("WebGPU internal error:", internalError.message);
    onError?.(internalError, "internal");
  }
};
