"use client";

/**
 * Intelligence Layer Demo
 * Shows Free vs Paid features side-by-side
 */

import { useState, useEffect } from "react";
import { ComponentPreview } from "@/components/component-preview";
import {
  SimpleRulesEngine,
  createThresholdRule,
  createRangeRule,
  createRateOfChangeRule,
  createAnomalyRule,
  type Rule,
} from "@plexusui/components/lib/rules-engine";
import {
  StatisticalAnomalyDetector,
  type Anomaly,
} from "@plexusui/components/lib/anomaly-detection";
import {
  BasicRootCauseAnalyzer,
  type RootCause,
} from "@plexusui/components/lib/root-cause-analysis";
import type { DataPoint } from "@plexusui/components/lib/data-connectors";

export function IntelligenceDemoExample() {
  const [ruleEngine] = useState(() => new SimpleRulesEngine());
  const [anomalyDetector] = useState(() => new StatisticalAnomalyDetector());
  const [rcaAnalyzer] = useState(() => new BasicRootCauseAnalyzer());

  const [currentValue, setCurrentValue] = useState(50);
  const [triggeredRules, setTriggeredRules] = useState<string[]>([]);
  const [detectedAnomalies, setDetectedAnomalies] = useState<Anomaly[]>([]);
  const [rootCause, setRootCause] = useState<RootCause | null>(null);

  // Setup rules on mount
  useEffect(() => {
    // FREE: Simple threshold
    ruleEngine.addRule(
      createThresholdRule("High Value Alert", "greater_than", 80, "warning")
    );

    // FREE: Range check
    ruleEngine.addRule(
      createRangeRule("Optimal Range", 40, 60, "info")
    );

    // PRO: Rate of change (shows upgrade message)
    ruleEngine.addRule(
      createRateOfChangeRule("Rapid Change Detection", 10, 1000, "critical")
    );

    // PRO: Anomaly detection rule (shows upgrade message)
    ruleEngine.addRule(
      createAnomalyRule("Statistical Anomaly", 3, 60000, "warning")
    );
  }, [ruleEngine]);

  // Simulate data stream
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate semi-realistic data with occasional anomalies
      let newValue = currentValue + (Math.random() - 0.5) * 10;

      // Inject spike anomaly occasionally
      if (Math.random() < 0.05) {
        newValue += 30; // Spike!
      }

      newValue = Math.max(0, Math.min(100, newValue)); // Clamp to 0-100
      setCurrentValue(newValue);

      const dataPoint: DataPoint = {
        timestamp: Date.now(),
        value: newValue,
      };

      // 1. Evaluate rules (FREE)
      const ruleEvaluations = ruleEngine.evaluate(dataPoint);
      if (ruleEvaluations.length > 0) {
        setTriggeredRules(ruleEvaluations.map((r) => r.message));
      }

      // 2. Detect anomalies (FREE)
      const anomalies = anomalyDetector.detect(dataPoint);
      if (anomalies.length > 0) {
        setDetectedAnomalies((prev) => [...anomalies, ...prev].slice(0, 5));

        // 3. Perform root cause analysis (FREE)
        const rca = rcaAnalyzer.analyze(anomalies[0], {
          metricId: "demo_sensor",
          domain: "general",
        });
        setRootCause(rca);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentValue, ruleEngine, anomalyDetector, rcaAnalyzer]);

  return (
    <ComponentPreview
      title="Intelligence Layer Demo - Free vs Paid"
      description="See how rules engine, anomaly detection, and root cause analysis work"
      code={`import {
  SimpleRulesEngine,
  StatisticalAnomalyDetector,
  BasicRootCauseAnalyzer
} from "@plexusui/components/lib/...";

// FREE: Simple rules
const engine = new SimpleRulesEngine();
engine.addRule(createThresholdRule("High", "greater_than", 80));

// FREE: Statistical anomaly detection
const detector = new StatisticalAnomalyDetector();
const anomalies = detector.detect(dataPoint);

// FREE: Basic root cause analysis
const analyzer = new BasicRootCauseAnalyzer();
const rootCause = analyzer.analyze(anomaly, { metricId: "sensor1" });

// PRO: Advanced features (requires upgrade)
// - Rate of change detection
// - ML-based anomaly detection (LSTM)
// - Causal graph inference
// - Historical incident matching
// - AI-generated explanations`}
      preview={
        <div className="w-full space-y-4">
          {/* Current Value Display */}
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <div className="text-sm font-medium mb-2">Live Sensor Value</div>
            <div className="text-4xl font-bold">{currentValue.toFixed(1)}</div>
            <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Simulating real-time data stream (updates every second)
            </div>
          </div>

          {/* Rules Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Rules Engine</div>
              <div className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                FREE
              </div>
            </div>

            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Active Rules: {ruleEngine.getAllRules().length}
              </div>

              {ruleEngine.getAllRules().map((rule: Rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900"
                >
                  <span>{rule.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      rule.condition.includes("rate_of_change") ||
                      rule.condition.includes("anomaly")
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                        : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    }`}
                  >
                    {rule.condition.includes("rate_of_change") ||
                    rule.condition.includes("anomaly")
                      ? "PRO"
                      : "FREE"}
                  </span>
                </div>
              ))}

              {triggeredRules.length > 0 && (
                <div className="mt-2 p-2 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-xs font-medium mb-1">
                    Recent Alerts:
                  </div>
                  {triggeredRules.slice(0, 3).map((msg, idx) => (
                    <div key={idx} className="text-xs text-yellow-700 dark:text-yellow-300">
                      • {msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Anomaly Detection Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Anomaly Detection</div>
              <div className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                FREE (Statistical)
              </div>
            </div>

            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Detection Methods: Z-score, Drift, Flatline
              </div>

              {detectedAnomalies.length > 0 ? (
                <div className="space-y-2">
                  {detectedAnomalies.slice(0, 3).map((anomaly, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium capitalize">
                          {anomaly.type}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            anomaly.severity === "high"
                              ? "bg-red-600 text-white"
                              : anomaly.severity === "medium"
                              ? "bg-orange-500 text-white"
                              : "bg-yellow-500 text-white"
                          }`}
                        >
                          {anomaly.severity}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        {anomaly.message}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                        Confidence: {(anomaly.score * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-zinc-500 dark:text-zinc-500 text-center py-4">
                  No anomalies detected (waiting for sufficient data...)
                </div>
              )}

              <div className="mt-2 p-2 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>PRO Feature:</strong> ML-based detection (LSTM
                  forecasting, Isolation Forest) available with upgrade
                </div>
              </div>
            </div>
          </div>

          {/* Root Cause Analysis Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Root Cause Analysis</div>
              <div className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                FREE (Basic)
              </div>
            </div>

            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
              {rootCause ? (
                <div className="space-y-2">
                  <div className="p-2 rounded bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                    <div className="text-xs font-medium mb-1">
                      Primary Cause:
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">
                      {rootCause.primary.description}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                      Confidence: {(rootCause.primary.likelihood * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900">
                    <div className="text-xs font-medium mb-1">
                      Recommendation:
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {rootCause.recommendation}
                    </div>
                  </div>

                  {rootCause.evidence.length > 0 && (
                    <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900">
                      <div className="text-xs font-medium mb-1">Evidence:</div>
                      <div className="space-y-1">
                        {rootCause.evidence.map((ev, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-zinc-600 dark:text-zinc-400"
                          >
                            • {ev.description} (strength: {(ev.strength * 100).toFixed(0)}%)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-zinc-500 dark:text-zinc-500 text-center py-4">
                  Waiting for anomaly to trigger root cause analysis...
                </div>
              )}

              <div className="mt-2 p-2 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>PRO Feature:</strong> Advanced RCA with causal
                  graphs, historical matching, and AI explanations
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <div className="text-sm font-medium mb-2">
              Unlock Advanced Intelligence
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
              Upgrade to Pro for:
            </div>
            <ul className="text-xs space-y-1 mb-3">
              <li>✨ ML-based anomaly detection (LSTM, Isolation Forest)</li>
              <li>🔮 Predictive forecasting (24-48 hours ahead)</li>
              <li>🧠 AI-powered root cause explanations</li>
              <li>📊 Historical incident matching</li>
              <li>🔗 Causal graph inference</li>
            </ul>
            <button
              type="button"
              className="w-full px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Upgrade to Pro ($199/month)
            </button>
          </div>
        </div>
      }
    />
  );
}
