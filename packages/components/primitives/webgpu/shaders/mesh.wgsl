/**
 * WebGPU Mesh Renderer Shader
 *
 * Renders 3D meshes with lighting, normals, and textures.
 * Supports STL/OBJ loading, surface plots, terrain, and CAD models.
 *
 * Features:
 * - Phong lighting model
 * - Normal mapping
 * - Texture support
 * - Flat and smooth shading
 * - Wireframe mode
 *
 * @performance Optimized for large meshes (100k+ triangles)
 */

// ============================================================================
// Uniforms
// ============================================================================

struct Uniforms {
  modelMatrix: mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  projectionMatrix: mat4x4<f32>,
  normalMatrix: mat3x3<f32>,
  lightPosition: vec3f,
  lightColor: vec3f,
  ambientStrength: f32,
  diffuseStrength: f32,
  specularStrength: f32,
  shininess: f32,
  time: f32,
  _padding: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var diffuseTexture: texture_2d<f32>;
@group(0) @binding(2) var textureSampler: sampler;
@group(0) @binding(3) var normalMap: texture_2d<f32>;

// ============================================================================
// Vertex Input/Output
// ============================================================================

struct VertexInput {
  @location(0) position: vec3f,    // Vertex position
  @location(1) normal: vec3f,      // Vertex normal
  @location(2) uv: vec2f,          // Texture coordinates
  @location(3) color: vec3f,       // Vertex color
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) worldPosition: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec3f,
  @location(4) viewDirection: vec3f,
}

// ============================================================================
// Vertex Shader
// ============================================================================

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;

  // Transform position to world space
  let worldPosition = uniforms.modelMatrix * vec4f(in.position, 1.0);

  // Transform normal to world space
  let worldNormal = normalize(uniforms.normalMatrix * in.normal);

  // Calculate view direction
  let viewPosition = uniforms.viewMatrix * worldPosition;
  let viewDirection = normalize(-viewPosition.xyz);

  // Project to clip space
  let clipPosition = uniforms.projectionMatrix * viewPosition;

  // Output
  out.position = clipPosition;
  out.worldPosition = worldPosition.xyz;
  out.normal = worldNormal;
  out.uv = in.uv;
  out.color = in.color;
  out.viewDirection = viewDirection;

  return out;
}

// ============================================================================
// Fragment Shader - Phong Lighting
// ============================================================================

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
  // Sample textures
  let baseColor = textureSample(diffuseTexture, textureSampler, in.uv).rgb;
  let normalMapSample = textureSample(normalMap, textureSampler, in.uv).rgb;

  // Combine base color with vertex color
  let diffuseColor = baseColor * in.color;

  // Perturb normal with normal map
  let perturbedNormal = normalize(in.normal + (normalMapSample - 0.5) * 2.0);

  // Calculate lighting vectors
  let lightDirection = normalize(uniforms.lightPosition - in.worldPosition);
  let reflectDirection = reflect(-lightDirection, perturbedNormal);

  // Ambient
  let ambient = uniforms.ambientStrength * uniforms.lightColor;

  // Diffuse
  let diffuseIntensity = max(dot(perturbedNormal, lightDirection), 0.0);
  let diffuse = uniforms.diffuseStrength * diffuseIntensity * uniforms.lightColor;

  // Specular
  let specularIntensity = pow(max(dot(in.viewDirection, reflectDirection), 0.0), uniforms.shininess);
  let specular = uniforms.specularStrength * specularIntensity * uniforms.lightColor;

  // Combine
  let lighting = ambient + diffuse + specular;
  let finalColor = diffuseColor * lighting;

  return vec4f(finalColor, 1.0);
}

// ============================================================================
// Flat Shading (No Textures)
// ============================================================================

@fragment
fn fs_flat(in: VertexOutput) -> @location(0) vec4f {
  // Simple diffuse lighting with flat color
  let lightDirection = normalize(uniforms.lightPosition - in.worldPosition);
  let diffuseIntensity = max(dot(in.normal, lightDirection), 0.0);

  let ambient = uniforms.ambientStrength * uniforms.lightColor;
  let diffuse = uniforms.diffuseStrength * diffuseIntensity * uniforms.lightColor;

  let lighting = ambient + diffuse;
  let finalColor = in.color * lighting;

  return vec4f(finalColor, 1.0);
}

// ============================================================================
// Wireframe Mode
// ============================================================================

@fragment
fn fs_wireframe(in: VertexOutput) -> @location(0) vec4f {
  return vec4f(in.color, 1.0);
}
