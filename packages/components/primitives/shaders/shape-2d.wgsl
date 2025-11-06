// WebGPU 2D Shape Renderer - SDF-based anti-aliased shapes
// Supports: lines, circles, rectangles, rounded rectangles, arcs, polygons
// Uses signed distance fields for smooth anti-aliasing at any scale

// ============================================================================
// Shape Type Constants
// ============================================================================

const SHAPE_LINE: u32 = 0u;
const SHAPE_CIRCLE: u32 = 1u;
const SHAPE_RECTANGLE: u32 = 2u;
const SHAPE_ROUNDED_RECT: u32 = 3u;
const SHAPE_ARC: u32 = 4u;
const SHAPE_POLYGON: u32 = 5u;

// ============================================================================
// Data Structures
// ============================================================================

struct VertexInput {
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32,
};

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) localPos: vec2f,           // Position in local shape space
    @location(1) @interpolate(flat) color: vec4f,
    @location(2) @interpolate(flat) shapeType: u32,
    @location(3) @interpolate(flat) params: vec4f,
    @location(4) @interpolate(flat) size: vec2f,
};

struct ShapeInstance {
    position: vec2f,      // offset 0, 8 bytes
    size: vec2f,          // offset 8, 8 bytes
    rotation: f32,        // offset 16, 4 bytes
    shapeType: u32,       // offset 20, 4 bytes
    _pad1: f32,           // offset 24, 4 bytes - explicit padding for vec4f alignment
    _pad2: f32,           // offset 28, 4 bytes - explicit padding for vec4f alignment
    color: vec4f,         // offset 32, 16 bytes - MUST be 16-byte aligned!
    params: vec4f,        // offset 48, 16 bytes
    // Total: 64 bytes
    // Shape-specific params usage:
    // Line: [thickness, 0, 0, 0]
    // Rounded rect: [cornerRadius, 0, 0, 0]
    // Arc: [startAngle, endAngle, radius, thickness]
    // Polygon: [sides, 0, 0, 0]
};

struct Uniforms {
    viewportSize: vec2f,
    pixelScale: f32,      // For DPI scaling
    antialiasWidth: f32,  // Edge smoothing width in pixels
};

// ============================================================================
// Bindings
// ============================================================================

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> instances: array<ShapeInstance>;

// ============================================================================
// Utility Functions
// ============================================================================

// 2D rotation matrix
fn rotate2D(p: vec2f, angle: f32) -> vec2f {
    let c = cos(angle);
    let s = sin(angle);
    return vec2f(
        p.x * c - p.y * s,
        p.x * s + p.y * c
    );
}

// ============================================================================
// Signed Distance Field Functions
// ============================================================================

// SDF for line segment
fn sdLine(p: vec2f, a: vec2f, b: vec2f) -> f32 {
    let pa = p - a;
    let ba = b - a;
    let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

// SDF for circle
fn sdCircle(p: vec2f, r: f32) -> f32 {
    return length(p) - r;
}

// SDF for box (rectangle)
fn sdBox(p: vec2f, b: vec2f) -> f32 {
    let d = abs(p) - b;
    return length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0);
}

// SDF for rounded box
fn sdRoundedBox(p: vec2f, b: vec2f, r: f32) -> f32 {
    let d = abs(p) - b + vec2f(r);
    return length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0) - r;
}

// SDF for arc
fn sdArc(p: vec2f, startAngle: f32, endAngle: f32, radius: f32, thickness: f32) -> f32 {
    let angle = atan2(p.y, p.x);
    let normalizedAngle = (angle - startAngle + 6.28318530718) % 6.28318530718;
    let arcLength = endAngle - startAngle;

    // Check if point is within arc angle
    let isInArc = normalizedAngle <= arcLength;

    // Distance from center
    let dist = length(p);

    // Distance to ring
    let ringDist = abs(dist - radius) - thickness * 0.5;

    if isInArc {
        return ringDist;
    } else {
        // Distance to arc endpoints
        let p1 = vec2f(cos(startAngle), sin(startAngle)) * radius;
        let p2 = vec2f(cos(endAngle), sin(endAngle)) * radius;
        return min(length(p - p1), length(p - p2)) - thickness * 0.5;
    }
}

// SDF for regular polygon
fn sdPolygon(p: vec2f, sides: u32, r: f32) -> f32 {
    let n = f32(sides);
    let a = 3.14159265359 * 2.0 / n;
    let angle = atan2(p.y, p.x) + a * 0.5;
    let sector = floor(angle / a);
    let localAngle = angle - sector * a - a * 0.5;

    let q = length(p) * vec2f(cos(localAngle), abs(sin(localAngle)));
    let side = vec2f(cos(a * 0.5) * r, sin(a * 0.5) * r);

    return dot(q - side, vec2f(side.y, -side.x)) / length(vec2f(side.y, -side.x));
}

// ============================================================================
// Vertex Shader
// ============================================================================

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    // Quad vertices for triangle strip (covers -1 to 1 in both dimensions)
    var quadPositions = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f(1.0, -1.0),
        vec2f(-1.0, 1.0),
        vec2f(1.0, 1.0)
    );

    let instance = instances[input.instanceIndex];
    let quadPos = quadPositions[input.vertexIndex];

    // Apply rotation to quad vertex
    let rotatedPos = rotate2D(quadPos, instance.rotation);

    // Scale by half-size (quad is -1 to 1, so multiply by halfSize to get actual pixel size)
    let halfSize = instance.size * 0.5;
    let padding = 4.0; // Extra pixels for anti-aliasing
    let pixelPos = rotatedPos * (halfSize + vec2f(padding));

    // Translate to world position
    let worldPos = pixelPos + instance.position;

    // Convert pixel coordinates to NDC (clip space)
    // X: [0, width] -> [-1, 1]
    // Y: [0, height] -> [1, -1] (flipped because screen Y goes down)
    let ndc = vec2f(
        (worldPos.x / uniforms.viewportSize.x) * 2.0 - 1.0,
        1.0 - (worldPos.y / uniforms.viewportSize.y) * 2.0
    );

    var output: VertexOutput;
    output.position = vec4f(ndc, 0.0, 1.0);
    output.localPos = rotatedPos * halfSize; // Local space for SDF: [-halfSize, halfSize]
    output.color = instance.color;
    output.shapeType = instance.shapeType;
    output.params = instance.params;
    output.size = instance.size;

    return output;
}

// ============================================================================
// Fragment Shader
// ============================================================================

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    var dist: f32;

    // Calculate signed distance based on shape type
    if input.shapeType == SHAPE_LINE {
        let thickness = input.params.x;
        let halfSize = input.size * 0.5;
        dist = sdLine(input.localPos, vec2f(-halfSize.x, 0.0), vec2f(halfSize.x, 0.0)) - thickness * 0.5;
    } else if input.shapeType == SHAPE_CIRCLE {
        let radius = input.size.x * 0.5;
        dist = sdCircle(input.localPos, radius);
    } else if input.shapeType == SHAPE_RECTANGLE {
        let halfSize = input.size * 0.5;
        dist = sdBox(input.localPos, halfSize);
    } else if input.shapeType == SHAPE_ROUNDED_RECT {
        let halfSize = input.size * 0.5;
        let cornerRadius = input.params.x;
        dist = sdRoundedBox(input.localPos, halfSize, cornerRadius);
    } else if input.shapeType == SHAPE_ARC {
        let startAngle = input.params.x;
        let endAngle = input.params.y;
        let radius = input.size.x * 0.5;
        let thickness = input.params.w;
        dist = sdArc(input.localPos, startAngle, endAngle, radius, thickness);
    } else if input.shapeType == SHAPE_POLYGON {
        let sides = u32(input.params.x);
        let radius = input.size.x * 0.5;
        dist = sdPolygon(input.localPos, sides, radius);
    } else {
        // Fallback to circle
        let radius = input.size.x * 0.5;
        dist = sdCircle(input.localPos, radius);
    }

    // Anti-aliasing: smooth the edge
    let edgeWidth = uniforms.antialiasWidth;
    let alpha = 1.0 - smoothstep(-edgeWidth, edgeWidth, dist);

    // Discard fully transparent pixels
    if alpha < 0.01 {
        discard;
    }

    // Return premultiplied alpha (required for alphaMode: 'premultiplied')
    let finalAlpha = input.color.a * alpha;
    return vec4f(input.color.rgb * finalAlpha, finalAlpha);
}
