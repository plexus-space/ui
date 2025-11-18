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
  | "rate_of_change" // PRO: Derivative analysis
  | "correlation" // PRO: Multi-metric correlation
  | "statistical_anomaly" // PRO: Z-score, moving average deviation
  | "pattern_match"; // PRO: Sequence detection

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
  timeWindow?: number; // PRO: Evaluate over X ms
  correlatedMetrics?: string[]; // PRO: Check multiple sensors
  customLogic?: string; // PRO: JavaScript expression
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
// Engine State Types
// ============================================================================

export interface EngineState {
  readonly rules: ReadonlyMap<string, Rule>;
  readonly lastAlertTimes: ReadonlyMap<string, number>;
}

export interface AdvancedEngineState extends EngineState {
  readonly historicalData: ReadonlyMap<string, readonly DataPoint[]>;
  readonly maxHistorySize: number;
}

// ============================================================================
// Statistical Utilities
// ============================================================================

const calculateStatistics = (
  values: readonly number[]
): { mean: number; stdDev: number } => {
  const sampleSize = values.length;
  const mean = values.reduce((sum, val) => sum + val, 0) / sampleSize;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sampleSize;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
};

// ============================================================================
// FREE TIER: Simple Rules Engine - Functional API
// ============================================================================

export const createEngine = (): EngineState => ({
  rules: new Map(),
  lastAlertTimes: new Map(),
});

export const addRule = (state: EngineState, rule: Rule): EngineState => {
  const newRules = new Map(state.rules);
  newRules.set(rule.id, rule);

  return {
    ...state,
    rules: newRules,
  };
};

export const removeRule = (state: EngineState, ruleId: string): EngineState => {
  const newRules = new Map(state.rules);
  newRules.delete(ruleId);

  return {
    ...state,
    rules: newRules,
  };
};

export const getRule = (state: EngineState, ruleId: string): Rule | undefined =>
  state.rules.get(ruleId);

export const getAllRules = (state: EngineState): Rule[] =>
  Array.from(state.rules.values());

const evaluateSimpleCondition = (
  rule: Rule,
  value: number
): { triggered: boolean; message: string } => {
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

  return { triggered, message };
};

export const evaluate = (
  state: EngineState,
  data: DataPoint
): { state: EngineState; evaluations: readonly RuleEvaluation[] } => {
  const evaluations: RuleEvaluation[] = [];
  const now = Date.now();
  const newLastAlertTimes = new Map(state.lastAlertTimes);

  for (const rule of state.rules.values()) {
    if (!rule.enabled) continue;

    // Check cooldown
    const lastAlert = state.lastAlertTimes.get(rule.id) || 0;
    if (rule.cooldown && now - lastAlert < rule.cooldown) {
      continue;
    }

    const value = Array.isArray(data.value) ? data.value[0] : data.value;
    const { triggered, message } = evaluateSimpleCondition(rule, value);

    if (triggered) {
      newLastAlertTimes.set(rule.id, now);
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

  return {
    state: {
      ...state,
      lastAlertTimes: newLastAlertTimes,
    },
    evaluations,
  };
};

// ============================================================================
// PRO TIER: Advanced Rules Engine - Functional API
// ============================================================================

export const createAdvancedEngine = (): AdvancedEngineState => ({
  rules: new Map(),
  lastAlertTimes: new Map(),
  historicalData: new Map(),
  maxHistorySize: 60_000, // 10 minutes at 100Hz
});

export const addDataPoint = (
  state: AdvancedEngineState,
  metricId: string,
  data: DataPoint
): AdvancedEngineState => {
  const currentHistory = state.historicalData.get(metricId) || [];
  const newHistory = [...currentHistory, data];

  const trimmedHistory = newHistory.length > state.maxHistorySize
    ? newHistory.slice(-state.maxHistorySize)
    : newHistory;

  const newHistoricalData = new Map(state.historicalData);
  newHistoricalData.set(metricId, trimmedHistory);

  return {
    ...state,
    historicalData: newHistoricalData,
  };
};

// PRO: Evaluate rate of change
const evaluateRateOfChange = (
  rule: Rule,
  currentValue: number,
  history: readonly DataPoint[]
): RuleEvaluation | null => {
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
};

// PRO: Statistical anomaly detection (Z-score)
const evaluateStatisticalAnomaly = (
  rule: Rule,
  currentValue: number,
  history: readonly DataPoint[]
): RuleEvaluation | null => {
  if (history.length < 30) return null; // Need at least 30 samples

  const timeWindow = rule.timeWindow || 60000; // Default 1 minute
  const windowData = history.filter(
    (p) => Date.now() - p.timestamp < timeWindow
  );

  const values = windowData.map((p) =>
    Array.isArray(p.value) ? p.value[0] : p.value
  );

  // Calculate mean and standard deviation
  const { mean, stdDev } = calculateStatistics(values);

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
};

export const evaluateAdvanced = (
  state: AdvancedEngineState,
  data: DataPoint,
  metricId = "default"
): { state: AdvancedEngineState; evaluations: readonly RuleEvaluation[] } => {
  // Store data for PRO analysis
  const stateWithData = addDataPoint(state, metricId, data);

  // Evaluate basic rules
  const { state: basicState, evaluations: basicEvaluations } = evaluate(
    stateWithData,
    data
  );

  // Add PRO evaluations
  const currentValue = Array.isArray(data.value) ? data.value[0] : data.value;
  const proEvaluations: RuleEvaluation[] = [];

  const history = stateWithData.historicalData.get(metricId) || [];

  for (const rule of basicState.rules.values()) {
    if (!rule.enabled) continue;

    switch (rule.condition) {
      case "rate_of_change": {
        const eval_ = evaluateRateOfChange(rule, currentValue, history);
        if (eval_) proEvaluations.push(eval_);
        break;
      }

      case "statistical_anomaly": {
        const eval_ = evaluateStatisticalAnomaly(rule, currentValue, history);
        if (eval_) proEvaluations.push(eval_);
        break;
      }

      // TODO: Implement correlation, pattern_match, custom_logic
      // These would be complex PRO features
    }
  }

  return {
    state: {
      ...basicState,
      historicalData: stateWithData.historicalData,
      maxHistorySize: stateWithData.maxHistorySize,
    },
    evaluations: [...basicEvaluations, ...proEvaluations],
  };
};

// ============================================================================
// Rule Builder Helpers (FREE)
// ============================================================================

const generateRuleId = (): string =>
  `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const createThresholdRule = (
  name: string,
  condition: "greater_than" | "less_than",
  threshold: number,
  severity: RuleSeverity = "warning"
): Rule => ({
  id: generateRuleId(),
  name,
  condition,
  threshold,
  severity,
  enabled: true,
  cooldown: 5000, // 5 seconds
});

export const createRangeRule = (
  name: string,
  min: number,
  max: number,
  severity: RuleSeverity = "warning"
): Rule => ({
  id: generateRuleId(),
  name,
  condition: "outside_range",
  threshold: min,
  threshold2: max,
  severity,
  enabled: true,
  cooldown: 5000,
});

// PRO: Create advanced rules
export const createRateOfChangeRule = (
  name: string,
  maxRatePerSecond: number,
  timeWindow = 1000,
  severity: RuleSeverity = "critical"
): Rule => ({
  id: generateRuleId(),
  name,
  condition: "rate_of_change",
  threshold: maxRatePerSecond,
  severity,
  enabled: true,
  cooldown: 5000,
  timeWindow,
});

export const createAnomalyRule = (
  name: string,
  zScoreThreshold = 3,
  timeWindow = 60000,
  severity: RuleSeverity = "warning"
): Rule => ({
  id: generateRuleId(),
  name,
  condition: "statistical_anomaly",
  threshold: zScoreThreshold,
  severity,
  enabled: true,
  cooldown: 10000,
  timeWindow,
});
