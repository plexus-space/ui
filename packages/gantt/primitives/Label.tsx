import React from "react";

/**
 * Props for Gantt.Label component
 * @interface GanttLabelProps
 */
export interface GanttLabelProps {
  /** Child content (typically text or JSX) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Gantt.Label - Label column for timeline rows
 *
 * Container for row labels (station names, resource names, etc.).
 * Completely unstyled - you control all appearance.
 *
 * @example
 * Basic usage:
 *
 * import * as Gantt from '@plexusui/gantt/primitives';
 *
 * <Gantt.Group className="flex">
 *   <Gantt.Label className="w-48 px-4 py-2 bg-gray-50">
 *     <h4 className="font-semibold">Ground Station Alpha</h4>
 *     <p className="text-sm text-gray-500">Alaska</p>
 *   </Gantt.Label>
 *   <Gantt.Timeline className="flex-1">
 *     {tasks}
 *   </Gantt.Timeline>
 * </Gantt.Group>
 *
 * @example
 * With custom content:
 *
 * <Gantt.Label style={{ width: '200px', padding: '8px' }}>
 *   <div>
 *     <span>{group.name}</span>
 *     <span>{group.taskCount} tasks</span>
 *   </div>
 * </Gantt.Label>
 */
export const GanttLabel = React.forwardRef<HTMLDivElement, GanttLabelProps>(
  ({ children, className, style }, ref) => {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }
);

GanttLabel.displayName = "Gantt.Label";
