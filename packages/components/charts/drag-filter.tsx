"use client";

import * as React from "react";
import { cn } from "../lib/utils";

// ============================================================================
// Types
// ============================================================================

/**
 * Drag selection result
 */
export interface DragSelection {
  /** Start position (0-1 normalized) */
  start: number;
  /** End position (0-1 normalized) */
  end: number;
  /** Start value in data units */
  startValue?: number;
  /** End value in data units */
  endValue?: number;
}

/**
 * Props for DragFilter component
 */
export interface DragFilterProps {
  /**
   * Callback when drag selection completes
   */
  onDragEnd?: (selection: DragSelection) => void;
  /**
   * Callback during drag (for live updates)
   */
  onDragMove?: (selection: DragSelection) => void;
  /**
   * Current selection state
   */
  selection?: DragSelection;
  /**
   * Data range for value conversion
   * @example { min: 0, max: 100 }
   */
  dataRange?: { min: number; max: number };
  /**
   * Orientation of the drag filter
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children to render (chart or other content)
   */
  children?: React.ReactNode;
  /**
   * Disable drag interaction
   * @default false
   */
  disabled?: boolean;
  /**
   * Show selection overlay
   * @default true
   */
  showOverlay?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * DragFilter - Interactive drag-to-filter component
 *
 * Allows users to drag across a chart or visualization to select a range.
 * Beautiful shadcn-styled overlay with smooth animations.
 *
 * @example
 * ```tsx
 * <DragFilter
 *   onDragEnd={(selection) => {
 *     console.log('Selected range:', selection.startValue, selection.endValue);
 *   }}
 * >
 *   <YourChart data={data} />
 * </DragFilter>
 * ```
 */
export function DragFilter({
  onDragEnd,
  onDragMove,
  selection,
  dataRange,
  orientation = "horizontal",
  className,
  children,
  disabled = false,
  showOverlay = true,
}: DragFilterProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<number>(0);
  const [dragCurrent, setDragCurrent] = React.useState<number>(0);

  const calculateSelection = React.useCallback(
    (start: number, current: number): DragSelection => {
      const normalizedStart = Math.max(0, Math.min(1, start));
      const normalizedEnd = Math.max(0, Math.min(1, current));

      const result: DragSelection = {
        start: Math.min(normalizedStart, normalizedEnd),
        end: Math.max(normalizedStart, normalizedEnd),
      };

      // Calculate data values if range is provided
      if (dataRange) {
        const range = dataRange.max - dataRange.min;
        result.startValue = dataRange.min + result.start * range;
        result.endValue = dataRange.min + result.end * range;
      }

      return result;
    },
    [dataRange]
  );

  const getNormalizedPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return 0;

    const rect = containerRef.current.getBoundingClientRect();
    if (orientation === "horizontal") {
      return (e.clientX - rect.left) / rect.width;
    } else {
      return (e.clientY - rect.top) / rect.height;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const pos = getNormalizedPosition(e);
    setIsDragging(true);
    setDragStart(pos);
    setDragCurrent(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || disabled) return;

    const pos = getNormalizedPosition(e);
    setDragCurrent(pos);

    const selection = calculateSelection(dragStart, pos);
    onDragMove?.(selection);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || disabled) return;

    const pos = getNormalizedPosition(e);
    const selection = calculateSelection(dragStart, pos);

    setIsDragging(false);
    onDragEnd?.(selection);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Calculate overlay position
  const overlayStyle = React.useMemo(() => {
    if (!showOverlay) return {};

    const activeSelection = selection || (isDragging ? calculateSelection(dragStart, dragCurrent) : null);
    if (!activeSelection) return { display: "none" };

    if (orientation === "horizontal") {
      return {
        left: `${activeSelection.start * 100}%`,
        width: `${(activeSelection.end - activeSelection.start) * 100}%`,
        top: 0,
        height: "100%",
      };
    } else {
      return {
        top: `${activeSelection.start * 100}%`,
        height: `${(activeSelection.end - activeSelection.start) * 100}%`,
        left: 0,
        width: "100%",
      };
    }
  }, [selection, isDragging, dragStart, dragCurrent, showOverlay, orientation, calculateSelection]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", !disabled && "cursor-crosshair", className)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Content */}
      {children}

      {/* Selection Overlay */}
      {showOverlay && (
        <div
          className={cn(
            "pointer-events-none absolute z-10 transition-opacity",
            isDragging || selection ? "opacity-100" : "opacity-0"
          )}
          style={overlayStyle}
        >
          {/* Selected region */}
          <div className="h-full w-full bg-blue-500/20 backdrop-blur-[1px] dark:bg-blue-400/20">
            {/* Start edge */}
            <div
              className={cn(
                "absolute bg-blue-600 dark:bg-blue-400",
                orientation === "horizontal"
                  ? "left-0 top-0 h-full w-0.5"
                  : "left-0 top-0 h-0.5 w-full"
              )}
            />
            {/* End edge */}
            <div
              className={cn(
                "absolute bg-blue-600 dark:bg-blue-400",
                orientation === "horizontal"
                  ? "right-0 top-0 h-full w-0.5"
                  : "bottom-0 left-0 h-0.5 w-full"
              )}
            />
          </div>

          {/* Value labels */}
          {dataRange && (isDragging || selection) && (
            <>
              <div
                className={cn(
                  "absolute rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-blue-500",
                  orientation === "horizontal" ? "left-0 top-0 -translate-y-full" : "left-0 top-0 -translate-x-full"
                )}
              >
                {((selection?.startValue ?? 0) || 0).toFixed(2)}
              </div>
              <div
                className={cn(
                  "absolute rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-blue-500",
                  orientation === "horizontal"
                    ? "right-0 top-0 -translate-y-full"
                    : "bottom-0 left-0 -translate-x-full"
                )}
              >
                {((selection?.endValue ?? 0) || 0).toFixed(2)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

DragFilter.displayName = "DragFilter";
