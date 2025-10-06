import React, { createContext, useContext, useMemo } from "react";
import { useGanttTimeline, type UseGanttTimelineOptions } from "../hooks/useGanttTimeline";

/**
 * Context for Gantt timeline data
 * @interface GanttContextValue
 */
export interface GanttContextValue extends ReturnType<typeof useGanttTimeline> {
  onTaskClick?: (taskId: string) => void;
}

const GanttContext = createContext<GanttContextValue | null>(null);

/**
 * Hook to access Gantt context
 *
 * @returns Gantt context value
 * @throws Error if used outside of Gantt.Root
 */
export function useGanttContext() {
  const context = useContext(GanttContext);
  if (!context) {
    throw new Error("Gantt components must be used within Gantt.Root");
  }
  return context;
}

/**
 * Props for Gantt.Root component
 * @interface GanttRootProps
 */
export interface GanttRootProps extends UseGanttTimelineOptions {
  /** Child components */
  children: React.ReactNode | ((context: GanttContextValue) => React.ReactNode);
  /** Callback when a task is clicked */
  onTaskClick?: (taskId: string) => void;
  /** Custom className for the root container */
  className?: string;
  /** Custom styles for the root container */
  style?: React.CSSProperties;
}

/**
 * Gantt.Root - Root component for headless Gantt chart
 *
 * Provides context and timeline utilities to all child components.
 * This is the top-level wrapper for all Gantt primitives.
 *
 * @example
 * Basic usage:
 *
 * import * as Gantt from '@plexusui/gantt/primitives';
 *
 * function MyGantt() {
 *   return (
 *     <Gantt.Root
 *       timeWindowStart={Date.now()}
 *       timeWindowEnd={Date.now() + 12 * 60 * 60 * 1000}
 *       divisions={12}
 *     >
 *       <Gantt.Header />
 *       <Gantt.Timeline tasks={tasks} />
 *     </Gantt.Root>
 *   );
 * }
 *
 * @example
 * With render props:
 *
 * <Gantt.Root timeWindowStart={start} timeWindowEnd={end}>
 *   {({ timeline, formatTime }) => (
 *     <div>
 *       {timeline.divisionTimestamps.map((time, i) => (
 *         <span key={i}>{formatTime(time)}</span>
 *       ))}
 *     </div>
 *   )}
 * </Gantt.Root>
 */
export const GanttRoot = React.forwardRef<HTMLDivElement, GanttRootProps>(
  (
    {
      timeWindowStart,
      timeWindowEnd,
      divisions = 12,
      onTaskClick,
      children,
      className,
      style,
    },
    ref
  ) => {
    const timeline = useGanttTimeline({
      timeWindowStart,
      timeWindowEnd,
      divisions,
    });

    const contextValue = useMemo<GanttContextValue>(
      () => ({
        ...timeline,
        onTaskClick,
      }),
      [timeline, onTaskClick]
    );

    const content =
      typeof children === "function" ? children(contextValue) : children;

    return (
      <GanttContext.Provider value={contextValue}>
        <div ref={ref} className={className} style={style}>
          {content}
        </div>
      </GanttContext.Provider>
    );
  }
);

GanttRoot.displayName = "Gantt.Root";
