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
// Histogram Utilities
// ============================================================================

export interface HistogramBin {
  min: number;
  max: number;
  count: number;
  density: number; // count / bin width
  center: number;
}

/**
 * Bin calculation methods
 */
export type BinMethod =
  | "sturges" // Good for normal distributions
  | "scott" // Good for continuous data
  | "freedman-diaconis" // Good for non-normal distributions
  | "sqrt" // Square root rule (simple, general purpose)
  | number; // Manual bin count

/**
 * Calculate optimal number of bins using various methods
 */
export function calculateBinCount(
  data: number[],
  method: BinMethod = "sturges"
): number {
  const n = data.length;
  if (n === 0) return 1;

  if (typeof method === "number") {
    return Math.max(1, Math.floor(method));
  }

  switch (method) {
    case "sturges":
      // k = ceil(log2(n) + 1)
      return Math.ceil(Math.log2(n) + 1);

    case "scott": {
      // Bin width = 3.5 * σ * n^(-1/3)
      const stdDev = calculateStdDev(data);
      const binWidth = 3.5 * stdDev * Math.pow(n, -1 / 3);
      const [min, max] = [Math.min(...data), Math.max(...data)];
      const range = max - min;
      return Math.max(1, Math.ceil(range / binWidth));
    }

    case "freedman-diaconis": {
      // Bin width = 2 * IQR * n^(-1/3)
      const iqr = calculateIQR(data);
      const binWidth = 2 * iqr * Math.pow(n, -1 / 3);
      const [min, max] = [Math.min(...data), Math.max(...data)];
      const range = max - min;
      return Math.max(1, Math.ceil(range / binWidth));
    }

    case "sqrt":
      // k = ceil(sqrt(n))
      return Math.ceil(Math.sqrt(n));

    default:
      return Math.ceil(Math.log2(n) + 1); // fallback to Sturges
  }
}

/**
 * Create histogram bins from data
 */
export function createHistogramBins(
  data: number[],
  binCount?: number,
  method: BinMethod = "sturges"
): HistogramBin[] {
  if (data.length === 0) {
    return [];
  }

  const n = binCount ?? calculateBinCount(data, method);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const binWidth = range / n;

  // Initialize bins
  const bins: HistogramBin[] = [];
  for (let i = 0; i < n; i++) {
    const binMin = min + i * binWidth;
    const binMax = i === n - 1 ? max : binMin + binWidth; // Last bin includes max
    bins.push({
      min: binMin,
      max: binMax,
      count: 0,
      density: 0,
      center: (binMin + binMax) / 2,
    });
  }

  // Count data points in each bin
  for (const value of data) {
    // Find which bin this value belongs to
    const binIndex = Math.min(Math.floor((value - min) / binWidth), n - 1);
    bins[binIndex].count++;
  }

  // Calculate density (count per unit width)
  const totalCount = data.length;
  for (const bin of bins) {
    bin.density = bin.count / binWidth / totalCount;
  }

  return bins;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(data: number[]): number {
  if (data.length === 0) return 0;
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance =
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

/**
 * Calculate interquartile range (IQR)
 */
function calculateIQR(data: number[]): number {
  if (data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  return q3 - q1;
}

/**
 * Calculate normal distribution curve for overlay
 */
export function calculateNormalCurve(
  data: number[],
  points = 100
): DataPoint[] {
  if (data.length === 0) return [];

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const stdDev = calculateStdDev(data);

  if (stdDev === 0) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  const curve: DataPoint[] = [];
  for (let i = 0; i < points; i++) {
    const x = min + (i / (points - 1)) * range;
    const z = (x - mean) / stdDev;
    const y =
      (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * z * z) *
      data.length;
    curve.push({ x, y });
  }

  return curve;
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

// ============================================================================
// FFT Utilities (for Waterfall/Spectrogram Charts)
// ============================================================================

/**
 * Complex number representation
 */
export interface Complex {
  re: number;
  im: number;
}

/**
 * Add two complex numbers
 */
function complexAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

/**
 * Subtract two complex numbers
 */
function complexSubtract(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

/**
 * Multiply two complex numbers
 */
function complexMultiply(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

/**
 * Calculate magnitude of complex number
 */
function complexMagnitude(c: Complex): number {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

/**
 * Fast Fourier Transform (Cooley-Tukey algorithm)
 * Input size must be a power of 2
 */
export function fft(input: number[]): Complex[] {
  const n = input.length;

  // Base case
  if (n === 1) {
    return [{ re: input[0], im: 0 }];
  }

  // Ensure n is power of 2
  if (n & (n - 1)) {
    throw new Error("FFT input size must be a power of 2");
  }

  // Divide into even and odd
  const even: number[] = [];
  const odd: number[] = [];
  for (let i = 0; i < n; i += 2) {
    even.push(input[i]);
    odd.push(input[i + 1]);
  }

  // Recursive FFT
  const evenFFT = fft(even);
  const oddFFT = fft(odd);

  // Combine results
  const result: Complex[] = new Array(n);
  for (let k = 0; k < n / 2; k++) {
    const angle = (-2 * Math.PI * k) / n;
    const twiddle: Complex = {
      re: Math.cos(angle),
      im: Math.sin(angle),
    };

    const t = complexMultiply(twiddle, oddFFT[k]);
    result[k] = complexAdd(evenFFT[k], t);
    result[k + n / 2] = complexSubtract(evenFFT[k], t);
  }

  return result;
}

/**
 * Apply window function to reduce spectral leakage
 */
export type WindowFunction = "hann" | "hamming" | "blackman" | "none";

export function applyWindow(data: number[], windowType: WindowFunction = "hann"): number[] {
  const n = data.length;
  const windowed = new Array(n);

  for (let i = 0; i < n; i++) {
    let w = 1;

    switch (windowType) {
      case "hann":
        w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
        break;
      case "hamming":
        w = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (n - 1));
        break;
      case "blackman":
        w = 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)) +
            0.08 * Math.cos((4 * Math.PI * i) / (n - 1));
        break;
      case "none":
        w = 1;
        break;
    }

    windowed[i] = data[i] * w;
  }

  return windowed;
}

/**
 * Convert FFT output to power spectrum (magnitude squared)
 */
export function fftToPowerSpectrum(fftOutput: Complex[]): number[] {
  const n = fftOutput.length;
  const spectrum = new Array(Math.floor(n / 2)); // Only positive frequencies

  for (let i = 0; i < spectrum.length; i++) {
    const mag = complexMagnitude(fftOutput[i]);
    spectrum[i] = mag * mag; // Power = magnitude squared
  }

  return spectrum;
}

/**
 * Convert power to decibels
 */
export function powerToDb(power: number, referenceLevel = 1): number {
  // Add small epsilon to avoid log(0)
  return 10 * Math.log10(Math.max(power, 1e-10) / referenceLevel);
}

/**
 * Spectrogram data point (time, frequency, magnitude)
 */
export interface SpectrogramPoint {
  time: number;      // Time index
  frequency: number; // Frequency bin
  magnitude: number; // Power in dB or linear
}

/**
 * Generate spectrogram data from time-series signal
 *
 * @param signal - Input time-series data
 * @param fftSize - FFT window size (must be power of 2)
 * @param hopSize - Number of samples to advance between windows
 * @param sampleRate - Sampling rate in Hz
 * @param windowType - Window function to apply
 * @param useDb - Convert to decibels (true) or keep linear (false)
 */
export function generateSpectrogram(
  signal: number[],
  fftSize = 256,
  hopSize = 128,
  sampleRate = 1000,
  windowType: WindowFunction = "hann",
  useDb = true
): SpectrogramPoint[] {
  const spectrogramData: SpectrogramPoint[] = [];
  const numFreqBins = fftSize / 2;

  // Process signal in overlapping windows
  for (let timeIndex = 0; timeIndex + fftSize <= signal.length; timeIndex += hopSize) {
    // Extract window
    const window = signal.slice(timeIndex, timeIndex + fftSize);

    // Apply window function
    const windowed = applyWindow(window, windowType);

    // Compute FFT
    const fftOutput = fft(windowed);

    // Convert to power spectrum
    const powerSpectrum = fftToPowerSpectrum(fftOutput);

    // Add data points for each frequency bin
    for (let freqBin = 0; freqBin < numFreqBins; freqBin++) {
      const frequency = (freqBin * sampleRate) / fftSize;
      const magnitude = useDb
        ? powerToDb(powerSpectrum[freqBin])
        : powerSpectrum[freqBin];

      spectrogramData.push({
        time: timeIndex,
        frequency,
        magnitude,
      });
    }
  }

  return spectrogramData;
}

/**
 * Find next power of 2 greater than or equal to n
 */
export function nextPowerOf2(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Zero-pad array to next power of 2
 */
export function zeroPad(data: number[]): number[] {
  const nextPow2 = nextPowerOf2(data.length);
  if (data.length === nextPow2) return data;

  const padded = new Array(nextPow2).fill(0);
  for (let i = 0; i < data.length; i++) {
    padded[i] = data[i];
  }
  return padded;
}
