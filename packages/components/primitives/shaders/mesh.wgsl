// ============================================================================
// Simplified WebGPU Mesh Renderer
// ============================================================================

struct Uniforms {
    mvpMatrix: mat4x4<f32>,      // Combined model-view-projection
    normalMatrix: mat3x3<f32>,   // For transforming normals
    lightDirection: vec3f,        // Normalized light direction
    lightColor: vec3f,            // RGB light color
    ambientLight: f32,            // Ambient strength (0-1)
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// ============================================================================
// Vertex Shader
// ============================================================================

struct VertexIn {
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) color: vec3f,
}

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f,
    @location(1) color: vec3f,
}

@vertex
fn vs_main(in: VertexIn) -> VertexOut {
    var out: VertexOut;
  
  // Transform position and normal
    out.position = uniforms.mvpMatrix * vec4f(in.position, 1.0);
    out.normal = normalize(uniforms.normalMatrix * in.normal);
    out.color = in.color;

    return out;
}

// ============================================================================
// Fragment Shader
// ============================================================================

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  // Simple directional light calculation
    let diffuse = max(dot(in.normal, uniforms.lightDirection), 0.0);
    let lighting = uniforms.ambientLight + diffuse * (1.0 - uniforms.ambientLight);
  
  // Apply lighting to vertex color
    let finalColor = in.color * uniforms.lightColor * lighting;

    return vec4f(finalColor, 1.0);
}