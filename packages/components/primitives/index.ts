/**
 * WebGPU Line Renderer - TRUE GPU compute shaders
 * 1M+ points at 60fps, GPU decimation, spatial indexing
 */
export {
  WebGPULineRenderer,
  type WebGPULineRendererProps,
} from "./webgpu/line-renderer";

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
} from "./webgpu/device";

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
} from "./webgpu/buffer-manager";

/**
 * WebGPU Point Cloud - TRUE GPU rendering
 * 100k+ points at 60fps with per-point attributes
 * Use cases: Scatter plots, LiDAR, particles, stars, molecular viz
 */
export {
  WebGPUPointCloud,
  type WebGPUPointCloudProps,
  type Point,
} from "./webgpu/point-cloud";

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
} from "./webgpu/msdf-text-renderer";

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
