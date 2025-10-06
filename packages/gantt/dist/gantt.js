"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, forwardRef, useMemo } from "react";
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
export const GanttTimelineRoot = memo(forwardRef(({ group, timeWindowStart, timeWindowEnd, divisions = 12, selectedTaskId, onTaskClick, priorityColors = {
    critical: "bg-red-500",
    high: "bg-yellow-500",
    medium: "bg-green-500",
    low: "bg-blue-500",
}, }, ref) => {
    const timeWindow = timeWindowEnd - timeWindowStart;
    return (_jsxs("div", { ref: ref, className: "flex py-2 border-b border-gray-900/50 items-center", children: [_jsxs("div", { className: "w-1/6 pr-2 min-w-0 flex-shrink-0", children: [_jsx("div", { className: "text-xs text-gray-300 truncate", children: group.label }), group.sublabel && (_jsx("div", { className: "text-xs text-gray-500 truncate", children: group.sublabel }))] }), _jsxs("div", { className: "w-5/6 h-7 relative", children: [_jsx("div", { className: "absolute inset-0 flex border-l border-gray-900/30", children: Array.from({ length: divisions - 1 }).map((_, i) => (_jsx("div", { className: "flex-1 border-r border-gray-900/30" }, i))) }), group.tasks.map((task) => {
                        const startOffset = task.startTime - timeWindowStart;
                        const duration = task.endTime - task.startTime;
                        // Skip tasks outside the visible window
                        if (startOffset > timeWindow || startOffset + duration < 0) {
                            return null;
                        }
                        const leftPos = Math.max(0, (startOffset / timeWindow) * 100);
                        const widthPercent = (duration / timeWindow) * 100;
                        const bgColor = task.color ||
                            (task.priority ? priorityColors[task.priority] : "bg-blue-500");
                        const isSelected = selectedTaskId === task.id;
                        return (_jsx("div", { style: {
                                left: `${leftPos}%`,
                                width: `${widthPercent}%`,
                            }, className: `absolute h-6 ${bgColor} rounded-sm top-0.5 flex items-center px-1.5 overflow-hidden hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50 cursor-pointer transition-all duration-100 ${isSelected ? "ring-2 ring-blue-400 ring-opacity-100" : ""}`, title: `${task.label} - ${new Date(task.startTime).toLocaleString()}`, onClick: () => onTaskClick?.(task.id), children: _jsx("span", { className: "text-xs text-white truncate font-medium", children: task.label }) }, task.id));
                    })] })] }));
}));
GanttTimelineRoot.displayName = "GanttTimelineRoot";
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
export const GanttHeaderRoot = memo(forwardRef(({ timeWindowStart, timeWindowEnd, divisions = 12, leftLabel = "Item", formatTime, }, ref) => {
    const timeWindow = timeWindowEnd - timeWindowStart;
    const divisionDuration = timeWindow / divisions;
    const defaultFormatTime = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getHours()}:00`;
    };
    const formatter = formatTime || defaultFormatTime;
    return (_jsxs("div", { ref: ref, className: "flex mb-2 border-b border-gray-900 pb-2", children: [_jsx("div", { className: "w-1/6 pr-2 text-xs text-gray-500 flex-shrink-0", children: leftLabel }), _jsx("div", { className: "w-5/6 flex", children: Array.from({ length: divisions }).map((_, i) => {
                    const timestamp = timeWindowStart + i * divisionDuration;
                    return (_jsx("div", { className: "flex-1 text-center text-xs text-gray-500", children: formatter(timestamp) }, i));
                }) })] }));
}));
GanttHeaderRoot.displayName = "GanttHeaderRoot";
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
export const GanttCurrentTimeMarkerRoot = memo(forwardRef(({ currentTime, timeWindowStart, timeWindowEnd, label = "Now", color = "border-pink-500", }, ref) => {
    const timeWindow = timeWindowEnd - timeWindowStart;
    const offset = currentTime - timeWindowStart;
    const leftPos = (offset / timeWindow) * 100;
    // Don't render if outside the visible window
    if (leftPos < 0 || leftPos > 100) {
        return null;
    }
    return (_jsx("div", { ref: ref, className: `absolute top-0 bottom-0 border-l-2 ${color} z-10 pointer-events-none`, style: { left: `${leftPos}%` }, children: _jsx("div", { className: "bg-pink-800 text-pink-100 text-[9px] px-1 absolute -top-4 -translate-x-1/2 whitespace-nowrap", children: label }) }));
}));
GanttCurrentTimeMarkerRoot.displayName = "GanttCurrentTimeMarkerRoot";
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
export const GanttScene = forwardRef(({ title = "Timeline", controls, children, className = "" }, ref) => {
    return (_jsxs("div", { ref: ref, className: `bg-black border border-gray-900 rounded-lg overflow-hidden ${className}`, children: [_jsx("div", { className: "p-3 border-b border-gray-900 flex justify-between items-center", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h3", { className: "text-xs font-medium text-gray-200", children: title }), controls] }) }), _jsx("div", { className: "p-3 relative", children: children })] }));
});
GanttScene.displayName = "GanttScene";
/**
 * Gantt - The main composed Gantt chart component.
 *
 * A fully-featured timeline chart that works with minimal data. Just pass an array
 * of groups and you're ready to go. Each group contains tasks that are displayed
 * as horizontal bars positioned along a time axis.
 *
 * **This is NOT a 3D component** - it's a pure 2D timeline chart built with HTML/CSS.
 *
 * **Minimal Working Example:**
 * ```tsx
 * import { Gantt } from './gantt';
 *
 * function App() {
 *   const groups = [{
 *     id: "1",
 *     label: "Mission Control",
 *     tasks: [{
 *       id: "t1",
 *       label: "Pre-flight Check",
 *       startTime: Date.now(),
 *       endTime: Date.now() + 3600000 // 1 hour from now
 *     }]
 *   }];
 *
 *   return <Gantt groups={groups} />;
 * }
 * ```
 *
 * **Time Window Concept:**
 * The time window determines what time range is visible. By default, it starts
 * at "now" and spans 12 hours forward. You can customize this:
 * - `timeWindowStart`: When the visible window starts (Unix timestamp)
 * - `timeWindowDuration`: How long the window spans (milliseconds)
 *
 * Tasks are positioned proportionally within this window.
 *
 * **Advanced Example with All Features:**
 * ```tsx
 * import { Gantt, GanttUtils } from './gantt';
 *
 * function MissionTimeline() {
 *   const [selectedTask, setSelectedTask] = useState<string>();
 *
 *   const groups = [
 *     {
 *       id: "alpha",
 *       label: "Alpha Team",
 *       sublabel: "Primary Crew",
 *       tasks: [
 *         {
 *           id: "t1",
 *           label: "Pre-launch",
 *           startTime: Date.now(),
 *           endTime: Date.now() + 7200000,
 *           priority: "critical"
 *         },
 *         {
 *           id: "t2",
 *           label: "Launch",
 *           startTime: Date.now() + 7200000,
 *           endTime: Date.now() + 10800000,
 *           priority: "critical",
 *           color: "bg-red-600"
 *         }
 *       ]
 *     },
 *     {
 *       id: "bravo",
 *       label: "Bravo Team",
 *       sublabel: "Support Crew",
 *       tasks: [
 *         {
 *           id: "t3",
 *           label: "Systems Check",
 *           startTime: Date.now() + 3600000,
 *           endTime: Date.now() + 14400000,
 *           priority: "high"
 *         }
 *       ]
 *     }
 *   ];
 *
 *   return (
 *     <Gantt
 *       groups={groups}
 *       title="Mission Timeline"
 *       divisions={24}
 *       timeWindowDuration={24 * 60 * 60 * 1000} // 24 hours
 *       selectedTaskId={selectedTask}
 *       onTaskClick={setSelectedTask}
 *       formatTime={GanttUtils.formatHHMM}
 *       controls={<button>Export</button>}
 *     />
 *   );
 * }
 * ```
 *
 * **Primitive vs Composed Usage:**
 * - Use `<Gantt>` for quick, standard charts (this component)
 * - Use primitives (`GanttTimelineRoot`, `GanttHeaderRoot`, etc.) for custom layouts
 *
 * @see GanttTimelineRoot for the core timeline primitive
 * @see GanttHeaderRoot for the time axis primitive
 * @see GanttUtils for time formatting utilities
 */
const GanttComponent = forwardRef(({ groups, timeWindowStart, timeWindowDuration = 12 * 60 * 60 * 1000, // 12 hours
divisions = 12, title = "Timeline", leftLabel, selectedTaskId, onTaskClick, showCurrentTime = true, controls, formatTime, priorityColors, }, ref) => {
    const now = useMemo(() => Date.now(), []);
    const windowStart = timeWindowStart ?? now;
    const windowEnd = windowStart + timeWindowDuration;
    return (_jsxs(GanttScene, { ref: ref, title: title, controls: controls, children: [_jsx(GanttHeaderRoot, { timeWindowStart: windowStart, timeWindowEnd: windowEnd, divisions: divisions, leftLabel: leftLabel, formatTime: formatTime }), groups.map((group) => (_jsxs("div", { className: "relative", children: [_jsx(GanttTimelineRoot, { group: group, timeWindowStart: windowStart, timeWindowEnd: windowEnd, divisions: divisions, selectedTaskId: selectedTaskId, onTaskClick: onTaskClick, priorityColors: priorityColors }), showCurrentTime && (_jsx(GanttCurrentTimeMarkerRoot, { currentTime: now, timeWindowStart: windowStart, timeWindowEnd: windowEnd }))] }, group.id)))] }));
});
GanttComponent.displayName = "Gantt";
export const Gantt = memo(GanttComponent);
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
export const GanttUtils = {
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
    getTimeWindow: (durationMs) => {
        const now = Date.now();
        return { start: now, end: now + durationMs };
    },
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
    formatHHMM: (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
    },
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
    formatDate: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    },
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
    formatDateTime: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    },
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
    formatWithTimezone: (timestamp, timezoneOffset) => {
        const localOffset = -new Date().getTimezoneOffset() / 60;
        const offsetDiff = timezoneOffset - localOffset;
        const adjustedTimestamp = timestamp + offsetDiff * 60 * 60 * 1000;
        const date = new Date(adjustedTimestamp);
        return `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
    },
};
// Re-export enhanced components
export { GanttEnhanced } from "./gantt-enhanced";
// Re-export hooks
export { useGanttControls } from "./hooks";
// Re-export control primitives
export { GanttControlBar, GanttControlButtonRoot, GanttNavigationControlsRoot, GanttZoomControlsRoot, GanttTimezoneSelectRoot, GanttControlBarRoot, COMMON_TIMEZONES, } from "./primitives/gantt-controls";
