import React from "react";

/**
 * Props for Gantt.Timeline component
 * @interface GanttTimelineProps
 */
export interface GanttTimelineProps {
  /** Child components (typically Gantt.Task elements) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Gantt.Timeline - Container for tasks
 *
 * A simple container for task bars. Provides structure but no styling.
 * Use this to wrap your Gantt.Task components.
 *
 * @example
 * Basic usage:
 *
 * import * as Gantt from '@plexusui/gantt/primitives';
 *
 * <Gantt.Timeline className="relative h-12 bg-gray-100">
 *   {tasks.map(task => (
 *     <Gantt.Task key={task.id} data={task}>
 *       {({ position }) => (
 *         <div
 *           style={{
 *             position: 'absolute',
 *             left: `${position.left}%`,
 *             width: `${position.width}%`,
 *           }}
 *         >
 *           {task.label}
 *         </div>
 *       )}
 *     </Gantt.Task>
 *   ))}
 * </Gantt.Timeline>
 *
 * @example
 * With grid background:
 *
 * <Gantt.Timeline
 *   className="relative"
 *   style={{ position: 'relative', height: '48px' }}
 * >
 *   <Gantt.Grid />
 *   {tasks.map(task => (
 *     <Gantt.Task key={task.id} data={task}>
 *       {renderTask}
 *     </Gantt.Task>
 *   ))}
 * </Gantt.Timeline>
 */
export const GanttTimeline = React.forwardRef<HTMLDivElement, GanttTimelineProps>(
  ({ children, className, style }, ref) => {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }
);

GanttTimeline.displayName = "Gantt.Timeline";
