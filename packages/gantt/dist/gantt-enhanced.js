"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, forwardRef, useMemo, useRef, useEffect, useCallback, } from "react";
import { GanttScene, GanttHeaderRoot, GanttTimelineRoot, GanttCurrentTimeMarkerRoot, } from "./gantt";
import { useGanttControls } from "./hooks";
import { GanttControlBar } from "./primitives/gantt-controls";
/**
 * Default time formatter with timezone support
 */
const defaultFormatTimeWithTZ = (timestamp, timezoneOffset) => {
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
export const GanttEnhanced = memo(forwardRef(({ groups, divisions = 12, title = "Timeline", leftLabel, selectedTaskId, onTaskClick, showCurrentTime = true, controls: customControls, formatTime, priorityColors, controlsConfig, showControls = true, enablePan = true, enableWheel = true, showNavigation = true, showZoom = true, showTimezone = true, additionalControls, }, ref) => {
    const timelineRef = useRef(null);
    // Initialize controls
    const ganttControls = useGanttControls(controlsConfig);
    const { windowStart, windowDuration, timezoneOffset, handlePanStart, handlePanMove, handlePanEnd, handleWheel, } = ganttControls;
    const windowEnd = windowStart + windowDuration;
    // Time formatter with timezone support
    const timeFormatter = useCallback((timestamp) => {
        if (formatTime) {
            return formatTime(timestamp, timezoneOffset);
        }
        return defaultFormatTimeWithTZ(timestamp, timezoneOffset);
    }, [formatTime, timezoneOffset]);
    // Pan handlers
    const handleMouseDown = useCallback((e) => {
        if (!enablePan)
            return;
        handlePanStart(e.clientX);
    }, [enablePan, handlePanStart]);
    const handleMouseMove = useCallback((e) => {
        if (!enablePan || !timelineRef.current)
            return;
        const containerWidth = timelineRef.current.offsetWidth;
        handlePanMove(e.clientX, containerWidth);
    }, [enablePan, handlePanMove]);
    const handleMouseUp = useCallback(() => {
        if (!enablePan)
            return;
        handlePanEnd();
    }, [enablePan, handlePanEnd]);
    // Touch handlers for mobile
    const handleTouchStart = useCallback((e) => {
        if (!enablePan || e.touches.length === 0)
            return;
        handlePanStart(e.touches[0].clientX);
    }, [enablePan, handlePanStart]);
    const handleTouchMove = useCallback((e) => {
        if (!enablePan || !timelineRef.current || e.touches.length === 0)
            return;
        const containerWidth = timelineRef.current.offsetWidth;
        handlePanMove(e.touches[0].clientX, containerWidth);
    }, [enablePan, handlePanMove]);
    // Wheel handler
    const handleWheelEvent = useCallback((e) => {
        if (!enableWheel)
            return;
        handleWheel(e, e.shiftKey);
    }, [enableWheel, handleWheel]);
    // Setup event listeners
    useEffect(() => {
        if (!timelineRef.current)
            return;
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
        return (_jsxs(_Fragment, { children: [customControls, showControls && (_jsx(GanttControlBar, { controls: ganttControls, showNavigation: showNavigation, showZoom: showZoom, showTimezone: showTimezone, children: additionalControls }))] }));
    }, [
        customControls,
        showControls,
        ganttControls,
        showNavigation,
        showZoom,
        showTimezone,
        additionalControls,
    ]);
    return (_jsxs("div", { ref: ref, className: "space-y-2", children: [showControls && combinedControls, _jsxs(GanttScene, { title: title, controls: !showControls ? combinedControls : undefined, children: [_jsx(GanttHeaderRoot, { timeWindowStart: windowStart, timeWindowEnd: windowEnd, divisions: divisions, leftLabel: leftLabel, formatTime: timeFormatter }), _jsx("div", { ref: timelineRef, className: `${enablePan ? "cursor-grab active:cursor-grabbing" : ""} select-none`, onMouseDown: handleMouseDown, onTouchStart: handleTouchStart, children: groups.map((group) => (_jsxs("div", { className: "relative", children: [_jsx(GanttTimelineRoot, { group: group, timeWindowStart: windowStart, timeWindowEnd: windowEnd, divisions: divisions, selectedTaskId: selectedTaskId, onTaskClick: onTaskClick, priorityColors: priorityColors }), showCurrentTime && (_jsx(GanttCurrentTimeMarkerRoot, { currentTime: Date.now(), timeWindowStart: windowStart, timeWindowEnd: windowEnd }))] }, group.id))) })] })] }));
}));
GanttEnhanced.displayName = "GanttEnhanced";
