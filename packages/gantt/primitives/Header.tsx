import React from "react";
import { useGanttContext } from "./Root";

/**
 * Props for Gantt.Header component
 * @interface GanttHeaderProps
 */
export interface GanttHeaderProps {
  /** Child components or render function */
  children?: React.ReactNode | ((divisions: Array<{ time: number; index: number }>) => React.ReactNode);
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Custom render function for each division label */
  renderDivision?: (timestamp: number, index: number) => React.ReactNode;
}

/**
 * Gantt.Header - Header component showing time divisions
 *
 * Displays the timeline header with time labels for each division.
 * Completely unstyled - you control all styling.
 *
 * @example
 * Basic usage with default rendering:
 *
 * import * as Gantt from '@plexusui/gantt/primitives';
 *
 * <Gantt.Root timeWindowStart={start} timeWindowEnd={end}>
 *   <Gantt.Header
 *     renderDivision={(time) => (
 *       <div className="time-label">
 *         {new Date(time).toLocaleTimeString()}
 *       </div>
 *     )}
 *   />
 * </Gantt.Root>
 *
 * @example
 * With render props for full control:
 *
 * <Gantt.Header>
 *   {(divisions) =>
 *     divisions.map(({ time, index }) => (
 *       <div key={index} className="custom-label">
 *         {formatTime(time)}
 *       </div>
 *     ))
 *   }
 * </Gantt.Header>
 *
 * @example
 * Custom styling with Tailwind:
 *
 * <Gantt.Header
 *   className="flex border-b"
 *   renderDivision={(time) => (
 *     <div className="flex-1 text-center py-2 text-sm">
 *       {new Date(time).getHours()}:00
 *     </div>
 *   )}
 * />
 */
export const GanttHeader = React.forwardRef<HTMLDivElement, GanttHeaderProps>(
  ({ children, className, style, renderDivision }, ref) => {
    const { divisionTimestamps, formatTime } = useGanttContext();

    // Build divisions array with metadata
    const divisions = divisionTimestamps.map((time, index) => ({
      time,
      index,
    }));

    // Determine content
    let content: React.ReactNode;

    if (children && typeof children === "function") {
      // Render prop pattern
      content = children(divisions);
    } else if (children) {
      // Direct children
      content = children;
    } else if (renderDivision) {
      // Custom render function
      content = divisions.map(({ time, index }) => (
        <React.Fragment key={index}>
          {renderDivision(time, index)}
        </React.Fragment>
      ));
    } else {
      // Default rendering (minimal)
      content = divisions.map(({ time, index }) => (
        <div key={index}>{formatTime(time)}</div>
      ));
    }

    return (
      <div ref={ref} className={className} style={style}>
        {content}
      </div>
    );
  }
);

GanttHeader.displayName = "Gantt.Header";
