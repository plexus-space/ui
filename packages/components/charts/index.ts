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
  LineChartRootProps,
  LineChartCanvasProps,
} from "./line-chart";

export { ScatterChart } from "./scatter-chart";
export type {
  DataPoint as ScatterDataPoint,
  Series as ScatterSeries,
  ScatterChartProps,
  ScatterChartRootProps,
  ScatterChartCanvasProps,
} from "./scatter-chart";

export { BarChart } from "./bar-chart";
export type {
  DataPoint as BarDataPoint,
  Series as BarSeries,
  BarChartProps,
  BarChartRootProps,
  BarChartCanvasProps,
} from "./bar-chart";

export { AreaChart } from "./area-chart";
export type {
  DataPoint as AreaDataPoint,
  Series as AreaSeries,
  AreaChartProps,
  AreaChartRootProps,
  AreaChartCanvasProps,
} from "./area-chart";

export { HeatmapChart } from "./heatmap-chart";
export type {
  DataPoint as HeatmapDataPoint,
  HeatmapChartProps,
  HeatmapChartRootProps,
  HeatmapChartLegendProps,
} from "./heatmap-chart";

export { HistogramChart } from "./histogram-chart";
export type { HistogramChartProps } from "./histogram-chart";

export {
  ControlChart,
  calculateControlLimits,
  generateSPCData,
} from "./control-chart";
export type {
  ControlChartProps,
  ControlLimits,
  ControlViolation,
} from "./control-chart";

export { Gauge } from "./gauge";
export type { Zone, GaugeProps } from "./gauge";

export { RadarChart } from "./radar-chart";
export type {
  RadarDataPoint,
  RadarSeries,
  RadarChartProps,
} from "./radar-chart";

export { StatusGrid, Sparkline } from "./status-grid";
export type {
  StatusLevel,
  KPIMetric,
  StatusGridProps,
  StatusGridRootProps,
  SparklineProps,
} from "./status-grid";

export { DataGrid } from "./data-grid";
export type {
  ColumnAlignment,
  ColumnType,
  Column,
  DataGridProps,
} from "./data-grid";

export { AttitudeIndicator } from "./attitude-indicator";
export type { AttitudeIndicatorProps } from "./attitude-indicator";

export { GanttChart } from "./gantt";
export type {
  Task,
  TaskStatus,
  GanttChartRootProps,
  GanttChartContainerProps,
  GanttChartViewportProps,
  GanttChartGridProps,
  GanttChartHeaderProps,
  GanttChartTasksProps,
  GanttChartCurrentTimeProps,
  GanttChartLeftPanelProps,
  GanttChartControlsProps,
} from "./gantt";

export { WaterfallChart } from "./waterfall-chart";
export type {
  WaterfallChartProps,
  SpectrogramPoint,
  WindowFunction,
} from "./waterfall-chart";

// Base chart infrastructure (reusable for all chart types)
export {
  ChartRoot,
  ChartAxes,
  ChartTooltip,
  useBaseChart,
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
  WebGLRenderer,
  WebGPURenderer,
} from "./base-chart";

// Chart interactions
export {
  ChartInteractions,
  ChartClick,
  ChartBrush,
  ChartCrosshair,
} from "./interactions";

export type {
  ClickEvent,
  BrushSelection,
  CrosshairPosition,
  ChartInteractionsProps,
  ChartClickProps,
  ChartBrushProps,
  ChartCrosshairProps,
} from "./interactions";

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
  createHistogramBins,
  calculateBinCount,
  calculateNormalCurve,
  // FFT utilities for waterfall/spectrogram charts
  fft,
  applyWindow,
  fftToPowerSpectrum,
  powerToDb,
  generateSpectrogram,
  nextPowerOf2,
  zeroPad,
  type BinMethod,
  type HistogramBin,
  type Complex,
  type SpectrogramPoint as DataSpectrogramPoint,
} from "../lib/data-utils";
