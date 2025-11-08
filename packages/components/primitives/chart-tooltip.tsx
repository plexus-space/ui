"use client";

/**
 * Chart Tooltip - Interactive Data Tooltip
 *
 * Displays data values on hover with customizable formatting.
 * Automatically positions itself to avoid clipping.
 */

import * as React from "react";
import { useChartLayout } from "./chart-container";

// ============================================================================
// Types
// ============================================================================

export interface TooltipData {
  readonly x: number;
  readonly y: number;
  readonly label?: string;
  readonly values: ReadonlyArray<{
    readonly label: string;
    readonly value: string | number;
    readonly color?: readonly [number, number, number];
  }>;
}

export interface ChartTooltipProps {
  /** Tooltip data to display */
  readonly data: TooltipData | null;
  /** Custom formatter for tooltip content */
  readonly formatter?: (data: TooltipData) => React.ReactNode;
  /** Offset from cursor in pixels (default: 10) */
  readonly offset?: number;
}

// ============================================================================
// Component
// ============================================================================

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  data,
  formatter,
  offset = 10,
}) => {
  const { width, height } = useChartLayout();
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  // Update position to avoid clipping
  React.useEffect(() => {
    if (!data || !tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    let x = data.x + offset;
    let y = data.y + offset;

    // Flip horizontally if would clip right edge
    if (x + tooltipRect.width > width) {
      x = data.x - tooltipRect.width - offset;
    }

    // Flip vertically if would clip bottom edge
    if (y + tooltipRect.height > height) {
      y = data.y - tooltipRect.height - offset;
    }

    setPosition({ x, y });
  }, [data, width, height, offset]);

  if (!data) return null;

  return (
    <div
      ref={tooltipRef}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        pointerEvents: "none",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 6,
        padding: "8px 12px",
        color: "#fff",
        fontSize: 11,
        fontFamily: "monospace",
        lineHeight: 1.6,
        whiteSpace: "nowrap",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        zIndex: 1000,
      }}
    >
      {formatter ? (
        formatter(data)
      ) : (
        <>
          {data.label && (
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.label}</div>
          )}
          {data.values.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {item.color && (
                <div
                  style={{
                    width: 12,
                    height: 2,
                    backgroundColor: `rgb(${item.color[0] * 255}, ${
                      item.color[1] * 255
                    }, ${item.color[2] * 255})`,
                  }}
                />
              )}
              <span style={{ opacity: 0.7 }}>{item.label}:</span>
              <span style={{ fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

ChartTooltip.displayName = "ChartTooltip";
