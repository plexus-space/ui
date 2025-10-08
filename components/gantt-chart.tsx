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
  format: string
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

function toZonedTime(date: Date, timezone: string): Date {
  const dateString = date.toLocaleString("en-US", { timeZone: timezone });
  return new Date(dateString);
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
  /** Chart width in pixels */
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
  variant?: "default" | "compact" | "detailed";
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
    const { startTime, endTime, xScale, timezone } = useGantt();

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
          const label = formatInTimeZone(hour, timezone, "HH:mm");
          const isEvenHour = hour.getHours() % 2 === 0;

          return (
            <g key={i}>
              <text
                x={x + 4}
                y={25}
                fontSize={10}
                fontWeight={isEvenHour ? 600 : 400}
                fill="currentColor"
                opacity={0.5}
              >
                {label}
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
              <rect
                x={x1}
                y={y - 28}
                width={180}
                height={24}
                rx={4}
                fill="currentColor"
                opacity={0.95}
              />
              <text
                x={x1 + 8}
                y={y - 14}
                fontSize={10}
                fontWeight={500}
                fill="white"
                style={{ mixBlendMode: "difference" }}
              >
                {task.name}
              </text>
              <text
                x={x1 + 8}
                y={y - 4}
                fontSize={9}
                fill="white"
                opacity={0.7}
                style={{ mixBlendMode: "difference" }}
              >
                {formatInTimeZone(start, timezone, "HH:mm")} -{" "}
                {formatInTimeZone(end, timezone, "HH:mm")} ({durationMinutes}m)
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
    const { startTime, endTime, xScale } = useGantt();

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
        {intervals.map((interval, i) => {
          const x = xScale(interval.time);

          return (
            <line
              key={i}
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
      width = 1200,
      rowHeight = 48,
      timeWindowHours = 12,
      startTime: providedStartTime,
      interactive = true,
      onTaskClick,
      variant = "default",
      className,
      children,
    },
    ref
  ) => {
    const [hoveredTask, setHoveredTask] = React.useState<string | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Layout
    const leftPanelWidth =
      variant === "detailed" ? 240 : variant === "compact" ? 160 : 200;
    const totalHeight = 40 + tasks.length * rowHeight;

    // Calculate total scrollable time range
    const totalScrollDays = 30;
    const totalScrollHours = totalScrollDays * 24;

    // Calculate time window
    const { startTime, endTime, initialScrollPosition } = React.useMemo(() => {
      const baseStart = providedStartTime
        ? normalizeDate(providedStartTime)
        : new Date();
      const start = addHours(baseStart, -(totalScrollDays / 2) * 24);
      const end = addHours(start, totalScrollHours);

      return {
        startTime: start,
        endTime: end,
        initialScrollPosition: baseStart,
      };
    }, [providedStartTime, totalScrollDays, totalScrollHours]);

    const pixelsPerHour = (width - leftPanelWidth) / timeWindowHours;
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
      ]
    );

    return (
      <GanttContext.Provider value={contextValue}>
        <div ref={ref} className={cn("gantt-chart", className)}>
          {children}
        </div>
      </GanttContext.Provider>
    );
  }
);

GanttChartRoot.displayName = "GanttChart.Root";

/**
 * Container component - wraps the scrollable SVG content
 */
const GanttChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { width } = useGantt();

  return (
    <div
      ref={ref}
      className={cn("gantt-chart-container", className)}
      style={{
        position: "relative",
        width: `${width}px`,
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
      }}
      {...props}
    />
  );
});

GanttChartContainer.displayName = "GanttChart.Container";

/**
 * Viewport component - handles scrolling
 */
const GanttChartViewport = React.forwardRef<
  SVGSVGElement,
  React.SVGAttributes<SVGSVGElement>
>(({ className, children, ...props }, ref) => {
  const {
    scrollContainerRef,
    extendedWidth,
    totalHeight,
    xScale,
    leftPanelWidth,
    initialScrollPosition,
  } = useGantt();

  // Set initial scroll position
  React.useEffect(() => {
    if (!scrollContainerRef.current) return;

    const livePlusOneHour = addHours(initialScrollPosition, 1);
    const scrollPosition = xScale(livePlusOneHour) - leftPanelWidth;

    scrollContainerRef.current.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: "auto",
    });
  }, []);

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

/**
 * Grid component - renders the timeline grid
 */
const GanttChartGrid = React.forwardRef<
  SVGGElement,
  React.SVGAttributes<SVGGElement>
>(({ className, ...props }, ref) => {
  const { leftPanelWidth, totalHeight } = useGantt();

  return (
    <g ref={ref} className={cn("gantt-chart-grid", className)} {...props}>
      <GridLines leftPanelWidth={leftPanelWidth} totalHeight={totalHeight} />
    </g>
  );
});

GanttChartGrid.displayName = "GanttChart.Grid";

/**
 * Header component - renders the timeline header
 */
const GanttChartHeader = React.forwardRef<
  SVGGElement,
  React.SVGAttributes<SVGGElement>
>(({ className, ...props }, ref) => {
  const { extendedWidth, leftPanelWidth } = useGantt();

  return (
    <g ref={ref} className={cn("gantt-chart-header", className)} {...props}>
      <TimelineHeader width={extendedWidth} leftPanelWidth={leftPanelWidth} />
    </g>
  );
});

GanttChartHeader.displayName = "GanttChart.Header";

/**
 * Tasks component - renders all task bars
 */
const GanttChartTasks = React.forwardRef<
  SVGGElement,
  React.SVGAttributes<SVGGElement>
>(({ className, ...props }, ref) => {
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
    </g>
  );
});

GanttChartTasks.displayName = "GanttChart.Tasks";

/**
 * Current time indicator component
 */
const GanttChartCurrentTime = React.forwardRef<
  SVGGElement,
  React.SVGAttributes<SVGGElement>
>(({ className, ...props }, ref) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const { startTime, endTime, xScale, timezone, totalHeight } = useGantt();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const now = toZonedTime(new Date(), timezone);
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
    </g>
  );
});

GanttChartCurrentTime.displayName = "GanttChart.CurrentTime";

/**
 * Left panel component - sticky task names
 */
const GanttChartLeftPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
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
    </div>
  );
});

GanttChartLeftPanel.displayName = "GanttChart.LeftPanel";

/**
 * Empty state component
 */
const GanttChartEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => {
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
});

GanttChartEmpty.displayName = "GanttChart.Empty";

// ============================================================================
// Controls Component
// ============================================================================

interface GanttChartControlsProps extends React.HTMLAttributes<HTMLDivElement> {
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
      onZoomIn,
      onZoomOut,
      onPanLeft,
      onPanRight,
      onResetView,
      ...props
    },
    ref
  ) => {
    const { scrollContainerRef, width } = useGantt();

    const handleZoomIn = () => {
      onZoomIn?.();
    };

    const handleZoomOut = () => {
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
      onResetView?.();
    };

    return (
      <div
        ref={ref}
        className={cn("gantt-chart-controls", "flex gap-2", className)}
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
