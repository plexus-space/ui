"use client";

/**
 * Waveform Monitor - WebGPU Primitive
 *
 * A minimal, composable waveform rendering primitive.
 * Like shadcn - unopinionated, extensible, primitive-based.
 *
 * @example
 * ```tsx
 * <WaveformMonitor
 *   width={800}
 *   height={400}
 *   traces={[
 *     { id: "ecg", data: [[0, 0.5], [1, 0.8]], color: [0.2, 0.8, 0.3] }
 *   ]}
 *   className="border rounded-lg"
 * />
 * ```
 */

import * as React from "react";
import { UnifiedWaveformRenderer } from "./primitives/webgpu/unified-waveform-renderer";

// ============================================================================
// Types
// ============================================================================

export interface WaveformTrace {
  readonly id: string;
  readonly data: ReadonlyArray<readonly [number, number]>;
  readonly color?: readonly [number, number, number];
  readonly label?: string;
}

export interface WaveformMonitorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onError"> {
  /** Width in pixels */
  readonly width: number;
  /** Height in pixels */
  readonly height: number;
  /** Traces to render */
  readonly traces: ReadonlyArray<WaveformTrace>;
  /** X domain [min, max] - auto-calculated if omitted */
  readonly xDomain?: readonly [number, number];
  /** Y domain [min, max] - auto-calculated if omitted */
  readonly yDomain?: readonly [number, number];
  /** Plot margins */
  readonly margin?: {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  };
  /** Background color [r, g, b, a] */
  readonly backgroundColor?: readonly [number, number, number, number];
  /** Callback when ready */
  readonly onReady?: () => void;
  /** Error callback */
  readonly onError?: (error: Error) => void;
}

const DEFAULT_MARGIN = { top: 40, right: 40, bottom: 60, left: 70 };
const DEFAULT_BACKGROUND_COLOR: readonly [number, number, number, number] = [
  0.05, 0.05, 0.08, 1.0,
];

// ============================================================================
// Component
// ============================================================================

export const WaveformMonitor = React.forwardRef<
  HTMLDivElement,
  WaveformMonitorProps
>(
  (
    {
      width,
      height,
      traces,
      xDomain,
      yDomain,
      margin = DEFAULT_MARGIN,
      backgroundColor = DEFAULT_BACKGROUND_COLOR,
      onReady,
      onError,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);

    // Set canvas ref
    React.useEffect(() => {
      if (canvasRef.current && !canvas) {
        setCanvas(canvasRef.current);
      }
    }, [canvas]);

    return (
      <div
        ref={ref}
        className={className}
        style={{ position: "relative", width, height, ...style }}
        {...props}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            display: "block",
            width,
            height,
          }}
        />
        <UnifiedWaveformRenderer
          canvas={canvas}
          traces={traces}
          width={width}
          height={height}
          margin={margin}
          xDomain={xDomain}
          yDomain={yDomain}
          backgroundColor={backgroundColor}
          onReady={onReady}
          onError={onError}
        />
      </div>
    );
  }
);

WaveformMonitor.displayName = "WaveformMonitor";
