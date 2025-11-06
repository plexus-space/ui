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
 * WebGPU Buffer Manager
 * Efficient GPU buffer management
 */
export {
  bufferManager,
  BUFFER_ALIGNMENT,
  type BufferOptions,
  type BufferMetadata,
  type BufferStats,
  type BufferUsage,
  type BufferData,
} from "./buffer-manager";

/**
 * MSDF Text Renderer - WORKING GPU-accelerated MSDF text rendering
 * Based on WebGPU samples - proven implementation
 * 1000+ text labels at 60fps with crisp rendering at any scale
 * Use cases: HUD interfaces, tactical displays, telemetry labels
 *
 * NOTE: Requires pre-generated MSDF font atlas (see MSDF_FONTS.md)
 * Use font from: https://raw.githubusercontent.com/webgpu/webgpu-samples/main/sample/assets/font/ya-hei-ascii-msdf.json
 */
export {
  MsdfTextRenderer,
  type MsdfTextRendererProps,
  type TextLabel as MsdfTextLabel,
} from "./msdf-text-renderer";

/**
 * WebGPU 2D Shape Renderer - TRUE GPU-accelerated 2D shapes with SDF anti-aliasing
 * 10,000+ shapes at 60fps with perfect anti-aliasing at any scale
 * Use cases: HUD interfaces (reticles, crosshairs), tactical displays, gauges, diagrams
 *
 * Supported shapes:
 * - Lines (horizontal, vertical, angled) with configurable thickness
 * - Circles and arcs (for gauges, heading tapes, reticles)
 * - Rectangles and rounded rectangles
 * - Regular polygons (triangles, pentagons, hexagons, etc.)
 *
 * Features:
 * - SDF-based anti-aliasing (smooth at any scale)
 * - Instanced rendering (single draw call for all shapes)
 * - Rotation and transformation support
 * - Zero-copy buffer updates
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

// ============================================================================
// That's it. Build everything else from these blocks.
// ============================================================================
//
// For animations: Use Framer Motion, react-spring,
// For easing: Use CSS transitions or animation libraries
//
// **Performance Notes:**
// - WebGPU primitives: Use for large datasets (>5k points/triangles)
// - Three.js primitives: Use for 3D scenes with cameras and lighting
// - Automatic fallback: WebGPU primitives will fallback to CPU if unavailable
