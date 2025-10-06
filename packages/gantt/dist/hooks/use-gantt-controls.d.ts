/**
 * Configuration for Gantt chart controls
 */
export interface GanttControlsConfig {
    /** Initial time window start (Unix timestamp in ms). Defaults to now. */
    initialStart?: number;
    /** Duration of the time window in milliseconds. Default: 12 hours */
    windowDuration?: number;
    /** Timezone offset in hours from UTC. Default: local timezone */
    timezoneOffset?: number;
    /** Step size for navigation in milliseconds. Default: 1 hour */
    navigationStep?: number;
    /** Minimum zoom level (minimum window duration in ms). Default: 1 hour */
    minZoom?: number;
    /** Maximum zoom level (maximum window duration in ms). Default: 7 days */
    maxZoom?: number;
}
/**
 * Hook for managing Gantt chart controls including timezone, scrolling, and navigation
 *
 * @example
 * ```tsx
 * const controls = useGanttControls({
 *   windowDuration: 24 * 60 * 60 * 1000, // 24 hours
 *   timezoneOffset: -5 // EST
 * });
 *
 * return (
 *   <div>
 *     <GanttControlBar {...controls} />
 *     <Gantt
 *       timeWindowStart={controls.windowStart}
 *       timeWindowDuration={controls.windowDuration}
 *     />
 *   </div>
 * );
 * ```
 */
export declare function useGanttControls(config?: GanttControlsConfig): {
    windowStart: number;
    windowDuration: number;
    timezoneOffset: number;
    adjustedWindowStart: number;
    navigateForward: () => void;
    navigateBackward: () => void;
    jumpToNow: () => void;
    jumpToTime: (timestamp: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    setZoom: (newDuration: number) => void;
    changeTimezone: (offsetHours: number) => void;
    toTimezoneTime: (timestamp: number) => number;
    handlePanStart: (clientX: number) => void;
    handlePanMove: (clientX: number, containerWidth: number) => void;
    handlePanEnd: () => void;
    isDragging: boolean;
    handleWheel: (event: WheelEvent, isShiftPressed: boolean) => void;
    setWindowStart: import("react").Dispatch<import("react").SetStateAction<number>>;
    setWindowDuration: import("react").Dispatch<import("react").SetStateAction<number>>;
};
export type GanttControls = ReturnType<typeof useGanttControls>;
