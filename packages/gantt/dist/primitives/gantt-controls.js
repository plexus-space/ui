"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, memo } from "react";
/**
 * GanttControlButtonRoot - A primitive button component for Gantt controls.
 *
 * @example
 * ```tsx
 * <GanttControlButtonRoot onClick={handleClick}>
 *   <ChevronLeftIcon />
 * </GanttControlButtonRoot>
 * ```
 */
export const GanttControlButtonRoot = forwardRef(({ children, active, size = "md", className = "", ...props }, ref) => {
    const sizeClasses = {
        sm: "h-6 w-6 text-xs",
        md: "h-8 w-8 text-sm",
        lg: "h-10 w-10 text-base",
    };
    return (_jsx("button", { ref: ref, className: `
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        border border-gray-800
        bg-gray-950 hover:bg-gray-900
        text-gray-400 hover:text-gray-200
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${active ? "bg-gray-800 text-gray-100 border-gray-700" : ""}
        ${className}
      `, ...props, children: children }));
});
GanttControlButtonRoot.displayName = "GanttControlButtonRoot";
/**
 * GanttNavigationControlsRoot - Primitive component for time navigation controls.
 *
 * @example
 * ```tsx
 * const controls = useGanttControls();
 *
 * <GanttNavigationControlsRoot
 *   onBackward={controls.navigateBackward}
 *   onForward={controls.navigateForward}
 *   onJumpToNow={controls.jumpToNow}
 * />
 * ```
 */
export const GanttNavigationControlsRoot = memo(forwardRef(({ onBackward, onForward, onJumpToNow, disabled, labels = {
    backward: "Previous",
    forward: "Next",
    now: "Now",
}, }, ref) => {
    return (_jsxs("div", { ref: ref, className: "flex items-center gap-1", children: [_jsx(GanttControlButtonRoot, { onClick: onBackward, disabled: disabled, title: labels.backward, "aria-label": labels.backward, children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx(GanttControlButtonRoot, { onClick: onJumpToNow, disabled: disabled, title: labels.now, "aria-label": labels.now, className: "px-3 w-auto text-xs", children: "NOW" }), _jsx(GanttControlButtonRoot, { onClick: onForward, disabled: disabled, title: labels.forward, "aria-label": labels.forward, children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }));
}));
GanttNavigationControlsRoot.displayName = "GanttNavigationControlsRoot";
/**
 * GanttZoomControlsRoot - Primitive component for zoom controls.
 *
 * @example
 * ```tsx
 * const controls = useGanttControls();
 *
 * <GanttZoomControlsRoot
 *   onZoomIn={controls.zoomIn}
 *   onZoomOut={controls.zoomOut}
 * />
 * ```
 */
export const GanttZoomControlsRoot = memo(forwardRef(({ onZoomIn, onZoomOut, disabled, labels = {
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
}, }, ref) => {
    return (_jsxs("div", { ref: ref, className: "flex items-center gap-1", children: [_jsx(GanttControlButtonRoot, { onClick: onZoomOut, disabled: disabled, title: labels.zoomOut, "aria-label": labels.zoomOut, children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" }) }) }), _jsx(GanttControlButtonRoot, { onClick: onZoomIn, disabled: disabled, title: labels.zoomIn, "aria-label": labels.zoomIn, children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" }) }) })] }));
}));
GanttZoomControlsRoot.displayName = "GanttZoomControlsRoot";
export const COMMON_TIMEZONES = [
    { label: "UTC", offset: 0 },
    { label: "EST (UTC-5)", offset: -5 },
    { label: "CST (UTC-6)", offset: -6 },
    { label: "MST (UTC-7)", offset: -7 },
    { label: "PST (UTC-8)", offset: -8 },
    { label: "GMT (UTC+0)", offset: 0 },
    { label: "CET (UTC+1)", offset: 1 },
    { label: "EET (UTC+2)", offset: 2 },
    { label: "IST (UTC+5:30)", offset: 5.5 },
    { label: "JST (UTC+9)", offset: 9 },
    { label: "AEST (UTC+10)", offset: 10 },
];
/**
 * GanttTimezoneSelectRoot - Primitive component for timezone selection.
 *
 * @example
 * ```tsx
 * const controls = useGanttControls();
 *
 * <GanttTimezoneSelectRoot
 *   value={controls.timezoneOffset}
 *   onChange={controls.changeTimezone}
 * />
 * ```
 */
export const GanttTimezoneSelectRoot = memo(forwardRef(({ value, onChange, options = COMMON_TIMEZONES, disabled }, ref) => {
    return (_jsx("select", { ref: ref, value: value, onChange: (e) => onChange(Number(e.target.value)), disabled: disabled, className: "\n            h-8 px-2 text-xs\n            bg-gray-950 border border-gray-800\n            text-gray-300\n            hover:bg-gray-900 hover:border-gray-700\n            focus:outline-none focus:ring-2 focus:ring-blue-500/50\n            disabled:opacity-50 disabled:cursor-not-allowed\n            transition-colors duration-150\n          ", children: options.map((tz) => (_jsx("option", { value: tz.offset, children: tz.label }, `${tz.label}-${tz.offset}`))) }));
}));
GanttTimezoneSelectRoot.displayName = "GanttTimezoneSelectRoot";
/**
 * GanttControlBarRoot - A primitive container for grouping Gantt controls.
 *
 * @example
 * ```tsx
 * <GanttControlBarRoot>
 *   <GanttNavigationControlsRoot {...navProps} />
 *   <GanttZoomControlsRoot {...zoomProps} />
 *   <GanttTimezoneSelectRoot {...tzProps} />
 * </GanttControlBarRoot>
 * ```
 */
export const GanttControlBarRoot = forwardRef(({ children, className = "" }, ref) => {
    return (_jsx("div", { ref: ref, className: `
        flex items-center gap-4 px-3 py-2
        bg-black border border-gray-900 rounded-lg
        ${className}
      `, children: children }));
});
GanttControlBarRoot.displayName = "GanttControlBarRoot";
/**
 * GanttControlBar - Composed control bar with all controls.
 *
 * @example
 * ```tsx
 * const controls = useGanttControls();
 *
 * <GanttControlBar controls={controls} />
 * ```
 */
export const GanttControlBar = memo(forwardRef(({ controls, showNavigation = true, showZoom = true, showTimezone = true, timezoneOptions, children, }, ref) => {
    return (_jsxs(GanttControlBarRoot, { ref: ref, children: [showNavigation && (_jsx(GanttNavigationControlsRoot, { onBackward: controls.navigateBackward, onForward: controls.navigateForward, onJumpToNow: controls.jumpToNow })), showZoom && (_jsx(GanttZoomControlsRoot, { onZoomIn: controls.zoomIn, onZoomOut: controls.zoomOut })), showTimezone && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Timezone:" }), _jsx(GanttTimezoneSelectRoot, { value: controls.timezoneOffset, onChange: controls.changeTimezone, options: timezoneOptions })] })), children] }));
}));
GanttControlBar.displayName = "GanttControlBar";
