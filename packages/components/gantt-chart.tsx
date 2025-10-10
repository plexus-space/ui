"use client";

import * as React from "react";
import { addHours, addMinutes, differenceInMinutes } from "date-fns";

// Utility function for class names
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// Timezone utilities (simplified date-fns-tz replacement)
function formatInTimeZone(
  date: Date,
  timezone: string,
  _format: string,
  use12Hour: boolean = false
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: use12Hour,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

// ============================================================================
// Types
// ============================================================================

export type TaskStatus = "planned" | "in-progress" | "completed" | "blocked";

export interface Task {
  id: string;
  name: string;
  start: Date | number;
  end: Date | number;
  status?: TaskStatus;
  color?: string;
  description?: string;
}

export interface GanttChartRootProps {
  tasks: Task[];
  /** Timezone for date formatting (e.g., "America/Los_Angeles", "UTC") */
  timezone?: string;
  /** Chart width in pixels (optional - will use container width if not provided) */
  width?: number;
  /** Height of each task row */
  rowHeight?: number;
  /** Time window to display in hours (default: 24 hours) */
  timeWindowHours?: number;
  /** Start time for the chart (defaults to current time) */
  startTime?: Date | number;
  /** Enable task interactions (hover, click) */
  interactive?: boolean;
  /** Callback when task is clicked */
  onTaskClick?: (task: Task) => void;
  /** Visual variant */
  variant?:
    | "default"
    | "compact"
    | "detailed" /** Use 12-hour time format (default: false for 24-hour) */;
  use12HourFormat?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface GanttContext {
  tasks: Task[];
  timezone: string;
  rowHeight: number;
  startTime: Date;
  endTime: Date;
  xScale: (date: Date) => number;
  hoveredTask: string | null;
  setHoveredTask: (id: string | null) => void;
  onTaskClick?: (task: Task) => void;
  variant: "default" | "compact" | "detailed";
  leftPanelWidth: number;
  totalHeight: number;
  width: number;
  extendedWidth: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  initialScrollPosition: Date;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  timeWindowHours: number;
  use12HourFormat: boolean;
}

const GanttContext = React.createContext<GanttContext | null>(null);

function useGantt() {
  const ctx = React.useContext(GanttContext);
  if (!ctx) throw new Error("useGantt must be used within GanttChart.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function normalizeDate(date: Date | number): Date {
  return typeof date === "number" ? new Date(date) : date;
}

function createTimeScale(
  domain: [Date, Date],
  range: [number, number]
): (date: Date) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const domainMs = d1.getTime() - d0.getTime();
  const rangePixels = r1 - r0;

  return (date: Date) => {
    const ms = date.getTime() - d0.getTime();
    return r0 + (ms / domainMs) * rangePixels;
  };
}

function getTaskColor(task: Task): string {
  if (task.color) return task.color;
  if (task.status === "completed") return "rgb(16, 185, 129)";
  if (task.status === "in-progress") return "rgb(59, 130, 246)";
  if (task.status === "blocked") return "rgb(239, 68, 68)";
  if (task.status === "planned") return "rgb(139, 92, 246)";
  return "rgb(99, 102, 241)";
}

// ============================================================================
// Components
// ============================================================================

interface TimelineHeaderProps {
  width: number;
  leftPanelWidth: number;
}

const TimelineHeader = React.memo(
  ({ width, leftPanelWidth }: TimelineHeaderProps) => {
    const { startTime, endTime, xScale, timezone, use12HourFormat } =
      useGantt();

    // Calculate pixels per hour to determine label density
    const timelineWidth = width - leftPanelWidth;
    const totalHours = differenceInMinutes(endTime, startTime) / 60;
    const pixelsPerHour = timelineWidth / totalHours;

    // Determine hour interval based on available space
    // More space = show more labels, less space = show fewer labels
    const hourInterval = React.useMemo(() => {
      if (pixelsPerHour >= 80) return 1; // Show all hours
      if (pixelsPerHour >= 40) return 2; // Show every 2 hours
      if (pixelsPerHour >= 25) return 3; // Show every 3 hours
      if (pixelsPerHour >= 20) return 4; // Show every 4 hours
      if (pixelsPerHour >= 12) return 6; // Show every 6 hours
      return 12; // Show every 12 hours
    }, [pixelsPerHour]);

    // Generate hour markers
    const hours = React.useMemo(() => {
      const result: Date[] = [];
      let current = new Date(startTime);

      while (current <= endTime) {
        result.push(new Date(current));
        current = addHours(current, 1);
      }

      return result;
    }, [startTime, endTime]);

    return (
      <g>
        {/* Header background */}
        <rect
          x={0}
          y={0}
          width={width}
          height={40}
          fill="currentColor"
          opacity={0.03}
        />
        <line
          x1={0}
          y1={40}
          x2={width}
          y2={40}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.1}
        />

        {/* Left panel header */}
        <text
          x={12}
          y={25}
          fontSize={11}
          fontWeight={600}
          fill="currentColor"
          opacity={0.5}
        >
          CONTACT
        </text>

        {/* Vertical divider */}
        <line
          x1={leftPanelWidth}
          y1={0}
          x2={leftPanelWidth}
          y2={40}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.1}
        />

        {/* Hour labels */}
        {hours.map((hour, i) => {
          const x = xScale(hour);
          const isMidnight = hour.getHours() === 0;
          const currentHour = hour.getHours();

          // Only show labels at the determined interval
          // Always show midnight, or show if hour matches interval
          const shouldShowLabel =
            isMidnight || currentHour % hourInterval === 0;

          if (!shouldShowLabel) return null;

          // Format the label
          const timeLabel = formatInTimeZone(
            hour,
            timezone,
            "HH:mm",
            use12HourFormat
          );
          const dateLabel = isMidnight
            ? new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                month: "short",
                day: "numeric",
              }).format(hour)
            : null;

          // Adjust font sizes based on zoom level
          const timeFontSize =
            pixelsPerHour >= 40 ? 10 : pixelsPerHour >= 20 ? 9 : 8;
          const dateFontSize = pixelsPerHour >= 40 ? 9 : 8;

          return (
            <g key={i}>
              {/* Date label for midnight */}
              {dateLabel && (
                <text
                  x={x + 4}
                  y={14}
                  fontSize={dateFontSize}
                  fontWeight={700}
                  fill="currentColor"
                  opacity={0.7}
                >
                  {dateLabel}
                </text>
              )}
              {/* Time label */}
              <text
                x={x + 4}
                y={dateLabel ? 32 : 25}
                fontSize={timeFontSize}
                fontWeight={isMidnight ? 700 : 600}
                fill="currentColor"
                opacity={isMidnight ? 0.8 : 0.6}
              >
                {timeLabel}
              </text>
            </g>
          );
        })}
      </g>
    );
  }
);

TimelineHeader.displayName = "TimelineHeader";

interface TaskRowProps {
  task: Task;
  index: number;
  leftPanelWidth: number;
  variant: "default" | "compact" | "detailed";
}

const TaskRow = React.memo(
  ({ task, index, leftPanelWidth, variant }: TaskRowProps) => {
    const {
      rowHeight,
      xScale,
      hoveredTask,
      setHoveredTask,
      onTaskClick,
      timezone,
      use12HourFormat,
    } = useGantt();

    const y = 40 + index * rowHeight;
    const start = normalizeDate(task.start);
    const end = normalizeDate(task.end);
    const x1 = xScale(start);
    const x2 = xScale(end);
    const barWidth = Math.max(x2 - x1, 4);
    const color = getTaskColor(task);
    const isHovered = hoveredTask === task.id;
    const durationMinutes = differenceInMinutes(end, start);

    return (
      <g>
        {/* Row background */}
        <rect
          x={0}
          y={y}
          width={leftPanelWidth}
          height={rowHeight}
          fill="currentColor"
          opacity={isHovered ? 0.03 : 0}
        />
        <line
          x1={0}
          y1={y + rowHeight}
          x2={leftPanelWidth}
          y2={y + rowHeight}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.05}
        />

        {/* Task name */}
        <text
          x={12}
          y={y + rowHeight / 2 + 4}
          fontSize={variant === "compact" ? 11 : 12}
          fontWeight={500}
          fill="currentColor"
          opacity={0.9}
        >
          {task.name}
        </text>

        {variant === "detailed" && task.description && (
          <text
            x={12}
            y={y + rowHeight / 2 + 18}
            fontSize={10}
            fill="currentColor"
            opacity={0.5}
          >
            {task.description}
          </text>
        )}

        {/* Task bar */}
        <g
          onMouseEnter={() => setHoveredTask(task.id)}
          onMouseLeave={() => setHoveredTask(null)}
          onClick={() => onTaskClick?.(task)}
          style={{ cursor: onTaskClick ? "pointer" : "default" }}
        >
          {/* Bar background */}
          <rect
            x={x1}
            y={y + rowHeight * 0.35}
            width={barWidth}
            height={rowHeight * 0.3}
            rx={3}
            fill={color}
            opacity={0.2}
          />

          {/* Bar fill */}
          <rect
            x={x1}
            y={y + rowHeight * 0.35}
            width={barWidth}
            height={rowHeight * 0.3}
            rx={3}
            fill={color}
            opacity={0.8}
          />

          {/* Bar border */}
          <rect
            x={x1}
            y={y + rowHeight * 0.35}
            width={barWidth}
            height={rowHeight * 0.3}
            rx={3}
            fill="none"
            stroke={color}
            strokeWidth={isHovered ? 2 : 1}
          />

          {/* Duration label */}
          {barWidth > 40 && (
            <text
              x={x1 + 6}
              y={y + rowHeight / 2 + 3}
              fontSize={10}
              fontWeight={500}
              fill="white"
            >
              {durationMinutes}m
            </text>
          )}

          {/* Tooltip on hover */}
          {isHovered && (
            <g>
              {/* Tooltip background with dark fill */}
              <rect
                x={x1 - 4}
                y={y - 40}
                width={Math.max(barWidth + 8, 200)}
                height={36}
                rx={6}
                fill="#000000"
                opacity={0.9}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={1}
              />
              {/* Task name */}
              <text
                x={x1 + 4}
                y={y - 24}
                fontSize={11}
                fontWeight={600}
                fill="#ffffff"
              >
                {task.name}
              </text>
              {/* Time and duration */}
              <text
                x={x1 + 4}
                y={y - 12}
                fontSize={10}
                fill="#ffffff"
                opacity={0.8}
              >
                {formatInTimeZone(start, timezone, "HH:mm", use12HourFormat)} →{" "}
                {formatInTimeZone(end, timezone, "HH:mm", use12HourFormat)} (
                {durationMinutes}m)
              </text>
            </g>
          )}
        </g>
      </g>
    );
  }
);

TaskRow.displayName = "TaskRow";

interface GridLinesProps {
  leftPanelWidth: number;
  totalHeight: number;
}

const GridLines = React.memo(
  ({ leftPanelWidth, totalHeight }: GridLinesProps) => {
    const { startTime, endTime, xScale, tasks, rowHeight, extendedWidth } =
      useGantt();

    // Generate 15-minute intervals
    const intervals = React.useMemo(() => {
      const result: { time: Date; isHour: boolean }[] = [];
      let current = new Date(startTime);

      while (current <= endTime) {
        result.push({
          time: new Date(current),
          isHour: current.getMinutes() === 0,
        });
        current = addMinutes(current, 15);
      }

      return result;
    }, [startTime, endTime]);

    return (
      <g>
        {/* Vertical time grid lines */}
        {intervals.map((interval, i) => {
          const x = xScale(interval.time);

          return (
            <line
              key={`v-${i}`}
              x1={x}
              y1={40}
              x2={x}
              y2={totalHeight}
              stroke="currentColor"
              strokeWidth={interval.isHour ? 1 : 0.5}
              opacity={interval.isHour ? 0.1 : 0.05}
            />
          );
        })}

        {/* Horizontal row divider lines */}
        {tasks.map((_, i) => {
          const y = 40 + (i + 1) * rowHeight;
          return (
            <line
              key={`h-${i}`}
              x1={leftPanelWidth}
              y1={y}
              x2={extendedWidth}
              y2={y}
              stroke="currentColor"
              strokeWidth={1}
              opacity={0.05}
            />
          );
        })}

        {/* Left panel vertical line */}
        <line
          x1={leftPanelWidth}
          y1={40}
          x2={leftPanelWidth}
          y2={totalHeight}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.1}
        />
      </g>
    );
  }
);

GridLines.displayName = "GridLines";

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const GanttChartRoot = React.forwardRef<HTMLDivElement, GanttChartRootProps>(
  (
    {
      tasks,
      timezone = "UTC",
      width: providedWidth,
      rowHeight = 48,
      timeWindowHours = 12,
      startTime: providedStartTime,
      interactive = true,
      onTaskClick,
      variant = "default",
      use12HourFormat = false,
      className,
      children,
    },
    ref
  ) => {
    const [hoveredTask, setHoveredTask] = React.useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = React.useState(1);
    const [containerWidth, setContainerWidth] = React.useState(
      providedWidth || 1200
    );
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const rootRef = React.useRef<HTMLDivElement>(null);

    // Observe container width for responsiveness
    React.useEffect(() => {
      // If width is explicitly provided, use it and don't observe
      if (providedWidth) {
        setContainerWidth(providedWidth);
        return;
      }

      const element = rootRef.current;
      if (!element) return;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          if (width > 0) {
            setContainerWidth(width);
          }
        }
      });

      observer.observe(element);
      return () => observer.disconnect();
    }, [providedWidth]);

    // Use containerWidth instead of fixed width
    const width = containerWidth;

    // Layout
    const leftPanelWidth =
      variant === "detailed" ? 240 : variant === "compact" ? 160 : 200;
    const totalHeight = 40 + tasks.length * rowHeight;

    // Apply zoom to time window
    const effectiveTimeWindowHours = timeWindowHours / zoomLevel;

    // Calculate total scrollable time range
    const totalScrollDays = 30;
    const totalScrollHours = totalScrollDays * 24;

    // Calculate time window
    const { startTime, endTime, initialScrollPosition } = React.useMemo(() => {
      const now = new Date();
      const baseStart = providedStartTime
        ? normalizeDate(providedStartTime)
        : now;

      // Create a scrollable timeline centered around the base time
      // Start 15 days before, end 15 days after
      const start = addHours(baseStart, -(totalScrollDays / 2) * 24);
      const end = addHours(start, totalScrollHours);

      return {
        startTime: start,
        endTime: end,
        initialScrollPosition: baseStart,
      };
    }, [providedStartTime, totalScrollDays, totalScrollHours]);

    const pixelsPerHour = (width - leftPanelWidth) / effectiveTimeWindowHours;
    const extendedWidth = leftPanelWidth + totalScrollHours * pixelsPerHour;

    const xScale = React.useMemo(
      () =>
        createTimeScale([startTime, endTime], [leftPanelWidth, extendedWidth]),
      [startTime, endTime, leftPanelWidth, extendedWidth]
    );

    const contextValue: GanttContext = React.useMemo(
      () => ({
        tasks,
        timezone,
        rowHeight,
        startTime,
        endTime,
        xScale,
        hoveredTask: interactive ? hoveredTask : null,
        setHoveredTask: interactive ? setHoveredTask : () => {},
        onTaskClick: interactive ? onTaskClick : undefined,
        variant,
        leftPanelWidth,
        totalHeight,
        width,
        extendedWidth,
        scrollContainerRef,
        initialScrollPosition,
        zoomLevel,
        setZoomLevel,
        timeWindowHours: effectiveTimeWindowHours,
        use12HourFormat,
      }),
      [
        tasks,
        timezone,
        rowHeight,
        startTime,
        endTime,
        xScale,
        hoveredTask,
        interactive,
        onTaskClick,
        variant,
        leftPanelWidth,
        totalHeight,
        width,
        extendedWidth,
        initialScrollPosition,
        zoomLevel,
        effectiveTimeWindowHours,
        use12HourFormat,
      ]
    );

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <GanttContext.Provider value={contextValue}>
        <div
          ref={combinedRef}
          className={cn("gantt-chart", className)}
          style={{ width: providedWidth ? `${providedWidth}px` : "100%" }}
        >
          {children}
        </div>
      </GanttContext.Provider>
    );
  }
);

GanttChartRoot.displayName = "GanttChart.Root";

export interface GanttChartContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Container component - wraps the scrollable SVG content
 */
const GanttChartContainer = React.forwardRef<
  HTMLDivElement,
  GanttChartContainerProps
>(({ className, style, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("gantt-chart-container", className)}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

GanttChartContainer.displayName = "GanttChart.Container";

export interface GanttChartViewportProps
  extends React.SVGProps<SVGSVGElement> {}

/**
 * Viewport component - handles scrolling
 */
const GanttChartViewport = React.forwardRef<
  SVGSVGElement,
  GanttChartViewportProps
>(({ className, children, ...props }, ref) => {
  const {
    scrollContainerRef,
    extendedWidth,
    totalHeight,
    xScale,
    leftPanelWidth,
    timeWindowHours,
  } = useGantt();

  // Set initial scroll position to show "now" with ~1 hour of history visible
  React.useEffect(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const viewportWidth = container.clientWidth - leftPanelWidth;

    // Calculate the pixel width for 1 hour of time
    const oneHourInPixels = viewportWidth / timeWindowHours;

    // Always scroll to the actual current time, not initialScrollPosition
    const actualNow = new Date();
    const nowPosition = xScale(actualNow);
    const scrollPosition = nowPosition - leftPanelWidth - oneHourInPixels;

    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: "auto",
    });
  }, [xScale, leftPanelWidth, timeWindowHours]);

  return (
    <div
      ref={scrollContainerRef}
      className="gantt-chart-viewport"
      style={{
        overflowX: "auto",
        overflowY: "hidden",
        width: "100%",
      }}
    >
      <svg
        ref={ref}
        width={extendedWidth}
        height={totalHeight}
        className={cn("gantt-chart-svg", className)}
        style={{ display: "block" }}
        {...props}
      >
        {children}
      </svg>
    </div>
  );
});

GanttChartViewport.displayName = "GanttChart.Viewport";

export interface GanttChartGridProps extends React.SVGProps<SVGGElement> {}

/**
 * Grid component - renders the timeline grid
 */
const GanttChartGrid = React.forwardRef<SVGGElement, GanttChartGridProps>(
  ({ className, children, ...props }, ref) => {
    const { leftPanelWidth, totalHeight } = useGantt();

    return (
      <g ref={ref} className={cn("gantt-chart-grid", className)} {...props}>
        <GridLines leftPanelWidth={leftPanelWidth} totalHeight={totalHeight} />
        {children}
      </g>
    );
  }
);

GanttChartGrid.displayName = "GanttChart.Grid";

export interface GanttChartHeaderProps extends React.SVGProps<SVGGElement> {}

/**
 * Header component - renders the timeline header
 */
const GanttChartHeader = React.forwardRef<SVGGElement, GanttChartHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const { extendedWidth, leftPanelWidth } = useGantt();

    return (
      <g ref={ref} className={cn("gantt-chart-header", className)} {...props}>
        <TimelineHeader width={extendedWidth} leftPanelWidth={leftPanelWidth} />
        {children}
      </g>
    );
  }
);

GanttChartHeader.displayName = "GanttChart.Header";

export interface GanttChartTasksProps extends React.SVGProps<SVGGElement> {}

/**
 * Tasks component - renders all task bars
 */
const GanttChartTasks = React.forwardRef<SVGGElement, GanttChartTasksProps>(
  ({ className, children, ...props }, ref) => {
    const { tasks, leftPanelWidth, variant } = useGantt();

    return (
      <g ref={ref} className={cn("gantt-chart-tasks", className)} {...props}>
        {tasks.map((task, i) => (
          <TaskRow
            key={task.id}
            task={task}
            index={i}
            leftPanelWidth={leftPanelWidth}
            variant={variant}
          />
        ))}
        {children}
      </g>
    );
  }
);

GanttChartTasks.displayName = "GanttChart.Tasks";

export interface GanttChartCurrentTimeProps
  extends React.SVGProps<SVGGElement> {}

/**
 * Current time indicator component
 */
const GanttChartCurrentTime = React.forwardRef<
  SVGGElement,
  GanttChartCurrentTimeProps
>(({ className, children, ...props }, ref) => {
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const { startTime, endTime, xScale, totalHeight } = useGantt();

  // Set initial time and mounted state on client only
  React.useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date());

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render until mounted on client to avoid hydration mismatch
  if (!isMounted || !currentTime) return null;

  // Use raw Date object - no timezone conversion needed
  // The xScale already handles the positioning correctly
  const now = currentTime;
  if (now < startTime || now > endTime) return null;

  const x = xScale(now);

  return (
    <g
      ref={ref}
      className={cn("gantt-chart-current-time", className)}
      {...props}
    >
      <line
        x1={x}
        y1={40}
        x2={x}
        y2={totalHeight}
        stroke="rgb(239, 68, 68)"
        strokeWidth={2}
        strokeDasharray="4,4"
        opacity={0.7}
      />
      <circle cx={x} cy={25} r={4} fill="rgb(239, 68, 68)" />
      {children}
    </g>
  );
});

GanttChartCurrentTime.displayName = "GanttChart.CurrentTime";

export interface GanttChartLeftPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Left panel component - sticky task names
 */
const GanttChartLeftPanel = React.forwardRef<
  HTMLDivElement,
  GanttChartLeftPanelProps
>(({ className, style, children, ...props }, ref) => {
  const { leftPanelWidth, totalHeight, tasks, rowHeight, variant } = useGantt();

  return (
    <div
      ref={ref}
      className={cn("gantt-chart-left-panel", className)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: `${leftPanelWidth}px`,
        height: `${totalHeight}px`,
        pointerEvents: "none",
        zIndex: 10,
        ...style,
      }}
      {...props}
    >
      <svg width={leftPanelWidth} height={totalHeight}>
        {/* Header background */}
        <rect
          x={0}
          y={0}
          width={leftPanelWidth}
          height={40}
          fill="var(--background)"
          opacity={0.98}
        />
        <line
          x1={0}
          y1={40}
          x2={leftPanelWidth}
          y2={40}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.1}
        />

        {/* Header text */}
        <text
          x={12}
          y={25}
          fontSize={11}
          fontWeight={600}
          fill="currentColor"
          opacity={0.5}
        >
          CONTACT
        </text>

        {/* Task names */}
        {tasks.map((task, i) => {
          const y = 40 + i * rowHeight;
          return (
            <g key={task.id}>
              <rect
                x={0}
                y={y}
                width={leftPanelWidth}
                height={rowHeight}
                fill="var(--background)"
                opacity={0.98}
              />
              <line
                x1={0}
                y1={y + rowHeight}
                x2={leftPanelWidth}
                y2={y + rowHeight}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.05}
              />
              <text
                x={12}
                y={y + rowHeight / 2 + 4}
                fontSize={variant === "compact" ? 11 : 12}
                fontWeight={500}
                fill="currentColor"
                opacity={0.9}
              >
                {task.name}
              </text>
              {variant === "detailed" && task.description && (
                <text
                  x={12}
                  y={y + rowHeight / 2 + 18}
                  fontSize={10}
                  fill="currentColor"
                  opacity={0.5}
                >
                  {task.description}
                </text>
              )}
            </g>
          );
        })}

        <line
          x1={leftPanelWidth}
          y1={0}
          x2={leftPanelWidth}
          y2={totalHeight}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.1}
        />
      </svg>
      {children}
    </div>
  );
});

GanttChartLeftPanel.displayName = "GanttChart.LeftPanel";

export interface GanttChartEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Empty state component
 */
const GanttChartEmpty = React.forwardRef<HTMLDivElement, GanttChartEmptyProps>(
  ({ className, style, children, ...props }, ref) => {
    const { width } = useGantt();

    return (
      <div
        ref={ref}
        className={cn("gantt-chart-empty", className)}
        style={{
          width: `${width}px`,
          height: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          border: "1px solid currentColor",
          opacity: 0.1,
          ...style,
        }}
        {...props}
      >
        {children || (
          <div style={{ textAlign: "center", opacity: 10 }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity={0.3}
              style={{ margin: "0 auto 12px" }}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div style={{ fontSize: "14px", opacity: 0.5 }}>
              No contacts scheduled
            </div>
          </div>
        )}
      </div>
    );
  }
);

GanttChartEmpty.displayName = "GanttChart.Empty";

// ============================================================================
// Controls Component
// ============================================================================

export interface GanttChartControlsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onPanLeft?: () => void;
  onPanRight?: () => void;
  onResetView?: () => void;
}

const GanttChartControls = React.forwardRef<
  HTMLDivElement,
  GanttChartControlsProps
>(
  (
    {
      className,
      style,
      children,
      onZoomIn,
      onZoomOut,
      onPanLeft,
      onPanRight,
      onResetView,
      ...props
    },
    ref
  ) => {
    const {
      scrollContainerRef,
      width,
      zoomLevel,
      setZoomLevel,
      xScale,
      leftPanelWidth,
      timeWindowHours,
    } = useGantt();

    const [shouldScrollToNow, setShouldScrollToNow] = React.useState(false);

    // Effect to scroll to "now" after zoom has been reset
    React.useEffect(() => {
      if (!shouldScrollToNow || zoomLevel !== 1) return;

      if (scrollContainerRef.current) {
        const viewportWidth =
          scrollContainerRef.current.clientWidth - leftPanelWidth;
        const oneHourInPixels = viewportWidth / timeWindowHours;

        // Always scroll to actual current time
        const actualNow = new Date();
        const nowPosition = xScale(actualNow);
        const scrollPosition = nowPosition - leftPanelWidth - oneHourInPixels;

        scrollContainerRef.current.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: "smooth",
        });

        setShouldScrollToNow(false);
      }
    }, [
      shouldScrollToNow,
      zoomLevel,
      xScale,
      leftPanelWidth,
      timeWindowHours,
      scrollContainerRef,
    ]);

    const handleZoomIn = () => {
      const currentScroll = scrollContainerRef.current?.scrollLeft || 0;
      const currentCenter =
        currentScroll + (scrollContainerRef.current?.clientWidth || 0) / 2;

      setZoomLevel(Math.min(zoomLevel * 1.5, 4));

      // Adjust scroll to maintain center point
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const newScroll =
            currentCenter * 1.5 - scrollContainerRef.current.clientWidth / 2;
          scrollContainerRef.current.scrollLeft = newScroll;
        }
      }, 0);

      onZoomIn?.();
    };

    const handleZoomOut = () => {
      const currentScroll = scrollContainerRef.current?.scrollLeft || 0;
      const currentCenter =
        currentScroll + (scrollContainerRef.current?.clientWidth || 0) / 2;

      setZoomLevel(Math.max(zoomLevel / 1.5, 0.25));

      // Adjust scroll to maintain center point
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const newScroll =
            currentCenter / 1.5 - scrollContainerRef.current.clientWidth / 2;
          scrollContainerRef.current.scrollLeft = Math.max(0, newScroll);
        }
      }, 0);

      onZoomOut?.();
    };

    const handlePanLeft = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({
          left: -width * 0.5,
          behavior: "smooth",
        });
      }
      onPanLeft?.();
    };

    const handlePanRight = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({
          left: width * 0.5,
          behavior: "smooth",
        });
      }
      onPanRight?.();
    };

    const handleResetView = () => {
      // Reset zoom to 1
      setZoomLevel(1);

      // Trigger scroll to "now" (will happen in useEffect after zoom resets)
      setShouldScrollToNow(true);

      onResetView?.();
    };

    return (
      <div
        ref={ref}
        className={cn("gantt-chart-controls", "flex gap-2", className)}
        style={style}
        {...props}
      >
        <button
          onClick={handlePanLeft}
          className="px-3 py-1.5 text-sm border rounded hover:bg-accent"
          aria-label="Pan left"
        >
          ←
        </button>
        <button
          onClick={handlePanRight}
          className="px-3 py-1.5 text-sm border rounded hover:bg-accent"
          aria-label="Pan right"
        >
          →
        </button>
        <button
          onClick={handleZoomIn}
          className="px-3 py-1.5 text-sm border rounded hover:bg-accent"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="px-3 py-1.5 text-sm border rounded hover:bg-accent"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={handleResetView}
          className="px-3 py-1.5 text-sm border rounded hover:bg-accent"
          aria-label="Reset view"
        >
          Reset
        </button>
        {children}
      </div>
    );
  }
);

GanttChartControls.displayName = "GanttChart.Controls";

// ============================================================================
// Exports
// ============================================================================

export const GanttChart = Object.assign(GanttChartRoot, {
  Root: GanttChartRoot,
  Container: GanttChartContainer,
  Viewport: GanttChartViewport,
  Grid: GanttChartGrid,
  Header: GanttChartHeader,
  Tasks: GanttChartTasks,
  CurrentTime: GanttChartCurrentTime,
  LeftPanel: GanttChartLeftPanel,
  Empty: GanttChartEmpty,
  Controls: GanttChartControls,
});
