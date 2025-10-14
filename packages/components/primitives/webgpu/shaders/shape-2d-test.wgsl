// Minimal test shader - just render colored quads

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    // Single red quad at center of screen
    var positions = array<vec2f, 4>(
        vec2f(-0.5, -0.5),
        vec2f( 0.5, -0.5),
        vec2f(-0.5,  0.5),
        vec2f( 0.5,  0.5)
    );

    var output: VertexOutput;
    output.position = vec4f(positions[vertexIndex], 0.0, 1.0);
    output.color = vec4f(1.0, 0.0, 0.0, 1.0); // Red
    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    return input.color;
}
