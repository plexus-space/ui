import { useState, useCallback, useMemo } from "react";

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
export function useGanttSelection(options: UseGanttSelectionOptions = {}) {
  const {
    initialSelectedId,
    onSelectionChange,
    multiSelect = false,
  } = options;

  // Single selection state
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId || null
  );

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedId ? [initialSelectedId] : [])
  );

  /**
   * Select a single task
   */
  const select = useCallback(
    (taskId: string | null) => {
      if (multiSelect) {
        if (taskId === null) {
          setSelectedIds(new Set());
        } else {
          setSelectedIds(new Set([taskId]));
        }
      } else {
        setSelectedId(taskId);
      }

      if (onSelectionChange) {
        onSelectionChange(taskId);
      }
    },
    [multiSelect, onSelectionChange]
  );

  /**
   * Toggle task selection (for multi-select)
   */
  const toggle = useCallback(
    (taskId: string) => {
      if (multiSelect) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(taskId)) {
            next.delete(taskId);
          } else {
            next.add(taskId);
          }
          return next;
        });
      } else {
        // In single-select mode, toggle means select/deselect
        setSelectedId((prev) => (prev === taskId ? null : taskId));
      }

      if (onSelectionChange && !multiSelect) {
        onSelectionChange(selectedId === taskId ? null : taskId);
      }
    },
    [multiSelect, onSelectionChange, selectedId]
  );

  /**
   * Add task to selection (multi-select only)
   */
  const add = useCallback((taskId: string) => {
    setSelectedIds((prev) => new Set([...prev, taskId]));
  }, []);

  /**
   * Remove task from selection (multi-select only)
   */
  const remove = useCallback((taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  }, []);

  /**
   * Clear all selections
   */
  const clear = useCallback(() => {
    if (multiSelect) {
      setSelectedIds(new Set());
    } else {
      setSelectedId(null);
    }

    if (onSelectionChange) {
      onSelectionChange(null);
    }
  }, [multiSelect, onSelectionChange]);

  /**
   * Check if a task is selected
   */
  const isSelected = useCallback(
    (taskId: string): boolean => {
      if (multiSelect) {
        return selectedIds.has(taskId);
      } else {
        return selectedId === taskId;
      }
    },
    [multiSelect, selectedId, selectedIds]
  );

  /**
   * Get all selected task IDs
   */
  const getSelectedIds = useMemo(() => {
    if (multiSelect) {
      return Array.from(selectedIds);
    } else {
      return selectedId ? [selectedId] : [];
    }
  }, [multiSelect, selectedId, selectedIds]);

  /**
   * Get count of selected tasks
   */
  const selectedCount = useMemo(() => {
    return getSelectedIds.length;
  }, [getSelectedIds]);

  return {
    // Single selection state
    selectedId: multiSelect ? null : selectedId,

    // Multi-selection state
    selectedIds: multiSelect ? getSelectedIds : [],

    // Selection count
    selectedCount,

    // Actions
    select,
    toggle,
    add,
    remove,
    clear,

    // Utilities
    isSelected,
  };
}
