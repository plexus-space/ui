"use client";

import * as React from "react";
import { cn } from "../lib/utils";

// ============================================================================
// Types
// ============================================================================

/**
 * Filter option item
 */
export interface FilterOption {
  /** Unique identifier */
  value: string;
  /** Display label */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional color indicator */
  color?: string;
  /** Optional icon or badge */
  badge?: string;
}

/**
 * Props for MultiSelectFilter component
 */
export interface MultiSelectFilterProps {
  /**
   * Available filter options
   */
  options: FilterOption[];
  /**
   * Currently selected values
   */
  value?: string[];
  /**
   * Callback when selection changes
   */
  onChange?: (selected: string[]) => void;
  /**
   * Placeholder text when no options selected
   * @default "Select options..."
   */
  placeholder?: string;
  /**
   * Maximum number of selections allowed
   */
  maxSelections?: number;
  /**
   * Show search input for filtering options
   * @default true for > 10 options
   */
  searchable?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Disable the selector
   * @default false
   */
  disabled?: boolean;
  /**
   * Display mode
   * @default "dropdown"
   */
  mode?: "dropdown" | "pills" | "chips";
}

// ============================================================================
// Component
// ============================================================================

/**
 * MultiSelectFilter - Select multiple filter options
 *
 * A beautiful shadcn-styled multi-select component for filtering data series,
 * metrics, sensors, or any categorical data.
 *
 * @example
 * ```tsx
 * <MultiSelectFilter
 *   options={[
 *     { value: 'temp', label: 'Temperature', color: '#ef4444' },
 *     { value: 'pressure', label: 'Pressure', color: '#3b82f6' },
 *   ]}
 *   value={['temp']}
 *   onChange={(selected) => console.log(selected)}
 * />
 * ```
 */
export function MultiSelectFilter({
  options,
  value = [],
  onChange,
  placeholder = "Select options...",
  maxSelections,
  searchable = options.length > 10,
  className,
  disabled = false,
  mode = "dropdown",
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleToggle = (optionValue: string) => {
    if (disabled) return;

    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : maxSelections && value.length >= maxSelections
        ? value
        : [...value, optionValue];

    onChange?.(newValue);
  };

  const handleRemove = (optionValue: string) => {
    if (disabled) return;
    onChange?.(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  // Pills mode - show as horizontal pills
  if (mode === "pills") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => handleToggle(option.value)}
              disabled={disabled || (!isSelected && maxSelections !== undefined && value.length >= maxSelections)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                "dark:focus-visible:ring-neutral-300",
                isSelected
                  ? "bg-neutral-900 text-neutral-50 shadow-sm dark:bg-neutral-50 dark:text-neutral-900"
                  : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 dark:hover:bg-neutral-800"
              )}
            >
              {option.color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
              )}
              {option.label}
              {option.badge && (
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-800">
                  {option.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Chips mode - show selected as removable chips
  if (mode === "chips") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {selectedOptions.map((option) => (
          <div
            key={option.value}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-neutral-200 bg-white pl-3 pr-1 text-sm font-medium text-neutral-900 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
          >
            {option.color && (
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: option.color }}
              />
            )}
            {option.label}
            <button
              onClick={() => handleRemove(option.value)}
              disabled={disabled}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:hover:bg-neutral-800 dark:focus:ring-neutral-300"
            >
              <svg
                className="h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    );
  }

  // Dropdown mode (default)
  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white",
          "focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:focus:ring-neutral-300"
        )}
      >
        <span className="flex flex-1 items-center gap-2 overflow-hidden">
          {selectedOptions.length > 0 ? (
            <span className="truncate text-neutral-900 dark:text-neutral-50">
              {selectedOptions.map((opt) => opt.label).join(", ")}
            </span>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">{placeholder}</span>
          )}
        </span>
        <svg
          className={cn("h-4 w-4 shrink-0 text-neutral-500 transition-transform", isOpen && "rotate-180")}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
          {/* Search Input */}
          {searchable && (
            <div className="border-b border-neutral-200 p-2 dark:border-neutral-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={cn(
                  "w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-neutral-950",
                  "dark:border-neutral-800 dark:bg-neutral-950 dark:focus:ring-neutral-300"
                )}
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">No options found</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                const isDisabled =
                  disabled || (!isSelected && maxSelections !== undefined && value.length >= maxSelections);

                return (
                  <button
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    disabled={isDisabled}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-300",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      isSelected
                        ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                        : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        isSelected
                          ? "border-neutral-900 bg-neutral-900 dark:border-neutral-50 dark:bg-neutral-50"
                          : "border-neutral-300 dark:border-neutral-700"
                      )}
                    >
                      {isSelected && (
                        <svg
                          className="h-3 w-3 text-neutral-50 dark:text-neutral-900"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </div>

                    {/* Color indicator */}
                    {option.color && (
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                    )}

                    {/* Label and description */}
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate">{option.label}</div>
                      {option.description && (
                        <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                          {option.description}
                        </div>
                      )}
                    </div>

                    {/* Badge */}
                    {option.badge && (
                      <span className="shrink-0 rounded bg-neutral-200 px-1.5 py-0.5 text-xs dark:bg-neutral-700">
                        {option.badge}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

MultiSelectFilter.displayName = "MultiSelectFilter";
