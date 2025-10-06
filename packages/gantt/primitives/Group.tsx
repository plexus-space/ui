import React from "react";

/**
 * Props for Gantt.Group component
 * @interface GanttGroupProps
 */
export interface GanttGroupProps {
  /** Child components */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Gantt.Group - Container for a single timeline row
 *
 * Groups a label and timeline together. Typically used to create
 * rows in a multi-track Gantt chart.
 *
 * @example
 * Basic usage:
 *
 * import * as Gantt from '@plexusui/gantt/primitives';
 *
 * <Gantt.Group className="flex items-center border-b">
 *   <Gantt.Label className="w-48 px-4">
 *     Ground Station Alpha
 *   </Gantt.Label>
 *   <Gantt.Timeline className="flex-1">
 *     {tasks.map(task => (
 *       <Gantt.Task key={task.id} data={task}>
 *         {renderTask}
 *       </Gantt.Task>
 *     ))}
 *   </Gantt.Timeline>
 * </Gantt.Group>
 *
 * @example
 * Multiple groups:
 *
 * <Gantt.Root timeWindowStart={start} timeWindowEnd={end}>
 *   <Gantt.Header />
 *   {groups.map(group => (
 *     <Gantt.Group key={group.id}>
 *       <Gantt.Label>{group.name}</Gantt.Label>
 *       <Gantt.Timeline>
 *         {group.tasks.map(task => (
 *           <Gantt.Task key={task.id} data={task}>
 *             {renderTask}
 *           </Gantt.Task>
 *         ))}
 *       </Gantt.Timeline>
 *     </Gantt.Group>
 *   ))}
 * </Gantt.Root>
 */
export const GanttGroup = React.forwardRef<HTMLDivElement, GanttGroupProps>(
  ({ children, className, style }, ref) => {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }
);

GanttGroup.displayName = "Gantt.Group";
