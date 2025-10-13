"use client";

import * as React from "react";
import { cn } from "../components/lib";

// ============================================================================
// Types
// ============================================================================

export interface PipelineStage {
  id: string;
  label: string;
  x?: number; // Optional - will auto-layout if not provided
  y?: number;
  metrics?: {
    throughput?: number; // requests/sec
    throughputTrend?: "up" | "down" | "stable";
    latency?: number; // milliseconds
    latencyTrend?: "up" | "down" | "stable";
    errorRate?: number; // 0-1
    errorTrend?: "up" | "down" | "stable";
    queueDepth?: number; // queued items
  };
  status?: "healthy" | "degraded" | "error" | "offline";
}

export interface PipelineConnection {
  from: string;
  to: string;
  throughput?: number; // For flow thickness
  errorRate?: number; // For error visualization
  latency?: number; // For connection health
}

export interface DataflowVisualizerRootProps {
  stages: PipelineStage[];
  connections: PipelineConnection[];
  onStageClick?: (stage: PipelineStage) => void;
  width?: number;
  height?: number;
  autoLayout?: boolean;
  theme?: "light" | "dark";
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface DataflowVisualizerContext {
  stages: PipelineStage[];
  connections: PipelineConnection[];
  width: number;
  height: number;
  theme: "light" | "dark";
  hoveredStage: string | null;
  setHoveredStage: (id: string | null) => void;
  onStageClick?: (stage: PipelineStage) => void;
}

const DataflowVisualizerContext = React.createContext<DataflowVisualizerContext | null>(null);

function useDataflowVisualizer() {
  const ctx = React.useContext(DataflowVisualizerContext);
  if (!ctx) throw new Error("useDataflowVisualizer must be used within DataflowVisualizer.Root");
  return ctx;
}

// ============================================================================
// Utilities
// ============================================================================

function getStatusColor(status?: PipelineStage["status"]): string {
  switch (status) {
    case "healthy": return "#10b981";
    case "degraded": return "#f59e0b";
    case "error": return "#ef4444";
    case "offline": return "#6b7280";
    default: return "#6b7280";
  }
}

function formatMetric(value: number, suffix: string): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${suffix}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K${suffix}`;
  return `${value.toFixed(0)}${suffix}`;
}

function detectBottleneck(stage: PipelineStage, connections: PipelineConnection[], stages: PipelineStage[]): boolean {
  if (!stage.metrics?.throughput) return false;

  // Find incoming throughput
  const incomingConns = connections.filter(c => c.to === stage.id);
  const totalIncoming = incomingConns.reduce((sum, conn) => {
    const fromStage = stages.find(s => s.id === conn.from);
    return sum + (fromStage?.metrics?.throughput || 0);
  }, 0);

  // Bottleneck if output is significantly less than input (>30% drop)
  if (totalIncoming > 0 && stage.metrics.throughput < totalIncoming * 0.7) {
    return true;
  }

  return false;
}

// Simple auto-layout for stages (left-to-right)
function autoLayoutStages(stages: PipelineStage[], connections: PipelineConnection[], width: number, height: number): PipelineStage[] {
  // Build adjacency map
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  stages.forEach(s => {
    adj.set(s.id, []);
    inDegree.set(s.id, 0);
  });

  connections.forEach(c => {
    adj.get(c.from)?.push(c.to);
    inDegree.set(c.to, (inDegree.get(c.to) || 0) + 1);
  });

  // Topological sort to get layers
  const layers: string[][] = [];
  const queue: string[] = [];
  const layerMap = new Map<string, number>();

  stages.forEach(s => {
    if (inDegree.get(s.id) === 0) {
      queue.push(s.id);
      layerMap.set(s.id, 0);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLayer = layerMap.get(current)!;

    if (!layers[currentLayer]) layers[currentLayer] = [];
    layers[currentLayer].push(current);

    adj.get(current)?.forEach(next => {
      const nextDegree = (inDegree.get(next) || 0) - 1;
      inDegree.set(next, nextDegree);

      if (nextDegree === 0) {
        queue.push(next);
        layerMap.set(next, currentLayer + 1);
      }
    });
  }

  // Position stages
  const cardWidth = 180;
  const cardHeight = 140;
  const horizontalSpacing = width / (layers.length + 1);
  const positioned = new Map<string, { x: number; y: number }>();

  layers.forEach((layer, layerIdx) => {
    const x = horizontalSpacing * (layerIdx + 1);
    const verticalSpacing = height / (layer.length + 1);

    layer.forEach((stageId, idx) => {
      const y = verticalSpacing * (idx + 1);
      positioned.set(stageId, { x, y });
    });
  });

  // Return stages with positions
  return stages.map(stage => ({
    ...stage,
    x: positioned.get(stage.id)?.x || stage.x || width / 2,
    y: positioned.get(stage.id)?.y || stage.y || height / 2,
  }));
}

// ============================================================================
// Root Component
// ============================================================================

const DataflowVisualizerRoot = React.forwardRef<HTMLDivElement, DataflowVisualizerRootProps>(
  (
    {
      stages: rawStages,
      connections,
      onStageClick,
      width = 1200,
      height = 600,
      autoLayout = true,
      theme = "dark",
      className,
      children,
    },
    ref
  ) => {
    const [hoveredStage, setHoveredStage] = React.useState<string | null>(null);

    // Auto-layout if enabled and positions not provided
    const stages = React.useMemo(() => {
      const needsLayout = autoLayout && rawStages.some(s => s.x === undefined || s.y === undefined);
      if (needsLayout) {
        return autoLayoutStages(rawStages, connections, width, height);
      }
      return rawStages;
    }, [rawStages, connections, autoLayout, width, height]);

    const contextValue: DataflowVisualizerContext = React.useMemo(
      () => ({
        stages,
        connections,
        width,
        height,
        theme,
        hoveredStage,
        setHoveredStage,
        onStageClick,
      }),
      [stages, connections, width, height, theme, hoveredStage, onStageClick]
    );

    return (
      <DataflowVisualizerContext.Provider value={contextValue}>
        <div ref={ref} className={cn("dataflow-visualizer", className)}>
          {children}
        </div>
      </DataflowVisualizerContext.Provider>
    );
  }
);

DataflowVisualizerRoot.displayName = "DataflowVisualizer.Root";

// ============================================================================
// Canvas Component
// ============================================================================

const DataflowVisualizerCanvas = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, children, ...props }, ref) => {
    const { width, height, theme } = useDataflowVisualizer();

    return (
      <svg
        ref={ref}
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn("dataflow-canvas", className)}
        {...props}
      >
        {/* Clean gradient background */}
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme === "dark" ? "#0f172a" : "#f8fafc"} />
            <stop offset="100%" stopColor={theme === "dark" ? "#020617" : "#e2e8f0"} />
          </linearGradient>
        </defs>

        <rect width={width} height={height} fill="url(#bg-gradient)" />

        {children}
      </svg>
    );
  }
);

DataflowVisualizerCanvas.displayName = "DataflowVisualizer.Canvas";

// ============================================================================
// Connections Component
// ============================================================================

const DataflowVisualizerConnections = React.forwardRef<SVGGElement, React.SVGProps<SVGGElement>>(
  ({ className, ...props }, ref) => {
    const { stages, connections, theme, hoveredStage } = useDataflowVisualizer();

    // Find max throughput for relative sizing
    const maxThroughput = Math.max(...connections.map(c => c.throughput || 0), 1);

    return (
      <g ref={ref} className={cn("connections", className)} {...props}>
        <defs>
          {/* Arrow marker */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill={theme === "dark" ? "#475569" : "#94a3b8"}
            />
          </marker>
          <marker
            id="arrowhead-error"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
          </marker>
        </defs>

        {connections.map(conn => {
          const from = stages.find(s => s.id === conn.from);
          const to = stages.find(s => s.id === conn.to);
          if (!from || !to || from.x === undefined || to.x === undefined || from.y === undefined || to.y === undefined) return null;

          // Calculate connection points (from right side of card to left side)
          const cardWidth = 180;
          const cardHeight = 140;
          const x1 = from.x + cardWidth / 2;
          const y1 = from.y;
          const x2 = to.x - cardWidth / 2;
          const y2 = to.y;

          // Flow thickness based on throughput (1-12px range)
          const relativeFlow = conn.throughput ? (conn.throughput / maxThroughput) : 0.5;
          const strokeWidth = Math.max(1, Math.min(12, relativeFlow * 12));

          // Error visualization
          const hasErrors = (conn.errorRate || 0) > 0.01; // > 1% error rate
          const isHighError = (conn.errorRate || 0) > 0.1; // > 10% error rate

          // Highlight if connected to hovered stage
          const isHighlighted = hoveredStage === from.id || hoveredStage === to.id;

          // Bezier curve for smooth flow
          const dx = x2 - x1;
          const controlX1 = x1 + dx * 0.3;
          const controlX2 = x2 - dx * 0.3;
          const path = `M ${x1} ${y1} C ${controlX1} ${y1}, ${controlX2} ${y2}, ${x2} ${y2}`;

          const strokeColor = isHighError
            ? "#ef4444"
            : hasErrors
            ? "#f59e0b"
            : theme === "dark"
            ? "#475569"
            : "#cbd5e1";

          const strokeOpacity = isHighlighted ? 1 : hasErrors ? 0.8 : 0.4;

          return (
            <g key={`${from.id}-${to.id}`}>
              {/* Glow effect for high-traffic connections */}
              {relativeFlow > 0.6 && (
                <path
                  d={path}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth + 6}
                  fill="none"
                  opacity={0.1}
                  style={{ transition: "all 0.3s ease" }}
                />
              )}

              {/* Main connection path */}
              <path
                d={path}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                fill="none"
                markerEnd={`url(#${hasErrors ? "arrowhead-error" : "arrowhead"})`}
                style={{ transition: "all 0.3s ease" }}
              />

              {/* Error rate label */}
              {hasErrors && (
                <g>
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill={isHighError ? "#ef4444" : "#f59e0b"}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {((conn.errorRate || 0) * 100).toFixed(1)}% errors
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  }
);

DataflowVisualizerConnections.displayName = "DataflowVisualizer.Connections";

// ============================================================================
// Stages Component (Card-based design)
// ============================================================================

const DataflowVisualizerStages = React.forwardRef<SVGGElement, React.SVGProps<SVGGElement>>(
  ({ className, ...props }, ref) => {
    const { stages, connections, hoveredStage, setHoveredStage, onStageClick, theme } = useDataflowVisualizer();

    const cardWidth = 180;
    const cardHeight = 140;

    return (
      <g ref={ref} className={cn("stages", className)} {...props}>
        {stages.map(stage => {
          if (stage.x === undefined || stage.y === undefined) return null;

          const isHovered = hoveredStage === stage.id;
          const isBottleneck = detectBottleneck(stage, connections, stages);
          const statusColor = getStatusColor(stage.status);

          // Card position (centered on x, y)
          const x = stage.x - cardWidth / 2;
          const y = stage.y - cardHeight / 2;

          return (
            <g
              key={stage.id}
              onMouseEnter={() => setHoveredStage(stage.id)}
              onMouseLeave={() => setHoveredStage(null)}
              onClick={() => onStageClick?.(stage)}
              style={{
                cursor: onStageClick ? "pointer" : "default",
                transition: "all 0.2s ease",
              }}
            >
              {/* Bottleneck warning glow */}
              {isBottleneck && (
                <rect
                  x={x - 4}
                  y={y - 4}
                  width={cardWidth + 8}
                  height={cardHeight + 8}
                  rx={14}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  opacity={0.4}
                >
                  <animate
                    attributeName="opacity"
                    values="0.2;0.6;0.2"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </rect>
              )}

              {/* Card background */}
              <rect
                x={x}
                y={y}
                width={cardWidth}
                height={cardHeight}
                rx={12}
                fill={theme === "dark" ? "#1e293b" : "#ffffff"}
                stroke={isHovered ? statusColor : theme === "dark" ? "#334155" : "#e2e8f0"}
                strokeWidth={isHovered ? 2 : 1}
                style={{
                  filter: isHovered ? "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" : "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
                  transition: "all 0.2s ease",
                }}
              />

              {/* Status indicator bar */}
              <rect
                x={x}
                y={y}
                width={cardWidth}
                height={4}
                rx={12}
                fill={statusColor}
                opacity={0.8}
              />

              {/* Stage label */}
              <text
                x={stage.x}
                y={y + 26}
                textAnchor="middle"
                fontSize={14}
                fontWeight={600}
                fill={theme === "dark" ? "#f1f5f9" : "#0f172a"}
                letterSpacing={-0.2}
              >
                {stage.label}
              </text>

              {/* Bottleneck badge */}
              {isBottleneck && (
                <>
                  <rect
                    x={x + 8}
                    y={y + 34}
                    width={80}
                    height={18}
                    rx={4}
                    fill="#f59e0b"
                    opacity={0.2}
                  />
                  <text
                    x={x + 48}
                    y={y + 46}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fill="#f59e0b"
                    letterSpacing={0.5}
                  >
                    BOTTLENECK
                  </text>
                </>
              )}

              {/* Metrics */}
              {stage.metrics && (
                <g>
                  {/* Throughput */}
                  {stage.metrics.throughput !== undefined && (
                    <>
                      <text
                        x={x + 12}
                        y={y + (isBottleneck ? 68 : 52)}
                        fontSize={10}
                        fill={theme === "dark" ? "#94a3b8" : "#64748b"}
                        fontWeight={500}
                      >
                        Throughput
                      </text>
                      <text
                        x={x + cardWidth - 12}
                        y={y + (isBottleneck ? 68 : 52)}
                        textAnchor="end"
                        fontSize={15}
                        fontWeight={700}
                        fill={theme === "dark" ? "#f1f5f9" : "#0f172a"}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatMetric(stage.metrics.throughput, "/s")}
                      </text>
                      {/* Trend arrow */}
                      {stage.metrics.throughputTrend && stage.metrics.throughputTrend !== "stable" && (
                        <text
                          x={x + cardWidth - 12}
                          y={y + (isBottleneck ? 68 : 52)}
                          textAnchor="end"
                          fontSize={12}
                          fill={stage.metrics.throughputTrend === "up" ? "#10b981" : "#ef4444"}
                          dx={-50}
                        >
                          {stage.metrics.throughputTrend === "up" ? "↑" : "↓"}
                        </text>
                      )}
                    </>
                  )}

                  {/* Latency */}
                  {stage.metrics.latency !== undefined && (
                    <>
                      <text
                        x={x + 12}
                        y={y + (isBottleneck ? 88 : 72)}
                        fontSize={10}
                        fill={theme === "dark" ? "#94a3b8" : "#64748b"}
                        fontWeight={500}
                      >
                        Latency
                      </text>
                      <text
                        x={x + cardWidth - 12}
                        y={y + (isBottleneck ? 88 : 72)}
                        textAnchor="end"
                        fontSize={15}
                        fontWeight={700}
                        fill={stage.metrics.latency > 100 ? "#f59e0b" : theme === "dark" ? "#f1f5f9" : "#0f172a"}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {stage.metrics.latency.toFixed(0)}ms
                      </text>
                      {stage.metrics.latencyTrend && stage.metrics.latencyTrend !== "stable" && (
                        <text
                          x={x + cardWidth - 12}
                          y={y + (isBottleneck ? 88 : 72)}
                          textAnchor="end"
                          fontSize={12}
                          fill={stage.metrics.latencyTrend === "down" ? "#10b981" : "#ef4444"}
                          dx={-42}
                        >
                          {stage.metrics.latencyTrend === "up" ? "↑" : "↓"}
                        </text>
                      )}
                    </>
                  )}

                  {/* Error Rate */}
                  {stage.metrics.errorRate !== undefined && stage.metrics.errorRate > 0 && (
                    <>
                      <text
                        x={x + 12}
                        y={y + (isBottleneck ? 108 : 92)}
                        fontSize={10}
                        fill={theme === "dark" ? "#94a3b8" : "#64748b"}
                        fontWeight={500}
                      >
                        Error Rate
                      </text>
                      <text
                        x={x + cardWidth - 12}
                        y={y + (isBottleneck ? 108 : 92)}
                        textAnchor="end"
                        fontSize={15}
                        fontWeight={700}
                        fill="#ef4444"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {(stage.metrics.errorRate * 100).toFixed(1)}%
                      </text>
                    </>
                  )}

                  {/* Queue Depth */}
                  {stage.metrics.queueDepth !== undefined && stage.metrics.queueDepth > 0 && (
                    <>
                      <text
                        x={x + 12}
                        y={y + (isBottleneck ? 128 : 112)}
                        fontSize={10}
                        fill={theme === "dark" ? "#94a3b8" : "#64748b"}
                        fontWeight={500}
                      >
                        Queue
                      </text>
                      <text
                        x={x + cardWidth - 12}
                        y={y + (isBottleneck ? 128 : 112)}
                        textAnchor="end"
                        fontSize={15}
                        fontWeight={700}
                        fill={stage.metrics.queueDepth > 1000 ? "#f59e0b" : theme === "dark" ? "#f1f5f9" : "#0f172a"}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatMetric(stage.metrics.queueDepth, "")}
                      </text>
                    </>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  }
);

DataflowVisualizerStages.displayName = "DataflowVisualizer.Stages";

// ============================================================================
// Container Component
// ============================================================================

const DataflowVisualizerContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, children, ...props }, ref) => {
    const { width, height } = useDataflowVisualizer();

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden rounded-xl", className)}
        style={{ width, height, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DataflowVisualizerContainer.displayName = "DataflowVisualizer.Container";

// ============================================================================
// Exports
// ============================================================================

export const DataflowVisualizer = Object.assign(DataflowVisualizerRoot, {
  Root: DataflowVisualizerRoot,
  Container: DataflowVisualizerContainer,
  Canvas: DataflowVisualizerCanvas,
  Connections: DataflowVisualizerConnections,
  Stages: DataflowVisualizerStages,
});
