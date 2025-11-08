/**
 * Plexus UI - Charts
 *
 * High-level composable chart components built on WebGPU primitives.
 * Use these for mission-critical visualization in aerospace, medical,
 * and defense applications.
 */

/**
 * Gantt Chart - Mission timeline and task scheduling visualization
 * Features: Resource allocation, priority levels, interactive timeline
 * Use cases: Satellite pass planning, mission control, operations scheduling
 */
export {
  GanttChart,
  type TaskStatus,
  type Task,
  type GanttChartRootProps,
  type GanttChartContainerProps,
  type GanttChartViewportProps,
  type GanttChartGridProps,
  type GanttChartHeaderProps,
  type GanttChartTasksProps,
  type GanttChartCurrentTimeProps,
  type GanttChartLeftPanelProps,
  type GanttChartControlsProps,
} from "./gantt-chart";

/**
 * Time Series Chart - High-performance time-based data visualization
 * Features: Timezone support, multi-series, WebGPU acceleration
 * Use cases: Telemetry, sensor data, system metrics
 */
export {
  TimeSeriesChart,
  type TimeSeriesDataPoint,
  type TimeSeries,
  type TimeSeriesChartProps,
} from "./time-series-chart";

/**
 * Line Chart - Versatile chart for any data series
 * Features: Lines, scatter, and area modes, auto-scaling
 * Use cases: General data visualization, scientific plots
 */
export {
  LineChart,
  type Series,
  type SeriesType,
  type LineChartProps,
} from "./line-chart";
