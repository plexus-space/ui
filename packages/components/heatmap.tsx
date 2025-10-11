"use client";

import * as React from "react";
import { cn } from "./lib";
import {
  mapDomainToColor,
  type ColormapName,
  generateGradient,
} from "./colormaps";

// ============================================================================
// Types
// ============================================================================

/**
 * Individual cell data for heatmap visualization
 */
export interface HeatmapCell {
  /** X-coordinate (column index) of the cell */
  x: number;
  /** Y-coordinate (row index) of the cell */
  y: number;
  /** Numeric value determining cell color intensity */
  value: number;
  /**
   * Optional text label for the cell displayed in tooltip
   * @example "Region A", "Sample 1"
   */
  label?: string;
}

/**
 * Cell shape options for heatmap cells
 */
export type CellShape = "square" | "hexagon";

/**
 * Props for Heatmap.Root component
 */
export interface HeatmapRootProps {
  /**
   * Data as 2D array (number[][]) or flat array of HeatmapCell objects
   * @required
   * @example [[1, 2, 3], [4, 5, 6]], or [{x:0, y:0, value:1}, ...]
   */
  data: number[][] | HeatmapCell[];
  /**
   * Labels for X-axis (columns) for categorical data
   * @example ["Jan", "Feb", "Mar"], ["A", "B", "C"]
   */
  xLabels?: string[];
  /**
   * Labels for Y-axis (rows) for categorical data
   * @example ["Sample 1", "Sample 2"], ["Group A", "Group B"]
   */
  yLabels?: string[];
  /**
   * X-axis title text
   * @example "Time (months)", "Categories"
   */
  xAxisLabel?: string;
  /**
   * Y-axis title text
   * @example "Samples", "Regions"
   */
  yAxisLabel?: string;
  /**
   * Color scheme for value mapping
   * @default "viridis"
   * @example "viridis", "plasma", "inferno", "magma", "turbo"
   */
  colormap?: ColormapName;
  /**
   * Value range [min, max] or automatic calculation
   * @default "auto" (calculated from data)
   * @example [0, 100], [-1, 1]
   */
  domain?: [number, number] | "auto";
  /**
   * Chart width in pixels
   * @default 800
   * @example 600, 1000, 1200
   */
  width?: number;
  /**
   * Chart height in pixels
   * @default 600
   * @example 400, 800, 1000
   */
  height?: number;
  /**
   * Display color scale legend on the right
   * @default true
   */
  showColorbar?: boolean;
  /**
   * Display numeric values as text inside cells
   * @default false
   */
  showValues?: boolean;
  /**
   * Display grid lines between cells
   * @default true
   */
  showGrid?: boolean;
  /**
   * Cell shape type
   * @default "square"
   */
  cellShape?: CellShape;
  /**
   * Gap between cells as fraction of cell size
   * @default 0.05
   * @range 0.0-0.3
   */
  cellGap?: number;
  /**
   * Enable entrance animations for cells and axes
   * @default true
   */
  animate?: boolean;
  /**
   * Enable responsive container that fills parent element
   * @default false
   */
  responsive?: boolean;
  /**
   * Custom formatter function for cell values
   * @example (value) => `${value.toFixed(1)}°C`
   */
  valueFormatter?: (value: number) => string;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * Child components (Container, Viewport, etc.)
   */
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface HeatmapContext {
  cells: HeatmapCell[];
  gridWidth: number;
  gridHeight: number;
  xLabels?: string[];
  yLabels?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  colormap: ColormapName;
  domain: [number, number];
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  cellWidth: number;
  cellHeight: number;
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  hoveredCell: { x: number; y: number } | null;
  setHoveredCell: (cell: { x: number; y: number } | null) => void;
  showValues: boolean;
  showColorbar: boolean;
  cellShape: CellShape;
  cellGap: number;
  animate: boolean;
  valueFormatter?: (value: number) => string;
  plotWidth: number;
  plotHeight: number;
  responsive: boolean;
}

const HeatmapContext = React.createContext<HeatmapContext | null>(null);

function useHeatmap() {
  const ctx = React.useContext(HeatmapContext);
  if (!ctx) throw new Error("useHeatmap must be used within Heatmap.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function useResizeObserver(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(1);
  return value.toFixed(2);
}

// Normalize 2D array or flat cells into a consistent format
function normalizeData(data: number[][] | HeatmapCell[]): {
  cells: HeatmapCell[];
  width: number;
  height: number;
} {
  if (Array.isArray(data[0]) && typeof data[0][0] === "number") {
    // 2D array format
    const grid = data as number[][];
    const cells: HeatmapCell[] = [];
    grid.forEach((row, y) => {
      row.forEach((value, x) => {
        cells.push({ x, y, value });
      });
    });
    return { cells, width: grid[0]?.length || 0, height: grid.length };
  } else {
    // Flat HeatmapCell[] format
    const cells = data as HeatmapCell[];
    const maxX = Math.max(...cells.map((c) => c.x)) + 1;
    const maxY = Math.max(...cells.map((c) => c.y)) + 1;
    return { cells, width: maxX, height: maxY };
  }
}

function getDomain(cells: HeatmapCell[]): [number, number] {
  if (cells.length === 0) return [0, 1];
  const values = cells.map((c) => c.value);
  return [Math.min(...values), Math.max(...values)];
}

// Generate hexagon path (flat-top orientation for proper honeycomb)
function getHexagonPath(
  cx: number,
  cy: number,
  size: number,
  gap: number = 0
): string {
  const radius = size * (1 - gap);
  const points: [number, number][] = [];

  // Flat-top hexagon: start at 0 degrees (right side)
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push([x, y]);
  }

  return `M ${points.map((p) => p.join(",")).join(" L ")} Z`;
}

// Get hexagon layout position (flat-top honeycomb pattern)
function getHexPosition(
  x: number,
  y: number,
  hexRadius: number
): { cx: number; cy: number } {
  // Flat-top hexagon dimensions
  const hexWidth = hexRadius * 2;
  const hexHeight = hexRadius * Math.sqrt(3);

  // Horizontal spacing between hex centers
  const xSpacing = hexWidth * 0.75;
  // Vertical spacing between hex centers
  const ySpacing = hexHeight;

  const cx = x * xSpacing;
  const cy = y * ySpacing + (x % 2 === 1 ? hexHeight / 2 : 0);

  return { cx, cy };
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const HeatmapRoot = React.forwardRef<HTMLDivElement, HeatmapRootProps>(
  (
    {
      data,
      xLabels,
      yLabels,
      xAxisLabel,
      yAxisLabel,
      colormap = "viridis",
      domain = "auto",
      width = 800,
      height = 600,
      showColorbar = true,
      showValues = false,
      showGrid = true,
      cellShape = "square",
      cellGap = 0.05,
      animate = true,
      responsive = false,
      valueFormatter,
      className,
      children,
    },
    ref
  ) => {
    const [hoveredCell, setHoveredCell] = React.useState<{
      x: number;
      y: number;
    } | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const containerSize = useResizeObserver(containerRef);
    const actualWidth =
      responsive && containerSize.width > 0 ? containerSize.width : width;
    const actualHeight =
      responsive && containerSize.height > 0 ? containerSize.height : height;

    // Normalize data
    const {
      cells,
      width: gridWidth,
      height: gridHeight,
    } = React.useMemo(() => normalizeData(data), [data]);

    // Calculate domain
    const valueDomain: [number, number] = React.useMemo(
      () => (domain === "auto" ? getDomain(cells) : domain),
      [cells, domain]
    );

    const margin = React.useMemo(
      () => ({
        top: 30,
        right: showColorbar ? 100 : 30,
        bottom: xLabels ? 50 : 40,
        left: yLabels ? 80 : 50,
      }),
      [showColorbar, xLabels, yLabels]
    );

    // Calculate cell dimensions
    const plotWidth = actualWidth - margin.left - margin.right;
    const plotHeight = actualHeight - margin.top - margin.bottom;
    const cellWidth = plotWidth / gridWidth;
    const cellHeight = plotHeight / gridHeight;

    const xScale = React.useCallback(
      (x: number) => margin.left + x * cellWidth,
      [margin.left, cellWidth]
    );
    const yScale = React.useCallback(
      (y: number) => margin.top + y * cellHeight,
      [margin.top, cellHeight]
    );

    const contextValue: HeatmapContext = React.useMemo(
      () => ({
        cells,
        gridWidth,
        gridHeight,
        xLabels,
        yLabels,
        xAxisLabel,
        yAxisLabel,
        colormap,
        domain: valueDomain,
        width: actualWidth,
        height: actualHeight,
        margin,
        cellWidth,
        cellHeight,
        xScale,
        yScale,
        hoveredCell,
        setHoveredCell,
        showValues,
        showColorbar,
        cellShape,
        cellGap,
        animate,
        valueFormatter,
        plotWidth,
        plotHeight,
        responsive,
      }),
      [
        cells,
        gridWidth,
        gridHeight,
        xLabels,
        yLabels,
        xAxisLabel,
        yAxisLabel,
        colormap,
        valueDomain,
        actualWidth,
        actualHeight,
        margin,
        cellWidth,
        cellHeight,
        xScale,
        yScale,
        hoveredCell,
        showValues,
        showColorbar,
        cellShape,
        cellGap,
        animate,
        valueFormatter,
        plotWidth,
        plotHeight,
        responsive,
      ]
    );

    return (
      <HeatmapContext.Provider value={contextValue}>
        <div
          ref={(node) => {
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            if (node) {
              (
                containerRef as React.MutableRefObject<HTMLDivElement | null>
              ).current = node;
            }
          }}
          className={cn("heatmap", className)}
        >
          {children}
        </div>
      </HeatmapContext.Provider>
    );
  }
);

HeatmapRoot.displayName = "Heatmap.Root";

/**
 * Container component - wraps the SVG content
 */
export interface HeatmapContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const HeatmapContainer = React.forwardRef<
  HTMLDivElement,
  HeatmapContainerProps
>(({ className, style, children, ...props }, ref) => {
  const { width, height, responsive } = useHeatmap();

  return (
    <div
      ref={ref}
      className={cn("heatmap-container", className)}
      style={{
        position: "relative",
        width: responsive ? "100%" : `${width}px`,
        height: responsive ? "100%" : `${height}px`,
        display: responsive ? "block" : "inline-block",
        minHeight: responsive ? "300px" : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

HeatmapContainer.displayName = "Heatmap.Container";

/**
 * Viewport component - SVG canvas
 */
export interface HeatmapViewportProps extends React.SVGProps<SVGSVGElement> {}

const HeatmapViewport = React.forwardRef<SVGSVGElement, HeatmapViewportProps>(
  ({ className, children, ...props }, ref) => {
    const { width, height } = useHeatmap();

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        className={cn("heatmap-svg", className)}
        style={{ userSelect: "none" }}
        role="img"
        aria-label="Heatmap visualization"
        {...props}
      >
        {children}
      </svg>
    );
  }
);

HeatmapViewport.displayName = "Heatmap.Viewport";

/**
 * Cells component - renders the heatmap cells
 */
export interface HeatmapCellsProps extends React.SVGProps<SVGGElement> {}

const HeatmapCells = React.forwardRef<SVGGElement, HeatmapCellsProps>(
  ({ className, children, ...props }, ref) => {
    const {
      cells,
      gridWidth,
      gridHeight,
      colormap,
      domain,
      showValues,
      cellShape,
      cellGap,
      animate,
      valueFormatter,
      margin,
      plotWidth,
      plotHeight,
      cellWidth,
      cellHeight,
      xScale,
      yScale,
      hoveredCell,
      setHoveredCell,
    } = useHeatmap();

    return (
      <g ref={ref} className={cn("heatmap-cells", className)} {...props}>
        <defs>
          {/* Glow filter for hover effect */}
          <filter id="cell-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Shadow for depth */}
          <filter id="cell-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {cells.map((cell, i) => {
          const color = mapDomainToColor(
            cell.value,
            domain[0],
            domain[1],
            colormap
          );

          // Determine text color based on luminance
          const rgb = parseInt(color.slice(1), 16);
          const r = (rgb >> 16) & 0xff;
          const g = (rgb >> 8) & 0xff;
          const b = rgb & 0xff;
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          const textColor = luminance > 128 ? "#000000" : "#ffffff";

          const isHovered =
            hoveredCell?.x === cell.x && hoveredCell?.y === cell.y;

          let cellElement: React.JSX.Element;
          let centerX: number;
          let centerY: number;

          if (cellShape === "hexagon") {
            // Calculate hexagon radius to fit all hexagons in the plot area
            const maxRadius =
              Math.min(
                plotWidth / ((gridWidth - 1) * 1.5 + 2),
                plotHeight / ((gridHeight - 1) * Math.sqrt(3) + Math.sqrt(3))
              ) * 0.95;

            const { cx, cy } = getHexPosition(cell.x, cell.y, maxRadius);
            centerX = margin.left + cx + maxRadius;
            centerY = margin.top + cy + (maxRadius * Math.sqrt(3)) / 2;

            const path = getHexagonPath(centerX, centerY, maxRadius, cellGap);

            cellElement = (
              <path
                d={path}
                fill={color}
                stroke="none"
                filter={isHovered ? "url(#cell-glow)" : "url(#cell-shadow)"}
                style={{
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            );
          } else {
            // Square shape with subtle rounded corners
            const x = xScale(cell.x);
            const y = yScale(cell.y);
            const gap = cellGap * Math.min(cellWidth, cellHeight);
            const w = cellWidth - gap;
            const h = cellHeight - gap;
            const cornerRadius = Math.min(w, h) * 0.04;

            centerX = x + cellWidth / 2;
            centerY = y + cellHeight / 2;

            cellElement = (
              <rect
                x={x + gap / 2}
                y={y + gap / 2}
                width={w}
                height={h}
                rx={cornerRadius}
                ry={cornerRadius}
                fill={color}
                stroke="none"
                filter={isHovered ? "url(#cell-glow)" : "url(#cell-shadow)"}
                style={{
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            );
          }

          return (
            <g
              key={`cell-${cell.x}-${cell.y}`}
              opacity={animate ? 0 : 1}
              style={
                animate
                  ? {
                      animation: `fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${
                        i * 0.008
                      }s forwards`,
                    }
                  : undefined
              }
              onMouseEnter={() => setHoveredCell({ x: cell.x, y: cell.y })}
              onMouseLeave={() => setHoveredCell(null)}
              cursor="pointer"
            >
              {cellElement}
              {showValues && (
                <text
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.min(cellWidth, cellHeight) / 4.5}
                  fill={textColor}
                  opacity={0.95}
                  fontWeight={500}
                  style={{
                    pointerEvents: "none",
                    fontVariantNumeric: "tabular-nums",
                    textShadow: `0 1px 2px ${
                      luminance > 128
                        ? "rgba(0,0,0,0.1)"
                        : "rgba(255,255,255,0.1)"
                    }`,
                  }}
                >
                  {valueFormatter
                    ? valueFormatter(cell.value)
                    : formatValue(cell.value)}
                </text>
              )}
            </g>
          );
        })}
        <style jsx>{`
          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }
        `}</style>
      </g>
    );
  }
);

HeatmapCells.displayName = "Heatmap.Cells";

/**
 * Axes component - renders axis labels
 */
export interface HeatmapAxesProps extends React.SVGProps<SVGGElement> {}

const HeatmapAxes = React.forwardRef<SVGGElement, HeatmapAxesProps>(
  ({ className, children, ...props }, ref) => {
    const {
      xLabels,
      yLabels,
      xAxisLabel,
      yAxisLabel,
      gridWidth,
      gridHeight,
      animate,
      margin,
      width,
      height,
      cellWidth,
      cellHeight,
      xScale,
      yScale,
    } = useHeatmap();

    return (
      <g ref={ref} className={cn("heatmap-axes", className)} {...props}>
        {/* X-axis labels */}
        {xLabels &&
          xLabels.map((label, i) => (
            <text
              key={`xlabel-${i}`}
              x={xScale(i) + cellWidth / 2}
              y={height - margin.bottom + 15}
              textAnchor="middle"
              fontSize={11}
              fontWeight={500}
              fill="currentColor"
              opacity={animate ? 0 : 0.75}
              style={
                animate
                  ? {
                      animation: `fadeInSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${
                        0.3 + i * 0.025
                      }s forwards`,
                    }
                  : undefined
              }
            >
              {label}
            </text>
          ))}

        {/* X-axis title */}
        {xAxisLabel && (
          <text
            x={(margin.left + width - margin.right) / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize={13}
            fontWeight={600}
            fill="currentColor"
            opacity={animate ? 0 : 0.9}
            style={
              animate
                ? {
                    animation:
                      "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards",
                  }
                : undefined
            }
          >
            {xAxisLabel}
          </text>
        )}

        {/* Y-axis labels */}
        {yLabels &&
          yLabels.map((label, i) => (
            <text
              key={`ylabel-${i}`}
              x={margin.left - 10}
              y={yScale(i) + cellHeight / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={500}
              fill="currentColor"
              opacity={animate ? 0 : 0.75}
              style={
                animate
                  ? {
                      animation: `fadeInSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${
                        0.3 + i * 0.025
                      }s forwards`,
                    }
                  : undefined
              }
            >
              {label}
            </text>
          ))}

        {/* Y-axis title */}
        {yAxisLabel && (
          <text
            x={margin.left - 45}
            y={(margin.top + height - margin.bottom) / 2}
            textAnchor="middle"
            fontSize={13}
            fontWeight={600}
            fill="currentColor"
            transform={`rotate(-90 ${margin.left - 45} ${
              (margin.top + height - margin.bottom) / 2
            })`}
            opacity={animate ? 0 : 0.9}
            style={
              animate
                ? {
                    animation:
                      "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards",
                  }
                : undefined
            }
          >
            {yAxisLabel}
          </text>
        )}

        <style jsx>{`
          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }
          @keyframes fadeInSlide {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </g>
    );
  }
);

HeatmapAxes.displayName = "Heatmap.Axes";

/**
 * Colorbar component - renders the color scale legend
 */
export interface HeatmapColorbarProps extends React.SVGProps<SVGGElement> {}

const HeatmapColorbar = React.forwardRef<SVGGElement, HeatmapColorbarProps>(
  ({ className, children, ...props }, ref) => {
    const { colormap, domain, margin, animate, width, height } = useHeatmap();

    const colorbarWidth = 24;
    const colorbarHeight = height - margin.top - margin.bottom;
    const colorbarX = width - margin.right + 30;
    const colorbarY = margin.top;

    const gradient = generateGradient(colormap, "to bottom");

    const ticks = [domain[0], (domain[0] + domain[1]) / 2, domain[1]];

    return (
      <g
        ref={ref}
        className={cn("heatmap-colorbar", className)}
        opacity={animate ? 0 : 1}
        style={
          animate
            ? {
                animation:
                  "fadeInSlide 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards",
              }
            : undefined
        }
        {...props}
      >
        <defs>
          <filter id="colorbar-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>
        <rect
          x={colorbarX}
          y={colorbarY}
          width={colorbarWidth}
          height={colorbarHeight}
          fill={gradient
            .replace("linear-gradient(to bottom, ", "")
            .replace(")", "")}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeOpacity={0.2}
          rx={4}
          filter="url(#colorbar-shadow)"
        />
        {ticks.map((tick, i) => {
          const tickY = colorbarY + (i / (ticks.length - 1)) * colorbarHeight;
          return (
            <g key={`tick-${i}`}>
              <line
                x1={colorbarX + colorbarWidth}
                y1={tickY}
                x2={colorbarX + colorbarWidth + 6}
                y2={tickY}
                stroke="currentColor"
                strokeWidth={1.5}
                opacity={0.4}
              />
              <text
                x={colorbarX + colorbarWidth + 12}
                y={tickY}
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={500}
                fill="currentColor"
                opacity={0.75}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatValue(tick)}
              </text>
            </g>
          );
        })}
        <style jsx>{`
          @keyframes fadeInSlide {
            from {
              opacity: 0;
              transform: translateX(12px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </g>
    );
  }
);

HeatmapColorbar.displayName = "Heatmap.Colorbar";

/**
 * Tooltip component - shows cell information on hover
 */
export interface HeatmapTooltipProps extends React.SVGProps<SVGGElement> {}

const HeatmapTooltip = React.forwardRef<SVGGElement, HeatmapTooltipProps>(
  ({ className, children, ...props }, ref) => {
    const {
      hoveredCell,
      cells,
      xLabels,
      yLabels,
      valueFormatter,
      xScale,
      yScale,
      cellWidth,
      cellHeight,
      cellShape,
      margin,
      plotWidth,
      plotHeight,
      gridWidth,
      gridHeight,
    } = useHeatmap();

    if (!hoveredCell) return null;

    const cell = cells.find(
      (c) => c.x === hoveredCell.x && c.y === hoveredCell.y
    );
    if (!cell) return null;

    const xLabel = xLabels?.[cell.x] || `X: ${cell.x}`;
    const yLabel = yLabels?.[cell.y] || `Y: ${cell.y}`;
    const valueLabel = valueFormatter
      ? valueFormatter(cell.value)
      : formatValue(cell.value);

    let tooltipX: number;
    let tooltipY: number;

    if (cellShape === "hexagon") {
      const maxRadius =
        Math.min(
          plotWidth / ((gridWidth - 1) * 1.5 + 2),
          plotHeight / ((gridHeight - 1) * Math.sqrt(3) + Math.sqrt(3))
        ) * 0.95;
      const { cx, cy } = getHexPosition(
        hoveredCell.x,
        hoveredCell.y,
        maxRadius
      );
      tooltipX = margin.left + cx + maxRadius;
      tooltipY = margin.top + cy + (maxRadius * Math.sqrt(3)) / 2;
    } else {
      tooltipX = xScale(hoveredCell.x) + cellWidth / 2;
      tooltipY = yScale(hoveredCell.y) + cellHeight / 2;
    }

    return (
      <g ref={ref} className={cn("heatmap-tooltip", className)} {...props}>
        <rect
          x={tooltipX + 10}
          y={tooltipY - 40}
          width={160}
          height={cell.label ? 65 : 50}
          rx={6}
          fill="currentColor"
          opacity={0.95}
        />
        <text
          x={tooltipX + 18}
          y={tooltipY - 24}
          fontSize={11}
          fontWeight={600}
          fill="white"
          style={{ mixBlendMode: "difference" }}
        >
          {xLabel} × {yLabel}
        </text>
        <text
          x={tooltipX + 18}
          y={tooltipY - 10}
          fontSize={10}
          fill="white"
          opacity={0.8}
          style={{ mixBlendMode: "difference" }}
        >
          Value: {valueLabel}
        </text>
        {cell.label && (
          <text
            x={tooltipX + 18}
            y={tooltipY + 4}
            fontSize={10}
            fill="white"
            opacity={0.8}
            style={{ mixBlendMode: "difference" }}
          >
            {cell.label}
          </text>
        )}
      </g>
    );
  }
);

HeatmapTooltip.displayName = "Heatmap.Tooltip";

/**
 * Loading state component
 */
export interface HeatmapLoadingProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const HeatmapLoading = React.forwardRef<HTMLDivElement, HeatmapLoadingProps>(
  ({ className, style, children, ...props }, ref) => {
    const { width, height } = useHeatmap();

    return (
      <div
        ref={ref}
        className={cn("heatmap-loading", className)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "hsl(var(--background) / 0.95)",
          backdropFilter: "blur(8px)",
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
                position: "relative",
                width: "48px",
                height: "48px",
                margin: "0 auto 16px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  border: "3px solid hsl(var(--muted) / 0.15)",
                  borderTop: "3px solid hsl(var(--primary))",
                  borderRadius: "50%",
                  animation: "spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  border: "3px solid transparent",
                  borderBottom: "3px solid hsl(var(--primary) / 0.6)",
                  borderRadius: "50%",
                  animation:
                    "spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "hsl(var(--foreground))",
                opacity: 0.8,
              }}
            >
              Loading heatmap...
            </div>
          </div>
        )}
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }
);

HeatmapLoading.displayName = "Heatmap.Loading";

/**
 * Empty state component
 */
export interface HeatmapEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const HeatmapEmpty = React.forwardRef<HTMLDivElement, HeatmapEmptyProps>(
  ({ className, style, children, ...props }, ref) => {
    const { width, height } = useHeatmap();

    return (
      <div
        ref={ref}
        className={cn("heatmap-empty", className)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
          ...style,
        }}
        role="status"
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
              <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
            </svg>
            <div
              style={{
                fontSize: "14px",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              No data available
            </div>
          </>
        )}
      </div>
    );
  }
);

HeatmapEmpty.displayName = "Heatmap.Empty";

// ============================================================================
// Exports
// ============================================================================

export const Heatmap = Object.assign(HeatmapRoot, {
  Root: HeatmapRoot,
  Container: HeatmapContainer,
  Viewport: HeatmapViewport,
  Cells: HeatmapCells,
  Axes: HeatmapAxes,
  Colorbar: HeatmapColorbar,
  Tooltip: HeatmapTooltip,
  Loading: HeatmapLoading,
  Empty: HeatmapEmpty,
});
