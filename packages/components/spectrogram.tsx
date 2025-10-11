"use client";

import * as React from "react";
import { cn, createScale, formatValue, formatTime, getTicks } from "./lib";

// ============================================================================
// Types
// ============================================================================

/**
 * Spectrogram data point representing frequency magnitude at a specific time
 */
export interface SpectrogramDataPoint {
  /** Time value */
  time: number;
  /** Frequency value */
  frequency: number;
  /** Magnitude/amplitude value */
  magnitude: number;
}

/**
 * Time series data to be transformed into a spectrogram
 */
export interface SpectrogramTimeSeries {
  /** Time series data points */
  data: { time: number; value: number }[];
  /** FFT window size (power of 2) */
  windowSize?: number;
  /** Overlap percentage between windows (0-1) */
  overlap?: number;
}

/**
 * Axis configuration for spectrogram
 */
export interface SpectrogramAxis {
  /**
   * Axis label text
   * @example "Time (s)", "Frequency (Hz)"
   */
  label?: string;
  /**
   * Domain range for axis values
   * @default "auto" (calculated from data)
   * @example [0, 100], [0, 5000]
   */
  domain?: [number, number] | "auto";
  /**
   * Data type for axis values
   * @default "number"
   */
  type?: "number" | "time";
  /**
   * Timezone for time axis formatting
   * @default "UTC"
   */
  timezone?: string;
  /**
   * Custom formatter function for axis tick labels
   * @example (value) => `${value.toFixed(1)} kHz`
   */
  formatter?: (value: number) => string;
}

/**
 * Color scale configuration for magnitude visualization
 */
export type SpectrogramColorScale =
  | "viridis"
  | "plasma"
  | "inferno"
  | "magma"
  | "jet"
  | "hot"
  | "cool"
  | "turbo";

/**
 * Visual variant styles for the spectrogram
 */
export type SpectrogramVariant =
  | "default" // Balanced styling for general use
  | "minimal" // Minimal styling with reduced visual weight
  | "scientific" // Dense styling for data analysis
  | "dashboard"; // Polished styling for dashboards

/**
 * Props for Spectrogram.Root component
 */
export interface SpectrogramRootProps {
  /**
   * Spectrogram data points OR time series for automatic FFT
   * @required
   */
  data: SpectrogramDataPoint[] | SpectrogramTimeSeries;
  /**
   * Time axis configuration
   * @default { type: "number", domain: "auto" }
   */
  timeAxis?: SpectrogramAxis;
  /**
   * Frequency axis configuration
   * @default { type: "number", domain: "auto" }
   */
  frequencyAxis?: SpectrogramAxis;
  /**
   * Chart width in pixels
   * @default 800
   */
  width?: number;
  /**
   * Chart height in pixels
   * @default 400
   */
  height?: number;
  /**
   * Color scale for magnitude visualization
   * @default "viridis"
   */
  colorScale?: SpectrogramColorScale;
  /**
   * Visual variant style preset
   * @default "default"
   */
  variant?: SpectrogramVariant;
  /**
   * Enable entrance animations
   * @default false
   */
  animate?: boolean;
  /**
   * Show color bar legend
   * @default true
   */
  showColorBar?: boolean;
  /**
   * Magnitude scale type
   * @default "linear"
   */
  magnitudeScale?: "linear" | "log" | "decibel";
  /**
   * Number of frequency bins
   * @default 128
   */
  frequencyBins?: number;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * Child components
   */
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface SpectrogramContext {
  data: SpectrogramDataPoint[];
  timeAxis: SpectrogramAxis;
  frequencyAxis: SpectrogramAxis;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  timeScale: (t: number) => number;
  frequencyScale: (f: number) => number;
  timeDomain: [number, number];
  frequencyDomain: [number, number];
  magnitudeDomain: [number, number];
  timeTicks: number[];
  frequencyTicks: number[];
  colorScale: SpectrogramColorScale;
  magnitudeScale: "linear" | "log" | "decibel";
  variant: SpectrogramVariant;
  animate: boolean;
  showColorBar: boolean;
  hoveredCell: { time: number; frequency: number } | null;
  setHoveredCell: (cell: { time: number; frequency: number } | null) => void;
}

const SpectrogramContext = React.createContext<SpectrogramContext | null>(null);

function useSpectrogram() {
  const ctx = React.useContext(SpectrogramContext);
  if (!ctx)
    throw new Error("useSpectrogram must be used within Spectrogram.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Color scale functions
 */
const colorScales: Record<SpectrogramColorScale, (t: number) => string> = {
  viridis: (t) => {
    const r = Math.floor(68 + t * (253 - 68));
    const g = Math.floor(1 + t * (231 - 1));
    const b = Math.floor(84 + t * (37 - 84));
    return `rgb(${r}, ${g}, ${b})`;
  },
  plasma: (t) => {
    const r = Math.floor(13 + t * (240 - 13));
    const g = Math.floor(8 + t * (249 - 8));
    const b = Math.floor(135 - t * 135);
    return `rgb(${r}, ${g}, ${b})`;
  },
  inferno: (t) => {
    const r = Math.floor(0 + t * 252);
    const g = Math.floor(0 + t * 255);
    const b = Math.floor(4 + t * (164 - 4));
    return `rgb(${r}, ${g}, ${b})`;
  },
  magma: (t) => {
    const r = Math.floor(0 + t * 252);
    const g = Math.floor(0 + t * 253);
    const b = Math.floor(4 + t * (191 - 4));
    return `rgb(${r}, ${g}, ${b})`;
  },
  jet: (t) => {
    const r = Math.floor(
      Math.max(0, Math.min(255, 255 * (1.5 - Math.abs(4 * t - 3))))
    );
    const g = Math.floor(
      Math.max(0, Math.min(255, 255 * (1.5 - Math.abs(4 * t - 2))))
    );
    const b = Math.floor(
      Math.max(0, Math.min(255, 255 * (1.5 - Math.abs(4 * t - 1))))
    );
    return `rgb(${r}, ${g}, ${b})`;
  },
  hot: (t) => {
    const r = Math.floor(Math.min(255, t * 3 * 255));
    const g = Math.floor(Math.max(0, Math.min(255, (t * 3 - 1) * 255)));
    const b = Math.floor(Math.max(0, (t * 3 - 2) * 255));
    return `rgb(${r}, ${g}, ${b})`;
  },
  cool: (t) => {
    const r = Math.floor(t * 255);
    const g = Math.floor((1 - t) * 255);
    const b = 255;
    return `rgb(${r}, ${g}, ${b})`;
  },
  turbo: (t) => {
    const r = Math.floor(34 + t * (251 - 34));
    const g = Math.floor(15 + t * (232 - 15));
    const b = Math.floor(143 - t * 110);
    return `rgb(${r}, ${g}, ${b})`;
  },
};

/**
 * Process time series data into spectrogram format using FFT
 */
function processTimeSeries(
  timeSeries: SpectrogramTimeSeries,
  frequencyBins: number
): SpectrogramDataPoint[] {
  const { data, windowSize = 256, overlap = 0.5 } = timeSeries;
  const step = Math.floor(windowSize * (1 - overlap));
  const points: SpectrogramDataPoint[] = [];

  // Simple DFT implementation (for demonstration - use FFT library in production)
  for (let i = 0; i + windowSize <= data.length; i += step) {
    const window = data.slice(i, i + windowSize);
    const centerTime = (window[0].time + window[window.length - 1].time) / 2;

    // Apply Hamming window
    const hammingWindow = window.map((d, j) => {
      const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * j) / (windowSize - 1));
      return { ...d, value: d.value * w };
    });

    // Compute magnitude spectrum for each frequency bin
    for (let k = 0; k < frequencyBins; k++) {
      const frequency = (k * (data.length / 2)) / frequencyBins;
      let real = 0;
      let imag = 0;

      for (let n = 0; n < hammingWindow.length; n++) {
        const angle = (2 * Math.PI * k * n) / hammingWindow.length;
        real += hammingWindow[n].value * Math.cos(angle);
        imag -= hammingWindow[n].value * Math.sin(angle);
      }

      const magnitude =
        Math.sqrt(real * real + imag * imag) / hammingWindow.length;
      points.push({ time: centerTime, frequency, magnitude });
    }
  }

  return points;
}

/**
 * Apply magnitude scaling
 */
function scaleMagnitude(
  magnitude: number,
  scale: "linear" | "log" | "decibel"
): number {
  switch (scale) {
    case "log":
      return Math.log10(Math.max(magnitude, 1e-10));
    case "decibel":
      return 20 * Math.log10(Math.max(magnitude, 1e-10));
    case "linear":
    default:
      return magnitude;
  }
}

// ============================================================================
// Root Component
// ============================================================================

const SpectrogramRoot = React.forwardRef<HTMLDivElement, SpectrogramRootProps>(
  (
    {
      data: inputData,
      timeAxis = {},
      frequencyAxis = {},
      width = 800,
      height = 400,
      colorScale = "viridis",
      variant = "default",
      animate = false,
      showColorBar = true,
      magnitudeScale = "linear",
      frequencyBins = 128,
      className,
      children,
    },
    ref
  ) => {
    const [hoveredCell, setHoveredCell] = React.useState<{
      time: number;
      frequency: number;
    } | null>(null);

    // Process data
    const data = React.useMemo(() => {
      if (Array.isArray(inputData)) {
        return inputData;
      } else {
        return processTimeSeries(inputData, frequencyBins);
      }
    }, [inputData, frequencyBins]);

    // Margins
    const margin = React.useMemo(
      () => ({
        top: 30,
        right: showColorBar ? 80 : 30,
        bottom: 60,
        left: 70,
      }),
      [showColorBar]
    );

    // Calculate domains
    const times = [...new Set(data.map((d) => d.time))].sort((a, b) => a - b);
    const frequencies = [...new Set(data.map((d) => d.frequency))].sort(
      (a, b) => a - b
    );
    const magnitudes = data.map((d) =>
      scaleMagnitude(d.magnitude, magnitudeScale)
    );

    const timeDomain: [number, number] =
      timeAxis.domain === "auto" || !timeAxis.domain
        ? [Math.min(...times), Math.max(...times)]
        : timeAxis.domain;

    const frequencyDomain: [number, number] =
      frequencyAxis.domain === "auto" || !frequencyAxis.domain
        ? [Math.max(...frequencies), Math.min(...frequencies)]
        : [frequencyAxis.domain[1], frequencyAxis.domain[0]];

    const magnitudeDomain: [number, number] = [
      Math.min(...magnitudes),
      Math.max(...magnitudes),
    ];

    // Create scales
    const timeScale = React.useMemo(
      () => createScale(timeDomain, [margin.left, width - margin.right]),
      [timeDomain, margin.left, margin.right, width]
    );

    const frequencyScale = React.useMemo(
      () => createScale(frequencyDomain, [height - margin.bottom, margin.top]),
      [frequencyDomain, height, margin.bottom, margin.top]
    );

    // Generate ticks
    const timeTicks = React.useMemo(
      () => getTicks(timeDomain, 8),
      [timeDomain]
    );
    const frequencyTicks = React.useMemo(
      () => getTicks(frequencyDomain, 8),
      [frequencyDomain]
    );

    const contextValue: SpectrogramContext = React.useMemo(
      () => ({
        data,
        timeAxis,
        frequencyAxis,
        width,
        height,
        margin,
        timeScale,
        frequencyScale,
        timeDomain,
        frequencyDomain,
        magnitudeDomain,
        timeTicks,
        frequencyTicks,
        colorScale,
        magnitudeScale,
        variant,
        animate,
        showColorBar,
        hoveredCell,
        setHoveredCell,
      }),
      [
        data,
        timeAxis,
        frequencyAxis,
        width,
        height,
        margin,
        timeScale,
        frequencyScale,
        timeDomain,
        frequencyDomain,
        magnitudeDomain,
        timeTicks,
        frequencyTicks,
        colorScale,
        magnitudeScale,
        variant,
        animate,
        showColorBar,
        hoveredCell,
      ]
    );

    return (
      <SpectrogramContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("spectrogram", className)}
          style={{
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {children}
        </div>
      </SpectrogramContext.Provider>
    );
  }
);

SpectrogramRoot.displayName = "Spectrogram.Root";

// ============================================================================
// Container Component
// ============================================================================

export interface SpectrogramContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SpectrogramContainer = React.forwardRef<
  HTMLDivElement,
  SpectrogramContainerProps
>(({ className, style, children, ...props }, ref) => {
  const { height } = useSpectrogram();

  return (
    <div
      ref={ref}
      className={cn("spectrogram-container", className)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        height: `${height}px`,
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        overflow: "visible",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

SpectrogramContainer.displayName = "Spectrogram.Container";

// ============================================================================
// Viewport Component
// ============================================================================

export interface SpectrogramViewportProps
  extends React.SVGProps<SVGSVGElement> {}

const SpectrogramViewport = React.forwardRef<
  SVGSVGElement,
  SpectrogramViewportProps
>(({ className, children, ...props }, ref) => {
  const { width, height } = useSpectrogram();

  return (
    <svg
      ref={ref}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("spectrogram-svg", className)}
      style={{ display: "block", userSelect: "none", maxWidth: "100%" }}
      role="img"
      aria-label="Spectrogram"
      {...props}
    >
      {children}
    </svg>
  );
});

SpectrogramViewport.displayName = "Spectrogram.Viewport";

// ============================================================================
// Axes Component
// ============================================================================

export interface SpectrogramAxesProps extends React.SVGProps<SVGGElement> {}

const SpectrogramAxes = React.forwardRef<SVGGElement, SpectrogramAxesProps>(
  ({ className, ...props }, ref) => {
    const {
      timeTicks,
      frequencyTicks,
      timeScale,
      frequencyScale,
      margin,
      width,
      height,
      timeAxis,
      frequencyAxis,
    } = useSpectrogram();

    const formatTick = (value: number, axis: SpectrogramAxis): string => {
      if (axis.formatter) return axis.formatter(value);
      if (axis.type === "time") {
        const timezone = axis.timezone || "UTC";
        return formatTime(value, timezone);
      }
      return formatValue(value);
    };

    return (
      <g ref={ref} className={cn("spectrogram-axes", className)} {...props}>
        {/* Time axis (X) */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.2}
        />
        {timeTicks.map((tick, i) => (
          <g key={`xtick-${i}`}>
            <line
              x1={timeScale(tick)}
              y1={height - margin.bottom}
              x2={timeScale(tick)}
              y2={height - margin.bottom + 6}
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.2}
            />
            <text
              x={timeScale(tick)}
              y={height - margin.bottom + 20}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
              opacity={0.6}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatTick(tick, timeAxis)}
            </text>
          </g>
        ))}
        {timeAxis.label && (
          <text
            x={(margin.left + width - margin.right) / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
            opacity={0.7}
          >
            {timeAxis.label}
          </text>
        )}

        {/* Frequency axis (Y) */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.2}
        />
        {frequencyTicks.map((tick, i) => (
          <g key={`ytick-${i}`}>
            <line
              x1={margin.left - 6}
              y1={frequencyScale(tick)}
              x2={margin.left}
              y2={frequencyScale(tick)}
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.2}
            />
            <text
              x={margin.left - 10}
              y={frequencyScale(tick) + 4}
              textAnchor="end"
              fontSize={10}
              fill="currentColor"
              opacity={0.6}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatTick(tick, frequencyAxis)}
            </text>
          </g>
        ))}
        {frequencyAxis.label && (
          <text
            x={margin.left - 50}
            y={(margin.top + height - margin.bottom) / 2}
            textAnchor="middle"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
            opacity={0.7}
            transform={`rotate(-90 ${margin.left - 50} ${
              (margin.top + height - margin.bottom) / 2
            })`}
          >
            {frequencyAxis.label}
          </text>
        )}
      </g>
    );
  }
);

SpectrogramAxes.displayName = "Spectrogram.Axes";

// ============================================================================
// Heatmap Component
// ============================================================================

export interface SpectrogramHeatmapProps extends React.SVGProps<SVGGElement> {}

const SpectrogramHeatmap = React.forwardRef<
  SVGGElement,
  SpectrogramHeatmapProps
>(({ className, ...props }, ref) => {
  const {
    data,
    timeScale,
    frequencyScale,
    magnitudeDomain,
    colorScale: colorScaleName,
    magnitudeScale: scaleType,
    animate,
    setHoveredCell,
    hoveredCell,
    margin,
    width,
    height,
  } = useSpectrogram();

  // Group data by time and frequency for efficient rendering
  const heatmapData = React.useMemo(() => {
    const times = [...new Set(data.map((d) => d.time))].sort((a, b) => a - b);
    const frequencies = [...new Set(data.map((d) => d.frequency))].sort(
      (a, b) => a - b
    );

    const cellWidth = (width - margin.left - margin.right) / times.length;
    const cellHeight =
      (height - margin.top - margin.bottom) / frequencies.length;

    return data.map((d) => {
      const scaledMag = scaleMagnitude(d.magnitude, scaleType);
      const normalized =
        (scaledMag - magnitudeDomain[0]) /
        (magnitudeDomain[1] - magnitudeDomain[0]);
      const color = colorScales[colorScaleName](
        Math.max(0, Math.min(1, normalized))
      );

      return {
        ...d,
        x: timeScale(d.time) - cellWidth / 2,
        y: frequencyScale(d.frequency) - cellHeight / 2,
        width: cellWidth,
        height: cellHeight,
        color,
        normalized,
      };
    });
  }, [
    data,
    timeScale,
    frequencyScale,
    magnitudeDomain,
    colorScaleName,
    scaleType,
    margin,
    width,
    height,
  ]);

  return (
    <g ref={ref} className={cn("spectrogram-heatmap", className)} {...props}>
      {heatmapData.map((cell, i) => {
        const isHovered =
          hoveredCell?.time === cell.time &&
          hoveredCell?.frequency === cell.frequency;

        return (
          <rect
            key={i}
            x={cell.x}
            y={cell.y}
            width={cell.width}
            height={cell.height}
            fill={cell.color}
            stroke={isHovered ? "white" : "none"}
            strokeWidth={isHovered ? 2 : 0}
            opacity={isHovered ? 1 : 0.95}
            onMouseEnter={() =>
              setHoveredCell({ time: cell.time, frequency: cell.frequency })
            }
            onMouseLeave={() => setHoveredCell(null)}
            style={{
              cursor: "crosshair",
              transition: "all 0.15s ease",
              ...(animate
                ? {
                    animation: `fadeIn 0.5s ease ${i * 0.001}s forwards`,
                    opacity: 0,
                  }
                : undefined),
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes fadeIn {
          to {
            opacity: 0.95;
          }
        }
      `}</style>
    </g>
  );
});

SpectrogramHeatmap.displayName = "Spectrogram.Heatmap";

// ============================================================================
// ColorBar Component
// ============================================================================

export interface SpectrogramColorBarProps extends React.SVGProps<SVGGElement> {}

const SpectrogramColorBar = React.forwardRef<
  SVGGElement,
  SpectrogramColorBarProps
>(({ className, ...props }, ref) => {
  const {
    width,
    margin,
    height,
    magnitudeDomain,
    colorScale: colorScaleName,
    magnitudeScale,
    showColorBar,
  } = useSpectrogram();

  if (!showColorBar) return null;

  const barWidth = 20;
  const barHeight = height - margin.top - margin.bottom;
  const barX = width - margin.right + 15;
  const barY = margin.top;
  const steps = 100;

  return (
    <g ref={ref} className={cn("spectrogram-colorbar", className)} {...props}>
      {/* Color gradient */}
      <defs>
        <linearGradient
          id="colorbar-gradient"
          x1="0%"
          y1="100%"
          x2="0%"
          y2="0%"
        >
          {Array.from({ length: steps }, (_, i) => {
            const t = i / (steps - 1);
            const color = colorScales[colorScaleName](t);
            return <stop key={i} offset={`${t * 100}%`} stopColor={color} />;
          })}
        </linearGradient>
      </defs>

      {/* Bar */}
      <rect
        x={barX}
        y={barY}
        width={barWidth}
        height={barHeight}
        fill="url(#colorbar-gradient)"
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.2}
        rx={2}
      />

      {/* Labels */}
      {[
        magnitudeDomain[1],
        (magnitudeDomain[0] + magnitudeDomain[1]) / 2,
        magnitudeDomain[0],
      ].map((value, i) => {
        const y = barY + (i * barHeight) / 2;
        const label =
          magnitudeScale === "decibel"
            ? `${value.toFixed(0)} dB`
            : value.toFixed(2);

        return (
          <text
            key={i}
            x={barX + barWidth + 8}
            y={y + 4}
            fontSize={9}
            fill="currentColor"
            opacity={0.6}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {label}
          </text>
        );
      })}

      {/* Title */}
      <text
        x={barX + barWidth / 2}
        y={barY - 10}
        textAnchor="middle"
        fontSize={10}
        fontWeight={500}
        fill="currentColor"
        opacity={0.7}
      >
        Magnitude
      </text>
    </g>
  );
});

SpectrogramColorBar.displayName = "Spectrogram.ColorBar";

// ============================================================================
// Tooltip Component
// ============================================================================

export interface SpectrogramTooltipProps extends React.SVGProps<SVGGElement> {}

const SpectrogramTooltip = React.forwardRef<
  SVGGElement,
  SpectrogramTooltipProps
>(({ className, ...props }, ref) => {
  const {
    hoveredCell,
    data,
    timeScale,
    frequencyScale,
    timeAxis,
    frequencyAxis,
    magnitudeScale: scaleType,
    width,
    height,
    margin,
  } = useSpectrogram();

  if (!hoveredCell) return null;

  const cellData = data.find(
    (d) => d.time === hoveredCell.time && d.frequency === hoveredCell.frequency
  );

  if (!cellData) return null;

  const px = timeScale(cellData.time);
  const py = frequencyScale(cellData.frequency);

  const timeLabel =
    timeAxis.type === "time"
      ? new Date(cellData.time).toLocaleString()
      : timeAxis.formatter?.(cellData.time) ?? formatValue(cellData.time);
  const freqLabel =
    frequencyAxis.formatter?.(cellData.frequency) ??
    formatValue(cellData.frequency);
  const magValue = scaleMagnitude(cellData.magnitude, scaleType);
  const magLabel =
    scaleType === "decibel" ? `${magValue.toFixed(1)} dB` : magValue.toFixed(4);

  // Smart positioning
  const tooltipWidth = 180;
  const tooltipHeight = 80;
  const offsetX = px > width / 2 ? -tooltipWidth - 10 : 10;
  const offsetY = py > height / 2 ? -tooltipHeight - 10 : 10;

  return (
    <g
      ref={ref}
      className={cn("spectrogram-tooltip", className)}
      style={{ pointerEvents: "none" }}
      {...props}
    >
      {/* Crosshair */}
      <line
        x1={px}
        y1={margin.top}
        x2={px}
        y2={height - margin.bottom}
        stroke="white"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.5}
      />
      <line
        x1={margin.left}
        y1={py}
        x2={width - margin.right}
        y2={py}
        stroke="white"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.5}
      />

      {/* Tooltip box */}
      <rect
        x={px + offsetX}
        y={py + offsetY}
        width={tooltipWidth}
        height={tooltipHeight}
        rx={6}
        fill="currentColor"
        opacity={0.95}
      />

      {[`Time: ${timeLabel}`, `Freq: ${freqLabel}`, `Mag: ${magLabel}`].map(
        (text, i) => (
          <text
            key={i}
            x={px + offsetX + 10}
            y={py + offsetY + 40 + i * 14}
            fontSize={10}
            fill="white"
            opacity={0.8}
            style={{ mixBlendMode: "difference" }}
          >
            {text}
          </text>
        )
      )}
    </g>
  );
});

SpectrogramTooltip.displayName = "Spectrogram.Tooltip";

// ============================================================================
// Empty Component
// ============================================================================

export interface SpectrogramEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SpectrogramEmpty = React.forwardRef<
  HTMLDivElement,
  SpectrogramEmptyProps
>(({ className, style, children, ...props }, ref) => {
  const { width, height } = useSpectrogram();

  return (
    <div
      ref={ref}
      className={cn("spectrogram-empty", className)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
        borderRadius: "8px",
        border: "1px solid currentColor",
        opacity: 0.1,
        ...style,
      }}
      {...props}
    >
      {children || (
        <>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            opacity="0.3"
          >
            <rect x="3" y="3" width="18" height="18" strokeWidth="2" />
            <line x1="3" y1="9" x2="21" y2="9" strokeWidth="2" />
            <line x1="3" y1="15" x2="21" y2="15" strokeWidth="2" />
          </svg>
          <div style={{ fontSize: "14px", opacity: 0.5 }}>
            No data available
          </div>
        </>
      )}
    </div>
  );
});

SpectrogramEmpty.displayName = "Spectrogram.Empty";

// ============================================================================
// Exports
// ============================================================================

export const Spectrogram = Object.assign(SpectrogramRoot, {
  Root: SpectrogramRoot,
  Container: SpectrogramContainer,
  Viewport: SpectrogramViewport,
  Axes: SpectrogramAxes,
  Heatmap: SpectrogramHeatmap,
  ColorBar: SpectrogramColorBar,
  Tooltip: SpectrogramTooltip,
  Empty: SpectrogramEmpty,
});
