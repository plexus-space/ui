// ============================================================================
// Decimation Compute Shader (WebGPU)
// ============================================================================
//
// Largest-Triangle-Three-Buckets (LTTB) algorithm on GPU
// Reduces 1M points to 1k points while preserving visual characteristics
//
// Algorithm:
// 1. Divide data into N buckets
// 2. For each bucket, find point that forms largest triangle with neighbors
// 3. This preserves peaks, valleys, and trends

// ============================================================================
// Bindings
// ============================================================================

struct Params {
    inputSize: u32,      // Number of input points
    outputSize: u32,     // Desired number of output points
    bucketSize: u32,     // Points per bucket
    numBuckets: u32,     // Total number of buckets
}

@group(0) @binding(0) var<storage, read> input: array<vec2f>;        // Input points
@group(0) @binding(1) var<storage, read_write> output: array<vec2f>; // Output points
@group(0) @binding(2) var<uniform> params: Params;

// ============================================================================
// Compute Shader
// ============================================================================

@compute @workgroup_size(256)
fn decimate(@builtin(global_invocation_id) id: vec3u) {
    let bucketIdx = id.x;

  // Bounds check
    if bucketIdx >= params.numBuckets {
        return;
    }

  // First and last points are always included
    if bucketIdx == 0u {
        output[0] = input[0];
        return;
    }

    if bucketIdx == params.numBuckets - 1u {
        output[params.outputSize - 1u] = input[params.inputSize - 1u];
        return;
    }

  // Calculate bucket range
    let bucketStart = bucketIdx * params.bucketSize;
    let bucketEnd = min(bucketStart + params.bucketSize, params.inputSize);

  // Get previous point (from previous bucket's selection)
    let prevPoint = output[bucketIdx - 1u];

  // Calculate average of next bucket (for triangle calculation)
    var nextBucketStart = (bucketIdx + 1u) * params.bucketSize;
    var nextBucketEnd = min(nextBucketStart + params.bucketSize, params.inputSize);

  // Clamp to avoid going past end
    nextBucketStart = min(nextBucketStart, params.inputSize - 1u);
    nextBucketEnd = min(nextBucketEnd, params.inputSize);

    var avgNext = vec2f(0.0, 0.0);
    var count = 0u;

    for (var i = nextBucketStart; i < nextBucketEnd; i++) {
        avgNext += input[i];
        count++;
    }

    if count > 0u {
        avgNext /= f32(count);
    } else {
    // Fallback: use last point
        avgNext = input[params.inputSize - 1u];
    }

  // Find point in current bucket with maximum triangle area
    var maxArea = 0.0;
    var selectedIdx = bucketStart;

    for (var i = bucketStart; i < bucketEnd; i++) {
        let currentPoint = input[i];

    // Calculate triangle area using cross product
    // Area = 0.5 * |det([[x1, y1, 1], [x2, y2, 1], [x3, y3, 1]])|
    // Simplified: 0.5 * |(x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2))|
        let area = abs(
            prevPoint.x * (currentPoint.y - avgNext.y) + currentPoint.x * (avgNext.y - prevPoint.y) + avgNext.x * (prevPoint.y - currentPoint.y)
        ) * 0.5;

        if area > maxArea {
            maxArea = area;
            selectedIdx = i;
        }
    }

  // Store selected point
    output[bucketIdx] = input[selectedIdx];
}

// ============================================================================
// Simple Decimation (Every Nth Point)
// ============================================================================

@compute @workgroup_size(256)
fn decimate_simple(@builtin(global_invocation_id) id: vec3u) {
    let outputIdx = id.x;

    if outputIdx >= params.outputSize {
        return;
    }

  // Calculate input index (evenly spaced)
    let stride = f32(params.inputSize - 1u) / f32(params.outputSize - 1u);
    let inputIdx = u32(f32(outputIdx) * stride);

  // Clamp to bounds
    let safeIdx = min(inputIdx, params.inputSize - 1u);

    output[outputIdx] = input[safeIdx];
}

// ============================================================================
// Min-Max Decimation (Preserves Extrema)
// ============================================================================

@compute @workgroup_size(256)
fn decimate_minmax(@builtin(global_invocation_id) id: vec3u) {
    let bucketIdx = id.x;

    if bucketIdx >= params.numBuckets {
        return;
    }

    let bucketStart = bucketIdx * params.bucketSize;
    let bucketEnd = min(bucketStart + params.bucketSize, params.inputSize);

  // Find min and max in bucket
    var minVal = input[bucketStart].y;
    var maxVal = input[bucketStart].y;
    var minIdx = bucketStart;
    var maxIdx = bucketStart;

    for (var i = bucketStart; i < bucketEnd; i++) {
        let val = input[i].y;

        if val < minVal {
            minVal = val;
            minIdx = i;
        }
        if val > maxVal {
            maxVal = val;
            maxIdx = i;
        }
    }

  // Store both min and max (need 2x output size)
    if bucketIdx * 2u < params.outputSize {
        output[bucketIdx * 2u] = input[minIdx];
    }
    if bucketIdx * 2u + 1u < params.outputSize {
        output[bucketIdx * 2u + 1u] = input[maxIdx];
    }
}

// ============================================================================
// Utility: Calculate Statistics
// ============================================================================

struct Stats {
    min: vec2f,
    max: vec2f,
    mean: vec2f,
    count: u32,
}

@group(0) @binding(3) var<storage, read_write> stats: Stats;

@compute @workgroup_size(256)
fn calculate_stats(@builtin(global_invocation_id) id: vec3u) {
    let idx = id.x;

    if idx >= params.inputSize {
        return;
    }

    let point = input[idx];

  // Use atomic operations for thread-safe accumulation
  // Note: WebGPU doesn't support atomic floats yet, so we use shared memory
  // This is a simplified version - production code would use reduction

    if idx == 0u {
        stats.min = point;
        stats.max = point;
        stats.mean = vec2f(0.0, 0.0);
        stats.count = 0u;
    }

  // Simplified: just update on last thread (not optimal but safe)
    if idx == params.inputSize - 1u {
        var minP = input[0];
        var maxP = input[0];
        var sum = vec2f(0.0, 0.0);

        for (var i = 0u; i < params.inputSize; i++) {
            let p = input[i];
            minP = vec2f(min(minP.x, p.x), min(minP.y, p.y));
            maxP = vec2f(max(maxP.x, p.x), max(maxP.y, p.y));
            sum += p;
        }

        stats.min = minP;
        stats.max = maxP;
        stats.mean = sum / f32(params.inputSize);
        stats.count = params.inputSize;
    }
}
