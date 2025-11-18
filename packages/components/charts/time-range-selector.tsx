"use client";

import * as React from "react";
import { cn } from "../lib/utils";

// ============================================================================
// Types
// ============================================================================

/**
 * Preset time range option
 */
export interface TimeRangePreset {
  /** Display label for the preset button */
  label: string;
  /** Value in milliseconds or custom identifier */
  value: string | number;
  /** Description shown on hover */
  description?: string;
}

/**
 * Time range value
 */
export interface TimeRange {
  /** Start timestamp in milliseconds */
  start: number;
  /** End timestamp in milliseconds */
  end: number;
}

/**
 * Props for TimeRangeSelector component
 */
export interface TimeRangeSelectorProps {
  /**
   * Currently selected time range
   */
  value?: TimeRange;
  /**
   * Callback when time range changes
   */
  onChange?: (range: TimeRange) => void;
  /**
   * Preset time range options
   * @default [1h, 6h, 24h, 7d, 30d]
   */
  presets?: TimeRangePreset[];
  /**
   * Enable custom range selection
   * @default true
   */
  allowCustom?: boolean;
  /**
   * Timezone for display (IANA identifier)
   * @default "UTC"
   */
  timezone?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Disable the selector
   * @default false
   */
  disabled?: boolean;
}

// ============================================================================
// Default Presets
// ============================================================================

const DEFAULT_PRESETS: TimeRangePreset[] = [
  { label: "1H", value: 3600000, description: "Last hour" },
  { label: "6H", value: 21600000, description: "Last 6 hours" },
  { label: "24H", value: 86400000, description: "Last 24 hours" },
  { label: "7D", value: 604800000, description: "Last 7 days" },
  { label: "30D", value: 2592000000, description: "Last 30 days" },
];

// ============================================================================
// Component
// ============================================================================

/**
 * TimeRangeSelector - Select time ranges for data visualization
 *
 * A beautiful shadcn-styled component for selecting time ranges with preset
 * buttons and optional custom range selection.
 *
 * @example
 * ```tsx
 * <TimeRangeSelector
 *   value={{ start: Date.now() - 3600000, end: Date.now() }}
 *   onChange={(range) => console.log(range)}
 * />
 * ```
 */
export function TimeRangeSelector({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  allowCustom = true,
  timezone = "UTC",
  className,
  disabled = false,
}: TimeRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<
    string | number | null
  >(null);
  const [isCustom, setIsCustom] = React.useState(false);

  const handlePresetClick = (preset: TimeRangePreset) => {
    if (disabled) return;

    const now = Date.now();
    const duration = typeof preset.value === "number" ? preset.value : 0;
    const newRange: TimeRange = {
      start: now - duration,
      end: now,
    };

    setSelectedPreset(preset.value);
    setIsCustom(false);
    onChange?.(newRange);
  };

  const handleCustomClick = () => {
    if (disabled) return;
    setIsCustom(true);
    setSelectedPreset(null);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Preset Buttons */}
      <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-950">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset)}
            disabled={disabled}
            title={preset.description}
            className={cn(
              "relative inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium ring-offset-white transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
              selectedPreset === preset.value
                ? "bg-neutral-900 text-neutral-50 shadow-sm dark:bg-neutral-50 dark:text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Range Button */}
      {allowCustom && (
        <button
          onClick={handleCustomClick}
          disabled={disabled}
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-4 text-sm font-medium ring-offset-white transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
            isCustom
              ? "border-neutral-900 bg-neutral-900 text-neutral-50 dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-900"
              : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 dark:hover:bg-neutral-800"
          )}
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          Custom
        </button>
      )}

      {/* Current Range Display */}
      {value && (
        <div className="ml-2 flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-mono">
            {new Date(value.start).toLocaleString("en-US", {
              timeZone: timezone,
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span>→</span>
          <span className="font-mono">
            {new Date(value.end).toLocaleString("en-US", {
              timeZone: timezone,
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

TimeRangeSelector.displayName = "TimeRangeSelector";
