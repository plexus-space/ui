"use client";

/**
 * Simple Auto Dashboard Example
 *
 * This example shows the minimal code needed to create a live dashboard
 * from natural language query + data source.
 *
 * Usage:
 * 1. User types query in plain English
 * 2. System detects intent (vibration, EEG, aerospace, etc.)
 * 3. Auto-generates appropriate dashboard layout
 * 4. Connects to data source and streams live
 * 5. Executes alerts automatically
 */

import { useState } from "react";
import { AutoDashboard } from "@plexusui/components/lib/auto-dashboard";
import type { ConnectorConfig } from "@plexusui/components/lib/data-connectors";
import { ComponentPreview } from "@/components/component-preview";

export function AutoDashboardSimpleExample() {
  const [query, setQuery] = useState(
    "Show me bearing fault frequencies for a 1800 RPM motor"
  );
  const [isActive, setIsActive] = useState(false);

  // Configure data source
  const dataSource: ConnectorConfig = {
    type: "polling",
    url: "/api/simulate-vibration",
    interval: 500, // Poll every 500ms
  };

  return (
    <ComponentPreview
      title="Auto Dashboard - Simple Example"
      description="Type a query in natural language, get a live dashboard instantly"
      code={`import { AutoDashboard } from "@plexusui/components/lib/auto-dashboard";

// 1. Configure your data source
const dataSource = {
  type: "websocket",  // or "serial", "polling"
  url: "ws://your-sensor.com/stream"
};

// 2. That's it! The dashboard auto-generates
<AutoDashboard
  query="Show me bearing fault frequencies for 1800 RPM motor"
  dataSource={dataSource}
  onAlert={(alert) => console.log("Alert:", alert)}
/>`}
      preview={
        <div className="w-full space-y-4">
          {/* Query Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Natural Language Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Monitor bearing health at 1800 RPM"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-background resize-none"
            />
          </div>

          {/* Start/Stop Controls */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                isActive
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              }`}
            >
              {isActive ? "Stop Dashboard" : "Start Dashboard"}
            </button>

            {!isActive && (
              <div className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-md flex items-center">
                Click "Start Dashboard" to begin streaming
              </div>
            )}
          </div>

          {/* Auto-Generated Dashboard */}
          {isActive && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              <AutoDashboard
                query={query}
                dataSource={dataSource}
                onAlert={(alert) => {
                  console.log("Alert triggered:", alert);
                }}
                width={850}
                height={650}
                showStatus={true}
                showAlerts={true}
                showRecommendations={true}
                enableAlerts={true}
                maxDataPoints={500}
              />
            </div>
          )}
        </div>
      }
    />
  );
}
