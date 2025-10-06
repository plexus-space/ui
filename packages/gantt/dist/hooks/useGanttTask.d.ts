import { type GanttTaskData } from "./useGanttTimeline";
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
export declare function useGanttTask(options: UseGanttTaskOptions): {
    position: import("./useGanttTimeline").TaskPosition;
    isVisible: boolean;
    isSelected: boolean;
    handlers: {
        onClick: () => void;
        onMouseEnter: () => void;
        onMouseLeave: () => void;
    };
    onClick: () => void;
    onHover: () => void;
    duration: number;
    startOffset: number;
    formatTime: (timestamp: number) => string;
    formatDate: (timestamp: number) => string;
    formatDateTime: (timestamp: number) => string;
};
