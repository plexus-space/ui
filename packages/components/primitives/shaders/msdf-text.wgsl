// MSDF Text Rendering Shader (adapted from WebGPU samples)
// Quad geometry pattern for triangle strip
const pos = array(vec2f(0, -1), vec2f(1, -1), vec2f(0, 0), vec2f(1, 0));

struct VertexInput {
    @builtin(vertex_index) vertex: u32,
    @builtin(instance_index) instance: u32,
};

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) texcoord: vec2f,
    @location(1) @interpolate(flat) color: vec4f,
};

struct Char {
    texOffset: vec2f,
    texExtent: vec2f,
    size: vec2f,
    offset: vec2f,
};

struct TextInstance {
    position: vec2f,      // offset 0, 8 bytes
    charIndex: f32,       // offset 8, 4 bytes
    _pad1: f32,           // offset 12, 4 bytes
    color: vec4f,         // offset 16, 16 bytes
    scale: f32,           // offset 32, 4 bytes
    _pad2: f32,           // offset 36, 4 bytes
    _pad3: f32,           // offset 40, 4 bytes
    _pad4: f32,           // offset 44, 4 bytes
    // Total: 48 bytes
};

struct Uniforms {
    viewportSize: vec2f,
    pixelScale: f32,
};

// Font bindings
@group(0) @binding(0) var fontTexture: texture_2d<f32>;
@group(0) @binding(1) var fontSampler: sampler;
@group(0) @binding(2) var<storage> chars: array<Char>;
@group(0) @binding(3) var<uniform> uniforms: Uniforms;
@group(0) @binding(4) var<storage> instances: array<TextInstance>;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    let instance = instances[input.instance];
    let char = chars[u32(instance.charIndex)];  // Cast float to u32

    // Quad extends from (0,-1) to (1,0) - designed for Y-up coordinates
    let quadPos = pos[input.vertex];

    // Flip Y to convert from Y-up (quad) to Y-down (screen)
    // This makes the quad extend downward in screen space
    let quadPosScreen = vec2f(quadPos.x, -quadPos.y);

    // Calculate character geometry in screen pixel space
    let charGeometry = (quadPosScreen * char.size + char.offset) * uniforms.pixelScale * instance.scale;
    let charPos = charGeometry + instance.position;

    // Convert to clip space: pixel -> NDC
    let clipPos = vec2f(
        (charPos.x / uniforms.viewportSize.x) * 2.0 - 1.0,
        1.0 - (charPos.y / uniforms.viewportSize.y) * 2.0
    );

    var output: VertexOutput;
    output.position = vec4f(clipPos, 0.0, 1.0);
    output.color = instance.color;

    // UV coordinates use original quad orientation
    output.texcoord = quadPos * vec2f(1, -1);
    output.texcoord *= char.texExtent;
    output.texcoord += char.texOffset;

    return output;
}

fn sampleMsdf(texcoord: vec2f) -> f32 {
    let c = textureSample(fontTexture, fontSampler, texcoord);
    return max(min(c.r, c.g), min(max(c.r, c.g), c.b));
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    // DEBUG: Visualize UV coordinates
    // Red = U, Green = V, values outside 0-1 will clamp
    // return vec4f(input.texcoord.x, input.texcoord.y, 0.0, 1.0);

    // pxRange (AKA distanceRange) comes from the msdfgen tool.
    // The default value is 4.0
    let pxRange = 4.0;

    // Get texture dimensions and calculate derivatives for antialiasing
    let sz = vec2f(textureDimensions(fontTexture, 0));
    let dx = sz.x * length(vec2f(dpdxFine(input.texcoord.x), dpdyFine(input.texcoord.x)));
    let dy = sz.y * length(vec2f(dpdxFine(input.texcoord.y), dpdyFine(input.texcoord.y)));
    let toPixels = pxRange * inverseSqrt(dx * dx + dy * dy);

    // Sample MSDF and calculate distance
    let sigDist = sampleMsdf(input.texcoord) - 0.5;
    let pxDist = sigDist * toPixels;

    // Apply smooth edge with antialiasing
    let edgeWidth = 0.5;
    let alpha = smoothstep(-edgeWidth, edgeWidth, pxDist);

    // More lenient discard threshold
    if (alpha < 0.01) {
        discard;
    }

    return vec4f(input.color.rgb, input.color.a * alpha);
}
