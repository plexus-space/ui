/**
 * Shared TypeScript types for Plexus UI components
 *
 * This file contains all shared type definitions to ensure consistency
 * across components and enable better composition.
 */

import type * as React from "react";

// ============================================================================
// Colors
// ============================================================================

/**
 * RGB color as array of [red, green, blue]
 * Each channel is in range [0, 1]
 */
export type RGB = readonly [number, number, number];

/**
 * RGBA color as array of [red, green, blue, alpha]
 * Each channel is in range [0, 1]
 */
export type RGBA = readonly [number, number, number, number];

/**
 * Hex color string
 * @example "#06b6d4"
 */
export type HexColor = `#${string}`;

/**
 * CSS color string (hex, rgb, rgba, named colors)
 * @example "#06b6d4" | "rgb(6, 182, 212)" | "cyan"
 */
export type CSSColor = string;

// ============================================================================
// Domains & Ranges
// ============================================================================

/**
 * 1D domain/range as [min, max]
 */
export type Domain1D = readonly [number, number];

/**
 * 2D domain as [min, max] with semantic naming
 */
export type Domain2D = readonly [min: number, max: number];

/**
 * Time range as [start, end] timestamps
 */
export type TimeRange = readonly [start: Date, end: Date];

// ============================================================================
// Layout
// ============================================================================

/**
 * Standard margin object for charts and visualizations
 */
export type Margin = {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
};

/**
 * Padding object
 */
export type Padding = {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
};

/**
 * Position as [x, y] coordinates
 */
export type Position2D = readonly [x: number, y: number];

/**
 * Position as [x, y, z] coordinates
 */
export type Position3D = readonly [x: number, y: number, z: number];

/**
 * Size as [width, height]
 */
export type Size2D = readonly [width: number, height: number];

// ============================================================================
// Common Component Props
// ============================================================================

/**
 * Base props that all components should extend
 */
export interface BaseComponentProps {
  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: React.CSSProperties;
}

/**
 * Props for components that forward refs to HTML div elements
 */
export interface DivComponentProps extends BaseComponentProps {
  /**
   * Ref forwarded to the root div element
   */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Props for components that forward refs to SVG elements
 */
export interface SVGComponentProps extends BaseComponentProps {
  /**
   * Ref forwarded to the root SVG element
   */
  ref?: React.Ref<SVGSVGElement>;
}

/**
 * Props for components that forward refs to canvas elements
 */
export interface CanvasComponentProps extends BaseComponentProps {
  /**
   * Ref forwarded to the canvas element
   */
  ref?: React.Ref<HTMLCanvasElement>;
}

// ============================================================================
// Data Types
// ============================================================================

/**
 * 2D data point as [x, y]
 */
export type DataPoint2D = readonly [x: number, y: number];

/**
 * 3D data point as [x, y, z]
 */
export type DataPoint3D = readonly [x: number, y: number, z: number];

/**
 * Time series data point as [timestamp, value]
 */
export type TimeSeriesPoint = readonly [timestamp: number, value: number];

/**
 * Named data series with metadata
 */
export interface DataSeries<T = DataPoint2D> {
  readonly id: string;
  readonly label?: string;
  readonly data: ReadonlyArray<T>;
  readonly color?: RGB | CSSColor;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Callback when component is ready/initialized
 */
export type OnReadyCallback = () => void;

/**
 * Error callback
 */
export type OnErrorCallback = (error: Error) => void;

/**
 * Generic click callback with item data
 */
export type OnClickCallback<T> = (item: T, event: React.MouseEvent) => void;

/**
 * Generic hover callback with item data
 */
export type OnHoverCallback<T> = (
  item: T | null,
  event: React.MouseEvent
) => void;

// ============================================================================
// Rendering Options
// ============================================================================

/**
 * Rendering backend to use
 */
export type RenderingBackend = "auto" | "webgpu" | "canvas" | "svg";

/**
 * Theme mode
 */
export type ThemeMode = "light" | "dark";

/**
 * Component size variant
 */
export type SizeVariant = "sm" | "md" | "lg";

/**
 * Component style variant
 */
export type StyleVariant = "default" | "compact" | "detailed" | "minimal";

// ============================================================================
// Status & State
// ============================================================================

/**
 * Generic status type for tasks, items, etc.
 */
export type Status =
  | "pending"
  | "in-progress"
  | "completed"
  | "blocked"
  | "cancelled";

/**
 * Loading state
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

// ============================================================================
// Validation
// ============================================================================

/**
 * Validation result with optional error message
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// WebGPU Types
// ============================================================================

/**
 * WebGPU support level
 */
export type WebGPUSupportLevel =
  | "full" // Full WebGPU support
  | "limited" // WebGPU available but limited
  | "none"; // No WebGPU support

/**
 * GPU buffer usage flags
 */
export type BufferUsage =
  | "vertex"
  | "uniform"
  | "storage"
  | "index"
  | "copy-src"
  | "copy-dst";

// ============================================================================
// Animation
// ============================================================================

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Animation duration in milliseconds
 */
export type Duration = number;

/**
 * Transition configuration
 */
export interface TransitionConfig {
  duration: Duration;
  easing?: EasingFunction;
  delay?: Duration;
}
