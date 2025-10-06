"use client";
import { useState, useCallback, useRef } from "react";
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
export function useGanttControls(config = {}) {
    const { initialStart, windowDuration = 12 * 60 * 60 * 1000, // 12 hours
    timezoneOffset: initialTimezoneOffset, navigationStep = 60 * 60 * 1000, // 1 hour
    minZoom = 60 * 60 * 1000, // 1 hour
    maxZoom = 7 * 24 * 60 * 60 * 1000, // 7 days
     } = config;
    // Get local timezone offset if not provided
    const localOffset = -new Date().getTimezoneOffset() / 60;
    const [windowStart, setWindowStart] = useState(initialStart ?? Date.now());
    const [duration, setDuration] = useState(windowDuration);
    const [timezoneOffset, setTimezoneOffset] = useState(initialTimezoneOffset ?? localOffset);
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
    const jumpToTime = useCallback((timestamp) => {
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
    const setZoom = useCallback((newDuration) => {
        const clampedDuration = Math.max(minZoom, Math.min(maxZoom, newDuration));
        setDuration(clampedDuration);
    }, [minZoom, maxZoom]);
    /**
     * Change timezone offset
     */
    const changeTimezone = useCallback((offsetHours) => {
        setTimezoneOffset(offsetHours);
    }, []);
    /**
     * Pan (drag) the timeline
     */
    const handlePanStart = useCallback((clientX) => {
        isDragging.current = true;
        lastMouseX.current = clientX;
    }, []);
    const handlePanMove = useCallback((clientX, containerWidth) => {
        if (!isDragging.current)
            return;
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
    const handleWheel = useCallback((event, isShiftPressed) => {
        event.preventDefault();
        if (isShiftPressed) {
            // Shift + Wheel = Zoom
            if (event.deltaY < 0) {
                zoomIn();
            }
            else {
                zoomOut();
            }
        }
        else {
            // Wheel = Horizontal scroll
            const scrollAmount = (event.deltaY / 100) * navigationStep;
            setWindowStart((prev) => prev + scrollAmount);
        }
    }, [navigationStep, zoomIn, zoomOut]);
    /**
     * Convert timestamp to timezone-adjusted timestamp
     */
    const toTimezoneTime = useCallback((timestamp) => {
        const utcOffset = -new Date(timestamp).getTimezoneOffset() / 60;
        const offsetDiff = timezoneOffset - utcOffset;
        return timestamp + offsetDiff * 60 * 60 * 1000;
    }, [timezoneOffset]);
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
