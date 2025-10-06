"use client";

import { forwardRef, memo } from "react";
import type { GanttControls } from "../hooks/use-gantt-controls";

// ============================================================================
// CONTROL BUTTON PRIMITIVE
// ============================================================================

export interface GanttControlButtonRootProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
export const GanttControlButtonRoot = forwardRef<
  HTMLButtonElement,
  GanttControlButtonRootProps
>(({ children, active, size = "md", className = "", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        border border-gray-800
        bg-gray-950 hover:bg-gray-900
        text-gray-400 hover:text-gray-200
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${active ? "bg-gray-800 text-gray-100 border-gray-700" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

GanttControlButtonRoot.displayName = "GanttControlButtonRoot";

// ============================================================================
// NAVIGATION CONTROLS PRIMITIVE
// ============================================================================

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
export const GanttNavigationControlsRoot = memo(
  forwardRef<HTMLDivElement, GanttNavigationControlsRootProps>(
    (
      {
        onBackward,
        onForward,
        onJumpToNow,
        disabled,
        labels = {
          backward: "Previous",
          forward: "Next",
          now: "Now",
        },
      },
      ref
    ) => {
      return (
        <div ref={ref} className="flex items-center gap-1">
          <GanttControlButtonRoot
            onClick={onBackward}
            disabled={disabled}
            title={labels.backward}
            aria-label={labels.backward}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </GanttControlButtonRoot>

          <GanttControlButtonRoot
            onClick={onJumpToNow}
            disabled={disabled}
            title={labels.now}
            aria-label={labels.now}
            className="px-3 w-auto text-xs"
          >
            NOW
          </GanttControlButtonRoot>

          <GanttControlButtonRoot
            onClick={onForward}
            disabled={disabled}
            title={labels.forward}
            aria-label={labels.forward}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </GanttControlButtonRoot>
        </div>
      );
    }
  )
);

GanttNavigationControlsRoot.displayName = "GanttNavigationControlsRoot";

// ============================================================================
// ZOOM CONTROLS PRIMITIVE
// ============================================================================

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
export const GanttZoomControlsRoot = memo(
  forwardRef<HTMLDivElement, GanttZoomControlsRootProps>(
    (
      {
        onZoomIn,
        onZoomOut,
        disabled,
        labels = {
          zoomIn: "Zoom In",
          zoomOut: "Zoom Out",
        },
      },
      ref
    ) => {
      return (
        <div ref={ref} className="flex items-center gap-1">
          <GanttControlButtonRoot
            onClick={onZoomOut}
            disabled={disabled}
            title={labels.zoomOut}
            aria-label={labels.zoomOut}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
          </GanttControlButtonRoot>

          <GanttControlButtonRoot
            onClick={onZoomIn}
            disabled={disabled}
            title={labels.zoomIn}
            aria-label={labels.zoomIn}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </GanttControlButtonRoot>
        </div>
      );
    }
  )
);

GanttZoomControlsRoot.displayName = "GanttZoomControlsRoot";

// ============================================================================
// TIMEZONE SELECT PRIMITIVE
// ============================================================================

export interface TimezoneOption {
  label: string;
  offset: number;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
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
export const GanttTimezoneSelectRoot = memo(
  forwardRef<HTMLSelectElement, GanttTimezoneSelectRootProps>(
    ({ value, onChange, options = COMMON_TIMEZONES, disabled }, ref) => {
      return (
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="
            h-8 px-2 text-xs
            bg-gray-950 border border-gray-800
            text-gray-300
            hover:bg-gray-900 hover:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
          "
        >
          {options.map((tz) => (
            <option key={`${tz.label}-${tz.offset}`} value={tz.offset}>
              {tz.label}
            </option>
          ))}
        </select>
      );
    }
  )
);

GanttTimezoneSelectRoot.displayName = "GanttTimezoneSelectRoot";

// ============================================================================
// CONTROL BAR PRIMITIVE
// ============================================================================

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
export const GanttControlBarRoot = forwardRef<
  HTMLDivElement,
  GanttControlBarRootProps
>(({ children, className = "" }, ref) => {
  return (
    <div
      ref={ref}
      className={`
        flex items-center gap-4 px-3 py-2
        bg-black border border-gray-900 rounded-lg
        ${className}
      `}
    >
      {children}
    </div>
  );
});

GanttControlBarRoot.displayName = "GanttControlBarRoot";

// ============================================================================
// COMPOSED CONTROL BAR
// ============================================================================

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
export const GanttControlBar = memo(
  forwardRef<HTMLDivElement, GanttControlBarProps>(
    (
      {
        controls,
        showNavigation = true,
        showZoom = true,
        showTimezone = true,
        timezoneOptions,
        children,
      },
      ref
    ) => {
      return (
        <GanttControlBarRoot ref={ref}>
          {showNavigation && (
            <GanttNavigationControlsRoot
              onBackward={controls.navigateBackward}
              onForward={controls.navigateForward}
              onJumpToNow={controls.jumpToNow}
            />
          )}

          {showZoom && (
            <GanttZoomControlsRoot
              onZoomIn={controls.zoomIn}
              onZoomOut={controls.zoomOut}
            />
          )}

          {showTimezone && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Timezone:</span>
              <GanttTimezoneSelectRoot
                value={controls.timezoneOffset}
                onChange={controls.changeTimezone}
                options={timezoneOptions}
              />
            </div>
          )}

          {children}
        </GanttControlBarRoot>
      );
    }
  )
);

GanttControlBar.displayName = "GanttControlBar";
