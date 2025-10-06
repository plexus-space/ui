import { useMemo, useCallback } from "react";
import { useGanttTimeline, type GanttTaskData } from "./useGanttTimeline";

/**
 * Options for useGanttTask hook
 * @interface UseGanttTaskOptions
 */
export interface UseGanttTaskOptions {
  /** Task data to manage */
  task: GanttTaskData;
  /** Start of the time window (timestamp in ms) */
  timeWindowStart: number;
  /** End of the time window (timestamp in ms) */
  timeWindowEnd: number;
  /** Currently selected task ID (optional) */
  selectedTaskId?: string;
  /** Callback when task is clicked (optional) */
  onTaskClick?: (taskId: string) => void;
  /** Callback when task is hovered (optional) */
  onTaskHover?: (taskId: string | null) => void;
}

/**
 * useGanttTask - Individual task logic hook
 *
 * Manages state and positioning for a single task.
 * Provides positioning, selection state, and event handlers.
 *
 * @example
 * Basic usage:
 *
 * import { useGanttTask } from '@plexusui/gantt/hooks';
 *
 * function TaskBar({ task, timeWindowStart, timeWindowEnd }) {
 *   const {
 *     position,
 *     isVisible,
 *     isSelected,
 *     handlers,
 *     duration,
 *   } = useGanttTask({
 *     task,
 *     timeWindowStart,
 *     timeWindowEnd,
 *     onTaskClick: (id) => console.log('Clicked:', id),
 *   });
 *
 *   if (!isVisible) return null;
 *
 *   return (
 *     <div
 *       style={{
 *         left: `${position.left}%`,
 *         width: `${position.width}%`,
 *         background: isSelected ? 'blue' : 'gray',
 *       }}
 *       {...handlers}
 *     >
 *       {task.label}
 *     </div>
 *   );
 * }
 *
 * @param options - Configuration for the task
 * @returns Task state and utilities
 */
export function useGanttTask(options: UseGanttTaskOptions) {
  const {
    task,
    timeWindowStart,
    timeWindowEnd,
    selectedTaskId,
    onTaskClick,
    onTaskHover,
  } = options;

  // Get timeline utilities
  const timeline = useGanttTimeline({
    timeWindowStart,
    timeWindowEnd,
  });

  // Calculate position
  const position = useMemo(
    () => timeline.getTaskPosition(task),
    [timeline, task]
  );

  // Check visibility
  const isVisible = useMemo(
    () => timeline.isTaskVisible(task),
    [timeline, task]
  );

  // Check if selected
  const isSelected = useMemo(
    () => selectedTaskId === task.id,
    [selectedTaskId, task.id]
  );

  // Calculate duration
  const duration = useMemo(
    () => task.endTime - task.startTime,
    [task.startTime, task.endTime]
  );

  // Calculate start offset from window start
  const startOffset = useMemo(
    () => task.startTime - timeWindowStart,
    [task.startTime, timeWindowStart]
  );

  // Click handler
  const handleClick = useCallback(() => {
    if (onTaskClick) {
      onTaskClick(task.id);
    }
  }, [onTaskClick, task.id]);

  // Hover handlers
  const handleMouseEnter = useCallback(() => {
    if (onTaskHover) {
      onTaskHover(task.id);
    }
  }, [onTaskHover, task.id]);

  const handleMouseLeave = useCallback(() => {
    if (onTaskHover) {
      onTaskHover(null);
    }
  }, [onTaskHover]);

  // Combined event handlers
  const handlers = useMemo(
    () => ({
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    }),
    [handleClick, handleMouseEnter, handleMouseLeave]
  );

  return {
    // Positioning
    position,
    isVisible,

    // State
    isSelected,

    // Handlers
    handlers,
    onClick: handleClick,
    onHover: handleMouseEnter,

    // Metadata
    duration,
    startOffset,

    // Timeline utilities (pass-through)
    formatTime: timeline.formatTime,
    formatDate: timeline.formatDate,
    formatDateTime: timeline.formatDateTime,
  };
}
