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
  symbol?:
    | "line"
    | "circle"
    | "square"
    | "diamond"
    | "triangle"
    | "cross"
    | "plus";
  /** Active state for toggleable series */
  active?: boolean;
  /** Click handler for individual items */
  onClick?: () => void;
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

      case "cross":
        return (
          <g>
            <line
              x1={size / 2 - 4}
              y1={centerY - 4}
              x2={size / 2 + 4}
              y2={centerY + 4}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <line
              x1={size / 2 + 4}
              y1={centerY - 4}
              x2={size / 2 - 4}
              y2={centerY + 4}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        );

      case "plus":
        return (
          <g>
            <line
              x1={size / 2}
              y1={centerY - 5}
              x2={size / 2}
              y2={centerY + 5}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <line
              x1={size / 2 - 5}
              y1={centerY}
              x2={size / 2 + 5}
              y2={centerY}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
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
    spacing = 28,
    showBackground = true,
    onItemClick,
    className = "",
  }: ChartLegendProps) => {
    // Calculate dimensions with more spacing
    const itemHeight = orientation === "vertical" ? spacing : 24;
    const itemWidth = orientation === "horizontal" ? 140 : 160;
    const legendWidth =
      orientation === "horizontal" ? items.length * itemWidth : itemWidth;
    const legendHeight =
      orientation === "vertical" ? items.length * spacing + 16 : 36;

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
          <>
            <defs>
              <filter id="legend-shadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                <feOffset dx="0" dy="2" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.15" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect
              x={-16}
              y={-8}
              width={legendWidth + 12}
              height={legendHeight + 6}
              fill="var(--background)"
              fillOpacity={0.95}
              stroke="currentColor"
              strokeWidth={1}
              strokeOpacity={0.1}
              rx={8}
              filter="url(#legend-shadow)"
            />
          </>
        )}

        {items.map((item, i) => {
          const xOffset = orientation === "horizontal" ? i * itemWidth : 0;
          const yOffset = orientation === "vertical" ? i * spacing : 0;
          const isClickable = onItemClick || item.onClick;
          const isActive = item.active !== undefined ? item.active : true;

          return (
            <g
              key={i}
              transform={`translate(${xOffset}, ${yOffset})`}
              style={{
                cursor: isClickable ? "pointer" : "default",
                transition: "opacity 0.2s ease",
              }}
              opacity={isActive ? 1 : 0.4}
              onClick={() => {
                item.onClick?.();
                onItemClick?.(item, i);
              }}
              onMouseEnter={(e) => {
                if (isClickable) {
                  e.currentTarget.setAttribute(
                    "opacity",
                    isActive ? "0.7" : "0.6"
                  );
                }
              }}
              onMouseLeave={(e) => {
                if (isClickable) {
                  e.currentTarget.setAttribute(
                    "opacity",
                    isActive ? "1" : "0.4"
                  );
                }
              }}
              role={isClickable ? "button" : undefined}
              aria-pressed={isClickable ? isActive : undefined}
              tabIndex={isClickable ? 0 : undefined}
            >
              <Symbol
                symbol={item.symbol || "line"}
                color={item.color}
                strokeWidth={item.strokeWidth}
                dashed={item.dashed}
                filled={item.filled}
              />
              <text
                x={26}
                y={13}
                fontSize={12}
                fill="currentColor"
                opacity={0.95}
                fontWeight={500}
                letterSpacing={0.3}
                style={{
                  userSelect: "none",
                  textDecoration: !isActive ? "line-through" : "none",
                }}
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
