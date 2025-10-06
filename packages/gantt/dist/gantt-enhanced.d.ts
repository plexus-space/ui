import { type GanttProps } from "./gantt";
import { type GanttControlsConfig } from "./hooks";
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
export declare const GanttEnhanced: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<GanttEnhancedProps & import("react").RefAttributes<HTMLDivElement>>>;
