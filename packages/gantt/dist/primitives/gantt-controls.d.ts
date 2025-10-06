import type { GanttControls } from "../hooks/use-gantt-controls";
export interface GanttControlButtonRootProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Icon or content to display in the button */
    children: React.ReactNode;
    /** Whether the button is in an active/pressed state */
    active?: boolean;
    /** Size variant of the button */
    size?: "sm" | "md" | "lg";
}
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
export declare const GanttControlButtonRoot: import("react").ForwardRefExoticComponent<GanttControlButtonRootProps & import("react").RefAttributes<HTMLButtonElement>>;
export interface GanttNavigationControlsRootProps {
    /** Callback for backward navigation */
    onBackward: () => void;
    /** Callback for forward navigation */
    onForward: () => void;
    /** Callback for jump to now */
    onJumpToNow: () => void;
    /** Whether controls are disabled */
    disabled?: boolean;
    /** Custom labels for accessibility */
    labels?: {
        backward?: string;
        forward?: string;
        now?: string;
    };
}
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
export declare const GanttNavigationControlsRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GanttNavigationControlsRootProps & import("react").RefAttributes<HTMLDivElement>>>;
export interface GanttZoomControlsRootProps {
    /** Callback for zoom in */
    onZoomIn: () => void;
    /** Callback for zoom out */
    onZoomOut: () => void;
    /** Whether controls are disabled */
    disabled?: boolean;
    /** Custom labels for accessibility */
    labels?: {
        zoomIn?: string;
        zoomOut?: string;
    };
}
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
export declare const GanttZoomControlsRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GanttZoomControlsRootProps & import("react").RefAttributes<HTMLDivElement>>>;
export interface TimezoneOption {
    label: string;
    offset: number;
}
export declare const COMMON_TIMEZONES: TimezoneOption[];
export interface GanttTimezoneSelectRootProps {
    /** Current timezone offset in hours */
    value: number;
    /** Callback when timezone changes */
    onChange: (offset: number) => void;
    /** Available timezone options */
    options?: TimezoneOption[];
    /** Whether the select is disabled */
    disabled?: boolean;
}
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
export declare const GanttTimezoneSelectRoot: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GanttTimezoneSelectRootProps & import("react").RefAttributes<HTMLSelectElement>>>;
export interface GanttControlBarRootProps {
    /** Child controls to render */
    children: React.ReactNode;
    /** Additional className for customization */
    className?: string;
}
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
export declare const GanttControlBarRoot: import("react").ForwardRefExoticComponent<GanttControlBarRootProps & import("react").RefAttributes<HTMLDivElement>>;
export interface GanttControlBarProps {
    /** Gantt controls from useGanttControls hook */
    controls: GanttControls;
    /** Whether to show navigation controls */
    showNavigation?: boolean;
    /** Whether to show zoom controls */
    showZoom?: boolean;
    /** Whether to show timezone selector */
    showTimezone?: boolean;
    /** Additional timezone options */
    timezoneOptions?: TimezoneOption[];
    /** Additional controls to render */
    children?: React.ReactNode;
}
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
export declare const GanttControlBar: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GanttControlBarProps & import("react").RefAttributes<HTMLDivElement>>>;
