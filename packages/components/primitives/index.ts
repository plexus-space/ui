/**
 * WebGPU Line Renderer - TRUE GPU compute shaders
 * 1M+ points at 60fps, GPU decimation, spatial indexing
 */
export {
  WebGPULineRenderer,
  type WebGPULineRendererProps,
} from "./line-renderer";

/**
 * WebGPU Device Manager
 * Initialize and manage WebGPU devices
 */
export {
  getWebGPUDevice,
  isWebGPUAvailable,
  getWebGPUSupportLevel,
  destroyWebGPUDevice,
  createCanvasContext,
  type WebGPUDeviceInfo,
  type WebGPUDeviceOptions,
  type WebGPUSupportLevel,
} from "./device";

/**
 * WebGPU Utilities
 * Core utilities for WebGPU initialization, context management, and uniform buffers
 */
export {
  createWebGPUContext,
  configureContext,
  createAlignedUniformData,
  getAlignedUniformSize,
  createUniformBuffer as createUniformBufferDirect,
  updateUniformBuffer,
  UNIFORM_BUFFER_ALIGNMENT,
  type WebGPUContext,
} from "./webgpu-utils";

/**
 * WebGPU Buffer Manager
 * Efficient GPU buffer management
 */
export {
  bufferManager,
  createVertexBuffer,
  createUniformBuffer,
  createStorageBuffer,
  readBuffer,
  type BufferOptions,
  type BufferMetadata,
} from "./buffer-manager";

/**
 * WebGPU Point Cloud - TRUE GPU rendering
 * 100k+ points at 60fps with per-point attributes
 * Use cases: Scatter plots, LiDAR, particles, stars, molecular viz
 */
export {
  WebGPUPointCloud,
  type WebGPUPointCloudProps,
  type Point,
} from "./point-cloud";

/**
 * WebGPU 2D Shape Renderer - GPU-accelerated 2D shapes with SDF anti-aliasing
 * Renders 10,000+ shapes at 60fps with perfect anti-aliasing at any scale
 */
export {
  WebGPU2DRenderer,
  ShapeType,
  createLine,
  createCircle,
  createRectangle,
  createRoundedRectangle,
  createArc,
  createPolygon,
  type WebGPU2DRendererProps,
  type Shape,
} from "./shape-2d-renderer";

/**
 * Validation
 * Input sanitization, bounds checking, NaN/Infinity handling
 */
export {
  isValidVec3,
  isValidVec2,
  isValidNumber,
  validateVec3,
  validateVec2,
  validateNumber,
  sanitizeVec3,
  sanitizeVec2,
  clamp,
} from "./validation";

/**
 * Chart Container - Layout Foundation
 * Layout-only container for WebGPU charts (does NOT manage rendering):
 * - Auto-resize, zoom/pan, play/pause controls
 * - Provides layout context for chart components
 * Chart components (WaveformMonitor, etc.) own the canvas and rendering
 */
export {
  default as ChartContainer,
  useChartLayout,
  type ChartContainerProps,
  type ChartLayoutContext,
} from "./chart-container";

/**
 * Chart Grid - WebGPU-accelerated grid overlay
 * Renders grid lines using shape renderer for consistency
 */
export { ChartGrid, type ChartGridProps } from "./chart-grid";

/**
 * Chart Axes - WebGPU-accelerated axes with labels
 * Renders axis lines and tick marks with WebGPU, labels with HTML
 */
export { ChartAxes, type ChartAxesProps } from "./chart-axes";

/**
 * Chart Tooltip - Interactive data tooltip
 * Displays data values on hover with auto-positioning
 */
export {
  ChartTooltip,
  type ChartTooltipProps,
  type TooltipData,
} from "./chart-tooltip";
