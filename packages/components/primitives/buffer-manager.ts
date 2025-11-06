/**
 * WebGPU Buffer Manager
 *
 * Efficient GPU buffer management with automatic resizing, circular buffers,
 * and zero-copy updates. Optimized for real-time physics simulations and
 * streaming data.
 */

import { getWebGPUDevice } from "./device";

// ============================================================================
// Types & Constants
// ============================================================================

export const BUFFER_ALIGNMENT = {
  UNIFORM: 256,
  STORAGE: 16,
  VERTEX: 4,
} as const;

export const DEFAULT_BUFFER_SIZE = 1024 * 1024; // 1MB
export const DEFAULT_CIRCULAR_CAPACITY = 10000;

export type BufferUsage = GPUBufferUsageFlags;
export type BufferData = Float32Array | Uint32Array | Uint16Array;
export type Point3D = readonly [number, number, number];

export interface BufferOptions {
  readonly usage: BufferUsage;
  readonly initialSize?: number;
  readonly label?: string;
  readonly circular?: boolean;
  readonly capacity?: number;
}

export interface BufferMetadata {
  readonly buffer: GPUBuffer;
  readonly size: number;
  readonly usage: BufferUsage;
  readonly label: string;
  readonly circular: boolean;
  readonly capacity: number;
  readonly writeIndex: number;
  readonly allocatedAt: number;
}

export interface BufferStats {
  readonly totalBuffers: number;
  readonly totalAllocated: number;
  readonly buffers: ReadonlyArray<{
    readonly id: string;
    readonly size: number;
    readonly label: string;
  }>;
}

export interface BufferManagerState {
  readonly device: GPUDevice;
  readonly buffers: Map<string, BufferMetadata>;
  readonly totalAllocated: number;
}

// ============================================================================
// Error Utilities
// ============================================================================

export const createBufferError = (message: string): Error => {
  const error = new Error(message);
  error.name = "BufferError";
  return error;
};

export const bufferNotFoundError = (id: string): Error =>
  createBufferError(`Buffer ${id} not found`);

export const bufferOutOfBoundsError = (
  offset: number,
  dataSize: number,
  bufferSize: number
): Error =>
  createBufferError(
    `Buffer update out of bounds: offset=${offset}, dataSize=${dataSize}, bufferSize=${bufferSize}`
  );

export const notCircularBufferError = (id: string): Error =>
  createBufferError(`Buffer ${id} is not a circular buffer`);

// ============================================================================
// Pure Utility Functions
// ============================================================================

export const alignSize = (size: number, alignment: number): number =>
  Math.ceil(size / alignment) * alignment;

export const calculateBufferSize = (
  data: BufferData | null,
  options: BufferOptions
): number => {
  if (options.circular) {
    const capacity = options.capacity ?? DEFAULT_CIRCULAR_CAPACITY;
    return capacity * 4 * 3; // 3 floats * 4 bytes
  }
  return data?.byteLength ?? options.initialSize ?? DEFAULT_BUFFER_SIZE;
};

export const flattenPoints = (points: ReadonlyArray<Point3D>): Float32Array => {
  const data = new Float32Array(points.length * 3);
  let idx = 0;
  for (const [x, y, z] of points) {
    data[idx++] = x;
    data[idx++] = y;
    data[idx++] = z;
  }
  return data;
};

export const formatBytes = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(2)} MB`;

// ============================================================================
// Buffer Creation & Management
// ============================================================================

export const createBufferManager = (device: GPUDevice): BufferManagerState => ({
  device,
  buffers: new Map(),
  totalAllocated: 0,
});

export const createBuffer = (
  state: BufferManagerState,
  id: string,
  data: BufferData | null,
  options: BufferOptions
): [BufferManagerState, GPUBuffer] => {
  const size = calculateBufferSize(data, options);
  const existing = state.buffers.get(id);

  // Reuse existing buffer if large enough
  if (existing?.size >= size) {
    if (data) {
      state.device.queue.writeBuffer(existing.buffer, 0, data.buffer);
    }
    return [state, existing.buffer];
  }

  // Clean up old buffer if exists
  let newState = existing ? destroyBuffer(state, id) : state;

  // Create new buffer
  const buffer = state.device.createBuffer({
    size,
    usage: options.usage | GPUBufferUsage.COPY_DST,
    label: options.label ?? id,
  });

  // Write initial data
  if (data) {
    state.device.queue.writeBuffer(buffer, 0, data.buffer);
  }

  // Create metadata
  const metadata: BufferMetadata = {
    buffer,
    size,
    usage: options.usage,
    label: options.label ?? id,
    circular: options.circular ?? false,
    capacity: options.capacity ?? DEFAULT_CIRCULAR_CAPACITY,
    writeIndex: 0,
    allocatedAt: Date.now(),
  };

  // Update state immutably
  const newBuffers = new Map(newState.buffers);
  newBuffers.set(id, metadata);

  return [
    {
      ...newState,
      buffers: newBuffers,
      totalAllocated: newState.totalAllocated + size,
    },
    buffer,
  ];
};

export const updateBuffer = (
  state: BufferManagerState,
  id: string,
  data: BufferData,
  offset = 0
): void => {
  const metadata = state.buffers.get(id);
  if (!metadata) throw bufferNotFoundError(id);

  if (offset + data.byteLength > metadata.size) {
    throw bufferOutOfBoundsError(offset, data.byteLength, metadata.size);
  }

  state.device.queue.writeBuffer(metadata.buffer, offset, data.buffer);
};

export const addToCircularBuffer = (
  state: BufferManagerState,
  id: string,
  point: Point3D
): BufferManagerState => {
  const metadata = state.buffers.get(id);
  if (!metadata) throw bufferNotFoundError(id);
  if (!metadata.circular) throw notCircularBufferError(id);

  const data = new Float32Array(point);
  const offset = metadata.writeIndex * 3 * 4;

  state.device.queue.writeBuffer(metadata.buffer, offset, data.buffer);

  // Update metadata immutably
  const newMetadata: BufferMetadata = {
    ...metadata,
    writeIndex: (metadata.writeIndex + 1) % metadata.capacity,
  };

  const newBuffers = new Map(state.buffers);
  newBuffers.set(id, newMetadata);

  return {
    ...state,
    buffers: newBuffers,
  };
};

export const addManyToCircularBuffer = (
  state: BufferManagerState,
  id: string,
  points: ReadonlyArray<Point3D>
): BufferManagerState => {
  if (points.length === 0) return state;

  const metadata = state.buffers.get(id);
  if (!metadata) throw bufferNotFoundError(id);
  if (!metadata.circular) throw notCircularBufferError(id);

  const data = flattenPoints(points);
  const remainingSpace = metadata.capacity - metadata.writeIndex;

  let newWriteIndex: number;

  if (points.length <= remainingSpace) {
    // No wrap needed
    const offset = metadata.writeIndex * 3 * 4;
    state.device.queue.writeBuffer(metadata.buffer, offset, data.buffer);
    newWriteIndex = (metadata.writeIndex + points.length) % metadata.capacity;
  } else {
    // Wrap around - write in two chunks
    const firstChunk = data.subarray(0, remainingSpace * 3);
    const secondChunk = data.subarray(remainingSpace * 3);

    // Write first chunk at current position
    const offset1 = metadata.writeIndex * 3 * 4;
    state.device.queue.writeBuffer(metadata.buffer, offset1, firstChunk.buffer);

    // Write second chunk at beginning
    state.device.queue.writeBuffer(metadata.buffer, 0, secondChunk.buffer);

    newWriteIndex = secondChunk.length / 3;
  }

  // Update metadata immutably
  const newMetadata: BufferMetadata = {
    ...metadata,
    writeIndex: newWriteIndex,
  };

  const newBuffers = new Map(state.buffers);
  newBuffers.set(id, newMetadata);

  return {
    ...state,
    buffers: newBuffers,
  };
};

export const getBuffer = (
  state: BufferManagerState,
  id: string
): GPUBuffer | null => state.buffers.get(id)?.buffer ?? null;

export const getMetadata = (
  state: BufferManagerState,
  id: string
): BufferMetadata | null => state.buffers.get(id) ?? null;

export const destroyBuffer = (
  state: BufferManagerState,
  id: string
): BufferManagerState => {
  const metadata = state.buffers.get(id);
  if (!metadata) return state;

  metadata.buffer.destroy();

  const newBuffers = new Map(state.buffers);
  newBuffers.delete(id);

  return {
    ...state,
    buffers: newBuffers,
    totalAllocated: state.totalAllocated - metadata.size,
  };
};

export const destroyAllBuffers = (
  state: BufferManagerState
): BufferManagerState => {
  for (const metadata of state.buffers.values()) {
    metadata.buffer.destroy();
  }

  return {
    ...state,
    buffers: new Map(),
    totalAllocated: 0,
  };
};

export const getStats = (state: BufferManagerState): BufferStats => {
  const buffers = Array.from(state.buffers.entries()).map(([id, metadata]) => ({
    id,
    size: metadata.size,
    label: metadata.label,
  }));

  return {
    totalBuffers: state.buffers.size,
    totalAllocated: state.totalAllocated,
    buffers,
  };
};

export const logStats = (state: BufferManagerState): void => {
  const stats = getStats(state);

  console.group("WebGPU Buffer Manager Stats");
  console.log(`Total Buffers: ${stats.totalBuffers}`);
  console.log(`Total Allocated: ${formatBytes(stats.totalAllocated)}`);
  console.table(
    stats.buffers.map((b) => ({
      ...b,
      sizeMB: formatBytes(b.size),
    }))
  );
  console.groupEnd();
};

// ============================================================================
// Factory Functions
// ============================================================================

export const createVertexBuffer = async (
  data: Float32Array,
  label?: string
): Promise<GPUBuffer | null> => {
  const deviceInfo = await getWebGPUDevice();
  if (!deviceInfo) return null;

  const buffer = deviceInfo.device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    label: label ?? "Vertex Buffer",
  });

  deviceInfo.device.queue.writeBuffer(buffer, 0, data.buffer);
  return buffer;
};

export const createUniformBuffer = async (
  data: Float32Array,
  label?: string
): Promise<GPUBuffer | null> => {
  const deviceInfo = await getWebGPUDevice();
  if (!deviceInfo) return null;

  const size = alignSize(data.byteLength, BUFFER_ALIGNMENT.UNIFORM);

  const buffer = deviceInfo.device.createBuffer({
    size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    label: label ?? "Uniform Buffer",
  });

  deviceInfo.device.queue.writeBuffer(buffer, 0, data.buffer);
  return buffer;
};

export const createStorageBuffer = async (
  data: BufferData,
  readable = true,
  label?: string
): Promise<GPUBuffer | null> => {
  const deviceInfo = await getWebGPUDevice();
  if (!deviceInfo) return null;

  const usage = readable
    ? GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
    : GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;

  const buffer = deviceInfo.device.createBuffer({
    size: data.byteLength,
    usage,
    label: label ?? "Storage Buffer",
  });

  deviceInfo.device.queue.writeBuffer(buffer, 0, data.buffer);
  return buffer;
};

// ============================================================================
// Buffer Operations
// ============================================================================

export const readBuffer = async (
  device: GPUDevice,
  buffer: GPUBuffer,
  size: number
): Promise<Float32Array> => {
  // Create staging buffer
  const stagingBuffer = device.createBuffer({
    size,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    label: "Staging Buffer",
  });

  try {
    // Copy GPU buffer to staging buffer
    const commandEncoder = device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(buffer, 0, stagingBuffer, 0, size);
    device.queue.submit([commandEncoder.finish()]);

    // Map and read
    await stagingBuffer.mapAsync(GPUMapMode.READ);
    const mappedRange = stagingBuffer.getMappedRange();
    const data = new Float32Array(new ArrayBuffer(mappedRange.byteLength));
    data.set(new Float32Array(mappedRange));

    stagingBuffer.unmap();
    return data;
  } finally {
    stagingBuffer.destroy();
  }
};

export const copyBuffer = (
  device: GPUDevice,
  source: GPUBuffer,
  destination: GPUBuffer,
  size: number
): void => {
  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyBufferToBuffer(source, 0, destination, 0, size);
  device.queue.submit([commandEncoder.finish()]);
};

// ============================================================================
// Composable Buffer Manager API
// ============================================================================

export interface BufferManagerAPI {
  readonly state: BufferManagerState;
  readonly create: (
    id: string,
    data: BufferData | null,
    options: BufferOptions
  ) => [BufferManagerAPI, GPUBuffer];
  readonly update: (
    id: string,
    data: BufferData,
    offset?: number
  ) => BufferManagerAPI;
  readonly addPoint: (id: string, point: Point3D) => BufferManagerAPI;
  readonly addPoints: (
    id: string,
    points: ReadonlyArray<Point3D>
  ) => BufferManagerAPI;
  readonly get: (id: string) => GPUBuffer | null;
  readonly getMeta: (id: string) => BufferMetadata | null;
  readonly destroy: (id: string) => BufferManagerAPI;
  readonly destroyAll: () => BufferManagerAPI;
  readonly stats: () => BufferStats;
  readonly log: () => void;
}

export const bufferManager = (device: GPUDevice): BufferManagerAPI => {
  const withState = (state: BufferManagerState): BufferManagerAPI => ({
    state,
    create: (id, data, options) => {
      const [newState, buffer] = createBuffer(state, id, data, options);
      return [withState(newState), buffer];
    },
    update: (id, data, offset) => {
      updateBuffer(state, id, data, offset);
      return withState(state);
    },
    addPoint: (id, point) => withState(addToCircularBuffer(state, id, point)),
    addPoints: (id, points) =>
      withState(addManyToCircularBuffer(state, id, points)),
    get: (id) => getBuffer(state, id),
    getMeta: (id) => getMetadata(state, id),
    destroy: (id) => withState(destroyBuffer(state, id)),
    destroyAll: () => withState(destroyAllBuffers(state)),
    stats: () => getStats(state),
    log: () => logStats(state),
  });

  return withState(createBufferManager(device));
};

// ============================================================================
// Usage Example
// ============================================================================

/*
const device = await getWebGPUDevice();
const manager = bufferManager(device!.device);

// Create a buffer
const [manager2, buffer] = manager.create('vertices', data, {
  usage: GPUBufferUsage.VERTEX,
});

// Update buffer
const manager3 = manager2.update('vertices', newData);

// Add points to circular buffer
const manager4 = manager3
  .addPoint('trajectory', [1, 2, 3])
  .addPoints('trajectory', [[4, 5, 6], [7, 8, 9]]);

// Get stats
manager4.log();
*/
