import React from "react";
import { useGanttTask, type GanttTaskData } from "../hooks";
import { useGanttContext } from "./Root";

/**
 * Render props data for Task component
 * @interface TaskRenderProps
 */
export interface TaskRenderProps {
  /** Position data (left and width percentages) */
  position: { left: number; width: number };
  /** Whether task is selected */
  isSelected: boolean;
  /** Whether task is visible in current window */
  isVisible: boolean;
  /** Event handlers (onClick, onMouseEnter, onMouseLeave) */
  handlers: {
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  /** Task duration in milliseconds */
  duration: number;
  /** Offset from window start in milliseconds */
  startOffset: number;
  /** Format utilities */
  formatTime: (timestamp: number) => string;
  formatDate: (timestamp: number) => string;
  formatDateTime: (timestamp: number) => string;
}

/**
 * Props for Gantt.Task component
 * @interface GanttTaskProps
 */
export interface GanttTaskProps {
  /** Task data */
  data: GanttTaskData & { label?: string; priority?: string };
  /** Currently selected task ID */
  selectedTaskId?: string;
  /** Render function for custom task display */
  children: (props: TaskRenderProps) => React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Gantt.Task - Individual task component
 *
 * Renders a single task using provided render function.
 * Handles positioning, selection state, and event handlers.
 * Completely headless - you control all rendering.
 *
 * @example
 * Basic usage:
 *
 * import * as Gantt from '@plexusui/gantt/primitives';
 *
 * <Gantt.Task data={task}>
 *   {({ position, isSelected, handlers }) => (
 *     <div
 *       className={isSelected ? 'selected' : 'default'}
 *       style={{
 *         position: 'absolute',
 *         left: `${position.left}%`,
 *         width: `${position.width}%`,
 *       }}
 *       {...handlers}
 *     >
 *       {task.label}
 *     </div>
 *   )}
 * </Gantt.Task>
 *
 * @example
 * With custom styling:
 *
 * <Gantt.Task data={task}>
 *   {({ position, isSelected, duration, formatTime }) => (
 *     <div
 *       className="task-bar"
 *       style={{
 *         left: `${position.left}%`,
 *         width: `${position.width}%`,
 *         backgroundColor: isSelected ? 'blue' : 'gray',
 *       }}
 *       onClick={() => console.log('Duration:', duration)}
 *     >
 *       <span>{task.label}</span>
 *       <span className="time">
 *         {formatTime(task.startTime)} - {formatTime(task.endTime)}
 *       </span>
 *     </div>
 *   )}
 * </Gantt.Task>
 */
export const GanttTask = React.forwardRef<HTMLDivElement, GanttTaskProps>(
  ({ data, selectedTaskId, children, className, style }, ref) => {
    const context = useGanttContext();

    const {
      position,
      isVisible,
      isSelected,
      handlers,
      duration,
      startOffset,
      formatTime,
      formatDate,
      formatDateTime,
    } = useGanttTask({
      task: data,
      timeWindowStart: context.timeWindow.start,
      timeWindowEnd: context.timeWindow.end,
      selectedTaskId,
      onTaskClick: context.onTaskClick,
    });

    // Don't render if not visible
    if (!isVisible) {
      return null;
    }

    const renderProps: TaskRenderProps = {
      position,
      isSelected,
      isVisible,
      handlers,
      duration,
      startOffset,
      formatTime,
      formatDate,
      formatDateTime,
    };

    return (
      <div ref={ref} className={className} style={style}>
        {children(renderProps)}
      </div>
    );
  }
);

GanttTask.displayName = "Gantt.Task";
