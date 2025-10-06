/**
 * Options for useGanttTimeline hook
 * @interface UseGanttTimelineOptions
 */
export interface UseGanttTimelineOptions {
    /** Start of the time window (timestamp in ms) */
    timeWindowStart: number;
    /** End of the time window (timestamp in ms) */
    timeWindowEnd: number;
    /** Number of time divisions to show (default: 12) */
    divisions?: number;
}
/**
 * Task position information
 * @interface TaskPosition
 */
export interface TaskPosition {
    /** Left position as percentage (0-100) */
    left: number;
    /** Width as percentage (0-100) */
    width: number;
}
/**
 * Task data for positioning calculations
 * @interface GanttTaskData
 */
export interface GanttTaskData {
    /** Task unique identifier */
    id: string;
    /** Task start time (timestamp in ms) */
    startTime: number;
    /** Task end time (timestamp in ms) */
    endTime: number;
}
/**
 * useGanttTimeline - Core timeline logic hook
 *
 * Provides headless logic for time calculations, task positioning,
 * and visibility detection. No UI or styling included.
 *
 * @example
 * Basic usage:
 *
 * import { useGanttTimeline } from '@plexusui/gantt/hooks';
 *
 * function MyGantt() {
 *   const timeline = useGanttTimeline({
 *     timeWindowStart: Date.now(),
 *     timeWindowEnd: Date.now() + 12 * 60 * 60 * 1000,
 *     divisions: 12,
 *   });
 *
 *   const position = timeline.getTaskPosition(task);
 *   const visible = timeline.isTaskVisible(task);
 *
 *   return (
 *     <div style={{ left: `${position.left}%`, width: `${position.width}%` }}>
 *       {task.label}
 *     </div>
 *   );
 * }
 *
 * @param options - Configuration for the timeline
 * @returns Timeline utilities and calculations
 */
export declare function useGanttTimeline(options: UseGanttTimelineOptions): {
    timeWindow: {
        start: number;
        end: number;
        duration: number;
    };
    divisions: number;
    divisionTimestamps: number[];
    getDivisionTimestamp: (index: number) => number;
    getTaskPosition: (task: GanttTaskData) => TaskPosition;
    getTaskWidth: (task: GanttTaskData, containerWidth: number) => number;
    isTaskVisible: (task: GanttTaskData) => boolean;
    timeToPercent: (timestamp: number) => number;
    percentToTime: (percent: number) => number;
    formatTime: (timestamp: number) => string;
    formatDate: (timestamp: number) => string;
    formatDateTime: (timestamp: number) => string;
};
