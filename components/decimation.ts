/**
 * Data decimation algorithms for high-performance visualization
 *
 * Implements Largest-Triangle-Three-Buckets (LTTB) algorithm for intelligent
 * downsampling that preserves visual shape.
 *
 * @reference Sveinn Steinarsson. 2013. Downsampling Time Series for Visual Representation.
 *            MSc thesis. University of Iceland.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Largest-Triangle-Three-Buckets (LTTB) downsampling algorithm
 *
 * Reduces data while preserving visual shape by maximizing the area of triangles
 * formed by consecutive points. Superior to uniform sampling for time-series data.
 *
 * @param data - Original data points
 * @param threshold - Target number of points (must be >= 2)
 * @returns Downsampled data points
 *
 * @example
 * ```ts
 * const original = Array.from({ length: 10000 }, (_, i) => ({
 *   x: i,
 *   y: Math.sin(i / 100) + Math.random() * 0.1
 * }));
 * const decimated = lttb(original, 500); // Reduce to 500 points
 * ```
 */
export function lttb(data: Point[], threshold: number): Point[] {
  const dataLength = data.length;

  if (threshold >= dataLength || threshold <= 2) {
    return data; // Nothing to do
  }

  const sampled: Point[] = [];

  // Always keep first point
  sampled.push(data[0]);

  // Bucket size (except first and last buckets)
  const bucketSize = (dataLength - 2) / (threshold - 2);

  let a = 0; // Initially a is the first point in the triangle

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for next bucket (for the triangle)
    let avgX = 0;
    let avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    let avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
      avgX += data[avgRangeStart].x;
      avgY += data[avgRangeStart].y;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // Get the range for this bucket
    let rangeOffs = Math.floor(i * bucketSize) + 1;
    const rangeTo = Math.floor((i + 1) * bucketSize) + 1;

    // Point a (already selected)
    const pointAX = data[a].x;
    const pointAY = data[a].y;

    let maxArea = -1;
    let nextA = rangeOffs;

    for (; rangeOffs < rangeTo; rangeOffs++) {
      // Calculate triangle area over three buckets
      const area = Math.abs(
        (pointAX - avgX) * (data[rangeOffs].y - pointAY) -
        (pointAX - data[rangeOffs].x) * (avgY - pointAY)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        nextA = rangeOffs;
      }
    }

    sampled.push(data[nextA]);
    a = nextA; // This a is the next a
  }

  // Always keep last point
  sampled.push(data[dataLength - 1]);

  return sampled;
}

/**
 * Min-max decimation
 *
 * For each bucket, keep the min and max points. Good for preserving peaks
 * and troughs, especially useful for oscilloscope-like displays.
 *
 * @param data - Original data points
 * @param threshold - Target number of points
 * @returns Decimated data with min/max preserved
 */
export function minMaxDecimation(data: Point[], threshold: number): Point[] {
  const dataLength = data.length;

  if (threshold >= dataLength || threshold <= 2) {
    return data;
  }

  const sampled: Point[] = [];
  const bucketSize = dataLength / threshold;

  for (let i = 0; i < threshold; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.min(Math.floor((i + 1) * bucketSize), dataLength);

    let min = data[start];
    let max = data[start];

    for (let j = start + 1; j < end; j++) {
      if (data[j].y < min.y) min = data[j];
      if (data[j].y > max.y) max = data[j];
    }

    // Add both min and max to preserve envelope
    if (min.x < max.x) {
      sampled.push(min);
      if (min !== max) sampled.push(max);
    } else {
      sampled.push(max);
      if (min !== max) sampled.push(min);
    }
  }

  return sampled;
}

/**
 * Automatically choose decimation strategy based on data characteristics
 *
 * @param data - Original data points
 * @param threshold - Target number of points
 * @param strategy - Decimation strategy or "auto"
 * @returns Decimated data
 */
export function decimate(
  data: Point[],
  threshold: number,
  strategy: 'lttb' | 'minmax' | 'auto' = 'auto'
): Point[] {
  if (data.length <= threshold) {
    return data;
  }

  if (strategy === 'auto') {
    // Use LTTB for most cases, it's excellent at preserving shape
    // Could add heuristics here to detect high-frequency signals
    strategy = 'lttb';
  }

  switch (strategy) {
    case 'lttb':
      return lttb(data, threshold);
    case 'minmax':
      return minMaxDecimation(data, threshold);
    default:
      return data;
  }
}

/**
 * Calculate statistics for data quality assessment
 */
export function calculateDecimationStats(
  original: Point[],
  decimated: Point[]
): {
  originalCount: number;
  decimatedCount: number;
  reductionRatio: number;
  compressionPercent: number;
} {
  return {
    originalCount: original.length,
    decimatedCount: decimated.length,
    reductionRatio: original.length / decimated.length,
    compressionPercent: ((1 - decimated.length / original.length) * 100),
  };
}
