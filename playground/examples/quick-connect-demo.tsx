"use client";

import { useState, useEffect } from "react";
import {
  detectIntent,
  QUERY_EXAMPLES,
  type QueryIntent,
} from "@plexusui/components/lib/ai-query";
import {
  AutoDashboard,
  type AlertEvent,
} from "@plexusui/components/lib/auto-dashboard";
import type { ConnectorConfig } from "@plexusui/components/lib/data-connectors";
import { ComponentPreview } from "@/components/component-preview";

// ============================================================================
// Quick Connect Demo
// ============================================================================

function QuickConnectDemo() {
  const [isMounted, setIsMounted] = useState(false);

  // Step management
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [connectionType, setConnectionType] = useState<
    "websocket" | "serial" | "polling"
  >("websocket");
  const [connectionUrl, setConnectionUrl] = useState(
    "wss://demo.plexusui.com/vibration"
  );

  // NL Query
  const [query, setQuery] = useState(
    "Show me bearing fault frequencies for a 1800 RPM motor"
  );
  const [intent, setIntent] = useState<QueryIntent | null>(null);

  // Dashboard state
  const [dataSourceConfig, setDataSourceConfig] =
    useState<ConnectorConfig | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [useSimulation, setUseSimulation] = useState(true); // Toggle for demo mode

  // Wait for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Parse query
  useEffect(() => {
    if (query.trim()) {
      const parsedIntent = detectIntent(query);
      setIntent(parsedIntent);
    }
  }, [query]);

  // Step 1 → Step 2: Connect
  const handleConnect = () => {
    setStep(2);
  };

  // Step 2 → Step 3: Generate Dashboard
  const handleGenerate = () => {
    if (intent) {
      // Configure data source
      const config: ConnectorConfig = useSimulation
        ? {
            type: "polling",
            url: "/api/simulate-vibration", // Will create simulation endpoint
            interval: 500,
          }
        : {
            type: connectionType,
            url: connectionUrl,
          };

      setDataSourceConfig(config);
      setStep(3);
    }
  };

  const handleAlert = (alert: AlertEvent) => {
    setAlerts((prev) => [...prev, alert].slice(-5)); // Keep last 5 alerts
  };

  return (
    <ComponentPreview
      title="Quick Connect - Real-Time Streaming in 3 Clicks"
      description="Connect to any data source, use natural language to configure analysis, and get a live dashboard instantly."
      code={`import { createConnector } from "@/lib/data-connectors";
import { detectIntent, generateDashboard } from "@/lib/ai-query";

// STEP 1: Connect (1 click)
const connector = createConnector({
  type: "websocket",
  url: "wss://your-sensor.com/stream"
});
await connector.connect();

// STEP 2: Natural Language Query (1 click)
const query = "Show me bearing fault frequencies for a 1800 RPM motor";
const intent = detectIntent(query);
// Detected: domain=vibration, action=dashboard, rpm=1800

// STEP 3: Auto-generated Dashboard (1 click)
const dashboard = generateDashboard(intent);
// ✓ Live dashboard with WaterfallChart, ControlChart, Gauge`}
      preview={
        <div className="w-full space-y-6">
          {/* Progress */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded ${
                  s <= step
                    ? "bg-zinc-900 dark:bg-zinc-100"
                    : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Step {step} of 3:{" "}
            {step === 1
              ? "Connect"
              : step === 2
              ? "Configure"
              : "Live Dashboard"}
          </div>

          {/* Step 1: Connect */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-sm font-medium">Choose your data source</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: "websocket", label: "WebSocket", desc: "Real-time" },
                  { type: "serial", label: "Serial (USB)", desc: "Hardware" },
                  { type: "polling", label: "HTTP Polling", desc: "REST API" },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() =>
                      setConnectionType(
                        opt.type as "websocket" | "serial" | "polling"
                      )
                    }
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      connectionType === opt.type
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>

              {connectionType === "websocket" && (
                <div className="space-y-2">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    WebSocket URL
                  </div>
                  <input
                    type="text"
                    value={connectionUrl}
                    onChange={(e) => setConnectionUrl(e.target.value)}
                    placeholder="wss://your-sensor.com/stream"
                    className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-background"
                  />
                </div>
              )}

              {connectionType === "serial" && (
                <div className="space-y-2">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Serial Port (Will prompt for device selection)
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500">
                    Click "Connect" to select your USB device (Arduino, ESP32, etc.)
                  </div>
                </div>
              )}

              {connectionType === "polling" && (
                <div className="space-y-2">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    HTTP Endpoint URL
                  </div>
                  <input
                    type="text"
                    value={connectionUrl}
                    onChange={(e) => setConnectionUrl(e.target.value)}
                    placeholder="https://api.example.com/sensor/data"
                    className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-background"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={useSimulation}
                  onChange={(e) => setUseSimulation(e.target.checked)}
                  className="w-3 h-3"
                />
                <span>Use simulated data (for demo purposes)</span>
              </label>

              <button
                type="button"
                onClick={handleConnect}
                className="px-4 py-2 text-sm rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Connect →
              </button>
            </div>
          )}

          {/* Step 2: Natural Language Query */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-sm font-medium">
                What do you want to analyze?
              </div>

              <div className="space-y-2">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Ask in plain English
                </div>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Show me bearing fault frequencies for a 1800 RPM motor"
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-background resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Or try these:
                </div>
                <div className="space-y-2">
                  {QUERY_EXAMPLES.vibration.slice(0, 3).map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuery(example)}
                      className="w-full text-left px-3 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {intent && (
                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1">
                  <div className="text-xs font-medium">AI Understanding</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                    Domain: {intent.domain} | Action: {intent.action}
                    {(intent.parameters.rpm as number) &&
                      ` | RPM: ${intent.parameters.rpm}`}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Confidence: {(intent.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!intent}
                className="px-4 py-2 text-sm rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Dashboard →
              </button>
            </div>
          )}

          {/* Step 3: Live Auto-Generated Dashboard */}
          {step === 3 && dataSourceConfig && isMounted && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    Auto-Generated Dashboard
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Query: "{query}"
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setDataSourceConfig(null);
                    setAlerts([]);
                  }}
                  className="px-3 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* The Magic: Auto Dashboard */}
              <AutoDashboard
                query={query}
                dataSource={dataSourceConfig}
                onAlert={handleAlert}
                width={850}
                height={650}
                showStatus={true}
                showAlerts={true}
                showRecommendations={true}
                enableAlerts={true}
                maxDataPoints={1000}
              />

              {/* Recent Alerts Summary */}
              {alerts.length > 0 && (
                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <div className="text-xs font-medium mb-2">
                    Recent Alerts ({alerts.length})
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Last alert: {new Date(alerts[alerts.length - 1].timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      }
    />
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function QuickConnectDemoExamples() {
  return (
    <div className="space-y-8">
      <QuickConnectDemo />
    </div>
  );
}
