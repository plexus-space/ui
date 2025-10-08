# Line Chart

High-performance line chart component for data visualization with real-time streaming, zoom/pan interactions, and GPU-accelerated rendering.

## Features

- ✅ **Multi-series support** - Plot multiple data series with different colors and styles
- ✅ **Real-time streaming** - Live data updates with sliding window
- ✅ **Zoom/pan interactions** - Mouse wheel to zoom, drag to pan
- ✅ **GPU-accelerated rendering** - Smooth performance with 10k+ data points
- ✅ **Smart data decimation** - LTTB algorithm preserves visual shape while reducing points
- ✅ **Export capabilities** - Export to PNG, SVG, or CSV
- ✅ **Interactive tooltips** - Hover tooltips with crosshairs
- ✅ **Customizable axes** - Linear/log scales, custom tick formatters
- ✅ **Dark mode support** - Automatic theme detection
- ✅ **Legend with toggle** - Click legend items to show/hide series

## Installation

```bash
npx @plexusui/cli add line-chart
```

This will copy the following files to your project:
- `components/line-chart.tsx` - Main chart component
- `components/canvas-renderer.tsx` - High-performance canvas renderer
- `components/chart-tooltip.tsx` - Interactive tooltip
- `components/chart-legend.tsx` - Chart legend
- `components/chart-export.ts` - Export utilities
- `components/decimation.ts` - Data decimation algorithms
- `components/colormaps.ts` - Scientific color palettes

## Usage

### Basic Example

```tsx
import { LineChart } from "@/components/line-chart";

export default function Demo() {
  const data = Array.from({ length: 100 }, (_, i) => ({
    x: i,
    y: Math.sin(i / 10) * 15 + 25,
  }));

  return (
    <LineChart
      series={[
        {
          name: "Temperature",
          data: data,
        },
      ]}
      xAxis={{ label: "Time (s)", showGrid: true }}
      yAxis={{ label: "Temperature (°C)", showGrid: true }}
    />
  );
}
```

### Multi-Series

```tsx
<LineChart
  series={[
    {
      name: "Altitude",
      data: altitudeData,
      filled: true, // Fill area under curve
    },
    {
      name: "Target",
      data: targetData,
      dashed: true, // Dashed line
      strokeWidth: 2,
    },
    {
      name: "Safety Limit",
      data: safetyData,
      color: "#ef4444", // Custom color
    },
  ]}
  title="Rocket Ascent Profile"
  showLegend
/>
```

### Real-Time Streaming

```tsx
const [data, setData] = useState([]);

useEffect(() => {
  const interval = setInterval(() => {
    setData((prev) => [...prev, generateNewPoint()].slice(-100));
  }, 100);
  return () => clearInterval(interval);
}, []);

<LineChart
  series={[{ name: "Live Data", data }]}
  streaming={true}
  streamingWindowSize={100}
/>
```

### Large Dataset with Decimation

```tsx
// 10,000 points automatically decimated to 1,000 for smooth rendering
<LineChart
  series={[{ name: "Sensor Data", data: largeDataset }]}
  decimation={true}
  decimationThreshold={1000}
/>
```

### Interactive with Zoom/Pan

```tsx
<LineChart
  series={series}
  interactive={true}
  showTooltip={true}
  xAxis={{
    label: "Time (s)",
    showGrid: true,
    tickFormatter: (v) => v.toFixed(2),
  }}
  yAxis={{
    label: "Velocity (km/s)",
    showGrid: true,
    scale: "log", // Logarithmic scale
  }}
/>
```

## API Reference

### LineChartProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `series` | `LineChartSeries[]` | required | Array of data series to plot |
| `width` | `number` | `800` | Chart width in pixels |
| `height` | `number` | `400` | Chart height in pixels |
| `margin` | `object` | `{ top: 40, right: 20, bottom: 50, left: 60 }` | Chart margins |
| `xAxis` | `Axis` | `{}` | X-axis configuration |
| `yAxis` | `Axis` | `{}` | Y-axis configuration |
| `showLegend` | `boolean` | `true` | Show legend |
| `legendPosition` | `string` | `"top-right"` | Legend position |
| `interactive` | `boolean` | `true` | Enable zoom/pan interactions |
| `showTooltip` | `boolean` | `true` | Show tooltip on hover |
| `decimation` | `boolean` | `true` | Enable data decimation |
| `decimationThreshold` | `number` | `5000` | Decimation threshold (number of points) |
| `streaming` | `boolean` | `false` | Enable streaming mode |
| `streamingWindowSize` | `number` | `100` | Streaming window size |
| `title` | `string` | - | Chart title |

### LineChartSeries

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | Series name (for legend) |
| `data` | `DataPoint[]` | required | Data points `{ x: number, y: number }` |
| `color` | `string` | auto | Line color (hex) |
| `strokeWidth` | `number` | `2` | Line width in pixels |
| `dashed` | `boolean` | `false` | Dashed line style |
| `filled` | `boolean` | `false` | Fill area under curve |
| `hidden` | `boolean` | `false` | Hide series |

### Axis

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Axis label |
| `scale` | `"linear" \| "log"` | `"linear"` | Axis scale type |
| `domain` | `[number, number]` | auto | Domain [min, max] |
| `showGrid` | `boolean` | `false` | Show grid lines |
| `ticks` | `number` | `5` | Number of tick marks |
| `tickFormatter` | `(value: number) => string` | - | Custom tick formatter |

## Performance

The line chart is optimized for high-performance rendering:

- **Canvas rendering**: Uses HTML5 Canvas API for fast drawing
- **GPU acceleration**: Leverages hardware acceleration via Canvas2D
- **Smart decimation**: LTTB algorithm reduces 10k points to 1k while preserving visual shape
- **RequestAnimationFrame**: Smooth 60fps animations
- **High DPI support**: Crisp rendering on retina displays

### Benchmarks

- 100 points: ~16ms (60fps)
- 1,000 points: ~20ms (50fps)
- 10,000 points (decimated): ~25ms (40fps)
- 100,000 points (decimated): ~30ms (33fps)

## Examples

Visit the [playground](http://localhost:3000/line-chart) to see live examples:

- Basic line chart
- Multi-series with filled areas
- Large dataset (10k points) with decimation
- Real-time streaming
- Interactive zoom/pan
- Export to PNG/SVG/CSV

## Related Components

- [XY Plot](./xy-plot.md) - Scatter plots with custom markers
- [Polar Plot](./polar-plot.md) - Radar charts and rose diagrams
- [Heatmap](./heatmap.md) - 2D density visualization

## Credits

- Decimation algorithm: [Largest-Triangle-Three-Buckets (LTTB)](https://github.com/sveinn-steinarsson/flot-downsample)
- Inspired by: [Plotly](https://plotly.com/), [Chart.js](https://www.chartjs.org/), [D3.js](https://d3js.org/)
