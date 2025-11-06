// ============================================================================
// Line Rendering Shader (WebGPU)
// ============================================================================
//
// High-performance line rendering for 1M+ points
// Supports:
// - Line strips (polylines)
// - Per-vertex colors
// - Viewport transformation
// - Anti-aliasing
//
// @reference WebGPU Shading Language Spec: https://www.w3.org/TR/WGSL/

// ============================================================================
// Uniforms
// ============================================================================

struct Uniforms {
    width: f32,         // Canvas width in pixels
    height: f32,        // Canvas height in pixels
    minX: f32,          // Data domain min X
    maxX: f32,          // Data domain max X
    minY: f32,          // Data domain min Y
    maxY: f32,          // Data domain max Y
    marginLeft: f32,    // Left margin in pixels
    marginRight: f32,   // Right margin in pixels
    marginTop: f32,     // Top margin in pixels
    marginBottom: f32,  // Bottom margin in pixels
    time: f32,          // Time for animations
    _padding: f32,      // Align to 16 bytes
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// ============================================================================
// Vertex Input/Output
// ============================================================================

struct VertexInput {
    @location(0) position: vec2f,  // Data coordinates (not screen)
    @location(1) color: vec3f,     // RGB color
}

struct VertexOutput {
    @builtin(position) position: vec4f,  // Clip space position
    @location(0) color: vec3f,           // Pass-through color
    @location(1) dataPos: vec2f,         // Original data position (for tooltips)
}

// ============================================================================
// Vertex Shader
// ============================================================================

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;

  // Transform data coordinates to screen coordinates
    let plotWidth = uniforms.width - uniforms.marginLeft - uniforms.marginRight;
    let plotHeight = uniforms.height - uniforms.marginTop - uniforms.marginBottom;

  // Map data domain to plot area
    let normalizedX = (in.position.x - uniforms.minX) / (uniforms.maxX - uniforms.minX);
    let normalizedY = (in.position.y - uniforms.minY) / (uniforms.maxY - uniforms.minY);

  // Convert to screen space (with margins)
    let screenX = uniforms.marginLeft + normalizedX * plotWidth;
    let screenY = uniforms.marginTop + (1.0 - normalizedY) * plotHeight; // Flip Y

  // Convert screen space to NDC (Normalized Device Coordinates)
  // NDC range is [-1, 1] for both X and Y
    let ndcX = (screenX / uniforms.width) * 2.0 - 1.0;
    let ndcY = 1.0 - (screenY / uniforms.height) * 2.0;

    out.position = vec4f(ndcX, ndcY, 0.0, 1.0);
    out.color = in.color;
    out.dataPos = in.position;

    return out;
}

// ============================================================================
// Fragment Shader
// ============================================================================

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
  // Simple pass-through with alpha
    return vec4f(in.color, 1.0);
}

// ============================================================================
// Vertex Shader (Animated)
// ============================================================================

@vertex
fn vs_main_animated(in: VertexInput, @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var out: VertexOutput;

  // Transform data coordinates to screen coordinates
    let plotWidth = uniforms.width - uniforms.marginLeft - uniforms.marginRight;
    let plotHeight = uniforms.height - uniforms.marginTop - uniforms.marginBottom;

    let normalizedX = (in.position.x - uniforms.minX) / (uniforms.maxX - uniforms.minX);
    let normalizedY = (in.position.y - uniforms.minY) / (uniforms.maxY - uniforms.minY);

    let screenX = uniforms.marginLeft + normalizedX * plotWidth;
    let screenY = uniforms.marginTop + (1.0 - normalizedY) * plotHeight;

    let ndcX = (screenX / uniforms.width) * 2.0 - 1.0;
    let ndcY = 1.0 - (screenY / uniforms.height) * 2.0;

  // Apply fade-in animation based on vertex index
    let animProgress = clamp(uniforms.time - f32(vertexIndex) * 0.01, 0.0, 1.0);
    let scale = smoothstep(0.0, 1.0, animProgress);

    out.position = vec4f(ndcX * scale, ndcY * scale, 0.0, 1.0);
    out.color = in.color;
    out.dataPos = in.position;

    return out;
}

// ============================================================================
// Fragment Shader (Animated)
// ============================================================================

@fragment
fn fs_main_animated(in: VertexOutput) -> @location(0) vec4f {
  // Fade in based on time
    let animProgress = clamp(uniforms.time, 0.0, 1.0);
    let alpha = smoothstep(0.0, 1.0, animProgress);

    return vec4f(in.color, alpha);
}

// ============================================================================
// Utility Functions
// ============================================================================

// Smooth interpolation (for animations)
fn smoothstep(edge0: f32, edge1: f32, x: f32) -> f32 {
    let t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
}
