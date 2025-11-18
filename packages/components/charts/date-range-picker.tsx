"use client";

import * as React from "react";
import { cn } from "../lib/utils";

// ============================================================================
// Types
// ============================================================================

/**
 * Date range value
 */
export interface DateRange {
  /** Start date */
  from: Date;
  /** End date */
  to: Date;
}

/**
 * Props for DateRangePicker component
 */
export interface DateRangePickerProps {
  /**
   * Currently selected date range
   */
  value?: DateRange;
  /**
   * Callback when date range changes
   */
  onChange?: (range: DateRange | undefined) => void;
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  /**
   * Placeholder text
   * @default "Select date range..."
   */
  placeholder?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Disable the picker
   * @default false
   */
  disabled?: boolean;
  /**
   * Format for displaying dates
   * @default "MMM dd, yyyy"
   */
  dateFormat?: string;
}

// ============================================================================
// Utilities
// ============================================================================

function formatDate(date: Date, format: string = "MMM dd, yyyy"): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isInRange(date: Date, range: DateRange | undefined): boolean {
  if (!range) return false;
  const time = date.getTime();
  return time >= range.from.getTime() && time <= range.to.getTime();
}

// ============================================================================
// Component
// ============================================================================

/**
 * DateRangePicker - Select date ranges for data analysis
 *
 * A beautiful shadcn-styled date range picker with calendar interface,
 * optimized for time-series data analysis.
 *
 * @example
 * ```tsx
 * <DateRangePicker
 *   value={{ from: new Date(2024, 0, 1), to: new Date(2024, 0, 31) }}
 *   onChange={(range) => console.log(range)}
 * />
 * ```
 */
export function DateRangePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date range...",
  className,
  disabled = false,
  dateFormat = "MMM dd, yyyy",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [selectingFrom, setSelectingFrom] = React.useState<Date | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectingFrom(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateClick = (day: number) => {
    if (disabled) return;

    const clickedDate = new Date(currentYear, currentMonth, day);

    // Check min/max constraints
    if (minDate && clickedDate < minDate) return;
    if (maxDate && clickedDate > maxDate) return;

    if (!selectingFrom) {
      // First click - select "from" date
      setSelectingFrom(clickedDate);
    } else {
      // Second click - complete range
      const from = selectingFrom < clickedDate ? selectingFrom : clickedDate;
      const to = selectingFrom < clickedDate ? clickedDate : selectingFrom;
      onChange?.({ from, to });
      setSelectingFrom(null);
      setIsOpen(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before month start
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
          >
            {day}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const date = new Date(currentYear, currentMonth, day);
          const isSelected =
            value && (isSameDay(date, value.from) || isSameDay(date, value.to));
          const isInSelectedRange = value && isInRange(date, value);
          const isDisabled =
            (minDate && date < minDate) || (maxDate && date > maxDate);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={cn(
                "relative h-9 w-9 rounded-md text-sm transition-colors",
                "hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-950",
                "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent",
                "dark:hover:bg-neutral-800 dark:focus:ring-neutral-300",
                isSelected &&
                  "bg-neutral-900 font-semibold text-neutral-50 hover:bg-neutral-900 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50",
                isInSelectedRange &&
                  !isSelected &&
                  "bg-neutral-100 dark:bg-neutral-800"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    );
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
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
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-neutral-500"
            xmlns="http://www.w3.org/2000/svg"
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
          {value ? (
            <span className="text-neutral-900 dark:text-neutral-50">
              {formatDate(value.from, dateFormat)} -{" "}
              {formatDate(value.to, dateFormat)}
            </span>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">
              {placeholder}
            </span>
          )}
        </span>
        <svg
          className={cn(
            "h-4 w-4 shrink-0 text-neutral-500 transition-transform",
            isOpen && "rotate-180"
          )}
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

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-80 rounded-md border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
          {/* Month/Year Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:hover:bg-neutral-800 dark:focus:ring-neutral-300"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              {months[currentMonth]} {currentYear}
            </div>

            <button
              onClick={handleNextMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:hover:bg-neutral-800 dark:focus:ring-neutral-300"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          {renderCalendar()}

          {/* Helper text */}
          {selectingFrom && (
            <div className="mt-3 border-t border-neutral-200 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              Selected start: {formatDate(selectingFrom, dateFormat)}. Click
              another date to complete range.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

DateRangePicker.displayName = "DateRangePicker";
