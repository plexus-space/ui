/**
 * WebGPU Device Manager
 *
 * Handles WebGPU initialization, feature detection, and fallback strategies.
 * Provides singleton pattern for efficient device sharing across components.
 *
 * @example
 * ```tsx
 * const device = await getWebGPUDevice();
 * if (!device) {
 *   // Fall back to WebGL or SVG
 * }
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface WebGPUDeviceInfo {
  device: GPUDevice;
  adapter: GPUAdapter;
  context: GPUCanvasContext | null;
  features: {
    compute: boolean;
    timestamp: boolean;
    float32Filterable: boolean;
  };
  limits: {
    maxBufferSize: number;
    maxStorageBufferBindingSize: number;
    maxComputeWorkgroupSizeX: number;
    maxComputeWorkgroupsPerDimension: number;
  };
}

export interface WebGPUDeviceOptions {
  /** Request high performance adapter */
  powerPreference?: "low-power" | "high-performance";
  /** Required features (will throw if not available) */
  requiredFeatures?: GPUFeatureName[];
  /** Optional features (nice to have) */
  optionalFeatures?: GPUFeatureName[];
  /** Canvas element for render context */
  canvas?: HTMLCanvasElement | null;
}

// ============================================================================
// Singleton State
// ============================================================================

let cachedDevice: WebGPUDeviceInfo | null = null;
let initPromise: Promise<WebGPUDeviceInfo | null> | null = null;

// ============================================================================
// Feature Detection
// ============================================================================

/**
 * Check if WebGPU is available in the browser
 */
export function isWebGPUAvailable(): boolean {
  return "gpu" in navigator;
}

/**
 * Get WebGPU support level
 */
export type WebGPUSupportLevel =
  | "full" // Full WebGPU support
  | "limited" // WebGPU available but missing optional features
  | "none"; // No WebGPU support

export async function getWebGPUSupportLevel(): Promise<WebGPUSupportLevel> {
  if (!isWebGPUAvailable()) return "none";

  try {
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) return "none";

    // Check for compute shaders (essential for our use case)
    const hasCompute = true; // Compute is part of WebGPU core

    // Check for optional features we want
    const hasTimestamp = adapter.features.has("timestamp-query");
    const hasFloat32Filter = adapter.features.has("float32-filterable");

    if (hasCompute && hasTimestamp && hasFloat32Filter) {
      return "full";
    }

    return hasCompute ? "limited" : "none";
  } catch (error) {
    console.warn("WebGPU feature detection failed:", error);
    return "none";
  }
}

// ============================================================================
// Device Initialization
// ============================================================================

/**
 * Initialize WebGPU device (singleton)
 *
 * @returns WebGPU device info or null if unavailable
 */
export async function getWebGPUDevice(
  options: WebGPUDeviceOptions = {}
): Promise<WebGPUDeviceInfo | null> {
  // Return cached device if available (but create new context if canvas provided)
  if (cachedDevice) {
    // If a new canvas is provided, create a context for it
    if (options.canvas) {
      const context = options.canvas.getContext("webgpu");
      if (context) {
        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
          device: cachedDevice.device,
          format,
          alphaMode: "premultiplied",
        });
        // Return device with new context
        return {
          ...cachedDevice,
          context,
        };
      }
    }
    return cachedDevice;
  }

  // Return existing initialization promise
  if (initPromise) {
    return initPromise;
  }

  // Start new initialization
  initPromise = initializeDevice(options);
  const device = await initPromise;
  cachedDevice = device;

  return device;
}

async function initializeDevice(
  options: WebGPUDeviceOptions
): Promise<WebGPUDeviceInfo | null> {
  const {
    powerPreference = "high-performance",
    requiredFeatures = [],
    optionalFeatures = ["timestamp-query", "float32-filterable"],
    canvas = null,
  } = options;

  try {
    // Check for WebGPU support
    if (!isWebGPUAvailable()) {
      console.warn("WebGPU not available in this browser");
      return null;
    }

    // Request adapter
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference,
    });

    if (!adapter) {
      console.warn("WebGPU adapter request failed");
      return null;
    }

    // Determine which features to request
    const availableFeatures = Array.from(adapter.features);
    const featuresToRequest: GPUFeatureName[] = [
      ...requiredFeatures,
      ...optionalFeatures.filter((f) =>
        availableFeatures.includes(f as GPUFeatureName)
      ),
    ];

    // Request device with features
    const device = await adapter.requestDevice({
      requiredFeatures: featuresToRequest as Iterable<GPUFeatureName>,
      requiredLimits: {
        // Request higher limits for large datasets
        maxStorageBufferBindingSize: Math.min(
          adapter.limits.maxStorageBufferBindingSize,
          1024 * 1024 * 1024 // 1GB
        ),
        maxBufferSize: Math.min(
          adapter.limits.maxBufferSize,
          1024 * 1024 * 1024 // 1GB
        ),
      },
    });

    // Set up error handling
    device.lost.then((info) => {
      console.error("WebGPU device lost:", info.message);
      cachedDevice = null;
      initPromise = null;
    });

    device.addEventListener("uncapturederror", (event) => {
      const error = event.error;
      console.error("WebGPU uncaptured error:", {
        message: error?.message || "Unknown error",
        type: error?.constructor?.name || "Unknown",
      });

      // Log stack trace if available
      if (error instanceof Error && error.stack) {
        console.error("Stack trace:", error.stack);
      }

      // For validation errors, log additional details
      if (error && "constructor" in error) {
        const errorType = error.constructor.name;
        if (errorType === "GPUValidationError") {
          console.error("Validation error details:", error.message);
        } else if (errorType === "GPUOutOfMemoryError") {
          console.error("Out of memory error - consider reducing buffer sizes");
        } else if (errorType === "GPUInternalError") {
          console.error("Internal GPU error - this may be a driver issue");
        }
      }
    });

    // Create canvas context if canvas provided
    let context: GPUCanvasContext | null = null;
    if (canvas) {
      context = canvas.getContext("webgpu");
      if (context) {
        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
          device,
          format,
          alphaMode: "premultiplied",
        });
      }
    }

    // Extract device info
    const deviceInfo: WebGPUDeviceInfo = {
      device,
      adapter,
      context,
      features: {
        compute: true, // Always available in WebGPU
        timestamp: device.features.has("timestamp-query"),
        float32Filterable: device.features.has("float32-filterable"),
      },
      limits: {
        maxBufferSize: device.limits.maxBufferSize,
        maxStorageBufferBindingSize: device.limits.maxStorageBufferBindingSize,
        maxComputeWorkgroupSizeX: device.limits.maxComputeWorkgroupSizeX,
        maxComputeWorkgroupsPerDimension:
          device.limits.maxComputeWorkgroupsPerDimension,
      },
    };

    console.log("WebGPU device initialized:", {
      features: deviceInfo.features,
      limits: deviceInfo.limits,
    });

    return deviceInfo;
  } catch (error) {
    console.error("Failed to initialize WebGPU device:", error);
    return null;
  }
}

/**
 * Destroy the cached device and release resources
 */
export function destroyWebGPUDevice(): void {
  if (cachedDevice) {
    cachedDevice.device.destroy();
    cachedDevice = null;
    initPromise = null;
  }
}

/**
 * Create a canvas context for WebGPU rendering
 */
export async function createCanvasContext(
  canvas: HTMLCanvasElement
): Promise<GPUCanvasContext | null> {
  const deviceInfo = await getWebGPUDevice({ canvas });
  return deviceInfo?.context ?? null;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Get recommended workgroup size for compute shader
 */
export function getWorkgroupSize(
  dataSize: number,
  device: GPUDevice
): { x: number; y: number; z: number } {
  const maxWorkgroupSize = device.limits.maxComputeWorkgroupSizeX;

  // Use 256 as default (good balance)
  const workgroupSize = Math.min(256, maxWorkgroupSize);

  return { x: workgroupSize, y: 1, z: 1 };
}

/**
 * Calculate dispatch size for compute shader
 */
export function getDispatchSize(
  dataSize: number,
  workgroupSize: number
): number {
  return Math.ceil(dataSize / workgroupSize);
}
