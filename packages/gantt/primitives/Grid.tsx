import React from "react";
import { useGanttContext } from "./Root";

/**
 * Props for Gantt.Grid component
 * @interface GanttGridProps
 */
export interface GanttGridProps {
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Custom render function for grid lines */
  renderLine?: (index: number) => React.ReactNode;
}

/**
 * Gantt.Grid - Background grid for timeline
 *
 * Renders vertical grid lines aligned with time divisions.
 * Completely unstyled - you control all appearance.
 *
 * @example
 * Basic usage with custom styling:
 *
 * import * as Gantt from '@plexusui/gantt/primitives';
 *
 * <Gantt.Timeline className="relative bg-white">
 *   <Gantt.Grid
 *     className="absolute inset-0 flex"
 *     renderLine={(i) => (
 *       <div
 *         key={i}
 *         className="flex-1 border-r border-gray-200"
 *       />
 *     )}
 *   />
 *   {tasks.map(task => <Gantt.Task key={task.id} data={task} />)}
 * </Gantt.Timeline>
 *
 * @example
 * With percentage-based positioning:
 *
 * <Gantt.Grid
 *   style={{ position: 'absolute', inset: 0, display: 'flex' }}
 *   renderLine={(i) => (
 *     <div
 *       key={i}
 *       style={{
 *         flex: 1,
 *         borderRight: '1px solid rgba(0,0,0,0.1)',
 *       }}
 *     />
 *   )}
 * />
 */
export const GanttGrid = React.forwardRef<HTMLDivElement, GanttGridProps>(
  ({ className, style, renderLine }, ref) => {
    const { divisions } = useGanttContext();

    // Create array of grid line indices
    const gridLines = Array.from({ length: divisions }, (_, i) => i);

    return (
      <div ref={ref} className={className} style={style}>
        {renderLine
          ? gridLines.map((i) => <React.Fragment key={i}>{renderLine(i)}</React.Fragment>)
          : gridLines.map((i) => <div key={i} />)}
      </div>
    );
  }
);

GanttGrid.displayName = "Gantt.Grid";
