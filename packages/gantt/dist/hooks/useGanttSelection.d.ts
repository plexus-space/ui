/**
 * Options for useGanttSelection hook
 * @interface UseGanttSelectionOptions
 */
export interface UseGanttSelectionOptions {
    /** Initial selected task ID (optional) */
    initialSelectedId?: string;
    /** Callback when selection changes (optional) */
    onSelectionChange?: (taskId: string | null) => void;
    /** Allow multiple selection (default: false) */
    multiSelect?: boolean;
}
/**
 * useGanttSelection - Selection state management hook
 *
 * Manages task selection state with support for single and multi-select.
 * Provides utilities for checking selection and toggling state.
 *
 * @example
 * Basic single selection:
 *
 * import { useGanttSelection } from '@plexusui/gantt/hooks';
 *
 * function MyGantt() {
 *   const selection = useGanttSelection({
 *     onSelectionChange: (id) => console.log('Selected:', id),
 *   });
 *
 *   return (
 *     <div>
 *       {tasks.map(task => (
 *         <div
 *           key={task.id}
 *           onClick={() => selection.select(task.id)}
 *           style={{
 *             background: selection.isSelected(task.id) ? 'blue' : 'gray'
 *           }}
 *         >
 *           {task.label}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 *
 * @example
 * Multi-selection:
 *
 * const selection = useGanttSelection({ multiSelect: true });
 *
 * // Click to toggle multiple tasks
 * <div onClick={() => selection.toggle(task.id)}>
 *   {task.label}
 * </div>
 *
 * @param options - Configuration for selection behavior
 * @returns Selection state and utilities
 */
export declare function useGanttSelection(options?: UseGanttSelectionOptions): {
    selectedId: string | null;
    selectedIds: string[];
    selectedCount: number;
    select: (taskId: string | null) => void;
    toggle: (taskId: string) => void;
    add: (taskId: string) => void;
    remove: (taskId: string) => void;
    clear: () => void;
    isSelected: (taskId: string) => boolean;
};
