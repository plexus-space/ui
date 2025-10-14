/**
 * Global TypeScript declarations for shader file imports
 *
 * Allows importing shader files (.wgsl, .glsl, .vert, .frag) as strings
 * using Vite's ?raw suffix or direct imports.
 */

declare module "*.wgsl" {
  const content: string;
  export default content;
}

declare module "*.wgsl?raw" {
  const content: string;
  export default content;
}

declare module "*.glsl" {
  const content: string;
  export default content;
}

declare module "*.glsl?raw" {
  const content: string;
  export default content;
}

declare module "*.vert" {
  const content: string;
  export default content;
}

declare module "*.vert?raw" {
  const content: string;
  export default content;
}

declare module "*.frag" {
  const content: string;
  export default content;
}

declare module "*.frag?raw" {
  const content: string;
  export default content;
}
