"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  forwardRef,
  memo,
  useCallback,
} from "react";
import { ChartTooltip } from "./chart-tooltip";
import {
  mapDomainToColor,
  type ColormapName,
  generateGradient,
} from "./colormaps";

// ============================================================================
// Types
// ============================================================================

export interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  /** Optional label for the cell */
  label?: string;
}

export type CellShape = "square" | "hexagon";

export interface HeatmapProps {
  /** 2D data grid or flat array of cells */
  data: number[][] | HeatmapCell[];
  /** X-axis labels (for categorical data) */
  xLabels?: string[];
  /** Y-axis labels (for categorical data) */
  yLabels?: string[];
  /** X-axis title */
  xAxisLabel?: string;
  /** Y-axis title */
  yAxisLabel?: string;
  /** Colormap to use */
  colormap?: ColormapName;
  /** Value domain [min, max] or "auto" */
  domain?: [number, number] | "auto";
  width?: number;
  height?: number;
  /** Show color scale legend */
  showColorbar?: boolean;
  /** Show cell values as text */
  showValues?: boolean;
  /** Show grid lines between cells */
  showGrid?: boolean;
  /** Cell shape: square or hexagon */
  cellShape?: CellShape;
  /** Cell gap/padding (0-1, as fraction of cell size) */
  cellGap?: number;
  animate?: boolean;
  /** Enable responsive container */
  responsive?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Value formatter */
  valueFormatter?: (value: number) => string;
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

interface ChartContext {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  hoveredCell: { x: number; y: number } | null;
  setHoveredCell: (cell: { x: number; y: number } | null) => void;
}

const Context = createContext<ChartContext | null>(null);

function useChart() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Must be used within Heatmap");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function useResizeObserver(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
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
// Components
// ============================================================================

interface HeatmapCellsProps {
  cells: HeatmapCell[];
  gridWidth: number;
  gridHeight: number;
  colormap: ColormapName;
  domain: [number, number];
  showValues: boolean;
  showGrid: boolean;
  cellShape: CellShape;
  cellGap: number;
  animate: boolean;
  valueFormatter?: (value: number) => string;
  margin: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
}

const HeatmapCells = memo(
  ({
    cells,
    gridWidth,
    gridHeight,
    colormap,
    domain,
    showValues,
    showGrid,
    cellShape,
    cellGap,
    animate,
    valueFormatter,
    margin,
    plotWidth,
    plotHeight,
  }: HeatmapCellsProps) => {
    const {
      cellWidth,
      cellHeight,
      xScale,
      yScale,
      hoveredCell,
      setHoveredCell,
    } = useChart();

    return (
      <g className="heatmap-cells">
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

          let cellElement: JSX.Element;
          let centerX: number;
          let centerY: number;

          if (cellShape === "hexagon") {
            // Calculate hexagon radius to fit all hexagons in the plot area
            // For flat-top hexagons: width = 2*r, height = sqrt(3)*r
            // Horizontal spacing: 1.5*r between centers
            // Vertical spacing: sqrt(3)*r between centers
            const maxRadius = Math.min(
              plotWidth / ((gridWidth - 1) * 1.5 + 2),
              plotHeight / ((gridHeight - 1) * Math.sqrt(3) + Math.sqrt(3))
            ) * 0.95;

            const { cx, cy } = getHexPosition(cell.x, cell.y, maxRadius);
            centerX = margin.left + cx + maxRadius;
            centerY = margin.top + cy + maxRadius * Math.sqrt(3) / 2;

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

HeatmapCells.displayName = "HeatmapCells";

interface AxesProps {
  xLabels?: string[];
  yLabels?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  gridWidth: number;
  gridHeight: number;
  animate: boolean;
  margin: { top: number; right: number; bottom: number; left: number };
}

const Axes = memo(
  ({
    xLabels,
    yLabels,
    xAxisLabel,
    yAxisLabel,
    gridWidth,
    gridHeight,
    animate,
    margin,
  }: AxesProps) => {
    const { width, height, cellWidth, cellHeight, xScale, yScale } = useChart();

    return (
      <g className="axes">
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
                ? { animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards" }
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
                ? { animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards" }
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

Axes.displayName = "Axes";

interface ColorbarProps {
  colormap: ColormapName;
  domain: [number, number];
  margin: { top: number; right: number; bottom: number; left: number };
  animate: boolean;
}

const Colorbar = memo(
  ({ colormap, domain, margin, animate }: ColorbarProps) => {
    const { width, height } = useChart();

    const colorbarWidth = 24;
    const colorbarHeight = height - margin.top - margin.bottom;
    const colorbarX = width - margin.right + 30;
    const colorbarY = margin.top;

    const gradient = generateGradient(colormap, "to bottom");

    const ticks = [domain[0], (domain[0] + domain[1]) / 2, domain[1]];

    return (
      <g
        className="colorbar"
        opacity={animate ? 0 : 1}
        style={
          animate ? { animation: "fadeInSlide 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards" } : undefined
        }
      >
        <defs>
          <linearGradient
            id="colorbar-gradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            {/* Parse gradient stops from the gradient string */}
            {/* For simplicity, we'll just use the colormap directly */}
          </linearGradient>
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
          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }
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

Colorbar.displayName = "Colorbar";

// ============================================================================
// Main Component
// ============================================================================

export const Heatmap = memo(
  forwardRef<SVGSVGElement, HeatmapProps>(
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
        loading = false,
        emptyMessage = "No data available",
        valueFormatter,
        className = "",
      },
      ref
    ) => {
      const [hoveredCell, setHoveredCell] = useState<{
        x: number;
        y: number;
      } | null>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const svgRef = useRef<SVGSVGElement>(null);

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
      } = useMemo(() => normalizeData(data), [data]);

      // Calculate domain
      const valueDomain: [number, number] = useMemo(
        () => (domain === "auto" ? getDomain(cells) : domain),
        [cells, domain]
      );

      const margin = useMemo(
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

      const xScale = useCallback(
        (x: number) => margin.left + x * cellWidth,
        [margin.left, cellWidth]
      );
      const yScale = useCallback(
        (y: number) => margin.top + y * cellHeight,
        [margin.top, cellHeight]
      );

      const contextValue: ChartContext = useMemo(
        () => ({
          width: actualWidth,
          height: actualHeight,
          cellWidth,
          cellHeight,
          xScale,
          yScale,
          hoveredCell,
          setHoveredCell,
        }),
        [
          actualWidth,
          actualHeight,
          cellWidth,
          cellHeight,
          xScale,
          yScale,
          hoveredCell,
        ]
      );

      const tooltipContent = useMemo(() => {
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

        let content = `${xLabel} × ${yLabel}\nValue: ${valueLabel}`;
        if (cell.label) {
          content += `\n${cell.label}`;
        }

        return content;
      }, [hoveredCell, cells, xLabels, yLabels, valueFormatter]);

      const tooltipPosition = useMemo(() => {
        if (!hoveredCell) return null;

        if (cellShape === "hexagon") {
          const maxRadius = Math.min(
            plotWidth / ((gridWidth - 1) * 1.5 + 2),
            plotHeight / ((gridHeight - 1) * Math.sqrt(3) + Math.sqrt(3))
          ) * 0.95;
          const { cx, cy } = getHexPosition(hoveredCell.x, hoveredCell.y, maxRadius);
          return {
            x: margin.left + cx + maxRadius,
            y: margin.top + cy + maxRadius * Math.sqrt(3) / 2
          };
        } else {
          const x = xScale(hoveredCell.x) + cellWidth / 2;
          const y = yScale(hoveredCell.y) + cellHeight / 2;
          return { x, y };
        }
      }, [hoveredCell, xScale, yScale, cellWidth, cellHeight, cellShape, margin, plotWidth, plotHeight, gridWidth, gridHeight]);

      const isEmpty = cells.length === 0;

      return (
        <Context.Provider value={contextValue}>
          <div
            ref={containerRef}
            style={{
              position: "relative",
              width: responsive ? "100%" : `${width}px`,
              height: responsive ? "100%" : `${height}px`,
              display: responsive ? "block" : "inline-block",
              minHeight: responsive ? "300px" : undefined,
            }}
            className={className}
          >
            {loading && (
              <div
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
                }}
                role="status"
                aria-live="polite"
              >
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
                        animation: "spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse",
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
                <style jsx>{`
                  @keyframes spin {
                    to {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
              </div>
            )}

            {!loading && isEmpty && (
              <div
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
                }}
                role="status"
              >
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
                  {emptyMessage}
                </div>
              </div>
            )}

            {!loading && !isEmpty && (
              <svg
                ref={(node) => {
                  if (typeof ref === "function") {
                    ref(node);
                  } else if (ref) {
                    ref.current = node;
                  }
                  if (node) {
                    (
                      svgRef as React.MutableRefObject<SVGSVGElement | null>
                    ).current = node;
                  }
                }}
                width={actualWidth}
                height={actualHeight}
                style={{ userSelect: "none" }}
                role="img"
                aria-label="Heatmap visualization"
              >
                <HeatmapCells
                  cells={cells}
                  gridWidth={gridWidth}
                  gridHeight={gridHeight}
                  colormap={colormap}
                  domain={valueDomain}
                  showValues={showValues}
                  showGrid={showGrid}
                  cellShape={cellShape}
                  cellGap={cellGap}
                  animate={animate}
                  valueFormatter={valueFormatter}
                  margin={margin}
                  plotWidth={plotWidth}
                  plotHeight={plotHeight}
                />
                <Axes
                  xLabels={xLabels}
                  yLabels={yLabels}
                  xAxisLabel={xAxisLabel}
                  yAxisLabel={yAxisLabel}
                  gridWidth={gridWidth}
                  gridHeight={gridHeight}
                  animate={animate}
                  margin={margin}
                />
                {showColorbar && (
                  <Colorbar
                    colormap={colormap}
                    domain={valueDomain}
                    margin={margin}
                    animate={animate}
                  />
                )}
                {tooltipContent && tooltipPosition && (
                  <ChartTooltip
                    x={tooltipPosition.x}
                    y={tooltipPosition.y}
                    content={tooltipContent}
                  />
                )}
              </svg>
            )}
          </div>
        </Context.Provider>
      );
    }
  )
);

Heatmap.displayName = "Heatmap";
