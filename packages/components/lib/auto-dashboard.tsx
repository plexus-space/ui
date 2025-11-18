"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  detectIntent,
  generateDashboard,
  generateAlertRule,
  getRecommendations,
  type QueryIntent,
} from "./ai-query";
import {
  createConnector,
  type ConnectorConfig,
  type DataPoint,
} from "./data-connectors";
import { WaterfallChart } from "../charts/waterfall-chart";
import { ControlChart, calculateControlLimits } from "../charts/control-chart";
import { LineChart } from "../charts/line-chart";
import { Gauge } from "../charts/gauge";
import { HeatmapChart } from "../charts/heatmap-chart";
import { AttitudeIndicator } from "../charts/attitude-indicator";
import { StatusGrid } from "../charts/status-grid";
import { GanttChart } from "../charts/gantt";
import { ModelViewer } from "../charts/3d-model-viewer";

// ============================================================================
// Types
// ============================================================================

export interface AutoDashboardConfig {
  query: string;
  dataSource: ConnectorConfig;
  onAlert?: (alert: AlertEvent) => void;
  maxDataPoints?: number;
  enableAlerts?: boolean;
}

export interface AlertEvent {
  timestamp: number;
  message: string;
  severity: "info" | "warning" | "critical";
  value: number;
  threshold: number;
  rule: string;
}

export interface DashboardState {
  status: "connecting" | "connected" | "disconnected" | "error";
  intent: QueryIntent | null;
  dataPoints: DataPoint[];
  alerts: AlertEvent[];
  error?: Error;
}

// ============================================================================
// Component Type Mapping
// ============================================================================

const COMPONENT_MAP = {
  WaterfallChart,
  ControlChart,
  LineChart,
  Gauge,
  HeatmapChart,
  AttitudeIndicator,
  StatusGrid,
  Gantt: GanttChart,
  ModelViewer,
} as const;

// ============================================================================
// Alert Execution Engine
// ============================================================================

class AlertEngine {
  private rules: ReturnType<typeof generateAlertRule>[] = [];
  private callback?: (alert: AlertEvent) => void;
  private lastAlertTime = 0;
  private alertCooldown = 5000; // 5 seconds between alerts

  constructor(intent: QueryIntent, callback?: (alert: AlertEvent) => void) {
    this.callback = callback;
    this.rules.push(generateAlertRule(intent));
  }

  evaluate(value: number | number[]): AlertEvent | null {
    const now = Date.now();
    if (now - this.lastAlertTime < this.alertCooldown) {
      return null; // Rate limiting
    }

    for (const rule of this.rules) {
      const numericValue = Array.isArray(value) ? value[0] : value;
      let triggered = false;

      // Parse condition
      if (rule.condition.includes(">")) {
        triggered = numericValue > rule.threshold;
      } else if (rule.condition.includes("<")) {
        triggered = numericValue < rule.threshold;
      }

      if (triggered) {
        const alert: AlertEvent = {
          timestamp: now,
          message: rule.message,
          severity: numericValue > rule.threshold * 1.2 ? "critical" : "warning",
          value: numericValue,
          threshold: rule.threshold,
          rule: rule.condition,
        };

        this.lastAlertTime = now;
        this.callback?.(alert);
        return alert;
      }
    }

    return null;
  }
}

// ============================================================================
// Data Processor - Transforms raw data for different chart types
// ============================================================================

class DataProcessor {
  private rawData: DataPoint[] = [];
  private maxPoints: number;

  constructor(maxPoints = 1000) {
    this.maxPoints = maxPoints;
  }

  addData(point: DataPoint) {
    this.rawData.push(point);
    if (this.rawData.length > this.maxPoints) {
      this.rawData.shift(); // Remove oldest
    }
  }

  getTimeSeriesData(): Array<{ x: number; y: number }> {
    return this.rawData.map((p, i) => ({
      x: i,
      y: Array.isArray(p.value) ? p.value[0] : p.value,
    }));
  }

  getSignalData(): number[] {
    const latest = this.rawData[this.rawData.length - 1];
    if (!latest) return [];
    return Array.isArray(latest.value) ? latest.value : [latest.value];
  }

  getCurrentValue(): number {
    const latest = this.rawData[this.rawData.length - 1];
    if (!latest) return 0;
    return Array.isArray(latest.value) ? latest.value[0] : latest.value;
  }

  getRawData(): DataPoint[] {
    return this.rawData;
  }
}

// ============================================================================
// Auto Dashboard Hook
// ============================================================================

export function useAutoDashboard(config: AutoDashboardConfig) {
  const [state, setState] = useState<DashboardState>({
    status: "connecting",
    intent: null,
    dataPoints: [],
    alerts: [],
  });

  const intent = useMemo(() => detectIntent(config.query), [config.query]);
  const layout = useMemo(() => generateDashboard(intent), [intent]);
  const recommendations = useMemo(() => getRecommendations(intent), [intent]);

  const dataProcessor = useMemo(
    () => new DataProcessor(config.maxDataPoints),
    [config.maxDataPoints]
  );

  const alertEngine = useMemo(
    () =>
      config.enableAlerts !== false
        ? new AlertEngine(intent, (alert) => {
            setState((prev) => ({
              ...prev,
              alerts: [...prev.alerts, alert].slice(-10), // Keep last 10 alerts
            }));
            config.onAlert?.(alert);
          })
        : null,
    [intent, config.enableAlerts, config.onAlert]
  );

  // Create and manage connector
  useEffect(() => {
    const connector = createConnector(config.dataSource);

    connector
      .onStatus((status) => {
        setState((prev) => ({ ...prev, status }));
      })
      .onData((dataPoint) => {
        dataProcessor.addData(dataPoint);

        // Evaluate alerts
        if (alertEngine) {
          alertEngine.evaluate(dataPoint.value);
        }

        // Trigger re-render
        setState((prev) => ({
          ...prev,
          dataPoints: [...dataProcessor.getRawData()],
        }));
      })
      .onError((error) => {
        setState((prev) => ({ ...prev, error, status: "error" }));
      });

    // Connect
    connector.connect().catch((error) => {
      setState((prev) => ({ ...prev, error, status: "error" }));
    });

    return () => {
      connector.disconnect();
    };
  }, [config.dataSource, dataProcessor, alertEngine]);

  return {
    state: {
      ...state,
      intent,
    },
    layout,
    recommendations,
    dataProcessor,
  };
}

// ============================================================================
// Auto Dashboard Component
// ============================================================================

export interface AutoDashboardProps extends AutoDashboardConfig {
  width?: number;
  height?: number;
  showStatus?: boolean;
  showAlerts?: boolean;
  showRecommendations?: boolean;
}

export function AutoDashboard({
  query,
  dataSource,
  onAlert,
  maxDataPoints = 1000,
  enableAlerts = true,
  width = 800,
  height = 600,
  showStatus = true,
  showAlerts = true,
  showRecommendations = false,
}: AutoDashboardProps) {
  const { state, layout, recommendations, dataProcessor } = useAutoDashboard({
    query,
    dataSource,
    onAlert,
    maxDataPoints,
    enableAlerts,
  });

  // Prepare data for different chart types
  const timeSeriesData = useMemo(
    () => dataProcessor.getTimeSeriesData(),
    [state.dataPoints, dataProcessor]
  );

  const signalData = useMemo(
    () => dataProcessor.getSignalData(),
    [state.dataPoints, dataProcessor]
  );

  const currentValue = useMemo(
    () => dataProcessor.getCurrentValue(),
    [state.dataPoints, dataProcessor]
  );

  // Calculate control limits for SPC charts
  const controlLimits = useMemo(() => {
    if (timeSeriesData.length < 10) {
      return { mean: 0, stdDev: 1, uclSigma: 3, warningSigma: 2 };
    }
    return calculateControlLimits(timeSeriesData.map((p) => p.y));
  }, [timeSeriesData]);

  // Render component based on type
  const renderComponent = useCallback(
    (
      componentType: string,
      config: Record<string, unknown>,
      index: number
    ) => {
      const Component = COMPONENT_MAP[componentType as keyof typeof COMPONENT_MAP];
      if (!Component) {
        return (
          <div
            key={index}
            className="p-4 border border-red-500 rounded text-red-500 text-sm"
          >
            Unknown component: {componentType}
          </div>
        );
      }

      const chartWidth = width / 2 - 20;
      const chartHeight = height / 2 - 20;

      // Map component types to appropriate data
      const props: Record<string, unknown> = {
        ...config,
        width: chartWidth,
        height: chartHeight,
        showAxes: true,
        preferWebGPU: true,
      };

      switch (componentType) {
        case "WaterfallChart":
          props.signal = signalData;
          props.sampleRate = config.sampleRate || 2000;
          props.fftSize = config.fftSize || 512;
          props.hopSize = config.hopSize || 256;
          break;

        case "ControlChart":
          props.data = timeSeriesData;
          props.limits = controlLimits;
          props.rules = config.rules || ["rule1", "rule2", "rule3", "rule4"];
          props.showZones = config.showZones ?? true;
          break;

        case "LineChart":
          props.series = [
            {
              name: config.label as string || "Signal",
              data: timeSeriesData,
              color: "#3b82f6",
              strokeWidth: 2,
            },
          ];
          break;

        case "Gauge":
          props.value = currentValue;
          props.zones = config.zones || [
            { from: 0, to: 33, color: "#10b981" },
            { from: 33, to: 66, color: "#f59e0b" },
            { from: 66, to: 100, color: "#ef4444" },
          ];
          break;

        case "HeatmapChart":
          // For heatmap, we need 2D data - placeholder for now
          props.data = [];
          break;

        case "RadarChart":
          // Placeholder - needs specific data structure
          props.data = [];
          break;

        case "AttitudeIndicator":
          props.pitch = currentValue * 0.1; // Scale appropriately
          props.roll = currentValue * 0.05;
          break;

        default:
          break;
      }

      return <Component key={index} {...props} />;
    },
    [
      signalData,
      timeSeriesData,
      currentValue,
      controlLimits,
      width,
      height,
    ]
  );

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      {showStatus && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                state.status === "connected"
                  ? "bg-green-500 animate-pulse"
                  : state.status === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
            <div className="text-sm">
              <span className="font-medium">Status: </span>
              <span className="capitalize">{state.status}</span>
            </div>
          </div>

          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">Domain: </span>
            {state.intent?.domain || "general"}
            <span className="mx-2">|</span>
            <span className="font-medium">Action: </span>
            {state.intent?.action || "analyze"}
            <span className="mx-2">|</span>
            <span className="font-medium">Data Points: </span>
            {state.dataPoints.length}
          </div>
        </div>
      )}

      {/* Alerts */}
      {showAlerts && state.alerts.length > 0 && (
        <div className="space-y-2">
          {state.alerts.slice(-3).map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                alert.severity === "critical"
                  ? "border-red-500 bg-red-50 dark:bg-red-950"
                  : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">{alert.message}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Value: {alert.value.toFixed(2)} | Threshold:{" "}
                    {alert.threshold.toFixed(2)}
                  </div>
                </div>
                <div className="text-xs text-zinc-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="text-sm font-medium">AI Recommendations</div>
          <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <li key={idx}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="p-3 rounded-lg border border-red-500 bg-red-50 dark:bg-red-950">
          <div className="text-sm font-medium text-red-600 dark:text-red-400">
            Connection Error
          </div>
          <div className="text-xs text-red-500 dark:text-red-500">
            {state.error.message}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-2 gap-4">
        {layout.components.map((component, index) =>
          renderComponent(component.type, component.config, index)
        )}
      </div>

      {/* Empty State */}
      {state.dataPoints.length === 0 && state.status === "connected" && (
        <div className="p-8 text-center text-sm text-zinc-600 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
          Waiting for data...
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Simplified API for Quick Usage
// ============================================================================

export function createAutoDashboard(config: AutoDashboardConfig) {
  return function GeneratedDashboard(props: Partial<AutoDashboardProps>) {
    return <AutoDashboard {...config} {...props} />;
  };
}
