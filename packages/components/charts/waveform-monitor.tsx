"use client";

/**
 * Waveform Monitor - Composable WebGPU Chart
 *
 * A high-performance, composable waveform rendering component.
 * Follows the primitive-first pattern with both simple and composable APIs.
 *
 * @example Simple API
 * ```tsx
 * <WaveformMonitor
 *   width={800}
 *   height={400}
 *   traces={[
 *     { id: "ecg", data: [[0, 0.5], [1, 0.8]], color: [0.2, 0.8, 0.3] }
 *   ]}
 * />
 * ```
 *
 * @example Composable API
 * ```tsx
 * <WaveformMonitor.Root width={800} height={400} traces={traces}>
 *   <WaveformMonitor.Container>
 *     <WaveformMonitor.Canvas />
 *     <WaveformMonitor.Traces />
 *     <WaveformMonitor.Overlay>
 *       <CustomMarkers />
 *     </WaveformMonitor.Overlay>
 *   </WaveformMonitor.Container>
 * </WaveformMonitor.Root>
 * ```
 */

import * as React from "react";
import { UnifiedWaveformRenderer } from "../primitives/unified-waveform-renderer";
import { DEFAULT_MARGIN, DEFAULT_BACKGROUND_COLOR, cn } from "../lib/utils";
import type {
  RGB,
  RGBA,
  Domain2D,
  Margin,
  OnReadyCallback,
  OnErrorCallback,
  DataPoint2D,
} from "../lib/types";

// ============================================================================
// Types
// ============================================================================

export interface WaveformTrace {
  readonly id: string;
  readonly data: ReadonlyArray<DataPoint2D>;
  readonly color?: RGB;
  readonly label?: string;
}

export interface WaveformMonitorRootProps {
  /** Width in pixels */
  readonly width: number;
  /** Height in pixels */
  readonly height: number;
  /** Traces to render */
  readonly traces: ReadonlyArray<WaveformTrace>;
  /** X domain [min, max] - auto-calculated if omitted */
  readonly xDomain?: Domain2D;
  /** Y domain [min, max] - auto-calculated if omitted */
  readonly yDomain?: Domain2D;
  /** Plot margins */
  readonly margin?: Margin;
  /** Background color [r, g, b, a] */
  readonly backgroundColor?: RGBA;
  /** Callback when ready */
  readonly onReady?: OnReadyCallback;
  /** Error callback */
  readonly onError?: OnErrorCallback;
  /** Child components */
  readonly children?: React.ReactNode;
}

export interface WaveformMonitorContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Child components */
  children?: React.ReactNode;
}

export interface WaveformMonitorCanvasProps
  extends React.CanvasHTMLAttributes<HTMLCanvasElement> {}

export interface WaveformMonitorTracesProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface WaveformMonitorOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Child components to overlay on top of canvas */
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface WaveformMonitorContext {
  width: number;
  height: number;
  traces: ReadonlyArray<WaveformTrace>;
  xDomain?: Domain2D;
  yDomain?: Domain2D;
  margin: Margin;
  backgroundColor: RGBA;
  onReady?: OnReadyCallback;
  onError?: OnErrorCallback;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvas: HTMLCanvasElement | null;
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
}

const WaveformMonitorContext =
  React.createContext<WaveformMonitorContext | null>(null);

function useWaveformMonitor() {
  const ctx = React.useContext(WaveformMonitorContext);
  if (!ctx) {
    throw new Error(
      "useWaveformMonitor must be used within WaveformMonitor.Root"
    );
  }
  return ctx;
}

// ============================================================================
// Primitive Components
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const WaveformMonitorRoot = React.forwardRef<
  HTMLDivElement,
  WaveformMonitorRootProps
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
      children,
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);
    const rootRef = React.useRef<HTMLDivElement>(null);

    const contextValue: WaveformMonitorContext = React.useMemo(
      () => ({
        width,
        height,
        traces,
        xDomain,
        yDomain,
        margin,
        backgroundColor,
        onReady,
        onError,
        canvasRef,
        canvas,
        setCanvas,
      }),
      [
        width,
        height,
        traces,
        xDomain,
        yDomain,
        margin,
        backgroundColor,
        onReady,
        onError,
        canvas,
      ]
    );

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <WaveformMonitorContext.Provider value={contextValue}>
        <div ref={combinedRef}>{children}</div>
      </WaveformMonitorContext.Provider>
    );
  }
);

WaveformMonitorRoot.displayName = "WaveformMonitor.Root";

/**
 * Container component - wraps canvas and overlays with proper styling
 */
const WaveformMonitorContainer = React.forwardRef<
  HTMLDivElement,
  WaveformMonitorContainerProps
>(({ className, style, children, ...props }, ref) => {
  const { width, height } = useWaveformMonitor();

  return (
    <div
      ref={ref}
      className={cn("waveform-monitor-container", className)}
      style={{
        position: "relative",
        width,
        height,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

WaveformMonitorContainer.displayName = "WaveformMonitor.Container";

/**
 * Canvas component - the rendering surface for traces
 */
const WaveformMonitorCanvas = React.forwardRef<
  HTMLCanvasElement,
  WaveformMonitorCanvasProps
>(({ className, style, ...props }, ref) => {
  const { width, height, canvasRef, setCanvas } = useWaveformMonitor();

  // Combine refs
  const combinedRef = React.useCallback(
    (node: HTMLCanvasElement | null) => {
      canvasRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      if (node && !canvasRef.current) {
        setCanvas(node);
      }
    },
    [ref, canvasRef, setCanvas]
  );

  // Update canvas when ref changes
  React.useEffect(() => {
    if (canvasRef.current && !setCanvas) {
      setCanvas(canvasRef.current);
    }
  }, [canvasRef, setCanvas]);

  return (
    <canvas
      ref={combinedRef}
      width={width}
      height={height}
      className={cn("waveform-monitor-canvas", className)}
      style={{
        display: "block",
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
});

WaveformMonitorCanvas.displayName = "WaveformMonitor.Canvas";

/**
 * Traces component - renders the waveform traces using WebGPU
 */
const WaveformMonitorTraces = React.forwardRef<
  HTMLDivElement,
  WaveformMonitorTracesProps
>(({ className, ...props }, ref) => {
  const {
    canvas,
    traces,
    width,
    height,
    margin,
    xDomain,
    yDomain,
    backgroundColor,
    onReady,
    onError,
  } = useWaveformMonitor();

  return (
    <div
      ref={ref}
      className={cn("waveform-monitor-traces", className)}
      {...props}
    >
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
});

WaveformMonitorTraces.displayName = "WaveformMonitor.Traces";

/**
 * Overlay component - for adding custom UI elements on top of the canvas
 * Useful for markers, annotations, legends, etc.
 */
const WaveformMonitorOverlay = React.forwardRef<
  HTMLDivElement,
  WaveformMonitorOverlayProps
>(({ className, style, children, ...props }, ref) => {
  const { width, height } = useWaveformMonitor();

  return (
    <div
      ref={ref}
      className={cn("waveform-monitor-overlay", className)}
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
});

WaveformMonitorOverlay.displayName = "WaveformMonitor.Overlay";

/**
 * Metrics component - performance overlay showing FPS, point count, and trace count
 * Useful for debugging and monitoring performance
 */
export interface WaveformMonitorMetricsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const WaveformMonitorMetrics = React.forwardRef<
  HTMLDivElement,
  WaveformMonitorMetricsProps
>(({ className, style, ...props }, ref) => {
  const { traces } = useWaveformMonitor();
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
      ref={ref}
      className={cn("waveform-monitor-metrics", className)}
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
        ...style,
      }}
      {...props}
    >
      <div>FPS: {fps}</div>
      <div>Points: {totalPoints.toLocaleString()}</div>
      <div>Traces: {traces.length}</div>
      <div>WebGPU</div>
    </div>
  );
});

WaveformMonitorMetrics.displayName = "WaveformMonitor.Metrics";

// ============================================================================
// All-in-One Component
// ============================================================================

export interface WaveformMonitorProps
  extends Omit<WaveformMonitorRootProps, "children">,
    Omit<React.HTMLAttributes<HTMLDivElement>, "onError"> {}

/**
 * All-in-one Waveform Monitor component with default composition
 * This is the simplest way to use the component - just pass traces!
 *
 * @example
 * ```tsx
 * <WaveformMonitor
 *   width={800}
 *   height={400}
 *   traces={[
 *     { id: "ecg", data: ecgData, color: [0.2, 0.8, 0.3], label: "ECG" },
 *     { id: "spo2", data: spo2Data, color: [0.3, 0.6, 0.9], label: "SpO2" }
 *   ]}
 *   className="border rounded-lg"
 * />
 * ```
 */
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
      margin,
      backgroundColor,
      onReady,
      onError,
      className,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <WaveformMonitorRoot
        width={width}
        height={height}
        traces={traces}
        xDomain={xDomain}
        yDomain={yDomain}
        margin={margin}
        backgroundColor={backgroundColor}
        onReady={onReady}
        onError={onError}
      >
        <WaveformMonitorContainer
          ref={ref}
          className={className}
          style={style}
          {...props}
        >
          <WaveformMonitorCanvas />
          <WaveformMonitorTraces />
        </WaveformMonitorContainer>
      </WaveformMonitorRoot>
    );
  }
) as React.ForwardRefExoticComponent<
  WaveformMonitorProps & React.RefAttributes<HTMLDivElement>
> & {
  Root: typeof WaveformMonitorRoot;
  Container: typeof WaveformMonitorContainer;
  Canvas: typeof WaveformMonitorCanvas;
  Traces: typeof WaveformMonitorTraces;
  Overlay: typeof WaveformMonitorOverlay;
  Metrics: typeof WaveformMonitorMetrics;
};

// Attach primitives for composition API
WaveformMonitor.Root = WaveformMonitorRoot;
WaveformMonitor.Container = WaveformMonitorContainer;
WaveformMonitor.Canvas = WaveformMonitorCanvas;
WaveformMonitor.Traces = WaveformMonitorTraces;
WaveformMonitor.Overlay = WaveformMonitorOverlay;
WaveformMonitor.Metrics = WaveformMonitorMetrics;

WaveformMonitor.displayName = "WaveformMonitor";
