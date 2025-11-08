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
