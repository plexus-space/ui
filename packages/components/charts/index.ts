/**
 * Plexus UI - Charts
 *
 * High-level composable chart components built on WebGPU primitives.
 * Use these for mission-critical visualization in aerospace, medical,
 * and defense applications.
 *
 * @example
 * ```tsx
 * import { WaveformMonitor, GanttChart } from "@plexusui/components/charts";
 * ```
 */

/**
 * Waveform Monitor - High-performance multi-trace waveform display
 * Renders 10,000+ points per trace at 60fps with WebGPU acceleration
 * Use cases: ECG, SpO2, aerospace telemetry, defense applications
 */
export {
  WaveformMonitor,
  type WaveformMonitorProps,
  type WaveformTrace,
  type WaveformMonitorRootProps,
  type WaveformMonitorContainerProps,
  type WaveformMonitorCanvasProps,
  type WaveformMonitorTracesProps,
  type WaveformMonitorOverlayProps,
  type WaveformMonitorMetricsProps,
} from "./waveform-monitor";

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
