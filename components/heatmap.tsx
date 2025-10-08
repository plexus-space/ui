"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  forwardRef,
  memo,
} from "react";
import { ChartTooltip } from "./chart-tooltip";

// ============================================================================
// Types
// ============================================================================

/**
 * A single cell in the heatmap
 */
export interface HeatmapCell {
  /** Row index */
  row: number;
  /** Column index */
  col: number;
  /** Cell value */
  value: number;
}

import { mapDomainToColor, type ColormapName } from "./colormaps";

/**
 * Colormap types for scientific visualization
 */
export type Colormap = ColormapName;

/**
 * Props for the Heatmap component
 */
export interface HeatmapProps {
  /** 2D array of values (rows × columns) */
  data: number[][];
  /** X-axis labels (one per column) */
  xLabels?: string[];
  /** Y-axis labels (one per row) */
  yLabels?: string[];
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Colormap for value mapping */
  colormap?: Colormap;
  /** Padding between cells in pixels */
  cellPadding?: number;
  /** Show values in cells */
  showValues?: boolean;
  /** Value format string (e.g., ".2f", ".1e") or custom formatter */
  valueFormat?: string | ((value: number) => string);
  /** Show color scale legend */
  showColorScale?: boolean;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Cell border width in pixels */
  cellBorderWidth?: number;
  /** Cell border color */
  cellBorderColor?: string;
  /** Min/max values for color scaling, or "auto" */
  domain?: [number, number] | "auto";
  /** Enable animations */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Context (Internal)
// ============================================================================

interface HeatmapContext {
  width: number;
  height: number;
  hoveredCell: { row: number; col: number } | null;
  setHoveredCell: (cell: { row: number; col: number } | null) => void;
}

const Context = createContext<HeatmapContext | null>(null);

function useHeatmap() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Must be used within Heatmap");
  return ctx;
}

/**
 * Map a value to a color using the specified colormap
 * Now uses the advanced scientific colormaps from colormaps.ts
 */
function valueToColor(
  value: number,
  min: number,
  max: number,
  colormap: Colormap
): string {
  return mapDomainToColor(value, min, max, colormap);
}

// ============================================================================
// Utilities
// ============================================================================

function formatValue(
  value: number,
  format?: string | ((v: number) => string)
): string {
  if (typeof format === "function") {
    return format(value);
  }

  if (typeof format === "string") {
    // Simple format parsing: ".2f" = 2 decimals, ".1e" = scientific notation
    const match = format.match(/\.(\d+)([fe])/);
    if (match) {
      const decimals = parseInt(match[1]);
      const type = match[2];
      if (type === "f") {
        return value.toFixed(decimals);
      } else if (type === "e") {
        return value.toExponential(decimals);
      }
    }
  }

  // Default formatting
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  if (Math.abs(value) >= 0.01) return value.toFixed(2);
  if (value === 0) return "0";
  return value.toExponential(1);
}

/**
 * Get min/max values from 2D array
 */
function getDomain(data: number[][]): [number, number] {
  let min = Infinity;
  let max = -Infinity;

  for (const row of data) {
    for (const value of row) {
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }

  return [min, max];
}

/**
 * Check if text should be light or dark based on background color
 */
function shouldUseLightText(color: string): boolean {
  // Extract RGB values
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return false;

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.5;
}

// ============================================================================
// Components
// ============================================================================

interface ColorScaleProps {
  min: number;
  max: number;
  colormap: Colormap;
  x: number;
  y: number;
  height: number;
  animate: boolean;
}

const ColorScale = memo(
  ({ min, max, colormap, x, y, height, animate }: ColorScaleProps) => {
    const scaleWidth = 20;
    const scaleHeight = height - 40;
    const steps = 50;

    return (
      <g
        transform={`translate(${x}, ${y})`}
        opacity={animate ? 0 : 1}
        style={
          animate ? { animation: "fadeIn 0.4s ease 0.3s forwards" } : undefined
        }
      >
        {/* Color gradient */}
        {Array.from({ length: steps }, (_, i) => {
          const value = max - ((max - min) * i) / (steps - 1);
          const color = valueToColor(value, min, max, colormap);
          const yPos = (i * scaleHeight) / steps;

          return (
            <rect
              key={i}
              x={0}
              y={yPos}
              width={scaleWidth}
              height={scaleHeight / steps + 1}
              fill={color}
            />
          );
        })}

        {/* Border */}
        <rect
          x={0}
          y={0}
          width={scaleWidth}
          height={scaleHeight}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.3}
        />

        {/* Labels */}
        <text
          x={scaleWidth + 8}
          y={5}
          fontSize={10}
          fill="currentColor"
          opacity={0.7}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatValue(max)}
        </text>
        <text
          x={scaleWidth + 8}
          y={scaleHeight}
          fontSize={10}
          fill="currentColor"
          opacity={0.7}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatValue(min)}
        </text>

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

ColorScale.displayName = "ColorScale";

interface CellsProps {
  data: number[][];
  cellWidth: number;
  cellHeight: number;
  offsetX: number;
  offsetY: number;
  colormap: Colormap;
  domain: [number, number];
  showValues: boolean;
  valueFormat?: string | ((value: number) => string);
  cellBorderWidth: number;
  cellBorderColor: string;
  cellPadding: number;
  animate: boolean;
}

const Cells = memo(
  ({
    data,
    cellWidth,
    cellHeight,
    offsetX,
    offsetY,
    colormap,
    domain,
    showValues,
    valueFormat,
    cellBorderWidth,
    cellBorderColor,
    cellPadding,
    animate,
  }: CellsProps) => {
    const { setHoveredCell, hoveredCell } = useHeatmap();
    const [min, max] = domain;

    return (
      <g className="cells">
        {data.map((row, i) =>
          row.map((value, j) => {
            const x = offsetX + j * cellWidth + cellPadding;
            const y = offsetY + i * cellHeight + cellPadding;
            const actualWidth = cellWidth - 2 * cellPadding;
            const actualHeight = cellHeight - 2 * cellPadding;
            const color = valueToColor(value, min, max, colormap);
            const isHovered = hoveredCell?.row === i && hoveredCell?.col === j;

            return (
              <g
                key={`${i}-${j}`}
                opacity={animate ? 0 : 1}
                style={
                  animate
                    ? {
                        animation: `fadeIn 0.3s ease ${
                          (i + j) * 0.01
                        }s forwards`,
                      }
                    : undefined
                }
              >
                <rect
                  x={x}
                  y={y}
                  width={actualWidth}
                  height={actualHeight}
                  fill={color}
                  stroke={cellBorderColor}
                  strokeWidth={cellBorderWidth}
                  opacity={isHovered ? 0.8 : 1}
                  rx={2}
                  style={{
                    cursor: "pointer",
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={() => setHoveredCell({ row: i, col: j })}
                  onMouseLeave={() => setHoveredCell(null)}
                />
                {showValues && actualWidth > 40 && actualHeight > 25 && (
                  <text
                    x={x + actualWidth / 2}
                    y={y + actualHeight / 2 + 4}
                    textAnchor="middle"
                    fontSize={Math.min(actualWidth / 5, actualHeight / 3, 11)}
                    fill={shouldUseLightText(color) ? "#ffffff" : "#000000"}
                    opacity={0.9}
                    pointerEvents="none"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatValue(value, valueFormat)}
                  </text>
                )}
              </g>
            );
          })
        )}
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

Cells.displayName = "Cells";

interface AxesProps {
  xLabels?: string[];
  yLabels?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  cellWidth: number;
  cellHeight: number;
  offsetX: number;
  offsetY: number;
  numCols: number;
  numRows: number;
  animate: boolean;
}

const Axes = memo(
  ({
    xLabels,
    yLabels,
    xAxisLabel,
    yAxisLabel,
    cellWidth,
    cellHeight,
    offsetX,
    offsetY,
    numCols,
    numRows,
    animate,
  }: AxesProps) => {
    const maxLabelWidth = 80;
    const fontSize = 10;

    return (
      <g className="axes">
        {/* X-axis labels */}
        {xLabels?.map((label, i) => (
          <g
            key={`xlabel-${i}`}
            opacity={animate ? 0 : 1}
            style={
              animate
                ? { animation: `fadeIn 0.3s ease ${0.2 + i * 0.02}s forwards` }
                : undefined
            }
          >
            <text
              x={offsetX + i * cellWidth + cellWidth / 2}
              y={offsetY + numRows * cellHeight + 15}
              textAnchor="middle"
              fontSize={fontSize}
              fill="currentColor"
              opacity={0.8}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {label.length > maxLabelWidth / 6
                ? label.substring(0, Math.floor(maxLabelWidth / 6)) + "..."
                : label}
            </text>
          </g>
        ))}

        {/* Y-axis labels */}
        {yLabels?.map((label, i) => (
          <g
            key={`ylabel-${i}`}
            opacity={animate ? 0 : 1}
            style={
              animate
                ? { animation: `fadeIn 0.3s ease ${0.2 + i * 0.02}s forwards` }
                : undefined
            }
          >
            <text
              x={offsetX - 8}
              y={offsetY + i * cellHeight + cellHeight / 2 + 4}
              textAnchor="end"
              fontSize={fontSize}
              fill="currentColor"
              opacity={0.8}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {label.length > maxLabelWidth / 6
                ? label.substring(0, Math.floor(maxLabelWidth / 6)) + "..."
                : label}
            </text>
          </g>
        ))}

        {/* Axis titles */}
        {xAxisLabel && (
          <text
            x={offsetX + (numCols * cellWidth) / 2}
            y={offsetY + numRows * cellHeight + 35}
            textAnchor="middle"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
            opacity={animate ? 0 : 1}
            style={
              animate
                ? { animation: "fadeIn 0.4s ease 0.4s forwards" }
                : undefined
            }
          >
            {xAxisLabel}
          </text>
        )}

        {yAxisLabel && (
          <text
            x={offsetX - 50}
            y={offsetY + (numRows * cellHeight) / 2}
            textAnchor="middle"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
            transform={`rotate(-90 ${offsetX - 50} ${
              offsetY + (numRows * cellHeight) / 2
            })`}
            opacity={animate ? 0 : 1}
            style={
              animate
                ? { animation: "fadeIn 0.4s ease 0.4s forwards" }
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
        `}</style>
      </g>
    );
  }
);

Axes.displayName = "Axes";

// ============================================================================
// Main Component
// ============================================================================

/**
 * A beautiful, configurable heatmap for 2D data visualization
 *
 * @example
 * ```tsx
 * <Heatmap
 *   data={[
 *     [1, 2, 3],
 *     [4, 5, 6],
 *     [7, 8, 9]
 *   ]}
 *   xLabels={["A", "B", "C"]}
 *   yLabels={["X", "Y", "Z"]}
 *   colormap="viridis"
 *   showValues
 * />
 * ```
 */
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
        showValues = false,
        valueFormat,
        showColorScale = true,
        width = 800,
        height = 500,
        cellBorderWidth = 0,
        cellBorderColor = "rgba(255, 255, 255, 0.1)",
        cellPadding = 2,
        domain: domainProp,
        animate = true,
        className = "",
      },
      ref
    ) => {
      const [hoveredCell, setHoveredCell] = useState<{
        row: number;
        col: number;
      } | null>(null);

      // Calculate dimensions
      const numRows = data.length;
      const numCols = data[0]?.length || 0;

      const margin = useMemo(() => {
        const hasYLabels = yLabels && yLabels.length > 0;
        const hasXLabels = xLabels && xLabels.length > 0;
        const hasYAxisLabel = !!yAxisLabel;
        const hasXAxisLabel = !!xAxisLabel;

        return {
          top: 20,
          right: showColorScale ? 80 : 20,
          bottom: 20 + (hasXLabels ? 20 : 0) + (hasXAxisLabel ? 20 : 0),
          left: 20 + (hasYLabels ? 70 : 0) + (hasYAxisLabel ? 30 : 0),
        };
      }, [xLabels, yLabels, xAxisLabel, yAxisLabel, showColorScale]);

      const availableWidth = width - margin.left - margin.right;
      const availableHeight = height - margin.top - margin.bottom;

      const cellWidth = availableWidth / numCols;
      const cellHeight = availableHeight / numRows;

      // Calculate domain
      const domain =
        domainProp === "auto" || !domainProp ? getDomain(data) : domainProp;

      const contextValue: HeatmapContext = useMemo(
        () => ({
          width,
          height,
          hoveredCell,
          setHoveredCell,
        }),
        [width, height, hoveredCell]
      );

      // Tooltip content
      const tooltipContent = useMemo(() => {
        if (!hoveredCell) return null;
        const value = data[hoveredCell.row]?.[hoveredCell.col];
        if (value === undefined) return null;

        const rowLabel = yLabels?.[hoveredCell.row] || `Row ${hoveredCell.row}`;
        const colLabel = xLabels?.[hoveredCell.col] || `Col ${hoveredCell.col}`;

        return `${rowLabel}, ${colLabel}: ${formatValue(value, valueFormat)}`;
      }, [hoveredCell, data, xLabels, yLabels, valueFormat]);

      const tooltipPosition = useMemo(() => {
        if (!hoveredCell) return null;
        return {
          x: margin.left + hoveredCell.col * cellWidth + cellWidth / 2,
          y: margin.top + hoveredCell.row * cellHeight + cellHeight / 2,
        };
      }, [hoveredCell, margin, cellWidth, cellHeight]);

      return (
        <Context.Provider value={contextValue}>
          <svg
            ref={ref}
            width={width}
            height={height}
            className={className}
            style={{ userSelect: "none" }}
          >
            <Cells
              data={data}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              offsetX={margin.left}
              offsetY={margin.top}
              colormap={colormap}
              domain={domain}
              showValues={showValues}
              valueFormat={valueFormat}
              cellBorderWidth={cellBorderWidth}
              cellBorderColor={cellBorderColor}
              cellPadding={cellPadding}
              animate={animate}
            />

            <Axes
              xLabels={xLabels}
              yLabels={yLabels}
              xAxisLabel={xAxisLabel}
              yAxisLabel={yAxisLabel}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              offsetX={margin.left}
              offsetY={margin.top}
              numCols={numCols}
              numRows={numRows}
              animate={animate}
            />

            {showColorScale && (
              <ColorScale
                min={domain[0]}
                max={domain[1]}
                colormap={colormap}
                x={width - margin.right + 20}
                y={margin.top}
                height={height}
                animate={animate}
              />
            )}

            {tooltipContent && tooltipPosition && (
              <ChartTooltip
                x={tooltipPosition.x}
                y={tooltipPosition.y}
                content={tooltipContent}
                align="auto"
                crosshairBounds={[
                  margin.left,
                  margin.top,
                  width - margin.right,
                  height - margin.bottom,
                ]}
              />
            )}
          </svg>
        </Context.Provider>
      );
    }
  )
);

Heatmap.displayName = "Heatmap";
