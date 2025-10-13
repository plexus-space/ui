"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { cn, createScale, formatValue, formatTime, getTicks } from "./lib";
import { useGPUFFT } from "./primitives";

// ============================================================================
// Types
// ============================================================================

/**
 * Spectrogram data point representing frequency magnitude at a specific time
 */
export interface SpectrogramDataPointGPU {
  /** Time value */
  time: number;
  /** Frequency value */
  frequency: number;
  /** Magnitude/amplitude value */
  magnitude: number;
}

/**
 * Time series data to be transformed into a spectrogram using GPU FFT
 */
export interface SpectrogramTimeSeriesGPU {
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
export interface SpectrogramAxisGPU {
  /** Axis label text */
  label?: string;
  /** Domain range for axis values */
  domain?: [number, number] | "auto";
  /** Data type for axis values */
  type?: "number" | "time";
  /** Timezone for time axis formatting */
  timezone?: string;
  /** Custom formatter function for axis tick labels */
  formatter?: (value: number) => string;
}

/**
 * Color scale configuration for magnitude visualization
 */
export type SpectrogramColorScaleGPU =
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
export type SpectrogramGPUVariant = "default" | "minimal" | "scientific" | "dashboard";

/**
 * Props for SpectrogramGPU.Root component
 */
export interface SpectrogramGPURootProps {
  /**
   * Spectrogram data points OR time series for automatic GPU FFT
   * @required
   */
  data: SpectrogramDataPointGPU[] | SpectrogramTimeSeriesGPU;
  /**
   * Time axis configuration
   */
  timeAxis?: SpectrogramAxisGPU;
  /**
   * Frequency axis configuration
   */
  frequencyAxis?: SpectrogramAxisGPU;
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
  colorScale?: SpectrogramColorScaleGPU;
  /**
   * Visual variant style preset
   * @default "default"
   */
  variant?: SpectrogramGPUVariant;
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
   * Performance mode: skip anti-aliasing
   * @default false
   */
  performanceMode?: boolean;
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

interface SpectrogramGPUContext {
  data: SpectrogramDataPointGPU[];
  timeAxis: SpectrogramAxisGPU;
  frequencyAxis: SpectrogramAxisGPU;
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
  colorScale: SpectrogramColorScaleGPU;
  magnitudeScale: "linear" | "log" | "decibel";
  variant: SpectrogramGPUVariant;
  animate: boolean;
  showColorBar: boolean;
  hoveredCell: { time: number; frequency: number } | null;
  setHoveredCell: (cell: { time: number; frequency: number } | null) => void;
}

const SpectrogramGPUContext = React.createContext<SpectrogramGPUContext | null>(null);

function useSpectrogramGPU() {
  const ctx = React.useContext(SpectrogramGPUContext);
  if (!ctx) throw new Error("useSpectrogramGPU must be used within SpectrogramGPU.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Color scale functions (converted to THREE.Color for GPU)
 */
const colorScalesGPU: Record<SpectrogramColorScaleGPU, (t: number) => THREE.Color> = {
  viridis: (t) => new THREE.Color(68 / 255 + t * (253 - 68) / 255, 1 / 255 + t * (231 - 1) / 255, (84 - t * (84 - 37)) / 255),
  plasma: (t) => new THREE.Color((13 + t * (240 - 13)) / 255, (8 + t * (249 - 8)) / 255, (135 - t * 135) / 255),
  inferno: (t) => new THREE.Color(t * 252 / 255, t * 255 / 255, (4 + t * (164 - 4)) / 255),
  magma: (t) => new THREE.Color(t * 252 / 255, t * 253 / 255, (4 + t * (191 - 4)) / 255),
  jet: (t) => {
    const r = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * t - 3)));
    const g = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * t - 2)));
    const b = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * t - 1)));
    return new THREE.Color(r, g, b);
  },
  hot: (t) => {
    const r = Math.min(1, t * 3);
    const g = Math.max(0, Math.min(1, t * 3 - 1));
    const b = Math.max(0, t * 3 - 2);
    return new THREE.Color(r, g, b);
  },
  cool: (t) => new THREE.Color(t, 1 - t, 1),
  turbo: (t) => new THREE.Color((34 + t * (251 - 34)) / 255, (15 + t * (232 - 15)) / 255, (143 - t * 110) / 255),
};

/**
 * Process time series data into spectrogram format using GPU FFT
 */
function processTimeSeriesGPU(
  timeSeries: SpectrogramTimeSeriesGPU,
  frequencyBins: number,
  fftCompute: (data: Float32Array) => Float32Array
): SpectrogramDataPointGPU[] {
  const { data, windowSize = 256, overlap = 0.5 } = timeSeries;
  const step = Math.floor(windowSize * (1 - overlap));
  const points: SpectrogramDataPointGPU[] = [];

  // Process each window with GPU FFT
  for (let i = 0; i + windowSize <= data.length; i += step) {
    const window = data.slice(i, i + windowSize);
    const centerTime = (window[0].time + window[window.length - 1].time) / 2;

    // Apply Hamming window
    const windowedData = new Float32Array(windowSize);
    for (let j = 0; j < windowSize; j++) {
      const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * j) / (windowSize - 1));
      windowedData[j] = window[j].value * w;
    }

    // Compute FFT using GPU
    const fftResult = fftCompute(windowedData);

    // Extract magnitudes for requested frequency bins
    const binStep = Math.floor((windowSize / 2) / frequencyBins);
    for (let k = 0; k < frequencyBins; k++) {
      const binIndex = k * binStep;
      const frequency = (k * (data.length / 2)) / frequencyBins;

      // Extract real and imaginary components
      const real = fftResult[binIndex * 2];
      const imag = fftResult[binIndex * 2 + 1];
      const magnitude = Math.sqrt(real * real + imag * imag) / windowSize;

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

const SpectrogramGPURoot = React.forwardRef<HTMLDivElement, SpectrogramGPURootProps>(
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
      performanceMode = false,
      className,
      children,
    },
    ref
  ) => {
    const [hoveredCell, setHoveredCell] = React.useState<{
      time: number;
      frequency: number;
    } | null>(null);

    // Initialize GPU FFT
    const { compute: fftCompute } = useGPUFFT(256); // Default window size

    // Process data with GPU FFT
    const data = React.useMemo(() => {
      if (Array.isArray(inputData)) {
        return inputData;
      } else {
        return processTimeSeriesGPU(inputData, frequencyBins, fftCompute);
      }
    }, [inputData, frequencyBins, fftCompute]);

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
    const frequencies = [...new Set(data.map((d) => d.frequency))].sort((a, b) => a - b);
    const magnitudes = data.map((d) => scaleMagnitude(d.magnitude, magnitudeScale));

    const timeDomain: [number, number] =
      timeAxis.domain === "auto" || !timeAxis.domain
        ? [Math.min(...times), Math.max(...times)]
        : timeAxis.domain;

    const frequencyDomain: [number, number] =
      frequencyAxis.domain === "auto" || !frequencyAxis.domain
        ? [Math.min(...frequencies), Math.max(...frequencies)]
        : frequencyAxis.domain;

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
    const timeTicks = React.useMemo(() => getTicks(timeDomain, 8), [timeDomain]);
    const frequencyTicks = React.useMemo(() => getTicks(frequencyDomain, 8), [frequencyDomain]);

    const contextValue: SpectrogramGPUContext = React.useMemo(
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
      <SpectrogramGPUContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("spectrogram-gpu", className)}
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
      </SpectrogramGPUContext.Provider>
    );
  }
);

SpectrogramGPURoot.displayName = "SpectrogramGPU.Root";

// ============================================================================
// Container Component
// ============================================================================

export interface SpectrogramGPUContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  performanceMode?: boolean;
}

const SpectrogramGPUContainer = React.forwardRef<HTMLDivElement, SpectrogramGPUContainerProps>(
  ({ className, style, performanceMode = false, children, ...props }, ref) => {
    const { height, width } = useSpectrogramGPU();

    return (
      <div
        ref={ref}
        className={cn("spectrogram-gpu-container", className)}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "100%",
          height: `${height}px`,
          borderRadius: "8px",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          ...style,
        }}
        {...props}
      >
        <Canvas
          orthographic
          camera={{ position: [0, 0, 100], zoom: 1 }}
          gl={{
            antialias: !performanceMode,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <OrthographicCamera
            makeDefault
            position={[width / 2, height / 2, 100]}
            zoom={1}
            near={0.1}
            far={1000}
          />
          {children}
        </Canvas>
      </div>
    );
  }
);

SpectrogramGPUContainer.displayName = "SpectrogramGPU.Container";

// ============================================================================
// Heatmap Component (GPU-rendered)
// ============================================================================

export interface SpectrogramGPUHeatmapProps {}

const SpectrogramGPUHeatmap = React.forwardRef<THREE.Group, SpectrogramGPUHeatmapProps>(
  (props, ref) => {
    const {
      data,
      timeScale,
      frequencyScale,
      magnitudeDomain,
      colorScale: colorScaleName,
      magnitudeScale: scaleType,
      margin,
      width,
      height,
    } = useSpectrogramGPU();

    // Group data and create GPU-friendly mesh
    const heatmapMesh = React.useMemo(() => {
      const times = [...new Set(data.map((d) => d.time))].sort((a, b) => a - b);
      const frequencies = [...new Set(data.map((d) => d.frequency))].sort((a, b) => a - b);

      const cellWidth = (width - margin.left - margin.right) / times.length;
      const cellHeight = (height - margin.top - margin.bottom) / frequencies.length;

      // Create instanced mesh for all cells
      const positions: number[] = [];
      const colors: number[] = [];
      const sizes: number[] = [];

      data.forEach((d) => {
        const x = timeScale(d.time);
        const y = frequencyScale(d.frequency);

        positions.push(x, y, 0);

        const scaledMag = scaleMagnitude(d.magnitude, scaleType);
        const normalized = (scaledMag - magnitudeDomain[0]) / (magnitudeDomain[1] - magnitudeDomain[0]);
        const color = colorScalesGPU[colorScaleName](Math.max(0, Math.min(1, normalized)));

        colors.push(color.r, color.g, color.b);
        sizes.push(cellWidth, cellHeight);
      });

      return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
        cellWidth,
        cellHeight,
      };
    }, [data, timeScale, frequencyScale, magnitudeDomain, colorScaleName, scaleType, margin, width, height]);

    return (
      <group ref={ref}>
        {/* Render heatmap cells as instanced quads */}
        {data.map((cell, i) => {
          const x = timeScale(cell.time);
          const y = frequencyScale(cell.frequency);

          const scaledMag = scaleMagnitude(cell.magnitude, scaleType);
          const normalized = (scaledMag - magnitudeDomain[0]) / (magnitudeDomain[1] - magnitudeDomain[0]);
          const color = colorScalesGPU[colorScaleName](Math.max(0, Math.min(1, normalized)));

          return (
            <mesh key={i} position={[x, y, 0]}>
              <planeGeometry args={[heatmapMesh.cellWidth, heatmapMesh.cellHeight]} />
              <meshBasicMaterial color={color} opacity={0.95} transparent />
            </mesh>
          );
        })}
      </group>
    );
  }
);

SpectrogramGPUHeatmap.displayName = "SpectrogramGPU.Heatmap";

// ============================================================================
// Axes Component (HTML overlay)
// ============================================================================

export interface SpectrogramGPUAxesProps extends React.HTMLAttributes<HTMLDivElement> {}

const SpectrogramGPUAxes = React.forwardRef<HTMLDivElement, SpectrogramGPUAxesProps>(
  ({ className, style, ...props }, ref) => {
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
    } = useSpectrogramGPU();

    const formatTick = (value: number, axis: SpectrogramAxisGPU): string => {
      if (axis.formatter) return axis.formatter(value);
      if (axis.type === "time") {
        const timezone = axis.timezone || "UTC";
        return formatTime(value, timezone);
      }
      return formatValue(value);
    };

    return (
      <div
        ref={ref}
        className={cn("spectrogram-gpu-axes", className)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          ...style,
        }}
        {...props}
      >
        {/* Time axis ticks */}
        {timeTicks.map((tick, i) => (
          <div
            key={`xtick-${i}`}
            style={{
              position: "absolute",
              left: `${timeScale(tick)}px`,
              top: `${height - margin.bottom + 5}px`,
              transform: "translateX(-50%)",
              fontSize: "10px",
              color: "currentColor",
              opacity: 0.6,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTick(tick, timeAxis)}
          </div>
        ))}
        {timeAxis.label && (
          <div
            style={{
              position: "absolute",
              left: `${(margin.left + width - margin.right) / 2}px`,
              top: `${height - 5}px`,
              transform: "translateX(-50%)",
              fontSize: "12px",
              fontWeight: 500,
              color: "currentColor",
              opacity: 0.7,
            }}
          >
            {timeAxis.label}
          </div>
        )}

        {/* Frequency axis ticks */}
        {frequencyTicks.map((tick, i) => (
          <div
            key={`ytick-${i}`}
            style={{
              position: "absolute",
              left: `${margin.left - 10}px`,
              top: `${frequencyScale(tick)}px`,
              transform: "translate(-100%, -50%)",
              fontSize: "10px",
              color: "currentColor",
              opacity: 0.6,
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTick(tick, frequencyAxis)}
          </div>
        ))}
        {frequencyAxis.label && (
          <div
            style={{
              position: "absolute",
              left: `${margin.left - 50}px`,
              top: `${(margin.top + height - margin.bottom) / 2}px`,
              transform: "rotate(-90deg)",
              transformOrigin: "center",
              fontSize: "12px",
              fontWeight: 500,
              color: "currentColor",
              opacity: 0.7,
              whiteSpace: "nowrap",
            }}
          >
            {frequencyAxis.label}
          </div>
        )}
      </div>
    );
  }
);

SpectrogramGPUAxes.displayName = "SpectrogramGPU.Axes";

// ============================================================================
// ColorBar Component (HTML overlay)
// ============================================================================

export interface SpectrogramGPUColorBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const SpectrogramGPUColorBar = React.forwardRef<HTMLDivElement, SpectrogramGPUColorBarProps>(
  ({ className, style, ...props }, ref) => {
    const {
      width,
      margin,
      height,
      magnitudeDomain,
      colorScale: colorScaleName,
      magnitudeScale,
      showColorBar,
    } = useSpectrogramGPU();

    if (!showColorBar) return null;

    const barWidth = 20;
    const barHeight = height - margin.top - margin.bottom;
    const barX = width - margin.right + 15;
    const barY = margin.top;
    const steps = 100;

    // Create gradient CSS string
    const gradientStops = Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1);
      const color = colorScalesGPU[colorScaleName](t);
      return `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}) ${100 - t * 100}%`;
    }).join(", ");

    return (
      <div
        ref={ref}
        className={cn("spectrogram-gpu-colorbar", className)}
        style={{
          position: "absolute",
          left: `${barX}px`,
          top: `${barY}px`,
          pointerEvents: "none",
          ...style,
        }}
        {...props}
      >
        {/* Color bar */}
        <div
          style={{
            width: `${barWidth}px`,
            height: `${barHeight}px`,
            background: `linear-gradient(to top, ${gradientStops})`,
            border: "1px solid rgba(0,0,0,0.2)",
            borderRadius: "2px",
          }}
        />

        {/* Labels */}
        {[magnitudeDomain[1], (magnitudeDomain[0] + magnitudeDomain[1]) / 2, magnitudeDomain[0]].map(
          (value, i) => {
            const y = (i * barHeight) / 2;
            const label =
              magnitudeScale === "decibel" ? `${value.toFixed(0)} dB` : value.toFixed(2);

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${barWidth + 8}px`,
                  top: `${y - 8}px`,
                  fontSize: "9px",
                  color: "currentColor",
                  opacity: 0.6,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {label}
              </div>
            );
          }
        )}

        {/* Title */}
        <div
          style={{
            position: "absolute",
            left: `${barWidth / 2}px`,
            top: "-20px",
            transform: "translateX(-50%)",
            fontSize: "10px",
            fontWeight: 500,
            color: "currentColor",
            opacity: 0.7,
          }}
        >
          Magnitude
        </div>
      </div>
    );
  }
);

SpectrogramGPUColorBar.displayName = "SpectrogramGPU.ColorBar";

// ============================================================================
// Tooltip Component
// ============================================================================

export interface SpectrogramGPUTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

const SpectrogramGPUTooltip = React.forwardRef<HTMLDivElement, SpectrogramGPUTooltipProps>(
  ({ className, style, ...props }, ref) => {
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
    } = useSpectrogramGPU();

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
      frequencyAxis.formatter?.(cellData.frequency) ?? formatValue(cellData.frequency);
    const magValue = scaleMagnitude(cellData.magnitude, scaleType);
    const magLabel = scaleType === "decibel" ? `${magValue.toFixed(1)} dB` : magValue.toFixed(4);

    const tooltipWidth = 180;
    const tooltipHeight = 80;
    const offsetX = px > width / 2 ? -tooltipWidth - 10 : 10;
    const offsetY = py > height / 2 ? -tooltipHeight - 10 : 10;

    return (
      <div
        ref={ref}
        className={cn("spectrogram-gpu-tooltip", className)}
        style={{
          position: "absolute",
          left: `${px + offsetX}px`,
          top: `${py + offsetY}px`,
          width: `${tooltipWidth}px`,
          padding: "10px",
          background: "rgba(0, 0, 0, 0.95)",
          color: "white",
          borderRadius: "6px",
          pointerEvents: "none",
          fontSize: "10px",
          ...style,
        }}
        {...props}
      >
        <div>Time: {timeLabel}</div>
        <div>Freq: {freqLabel}</div>
        <div>Mag: {magLabel}</div>
      </div>
    );
  }
);

SpectrogramGPUTooltip.displayName = "SpectrogramGPU.Tooltip";

// ============================================================================
// Exports
// ============================================================================

export const SpectrogramGPU = Object.assign(SpectrogramGPURoot, {
  Root: SpectrogramGPURoot,
  Container: SpectrogramGPUContainer,
  Heatmap: SpectrogramGPUHeatmap,
  Axes: SpectrogramGPUAxes,
  ColorBar: SpectrogramGPUColorBar,
  Tooltip: SpectrogramGPUTooltip,
});
