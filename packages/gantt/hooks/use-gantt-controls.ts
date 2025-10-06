"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Configuration for Gantt chart controls
 */
export interface GanttControlsConfig {
  /** Initial time window start (Unix timestamp in ms). Defaults to now. */
  initialStart?: number;
  /** Duration of the time window in milliseconds. Default: 12 hours */
  windowDuration?: number;
  /** Timezone offset in hours from UTC. Default: local timezone */
  timezoneOffset?: number;
  /** Step size for navigation in milliseconds. Default: 1 hour */
  navigationStep?: number;
  /** Minimum zoom level (minimum window duration in ms). Default: 1 hour */
  minZoom?: number;
  /** Maximum zoom level (maximum window duration in ms). Default: 7 days */
  maxZoom?: number;
}

/**
 * Hook for managing Gantt chart controls including timezone, scrolling, and navigation
 *
 * @example
 * ```tsx
 * const controls = useGanttControls({
 *   windowDuration: 24 * 60 * 60 * 1000, // 24 hours
 *   timezoneOffset: -5 // EST
 * });
 *
 * return (
 *   <div>
 *     <GanttControlBar {...controls} />
 *     <Gantt
 *       timeWindowStart={controls.windowStart}
 *       timeWindowDuration={controls.windowDuration}
 *     />
 *   </div>
 * );
 * ```
 */
export function useGanttControls(config: GanttControlsConfig = {}) {
  const {
    initialStart,
    windowDuration = 12 * 60 * 60 * 1000, // 12 hours
    timezoneOffset: initialTimezoneOffset,
    navigationStep = 60 * 60 * 1000, // 1 hour
    minZoom = 60 * 60 * 1000, // 1 hour
    maxZoom = 7 * 24 * 60 * 60 * 1000, // 7 days
  } = config;

  // Get local timezone offset if not provided
  const localOffset = -new Date().getTimezoneOffset() / 60;

  const [windowStart, setWindowStart] = useState<number>(
    initialStart ?? Date.now()
  );
  const [duration, setDuration] = useState<number>(windowDuration);
  const [timezoneOffset, setTimezoneOffset] = useState<number>(
    initialTimezoneOffset ?? localOffset
  );

  const isDragging = useRef(false);
  const lastMouseX = useRef(0);

  /**
   * Navigate forward in time
   */
  const navigateForward = useCallback(() => {
    setWindowStart((prev) => prev + navigationStep);
  }, [navigationStep]);

  /**
   * Navigate backward in time
   */
  const navigateBackward = useCallback(() => {
    setWindowStart((prev) => prev - navigationStep);
  }, [navigationStep]);

  /**
   * Jump to current time
   */
  const jumpToNow = useCallback(() => {
    setWindowStart(Date.now());
  }, []);

  /**
   * Jump to a specific timestamp
   */
  const jumpToTime = useCallback((timestamp: number) => {
    setWindowStart(timestamp);
  }, []);

  /**
   * Zoom in (decrease window duration)
   */
  const zoomIn = useCallback(() => {
    setDuration((prev) => {
      const newDuration = prev * 0.75;
      return Math.max(minZoom, newDuration);
    });
  }, [minZoom]);

  /**
   * Zoom out (increase window duration)
   */
  const zoomOut = useCallback(() => {
    setDuration((prev) => {
      const newDuration = prev * 1.33;
      return Math.min(maxZoom, newDuration);
    });
  }, [maxZoom]);

  /**
   * Set zoom to a specific duration
   */
  const setZoom = useCallback((newDuration: number) => {
    const clampedDuration = Math.max(minZoom, Math.min(maxZoom, newDuration));
    setDuration(clampedDuration);
  }, [minZoom, maxZoom]);

  /**
   * Change timezone offset
   */
  const changeTimezone = useCallback((offsetHours: number) => {
    setTimezoneOffset(offsetHours);
  }, []);

  /**
   * Pan (drag) the timeline
   */
  const handlePanStart = useCallback((clientX: number) => {
    isDragging.current = true;
    lastMouseX.current = clientX;
  }, []);

  const handlePanMove = useCallback((clientX: number, containerWidth: number) => {
    if (!isDragging.current) return;

    const deltaX = clientX - lastMouseX.current;
    const timePerPixel = duration / containerWidth;
    const timeDelta = -deltaX * timePerPixel;

    setWindowStart((prev) => prev + timeDelta);
    lastMouseX.current = clientX;
  }, [duration]);

  const handlePanEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  /**
   * Handle mouse wheel for horizontal scroll and zoom
   */
  const handleWheel = useCallback(
    (event: WheelEvent, isShiftPressed: boolean) => {
      event.preventDefault();

      if (isShiftPressed) {
        // Shift + Wheel = Zoom
        if (event.deltaY < 0) {
          zoomIn();
        } else {
          zoomOut();
        }
      } else {
        // Wheel = Horizontal scroll
        const scrollAmount = (event.deltaY / 100) * navigationStep;
        setWindowStart((prev) => prev + scrollAmount);
      }
    },
    [navigationStep, zoomIn, zoomOut]
  );

  /**
   * Convert timestamp to timezone-adjusted timestamp
   */
  const toTimezoneTime = useCallback(
    (timestamp: number) => {
      const utcOffset = -new Date(timestamp).getTimezoneOffset() / 60;
      const offsetDiff = timezoneOffset - utcOffset;
      return timestamp + offsetDiff * 60 * 60 * 1000;
    },
    [timezoneOffset]
  );

  /**
   * Get timezone-adjusted window start
   */
  const adjustedWindowStart = toTimezoneTime(windowStart);

  return {
    // State
    windowStart,
    windowDuration: duration,
    timezoneOffset,
    adjustedWindowStart,

    // Navigation
    navigateForward,
    navigateBackward,
    jumpToNow,
    jumpToTime,

    // Zoom
    zoomIn,
    zoomOut,
    setZoom,

    // Timezone
    changeTimezone,
    toTimezoneTime,

    // Pan/Drag
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    isDragging: isDragging.current,

    // Wheel
    handleWheel,

    // Direct setters
    setWindowStart,
    setWindowDuration: setDuration,
  };
}

export type GanttControls = ReturnType<typeof useGanttControls>;
