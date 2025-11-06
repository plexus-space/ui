// WebGPU Compute Shader: Data Decimation
// Reduces high-resolution data to lower resolution using min-max algorithm
// Preserves peaks and valleys for accurate visualization at all zoom levels

struct DecimationParams {
  input_count: u32,      // Number of input points
  output_count: u32,     // Number of output points
  stride: u32,           // Decimation factor (input_count / output_count)
  mode: u32,             // 0: min-max, 1: average, 2: first, 3: last
}

@group(0) @binding(0) var<uniform> params: DecimationParams;
@group(0) @binding(1) var<storage, read> input_data: array<f32>;
@group(0) @binding(2) var<storage, read_write> output_data: array<f32>;

// Min-max decimation: preserves signal extremes
// Each output pair represents [min, max] of input bucket
@compute @workgroup_size(256)
fn decimateMinMax(@builtin(global_invocation_id) id: vec3u) {
  let bucket = id.x;
  if (bucket >= params.output_count / 2u) {
    return;
  }

  let start = bucket * params.stride;
  let end = min(start + params.stride, params.input_count);

  var min_val = 1e10;
  var max_val = -1e10;

  // Find min and max in this bucket
  for (var i = start; i < end; i++) {
    let val = input_data[i];
    min_val = min(min_val, val);
    max_val = max(max_val, val);
  }

  // Store min-max pair
  output_data[bucket * 2u] = min_val;
  output_data[bucket * 2u + 1u] = max_val;
}

// Average decimation: smooth downsampling
@compute @workgroup_size(256)
fn decimateAverage(@builtin(global_invocation_id) id: vec3u) {
  let bucket = id.x;
  if (bucket >= params.output_count) {
    return;
  }

  let start = bucket * params.stride;
  let end = min(start + params.stride, params.input_count);

  var sum = 0.0;
  var count = 0u;

  for (var i = start; i < end; i++) {
    sum += input_data[i];
    count++;
  }

  output_data[bucket] = sum / f32(count);
}

// First-point decimation: take first value in each bucket
@compute @workgroup_size(256)
fn decimateFirst(@builtin(global_invocation_id) id: vec3u) {
  let bucket = id.x;
  if (bucket >= params.output_count) {
    return;
  }

  let index = bucket * params.stride;
  if (index < params.input_count) {
    output_data[bucket] = input_data[index];
  }
}

// Last-point decimation: take last value in each bucket
@compute @workgroup_size(256)
fn decimateLast(@builtin(global_invocation_id) id: vec3u) {
  let bucket = id.x;
  if (bucket >= params.output_count) {
    return;
  }

  let index = min(bucket * params.stride + params.stride - 1u, params.input_count - 1u);
  output_data[bucket] = input_data[index];
}

// 2D Point decimation (min-max preserving for both X and Y)
// Input: [x0, y0, x1, y1, ...]
// Output: [xMin, yMin, xMax, yMax, ...] for each bucket
struct Point2D {
  x: f32,
  y: f32,
}

@compute @workgroup_size(256)
fn decimatePoints2D(@builtin(global_invocation_id) id: vec3u) {
  let bucket = id.x;
  if (bucket >= params.output_count / 2u) {
    return;
  }

  let start = bucket * params.stride;
  let end = min(start + params.stride, params.input_count);

  var min_x = 1e10;
  var max_x = -1e10;
  var min_y = 1e10;
  var max_y = -1e10;

  // Find extremes in this bucket
  for (var i = start; i < end; i++) {
    let x = input_data[i * 2u];
    let y = input_data[i * 2u + 1u];

    min_x = min(min_x, x);
    max_x = max(max_x, x);
    min_y = min(min_y, y);
    max_y = max(max_y, y);
  }

  // Store two points: (min_x, min_y) and (max_x, max_y)
  let out_base = bucket * 4u;
  output_data[out_base] = min_x;
  output_data[out_base + 1u] = min_y;
  output_data[out_base + 2u] = max_x;
  output_data[out_base + 3u] = max_y;
}
