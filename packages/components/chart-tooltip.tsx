"use client";

import { memo } from "react";

// ============================================================================
// Types
// ============================================================================

export interface TooltipProps {
  /** X position in SVG coordinates */
  x: number;
  /** Y position in SVG coordinates */
  y: number;
  /** Content to display in tooltip */
  content: React.ReactNode;
  /** Tooltip offset from point (default: 10px) */
  offset?: { x: number; y: number };
  /** Alignment of tooltip relative to point */
  align?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "auto";
  /** Show crosshair lines */
  showCrosshair?: boolean;
  /** Crosshair bounds [minX, minY, maxX, maxY] */
  crosshairBounds?: [number, number, number, number];
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Theme variant (auto-detects from CSS if not specified) */
  theme?: "light" | "dark" | "auto";
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * A reusable tooltip component for charts
 *
 * @example
 * ```tsx
 * <ChartTooltip
 *   x={100}
 *   y={200}
 *   content="Value: 42"
 *   showCrosshair
 * />
 * ```
 */
export const ChartTooltip = memo(
  ({
    x,
    y,
    content,
    offset = { x: 10, y: -10 },
    align = "auto",
    showCrosshair = false,
    crosshairBounds,
    backgroundColor,
    textColor,
    theme: themeProp = "auto",
    className = "",
  }: TooltipProps) => {
    const theme = themeProp === "auto" ? "auto" : themeProp;
    // Auto-align logic
    let finalAlign = align;
    if (align === "auto" && crosshairBounds) {
      const [minX, minY, maxX, maxY] = crosshairBounds;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      const isLeft = x < centerX;
      const isTop = y < centerY;

      if (isTop && !isLeft) finalAlign = "bottom-right";
      else if (isTop && isLeft) finalAlign = "bottom-left";
      else if (!isTop && !isLeft) finalAlign = "top-right";
      else finalAlign = "top-left";
    }

    // Calculate tooltip position based on alignment
    let tooltipX = x + offset.x;
    let tooltipY = y + offset.y;

    if (finalAlign === "top-left" || finalAlign === "bottom-left") {
      tooltipX = x - offset.x;
    }
    if (finalAlign === "bottom-right" || finalAlign === "bottom-left") {
      tooltipY = y - offset.y;
    }

    // Measure content for better positioning
    const contentString = typeof content === "string" ? content : "";
    const estimatedWidth = contentString.length * 7 + 8;

    // Theme-aware colors
    const bgColor =
      backgroundColor || (theme === "dark" ? "#09090b" : "#fafafa");
    const txtColor = textColor || (theme === "dark" ? "#fafafa" : "#09090b");

    return (
      <g
        className={`chart-tooltip ${className}`}
        style={{ isolation: "isolate" }}
      >
        {/* Crosshair lines */}
        {showCrosshair && crosshairBounds && (
          <g style={{ mixBlendMode: "normal" }}>
            <line
              x1={x}
              y1={crosshairBounds[1]}
              x2={x}
              y2={crosshairBounds[3]}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="3,3"
              opacity={0.3}
              pointerEvents="none"
            />
            <line
              x1={crosshairBounds[0]}
              y1={y}
              x2={crosshairBounds[2]}
              y2={y}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="3,3"
              opacity={0.3}
              pointerEvents="none"
            />
          </g>
        )}

        {/* Tooltip box - rendered last for proper z-index */}
        <g transform={`translate(${tooltipX}, ${tooltipY})`}>
          <defs>
            <filter id="tooltip-shadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Background with glassmorphism */}
          <rect
            x={finalAlign.includes("left") ? -estimatedWidth - 4 : -2}
            y={-22}
            width={estimatedWidth + 8}
            height={32}
            fill={bgColor}
            stroke="currentColor"
            strokeWidth={1}
            strokeOpacity={0.12}
            rx={6}
            opacity={0.98}
            filter="url(#tooltip-shadow)"
          />
          <text
            x={finalAlign.includes("left") ? -estimatedWidth : 4}
            y={-2}
            fill={txtColor}
            fontSize={11}
            fontFamily="ui-monospace, monospace"
            fontWeight={500}
            letterSpacing={0.2}
            style={{ fontVariantNumeric: "tabular-nums", userSelect: "none" }}
          >
            {content}
          </text>
        </g>
      </g>
    );
  }
);

ChartTooltip.displayName = "ChartTooltip";
