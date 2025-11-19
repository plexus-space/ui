/**
 * Plexus UI - Charts
 *
 * High-performance WebGL/WebGPU-accelerated chart components for mission-critical
 * visualization in aerospace, medical, and industrial applications.
 *
 * @module charts
 *
 * ## Architecture
 *
 * The chart system is built on three layers:
 *
 * 1. **Base Chart Layer** (`ChartRoot`, `ChartAxes`, `ChartTooltip`)
 *    - WebGL/WebGPU renderer management with automatic fallback
 *    - Responsive sizing with devicePixelRatio support
 *    - Coordinate transformations (data space ↔ screen space)
 *    - Shared context for all chart primitives
 *
 * 2. **Component Layer** (Chart Primitives)
 *    - LineChart, BarChart, ScatterChart, AreaChart
 *    - HeatmapChart, WaterfallChart, Histogram, ControlChart
 *    - Gauge, RadarChart, AttitudeIndicator
 *    - DataGrid, GanttChart, ModelViewer
 *
 * 3. **Utility Layer** (`data-utils`, `interactions`)
 *    - Data transformation functions (downsampling, binning, FFT)
 *    - Interaction primitives (click, brush, crosshair)
 *    - Buffer management and GPU optimization
 *
 * ## Usage Patterns
 *
 * **Simple API** (Monolithic component):
 * ```tsx
 * import { LineChart } from "@plexusui/components/charts";
 *
 * <LineChart
 *   series={[{ name: "Temperature", data: telemetryData, color: "#00ff00" }]}
 *   width={800}
 *   height={400}
 *   showAxes
 *   showTooltip
 * />
 * ```
 *
 * **Composable API** (Primitive-first):
 * ```tsx
 * import { LineChart } from "@plexusui/components/charts";
 *
 * <LineChart.Root
 *   series={[{ name: "Sensor 1", data: data1, color: "#00ff00" }]}
 *   width={800}
 *   height={400}
 * >
 *   <LineChart.Canvas />
 *   <LineChart.Axes />
 *   <LineChart.Tooltip />
 * </LineChart.Root>
 * ```
 *
 * **Multi-series with Interactions**:
 * ```tsx
 * import { LineChart, ChartInteractions } from "@plexusui/components/charts";
 *
 * <LineChart.Root series={multiSeriesData}>
 *   <LineChart.Canvas />
 *   <LineChart.Axes />
 *   <ChartInteractions>
 *     <ChartInteractions.Brush onBrush={(selection) => console.log(selection)} />
 *     <ChartInteractions.Crosshair />
 *     <ChartInteractions.Click onClick={(point) => console.log(point)} />
 *   </ChartInteractions>
 * </LineChart.Root>
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

// ============================================================================
// 3D Components (Three.js)
// ============================================================================
//
// NOTE: 3D components are now in a separate entry point to optimize bundle size.
// Import them from "@plexusui/components/charts/3d" instead:
//
//   import { PointCloudViewer, ModelViewer } from "@plexusui/components/charts/3d";
//
// This prevents Three.js from being included in your main bundle if you're
// only using 2D charts.
// ============================================================================

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
  ChartBrushSelector,
  ChartCrosshair,
} from "./interactions";

export type {
  ClickEvent,
  BrushSelection,
  CrosshairPosition,
  ChartInteractionsProps,
  ChartClickProps,
  ChartBrushProps,
  ChartBrushSelectorProps,
  ChartCrosshairProps,
} from "./interactions";

// Chart annotations
export {
  ChartRuler,
  ChartReferenceLine,
  ChartReferenceLines,
  ChartTextAnnotation,
  ChartTextAnnotations,
} from "./annotations";

export type {
  Point2D,
  Measurement,
  TextAnnotation,
  ReferenceLine,
  ChartRulerProps,
  ChartReferenceLineProps,
  ChartReferenceLinesProps,
  ChartTextAnnotationProps,
  ChartTextAnnotationsProps,
} from "./annotations";

// Chart minimap
export { ChartMinimap, MinimapContainer } from "./chart-minimap";
export type {
  ChartMinimapProps,
  MinimapContainerProps,
  MinimapSeries,
} from "./chart-minimap";

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
