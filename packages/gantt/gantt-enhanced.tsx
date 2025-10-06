"use client";

import {
  memo,
  forwardRef,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  GanttScene,
  GanttHeaderRoot,
  GanttTimelineRoot,
  GanttCurrentTimeMarkerRoot,
  type GanttGroup,
  type GanttProps,
} from "./gantt";
import { useGanttControls, type GanttControlsConfig } from "./hooks";
import { GanttControlBar } from "./primitives/gantt-controls";

// ============================================================================
// ENHANCED GANTT COMPONENT
// ============================================================================

export interface GanttEnhancedProps extends Omit<GanttProps, "timeWindowStart" | "timeWindowDuration" | "formatTime"> {
  /** Configuration for Gantt controls */
  controlsConfig?: GanttControlsConfig;
  /** Whether to show the control bar */
  showControls?: boolean;
  /** Whether to enable pan/drag scrolling */
  enablePan?: boolean;
  /** Whether to enable mouse wheel scrolling */
  enableWheel?: boolean;
  /** Whether to show navigation controls in control bar */
  showNavigation?: boolean;
  /** Whether to show zoom controls in control bar */
  showZoom?: boolean;
  /** Whether to show timezone selector in control bar */
  showTimezone?: boolean;
  /** Custom time formatter that respects timezone */
  formatTime?: (timestamp: number, timezoneOffset: number) => string;
  /** Additional controls to render in control bar */
  additionalControls?: React.ReactNode;
}

/**
 * Default time formatter with timezone support
 */
const defaultFormatTimeWithTZ = (timestamp: number, timezoneOffset: number) => {
  // Adjust timestamp for timezone
  const localOffset = -new Date().getTimezoneOffset() / 60;
  const offsetDiff = timezoneOffset - localOffset;
  const adjustedTimestamp = timestamp + offsetDiff * 60 * 60 * 1000;

  const date = new Date(adjustedTimestamp);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

/**
 * GanttEnhanced - Enhanced Gantt chart with built-in controls, pan, zoom, and timeline navigation.
 *
 * This component extends the base Gantt with:
 * - Timezone support
 * - Mouse/touch panning
 * - Mouse wheel scrolling and zooming
 * - Navigation controls (prev/next/now)
 * - Zoom controls
 * - Seamless infinite scrolling
 *
 * @example
 * ```tsx
 * import { GanttEnhanced } from '@plexusui/gantt';
 *
 * function MissionControl() {
 *   const groups = [{
 *     id: "1",
 *     label: "Mission Team",
 *     tasks: [{
 *       id: "t1",
 *       label: "Launch Prep",
 *       startTime: Date.now(),
 *       endTime: Date.now() + 3600000,
 *       priority: "critical"
 *     }]
 *   }];
 *
 *   return (
 *     <GanttEnhanced
 *       groups={groups}
 *       title="Mission Timeline"
 *       enablePan
 *       enableWheel
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom controls configuration
 * <GanttEnhanced
 *   groups={groups}
 *   controlsConfig={{
 *     windowDuration: 24 * 60 * 60 * 1000, // 24 hours
 *     timezoneOffset: -5, // EST
 *     navigationStep: 3600000, // 1 hour steps
 *   }}
 *   showControls
 *   showTimezone
 * />
 * ```
 */
export const GanttEnhanced = memo(
  forwardRef<HTMLDivElement, GanttEnhancedProps>(
    (
      {
        groups,
        divisions = 12,
        title = "Timeline",
        leftLabel,
        selectedTaskId,
        onTaskClick,
        showCurrentTime = true,
        controls: customControls,
        formatTime,
        priorityColors,
        controlsConfig,
        showControls = true,
        enablePan = true,
        enableWheel = true,
        showNavigation = true,
        showZoom = true,
        showTimezone = true,
        additionalControls,
      },
      ref
    ) => {
      const timelineRef = useRef<HTMLDivElement>(null);

      // Initialize controls
      const ganttControls = useGanttControls(controlsConfig);

      const {
        windowStart,
        windowDuration,
        timezoneOffset,
        handlePanStart,
        handlePanMove,
        handlePanEnd,
        handleWheel,
      } = ganttControls;

      const windowEnd = windowStart + windowDuration;

      // Time formatter with timezone support
      const timeFormatter = useCallback(
        (timestamp: number) => {
          if (formatTime) {
            return formatTime(timestamp, timezoneOffset);
          }
          return defaultFormatTimeWithTZ(timestamp, timezoneOffset);
        },
        [formatTime, timezoneOffset]
      );

      // Pan handlers
      const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
          if (!enablePan) return;
          handlePanStart(e.clientX);
        },
        [enablePan, handlePanStart]
      );

      const handleMouseMove = useCallback(
        (e: MouseEvent) => {
          if (!enablePan || !timelineRef.current) return;
          const containerWidth = timelineRef.current.offsetWidth;
          handlePanMove(e.clientX, containerWidth);
        },
        [enablePan, handlePanMove]
      );

      const handleMouseUp = useCallback(() => {
        if (!enablePan) return;
        handlePanEnd();
      }, [enablePan, handlePanEnd]);

      // Touch handlers for mobile
      const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
          if (!enablePan || e.touches.length === 0) return;
          handlePanStart(e.touches[0].clientX);
        },
        [enablePan, handlePanStart]
      );

      const handleTouchMove = useCallback(
        (e: TouchEvent) => {
          if (!enablePan || !timelineRef.current || e.touches.length === 0)
            return;
          const containerWidth = timelineRef.current.offsetWidth;
          handlePanMove(e.touches[0].clientX, containerWidth);
        },
        [enablePan, handlePanMove]
      );

      // Wheel handler
      const handleWheelEvent = useCallback(
        (e: WheelEvent) => {
          if (!enableWheel) return;
          handleWheel(e, e.shiftKey);
        },
        [enableWheel, handleWheel]
      );

      // Setup event listeners
      useEffect(() => {
        if (!timelineRef.current) return;

        const timeline = timelineRef.current;

        // Mouse events
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        // Touch events
        timeline.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        document.addEventListener("touchend", handleMouseUp);

        // Wheel events
        timeline.addEventListener("wheel", handleWheelEvent, {
          passive: false,
        });

        return () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          timeline.removeEventListener("touchmove", handleTouchMove);
          document.removeEventListener("touchend", handleMouseUp);
          timeline.removeEventListener("wheel", handleWheelEvent);
        };
      }, [
        handleMouseMove,
        handleMouseUp,
        handleTouchMove,
        handleWheelEvent,
      ]);

      const combinedControls = useMemo(() => {
        return (
          <>
            {customControls}
            {showControls && (
              <GanttControlBar
                controls={ganttControls}
                showNavigation={showNavigation}
                showZoom={showZoom}
                showTimezone={showTimezone}
              >
                {additionalControls}
              </GanttControlBar>
            )}
          </>
        );
      }, [
        customControls,
        showControls,
        ganttControls,
        showNavigation,
        showZoom,
        showTimezone,
        additionalControls,
      ]);

      return (
        <div ref={ref} className="space-y-2">
          {showControls && combinedControls}

          <GanttScene title={title} controls={!showControls ? combinedControls : undefined}>
            <GanttHeaderRoot
              timeWindowStart={windowStart}
              timeWindowEnd={windowEnd}
              divisions={divisions}
              leftLabel={leftLabel}
              formatTime={timeFormatter}
            />

            <div
              ref={timelineRef}
              className={`${enablePan ? "cursor-grab active:cursor-grabbing" : ""} select-none`}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {groups.map((group) => (
                <div key={group.id} className="relative">
                  <GanttTimelineRoot
                    group={group}
                    timeWindowStart={windowStart}
                    timeWindowEnd={windowEnd}
                    divisions={divisions}
                    selectedTaskId={selectedTaskId}
                    onTaskClick={onTaskClick}
                    priorityColors={priorityColors}
                  />
                  {showCurrentTime && (
                    <GanttCurrentTimeMarkerRoot
                      currentTime={Date.now()}
                      timeWindowStart={windowStart}
                      timeWindowEnd={windowEnd}
                    />
                  )}
                </div>
              ))}
            </div>
          </GanttScene>
        </div>
      );
    }
  )
);

GanttEnhanced.displayName = "GanttEnhanced";
