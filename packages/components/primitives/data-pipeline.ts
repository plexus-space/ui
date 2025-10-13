/**
 * Modern Data Pipeline
 *
 * High-performance data streaming, buffering, and interpolation for real-time visualization.
 * Built with modern TypeScript patterns, functional composition, and performance optimizations.
 */

import { lttb } from "../decimation";

// ============================================================================
// Core Types - Using const assertions and type inference
// ============================================================================

export type Timestamp = number & { __brand: "Timestamp" };

export type DataPoint<T = number> = {
  value: T;
  timestamp: Timestamp;
};

export type InterpolationMethod = "linear" | "cubic" | "spline" | "nearest";

export type StreamEvent =
  | { type: "connected" }
  | { type: "disconnected" }
  | { type: "data"; payload: unknown }
  | { type: "error"; message: string; error?: unknown }
  | { type: "reconnecting"; attempt: number }
  | { type: "maxReconnectAttemptsReached" };

// Use const assertions for config objects
export const createStreamConfig = (config: {
  url: string;
  protocols?: string[];
  reconnect?: {
    enabled?: boolean;
    interval?: number;
    maxAttempts?: number;
    backoff?: "linear" | "exponential";
  };
  buffer?: {
    maxSize?: number;
    flushOnConnect?: boolean;
  };
  heartbeat?: {
    interval: number;
    message: unknown;
  };
}) =>
  ({
    ...config,
    protocols: config.protocols ?? [],
    reconnect: {
      enabled: true,
      interval: 5000,
      maxAttempts: 10,
      backoff: "exponential" as const,
      ...config.reconnect,
    },
    buffer: {
      maxSize: 1000,
      flushOnConnect: true,
      ...config.buffer,
    },
  } as const);

// ============================================================================
// Utility Functions - Pure and composable
// ============================================================================

export const timestamp = (value: number): Timestamp => value as Timestamp;
export const now = () => timestamp(Date.now());

// Pipe function for composition
export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value);

// Async pipe for async operations
export const pipeAsync =
  <T>(...fns: Array<(arg: T) => Promise<T> | T>) =>
  async (value: T): Promise<T> => {
    let result = value;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };

// ============================================================================
// Event System - Using discriminated unions
// ============================================================================

export const createEventBus = <T>() => {
  const subscribers = new Map<string, Set<(event: T) => void>>();

  return {
    emit: (event: T) => {
      const type = (event as any).type;
      subscribers.get(type)?.forEach((fn) => fn(event));
      subscribers.get("*")?.forEach((fn) => fn(event));
    },

    on: (type: string, handler: (event: T) => void) => {
      if (!subscribers.has(type)) {
        subscribers.set(type, new Set());
      }
      subscribers.get(type)!.add(handler);

      // Return unsubscribe function
      return () => subscribers.get(type)?.delete(handler);
    },

    once: (type: string, handler: (event: T) => void) => {
      const wrappedHandler = (event: T) => {
        handler(event);
        subscribers.get(type)?.delete(wrappedHandler);
      };
      return subscribers.get(type)?.add(wrappedHandler);
    },
  };
};

// ============================================================================
// Lock-free Async Queue for concurrency
// ============================================================================

export const createAsyncQueue = <T>() => {
  const queue: T[] = [];
  const waiters: Array<(value: T) => void> = [];

  return {
    push: (item: T) => {
      const waiter = waiters.shift();
      if (waiter) {
        waiter(item);
      } else {
        queue.push(item);
      }
    },

    pull: async (): Promise<T> => {
      const item = queue.shift();
      if (item !== undefined) {
        return item;
      }

      return new Promise<T>((resolve) => {
        waiters.push(resolve);
      });
    },

    size: () => queue.length,
    isEmpty: () => queue.length === 0,
  };
};

// ============================================================================
// Time Series Buffer - Optimized with typed arrays
// ============================================================================

export const createTimeSeriesBuffer = <T = number>(capacity: number) => {
  if (!Number.isFinite(capacity)) {
    throw new Error(`Capacity must be a finite number, got ${capacity}`);
  }
  if (capacity <= 0) {
    throw new Error(`Capacity must be positive, got ${capacity}`);
  }
  if (capacity > 10_000_000) {
    throw new Error(`Capacity ${capacity} exceeds maximum safe size (10,000,000)`);
  }

  let buffer: T[] = [];
  let timestamps: Timestamp[] = [];
  let writeIndex = 0;
  let isFull = false;

  // Optimized iterator - no copying, returns views
  const getOrdered = <U>(arr: U[]): U[] => {
    if (!isFull) {
      return arr;
    }
    // Only copy when actually needed (full circular buffer)
    const result = new Array<U>(capacity);
    let outIdx = 0;
    for (let i = writeIndex; i < capacity; i++, outIdx++) {
      result[outIdx] = arr[i];
    }
    for (let i = 0; i < writeIndex; i++, outIdx++) {
      result[outIdx] = arr[i];
    }
    return result;
  };

  const api = {
    append: (value: T, ts = now()) => {
      if (buffer.length < capacity) {
        buffer.push(value);
        timestamps.push(ts);
        if (buffer.length === capacity) {
          isFull = true;
        }
      } else {
        buffer[writeIndex] = value;
        timestamps[writeIndex] = ts;
        writeIndex = (writeIndex + 1) % capacity;
      }
    },

    appendBatch: (values: T[], times?: Timestamp[]) => {
      if (values.length === 0) return;

      // Optimized batch append
      for (let i = 0; i < values.length; i++) {
        api.append(values[i], times?.[i]);
      }
    },

    *values() {
      const ordered = getOrdered(buffer);
      yield* ordered;
    },

    *entries(): Generator<[T, Timestamp]> {
      const vals = getOrdered(buffer);
      const times = getOrdered(timestamps);
      for (let i = 0; i < vals.length; i++) {
        yield [vals[i], times[i]];
      }
    },

    getData: () => getOrdered(buffer),
    getTimestamps: () => getOrdered(timestamps),

    getPoints: (): DataPoint<T>[] =>
      [...api.entries()].map(([value, timestamp]) => ({ value, timestamp })),

    getSlice: (start: Timestamp, end: Timestamp) => {
      // Optimized: avoid creating full array if not needed
      const result: DataPoint<T>[] = [];
      const vals = getOrdered(buffer);
      const times = getOrdered(timestamps);

      for (let i = 0; i < vals.length; i++) {
        if (times[i] >= start && times[i] <= end) {
          result.push({ value: vals[i], timestamp: times[i] });
        }
      }
      return result;
    },

    getLast: (n: number) => {
      const count = Math.min(n, buffer.length);
      const data = getOrdered(buffer);
      return data.slice(-count);
    },

    decimate: (target: number) => {
      const points = [...api.entries()].map(([value, ts]) => ({
        x: ts,
        y: typeof value === "number" ? value : 0,
      }));
      return target >= points.length ? points : lttb(points, target);
    },

    clear: () => {
      buffer = [];
      timestamps = [];
      writeIndex = 0;
    },

    stats: () => {
      const times = getOrdered(timestamps);
      const oldest = times[0] ?? null;
      const newest = times[times.length - 1] ?? null;
      const span = oldest && newest ? newest - oldest : 0;

      return {
        size: buffer.length,
        capacity,
        fillPercent: (buffer.length / capacity) * 100,
        oldest,
        newest,
        span,
        rate: span > 0 ? (buffer.length / span) * 1000 : 0,
      };
    },

    resize: (newCapacity: number) => {
      if (!Number.isFinite(newCapacity) || newCapacity <= 0) {
        throw new Error(`Invalid resize capacity: ${newCapacity}`);
      }

      const data = getOrdered(buffer);
      const times = getOrdered(timestamps);

      capacity = newCapacity;
      buffer = data.slice(-newCapacity);
      timestamps = times.slice(-newCapacity);
      writeIndex = 0;
      isFull = buffer.length === capacity;
    },
  };

  return api;
};

// ============================================================================
// WebSocket Stream with Reactive Pattern
// ============================================================================

export const createDataStream = (url: string, options = {}) => {
  const config = createStreamConfig({ url, ...options });
  const events = createEventBus<StreamEvent>();
  const messageQueue = createAsyncQueue<unknown>();

  let socket: WebSocket | null = null;
  let reconnectCount = 0;
  let reconnectTimer: any;
  let heartbeatTimer: any;

  const connect = () =>
    new Promise<void>((resolve, reject) => {
      try {
        socket = new WebSocket(config.url, config.protocols);

        socket.onopen = () => {
          reconnectCount = 0;
          events.emit({ type: "connected" });

          if (config.heartbeat) {
            heartbeatTimer = setInterval(() => {
              socket?.send(JSON.stringify(config.heartbeat!.message));
            }, config.heartbeat.interval);
          }

          resolve();
        };

        socket.onmessage = ({ data }) => {
          try {
            const parsed = JSON.parse(data);
            events.emit({ type: "data", payload: parsed });
          } catch (error) {
            events.emit({ type: "error", message: "Parse error", error });
          }
        };

        socket.onerror = (error) => {
          events.emit({ type: "error", message: "Socket error", error });
          reject(error);
        };

        socket.onclose = () => {
          clearInterval(heartbeatTimer);
          events.emit({ type: "disconnected" });

          if (
            config.reconnect.enabled &&
            reconnectCount < config.reconnect.maxAttempts
          ) {
            const delay =
              config.reconnect.backoff === "exponential"
                ? Math.min(
                    config.reconnect.interval * 2 ** reconnectCount,
                    60000
                  )
                : config.reconnect.interval;

            reconnectCount++;
            events.emit({ type: "reconnecting", attempt: reconnectCount });
            reconnectTimer = setTimeout(() => connect().catch(() => {}), delay);
          } else if (reconnectCount >= config.reconnect.maxAttempts) {
            events.emit({ type: "maxReconnectAttemptsReached" });
          }
        };
      } catch (error) {
        reject(error);
      }
    });

  return {
    connect,
    disconnect: () => {
      clearTimeout(reconnectTimer);
      clearInterval(heartbeatTimer);
      socket?.close();
      socket = null;
    },
    send: (data: unknown) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
        return true;
      }
      messageQueue.push(data);
      return false;
    },
    on: events.on,
    once: events.once,
    emit: events.emit,
    get connected() {
      return socket?.readyState === WebSocket.OPEN;
    },
    get pending() {
      return messageQueue.size();
    },
  };
};

// ============================================================================
// Interpolation with Memoization
// ============================================================================

const memoize = <Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
  keyFn?: (...args: Args) => string
) => {
  const cache = new Map<string, Result>();
  const MAX_SIZE = 10000;

  return (...args: Args): Result => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);

    if (cache.has(key)) return cache.get(key)!;

    if (cache.size >= MAX_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

export const interpolators = {
  linear: (x: number, p0: DataPoint, p1: DataPoint) => {
    const t = (x - p0.timestamp) / (p1.timestamp - p0.timestamp);
    return p0.value + t * (p1.value - p0.value);
  },

  cubic: memoize((x: number, points: DataPoint[]) => {
    if (points.length < 2) return points[0]?.value ?? 0;
    if (points.length === 2)
      return interpolators.linear(x, points[0], points[1]);

    const idx =
      points.findIndex(
        (p, i) =>
          i < points.length - 1 &&
          x >= p.timestamp &&
          x <= points[i + 1].timestamp
      ) ?? points.length - 2;

    const p = [
      points[Math.max(0, idx - 1)],
      points[idx],
      points[Math.min(points.length - 1, idx + 1)],
      points[Math.min(points.length - 1, idx + 2)],
    ];

    const t = (x - p[1].timestamp) / (p[2].timestamp - p[1].timestamp);
    const t2 = t * t;
    const t3 = t2 * t;

    return (
      0.5 *
      (2 * p[1].value +
        (-p[0].value + p[2].value) * t +
        (2 * p[0].value - 5 * p[1].value + 4 * p[2].value - p[3].value) * t2 +
        (-p[0].value + 3 * p[1].value - 3 * p[2].value + p[3].value) * t3)
    );
  }),

  spline: memoize((x: number, points: DataPoint[]) => {
    // Natural cubic spline - simplified implementation
    if (points.length < 3) return interpolators.cubic(x, points);

    const n = points.length;
    const h = points.slice(1).map((p, i) => p.timestamp - points[i].timestamp);
    const alpha = Array(n).fill(0);

    for (let i = 1; i < n - 1; i++) {
      alpha[i] =
        (3 / h[i]) * (points[i + 1].value - points[i].value) -
        (3 / h[i - 1]) * (points[i].value - points[i - 1].value);
    }

    const l = Array(n).fill(1);
    const mu = Array(n).fill(0);
    const z = Array(n).fill(0);

    for (let i = 1; i < n - 1; i++) {
      l[i] =
        2 * (points[i + 1].timestamp - points[i - 1].timestamp) -
        h[i - 1] * mu[i - 1];
      mu[i] = h[i] / l[i];
      z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
    }

    const c = Array(n).fill(0);
    const b = Array(n).fill(0);
    const d = Array(n).fill(0);

    for (let j = n - 2; j >= 0; j--) {
      c[j] = z[j] - mu[j] * c[j + 1];
      b[j] =
        (points[j + 1].value - points[j].value) / h[j] -
        (h[j] * (c[j + 1] + 2 * c[j])) / 3;
      d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
    }

    const idx =
      points.findIndex(
        (p, i) =>
          i < points.length - 1 &&
          x >= p.timestamp &&
          x <= points[i + 1].timestamp
      ) ?? points.length - 2;

    const dx = x - points[idx].timestamp;
    return (
      points[idx].value + b[idx] * dx + c[idx] * dx * dx + d[idx] * dx * dx * dx
    );
  }),

  nearest: (x: number, points: DataPoint[]) =>
    points.reduce((closest, point) =>
      Math.abs(x - point.timestamp) < Math.abs(x - closest.timestamp)
        ? point
        : closest
    ).value,
};

// ============================================================================
// Resampling with Functional Composition
// ============================================================================

export const resample = (
  data: DataPoint[],
  rate: number,
  method: InterpolationMethod = "linear"
) => {
  if (data.length < 2) return data;

  const [start, end] = [data[0].timestamp, data.at(-1)!.timestamp];
  const interval = 1000 / rate;
  const samples = Math.floor((end - start) / interval) + 1;

  return Array.from({ length: samples }, (_, i) => {
    const t = timestamp(start + i * interval);
    return {
      timestamp: t,
      value: interpolators[method](t, data as any) ?? 0,
    };
  });
};

export const downsample = (data: DataPoint[], factor: number) =>
  factor <= 1 ? data : data.filter((_, i) => i % Math.floor(factor) === 0);

export const upsample = (data: DataPoint[], factor: number) => {
  if (factor <= 1) return data;

  return data.flatMap((point, i) => {
    if (i === data.length - 1) return [point];

    const next = data[i + 1];
    const step = (next.timestamp - point.timestamp) / factor;

    return [
      point,
      ...Array.from({ length: factor - 1 }, (_, j) => ({
        timestamp: timestamp(point.timestamp + (j + 1) * step),
        value: interpolators.linear(
          timestamp(point.timestamp + (j + 1) * step),
          point,
          next
        ),
      })),
    ];
  });
};

// ============================================================================
// Time Synchronization with Functional Approach
// ============================================================================

export const createTimeSynchronizer = () => {
  const sources = new Map<string, ReturnType<typeof createTimeSeriesBuffer>>();
  const offsets = new Map<string, number>();
  let reference: string | null = null;

  const calculateOffset = (id: string) => {
    const source = sources.get(id);
    const ref = reference && sources.get(reference);

    if (!source || !ref) return 0;

    const sourceStats = source.stats();
    const refStats = ref.stats();

    return (refStats.oldest ?? 0) - (sourceStats.oldest ?? 0);
  };

  return {
    register: (
      id: string,
      buffer: ReturnType<typeof createTimeSeriesBuffer>,
      isRef = false
    ) => {
      sources.set(id, buffer);

      if (isRef || !reference) {
        reference = id;
        offsets.set(id, 0);
      } else {
        offsets.set(id, calculateOffset(id));
      }
    },

    getAligned: (t: Timestamp) => {
      const result = new Map<string, unknown>();

      sources.forEach((buffer, id) => {
        const offset = offsets.get(id) ?? 0;
        const adjusted = timestamp(t - offset);
        const points = buffer.getPoints();

        const closest = points.reduce((prev, curr) =>
          Math.abs(curr.timestamp - adjusted) <
          Math.abs(prev.timestamp - adjusted)
            ? curr
            : prev
        );

        if (Math.abs(closest.timestamp - adjusted) < 1000) {
          result.set(id, closest.value);
        }
      });

      return result;
    },

    getRange: (start: Timestamp, end: Timestamp, interval = 100) =>
      Array.from(
        { length: Math.floor((end - start) / interval) + 1 },
        (_, i) => {
          const t = timestamp(start + i * interval);
          const result = new Map<string, unknown>();

          sources.forEach((buffer, id) => {
            const offset = offsets.get(id) ?? 0;
            const adjusted = timestamp(t - offset);
            const points = buffer.getPoints();

            const closest = points.reduce((prev, curr) =>
              Math.abs(curr.timestamp - adjusted) <
              Math.abs(prev.timestamp - adjusted)
                ? curr
                : prev
            );

            if (Math.abs(closest.timestamp - adjusted) < 1000) {
              result.set(id, closest.value);
            }
          });

          return { timestamp: t, data: result };
        }
      ),

    quality: () =>
      new Map(
        [...sources.keys()].map((id) => [
          id,
          Math.max(0, 1 - Math.abs(offsets.get(id) ?? 0) / 10000),
        ])
      ),
  };
};

// ============================================================================
// Statistics with Functional Approach
// ============================================================================

export const createStats = (maxSamples = 1000) => {
  let values: number[] = [];
  let sum = 0;
  let sumSq = 0;

  const add = (value: number) => {
    if (values.length >= maxSamples) {
      const removed = values.shift()!;
      sum -= removed;
      sumSq -= removed * removed;
    }

    values.push(value);
    sum += value;
    sumSq += value * value;
  };

  const percentile = (p: number) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.floor(((sorted.length - 1) * p) / 100);
    return sorted[idx];
  };

  return {
    add,
    addBatch: (batch: number[]) => batch.forEach(add),

    get: () => {
      if (!values.length) {
        return { mean: 0, median: 0, std: 0, min: 0, max: 0, count: 0 };
      }

      const n = values.length;
      const mean = sum / n;
      const variance = sumSq / n - mean * mean;
      const sorted = [...values].sort((a, b) => a - b);

      return {
        mean,
        median: sorted[Math.floor(n / 2)],
        std: Math.sqrt(Math.max(0, variance)),
        min: sorted[0],
        max: sorted[n - 1],
        count: n,
        p25: percentile(25),
        p75: percentile(75),
        p95: percentile(95),
        p99: percentile(99),
      };
    },

    movingAvg: (window: number) => {
      const w = values.slice(-window);
      return w.reduce((a, b) => a + b, 0) / w.length;
    },

    ema: (alpha = 0.2) =>
      values.reduce(
        (prev, curr) => alpha * curr + (1 - alpha) * prev,
        values[0] ?? 0
      ),

    clear: () => {
      values = [];
      sum = 0;
      sumSq = 0;
    },
  };
};

// ============================================================================
// Composable Pipeline Operators
// ============================================================================

export const operators = {
  map:
    <T, U>(fn: (value: T) => U) =>
    (data: DataPoint<T>[]): DataPoint<U>[] =>
      data.map((p) => ({ ...p, value: fn(p.value) })),

  filter:
    <T>(predicate: (value: T) => boolean) =>
    (data: DataPoint<T>[]): DataPoint<T>[] =>
      data.filter((p) => predicate(p.value)),

  window:
    <T>(size: number, step = 1) =>
    (data: DataPoint<T>[]): DataPoint<T>[][] => {
      const windows: DataPoint<T>[][] = [];
      for (let i = 0; i <= data.length - size; i += step) {
        windows.push(data.slice(i, i + size));
      }
      return windows;
    },

  smooth:
    (windowSize = 3) =>
    (data: DataPoint<number>[]): DataPoint<number>[] =>
      data.map((point, i) => {
        const start = Math.max(0, i - Math.floor(windowSize / 2));
        const end = Math.min(data.length, start + windowSize);
        const window = data.slice(start, end);
        const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length;
        return { ...point, value: avg };
      }),

  diff:
    () =>
    (data: DataPoint<number>[]): DataPoint<number>[] =>
      data.slice(1).map((point, i) => ({
        ...point,
        value: point.value - data[i].value,
      })),

  cumsum:
    () =>
    (data: DataPoint<number>[]): DataPoint<number>[] => {
      let sum = 0;
      return data.map((point) => ({
        ...point,
        value: (sum += point.value),
      }));
    },
};

// ============================================================================
// High-level API with Builder Pattern
// ============================================================================

export const pipeline = <T = number>() => {
  const transforms: Array<(data: DataPoint<T>[]) => DataPoint<any>[]> = [];

  return {
    add: (transform: (data: DataPoint<T>[]) => DataPoint<any>[]) => {
      transforms.push(transform);
      return pipeline();
    },

    map: (fn: (value: T) => any) => {
      transforms.push(operators.map(fn));
      return pipeline();
    },

    filter: (predicate: (value: T) => boolean) => {
      transforms.push(operators.filter(predicate));
      return pipeline();
    },

    smooth: (windowSize?: number) => {
      transforms.push(operators.smooth(windowSize) as any);
      return pipeline();
    },

    execute: (data: DataPoint<T>[]) =>
      transforms.reduce((acc, transform) => transform(acc), data),
  };
};

// ============================================================================
// Export convenience functions
// ============================================================================

export const createBuffer = createTimeSeriesBuffer;
export const createStream = createDataStream;
export const createSynchronizer = createTimeSynchronizer;
