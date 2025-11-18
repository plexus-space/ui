"use client";

/**
 * Rules Engine for Alert Generation
 *
 * FREE TIER: Simple threshold-based rules
 * PAID TIER: Complex multi-condition rules, correlations, time-windows
 */

import type { DataPoint } from "./data-connectors";

// ============================================================================
// Types
// ============================================================================

export type RuleCondition =
  | "greater_than"
  | "less_than"
  | "equals"
  | "not_equals"
  | "between"
  | "outside_range"
  | "rate_of_change"          // PRO: Derivative analysis
  | "correlation"             // PRO: Multi-metric correlation
  | "statistical_anomaly"     // PRO: Z-score, moving average deviation
  | "pattern_match";          // PRO: Sequence detection

export type RuleSeverity = "info" | "warning" | "critical";

export interface Rule {
  id: string;
  name: string;
  description?: string;
  condition: RuleCondition;
  threshold?: number;
  threshold2?: number; // For "between" conditions
  severity: RuleSeverity;
  cooldown?: number; // Minimum ms between alerts
  enabled: boolean;

  // PRO FEATURES
  timeWindow?: number;        // PRO: Evaluate over X ms
  correlatedMetrics?: string[]; // PRO: Check multiple sensors
  customLogic?: string;       // PRO: JavaScript expression
}

export interface RuleEvaluation {
  ruleId: string;
  triggered: boolean;
  value: number;
  threshold: number;
  severity: RuleSeverity;
  message: string;
  timestamp: number;
  evidence?: Record<string, unknown>; // PRO: Root cause data
}

// ============================================================================
// FREE TIER: Simple Rules Engine
// ============================================================================

export class SimpleRulesEngine {
  private rules: Map<string, Rule> = new Map();
  private lastAlertTimes: Map<string, number> = new Map();

  addRule(rule: Rule) {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string) {
    this.rules.delete(ruleId);
  }

  getRule(ruleId: string): Rule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  evaluate(data: DataPoint): RuleEvaluation[] {
    const evaluations: RuleEvaluation[] = [];
    const now = Date.now();

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      // Check cooldown
      const lastAlert = this.lastAlertTimes.get(rule.id) || 0;
      if (rule.cooldown && now - lastAlert < rule.cooldown) {
        continue;
      }

      const value = Array.isArray(data.value) ? data.value[0] : data.value;
      let triggered = false;
      let message = "";

      switch (rule.condition) {
        case "greater_than":
          triggered = value > (rule.threshold || 0);
          message = `${rule.name}: ${value.toFixed(2)} exceeds ${rule.threshold}`;
          break;

        case "less_than":
          triggered = value < (rule.threshold || 0);
          message = `${rule.name}: ${value.toFixed(2)} below ${rule.threshold}`;
          break;

        case "equals":
          triggered = Math.abs(value - (rule.threshold || 0)) < 0.001;
          message = `${rule.name}: ${value.toFixed(2)} equals ${rule.threshold}`;
          break;

        case "not_equals":
          triggered = Math.abs(value - (rule.threshold || 0)) >= 0.001;
          message = `${rule.name}: ${value.toFixed(2)} not equals ${rule.threshold}`;
          break;

        case "between":
          triggered = value >= (rule.threshold || 0) && value <= (rule.threshold2 || 0);
          message = `${rule.name}: ${value.toFixed(2)} is between ${rule.threshold} and ${rule.threshold2}`;
          break;

        case "outside_range":
          triggered = value < (rule.threshold || 0) || value > (rule.threshold2 || 0);
          message = `${rule.name}: ${value.toFixed(2)} is outside range ${rule.threshold}-${rule.threshold2}`;
          break;

        default:
          // PRO features - return upgrade message
          message = `Rule "${rule.name}" uses PRO feature "${rule.condition}". Upgrade to enable.`;
          break;
      }

      if (triggered) {
        this.lastAlertTimes.set(rule.id, now);
        evaluations.push({
          ruleId: rule.id,
          triggered: true,
          value,
          threshold: rule.threshold || 0,
          severity: rule.severity,
          message,
          timestamp: now,
        });
      }
    }

    return evaluations;
  }
}

// ============================================================================
// PRO TIER: Advanced Rules Engine (Placeholder)
// ============================================================================

/**
 * Advanced Rules Engine - PRO FEATURE
 *
 * Capabilities:
 * - Rate of change detection (dValue/dt)
 * - Multi-metric correlation (if A > X AND B < Y)
 * - Time-window aggregation (average over last 5 minutes)
 * - Statistical anomaly detection (Z-score, moving average)
 * - Pattern matching (sequence detection: [high, low, high] = warning pattern)
 * - Custom JavaScript expressions
 *
 * This would be implemented in the backend/cloud service
 */
export class AdvancedRulesEngine extends SimpleRulesEngine {
  private historicalData: Map<string, DataPoint[]> = new Map();

  // PRO: Store historical data for time-window analysis
  addDataPoint(metricId: string, data: DataPoint) {
    if (!this.historicalData.has(metricId)) {
      this.historicalData.set(metricId, []);
    }
    const history = this.historicalData.get(metricId)!;
    history.push(data);

    // Keep last 10 minutes of data at 100Hz = 60,000 points max
    if (history.length > 60000) {
      history.shift();
    }
  }

  // PRO: Evaluate rate of change
  private evaluateRateOfChange(
    rule: Rule,
    currentValue: number,
    metricId: string
  ): RuleEvaluation | null {
    const history = this.historicalData.get(metricId) || [];
    if (history.length < 2) return null;

    const timeWindow = rule.timeWindow || 1000; // Default 1 second
    const windowData = history.filter(
      (p) => Date.now() - p.timestamp < timeWindow
    );

    if (windowData.length < 2) return null;

    // Calculate derivative (change per second)
    const first = windowData[0];
    const last = windowData[windowData.length - 1];
    const firstValue = Array.isArray(first.value) ? first.value[0] : first.value;
    const lastValue = Array.isArray(last.value) ? last.value[0] : last.value;

    const deltaValue = lastValue - firstValue;
    const deltaTime = (last.timestamp - first.timestamp) / 1000; // seconds
    const rateOfChange = deltaValue / deltaTime;

    const triggered = Math.abs(rateOfChange) > (rule.threshold || 0);

    return triggered
      ? {
          ruleId: rule.id,
          triggered: true,
          value: rateOfChange,
          threshold: rule.threshold || 0,
          severity: rule.severity,
          message: `${rule.name}: Rate of change ${rateOfChange.toFixed(2)}/sec exceeds ${rule.threshold}`,
          timestamp: Date.now(),
          evidence: {
            windowSize: windowData.length,
            timeWindow: timeWindow,
            firstValue,
            lastValue,
          },
        }
      : null;
  }

  // PRO: Statistical anomaly detection (Z-score)
  private evaluateStatisticalAnomaly(
    rule: Rule,
    currentValue: number,
    metricId: string
  ): RuleEvaluation | null {
    const history = this.historicalData.get(metricId) || [];
    if (history.length < 30) return null; // Need at least 30 samples

    const timeWindow = rule.timeWindow || 60000; // Default 1 minute
    const windowData = history.filter(
      (p) => Date.now() - p.timestamp < timeWindow
    );

    const values = windowData.map((p) =>
      Array.isArray(p.value) ? p.value[0] : p.value
    );

    // Calculate mean and standard deviation
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Z-score
    const zScore = Math.abs((currentValue - mean) / stdDev);
    const threshold = rule.threshold || 3; // Default 3-sigma

    const triggered = zScore > threshold;

    return triggered
      ? {
          ruleId: rule.id,
          triggered: true,
          value: zScore,
          threshold: threshold,
          severity: rule.severity,
          message: `${rule.name}: Statistical anomaly detected (Z-score: ${zScore.toFixed(2)})`,
          timestamp: Date.now(),
          evidence: {
            currentValue,
            mean,
            stdDev,
            zScore,
            sampleSize: values.length,
          },
        }
      : null;
  }

  // Override evaluate to handle PRO features
  evaluate(data: DataPoint, metricId = "default"): RuleEvaluation[] {
    // Store for PRO analysis
    this.addDataPoint(metricId, data);

    const evaluations = super.evaluate(data);

    // Add PRO evaluations
    const currentValue = Array.isArray(data.value) ? data.value[0] : data.value;

    for (const rule of this.getAllRules()) {
      if (!rule.enabled) continue;

      switch (rule.condition) {
        case "rate_of_change": {
          const eval_ = this.evaluateRateOfChange(rule, currentValue, metricId);
          if (eval_) evaluations.push(eval_);
          break;
        }

        case "statistical_anomaly": {
          const eval_ = this.evaluateStatisticalAnomaly(
            rule,
            currentValue,
            metricId
          );
          if (eval_) evaluations.push(eval_);
          break;
        }

        // TODO: Implement correlation, pattern_match, custom_logic
        // These would be complex PRO features
      }
    }

    return evaluations;
  }
}

// ============================================================================
// Rule Builder Helpers (FREE)
// ============================================================================

export function createThresholdRule(
  name: string,
  condition: "greater_than" | "less_than",
  threshold: number,
  severity: RuleSeverity = "warning"
): Rule {
  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    condition,
    threshold,
    severity,
    enabled: true,
    cooldown: 5000, // 5 seconds
  };
}

export function createRangeRule(
  name: string,
  min: number,
  max: number,
  severity: RuleSeverity = "warning"
): Rule {
  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    condition: "outside_range",
    threshold: min,
    threshold2: max,
    severity,
    enabled: true,
    cooldown: 5000,
  };
}

// PRO: Create advanced rules
export function createRateOfChangeRule(
  name: string,
  maxRatePerSecond: number,
  timeWindow: number = 1000,
  severity: RuleSeverity = "critical"
): Rule {
  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    condition: "rate_of_change",
    threshold: maxRatePerSecond,
    severity,
    enabled: true,
    cooldown: 5000,
    timeWindow,
  };
}

export function createAnomalyRule(
  name: string,
  zScoreThreshold: number = 3,
  timeWindow: number = 60000,
  severity: RuleSeverity = "warning"
): Rule {
  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    condition: "statistical_anomaly",
    threshold: zScoreThreshold,
    severity,
    enabled: true,
    cooldown: 10000,
    timeWindow,
  };
}
