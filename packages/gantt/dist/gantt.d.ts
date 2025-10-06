/**
 * Represents a single task in the Gantt chart.
 * Tasks are rendered as horizontal bars within a group row.
 *
 * @example
 * ```tsx
 * const task: GanttTask = {
 *   id: "task-1",
 *   label: "Mission Launch",
 *   sublabel: "Phase 1",
 *   startTime: Date.now(),
 *   endTime: Date.now() + 3600000, // 1 hour later
 *   priority: "critical",
 *   color: "bg-red-500"
 * };
 * ```
 */
export interface GanttTask {
    /** Unique identifier for the task */
    id: string;
    /** Display name shown on the task bar */
    label: string;
    /** Optional secondary text displayed below the label */
    sublabel?: string;
    /** Task start time as Unix timestamp (milliseconds since epoch) */
    startTime: number;
    /** Task end time as Unix timestamp (milliseconds since epoch) */
    endTime: number;
    /** Custom Tailwind CSS color class (e.g., "bg-red-500"). Overrides priority colors. */
    color?: string;
    /** Task priority level, determines default color if no custom color is set */
    priority?: "critical" | "high" | "medium" | "low";
    /** Additional custom data attached to the task */
    metadata?: Record<string, any>;
}
/**
 * Represents a group of tasks displayed as a single row in the Gantt chart.
 * Each group has a label and contains multiple tasks.
 *
 * @example
 * ```tsx
 * const group: GanttGroup = {
 *   id: "group-1",
 *   label: "Mission Control",
 *   sublabel: "Primary Team",
 *   tasks: [
 *     {
 *       id: "task-1",
 *       label: "Pre-launch",
 *       startTime: Date.now(),
 *       endTime: Date.now() + 3600000,
 *     }
 *   ]
 * };
 * ```
 */
export interface GanttGroup {
    /** Unique identifier for the group */
    id: string;
    /** Display name shown in the left column */
    label: string;
    /** Optional secondary text displayed below the label */
    sublabel?: string;
    /** Array of tasks to display in this group's timeline */
    tasks: GanttTask[];
}
/**
 * Props for the GanttTimelineRoot primitive component.
 * This is the core building block for rendering task timelines.
 *
 * @example
 * ```tsx
 * <GanttTimelineRoot
 *   group={{
 *     id: "crew-1",
 *     label: "Alpha Team",
 *     tasks: [{
 *       id: "t1",
 *       label: "Launch Prep",
 *       startTime: Date.now(),
 *       endTime: Date.now() + 7200000
 *     }]
 *   }}
 *   timeWindowStart={Date.now()}
 *   timeWindowEnd={Date.now() + 43200000}
 *   divisions={12}
 * />
 * ```
 */
export interface GanttTimelineRootProps {
    /** The group containing tasks to display in this timeline row */
    group: GanttGroup;
    /** Start of the visible time window (Unix timestamp in milliseconds) */
    timeWindowStart: number;
    /** End of the visible time window (Unix timestamp in milliseconds) */
    timeWindowEnd: number;
    /** Number of vertical grid divisions to display (default: 12) */
    divisions?: number;
    /** ID of the currently selected task (highlights with a ring) */
    selectedTaskId?: string;
    /** Callback fired when a task bar is clicked, receives the task ID */
    onTaskClick?: (taskId: string) => void;
    /** Custom Tailwind color classes for priority levels */
    priorityColors?: Record<string, string>;
}
/**
 * GanttTimelineRoot - A primitive component for rendering a single timeline row.
 *
 * This is a low-level building block that renders one group's tasks as horizontal
 * bars positioned along a time axis. Use this when building custom Gantt layouts.
 *
 * **Key Features:**
 * - Automatic time-based positioning of task bars
 * - Grid lines for visual alignment
 * - Hover and selection states
 * - Tasks outside the time window are automatically hidden
 *
 * **Time Window Concept:**
 * The time window defines what portion of time is visible. Tasks are positioned
 * relative to this window. For example, if your window spans 12 hours, a task
 * that starts 6 hours into the window will appear at the 50% mark.
 *
 * @example
 * ```tsx
 * // Minimal usage - show a single task
 * const now = Date.now();
 * const oneHourLater = now + 3600000;
 *
 * <GanttTimelineRoot
 *   group={{
 *     id: "ops",
 *     label: "Operations",
 *     tasks: [{
 *       id: "t1",
 *       label: "Deploy",
 *       startTime: now,
 *       endTime: oneHourLater
 *     }]
 *   }}
 *   timeWindowStart={now}
 *   timeWindowEnd={now + 7200000}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With priority colors and selection
 * <GanttTimelineRoot
 *   group={myGroup}
 *   timeWindowStart={windowStart}
 *   timeWindowEnd={windowEnd}
 *   selectedTaskId="task-123"
 *   onTaskClick={(id) => console.log("Clicked:", id)}
 *   priorityColors={{
 *     critical: "bg-red-600",
 *     high: "bg-orange-500"
 *   }}
 * />
 * ```
 */
export declare const GanttTimelineRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GanttTimelineRootProps & import("react").RefAttributes<HTMLDivElement>>>;
/**
 * Props for the GanttHeaderRoot primitive component.
 * Defines the time axis labels displayed above the timeline.
 *
 * @example
 * ```tsx
 * <GanttHeaderRoot
 *   timeWindowStart={Date.now()}
 *   timeWindowEnd={Date.now() + 43200000}
 *   divisions={12}
 *   leftLabel="Teams"
 *   formatTime={(ts) => new Date(ts).toLocaleTimeString()}
 * />
 * ```
 */
export interface GanttHeaderRootProps {
    /** Start of the visible time window (Unix timestamp in milliseconds) */
    timeWindowStart: number;
    /** End of the visible time window (Unix timestamp in milliseconds) */
    timeWindowEnd: number;
    /** Number of time divisions to display (default: 12) */
    divisions?: number;
    /** Text label for the left column header (default: "Item") */
    leftLabel?: string;
    /** Custom formatter for time labels. Receives timestamp, returns string. */
    formatTime?: (timestamp: number) => string;
}
/**
 * GanttHeaderRoot - A primitive component for rendering the time axis header.
 *
 * Displays time labels across the top of the Gantt chart, showing the divisions
 * of the time window. Use this primitive when building custom chart layouts.
 *
 * **Key Features:**
 * - Automatically calculates time divisions
 * - Customizable time formatting
 * - Aligns with GanttTimelineRoot grid divisions
 *
 * @example
 * ```tsx
 * // Basic usage with default formatting
 * <GanttHeaderRoot
 *   timeWindowStart={Date.now()}
 *   timeWindowEnd={Date.now() + 43200000}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Custom time formatting
 * import { GanttUtils } from './gantt';
 *
 * <GanttHeaderRoot
 *   timeWindowStart={windowStart}
 *   timeWindowEnd={windowEnd}
 *   divisions={24}
 *   leftLabel="Mission Teams"
 *   formatTime={GanttUtils.formatHHMM}
 * />
 * ```
 */
export declare const GanttHeaderRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GanttHeaderRootProps & import("react").RefAttributes<HTMLDivElement>>>;
/**
 * Props for the GanttCurrentTimeMarkerRoot primitive component.
 * Renders a vertical indicator line for the current time.
 *
 * @example
 * ```tsx
 * <GanttCurrentTimeMarkerRoot
 *   currentTime={Date.now()}
 *   timeWindowStart={windowStart}
 *   timeWindowEnd={windowEnd}
 *   label="Now"
 * />
 * ```
 */
export interface GanttCurrentTimeMarkerRootProps {
    /** The current time to mark (Unix timestamp in milliseconds) */
    currentTime: number;
    /** Start of the visible time window (Unix timestamp) */
    timeWindowStart: number;
    /** End of the visible time window (Unix timestamp) */
    timeWindowEnd: number;
    /** Text label displayed above the marker line (default: "Now") */
    label?: string;
    /** Tailwind CSS border color class for the marker (default: "border-pink-500") */
    color?: string;
}
/**
 * GanttCurrentTimeMarkerRoot - A primitive component for rendering a "current time" indicator.
 *
 * Displays a vertical line overlaid on the timeline to mark a specific moment,
 * typically "now". The marker is automatically positioned based on the time window
 * and hidden if outside the visible range.
 *
 * **Key Features:**
 * - Automatic positioning within time window
 * - Auto-hides when outside visible range
 * - Customizable label and color
 *
 * @example
 * ```tsx
 * // Show current time marker
 * <GanttCurrentTimeMarkerRoot
 *   currentTime={Date.now()}
 *   timeWindowStart={windowStart}
 *   timeWindowEnd={windowEnd}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Custom label and color
 * <GanttCurrentTimeMarkerRoot
 *   currentTime={deploymentTime}
 *   timeWindowStart={windowStart}
 *   timeWindowEnd={windowEnd}
 *   label="Deploy"
 *   color="border-green-500"
 * />
 * ```
 */
export declare const GanttCurrentTimeMarkerRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GanttCurrentTimeMarkerRootProps & import("react").RefAttributes<HTMLDivElement>>>;
/**
 * Props for the GanttScene container component.
 * Wraps Gantt content with consistent styling and chrome.
 *
 * @example
 * ```tsx
 * <GanttScene title="Mission Timeline" controls={<button>Export</button>}>
 *   <GanttHeaderRoot {...headerProps} />
 *   <GanttTimelineRoot {...timelineProps} />
 * </GanttScene>
 * ```
 */
export interface GanttSceneProps {
    /** Title displayed in the chart header */
    title?: string;
    /** Additional React elements (buttons, controls) shown in the header */
    controls?: React.ReactNode;
    /** Child elements to render inside the chart container */
    children?: React.ReactNode;
    /** Additional Tailwind classes for custom styling */
    className?: string;
}
/**
 * GanttScene - A primitive container component providing consistent chart styling.
 *
 * Wraps your Gantt primitives with a dark-themed container, header bar, and padding.
 * Use this when building custom Gantt layouts from primitives.
 *
 * **Key Features:**
 * - Dark aerospace theme styling
 * - Header with title and controls area
 * - Relative positioning for overlays
 *
 * @example
 * ```tsx
 * // Basic container
 * <GanttScene title="Flight Operations">
 *   <GanttHeaderRoot {...props} />
 *   <GanttTimelineRoot {...props} />
 * </GanttScene>
 * ```
 *
 * @example
 * ```tsx
 * // With custom controls
 * <GanttScene
 *   title="Mission Control"
 *   controls={
 *     <>
 *       <button>Zoom In</button>
 *       <button>Export</button>
 *     </>
 *   }
 * >
 *   {children}
 * </GanttScene>
 * ```
 */
export declare const GanttScene: import("react").ForwardRefExoticComponent<GanttSceneProps & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Props for the main Gantt component.
 * The composed component requires only a groups array to function.
 *
 * @example
 * ```tsx
 * // Minimal example - just one group with one task
 * const groups = [{
 *   id: "1",
 *   label: "Team Alpha",
 *   tasks: [{
 *     id: "t1",
 *     label: "Launch",
 *     startTime: Date.now(),
 *     endTime: Date.now() + 3600000
 *   }]
 * }];
 *
 * <Gantt groups={groups} />
 * ```
 */
export interface GanttProps {
    /** Array of groups, each containing tasks. Minimum: one group with one task. */
    groups: GanttGroup[];
    /** Start of the visible time window in Unix timestamp (ms). Defaults to current time. */
    timeWindowStart?: number;
    /** Duration of the time window in milliseconds. Defaults to 12 hours (43200000ms). */
    timeWindowDuration?: number;
    /** Number of vertical grid divisions to display. Default: 12. */
    divisions?: number;
    /** Chart title shown in the header. Default: "Timeline". */
    title?: string;
    /** Label for the left column header. Default: "Item". */
    leftLabel?: string;
    /** ID of the currently selected task (shows highlight ring). */
    selectedTaskId?: string;
    /** Callback fired when any task is clicked, receives task ID. */
    onTaskClick?: (taskId: string) => void;
    /** Whether to show the "Now" marker line. Default: true. */
    showCurrentTime?: boolean;
    /** Additional controls or buttons to render in the header. */
    controls?: React.ReactNode;
    /** Custom time formatter function. Receives timestamp, returns string. */
    formatTime?: (timestamp: number) => string;
    /** Custom Tailwind color classes for priority levels. */
    priorityColors?: Record<string, string>;
}
export declare const Gantt: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GanttProps & import("react").RefAttributes<HTMLDivElement>>>;
/**
 * GanttUtils - Utility functions for working with Gantt charts.
 *
 * Provides helpers for time calculations and formatting. Use these when you need
 * custom time windows or formatters.
 *
 * @example
 * ```tsx
 * import { Gantt, GanttUtils } from './gantt';
 *
 * // Get a time window for the next 24 hours
 * const { start, end } = GanttUtils.getTimeWindow(24 * 60 * 60 * 1000);
 *
 * // Use custom time formatter
 * <Gantt
 *   groups={groups}
 *   timeWindowStart={start}
 *   timeWindowDuration={end - start}
 *   formatTime={GanttUtils.formatHHMM}
 * />
 * ```
 */
export declare const GanttUtils: {
    /**
     * Get a time window starting from now.
     * Returns an object with start and end timestamps.
     *
     * @param durationMs - Duration of the window in milliseconds
     * @returns Object with start and end timestamps
     *
     * @example
     * ```tsx
     * const { start, end } = GanttUtils.getTimeWindow(12 * 60 * 60 * 1000); // 12 hours
     * ```
     */
    getTimeWindow: (durationMs: number) => {
        start: number;
        end: number;
    };
    /**
     * Format timestamp as HH:MM (24-hour format with leading zeros).
     *
     * @param timestamp - Unix timestamp in milliseconds
     * @returns Formatted time string (e.g., "14:30")
     *
     * @example
     * ```tsx
     * <Gantt formatTime={GanttUtils.formatHHMM} />
     * ```
     */
    formatHHMM: (timestamp: number) => string;
    /**
     * Format timestamp as a localized date string.
     *
     * @param timestamp - Unix timestamp in milliseconds
     * @returns Formatted date string (e.g., "10/5/2025")
     *
     * @example
     * ```tsx
     * <Gantt formatTime={GanttUtils.formatDate} />
     * ```
     */
    formatDate: (timestamp: number) => string;
    /**
     * Format timestamp as a localized date and time string.
     *
     * @param timestamp - Unix timestamp in milliseconds
     * @returns Formatted date-time string (e.g., "10/5/2025, 2:30:00 PM")
     *
     * @example
     * ```tsx
     * <Gantt formatTime={GanttUtils.formatDateTime} />
     * ```
     */
    formatDateTime: (timestamp: number) => string;
    /**
     * Format timestamp with timezone offset.
     *
     * @param timestamp - Unix timestamp in milliseconds
     * @param timezoneOffset - Timezone offset in hours from UTC
     * @returns Formatted time string adjusted for timezone
     *
     * @example
     * ```tsx
     * const estTime = GanttUtils.formatWithTimezone(Date.now(), -5); // EST
     * ```
     */
    formatWithTimezone: (timestamp: number, timezoneOffset: number) => string;
};
export { GanttEnhanced } from "./gantt-enhanced";
export type { GanttEnhancedProps } from "./gantt-enhanced";
export { useGanttControls } from "./hooks";
export type { GanttControls, GanttControlsConfig } from "./hooks";
export { GanttControlBar, GanttControlButtonRoot, GanttNavigationControlsRoot, GanttZoomControlsRoot, GanttTimezoneSelectRoot, GanttControlBarRoot, COMMON_TIMEZONES, } from "./primitives/gantt-controls";
export type { GanttControlBarProps, GanttControlButtonRootProps, GanttNavigationControlsRootProps, GanttZoomControlsRootProps, GanttTimezoneSelectRootProps, GanttControlBarRootProps, TimezoneOption, } from "./primitives/gantt-controls";
