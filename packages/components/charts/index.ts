/**
 * Plexus UI - Charts
 *
 * High-performance WebGPU-accelerated chart components for mission-critical
 * visualization in aerospace, medical, and defense applications.
 *
 * @module charts
 *
 * ## Architecture
 *
 * The chart system is built on three layers:
 *
 * 1. **Container Layer** (`Chart.Container`)
 *    - WebGPU device/context management
 *    - Responsive sizing with devicePixelRatio support
 *    - Layer-based rendering pipeline
 *    - Coordinate transformations (data space ↔ clip space)
 *
 * 2. **Component Layer** (`LineChart`, `BarChart`, etc.)
 *    - Reusable chart primitives
 *    - Automatic data optimization (downsampling, buffering)
 *    - Type-safe data interfaces
 *
 * 3. **Utility Layer** (`data-utils`)
 *    - Data transformation functions
 *    - Buffer management
 *    - Downsampling algorithms (LTTB, min-max)
 *
 * ## Usage
 *
 * @example Basic Line Chart
 * ```tsx
 * import { Chart, LineChart } from "@/components/charts";
 *
 * <Chart.Container width={800} height={400} xMin={0} xMax={100} yMin={0} yMax={100}>
 *   <Chart.Grid />
 *   <LineChart data={telemetryData} color="#00ff00" />
 *   <Chart.XAxis label="Time (s)" />
 *   <Chart.YAxis label="Value" />
 * </Chart.Container>
 * ```
 *
 * @example Multi-series Chart
 * ```tsx
 * <Chart.Container width="100%" height={400}>
 *   <Chart.Grid />
 *   <LineChart data={series1} color="#00ff00" id="series-1" />
 *   <LineChart data={series2} color="#0088ff" id="series-2" />
 *   <Chart.XAxis />
 *   <Chart.YAxis />
 * </Chart.Container>
 * ```
 *
 * @example Bar Chart
 * ```tsx
 * import { BarChart } from "@/components/charts";
 *
 * <Chart.Container>
 *   <BarChart data={[
 *     { category: "A", value: 75 },
 *     { category: "B", value: 50 }
 *   ]} color="#0088ff" />
 * </Chart.Container>
 * ```
 */

// Chart components
export { LineChart } from "./line-chart";
export type {
  DataPoint as LineDataPoint,
  Series as LineSeries,
  LineChartProps,
} from "./line-chart";

export { ScatterChart } from "./scatter-chart";
export type {
  DataPoint as ScatterDataPoint,
  Series as ScatterSeries,
  ScatterChartProps,
} from "./scatter-chart";

export { BarChart } from "./bar-chart";
export type {
  DataPoint as BarDataPoint,
  Series as BarSeries,
  BarChartProps,
} from "./bar-chart";

export { AreaChart } from "./area-chart";
export type {
  DataPoint as AreaDataPoint,
  Series as AreaSeries,
  AreaChartProps,
} from "./area-chart";

export { HeatmapChart } from "./heatmap-chart";
export type {
  DataPoint as HeatmapDataPoint,
  HeatmapChartProps,
} from "./heatmap-chart";

// Base chart infrastructure (reusable for all chart types)
export {
  ChartRoot,
  ChartAxes,
  ChartTooltip,
  ChartLegend,
  TimeSeriesControls,
  useBaseChart,
  BaseWebGLRenderer,
  BaseWebGPURenderer,
  getDomain,
  getTicks,
  formatValue,
  hexToRgb,
} from "./base-chart";
export type {
  Point,
  Axis,
  Margin,
  HoveredPoint,
  TooltipData,
  TimeSeriesState,
  BaseChartContext,
  BaseChartRootProps,
  RendererProps,
} from "./base-chart";

// Data utilities
export {
  calculateBounds,
  calculateNiceBounds,
  createOrResizeVertexBuffer,
  data3DToVertexArray,
  dataToVertexArray,
  downsampleLTTB,
  downsampleMinMax,
  generateCategoricalData,
  generateSineWave,
  generateTelemetryData,
  normalizeData,
  StreamingBuffer,
} from "./data-utils";
