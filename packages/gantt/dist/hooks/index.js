/**
 * Headless Gantt Hooks
 *
 * Pure logic hooks for building custom Gantt chart implementations.
 * These hooks contain no UI or styling - bring your own components!
 *
 * @example
 * Building a custom Gantt with hooks:
 *
 * import { useGanttTimeline, useGanttTask } from '@plexusui/gantt/hooks';
 *
 * function MyGantt({ tasks }) {
 *   const timeline = useGanttTimeline({
 *     timeWindowStart: Date.now(),
 *     timeWindowEnd: Date.now() + 12 * 60 * 60 * 1000,
 *   });
 *
 *   return (
 *     <div className="my-gantt">
 *       {tasks.map(task => {
 *         const position = timeline.getTaskPosition(task);
 *         return (
 *           <div
 *             key={task.id}
 *             style={{
 *               left: `${position.left}%`,
 *               width: `${position.width}%`,
 *             }}
 *           >
 *             {task.label}
 *           </div>
 *         );
 *       })}
 *     </div>
 *   );
 * }
 *
 * @module @plexusui/gantt/hooks
 */
export { useGanttTimeline, } from "./useGanttTimeline";
export { useGanttTask, } from "./useGanttTask";
export { useGanttSelection, } from "./useGanttSelection";
export { useGanttControls, } from "./use-gantt-controls";
