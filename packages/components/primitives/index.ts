/**
 * Plexus UI Primitives
 *
 * High-performance WebGPU primitives for medical, defense, and robotics applications.
 * Each primitive is optimized for 60fps rendering with large datasets.
 */

// ============================================================================
// WebGPU Device Manager
// ============================================================================

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

// ============================================================================
// Line Renderer - Waveforms & Time-Series
// ============================================================================

export {
  LineRenderer,
  WebGPULineRenderer,
  type LineRendererProps,
  type LineTrace,
} from "./line-renderer";

// ============================================================================
// 2D Shape Renderer - HUD & Tactical Displays
// ============================================================================

export {
  ShapeRenderer,
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
// MSDF Text Renderer - Crisp Text at Any Scale
// ============================================================================

export {
  TextRenderer,
  MsdfTextRenderer,
  type MsdfTextRendererProps,
  type TextLabel,
  type MsdfChar,
  type MsdfFontJson,
} from "./msdf-text-renderer";
