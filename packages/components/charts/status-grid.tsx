"use client";

import * as React from "react";
import { createWebGLRenderer, hexToRgb, type WebGLRenderer } from "./base-chart";

// ============================================================================
// Status Grid Types
// ============================================================================

export type StatusLevel = "normal" | "warning" | "critical" | "offline";

export interface KPIMetric {
  id: string;
  label: string;
  value: number;
  unit?: string;
  change?: number; // percentage change
  status?: StatusLevel;
  min?: number;
  max?: number;
  sparkline?: number[]; // Historical values for mini chart
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface StatusGridRootProps {
  columns?: number;
  gap?: number;
  className?: string;
  children?: React.ReactNode;
}

export interface StatusGridProps {
  metrics: KPIMetric[];
  columns?: number;
  gap?: number;
  showSparklines?: boolean;
  className?: string;
}

interface StatusGridContextType {
  columns: number;
  gap: number;
}

const StatusGridContext = React.createContext<StatusGridContextType | null>(null);

function useStatusGrid() {
  const ctx = React.useContext(StatusGridContext);
  if (!ctx) {
    throw new Error("StatusGrid components must be used within StatusGrid.Root");
  }
  return ctx;
}

// ============================================================================
// Status Colors
// ============================================================================

const STATUS_COLORS = {
  normal: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
  offline: "#6b7280",
};

function getStatusFromValue(
  value: number,
  threshold?: { warning: number; critical: number }
): StatusLevel {
  if (!threshold) return "normal";
  if (value >= threshold.critical) return "critical";
  if (value >= threshold.warning) return "warning";
  return "normal";
}

// ============================================================================
// Sparkline Component
// ============================================================================

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkline({
  data,
  width = 200,
  height = 48,
  color = "#3b82f6",
  className = ""
}: SparklineProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rendererRef = React.useRef<WebGLRenderer<any> | null>(null);

  React.useEffect(() => {
    if (!canvasRef.current || data.length < 2) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (!rendererRef.current) {
      const VERTEX_SHADER = `
        attribute vec2 a_position;
        attribute vec4 a_color;

        uniform vec2 u_resolution;

        varying vec4 v_color;

        void main() {
          vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
          clipSpace.y *= -1.0;

          gl_Position = vec4(clipSpace, 0.0, 1.0);
          v_color = a_color;
        }
      `;

      const FRAGMENT_SHADER = `
        precision mediump float;
        varying vec4 v_color;

        void main() {
          gl_FragColor = v_color;
        }
      `;

      rendererRef.current = createWebGLRenderer({
        canvas,
        createShaders: () => ({
          vertexSource: VERTEX_SHADER,
          fragmentSource: FRAGMENT_SHADER,
        }),
        onRender: (gl, program, props) => {
          const { data, color, width, height } = props;

          gl.useProgram(program);
          gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), width, height);

          const min = Math.min(...data);
          const max = Math.max(...data);
          const range = max - min || 1;

          const positions: number[] = [];
          const colors: number[] = [];
          const rgb = hexToRgb(color);

          // Create line segments
          for (let i = 0; i < data.length - 1; i++) {
            const x1 = (i / (data.length - 1)) * width;
            const y1 = height - ((data[i] - min) / range) * height;
            const x2 = ((i + 1) / (data.length - 1)) * width;
            const y2 = height - ((data[i + 1] - min) / range) * height;

            positions.push(x1, y1, x2, y2);
            colors.push(...rgb, 0.8, ...rgb, 0.8);
          }

          const positionBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

          const positionLoc = gl.getAttribLocation(program, "a_position");
          gl.enableVertexAttribArray(positionLoc);
          gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

          const colorBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

          const colorLoc = gl.getAttribLocation(program, "a_color");
          gl.enableVertexAttribArray(colorLoc);
          gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

          gl.drawArrays(gl.LINES, 0, positions.length / 2);
        },
        onDestroy: (gl) => {
          // Cleanup buffers if needed
        }
      });
    }

    rendererRef.current.render({
      data,
      color,
      width: canvas.width,
      height: canvas.height,
    });

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [data, width, height, color]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

// ============================================================================
// Primitive Components
// ============================================================================

export interface CardProps {
  metric?: KPIMetric;
  className?: string;
  children?: React.ReactNode;
}

export function Card({ metric, className = "", children }: CardProps) {
  return (
    <div className={`relative bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors ${className}`}>
      {children}
    </div>
  );
}

export interface StatusIndicatorProps {
  status?: StatusLevel;
  color?: string;
  className?: string;
}

export function StatusIndicator({ status, color, className = "" }: StatusIndicatorProps) {
  const indicatorColor = color || (status ? STATUS_COLORS[status] : STATUS_COLORS.normal);

  return (
    <div
      className={`absolute top-3 right-3 w-2 h-2 rounded-full ${className}`}
      style={{ backgroundColor: indicatorColor }}
    />
  );
}

export interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export function Label({ children, className = "" }: LabelProps) {
  return (
    <div className={`text-xs text-zinc-500 font-medium mb-1 ${className}`}>
      {children}
    </div>
  );
}

export interface ValueProps {
  value: number;
  unit?: string;
  decimals?: number;
  className?: string;
}

export function Value({ value, unit, decimals = 1, className = "" }: ValueProps) {
  return (
    <div className={`flex items-baseline gap-2 mb-2 ${className}`}>
      <span className="text-3xl font-bold tabular-nums">{value.toFixed(decimals)}</span>
      {unit && <span className="text-sm text-zinc-500">{unit}</span>}
    </div>
  );
}

export interface ChangeIndicatorProps {
  change: number;
  className?: string;
}

export function ChangeIndicator({ change, className = "" }: ChangeIndicatorProps) {
  const colorClass = change > 0
    ? "text-green-500"
    : change < 0
      ? "text-red-500"
      : "text-zinc-500";

  return (
    <div className={`text-xs font-medium ${colorClass} ${className}`}>
      {change > 0 && "+"}
      {change.toFixed(1)}%
    </div>
  );
}

export interface RangeProps {
  min: number;
  max: number;
  className?: string;
}

export function Range({ min, max, className = "" }: RangeProps) {
  return (
    <div className={`mt-2 text-xs text-zinc-600 ${className}`}>
      Range: {min} - {max}
    </div>
  );
}

// ============================================================================
// Root Component (Primitive)
// ============================================================================

export function StatusGridRoot({
  columns = 3,
  gap = 16,
  className = "",
  children,
}: StatusGridRootProps) {
  const contextValue: StatusGridContextType = {
    columns,
    gap,
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
  };

  return (
    <StatusGridContext.Provider value={contextValue}>
      <div className={className} style={gridStyle}>
        {children}
      </div>
    </StatusGridContext.Provider>
  );
}

// ============================================================================
// Compound Component (Simple API - Backward Compatible)
// ============================================================================

interface KPICardProps {
  metric: KPIMetric;
  showSparkline?: boolean;
}

function KPICard({ metric, showSparkline = true }: KPICardProps) {
  const status = metric.status || getStatusFromValue(metric.value, metric.threshold);
  const statusColor = STATUS_COLORS[status];

  return (
    <Card>
      <StatusIndicator status={status} />
      <Label>{metric.label}</Label>
      <Value value={metric.value} unit={metric.unit} />
      {metric.change !== undefined && <ChangeIndicator change={metric.change} />}
      {showSparkline && metric.sparkline && metric.sparkline.length > 1 && (
        <div className="mt-3 h-12">
          <Sparkline data={metric.sparkline} width={200} height={48} color={statusColor} />
        </div>
      )}
      {metric.min !== undefined && metric.max !== undefined && (
        <Range min={metric.min} max={metric.max} />
      )}
    </Card>
  );
}

export function StatusGrid({
  metrics,
  columns = 3,
  gap = 16,
  showSparklines = true,
  className = "",
}: StatusGridProps) {
  return (
    <StatusGridRoot columns={columns} gap={gap} className={className}>
      {metrics.map((metric) => (
        <KPICard key={metric.id} metric={metric} showSparkline={showSparklines} />
      ))}
    </StatusGridRoot>
  );
}

// ============================================================================
// Exports
// ============================================================================

StatusGrid.Root = StatusGridRoot;
StatusGrid.Card = Card;
StatusGrid.Label = Label;
StatusGrid.Value = Value;
StatusGrid.StatusIndicator = StatusIndicator;
StatusGrid.ChangeIndicator = ChangeIndicator;
StatusGrid.Range = Range;
StatusGrid.Sparkline = Sparkline;

export default StatusGrid;
