/**
 * Headless Gantt Primitives
 *
 * Unstyled, composable components for building custom Gantt charts.
 * These components provide structure and behavior without any styling.
 *
 * @example
 * Building a custom Gantt chart:
 *
 * import * as Gantt from '@plexusui/gantt/primitives';
 *
 * function MyGantt({ groups }) {
 *   return (
 *     <Gantt.Root
 *       timeWindowStart={Date.now()}
 *       timeWindowEnd={Date.now() + 12 * 60 * 60 * 1000}
 *     >
 *       <Gantt.Header
 *         className="flex border-b"
 *         renderDivision={(time) => (
 *           <div className="flex-1 text-center">
 *             {new Date(time).getHours()}:00
 *           </div>
 *         )}
 *       />
 *
 *       {groups.map(group => (
 *         <Gantt.Group key={group.id} className="flex border-b">
 *           <Gantt.Label className="w-48 px-4 py-2">
 *             {group.label}
 *           </Gantt.Label>
 *
 *           <Gantt.Timeline className="flex-1 relative">
 *             <Gantt.Grid
 *               className="absolute inset-0 flex"
 *               renderLine={(i) => (
 *                 <div className="flex-1 border-r border-gray-200" />
 *               )}
 *             />
 *
 *             {group.tasks.map(task => (
 *               <Gantt.Task key={task.id} data={task}>
 *                 {({ position, isSelected, handlers }) => (
 *                   <div
 *                     className="absolute h-8 rounded px-2"
 *                     style={{
 *                       left: `${position.left}%`,
 *                       width: `${position.width}%`,
 *                       backgroundColor: isSelected ? 'blue' : 'gray',
 *                     }}
 *                     {...handlers}
 *                   >
 *                     {task.label}
 *                   </div>
 *                 )}
 *               </Gantt.Task>
 *             ))}
 *
 *             <Gantt.Marker
 *               time={Date.now()}
 *               className="absolute top-0 bottom-0 w-0.5 bg-red-500"
 *             />
 *           </Gantt.Timeline>
 *         </Gantt.Group>
 *       ))}
 *     </Gantt.Root>
 *   );
 * }
 *
 * @module @plexusui/gantt/primitives
 */

export { GanttRoot, useGanttContext, type GanttRootProps, type GanttContextValue } from "./Root";
export { GanttHeader, type GanttHeaderProps } from "./Header";
export { GanttTask, type GanttTaskProps, type TaskRenderProps } from "./Task";
export { GanttTimeline, type GanttTimelineProps } from "./Timeline";
export { GanttGrid, type GanttGridProps } from "./Grid";
export { GanttGroup, type GanttGroupProps } from "./Group";
export { GanttLabel, type GanttLabelProps } from "./Label";
export { GanttMarker, type GanttMarkerProps } from "./Marker";

// Control primitives
export {
  GanttControlButtonRoot,
  GanttNavigationControlsRoot,
  GanttZoomControlsRoot,
  GanttTimezoneSelectRoot,
  GanttControlBarRoot,
  GanttControlBar,
  COMMON_TIMEZONES,
  type GanttControlButtonRootProps,
  type GanttNavigationControlsRootProps,
  type GanttZoomControlsRootProps,
  type GanttTimezoneSelectRootProps,
  type GanttControlBarRootProps,
  type GanttControlBarProps,
  type TimezoneOption,
} from "./gantt-controls";

// Named exports for destructuring
export {
  GanttRoot as Root,
  GanttHeader as Header,
  GanttTask as Task,
  GanttTimeline as Timeline,
  GanttGrid as Grid,
  GanttGroup as Group,
  GanttLabel as Label,
  GanttMarker as Marker,
};
