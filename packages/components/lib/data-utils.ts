/**
 * Data transformation utilities for WebGPU charts
 *
 * Provides efficient data transformation, buffering, and streaming utilities
 * for high-performance visualization in aerospace/medical/defense applications.
 */

/// <reference types="@webgpu/types" />

// Types
export interface DataPoint {
  x: number;
  y: number;
}

// Alias for compatibility
export type Point = DataPoint;

export interface DataPoint3D {
  x: number;
  y: number;
  z: number;
}

// ============================================================================
// Data Transformation
// ============================================================================

/**
 * Normalize data to [0, 1] range
 */
export function normalizeData(
  data: DataPoint[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): DataPoint[] {
  return data.map((point) => ({
    x: (point.x - xMin) / (xMax - xMin),
    y: (point.y - yMin) / (yMax - yMin),
  }));
}

/**
 * Convert data points to Float32Array for WebGPU
 */
export function dataToVertexArray(data: DataPoint[]): Float32Array {
  const array = new Float32Array(data.length * 2);
  for (let i = 0; i < data.length; i++) {
    array[i * 2] = data[i].x;
    array[i * 2 + 1] = data[i].y;
  }
  return array;
}

/**
 * Convert 3D data points to Float32Array
 */
export function data3DToVertexArray(data: DataPoint3D[]): Float32Array {
  const array = new Float32Array(data.length * 3);
  for (let i = 0; i < data.length; i++) {
    array[i * 3] = data[i].x;
    array[i * 3 + 1] = data[i].y;
    array[i * 3 + 2] = data[i].z;
  }
  return array;
}

/**
 * Downsample data using LTTB (Largest Triangle Three Buckets) algorithm
 * Optimized for time series data visualization
 */
export function downsampleLTTB(
  data: DataPoint[],
  targetPoints: number
): DataPoint[] {
  if (data.length <= targetPoints) return data;
  if (targetPoints < 3) return [data[0], data[data.length - 1]];

  const result: DataPoint[] = [];
  const bucketSize = (data.length - 2) / (targetPoints - 2);

  // Always include first point
  result.push(data[0]);

  for (let i = 0; i < targetPoints - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.min(
      Math.floor((i + 2) * bucketSize) + 1,
      data.length
    );
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    // Calculate average point in next bucket
    let avgX = 0;
    let avgY = 0;

    if (avgRangeLength > 0) {
      for (let j = avgRangeStart; j < avgRangeEnd; j++) {
        avgX += data[j].x;
        avgY += data[j].y;
      }
      avgX /= avgRangeLength;
      avgY /= avgRangeLength;
    } else {
      // Fallback to last point if bucket is empty
      avgX = data[data.length - 1].x;
      avgY = data[data.length - 1].y;
    }

    // Find point in current bucket with largest triangle area
    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.min(
      Math.floor((i + 1) * bucketSize) + 1,
      data.length
    );

    const pointAX = result[result.length - 1].x;
    const pointAY = result[result.length - 1].y;

    let maxArea = -1;
    let maxAreaPoint: DataPoint = data[Math.min(rangeStart, data.length - 1)];

    for (let j = rangeStart; j < rangeEnd && j < data.length; j++) {
      const area = Math.abs(
        (pointAX - avgX) * (data[j].y - pointAY) -
          (pointAX - data[j].x) * (avgY - pointAY)
      );

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j];
      }
    }

    result.push(maxAreaPoint);
  }

  // Always include last point
  result.push(data[data.length - 1]);

  return result;
}

/**
 * Simple min/max downsampling - faster but less accurate than LTTB
 */
export function downsampleMinMax(
  data: DataPoint[],
  targetPoints: number
): DataPoint[] {
  if (data.length <= targetPoints) return data;

  const result: DataPoint[] = [];
  const bucketSize = data.length / targetPoints;

  for (let i = 0; i < targetPoints; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);

    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let minPoint: DataPoint = data[start];
    let maxPoint: DataPoint = data[start];

    for (let j = start; j < end && j < data.length; j++) {
      if (data[j].y < minY) {
        minY = data[j].y;
        minPoint = data[j];
      }
      if (data[j].y > maxY) {
        maxY = data[j].y;
        maxPoint = data[j];
      }
    }

    // Add both min and max to preserve peaks/valleys
    if (minPoint.x < maxPoint.x) {
      result.push(minPoint, maxPoint);
    } else {
      result.push(maxPoint, minPoint);
    }
  }

  return result;
}

// ============================================================================
// Buffer Management
// ============================================================================

/**
 * Create or resize a vertex buffer efficiently
 */
export function createOrResizeVertexBuffer(
  device: GPUDevice,
  data: Float32Array,
  oldBuffer?: GPUBuffer
): GPUBuffer {
  const requiredSize = data.byteLength;

  // If buffer exists and is large enough, reuse it
  if (oldBuffer && oldBuffer.size >= requiredSize) {
    device.queue.writeBuffer(oldBuffer, 0, data.buffer);
    return oldBuffer;
  }

  // Destroy old buffer if it exists
  oldBuffer?.destroy();

  // Create new buffer with some headroom (1.5x) to reduce reallocations
  const bufferSize = Math.ceil(requiredSize * 1.5);
  const buffer = device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(buffer, 0, data.buffer);
  return buffer;
}

// ============================================================================
// Data Analysis
// ============================================================================

/**
 * Calculate data bounds
 */
export function calculateBounds(data: DataPoint[]): {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
} {
  if (data.length === 0) {
    return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
  }

  let xMin = data[0].x;
  let xMax = data[0].x;
  let yMin = data[0].y;
  let yMax = data[0].y;

  for (const point of data) {
    if (point.x < xMin) xMin = point.x;
    if (point.x > xMax) xMax = point.x;
    if (point.y < yMin) yMin = point.y;
    if (point.y > yMax) yMax = point.y;
  }

  // Add 5% padding
  const xPadding = (xMax - xMin) * 0.05;
  const yPadding = (yMax - yMin) * 0.05;

  return {
    xMin: xMin - xPadding,
    xMax: xMax + xPadding,
    yMin: yMin - yPadding,
    yMax: yMax + yPadding,
  };
}

/**
 * Calculate auto bounds with nice numbers for axis ticks
 */
export function calculateNiceBounds(
  data: DataPoint[],
  tickCount = 5
): {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
} {
  const bounds = calculateBounds(data);

  // Helper to find "nice" numbers (1, 2, 5, 10, 20, 50, etc.)
  const niceNum = (range: number, round: boolean): number => {
    const exponent = Math.floor(Math.log10(range));
    const fraction = range / Math.pow(10, exponent);
    let niceFraction: number;

    if (round) {
      if (fraction < 1.5) niceFraction = 1;
      else if (fraction < 3) niceFraction = 2;
      else if (fraction < 7) niceFraction = 5;
      else niceFraction = 10;
    } else {
      if (fraction <= 1) niceFraction = 1;
      else if (fraction <= 2) niceFraction = 2;
      else if (fraction <= 5) niceFraction = 5;
      else niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
  };

  const xRange = niceNum(bounds.xMax - bounds.xMin, false);
  const yRange = niceNum(bounds.yMax - bounds.yMin, false);

  const xTickSpacing = niceNum(xRange / (tickCount - 1), true);
  const yTickSpacing = niceNum(yRange / (tickCount - 1), true);

  return {
    xMin: Math.floor(bounds.xMin / xTickSpacing) * xTickSpacing,
    xMax: Math.ceil(bounds.xMax / xTickSpacing) * xTickSpacing,
    yMin: Math.floor(bounds.yMin / yTickSpacing) * yTickSpacing,
    yMax: Math.ceil(bounds.yMax / yTickSpacing) * yTickSpacing,
  };
}

// ============================================================================
// Data Generation (for testing/examples)
// ============================================================================

/**
 * Generate sine wave data
 */
export function generateSineWave(
  points: number,
  amplitude = 1,
  frequency = 1,
  phase = 0
): DataPoint[] {
  const data: DataPoint[] = [];
  for (let i = 0; i < points; i++) {
    const x = (i / points) * Math.PI * 2 * frequency;
    const y = amplitude * Math.sin(x + phase);
    data.push({ x: i, y });
  }
  return data;
}

/**
 * Generate random telemetry-like data
 */
export function generateTelemetryData(
  points: number,
  baseline = 0,
  variance = 1,
  drift = 0
): DataPoint[] {
  const data: DataPoint[] = [];
  let value = baseline;

  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.5) * variance + drift;
    data.push({ x: i, y: value });
  }

  return data;
}

/**
 * Generate categorical data (for bar charts)
 */
export function generateCategoricalData(
  categories: string[],
  minValue = 0,
  maxValue = 100
): Array<{ category: string; value: number }> {
  return categories.map((category) => ({
    category,
    value: Math.random() * (maxValue - minValue) + minValue,
  }));
}

// ============================================================================
// Chart Utilities (for axes and scales)
// ============================================================================

/**
 * Get domain (min, max) from data points
 */
export function getDomain(
  points: Point[],
  accessor: (p: Point) => number,
  addPadding = false
): [number, number] {
  if (points.length === 0) {
    return [0, 1];
  }

  let min = accessor(points[0]);
  let max = accessor(points[0]);

  for (const point of points) {
    const value = accessor(point);
    if (value < min) min = value;
    if (value > max) max = value;
  }

  if (addPadding) {
    const padding = (max - min) * 0.1 || 0.1;
    min -= padding;
    max += padding;
  }

  return [min, max];
}

/**
 * Create a linear scale function
 */
export function createScale(
  domain: [number, number],
  range: [number, number]
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const scale = (r1 - r0) / (d1 - d0);

  return (value: number) => {
    return r0 + (value - d0) * scale;
  };
}

/**
 * Format a numeric value for display
 */
export function formatValue(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(2)}k`;
  }
  if (Math.abs(value) < 0.01 && value !== 0) {
    return value.toExponential(2);
  }
  return value.toFixed(2);
}

/**
 * Format a timestamp value for display
 */
export function formatTime(value: number, timezone = "UTC"): string {
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Generate nice tick values for an axis
 */
export function getTicks(domain: [number, number], count: number): number[] {
  const [min, max] = domain;
  const range = max - min;
  const roughStep = range / (count - 1);

  // Find a nice step value
  const exponent = Math.floor(Math.log10(roughStep));
  const fraction = roughStep / Math.pow(10, exponent);

  let niceStep: number;
  if (fraction <= 1) niceStep = 1;
  else if (fraction <= 2) niceStep = 2;
  else if (fraction <= 5) niceStep = 5;
  else niceStep = 10;

  niceStep *= Math.pow(10, exponent);

  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let i = niceMin; i <= niceMax; i += niceStep) {
    ticks.push(i);
  }

  return ticks;
}
