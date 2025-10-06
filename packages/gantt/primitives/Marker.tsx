import React from "react";
import { useGanttContext } from "./Root";

/**
 * Props for Gantt.Marker component
 * @interface GanttMarkerProps
 */
export interface GanttMarkerProps {
  /** Timestamp to mark (in milliseconds) */
  time: number;
  /** Child content or render function */
  children?: React.ReactNode | ((position: number) => React.ReactNode);
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Gantt.Marker - Time marker for special points
 *
 * Renders a vertical marker at a specific timestamp.
 * Useful for "now" indicators, deadlines, or milestones.
 *
 * @example
 * Current time marker:
 *
 * import * as Gantt from '@plexusui/gantt/primitives';
 *
 * <Gantt.Timeline className="relative">
 *   <Gantt.Marker
 *     time={Date.now()}
 *     style={{
 *       position: 'absolute',
 *       width: '2px',
 *       height: '100%',
 *       backgroundColor: 'red',
 *       zIndex: 10,
 *     }}
 *   />
 *   {tasks}
 * </Gantt.Timeline>
 *
 * @example
 * With label:
 *
 * <Gantt.Marker time={Date.now()}>
 *   {(position) => (
 *     <div
 *       style={{
 *         position: 'absolute',
 *         left: `${position}%`,
 *         top: 0,
 *         height: '100%',
 *       }}
 *     >
 *       <div className="w-0.5 h-full bg-red-500" />
 *       <div className="text-xs text-red-500">Now</div>
 *     </div>
 *   )}
 * </Gantt.Marker>
 *
 * @example
 * Deadline marker:
 *
 * <Gantt.Marker
 *   time={deadlineTimestamp}
 *   className="absolute top-0 bottom-0 border-l-2 border-yellow-500"
 * >
 *   <span className="text-yellow-500 text-xs">Deadline</span>
 * </Gantt.Marker>
 */
export const GanttMarker = React.forwardRef<HTMLDivElement, GanttMarkerProps>(
  ({ time, children, className, style }, ref) => {
    const { timeToPercent, timeWindow } = useGanttContext();

    // Calculate position percentage
    const position = timeToPercent(time);

    // Check if marker is visible
    const isVisible = time >= timeWindow.start && time <= timeWindow.end;

    if (!isVisible) {
      return null;
    }

    // Determine content
    const content =
      typeof children === "function" ? children(position) : children;

    // Apply positioning to style
    const markerStyle: React.CSSProperties = {
      ...style,
      left: `${position}%`,
    };

    return (
      <div ref={ref} className={className} style={markerStyle}>
        {content}
      </div>
    );
  }
);

GanttMarker.displayName = "Gantt.Marker";
