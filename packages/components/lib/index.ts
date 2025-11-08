/**
 * Plexus UI - Shared Library
 *
 * Foundation for all Plexus UI components.
 * Import utilities and types from here to ensure consistency.
 *
 * @example
 * ```tsx
 * import { cn, clamp } from "@plexusui/components/lib";
 * import type { RGB, Margin } from "@plexusui/components/lib";
 * ```
 */

// Export all types
export type * from "./types";

// Export all utilities
export * from "./utils";

// Export all hooks
export * from "./hooks";

// Export registry utilities
export * from "./registry-utils";

// Export error boundary
export * from "./webgpu-error-boundary";
