"use client";

/**
 * WaveformMonitorMetrics - Optional Performance Overlay
 *
 * Composable addon for WaveformMonitor.
 * Shows FPS, point count, and trace count.
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <WaveformMonitor traces={traces} width={800} height={400} />
 *   <WaveformMonitorMetrics traces={traces} />
 * </div>
 * ```
 */

import * as React from "react";
import type { WaveformTrace } from "./waveform-monitor";

export interface WaveformMonitorMetricsProps {
  readonly traces: ReadonlyArray<WaveformTrace>;
  readonly className?: string;
}

export const WaveformMonitorMetrics: React.FC<
  WaveformMonitorMetricsProps
> = ({ traces, className }) => {
  const [fps, setFps] = React.useState(0);
  const frameCountRef = React.useRef(0);
  const lastUpdateRef = React.useRef(performance.now());

  // Calculate metrics
  const totalPoints = React.useMemo(
    () => traces.reduce((sum, trace) => sum + trace.data.length, 0),
    [traces]
  );

  // FPS counter
  React.useEffect(() => {
    let animationId: number;

    const updateFps = () => {
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastUpdateRef.current;

      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastUpdateRef.current = now;
      }

      animationId = requestAnimationFrame(updateFps);
    };

    animationId = requestAnimationFrame(updateFps);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        padding: "8px 12px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        fontFamily: "monospace",
        fontSize: 11,
        borderRadius: 4,
        pointerEvents: "none",
        lineHeight: 1.5,
      }}
    >
      <div>FPS: {fps}</div>
      <div>Points: {totalPoints.toLocaleString()}</div>
      <div>Traces: {traces.length}</div>
      <div>WebGPU</div>
    </div>
  );
};
