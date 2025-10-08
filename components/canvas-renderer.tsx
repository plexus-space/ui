"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * High-performance Canvas renderer for line charts
 *
 * Uses Canvas2D API for rendering large datasets efficiently.
 * Supports gradient fills, smooth lines, and high DPI displays.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Series {
  name: string;
  data: Point[];
  color: string;
  strokeWidth?: number;
  dashed?: boolean;
  filled?: boolean;
}

export interface CanvasRendererProps {
  series: Series[];
  width: number;
  height: number;
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  margin: { top: number; right: number; bottom: number; left: number };
  backgroundColor?: string;
  antiAlias?: boolean;
  className?: string;
}

/**
 * Canvas-based line chart renderer
 *
 * Optimized for rendering 10k-1M points with smooth performance.
 * Uses requestAnimationFrame for smooth animations.
 */
export function CanvasRenderer({
  series,
  width,
  height,
  xScale,
  yScale,
  margin,
  backgroundColor = "transparent",
  antiAlias = true,
  className = "",
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: backgroundColor === "transparent",
      desynchronized: true, // Optimize for animations
    });

    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    if (backgroundColor !== "transparent") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    // Anti-aliasing
    if (antiAlias) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }

    // Clip to chart area
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin.left, margin.top, width - margin.left - margin.right, height - margin.top - margin.bottom);
    ctx.clip();

    // Render each series
    series.forEach((s) => {
      if (s.data.length === 0) return;

      // Draw filled area if requested
      if (s.filled) {
        ctx.beginPath();
        const baselineY = height - margin.bottom;

        // Start at bottom-left
        ctx.moveTo(xScale(s.data[0].x), baselineY);

        // Draw line to first point
        ctx.lineTo(xScale(s.data[0].x), yScale(s.data[0].y));

        // Draw the curve
        for (let i = 1; i < s.data.length; i++) {
          ctx.lineTo(xScale(s.data[i].x), yScale(s.data[i].y));
        }

        // Close at bottom-right
        ctx.lineTo(xScale(s.data[s.data.length - 1].x), baselineY);
        ctx.closePath();

        // Create gradient fill
        const gradient = ctx.createLinearGradient(0, margin.top, 0, height - margin.bottom);
        const rgb = hexToRgb(s.color);
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw line
      ctx.beginPath();
      ctx.moveTo(xScale(s.data[0].x), yScale(s.data[0].y));

      for (let i = 1; i < s.data.length; i++) {
        ctx.lineTo(xScale(s.data[i].x), yScale(s.data[i].y));
      }

      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.strokeWidth || 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (s.dashed) {
        ctx.setLineDash([6, 6]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.stroke();
    });

    ctx.restore();
  }, [series, width, height, xScale, yScale, margin, backgroundColor, antiAlias]);

  // Render on mount and when dependencies change
  useEffect(() => {
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Schedule render
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none", // Let SVG handle interactions
      }}
      className={className}
    />
  );
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
