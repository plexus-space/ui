"use client";

/**
 * Chart Container - Layout & Interaction Foundation
 *
 * A layout-only container that provides shared context for chart components.
 * Does NOT manage canvas or WebGPU rendering - that's the responsibility of
 * the chart components themselves (WaveformMonitor, etc.)
 *
 * **Architecture:**
 * - ChartContainer = Layout layer (dimensions, margins, zoom, pan)
 * - Chart components = Rendering layer (canvas, WebGPU, data)
 * - This separation prevents dual-canvas conflicts
 *
 * **Responsibilities:**
 * - ✅ Auto-resize with ResizeObserver
 * - ✅ Zoom & Pan state management
 * - ✅ Margins & dimensions
 * - ✅ Play/Pause controls for animated charts
 *
 * @example
 * ```tsx
 * <ChartContainer
 *   width={800}
 *   height={400}
 *   margin={{ top: 40, right: 40, bottom: 60, left: 70 }}
 *   enableZoom
 *   showControls
 * >
 *   <WaveformMonitor traces={traces} />
 * </ChartContainer>
 * ```
 */

import * as React from "react";
import type { Margin } from "../lib/types";
import { cn } from "../lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface ChartContainerProps {
  /** Initial width in pixels (can be overridden by resize) */
  readonly width?: number;
  /** Initial height in pixels (can be overridden by resize) */
  readonly height?: number;
  /** Chart margins */
  readonly margin?: Margin;
  /** Enable auto-resize (default: true) */
  readonly autoResize?: boolean;
  /** Enable zoom (default: false) */
  readonly enableZoom?: boolean;
  /** Enable pan (default: false) */
  readonly enablePan?: boolean;
  /** Enable play/pause controls (default: false) */
  readonly showControls?: boolean;
  /** Is animation paused (default: false) */
  readonly isPaused?: boolean;
  /** Pause state change callback */
  readonly onPauseChange?: (paused: boolean) => void;
  /** Zoom change callback */
  readonly onZoomChange?: (zoom: number) => void;
  /** Pan change callback */
  readonly onPanChange?: (pan: { x: number; y: number }) => void;
  /** Child components */
  readonly children?: React.ReactNode;
  /** Additional class names */
  readonly className?: string;
  /** Additional styles */
  readonly style?: React.CSSProperties;
}

export interface ChartLayoutContext {
  /** Current container width */
  width: number;
  /** Current container height */
  height: number;
  /** Chart margins */
  margin: Margin;
  /** Current zoom level */
  zoom: number;
  /** Current pan offset */
  pan: { x: number; y: number };
  /** Is animation paused */
  isPaused: boolean;
  /** Container ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Set zoom level */
  setZoom: (zoom: number) => void;
  /** Set pan offset */
  setPan: (pan: { x: number; y: number }) => void;
  /** Set paused state */
  setPaused: (paused: boolean) => void;
  /** Auto-resize enabled */
  autoResize: boolean;
  /** Zoom enabled */
  enableZoom: boolean;
  /** Pan enabled */
  enablePan: boolean;
  /** Show controls */
  showControls: boolean;
}

// ============================================================================
// Context
// ============================================================================

const ChartLayoutContext = React.createContext<ChartLayoutContext | null>(null);

export function useChartLayout() {
  const ctx = React.useContext(ChartLayoutContext);
  if (!ctx) {
    throw new Error("useChartLayout must be used within ChartContainer");
  }
  return ctx;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MARGIN: Margin = { top: 40, right: 40, bottom: 60, left: 70 };

// ============================================================================
// Root Container Component
// ============================================================================

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(
  (
    {
      width: initialWidth = 800,
      height: initialHeight = 400,
      margin = DEFAULT_MARGIN,
      autoResize = true,
      enableZoom = false,
      enablePan = false,
      showControls = false,
      isPaused: controlledPaused,
      onPauseChange,
      onZoomChange,
      onPanChange,
      className,
      style,
      children,
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    // State
    const [width, setWidth] = React.useState(initialWidth);
    const [height, setHeight] = React.useState(initialHeight);
    const [zoom, setZoom] = React.useState(1);
    const [pan, setPan] = React.useState({ x: 0, y: 0 });
    const [internalPaused, setInternalPaused] = React.useState(false);

    // Use controlled or internal paused state
    const isPaused = controlledPaused ?? internalPaused;
    const handleSetPaused = React.useCallback(
      (paused: boolean) => {
        if (controlledPaused === undefined) {
          setInternalPaused(paused);
        }
        onPauseChange?.(paused);
      },
      [controlledPaused, onPauseChange]
    );

    // Auto-resize with ResizeObserver
    React.useEffect(() => {
      if (!autoResize || !containerRef.current) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setWidth(Math.floor(width));
          setHeight(Math.floor(height));
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }, [autoResize]);

    // Zoom handler
    const handleZoom = React.useCallback(
      (newZoom: number) => {
        setZoom(newZoom);
        onZoomChange?.(newZoom);
      },
      [onZoomChange]
    );

    // Pan handler
    const handlePan = React.useCallback(
      (newPan: { x: number; y: number }) => {
        setPan(newPan);
        onPanChange?.(newPan);
      },
      [onPanChange]
    );

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Context value
    const contextValue: ChartLayoutContext = React.useMemo(
      () => ({
        width,
        height,
        margin,
        zoom,
        pan,
        isPaused,
        containerRef,
        setZoom: handleZoom,
        setPan: handlePan,
        setPaused: handleSetPaused,
        autoResize,
        enableZoom,
        enablePan,
        showControls,
      }),
      [
        width,
        height,
        margin,
        zoom,
        pan,
        isPaused,
        handleZoom,
        handlePan,
        handleSetPaused,
        autoResize,
        enableZoom,
        enablePan,
        showControls,
      ]
    );

    return (
      <ChartLayoutContext.Provider value={contextValue}>
        <div
          ref={combinedRef}
          className={cn("chart-container", className)}
          style={{
            position: "relative",
            width: autoResize ? "100%" : width,
            height: autoResize ? "100%" : height,
            ...style,
          }}
        >
          {children}
        </div>
      </ChartLayoutContext.Provider>
    );
  }
);

ChartContainer.displayName = "ChartContainer";

// ============================================================================
// Controls Component
// ============================================================================

export interface ChartControlsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Position of controls (default: "top-right") */
  readonly position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const ChartControls = React.forwardRef<HTMLDivElement, ChartControlsProps>(
  ({ position = "top-right", className, style, children, ...props }, ref) => {
    const { isPaused, setPaused, showControls } = useChartLayout();

    if (!showControls) return null;

    const positionStyles: Record<string, React.CSSProperties> = {
      "top-left": { top: 8, left: 8 },
      "top-right": { top: 8, right: 8 },
      "bottom-left": { bottom: 8, left: 8 },
      "bottom-right": { bottom: 8, right: 8 },
    };

    return (
      <div
        ref={ref}
        className={cn("chart-controls", className)}
        style={{
          position: "absolute",
          ...positionStyles[position],
          display: "flex",
          gap: 8,
          padding: 8,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: 6,
          pointerEvents: "auto",
          zIndex: 10,
          ...style,
        }}
        {...props}
      >
        <button
          onClick={() => setPaused(!isPaused)}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 4,
            padding: "4px 12px",
            color: "#fff",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {isPaused ? "▶ Play" : "⏸ Pause"}
        </button>
        {children}
      </div>
    );
  }
);

ChartControls.displayName = "ChartContainer.Controls";

// ============================================================================
// Overlay Component
// ============================================================================

export interface ChartOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ChartOverlay = React.forwardRef<HTMLDivElement, ChartOverlayProps>(
  ({ className, style, children, ...props }, ref) => {
    const { width, height } = useChartLayout();

    return (
      <div
        ref={ref}
        className={cn("chart-overlay", className)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          pointerEvents: "none",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ChartOverlay.displayName = "ChartContainer.Overlay";

// ============================================================================
// Attach Sub-components
// ============================================================================

export default Object.assign(ChartContainer, {
  Controls: ChartControls,
  Overlay: ChartOverlay,
});
