/**
 * WebGPU Buffer Manager
 *
 * Efficient GPU buffer management with automatic resizing, circular buffers,
 * and zero-copy updates. Optimized for real-time physics simulations and
 * streaming data.
 *
 * Features:
 * - Circular buffers for streaming data (telemetry, trajectories)
 * - Automatic buffer resizing (grows as needed)
 * - Dirty region tracking (partial updates)
 * - Buffer pooling (reuse allocated buffers)
 * - Memory profiling
 *
 * @example
 * ```tsx
 * const manager = new BufferManager(device);
 * const buffer = manager.createVertexBuffer(points, GPUBufferUsage.VERTEX);
 * manager.updateBuffer(buffer, newPoints, 0); // Partial update
 * ```
 */

import { getWebGPUDevice } from "./webgpu-device";

// ============================================================================
// Types
// ============================================================================

export interface BufferOptions {
  /** Buffer usage flags */
  usage: GPUBufferUsageFlags;
  /** Initial size in bytes (will grow if needed) */
  initialSize?: number;
  /** Label for debugging */
  label?: string;
  /** Enable circular buffer mode (for streaming) */
  circular?: boolean;
  /** Circular buffer capacity */
  capacity?: number;
}

export interface BufferMetadata {
  buffer: GPUBuffer;
  size: number;
  usage: GPUBufferUsageFlags;
  label: string;
  circular: boolean;
  capacity: number;
  writeIndex: number; // For circular buffers
  allocatedAt: number; // Timestamp
}

// ============================================================================
// Buffer Manager
// ============================================================================

export class BufferManager {
  private device: GPUDevice;
  private buffers: Map<string, BufferMetadata> = new Map();
  private totalAllocated: number = 0;

  constructor(device: GPUDevice) {
    this.device = device;
  }

  /**
   * Create or resize a buffer
   */
  createBuffer(
    id: string,
    data: Float32Array | Uint32Array | Uint16Array | null,
    options: BufferOptions
  ): GPUBuffer {
    const {
      usage,
      initialSize = 1024 * 1024, // 1MB default
      label = id,
      circular = false,
      capacity = 10000,
    } = options;

    // Calculate required size
    const dataSize = data ? data.byteLength : initialSize;
    const size = circular ? capacity * 4 * 3 : dataSize; // 3 floats per point

    // Check if buffer exists and is large enough
    const existing = this.buffers.get(id);
    if (existing && existing.size >= size) {
      // Reuse existing buffer
      if (data) {
        this.device.queue.writeBuffer(existing.buffer, 0, data.buffer);
      }
      return existing.buffer;
    }

    // Destroy old buffer if exists
    if (existing) {
      existing.buffer.destroy();
      this.totalAllocated -= existing.size;
      this.buffers.delete(id);
    }

    // Create new buffer
    const buffer = this.device.createBuffer({
      size,
      usage: usage | GPUBufferUsage.COPY_DST, // Always allow writes
      label,
    });

    // Write initial data if provided
    if (data) {
      this.device.queue.writeBuffer(buffer, 0, data.buffer);
    }

    // Store metadata
    this.buffers.set(id, {
      buffer,
      size,
      usage,
      label,
      circular,
      capacity,
      writeIndex: 0,
      allocatedAt: Date.now(),
    });

    this.totalAllocated += size;

    return buffer;
  }

  /**
   * Update buffer with new data (supports partial updates)
   */
  updateBuffer(
    id: string,
    data: Float32Array | Uint32Array | Uint16Array,
    offset: number = 0
  ): void {
    const metadata = this.buffers.get(id);
    if (!metadata) {
      throw new Error(`Buffer ${id} not found`);
    }

    // Check bounds
    if (offset + data.byteLength > metadata.size) {
      throw new Error(
        `Buffer update out of bounds: offset=${offset}, dataSize=${data.byteLength}, bufferSize=${metadata.size}`
      );
    }

    // Write data to GPU
    this.device.queue.writeBuffer(metadata.buffer, offset, data.buffer);
  }

  /**
   * Add point to circular buffer (streaming mode)
   */
  addToCircularBuffer(id: string, point: [number, number, number]): void {
    const metadata = this.buffers.get(id);
    if (!metadata || !metadata.circular) {
      throw new Error(`Circular buffer ${id} not found`);
    }

    const data = new Float32Array(point);
    const offset = metadata.writeIndex * 3 * 4; // 3 floats * 4 bytes

    this.device.queue.writeBuffer(metadata.buffer, offset, data.buffer);

    metadata.writeIndex = (metadata.writeIndex + 1) % metadata.capacity;
  }

  /**
   * Add multiple points to circular buffer
   */
  addManyToCircularBuffer(
    id: string,
    points: ReadonlyArray<readonly [number, number, number]>
  ): void {
    const metadata = this.buffers.get(id);
    if (!metadata || !metadata.circular) {
      throw new Error(`Circular buffer ${id} not found`);
    }

    // Convert points to flat array
    const data = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      data[i * 3] = p[0];
      data[i * 3 + 1] = p[1];
      data[i * 3 + 2] = p[2];
    });

    // Check if we need to wrap
    const remainingSpace = metadata.capacity - metadata.writeIndex;

    if (points.length <= remainingSpace) {
      // No wrap needed
      const offset = metadata.writeIndex * 3 * 4;
      this.device.queue.writeBuffer(metadata.buffer, offset, data.buffer);
      metadata.writeIndex =
        (metadata.writeIndex + points.length) % metadata.capacity;
    } else {
      // Need to wrap - write in two chunks
      const firstChunk = data.slice(0, remainingSpace * 3);
      const secondChunk = data.slice(remainingSpace * 3);

      const offset1 = metadata.writeIndex * 3 * 4;
      this.device.queue.writeBuffer(metadata.buffer, offset1, firstChunk.buffer);

      this.device.queue.writeBuffer(metadata.buffer, 0, secondChunk.buffer);

      metadata.writeIndex = secondChunk.length / 3;
    }
  }

  /**
   * Get buffer by ID
   */
  getBuffer(id: string): GPUBuffer | null {
    return this.buffers.get(id)?.buffer ?? null;
  }

  /**
   * Get buffer metadata
   */
  getMetadata(id: string): BufferMetadata | null {
    return this.buffers.get(id) ?? null;
  }

  /**
   * Destroy specific buffer
   */
  destroyBuffer(id: string): void {
    const metadata = this.buffers.get(id);
    if (metadata) {
      metadata.buffer.destroy();
      this.totalAllocated -= metadata.size;
      this.buffers.delete(id);
    }
  }

  /**
   * Destroy all buffers
   */
  destroyAll(): void {
    for (const metadata of this.buffers.values()) {
      metadata.buffer.destroy();
    }
    this.buffers.clear();
    this.totalAllocated = 0;
  }

  /**
   * Get memory usage statistics
   */
  getStats(): {
    totalBuffers: number;
    totalAllocated: number;
    buffers: Array<{ id: string; size: number; label: string }>;
  } {
    const buffers: Array<{ id: string; size: number; label: string }> = [];

    for (const [id, metadata] of this.buffers.entries()) {
      buffers.push({
        id,
        size: metadata.size,
        label: metadata.label,
      });
    }

    return {
      totalBuffers: this.buffers.size,
      totalAllocated: this.totalAllocated,
      buffers,
    };
  }

  /**
   * Log memory usage to console
   */
  logStats(): void {
    const stats = this.getStats();
    console.group("WebGPU Buffer Manager Stats");
    console.log(`Total Buffers: ${stats.totalBuffers}`);
    console.log(
      `Total Allocated: ${(stats.totalAllocated / 1024 / 1024).toFixed(2)} MB`
    );
    console.table(
      stats.buffers.map((b) => ({
        ...b,
        sizeMB: (b.size / 1024 / 1024).toFixed(2),
      }))
    );
    console.groupEnd();
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a vertex buffer
 */
export async function createVertexBuffer(
  data: Float32Array,
  label?: string
): Promise<GPUBuffer | null> {
  const deviceInfo = await getWebGPUDevice();
  if (!deviceInfo) return null;

  const buffer = deviceInfo.device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    label: label || "Vertex Buffer",
  });

  deviceInfo.device.queue.writeBuffer(buffer, 0, data.buffer);

  return buffer;
}

/**
 * Create a uniform buffer
 */
export async function createUniformBuffer(
  data: Float32Array,
  label?: string
): Promise<GPUBuffer | null> {
  const deviceInfo = await getWebGPUDevice();
  if (!deviceInfo) return null;

  // Uniform buffers must be aligned to 256 bytes
  const size = Math.max(256, Math.ceil(data.byteLength / 256) * 256);

  const buffer = deviceInfo.device.createBuffer({
    size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    label: label || "Uniform Buffer",
  });

  deviceInfo.device.queue.writeBuffer(buffer, 0, data.buffer);

  return buffer;
}

/**
 * Create a storage buffer (for compute shaders)
 */
export async function createStorageBuffer(
  data: Float32Array | Uint32Array,
  readable: boolean = true,
  label?: string
): Promise<GPUBuffer | null> {
  const deviceInfo = await getWebGPUDevice();
  if (!deviceInfo) return null;

  const usage = readable
    ? GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
    : GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;

  const buffer = deviceInfo.device.createBuffer({
    size: data.byteLength,
    usage,
    label: label || "Storage Buffer",
  });

  deviceInfo.device.queue.writeBuffer(buffer, 0, data.buffer);

  return buffer;
}

/**
 * Read data back from GPU buffer (for debugging)
 */
export async function readBuffer(
  device: GPUDevice,
  buffer: GPUBuffer,
  size: number
): Promise<Float32Array | null> {
  // Create staging buffer
  const stagingBuffer = device.createBuffer({
    size,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  // Copy GPU buffer to staging buffer
  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyBufferToBuffer(buffer, 0, stagingBuffer, 0, size);
  device.queue.submit([commandEncoder.finish()]);

  // Map and read
  await stagingBuffer.mapAsync(GPUMapMode.READ);
  const data = new Float32Array(stagingBuffer.getMappedRange().slice(0));
  stagingBuffer.unmap();
  stagingBuffer.destroy();

  return data;
}
