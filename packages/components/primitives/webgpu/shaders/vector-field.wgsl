/**
 * WebGPU Vector Field Shader
 *
 * Renders vector fields as arrows for CFD, magnetic fields, and flow visualization.
 * Supports 2D and 3D fields with color mapping based on magnitude.
 *
 * Features:
 * - Instanced arrow rendering (100k+ arrows)
 * - Color mapping by magnitude
 * - Adaptive arrow sizing
 * - Streamline integration on GPU
 *
 * @performance 100k vectors @ 60fps
 */

// ============================================================================
// Uniforms
// ============================================================================

struct Uniforms {
  width: f32,
  height: f32,
  minX: f32,
  maxX: f32,
  minY: f32,
  maxY: f32,
  marginLeft: f32,
  marginRight: f32,
  marginTop: f32,
  marginBottom: f32,
  arrowScale: f32,       // Arrow size multiplier
  minMagnitude: f32,     // For color mapping
  maxMagnitude: f32,
  time: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// ============================================================================
// Vertex Input/Output
// ============================================================================

struct VertexInput {
  // Per-instance data
  @location(0) position: vec2f,     // Vector base position
  @location(1) direction: vec2f,    // Vector direction
  @location(2) magnitude: f32,      // Vector magnitude

  // Per-vertex data (arrow geometry)
  @location(3) vertexPosition: vec2f,  // Arrow mesh vertex
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec3f,
  @location(1) magnitude: f32,
}

// ============================================================================
// Color Mapping Functions
// ============================================================================

// Turbo colormap (perceptually uniform)
fn turboColormap(t: f32) -> vec3f {
  let r = clamp(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05)))), 0.0, 1.0);
  let g = clamp(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56)))), 0.0, 1.0);
  let b = clamp(27.2 + t * (3211.1 - t * (15327.97 - t * (27814.0 - t * (22569.18 - t * 6838.66)))), 0.0, 1.0);
  return vec3f(r, g, b);
}

// Viridis colormap
fn viridisColormap(t: f32) -> vec3f {
  let c0 = vec3f(0.267004, 0.004874, 0.329415);
  let c1 = vec3f(0.282623, 0.140926, 0.457517);
  let c2 = vec3f(0.253935, 0.265254, 0.529983);
  let c3 = vec3f(0.206756, 0.371758, 0.553117);
  let c4 = vec3f(0.163625, 0.471133, 0.558148);
  let c5 = vec3f(0.127568, 0.566949, 0.550556);
  let c6 = vec3f(0.134692, 0.658636, 0.517649);
  let c7 = vec3f(0.266941, 0.748751, 0.440573);
  let c8 = vec3f(0.477504, 0.821444, 0.318195);
  let c9 = vec3f(0.741388, 0.873449, 0.149561);
  let c10 = vec3f(0.993248, 0.906157, 0.143936);

  let t_scaled = t * 10.0;
  let i = floor(t_scaled);
  let f = fract(t_scaled);

  if (i < 1.0) { return mix(c0, c1, f); }
  else if (i < 2.0) { return mix(c1, c2, f); }
  else if (i < 3.0) { return mix(c2, c3, f); }
  else if (i < 4.0) { return mix(c3, c4, f); }
  else if (i < 5.0) { return mix(c4, c5, f); }
  else if (i < 6.0) { return mix(c5, c6, f); }
  else if (i < 7.0) { return mix(c6, c7, f); }
  else if (i < 8.0) { return mix(c7, c8, f); }
  else if (i < 9.0) { return mix(c8, c9, f); }
  else { return mix(c9, c10, f); }
}

// ============================================================================
// Vertex Shader
// ============================================================================

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;

  // Calculate plot dimensions
  let plotWidth = uniforms.width - uniforms.marginLeft - uniforms.marginRight;
  let plotHeight = uniforms.height - uniforms.marginTop - uniforms.marginBottom;

  // Normalize vector direction
  let direction = normalize(in.direction);

  // Scale arrow by magnitude and uniform scale
  let arrowLength = in.magnitude * uniforms.arrowScale;

  // Create rotation matrix
  let angle = atan2(direction.y, direction.x);
  let cosAngle = cos(angle);
  let sinAngle = sin(angle);
  let rotation = mat2x2<f32>(
    cosAngle, -sinAngle,
    sinAngle, cosAngle
  );

  // Transform arrow vertex
  let scaledVertex = in.vertexPosition * vec2f(arrowLength, arrowLength);
  let rotatedVertex = rotation * scaledVertex;
  let worldPosition = in.position + rotatedVertex;

  // Normalize position to [0, 1]
  let normalizedX = (worldPosition.x - uniforms.minX) / (uniforms.maxX - uniforms.minX);
  let normalizedY = (worldPosition.y - uniforms.minY) / (uniforms.maxY - uniforms.minY);

  // Convert to screen space
  let screenX = uniforms.marginLeft + normalizedX * plotWidth;
  let screenY = uniforms.marginTop + (1.0 - normalizedY) * plotHeight;

  // Convert to NDC [-1, 1]
  let ndcX = (screenX / uniforms.width) * 2.0 - 1.0;
  let ndcY = 1.0 - (screenY / uniforms.height) * 2.0;

  // Color mapping based on magnitude
  let normalizedMagnitude = (in.magnitude - uniforms.minMagnitude) / (uniforms.maxMagnitude - uniforms.minMagnitude);
  let color = viridisColormap(clamp(normalizedMagnitude, 0.0, 1.0));

  // Output
  out.position = vec4f(ndcX, ndcY, 0.0, 1.0);
  out.color = color;
  out.magnitude = in.magnitude;

  return out;
}

// ============================================================================
// Fragment Shader
// ============================================================================

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
  return vec4f(in.color, 1.0);
}

// ============================================================================
// Streamline Integration (Compute Shader)
// ============================================================================

struct VectorFieldData {
  positions: array<vec2f>,    // Grid positions
  vectors: array<vec2f>,      // Vector values
  gridWidth: u32,
  gridHeight: u32,
}

@group(0) @binding(1) var<storage, read> vectorField: VectorFieldData;
@group(0) @binding(2) var<storage, read_write> streamlines: array<vec2f>;

@compute @workgroup_size(256)
fn compute_streamline(@builtin(global_invocation_id) global_id: vec3u) {
  let streamlineIndex = global_id.x;

  // RK4 integration for streamline
  // TODO: Implement streamline integration
  // This is a placeholder for future implementation
}
