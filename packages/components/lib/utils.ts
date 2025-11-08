/**
 * Shared utility functions for Plexus UI components
 *
 * All components should import utilities from this file
 * to avoid duplication and ensure consistency.
 */

import type { RGB, RGBA, Domain2D, Margin } from "./types";

// ============================================================================
// Class Name Utilities
// ============================================================================

/**
 * Conditionally join class names
 * Filters out falsy values and joins with spaces
 *
 * @example
 * cn("base", isActive && "active", "extra") // => "base active extra"
 */
export function cn(
  ...classes: (string | undefined | null | false | 0)[]
): string {
  return classes.filter(Boolean).join(" ");
}

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if a number is valid (not NaN or Infinity)
 */
export function isValidNumber(value: number): boolean {
  return typeof value === "number" && isFinite(value);
}

/**
 * Sanitize a number, replacing invalid values with fallback
 */
export function sanitizeNumber(value: number, fallback: number = 0): number {
  return isValidNumber(value) ? value : fallback;
}

/**
 * Linear interpolation between two numbers
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Validate RGB color (all channels in [0, 1])
 */
export function isValidRGB(color: RGB): boolean {
  return (
    color.length === 3 &&
    color.every((c) => isValidNumber(c) && c >= 0 && c <= 1)
  );
}

/**
 * Validate RGBA color (all channels in [0, 1])
 */
export function isValidRGBA(color: RGBA): boolean {
  return (
    color.length === 4 &&
    color.every((c) => isValidNumber(c) && c >= 0 && c <= 1)
  );
}

/**
 * Sanitize RGB color, clamping to [0, 1]
 */
export function sanitizeRGB(color: RGB): RGB {
  return [
    clamp(sanitizeNumber(color[0], 0), 0, 1),
    clamp(sanitizeNumber(color[1], 0), 0, 1),
    clamp(sanitizeNumber(color[2], 0), 0, 1),
  ] as const;
}

/**
 * Sanitize RGBA color, clamping to [0, 1]
 */
export function sanitizeRGBA(color: RGBA): RGBA {
  return [
    clamp(sanitizeNumber(color[0], 0), 0, 1),
    clamp(sanitizeNumber(color[1], 0), 0, 1),
    clamp(sanitizeNumber(color[2], 0), 0, 1),
    clamp(sanitizeNumber(color[3], 1), 0, 1),
  ] as const;
}

/**
 * Convert RGB [0, 1] to CSS rgb() string
 */
export function rgbToCSS(color: RGB): string {
  return `rgb(${Math.round(color[0] * 255)}, ${Math.round(
    color[1] * 255
  )}, ${Math.round(color[2] * 255)})`;
}

/**
 * Convert RGBA [0, 1] to CSS rgba() string
 */
export function rgbaToCSS(color: RGBA): string {
  return `rgba(${Math.round(color[0] * 255)}, ${Math.round(
    color[1] * 255
  )}, ${Math.round(color[2] * 255)}, ${color[3]})`;
}

/**
 * Convert hex color to RGB [0, 1]
 */
export function hexToRGB(hex: string): RGB {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  return [r, g, b] as const;
}

// ============================================================================
// Domain Utilities
// ============================================================================

/**
 * Get nice domain bounds (round to nice numbers)
 */
export function getNiceDomain(min: number, max: number): Domain2D {
  const range = max - min;
  const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
  const niceFactor = magnitude > 0 ? range / magnitude : 1;

  let niceMin: number, niceMax: number;

  if (niceFactor <= 1) {
    niceMin = Math.floor(min / magnitude) * magnitude;
    niceMax = Math.ceil(max / magnitude) * magnitude;
  } else if (niceFactor <= 2) {
    niceMin = Math.floor(min / (magnitude * 2)) * magnitude * 2;
    niceMax = Math.ceil(max / (magnitude * 2)) * magnitude * 2;
  } else if (niceFactor <= 5) {
    niceMin = Math.floor(min / (magnitude * 5)) * magnitude * 5;
    niceMax = Math.ceil(max / (magnitude * 5)) * magnitude * 5;
  } else {
    niceMin = Math.floor(min / (magnitude * 10)) * magnitude * 10;
    niceMax = Math.ceil(max / (magnitude * 10)) * magnitude * 10;
  }

  return [niceMin, niceMax] as const;
}

/**
 * Options for domain calculation
 */
export interface DomainOptions {
  /** Padding as a fraction of the range (default: 0.05 = 5%) */
  padding?: number;
  /** Minimum padding value (useful for small ranges) */
  minPadding?: number;
  /** Apply nice rounding to domain bounds */
  nice?: boolean;
}

/**
 * Calculate data domain from array of values with optional padding
 *
 * @param values - Array of numbers to calculate domain from
 * @param options - Optional configuration for padding and nice bounds
 * @returns Domain as [min, max] tuple
 *
 * @example
 * ```typescript
 * // Simple domain with 5% padding (default)
 * const domain = calculateDomain([1, 2, 3, 4, 5]); // [0.8, 5.2]
 *
 * // With custom padding
 * const domain = calculateDomain([1, 2, 3, 4, 5], { padding: 0.1 }); // [0.6, 5.4]
 *
 * // With minimum padding (useful for small ranges)
 * const domain = calculateDomain([1, 1.1], { minPadding: 0.5 }); // [0.5, 1.6]
 *
 * // With nice rounding
 * const domain = calculateDomain([1.3, 4.7], { nice: true }); // [1, 5]
 * ```
 */
export function calculateDomain(
  values: readonly number[],
  options?: DomainOptions
): Domain2D {
  if (values.length === 0) return [0, 1];

  const validValues = values.filter(isValidNumber);
  if (validValues.length === 0) return [0, 1];

  const min = Math.min(...validValues);
  const max = Math.max(...validValues);

  // Calculate padding
  const range = max - min;
  const paddingFraction = options?.padding ?? 0.05;
  const padding = Math.max(range * paddingFraction, options?.minPadding ?? 0);

  const paddedMin = min - padding;
  const paddedMax = max + padding;

  // Apply nice rounding if requested
  if (options?.nice) {
    return getNiceDomain(paddedMin, paddedMax);
  }

  return [paddedMin, paddedMax] as const;
}

/**
 * Calculate domain from array of 2D points
 *
 * @param points - Array of [x, y] points
 * @param xDomain - Optional override for x domain
 * @param yDomain - Optional override for y domain
 * @param options - Optional configuration for padding
 * @returns Object with x and y domains
 *
 * @example
 * ```typescript
 * const points = [[1, 2], [3, 4], [5, 6]];
 * const { x, y } = calculate2DDomain(points);
 * // x: [1, 5], y: [2, 6]
 * ```
 */
export function calculate2DDomain(
  points: ReadonlyArray<readonly [number, number]>,
  xDomain?: readonly [number, number],
  yDomain?: readonly [number, number],
  options?: DomainOptions
): { x: Domain2D; y: Domain2D } {
  return {
    x: xDomain || calculateDomain(points.map(p => p[0]), options),
    y: yDomain || calculateDomain(points.map(p => p[1]), options),
  };
}

/**
 * Calculate domain across multiple data series
 * Useful for multi-trace charts where you need a global domain
 *
 * @param dataSets - Array of data arrays
 * @param axis - Which axis to calculate domain for (0 = x, 1 = y)
 * @param options - Optional configuration for padding
 * @returns Domain for the specified axis
 *
 * @example
 * ```typescript
 * const traces = [
 *   [[1, 2], [3, 4]],
 *   [[5, 6], [7, 8]]
 * ];
 * const yDomain = calculateMultiSeriesDomain(traces, 1);
 * // [2, 8] (with padding)
 * ```
 */
export function calculateMultiSeriesDomain(
  dataSets: ReadonlyArray<ReadonlyArray<readonly [number, number]>>,
  axis: 0 | 1,
  options?: DomainOptions
): Domain2D {
  if (dataSets.length === 0) return [0, 1];

  const allValues: number[] = [];
  for (const dataSet of dataSets) {
    for (const point of dataSet) {
      allValues.push(point[axis]);
    }
  }

  return calculateDomain(allValues, options);
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Format date in timezone
 * Simple implementation - for complex formatting use date-fns
 */
export function formatInTimeZone(
  date: Date,
  timezone: string,
  use12Hour: boolean = false
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: use12Hour,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Normalize date input (Date or timestamp) to Date object
 */
export function normalizeDate(date: Date | number): Date {
  return typeof date === "number" ? new Date(date) : date;
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Chunk array into smaller arrays of size n
 */
export function chunk<T>(array: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size) as T[]);
  }
  return chunks;
}

/**
 * Create array of numbers from start to end (inclusive)
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

// ============================================================================
// Object Utilities
// ============================================================================

/**
 * Deep merge two objects
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (
      typeof targetValue === "object" &&
      targetValue !== null &&
      typeof sourceValue === "object" &&
      sourceValue !== null
    ) {
      result[key] = deepMerge(
        targetValue as object,
        sourceValue as object
      ) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default margin for charts
 */
export const DEFAULT_MARGIN: Margin = {
  top: 40,
  right: 40,
  bottom: 60,
  left: 70,
} as const;

/**
 * Default background color (dark)
 */
export const DEFAULT_BACKGROUND_COLOR: RGBA = [0.05, 0.05, 0.08, 1.0] as const;

/**
 * Default colors for data series
 */
export const DEFAULT_COLORS: readonly RGB[] = [
  [0.2, 0.8, 0.3], // Green
  [0.3, 0.6, 0.9], // Blue
  [0.9, 0.4, 0.4], // Red
  [0.8, 0.6, 0.2], // Orange
  [0.6, 0.4, 0.8], // Purple
  [0.4, 0.8, 0.8], // Cyan
  [0.9, 0.7, 0.3], // Yellow
  [0.8, 0.4, 0.6], // Pink
] as const;

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
