"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  memo,
} from "react";
import { ChartTooltip } from "./chart-tooltip";
import { ChartLegend, type LegendItem } from "./chart-legend";

// ============================================================================
// Types
// ============================================================================

/**
 * A single point in polar coordinates
 */
export interface PolarPoint {
  /** Angle value (in degrees or radians based on angleUnit) */
  angle: number;
  /** Radius value */
  radius: number;
}

/**
 * A polar data series to plot
 */
export interface PolarSeries {
  /** Name shown in legend */
  name: string;
  /** Array of polar data points */
  data: PolarPoint[];
  /** Line/fill color */
  color?: string;
  /** Line thickness in pixels */
  strokeWidth?: number;
  /** Dashed line style */
  dashed?: boolean;
  /** Fill the area */
  filled?: boolean;
}

/**
 * Configuration for the radial axis
 */
export interface RadialAxis {
  /** Axis label */
  label?: string;
  /** Min/max radius values, or "auto" */
  domain?: [number, number] | "auto";
  /** Radius scale type */
  scale?: "linear" | "log";
  /** Custom formatter function */
  formatter?: (value: number) => string;
}

/**
 * Configuration for the angular axis
 */
export interface AngularAxis {
  /** Unit for angle values */
  unit?: "degrees" | "radians";
  /** Starting angle offset (in degrees, 0 = right, 90 = top) */
  startAngle?: number;
  /** Rotation direction */
  direction?: "clockwise" | "counterclockwise";
}

/**
 * Grid configuration
 */
export interface GridConfig {
  /** Show radial grid lines */
  radial?: boolean;
  /** Show angular grid lines */
  angular?: boolean;
}

/**
 * Symmetry options for polar plots
 */
export type SymmetryType = "none" | "mirror" | "rotational";

/**
 * Props for the PolarPlot component
 */
export interface PolarPlotProps {
  /** Array of polar series to plot */
  series: PolarSeries[];
  /** Radial axis configuration */
  radialAxis?: RadialAxis;
  /** Angular axis configuration */
  angularAxis?: AngularAxis;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Show grid lines */
  showGrid?: GridConfig | boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Enable animations */
  animate?: boolean;
  /** Apply symmetry */
  symmetry?: SymmetryType;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Context (Internal)
// ============================================================================

interface PolarContext {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  maxRadius: number;
  angleUnit: "degrees" | "radians";
  startAngle: number;
  direction: "clockwise" | "counterclockwise";
  radiusScale: (r: number) => number;
  toCartesian: (angle: number, radius: number) => { x: number; y: number };
  hoveredPoint: { seriesIdx: number; pointIdx: number } | null;
  setHoveredPoint: (point: { seriesIdx: number; pointIdx: number } | null) => void;
}

const Context = createContext<PolarContext | null>(null);

function usePolar() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Must be used within PolarPlot");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function getRadiusDomain(points: PolarPoint[]): [number, number] {
  if (points.length === 0) return [0, 1];
  const radii = points.map(p => p.radius);
  const max = Math.max(...radii);
  const min = Math.min(...radii, 0);
  return [min, max * 1.1]; // Add 10% padding
}

function createLinearScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const slope = (r1 - r0) / (d1 - d0);
  return (value: number) => r0 + slope * (value - d0);
}

function createLogScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const logD0 = Math.log10(d0 || 0.001);
  const logD1 = Math.log10(d1);
  const slope = (r1 - r0) / (logD1 - logD0);
  return (value: number) => r0 + slope * (Math.log10(value || 0.001) - logD0);
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(1);
  return value.toFixed(2);
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function getRadialTicks(domain: [number, number], count: number = 5): number[] {
  const [min, max] = domain;
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

function getAngularTicks(count: number = 12): number[] {
  return Array.from({ length: count }, (_, i) => (i * 360) / count);
}

// ============================================================================
// Components
// ============================================================================

interface PolarGridProps {
  radialTicks: number[];
  angularTicks: number[];
  showRadial: boolean;
  showAngular: boolean;
  animate: boolean;
}

const PolarGrid = memo(({ radialTicks, angularTicks, showRadial, showAngular, animate }: PolarGridProps) => {
  const { centerX, centerY, radiusScale, toCartesian } = usePolar();

  return (
    <g className="polar-grid">
      {/* Radial circles */}
      {showRadial && radialTicks.map((tick, i) => {
        const r = radiusScale(tick);
        return (
          <circle
            key={`radial-${i}`}
            cx={centerX}
            cy={centerY}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="2,4"
            opacity={animate ? 0 : 0.08}
            style={animate ? { animation: `fadeIn 0.3s ease ${i * 0.05}s forwards` } : undefined}
          />
        );
      })}
      {/* Angular lines */}
      {showAngular && angularTicks.map((angle, i) => {
        const maxR = radiusScale(radialTicks[radialTicks.length - 1]);
        const { x, y } = toCartesian(angle, maxR);
        return (
          <line
            key={`angular-${i}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeWidth={0.5}
            strokeDasharray="2,4"
            opacity={animate ? 0 : 0.08}
            style={animate ? { animation: `fadeIn 0.3s ease ${i * 0.03}s forwards` } : undefined}
          />
        );
      })}
      <style jsx>{`
        @keyframes fadeIn {
          to { opacity: 0.08; }
        }
      `}</style>
    </g>
  );
});

PolarGrid.displayName = "PolarGrid";

interface PolarAxesProps {
  radialTicks: number[];
  angularTicks: number[];
  radialLabel?: string;
  radialAxis?: RadialAxis;
  animate: boolean;
}

const PolarAxes = memo(({ radialTicks, angularTicks, radialLabel, radialAxis, animate }: PolarAxesProps) => {
  const { centerX, centerY, radiusScale, toCartesian, angleUnit } = usePolar();

  const formatTick = (value: number): string => {
    if (radialAxis?.formatter) {
      return radialAxis.formatter(value);
    }
    return formatValue(value);
  };

  return (
    <g className="polar-axes">
      {/* Radial tick labels */}
      {radialTicks.map((tick, i) => {
        if (i === 0) return null; // Skip center
        const r = radiusScale(tick);
        return (
          <g key={`rtick-${i}`} opacity={animate ? 0 : 1} style={animate ? { animation: `fadeIn 0.3s ease ${0.3 + i * 0.04}s forwards` } : undefined}>
            <text
              x={centerX + 5}
              y={centerY - r + 4}
              fontSize={10}
              fill="currentColor"
              opacity={0.7}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatTick(tick)}
            </text>
          </g>
        );
      })}

      {/* Angular tick labels */}
      {angularTicks.map((angle, i) => {
        const maxR = radiusScale(radialTicks[radialTicks.length - 1]);
        const labelR = maxR + 25;
        const { x, y } = toCartesian(angle, labelR);
        const displayAngle = angleUnit === "radians" ? `${(degreesToRadians(angle)).toFixed(2)}` : `${angle}°`;

        return (
          <g key={`atick-${i}`} opacity={animate ? 0 : 1} style={animate ? { animation: `fadeIn 0.3s ease ${0.3 + i * 0.03}s forwards` } : undefined}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
              opacity={0.7}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {displayAngle}
            </text>
          </g>
        );
      })}

      {/* Radial label */}
      {radialLabel && (
        <text
          x={centerX}
          y={centerY - radiusScale(radialTicks[radialTicks.length - 1]) - 40}
          textAnchor="middle"
          fontSize={13}
          fontWeight={500}
          fill="currentColor"
          opacity={animate ? 0 : 1}
          style={animate ? { animation: "fadeIn 0.4s ease 0.5s forwards" } : undefined}
        >
          {radialLabel}
        </text>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </g>
  );
});

PolarAxes.displayName = "PolarAxes";

interface PolarLineProps {
  series: PolarSeries;
  seriesIdx: number;
  animate: boolean;
}

const PolarLine = memo(({ series, seriesIdx, animate }: PolarLineProps) => {
  const { toCartesian, radiusScale, setHoveredPoint, hoveredPoint, angleUnit } = usePolar();
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  const { data, color = "#64748b", strokeWidth = 2, dashed = false, filled = false } = series;

  // Convert angle to degrees if needed
  const normalizeAngle = (angle: number) => {
    return angleUnit === "radians" ? (angle * 180) / Math.PI : angle;
  };

  const pathData = useMemo(() => {
    if (data.length === 0) return "";

    const points = data.map(p => {
      const angle = normalizeAngle(p.angle);
      const r = radiusScale(p.radius);
      return toCartesian(angle, r);
    });

    // Create closed path for polar plots
    const pathCommands = points.map((p, i) =>
      i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`
    );

    // Close the path for filled plots
    if (filled || data.length > 2) {
      pathCommands.push("Z");
    }

    return pathCommands.join(" ");
  }, [data, radiusScale, toCartesian, filled, normalizeAngle]);

  useEffect(() => {
    if (pathRef.current && animate) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [pathData, animate]);

  const cartesianPoints = useMemo(() => {
    return data.map(p => {
      const angle = normalizeAngle(p.angle);
      const r = radiusScale(p.radius);
      return toCartesian(angle, r);
    });
  }, [data, radiusScale, toCartesian, normalizeAngle]);

  return (
    <g className="polar-line">
      <path
        ref={pathRef}
        d={pathData}
        fill={filled ? color : "none"}
        fillOpacity={filled ? 0.2 : 0}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? "6,6" : animate ? pathLength : undefined}
        strokeDashoffset={animate ? pathLength : 0}
        style={animate ? { animation: `drawLine 1.2s ease-out ${seriesIdx * 0.15}s forwards` } : undefined}
      />
      {cartesianPoints.map((point, i) => {
        const isHovered = hoveredPoint?.seriesIdx === seriesIdx && hoveredPoint?.pointIdx === i;
        return (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={isHovered ? 5 : 3}
            fill={color}
            stroke="var(--background)"
            strokeWidth={isHovered ? 2 : 1}
            opacity={animate ? 0 : 1}
            style={{
              animation: animate ? `fadeIn 0.2s ease ${1.2 + seriesIdx * 0.15 + i * 0.01}s forwards` : undefined,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={() => setHoveredPoint({ seriesIdx, pointIdx: i })}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        );
      })}
      <style jsx>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </g>
  );
});

PolarLine.displayName = "PolarLine";



// ============================================================================
// Main Component
// ============================================================================

/**
 * A polar coordinate plot for directional data
 *
 * @example
 * ```tsx
 * <PolarPlot
 *   series={[
 *     {
 *       name: "Antenna Pattern",
 *       data: [
 *         { angle: 0, radius: 10 },
 *         { angle: 45, radius: 8 },
 *         { angle: 90, radius: 5 }
 *       ],
 *       color: "#ef4444",
 *       filled: true
 *     }
 *   ]}
 *   angularAxis={{ unit: "degrees" }}
 *   radialAxis={{ label: "Gain (dBi)", scale: "linear" }}
 * />
 * ```
 */
export const PolarPlot = memo(
  forwardRef<SVGSVGElement, PolarPlotProps>(
    (
      {
        series,
        radialAxis = {},
        angularAxis = {},
        width = 600,
        height = 600,
        showGrid = true,
        showLegend = true,
        animate = true,
        symmetry = "none",
        className = "",
      },
      ref
    ) => {
      const [hoveredPoint, setHoveredPoint] = useState<{ seriesIdx: number; pointIdx: number } | null>(null);

      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2 - 60;

      const angleUnit = angularAxis.unit || "degrees";
      const startAngle = angularAxis.startAngle || 90; // Default: 0° at top
      const direction = angularAxis.direction || "clockwise";

      // Calculate radial domain
      const allPoints = series.flatMap(s => s.data);
      const radiusDomain = radialAxis.domain === "auto" || !radialAxis.domain
        ? getRadiusDomain(allPoints)
        : radialAxis.domain;

      // Create radius scale
      const radiusScale = useMemo(() => {
        const scaleType = radialAxis.scale || "linear";
        if (scaleType === "log") {
          return createLogScale(radiusDomain, [0, maxRadius]);
        }
        return createLinearScale(radiusDomain, [0, maxRadius]);
      }, [radiusDomain, maxRadius, radialAxis.scale]);

      // Convert polar to cartesian
      const toCartesian = useCallback((angleDeg: number, radius: number) => {
        // Adjust for start angle and direction
        let adjustedAngle = direction === "clockwise"
          ? startAngle - angleDeg
          : startAngle + angleDeg;

        const angleRad = degreesToRadians(adjustedAngle);
        return {
          x: centerX + radius * Math.cos(angleRad),
          y: centerY - radius * Math.sin(angleRad),
        };
      }, [centerX, centerY, startAngle, direction]);

      const radialTicks = useMemo(() => getRadialTicks(radiusDomain, 5), [radiusDomain]);
      const angularTicks = useMemo(() => getAngularTicks(12), []);

      const gridConfig = typeof showGrid === "boolean"
        ? { radial: showGrid, angular: showGrid }
        : showGrid;

      const contextValue: PolarContext = useMemo(
        () => ({
          width,
          height,
          centerX,
          centerY,
          maxRadius,
          angleUnit,
          startAngle,
          direction,
          radiusScale,
          toCartesian,
          hoveredPoint,
          setHoveredPoint,
        }),
        [width, height, centerX, centerY, maxRadius, angleUnit, startAngle, direction, radiusScale, toCartesian, hoveredPoint]
      );

      // Convert series to legend items
      const legendItems: LegendItem[] = useMemo(
        () => series.map(s => ({
          name: s.name,
          color: s.color || "#64748b",
          strokeWidth: s.strokeWidth || 2,
          dashed: s.dashed,
          filled: s.filled,
          symbol: "line" as const,
        })),
        [series]
      );

      // Tooltip content
      const tooltipContent = useMemo(() => {
        if (!hoveredPoint) return null;
        const s = series[hoveredPoint.seriesIdx];
        const point = s.data[hoveredPoint.pointIdx];
        const angleDisplay = angleUnit === "radians"
          ? `${point.angle.toFixed(3)}rad`
          : `${point.angle.toFixed(1)}°`;
        return `${s.name}: θ=${angleDisplay}, r=${point.radius.toFixed(2)}`;
      }, [hoveredPoint, series, angleUnit]);

      const tooltipPosition = useMemo(() => {
        if (!hoveredPoint) return null;
        const s = series[hoveredPoint.seriesIdx];
        const point = s.data[hoveredPoint.pointIdx];
        const normalizeAngle = (angle: number) => {
          return angleUnit === "radians" ? (angle * 180) / Math.PI : angle;
        };
        const angle = normalizeAngle(point.angle);
        const r = radiusScale(point.radius);
        return toCartesian(angle, r);
      }, [hoveredPoint, series, angleUnit, radiusScale, toCartesian]);

      return (
        <Context.Provider value={contextValue}>
          <svg ref={ref} width={width} height={height} className={className} style={{ userSelect: "none" }}>
            <PolarGrid
              radialTicks={radialTicks}
              angularTicks={angularTicks}
              showRadial={gridConfig.radial !== false}
              showAngular={gridConfig.angular !== false}
              animate={animate}
            />
            <PolarAxes
              radialTicks={radialTicks}
              angularTicks={angularTicks}
              radialLabel={radialAxis.label}
              radialAxis={radialAxis}
              animate={animate}
            />
            {series.map((s, i) => (
              <PolarLine key={i} series={s} seriesIdx={i} animate={animate} />
            ))}
            {tooltipContent && tooltipPosition && (
              <ChartTooltip
                x={tooltipPosition.x}
                y={tooltipPosition.y}
                content={tooltipContent}
                align="auto"
                crosshairBounds={[centerX - maxRadius, centerY - maxRadius, centerX + maxRadius, centerY + maxRadius]}
              />
            )}
            {showLegend && (
              <ChartLegend
                items={legendItems}
                x={width - 160}
                y={centerY - legendItems.length * 12}
              />
            )}
          </svg>
        </Context.Provider>
      );
    }
  )
);

PolarPlot.displayName = "PolarPlot";
