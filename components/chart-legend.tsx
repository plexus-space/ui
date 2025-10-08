"use client";

import { memo } from "react";

// ============================================================================
// Types
// ============================================================================

export interface LegendItem {
  /** Display name */
  name: string;
  /** Color for the legend marker */
  color: string;
  /** Line stroke width (for line charts) */
  strokeWidth?: number;
  /** Dashed line style */
  dashed?: boolean;
  /** Filled area (for polar/area charts) */
  filled?: boolean;
  /** Symbol shape (for scatter plots) */
  symbol?: "line" | "circle" | "square" | "diamond" | "triangle";
}

export interface ChartLegendProps {
  /** Array of legend items */
  items: LegendItem[];
  /** Position of legend */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Custom position (overrides position prop) */
  x?: number;
  y?: number;
  /** Orientation */
  orientation?: "vertical" | "horizontal";
  /** Item spacing in pixels */
  spacing?: number;
  /** Show background box */
  showBackground?: boolean;
  /** Interactive click handler */
  onItemClick?: (item: LegendItem, index: number) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Symbol Renderer
// ============================================================================

interface SymbolProps {
  symbol: LegendItem["symbol"];
  color: string;
  strokeWidth?: number;
  dashed?: boolean;
  filled?: boolean;
}

const Symbol = memo(
  ({
    symbol = "line",
    color,
    strokeWidth = 2,
    dashed,
    filled,
  }: SymbolProps) => {
    const size = 18;
    const centerY = 8;

    switch (symbol) {
      case "line":
        return (
          <>
            <line
              x1={0}
              y1={centerY}
              x2={size}
              y2={centerY}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashed ? "4,4" : undefined}
            />
            {filled && (
              <rect
                x={0}
                y={centerY - 4}
                width={size}
                height={8}
                fill={color}
                opacity={0.2}
              />
            )}
          </>
        );

      case "circle":
        return (
          <circle
            cx={size / 2}
            cy={centerY}
            r={4}
            fill={color}
            stroke="var(--background)"
            strokeWidth={1}
          />
        );

      case "square":
        return (
          <rect
            x={size / 2 - 4}
            y={centerY - 4}
            width={8}
            height={8}
            fill={color}
            stroke="var(--background)"
            strokeWidth={1}
          />
        );

      case "diamond":
        const diamondPath = `M ${size / 2},${centerY - 5} L ${
          size / 2 + 5
        },${centerY} L ${size / 2},${centerY + 5} L ${
          size / 2 - 5
        },${centerY} Z`;
        return (
          <path
            d={diamondPath}
            fill={color}
            stroke="var(--background)"
            strokeWidth={1}
          />
        );

      case "triangle":
        const trianglePath = `M ${size / 2},${centerY - 5} L ${
          size / 2 + 4.5
        },${centerY + 3} L ${size / 2 - 4.5},${centerY + 3} Z`;
        return (
          <path
            d={trianglePath}
            fill={color}
            stroke="var(--background)"
            strokeWidth={1}
          />
        );

      default:
        return null;
    }
  }
);

Symbol.displayName = "Symbol";

// ============================================================================
// Main Component
// ============================================================================

/**
 * A reusable, composable legend for charts
 *
 * @example
 * ```tsx
 * <ChartLegend
 *   items={[
 *     { name: "Series 1", color: "#3b82f6", symbol: "line" },
 *     { name: "Series 2", color: "#ef4444", symbol: "circle" },
 *   ]}
 *   position="top-right"
 * />
 * ```
 */
export const ChartLegend = memo(
  ({
    items,
    position = "top-right",
    x,
    y,
    orientation = "vertical",
    spacing = 24,
    showBackground = true,
    onItemClick,
    className = "",
  }: ChartLegendProps) => {
    // Calculate dimensions
    const itemHeight = orientation === "vertical" ? spacing : 20;
    const itemWidth = orientation === "horizontal" ? 120 : 140;
    const legendWidth =
      orientation === "horizontal" ? items.length * itemWidth : itemWidth;
    const legendHeight =
      orientation === "vertical" ? items.length * spacing + 10 : 30;

    // Default positioning based on position prop if x/y not provided
    let posX = x;
    let posY = y;

    if (posX === undefined || posY === undefined) {
      // These would typically be set by the parent chart component
      posX = posX ?? 0;
      posY = posY ?? 0;
    }

    return (
      <g
        className={`chart-legend ${className}`}
        transform={`translate(${posX}, ${posY})`}
      >
        {showBackground && (
          <rect
            x={-10}
            y={-5}
            width={legendWidth}
            height={legendHeight}
            fill="var(--background)"
            stroke="currentColor"
            strokeWidth={1}
            strokeOpacity={0.15}
            rx={6}
            filter="drop-shadow(0 1px 3px rgb(0 0 0 / 0.08))"
          />
        )}

        {items.map((item, i) => {
          const xOffset = orientation === "horizontal" ? i * itemWidth : 0;
          const yOffset = orientation === "vertical" ? i * spacing : 0;

          return (
            <g
              key={i}
              transform={`translate(${xOffset}, ${yOffset})`}
              style={{
                cursor: onItemClick ? "pointer" : "default",
                transition: "opacity 0.2s ease",
              }}
              opacity={1}
              onClick={() => onItemClick?.(item, i)}
              onMouseEnter={(e) => {
                if (onItemClick) {
                  e.currentTarget.setAttribute("opacity", "0.7");
                }
              }}
              onMouseLeave={(e) => {
                if (onItemClick) {
                  e.currentTarget.setAttribute("opacity", "1");
                }
              }}
            >
              <Symbol
                symbol={item.symbol || "line"}
                color={item.color}
                strokeWidth={item.strokeWidth}
                dashed={item.dashed}
                filled={item.filled}
              />
              <text
                x={24}
                y={12}
                fontSize={11}
                fill="currentColor"
                opacity={0.9}
                fontWeight={500}
                style={{ userSelect: "none" }}
              >
                {item.name}
              </text>
            </g>
          );
        })}
      </g>
    );
  }
);

ChartLegend.displayName = "ChartLegend";
