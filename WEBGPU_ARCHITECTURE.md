# WebGPU Architecture - Plexus UI

> **Physics-first visualization library for aerospace applications**
> Shadcn-style composability + WebGPU performance

## Design Philosophy

1. **Physics Integration** - First-class support for physics simulations
2. **Composability** - Shadcn-like primitive composition
3. **Performance** - 1M+ points at 60fps via WebGPU compute
4. **Type Safety** - Full TypeScript with dimensional analysis
5. **Zero Config** - Sensible defaults, easy to customize

## Core Architecture

### 3-Layer System

```
┌─────────────────────────────────────────────┐
│  Components (User-facing shadcn API)        │
│  LineChart, ScatterPlot, OrbitVisualizer   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Primitives (Composable building blocks)    │
│  LineRenderer, Marker, Trail, Sphere        │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  WebGPU Core (Low-level GPU abstractions)   │
│  Device, Buffers, Pipelines, Compute        │
└─────────────────────────────────────────────┘
```

### WebGPU Core Modules

#### 1. Device Manager
- Initialize WebGPU device
- Feature detection & fallback
- Context management
- Error recovery

#### 2. Buffer Manager
- Vertex buffers (position, color, velocity)
- Uniform buffers (transforms, time)
- Storage buffers (large datasets)
- Circular buffer updates

#### 3. Pipeline Manager
- Render pipelines (lines, points, meshes)
- Compute pipelines (decimation, spatial indexing)
- Shader compilation & caching
- Pipeline hot-reload (dev mode)

#### 4. Compute Shaders
- **Decimation** - LTTB algorithm on GPU
- **Spatial Indexing** - Grid-based point lookup
- **Physics** - Orbital propagation
- **Aggregation** - Min/max/mean reduction

## Component: LineChart (WebGPU)

### Shadcn-style API

```tsx
<LineChart.Root series={data} width={800} height={400}>
  <LineChart.Container>
    <LineChart.Viewport>
      <LineChart.Grid />
      <LineChart.Lines />
      <LineChart.Points />
    </LineChart.Viewport>
    <LineChart.Axes />
  </LineChart.Container>
  <LineChart.Tooltip />
  <LineChart.Legend />
</LineChart.Root>
```

### WebGPU Pipeline

```
Data Input (CPU)
    ↓
GPU Upload (Storage Buffer)
    ↓
Compute Pass: Decimation (optional, if > maxPoints)
    ↓
Compute Pass: Transform (data → screen coords)
    ↓
Compute Pass: Spatial Index (for hover detection)
    ↓
Render Pass: Draw lines
    ↓
Output (Canvas)
```

### Compute Shader: Decimation (LTTB)

```wgsl
// Largest-Triangle-Three-Buckets on GPU
@group(0) @binding(0) var<storage, read> input: array<vec2f>;
@group(0) @binding(1) var<storage, read_write> output: array<vec2f>;
@group(0) @binding(2) var<uniform> params: Params;

@compute @workgroup_size(256)
fn decimate(@builtin(global_invocation_id) id: vec3u) {
  let bucket_idx = id.x;
  if (bucket_idx >= params.num_buckets) { return; }

  // LTTB: Find point with max triangle area
  let bucket_start = bucket_idx * params.bucket_size;
  let bucket_end = min(bucket_start + params.bucket_size, params.input_size);

  var max_area = 0.0;
  var best_idx = bucket_start;

  for (var i = bucket_start; i < bucket_end; i++) {
    let area = triangleArea(
      output[bucket_idx - 1],
      input[i],
      avg_next_bucket
    );
    if (area > max_area) {
      max_area = area;
      best_idx = i;
    }
  }

  output[bucket_idx] = input[best_idx];
}
```

### Compute Shader: Spatial Index

```wgsl
// Grid-based spatial indexing for O(1) hover detection
@group(0) @binding(0) var<storage, read> points: array<vec2f>;
@group(0) @binding(1) var<storage, read_write> grid: array<atomic<u32>>;
@group(0) @binding(2) var<uniform> grid_params: GridParams;

@compute @workgroup_size(256)
fn build_grid(@builtin(global_invocation_id) id: vec3u) {
  let point_idx = id.x;
  if (point_idx >= arrayLength(&points)) { return; }

  let p = points[point_idx];
  let cell_x = u32((p.x - grid_params.min_x) / grid_params.cell_size);
  let cell_y = u32((p.y - grid_params.min_y) / grid_params.cell_size);
  let cell_idx = cell_y * grid_params.width + cell_x;

  // Atomic add for thread safety
  atomicAdd(&grid[cell_idx], 1u);
}
```

### Render Pipeline: Lines

```wgsl
// Vertex shader
struct VertexInput {
  @location(0) position: vec2f,
  @location(1) color: vec3f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec3f,
}

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;

  // Transform to NDC
  let ndc = vec2f(
    (in.position.x / uniforms.width) * 2.0 - 1.0,
    1.0 - (in.position.y / uniforms.height) * 2.0
  );

  out.position = vec4f(ndc, 0.0, 1.0);
  out.color = in.color;
  return out;
}

// Fragment shader
@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
  return vec4f(in.color, 1.0);
}
```

## Physics Integration

### Use Physics State Directly

```tsx
import { usePhysicsSimulation } from '@plexus/hooks'
import { integrateRK4, gravity } from '@plexus/primitives'

function OrbitVisualizer() {
  const { state, history } = usePhysicsSimulation({
    initial: { position: [7000, 0, 0], velocity: [0, 7.5, 0] },
    forces: gravity(398600.4418, 5.97e24),
    integrator: integrateRK4,
    dt: 10,
  })

  // Convert Vec3[] to screen coordinates
  const points = history.map(s => projectToScreen(s.position))

  return (
    <LineChart.Root series={[{ name: 'Orbit', data: points }]}>
      <LineChart.Container>
        <LineChart.Viewport>
          <LineChart.Lines />
          <Marker position={state.position} /> {/* Current satellite */}
        </LineChart.Viewport>
      </LineChart.Container>
    </LineChart.Root>
  )
}
```

## Performance Targets

| Dataset | WebGL (current) | WebGPU (target) | Improvement |
|---------|----------------|-----------------|-------------|
| 10k pts | 0.3ms/frame | 0.1ms/frame | 3x |
| 100k pts | 1.5ms/frame | 0.5ms/frame | 3x |
| 1M pts | 15ms/frame | 2ms/frame | 7.5x |
| 10M pts | ❌ N/A | 10ms/frame | ♾️ |

**Key Optimizations:**
- Compute shaders for decimation: 10x faster than CPU
- Spatial indexing on GPU: O(1) hover vs O(n)
- Zero-copy buffer updates: Direct GPU memory mapping
- Persistent pipelines: No re-creation overhead

## Browser Support Strategy

```tsx
// Automatic fallback
<LineChart.Root series={data} preferGPU="webgpu">
  {/* WebGPU if available, else WebGL, else SVG */}
</LineChart.Root>
```

Fallback order:
1. **WebGPU** (Chrome 113+, Firefox 115+, Safari 18+)
2. **WebGL** (via Three.js) - Universal support
3. **SVG** (< 5k points) - Guaranteed compatibility

## File Structure

```
packages/
├── components/
│   ├── line-chart-webgpu.tsx      # Main component
│   ├── primitives/
│   │   ├── webgpu-line-renderer.tsx
│   │   ├── webgpu-device.ts
│   │   ├── webgpu-buffer-manager.ts
│   │   └── webgpu-pipeline-manager.ts
│   └── shaders/
│       ├── line.wgsl
│       ├── decimation.wgsl
│       └── spatial-index.wgsl
├── hooks/
│   ├── use-webgpu.ts
│   ├── use-webgpu-line.ts
│   └── use-physics-simulation.ts
└── lib/
    └── webgpu-utils.ts
```

## Implementation Phases

### Phase 1: Core WebGPU Renderer ✓ (Current)
- Device initialization
- Buffer management
- Basic line rendering

### Phase 2: Compute Shaders (Next)
- LTTB decimation
- Spatial indexing
- Transform pipeline

### Phase 3: Components
- LineChart.Root with context
- Composable primitives
- Tooltip/Legend overlays

### Phase 4: Physics Integration
- usePhysicsSimulation hook
- Real-time orbital propagation
- Ground track computation

### Phase 5: Polish
- Hot reload
- DevTools
- Performance profiler
- Example gallery

## Design Decisions

### Why WebGPU over WebGL?

1. **Compute Shaders** - LTTB decimation on GPU (10x faster)
2. **Better API** - Modern, explicit control over GPU
3. **Performance** - Lower overhead, better batching
4. **Future-proof** - Native path for GPU computing

### Why Shadcn-style API?

1. **Composability** - Mix and match primitives
2. **Flexibility** - Override any part
3. **Familiarity** - Developers know the pattern
4. **Type Safety** - TypeScript through and through

### Why Physics-First?

Aerospace/scientific users need:
1. **Direct access** to simulation state
2. **Orbital mechanics** built-in
3. **Type-safe units** (no meter/km confusion)
4. **Validated integrators** (RK4, Verlet)

## Next Steps

1. ✓ Architecture design
2. → Implement WebGPU core modules
3. → Build LineRenderer primitive
4. → Create LineChart component
5. → Add physics integration
6. → Performance benchmarks
