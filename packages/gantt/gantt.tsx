"use client";

import { memo, forwardRef, useMemo } from "react";

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// PRIMITIVES - Composable building blocks
// ============================================================================

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
export const GanttTimelineRoot = memo(
  forwardRef<HTMLDivElement, GanttTimelineRootProps>(
    (
      {
        group,
        timeWindowStart,
        timeWindowEnd,
        divisions = 12,
        selectedTaskId,
        onTaskClick,
        priorityColors = {
          critical: "bg-red-500",
          high: "bg-yellow-500",
          medium: "bg-green-500",
          low: "bg-blue-500",
        },
      },
      ref
    ) => {
      const timeWindow = timeWindowEnd - timeWindowStart;

      return (
        <div
          ref={ref}
          className="flex py-2 border-b border-gray-900/50 items-center"
        >
          {/* Label Section */}
          <div className="w-1/6 pr-2 min-w-0 flex-shrink-0">
            <div className="text-xs text-gray-300 truncate">{group.label}</div>
            {group.sublabel && (
              <div className="text-xs text-gray-500 truncate">
                {group.sublabel}
              </div>
            )}
          </div>

          {/* Timeline Section */}
          <div className="w-5/6 h-7 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex border-l border-gray-900/30">
              {Array.from({ length: divisions - 1 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-gray-900/30"
                ></div>
              ))}
            </div>

            {/* Task Bars */}
            {group.tasks.map((task) => {
              const startOffset = task.startTime - timeWindowStart;
              const duration = task.endTime - task.startTime;

              // Skip tasks outside the visible window
              if (startOffset > timeWindow || startOffset + duration < 0) {
                return null;
              }

              const leftPos = Math.max(0, (startOffset / timeWindow) * 100);
              const widthPercent = (duration / timeWindow) * 100;

              const bgColor =
                task.color ||
                (task.priority ? priorityColors[task.priority] : "bg-blue-500");

              const isSelected = selectedTaskId === task.id;

              return (
                <div
                  key={task.id}
                  style={{
                    left: `${leftPos}%`,
                    width: `${widthPercent}%`,
                  }}
                  className={`absolute h-6 ${bgColor} rounded-sm top-0.5 flex items-center px-1.5 overflow-hidden hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50 cursor-pointer transition-all duration-100 ${
                    isSelected ? "ring-2 ring-blue-400 ring-opacity-100" : ""
                  }`}
                  title={`${task.label} - ${new Date(
                    task.startTime
                  ).toLocaleString()}`}
                  onClick={() => onTaskClick?.(task.id)}
                >
                  <span className="text-xs text-white truncate font-medium">
                    {task.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  )
);

GanttTimelineRoot.displayName = "GanttTimelineRoot";

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
export const GanttHeaderRoot = memo(
  forwardRef<HTMLDivElement, GanttHeaderRootProps>(
    (
      {
        timeWindowStart,
        timeWindowEnd,
        divisions = 12,
        leftLabel = "Item",
        formatTime,
      },
      ref
    ) => {
      const timeWindow = timeWindowEnd - timeWindowStart;
      const divisionDuration = timeWindow / divisions;

      const defaultFormatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return `${date.getHours()}:00`;
      };

      const formatter = formatTime || defaultFormatTime;

      return (
        <div ref={ref} className="flex mb-2 border-b border-gray-900 pb-2">
          <div className="w-1/6 pr-2 text-xs text-gray-500 flex-shrink-0">
            {leftLabel}
          </div>
          <div className="w-5/6 flex">
            {Array.from({ length: divisions }).map((_, i) => {
              const timestamp = timeWindowStart + i * divisionDuration;
              return (
                <div
                  key={i}
                  className="flex-1 text-center text-xs text-gray-500"
                >
                  {formatter(timestamp)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  )
);

GanttHeaderRoot.displayName = "GanttHeaderRoot";

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
export const GanttCurrentTimeMarkerRoot = memo(
  forwardRef<HTMLDivElement, GanttCurrentTimeMarkerRootProps>(
    (
      {
        currentTime,
        timeWindowStart,
        timeWindowEnd,
        label = "Now",
        color = "border-pink-500",
      },
      ref
    ) => {
      const timeWindow = timeWindowEnd - timeWindowStart;
      const offset = currentTime - timeWindowStart;
      const leftPos = (offset / timeWindow) * 100;

      // Don't render if outside the visible window
      if (leftPos < 0 || leftPos > 100) {
        return null;
      }

      return (
        <div
          ref={ref}
          className={`absolute top-0 bottom-0 border-l-2 ${color} z-10 pointer-events-none`}
          style={{ left: `${leftPos}%` }}
        >
          <div className="bg-pink-800 text-pink-100 text-[9px] px-1 absolute -top-4 -translate-x-1/2 whitespace-nowrap">
            {label}
          </div>
        </div>
      );
    }
  )
);

GanttCurrentTimeMarkerRoot.displayName = "GanttCurrentTimeMarkerRoot";

// ============================================================================
// SCENE PRIMITIVE - Container with styling
// ============================================================================

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
export const GanttScene = forwardRef<HTMLDivElement, GanttSceneProps>(
  ({ title = "Timeline", controls, children, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-black border border-gray-900 rounded-lg overflow-hidden ${className}`}
      >
        <div className="p-3 border-b border-gray-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-medium text-gray-200">{title}</h3>
            {controls}
          </div>
        </div>
        <div className="p-3 relative">{children}</div>
      </div>
    );
  }
);

GanttScene.displayName = "GanttScene";

// ============================================================================
// COMPOSED COMPONENT - Pre-configured for common use cases
// ============================================================================

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
const GanttComponent = forwardRef<HTMLDivElement, GanttProps>(
  (
    {
      groups,
      timeWindowStart,
      timeWindowDuration = 12 * 60 * 60 * 1000, // 12 hours
      divisions = 12,
      title = "Timeline",
      leftLabel,
      selectedTaskId,
      onTaskClick,
      showCurrentTime = true,
      controls,
      formatTime,
      priorityColors,
    },
    ref
  ) => {
    const now = useMemo(() => Date.now(), []);
    const windowStart = timeWindowStart ?? now;
    const windowEnd = windowStart + timeWindowDuration;

    return (
      <GanttScene ref={ref} title={title} controls={controls}>
        <GanttHeaderRoot
          timeWindowStart={windowStart}
          timeWindowEnd={windowEnd}
          divisions={divisions}
          leftLabel={leftLabel}
          formatTime={formatTime}
        />

        {groups.map((group) => (
          <div key={group.id} className="relative">
            <GanttTimelineRoot
              group={group}
              timeWindowStart={windowStart}
              timeWindowEnd={windowEnd}
              divisions={divisions}
              selectedTaskId={selectedTaskId}
              onTaskClick={onTaskClick}
              priorityColors={priorityColors}
            />
            {showCurrentTime && (
              <GanttCurrentTimeMarkerRoot
                currentTime={now}
                timeWindowStart={windowStart}
                timeWindowEnd={windowEnd}
              />
            )}
          </div>
        ))}
      </GanttScene>
    );
  }
);

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
  getTimeWindow: (durationMs: number) => {
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
  formatHHMM: (timestamp: number) => {
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
  formatDate: (timestamp: number) => {
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
  formatDateTime: (timestamp: number) => {
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
  formatWithTimezone: (timestamp: number, timezoneOffset: number) => {
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
export type { GanttEnhancedProps } from "./gantt-enhanced";

// Re-export hooks
export { useGanttControls } from "./hooks";
export type { GanttControls, GanttControlsConfig } from "./hooks";

// Re-export control primitives
export {
  GanttControlBar,
  GanttControlButtonRoot,
  GanttNavigationControlsRoot,
  GanttZoomControlsRoot,
  GanttTimezoneSelectRoot,
  GanttControlBarRoot,
  COMMON_TIMEZONES,
} from "./primitives/gantt-controls";
export type {
  GanttControlBarProps,
  GanttControlButtonRootProps,
  GanttNavigationControlsRootProps,
  GanttZoomControlsRootProps,
  GanttTimezoneSelectRootProps,
  GanttControlBarRootProps,
  TimezoneOption,
} from "./primitives/gantt-controls";
