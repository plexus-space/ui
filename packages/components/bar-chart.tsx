"use client";

import * as React from "react";
import {
  cn,
  getDomain,
  createScale,
  formatValue,
  formatTime,
  getTicks,
  type Point,
} from "./lib";

// ============================================================================
// Types
// ============================================================================

export interface BarDataPoint {
  /** Category label or x-value */
  category: string | number;
  /** Value or y-value */
  value: number;
  /** Optional label for display */
  label?: string;
  /** Optional metadata */
  metadata?: Record<string, any>;
}

export interface BarSeries {
  name: string;
  data: BarDataPoint[];
  color?: string;
  opacity?: number;
}

export interface Axis {
  label?: string;
  domain?: [number, number] | "auto";
  type?: "number" | "time";
  timezone?: string;
  formatter?: (value: number) => string;
}

export type BarChartVariant =
  | "default"
  | "minimal"
  | "scientific"
  | "dashboard";

export type BarChartOrientation = "vertical" | "horizontal";

export type BarChartMode = "grouped" | "stacked";

export interface BarChartRootProps {
  series: BarSeries[];
  xAxis?: Axis;
  yAxis?: Axis;
  width?: number;
  height?: number;
  /** Visual variant style */
  variant?: BarChartVariant;
  /** Bar orientation */
  orientation?: BarChartOrientation;
  /** Grouping mode */
  mode?: BarChartMode;
  /** Bar width (percentage, 0-1) */
  barWidth?: number;
  /** Gap between bars in a group (percentage) */
  barGap?: number;
  /** Gap between groups (percentage) */
  groupGap?: number;
  /** Enable animations */
  animate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface BarChartContext {
  series: BarSeries[];
  xAxis: Axis;
  yAxis: Axis;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  categoryScale: (category: string) => number;
  xDomain: [number, number];
  yDomain: [number, number];
  categories: string[];
  xTicks: number[];
  yTicks: number[];
  hoveredBar: { seriesIdx: number; barIdx: number } | null;
  setHoveredBar: (bar: { seriesIdx: number; barIdx: number } | null) => void;
  hiddenSeries: Set<number>;
  toggleSeries: (idx: number) => void;
  variant: BarChartVariant;
  orientation: BarChartOrientation;
  mode: BarChartMode;
  barWidth: number;
  barGap: number;
  groupGap: number;
  animate: boolean;
}

const BarChartContext = React.createContext<BarChartContext | null>(null);

function useBarChart() {
  const ctx = React.useContext(BarChartContext);
  if (!ctx) throw new Error("useBarChart must be used within BarChart.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function getCategoriesFromSeries(series: BarSeries[]): string[] {
  const categorySet = new Set<string>();
  series.forEach((s) => {
    s.data.forEach((d) => {
      categorySet.add(String(d.category));
    });
  });
  return Array.from(categorySet);
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const BarChartRoot = React.forwardRef<HTMLDivElement, BarChartRootProps>(
  (
    {
      series,
      xAxis = {},
      yAxis = {},
      width = 800,
      height = 400,
      variant = "default",
      orientation = "vertical",
      mode = "grouped",
      barWidth = 0.8,
      barGap = 0.05,
      groupGap = 0.2,
      animate = false,
      className,
      children,
    },
    ref
  ) => {
    const [hoveredBar, setHoveredBar] = React.useState<{
      seriesIdx: number;
      barIdx: number;
    } | null>(null);
    const [hiddenSeries, setHiddenSeries] = React.useState<Set<number>>(
      new Set()
    );

    const toggleSeries = React.useCallback((idx: number) => {
      setHiddenSeries((prev) => {
        const next = new Set(prev);
        if (next.has(idx)) {
          next.delete(idx);
        } else {
          next.add(idx);
        }
        return next;
      });
    }, []);

    // Margins
    const margin = React.useMemo(
      () => ({
        top: 30,
        right: 30,
        bottom: 60,
        left: 70,
      }),
      []
    );

    // Extract categories
    const categories = React.useMemo(
      () => getCategoriesFromSeries(series),
      [series]
    );

    // Calculate domains
    const allValues = series.flatMap((s) => s.data.map((d) => d.value));
    const maxStackedValue =
      mode === "stacked"
        ? Math.max(
            ...categories.map((cat) =>
              series.reduce((sum, s) => {
                const point = s.data.find((d) => String(d.category) === cat);
                return sum + (point?.value || 0);
              }, 0)
            )
          )
        : Math.max(...allValues, 0);

    const xDomain: [number, number] = [0, categories.length];
    const yDomain: [number, number] =
      yAxis.domain === "auto" || !yAxis.domain
        ? [0, maxStackedValue * 1.1]
        : yAxis.domain;

    // Create scales based on orientation
    const categoryScale = React.useMemo(() => {
      const bandwidth =
        (orientation === "vertical"
          ? width - margin.left - margin.right
          : height - margin.top - margin.bottom) / categories.length;
      return (category: string) => {
        const index = categories.indexOf(category);
        return (
          (orientation === "vertical" ? margin.left : margin.top) +
          index * bandwidth +
          bandwidth / 2
        );
      };
    }, [categories, orientation, width, height, margin]);

    const xScale = React.useMemo(
      () =>
        orientation === "vertical"
          ? createScale(xDomain, [margin.left, width - margin.right])
          : createScale(yDomain, [margin.left, width - margin.right]),
      [orientation, xDomain, yDomain, margin, width]
    );

    const yScale = React.useMemo(
      () =>
        orientation === "vertical"
          ? createScale(yDomain, [height - margin.bottom, margin.top])
          : createScale(xDomain, [height - margin.bottom, margin.top]),
      [orientation, xDomain, yDomain, height, margin]
    );

    // Generate ticks
    const xTicks = React.useMemo(
      () => (orientation === "vertical" ? [] : getTicks(yDomain, 6)),
      [orientation, yDomain]
    );
    const yTicks = React.useMemo(
      () => (orientation === "vertical" ? getTicks(yDomain, 6) : []),
      [orientation, yDomain]
    );

    const contextValue: BarChartContext = React.useMemo(
      () => ({
        series,
        xAxis,
        yAxis,
        width,
        height,
        margin,
        xScale,
        yScale,
        categoryScale,
        xDomain,
        yDomain,
        categories,
        xTicks,
        yTicks,
        hoveredBar,
        setHoveredBar,
        hiddenSeries,
        toggleSeries,
        variant,
        orientation,
        mode,
        barWidth,
        barGap,
        groupGap,
        animate,
      }),
      [
        series,
        xAxis,
        yAxis,
        width,
        height,
        margin,
        xScale,
        yScale,
        categoryScale,
        xDomain,
        yDomain,
        categories,
        xTicks,
        yTicks,
        hoveredBar,
        hiddenSeries,
        toggleSeries,
        variant,
        orientation,
        mode,
        barWidth,
        barGap,
        groupGap,
        animate,
      ]
    );

    return (
      <BarChartContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("bar-chart", className)}
          style={{
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {children}
        </div>
      </BarChartContext.Provider>
    );
  }
);

BarChartRoot.displayName = "BarChart.Root";

/**
 * Container component - wraps the SVG content
 */
const BarChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, children, ...props }, ref) => {
  const { height } = useBarChart();

  return (
    <div
      ref={ref}
      className={cn("bar-chart-container", className)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        height: `${height}px`,
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        overflow: "visible",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

BarChartContainer.displayName = "BarChart.Container";

/**
 * Viewport component - SVG canvas
 */
const BarChartViewport = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, children, ...props }, ref) => {
  const { width, height } = useBarChart();

  return (
    <svg
      ref={ref}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("bar-chart-svg", className)}
      style={{ display: "block", userSelect: "none", maxWidth: "100%" }}
      role="img"
      aria-label="Bar chart"
      {...props}
    >
      {children}
    </svg>
  );
});

BarChartViewport.displayName = "BarChart.Viewport";

export interface BarChartGridProps extends React.SVGProps<SVGGElement> {
  /** Stroke color for grid lines */
  stroke?: string;
  /** Stroke width for grid lines */
  strokeWidth?: number;
  /** Opacity for grid lines */
  opacity?: number;
}

/**
 * Grid component - renders grid lines
 */
const BarChartGrid = React.forwardRef<SVGGElement, BarChartGridProps>(
  (
    {
      className,
      stroke = "currentColor",
      strokeWidth = 1,
      opacity = 0.1,
      ...props
    },
    ref
  ) => {
    const {
      xTicks,
      yTicks,
      xScale,
      yScale,
      margin,
      width,
      height,
      orientation,
      animate,
    } = useBarChart();

    if (orientation === "vertical") {
      return (
        <g ref={ref} className={cn("bar-chart-grid", className)} {...props}>
          {/* Horizontal grid lines for vertical bars */}
          {yTicks.map((tick, i) => (
            <line
              key={`hgrid-${i}`}
              x1={margin.left}
              y1={yScale(tick)}
              x2={width - margin.right}
              y2={yScale(tick)}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          ))}
        </g>
      );
    }

    return (
      <g ref={ref} className={cn("bar-chart-grid", className)} {...props}>
        {/* Vertical grid lines for horizontal bars */}
        {xTicks.map((tick, i) => (
          <line
            key={`vgrid-${i}`}
            x1={xScale(tick)}
            y1={margin.top}
            x2={xScale(tick)}
            y2={height - margin.bottom}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        ))}
      </g>
    );
  }
);

BarChartGrid.displayName = "BarChart.Grid";

/**
 * Axes component - renders X and Y axes with labels
 */
const BarChartAxes = React.forwardRef<SVGGElement, React.SVGProps<SVGGElement>>(
  ({ className, ...props }, ref) => {
    const {
      xTicks,
      yTicks,
      xScale,
      yScale,
      categoryScale,
      margin,
      width,
      height,
      xAxis,
      yAxis,
      orientation,
      categories,
    } = useBarChart();

    const formatTick = (value: number, axis: Axis): string => {
      if (axis.formatter) return axis.formatter(value);
      if (axis.type === "time") {
        const timezone = axis.timezone || "UTC";
        return formatTime(value, timezone);
      }
      return formatValue(value);
    };

    if (orientation === "vertical") {
      return (
        <g ref={ref} className={cn("bar-chart-axes", className)} {...props}>
          {/* X-axis (categories) */}
          <line
            x1={margin.left}
            y1={height - margin.bottom}
            x2={width - margin.right}
            y2={height - margin.bottom}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.2}
          />
          {categories.map((cat, i) => (
            <g key={`xtick-${i}`}>
              <text
                x={categoryScale(cat)}
                y={height - margin.bottom + 20}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
                opacity={0.6}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {cat}
              </text>
            </g>
          ))}
          {xAxis.label && (
            <text
              x={(margin.left + width - margin.right) / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize={12}
              fontWeight={500}
              fill="currentColor"
              opacity={0.7}
            >
              {xAxis.label}
            </text>
          )}

          {/* Y-axis (values) */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={height - margin.bottom}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.2}
          />
          {yTicks.map((tick, i) => (
            <g key={`ytick-${i}`}>
              <line
                x1={margin.left - 6}
                y1={yScale(tick)}
                x2={margin.left}
                y2={yScale(tick)}
                stroke="currentColor"
                strokeWidth={1.5}
                opacity={0.2}
              />
              <text
                x={margin.left - 10}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize={10}
                fill="currentColor"
                opacity={0.6}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatTick(tick, yAxis)}
              </text>
            </g>
          ))}
          {yAxis.label && (
            <text
              x={margin.left - 50}
              y={(margin.top + height - margin.bottom) / 2}
              textAnchor="middle"
              fontSize={12}
              fontWeight={500}
              fill="currentColor"
              opacity={0.7}
              transform={`rotate(-90 ${margin.left - 50} ${
                (margin.top + height - margin.bottom) / 2
              })`}
            >
              {yAxis.label}
            </text>
          )}
        </g>
      );
    }

    // Horizontal orientation
    return (
      <g ref={ref} className={cn("bar-chart-axes", className)} {...props}>
        {/* X-axis (values) */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.2}
        />
        {xTicks.map((tick, i) => (
          <g key={`xtick-${i}`}>
            <line
              x1={xScale(tick)}
              y1={height - margin.bottom}
              x2={xScale(tick)}
              y2={height - margin.bottom + 6}
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.2}
            />
            <text
              x={xScale(tick)}
              y={height - margin.bottom + 20}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
              opacity={0.6}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatTick(tick, xAxis)}
            </text>
          </g>
        ))}
        {xAxis.label && (
          <text
            x={(margin.left + width - margin.right) / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
            opacity={0.7}
          >
            {xAxis.label}
          </text>
        )}

        {/* Y-axis (categories) */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.2}
        />
        {categories.map((cat, i) => (
          <g key={`ytick-${i}`}>
            <text
              x={margin.left - 10}
              y={categoryScale(cat) + 4}
              textAnchor="end"
              fontSize={10}
              fill="currentColor"
              opacity={0.6}
            >
              {cat}
            </text>
          </g>
        ))}
        {yAxis.label && (
          <text
            x={margin.left - 50}
            y={(margin.top + height - margin.bottom) / 2}
            textAnchor="middle"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
            opacity={0.7}
            transform={`rotate(-90 ${margin.left - 50} ${
              (margin.top + height - margin.bottom) / 2
            })`}
          >
            {yAxis.label}
          </text>
        )}
      </g>
    );
  }
);

BarChartAxes.displayName = "BarChart.Axes";

export interface BarChartBarsProps extends React.SVGProps<SVGGElement> {
  /** Stroke width when bar is hovered */
  hoverStrokeWidth?: number;
  /** Border radius for bars */
  borderRadius?: number;
}

/**
 * Bars component - renders the bars
 */
const BarChartBars = React.forwardRef<SVGGElement, BarChartBarsProps>(
  ({ className, hoverStrokeWidth = 2, borderRadius = 2, ...props }, ref) => {
    const {
      series,
      categories,
      categoryScale,
      xScale,
      yScale,
      orientation,
      mode,
      barWidth,
      barGap,
      groupGap,
      width,
      height,
      margin,
      hiddenSeries,
      animate,
      hoveredBar,
    } = useBarChart();

    const visibleSeries = series.filter((_, idx) => !hiddenSeries.has(idx));
    const numSeries = visibleSeries.length;

    const bandwidth =
      (orientation === "vertical"
        ? width - margin.left - margin.right
        : height - margin.top - margin.bottom) / categories.length;

    const groupWidth = bandwidth * barWidth;
    const barWidthPx =
      mode === "grouped"
        ? (groupWidth - (numSeries - 1) * barGap * bandwidth) / numSeries
        : groupWidth;

    return (
      <g ref={ref} className={cn("bar-chart-bars", className)} {...props}>
        {categories.map((category, catIdx) => {
          let stackBase = 0;

          return (
            <g key={category}>
              {visibleSeries.map((s, seriesIdx) => {
                const originalSeriesIdx = series.indexOf(s);
                const point = s.data.find(
                  (d) => String(d.category) === category
                );
                if (!point) return null;

                const color = s.color || "#64748b";
                const opacity = s.opacity || 0.8;
                const value = point.value;

                const isHovered =
                  hoveredBar?.seriesIdx === originalSeriesIdx &&
                  hoveredBar?.barIdx === catIdx;

                let x, y, w, h;

                if (orientation === "vertical") {
                  const centerX = categoryScale(category);

                  if (mode === "stacked") {
                    x = centerX - groupWidth / 2;
                    y = yScale(stackBase + value);
                    w = barWidthPx;
                    h = yScale(stackBase) - yScale(stackBase + value);
                    stackBase += value;
                  } else {
                    // grouped
                    const offset =
                      seriesIdx * (barWidthPx + barGap * bandwidth) -
                      groupWidth / 2;
                    x = centerX + offset;
                    y = yScale(value);
                    w = barWidthPx;
                    h = yScale(0) - yScale(value);
                  }
                } else {
                  // horizontal
                  const centerY = categoryScale(category);

                  if (mode === "stacked") {
                    x = xScale(stackBase);
                    y = centerY - groupWidth / 2;
                    w = xScale(stackBase + value) - xScale(stackBase);
                    h = barWidthPx;
                    stackBase += value;
                  } else {
                    // grouped
                    const offset =
                      seriesIdx * (barWidthPx + barGap * bandwidth) -
                      groupWidth / 2;
                    x = xScale(0);
                    y = centerY + offset;
                    w = xScale(value) - xScale(0);
                    h = barWidthPx;
                  }
                }

                return (
                  <rect
                    key={`${category}-${seriesIdx}`}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={color}
                    opacity={isHovered ? 1 : opacity}
                    stroke={isHovered ? color : "none"}
                    strokeWidth={isHovered ? hoverStrokeWidth : 0}
                    rx={borderRadius}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    );
  }
);

BarChartBars.displayName = "BarChart.Bars";

/**
 * Tooltip component - interactive tooltip on hover
 */
const BarChartTooltip = React.forwardRef<
  SVGGElement,
  React.SVGProps<SVGGElement>
>(({ className, ...props }, ref) => {
  const {
    hoveredBar,
    series,
    categories,
    categoryScale,
    xScale,
    yScale,
    orientation,
    mode,
    width,
    height,
    yAxis,
  } = useBarChart();

  if (!hoveredBar) return null;

  const s = series[hoveredBar.seriesIdx];
  if (!s) return null;

  const category = categories[hoveredBar.barIdx];
  const point = s.data.find((d) => String(d.category) === category);
  if (!point) return null;

  const color = s.color || "#64748b";
  const value = point.value;

  let px: number, py: number;

  if (orientation === "vertical") {
    px = categoryScale(category);
    py = yScale(value);
  } else {
    px = xScale(value);
    py = categoryScale(category);
  }

  const valueLabel = yAxis.formatter?.(value) ?? formatValue(value);

  // Smart positioning
  const tooltipWidth = 180;
  const tooltipHeight = 70;
  const offsetX = px > width / 2 ? -tooltipWidth - 10 : 10;
  const offsetY = py > height / 2 ? -tooltipHeight - 10 : 10;

  return (
    <g
      ref={ref}
      className={cn("bar-chart-tooltip", className)}
      style={{ pointerEvents: "none" }}
      {...props}
    >
      {/* Tooltip box */}
      <rect
        x={px + offsetX}
        y={py + offsetY}
        width={tooltipWidth}
        height={tooltipHeight}
        rx={6}
        fill="currentColor"
        opacity={0.95}
      />
      <text
        x={px + offsetX + 10}
        y={py + offsetY + 20}
        fontSize={11}
        fontWeight={600}
        fill="white"
        style={{ mixBlendMode: "difference" }}
      >
        {s.name}
      </text>
      <text
        x={px + offsetX + 10}
        y={py + offsetY + 38}
        fontSize={10}
        fill="white"
        opacity={0.8}
        style={{ mixBlendMode: "difference" }}
      >
        Category: {category}
      </text>
      <text
        x={px + offsetX + 10}
        y={py + offsetY + 54}
        fontSize={10}
        fill="white"
        opacity={0.8}
        style={{ mixBlendMode: "difference" }}
      >
        Value: {valueLabel}
      </text>
    </g>
  );
});

BarChartTooltip.displayName = "BarChart.Tooltip";

export interface BarChartInteractionProps
  extends React.SVGProps<SVGRectElement> {
  /** Callback when bar is hovered */
  onBarHover?: (bar: { seriesIdx: number; barIdx: number } | null) => void;
  /** Callback when bar is clicked */
  onBarClick?: (bar: { seriesIdx: number; barIdx: number }) => void;
}

/**
 * Interaction layer component - handles mouse events
 */
const BarChartInteraction = React.forwardRef<
  SVGRectElement,
  BarChartInteractionProps
>(({ className, onBarHover, onBarClick, ...props }, ref) => {
  const {
    margin,
    width,
    height,
    series,
    categories,
    categoryScale,
    xScale,
    yScale,
    orientation,
    mode,
    barWidth,
    barGap,
    setHoveredBar,
    hiddenSeries,
  } = useBarChart();

  const visibleSeries = series.filter((_, idx) => !hiddenSeries.has(idx));
  const numSeries = visibleSeries.length;

  const bandwidth =
    (orientation === "vertical"
      ? width - margin.left - margin.right
      : height - margin.top - margin.bottom) / categories.length;

  const groupWidth = bandwidth * barWidth;
  const barWidthPx =
    mode === "grouped"
      ? (groupWidth - (numSeries - 1) * barGap * bandwidth) / numSeries
      : groupWidth;

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Find which bar is hovered
      for (let catIdx = 0; catIdx < categories.length; catIdx++) {
        const category = categories[catIdx];
        let stackBase = 0;

        for (let sIdx = 0; sIdx < visibleSeries.length; sIdx++) {
          const s = visibleSeries[sIdx];
          const originalSeriesIdx = series.indexOf(s);
          const point = s.data.find((d) => String(d.category) === category);
          if (!point) continue;

          const value = point.value;
          let x, y, w, h;

          if (orientation === "vertical") {
            const centerX = categoryScale(category);

            if (mode === "stacked") {
              x = centerX - groupWidth / 2;
              y = yScale(stackBase + value);
              w = barWidthPx;
              h = yScale(stackBase) - yScale(stackBase + value);
              stackBase += value;
            } else {
              const offset =
                sIdx * (barWidthPx + barGap * bandwidth) - groupWidth / 2;
              x = centerX + offset;
              y = yScale(value);
              w = barWidthPx;
              h = yScale(0) - yScale(value);
            }
          } else {
            const centerY = categoryScale(category);

            if (mode === "stacked") {
              x = xScale(stackBase);
              y = centerY - groupWidth / 2;
              w = xScale(stackBase + value) - xScale(stackBase);
              h = barWidthPx;
              stackBase += value;
            } else {
              const offset =
                sIdx * (barWidthPx + barGap * bandwidth) - groupWidth / 2;
              x = xScale(0);
              y = centerY + offset;
              w = xScale(value) - xScale(0);
              h = barWidthPx;
            }
          }

          if (
            mouseX >= x &&
            mouseX <= x + w &&
            mouseY >= y &&
            mouseY <= y + h
          ) {
            const bar = { seriesIdx: originalSeriesIdx, barIdx: catIdx };
            setHoveredBar(bar);
            onBarHover?.(bar);
            return;
          }
        }
      }

      setHoveredBar(null);
      onBarHover?.(null);
    },
    [
      categories,
      visibleSeries,
      series,
      categoryScale,
      xScale,
      yScale,
      orientation,
      mode,
      groupWidth,
      barWidthPx,
      barGap,
      bandwidth,
      setHoveredBar,
      onBarHover,
    ]
  );

  const handleMouseLeave = React.useCallback(() => {
    setHoveredBar(null);
    onBarHover?.(null);
  }, [setHoveredBar, onBarHover]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (!onBarClick) return;

      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      for (let catIdx = 0; catIdx < categories.length; catIdx++) {
        const category = categories[catIdx];
        let stackBase = 0;

        for (let sIdx = 0; sIdx < visibleSeries.length; sIdx++) {
          const s = visibleSeries[sIdx];
          const originalSeriesIdx = series.indexOf(s);
          const point = s.data.find((d) => String(d.category) === category);
          if (!point) continue;

          const value = point.value;
          let x, y, w, h;

          if (orientation === "vertical") {
            const centerX = categoryScale(category);

            if (mode === "stacked") {
              x = centerX - groupWidth / 2;
              y = yScale(stackBase + value);
              w = barWidthPx;
              h = yScale(stackBase) - yScale(stackBase + value);
              stackBase += value;
            } else {
              const offset =
                sIdx * (barWidthPx + barGap * bandwidth) - groupWidth / 2;
              x = centerX + offset;
              y = yScale(value);
              w = barWidthPx;
              h = yScale(0) - yScale(value);
            }
          } else {
            const centerY = categoryScale(category);

            if (mode === "stacked") {
              x = xScale(stackBase);
              y = centerY - groupWidth / 2;
              w = xScale(stackBase + value) - xScale(stackBase);
              h = barWidthPx;
              stackBase += value;
            } else {
              const offset =
                sIdx * (barWidthPx + barGap * bandwidth) - groupWidth / 2;
              x = xScale(0);
              y = centerY + offset;
              w = xScale(value) - xScale(0);
              h = barWidthPx;
            }
          }

          if (
            mouseX >= x &&
            mouseX <= x + w &&
            mouseY >= y &&
            mouseY <= y + h
          ) {
            onBarClick({ seriesIdx: originalSeriesIdx, barIdx: catIdx });
            return;
          }
        }
      }
    },
    [
      onBarClick,
      categories,
      visibleSeries,
      series,
      categoryScale,
      xScale,
      yScale,
      orientation,
      mode,
      groupWidth,
      barWidthPx,
      barGap,
      bandwidth,
    ]
  );

  return (
    <rect
      ref={ref}
      x={margin.left}
      y={margin.top}
      width={width - margin.left - margin.right}
      height={height - margin.top - margin.bottom}
      fill="transparent"
      className={cn("bar-chart-interaction", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      {...props}
    />
  );
});

BarChartInteraction.displayName = "BarChart.Interaction";

export interface BarChartLegendProps extends React.SVGProps<SVGGElement> {
  interactive?: boolean;
}

/**
 * Legend component
 */
const BarChartLegend = React.forwardRef<SVGGElement, BarChartLegendProps>(
  ({ className, interactive = false, ...props }, ref) => {
    const { series, width, margin, hiddenSeries, toggleSeries } = useBarChart();

    return (
      <g ref={ref} className={cn("bar-chart-legend", className)} {...props}>
        {series.map((s, idx) => {
          const x = width - margin.right - 150;
          const y = margin.top + idx * 24;
          const color = s.color || "#64748b";
          const isHidden = hiddenSeries.has(idx);

          return (
            <g
              key={idx}
              onClick={interactive ? () => toggleSeries(idx) : undefined}
              style={{ cursor: interactive ? "pointer" : "default" }}
              opacity={isHidden ? 0.4 : 1}
            >
              <rect
                x={x}
                y={y - 6}
                width={20}
                height={12}
                fill={color}
                rx={2}
              />
              <text
                x={x + 28}
                y={y + 4}
                fontSize={11}
                fill="currentColor"
                opacity={0.8}
              >
                {s.name}
              </text>
            </g>
          );
        })}
      </g>
    );
  }
);

BarChartLegend.displayName = "BarChart.Legend";

/**
 * Empty state component
 */
const BarChartEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, children, ...props }, ref) => {
  const { width, height } = useBarChart();

  return (
    <div
      ref={ref}
      className={cn("bar-chart-empty", className)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
        borderRadius: "8px",
        border: "1px solid currentColor",
        opacity: 0.1,
        ...style,
      }}
      {...props}
    >
      {children || (
        <>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            opacity="0.3"
          >
            <rect x="3" y="13" width="4" height="8" rx="1" />
            <rect x="10" y="9" width="4" height="12" rx="1" />
            <rect x="17" y="5" width="4" height="16" rx="1" />
          </svg>
          <div style={{ fontSize: "14px", opacity: 0.5 }}>
            No data available
          </div>
        </>
      )}
    </div>
  );
});

BarChartEmpty.displayName = "BarChart.Empty";

/**
 * Loading state component
 */
const BarChartLoading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, children, ...props }, ref) => {
  const { width, height } = useBarChart();

  return (
    <div
      ref={ref}
      className={cn("bar-chart-loading", className)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background, white)",
        opacity: 0.95,
        zIndex: 10,
        ...style,
      }}
      role="status"
      aria-live="polite"
      {...props}
    >
      {children || (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(0, 0, 0, 0.1)",
              borderTop: "4px solid currentColor",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <div style={{ fontSize: "14px", opacity: 0.7 }}>Loading chart...</div>
        </div>
      )}
    </div>
  );
});

BarChartLoading.displayName = "BarChart.Loading";

// ============================================================================
// Exports
// ============================================================================

export const BarChart = Object.assign(BarChartRoot, {
  Root: BarChartRoot,
  Container: BarChartContainer,
  Viewport: BarChartViewport,
  Grid: BarChartGrid,
  Axes: BarChartAxes,
  Bars: BarChartBars,
  Tooltip: BarChartTooltip,
  Interaction: BarChartInteraction,
  Legend: BarChartLegend,
  Empty: BarChartEmpty,
  Loading: BarChartLoading,
});
