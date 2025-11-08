/**
 * TypeScript declarations for WGSL shader imports and WebGPU types
 *
 * Allows importing .wgsl files as strings using Vite's ?raw suffix
 */

/// <reference types="@webgpu/types" />

declare module "*.wgsl" {
  const content: string;
  export default content;
}

declare module "*.wgsl?raw" {
  const content: string;
  export default content;
}
