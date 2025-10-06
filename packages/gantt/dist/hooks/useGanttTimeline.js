import { useMemo } from "react";
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
export function useGanttTimeline(options) {
    const { timeWindowStart, timeWindowEnd, divisions = 12 } = options;
    const timeWindow = useMemo(() => ({
        start: timeWindowStart,
        end: timeWindowEnd,
        duration: timeWindowEnd - timeWindowStart,
    }), [timeWindowStart, timeWindowEnd]);
    /**
     * Get timestamp for a specific division index
     */
    const getDivisionTimestamp = useMemo(() => (index) => {
        const step = timeWindow.duration / divisions;
        return timeWindow.start + step * index;
    }, [timeWindow, divisions]);
    /**
     * Get all division timestamps
     */
    const divisionTimestamps = useMemo(() => {
        return Array.from({ length: divisions + 1 }, (_, i) => getDivisionTimestamp(i));
    }, [divisions, getDivisionTimestamp]);
    /**
     * Convert time to percentage position (0-100)
     */
    const timeToPercent = useMemo(() => (timestamp) => {
        const offset = timestamp - timeWindow.start;
        const percent = (offset / timeWindow.duration) * 100;
        return Math.max(0, Math.min(100, percent));
    }, [timeWindow]);
    /**
     * Convert percentage position to timestamp
     */
    const percentToTime = useMemo(() => (percent) => {
        return timeWindow.start + (timeWindow.duration * percent) / 100;
    }, [timeWindow]);
    /**
     * Get position for a task (left and width as percentages)
     */
    const getTaskPosition = useMemo(() => (task) => {
        const left = timeToPercent(task.startTime);
        const right = timeToPercent(task.endTime);
        const width = right - left;
        return {
            left: Math.max(0, left),
            width: Math.max(0.5, width), // Minimum 0.5% width for visibility
        };
    }, [timeToPercent]);
    /**
     * Check if a task is visible in the current time window
     */
    const isTaskVisible = useMemo(() => (task) => {
        // Task is visible if it overlaps with the time window at all
        return (task.endTime >= timeWindow.start && task.startTime <= timeWindow.end);
    }, [timeWindow]);
    /**
     * Get the width of a task in pixels (given container width)
     */
    const getTaskWidth = useMemo(() => (task, containerWidth) => {
        const position = getTaskPosition(task);
        return (position.width / 100) * containerWidth;
    }, [getTaskPosition]);
    /**
     * Format timestamp as HH:MM
     */
    const formatTime = useMemo(() => (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }, []);
    /**
     * Format timestamp as date
     */
    const formatDate = useMemo(() => (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    }, []);
    /**
     * Format timestamp as date and time
     */
    const formatDateTime = useMemo(() => (timestamp) => {
        return new Date(timestamp).toLocaleString();
    }, []);
    return {
        // Time window info
        timeWindow,
        divisions,
        divisionTimestamps,
        // Division utilities
        getDivisionTimestamp,
        // Task positioning
        getTaskPosition,
        getTaskWidth,
        isTaskVisible,
        // Conversion utilities
        timeToPercent,
        percentToTime,
        // Formatting utilities
        formatTime,
        formatDate,
        formatDateTime,
    };
}
