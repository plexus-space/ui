"use client";

/**
 * Anomaly Detection System
 *
 * FREE TIER: Statistical anomalies (Z-score, simple thresholds)
 * PAID TIER: ML-based pattern learning, forecasting, multi-variate analysis
 */

import type { DataPoint } from "./data-connectors";

// ============================================================================
// Type Definitions - Discriminated Unions for Type Safety
// ============================================================================

const ANOMALY_TYPES = [
  "spike",
  "drift",
  "oscillation",
  "flatline",
  "pattern_break",
  "multi_variate",
] as const;

export type AnomalyType = (typeof ANOMALY_TYPES)[number];

const SEVERITY_LEVELS = ["low", "medium", "high"] as const;
export type Severity = (typeof SEVERITY_LEVELS)[number];

// Base anomaly interface
interface BaseAnomaly {
  readonly type: AnomalyType;
  readonly timestamp: number;
  readonly severity: Severity;
  readonly score: number; // 0-1 confidence
  readonly value: number;
  readonly expectedValue?: number;
  readonly message: string;
}

// Specific evidence types for each anomaly type
interface SpikeEvidence {
  readonly method: "Z-score";
  readonly baseline: number;
  readonly deviation: number;
  readonly zScore: number;
  readonly sampleSize: number;
}

interface DriftEvidence {
  readonly method: "Mean comparison";
  readonly baseline: number;
  readonly deviation: number;
  readonly meanDrift: number;
  readonly windowSize: number;
}

interface FlatlineEvidence {
  readonly method: "Variance check";
  readonly baseline: number;
  readonly deviation: number;
  readonly variance: number;
  readonly windowSize: number;
}

interface PatternBreakEvidence {
  readonly method: "LSTM forecast";
  readonly note: string;
}

interface MultiVariateEvidence {
  readonly method: "Isolation Forest";
  readonly sensors: readonly string[];
  readonly note: string;
}

// Discriminated union for type-safe anomalies
export type Anomaly =
  | (BaseAnomaly & { type: "spike"; evidence: SpikeEvidence })
  | (BaseAnomaly & { type: "drift"; evidence: DriftEvidence })
  | (BaseAnomaly & { type: "flatline"; evidence: FlatlineEvidence })
  | (BaseAnomaly & {
      type: "pattern_break";
      evidence: PatternBreakEvidence;
    })
  | (BaseAnomaly & {
      type: "multi_variate";
      evidence: MultiVariateEvidence;
    })
  | (BaseAnomaly & {
      type: "oscillation";
      evidence: { method: string; context?: Record<string, unknown> };
    });

// ============================================================================
// Configuration with Proper Defaults
// ============================================================================

interface DetectorConfigBase {
  readonly spikeThreshold: number;
  readonly driftWindowSize: number;
  readonly flatlineThreshold: number;
}

interface MLDetectorConfig extends DetectorConfigBase {
  readonly enableMLDetection: boolean;
  readonly trainingPeriod: number;
  readonly forecastHorizon: number;
}

export type AnomalyDetectorConfig = Partial<DetectorConfigBase>;
export type MLAnomalyDetectorConfig = Partial<MLDetectorConfig>;

const DEFAULT_CONFIG = {
  spikeThreshold: 3,
  driftWindowSize: 100,
  flatlineThreshold: 0.01,
} as const satisfies DetectorConfigBase;

const DEFAULT_ML_CONFIG = {
  ...DEFAULT_CONFIG,
  enableMLDetection: false,
  trainingPeriod: 300_000, // 5 minutes
  forecastHorizon: 10,
} as const satisfies MLDetectorConfig;

// ============================================================================
// Statistical Utility Functions - Pure & Composable
// ============================================================================

interface StatisticalSummary {
  readonly mean: number;
  readonly variance: number;
  readonly stdDev: number;
  readonly sampleSize: number;
}

const extractNumericValue = (value: number | number[]): number =>
  Array.isArray(value) ? value[0] : value;

const calculateStatistics = (
  values: readonly number[]
): StatisticalSummary => {
  const sampleSize = values.length;
  const mean = values.reduce((sum, val) => sum + val, 0) / sampleSize;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sampleSize;
  const stdDev = Math.sqrt(variance);

  return { mean, variance, stdDev, sampleSize };
};

const calculateZScore = (
  value: number,
  mean: number,
  stdDev: number
): number => (stdDev === 0 ? 0 : Math.abs((value - mean) / stdDev));

const getSeverityFromZScore = (zScore: number): Severity => {
  if (zScore > 5) return "high";
  if (zScore > 4) return "medium";
  return "low";
};

const normalizeScore = (value: number, max: number): number =>
  Math.min(value / max, 1);

// ============================================================================
// Detection Functions - Pure & Composable
// ============================================================================

const detectSpike = (
  currentValue: number,
  history: readonly DataPoint[],
  threshold: number
): Anomaly | null => {
  const recentHistory = history.slice(-100);
  const values = recentHistory.map((p) => extractNumericValue(p.value));

  const stats = calculateStatistics(values);
  if (stats.stdDev === 0) return null;

  const zScore = calculateZScore(currentValue, stats.mean, stats.stdDev);

  if (zScore > threshold) {
    return {
      type: "spike",
      timestamp: Date.now(),
      severity: getSeverityFromZScore(zScore),
      score: normalizeScore(zScore, 6),
      value: currentValue,
      expectedValue: stats.mean,
      message: `Spike detected: ${currentValue.toFixed(2)} is ${zScore.toFixed(1)}σ from baseline ${stats.mean.toFixed(2)}`,
      evidence: {
        method: "Z-score",
        baseline: stats.mean,
        deviation: stats.stdDev,
        zScore,
        sampleSize: stats.sampleSize,
      },
    } satisfies Anomaly;
  }

  return null;
};

const detectDrift = (
  history: readonly DataPoint[],
  windowSize: number
): Anomaly | null => {
  if (history.length < windowSize * 2) return null;

  const recentWindow = history.slice(-windowSize);
  const olderWindow = history.slice(-windowSize * 2, -windowSize);

  const recentValues = recentWindow.map((p) => extractNumericValue(p.value));
  const olderValues = olderWindow.map((p) => extractNumericValue(p.value));

  const recentStats = calculateStatistics(recentValues);
  const olderStats = calculateStatistics(olderValues);

  const meanDrift = Math.abs(recentStats.mean - olderStats.mean);

  // Drift is significant if mean shift > 2 std deviations
  if (meanDrift > olderStats.stdDev * 2) {
    return {
      type: "drift",
      timestamp: Date.now(),
      severity: meanDrift > olderStats.stdDev * 4 ? "high" : "medium",
      score: normalizeScore(meanDrift, olderStats.stdDev * 5),
      value: recentStats.mean,
      expectedValue: olderStats.mean,
      message: `Baseline drift detected: Mean shifted from ${olderStats.mean.toFixed(2)} to ${recentStats.mean.toFixed(2)}`,
      evidence: {
        method: "Mean comparison",
        baseline: olderStats.mean,
        deviation: olderStats.stdDev,
        meanDrift,
        windowSize,
      },
    } satisfies Anomaly;
  }

  return null;
};

const detectFlatline = (
  history: readonly DataPoint[],
  threshold: number
): Anomaly | null => {
  const windowSize = Math.min(50, history.length);
  const recentWindow = history.slice(-windowSize);

  const values = recentWindow.map((p) => extractNumericValue(p.value));
  const stats = calculateStatistics(values);

  // Check if variance is suspiciously low
  if (stats.variance < threshold) {
    return {
      type: "flatline",
      timestamp: Date.now(),
      severity: "high",
      score: 1 - stats.variance / threshold,
      value: stats.mean,
      message: `Sensor flatline detected: No variation in last ${windowSize} samples (variance: ${stats.variance.toFixed(6)})`,
      evidence: {
        method: "Variance check",
        baseline: stats.mean,
        deviation: stats.stdDev,
        variance: stats.variance,
        windowSize,
      },
    } satisfies Anomaly;
  }

  return null;
};

// ============================================================================
// Detector State Types
// ============================================================================

export interface DetectorState {
  readonly config: DetectorConfigBase;
  readonly history: readonly DataPoint[];
  readonly maxHistorySize: number;
}

export interface MLDetectorState extends DetectorState {
  readonly config: MLDetectorConfig;
  readonly isTraining: boolean;
  readonly trainingStartTime: number;
  readonly model: unknown | null;
}

export interface AggregatorState {
  readonly detectors: ReadonlyMap<string, DetectorState>;
  readonly recentAnomalies: readonly TaggedAnomaly[];
  readonly maxAnomalyHistory: number;
}

// ============================================================================
// FREE TIER: Statistical Anomaly Detector - Functional API
// ============================================================================

export const createDetector = (
  config?: AnomalyDetectorConfig
): DetectorState => ({
  config: { ...DEFAULT_CONFIG, ...config },
  history: [],
  maxHistorySize: 10_000,
});

export const addDataPoint = (
  state: DetectorState,
  data: DataPoint
): DetectorState => {
  const newHistory = [...state.history, data];

  return {
    ...state,
    history: newHistory.length > state.maxHistorySize
      ? newHistory.slice(-state.maxHistorySize)
      : newHistory,
  };
};

export const detect = (
  state: DetectorState,
  currentData: DataPoint
): readonly Anomaly[] => {
  const updatedState = addDataPoint(state, currentData);

  // Need minimum history
  if (updatedState.history.length < 30) {
    return [];
  }

  const currentValue = extractNumericValue(currentData.value);
  const anomalies: Anomaly[] = [];

  // Run all detection methods
  const spike = detectSpike(
    currentValue,
    updatedState.history,
    updatedState.config.spikeThreshold
  );
  if (spike) anomalies.push(spike);

  const drift = detectDrift(updatedState.history, updatedState.config.driftWindowSize);
  if (drift) anomalies.push(drift);

  const flatline = detectFlatline(
    updatedState.history,
    updatedState.config.flatlineThreshold
  );
  if (flatline) anomalies.push(flatline);

  return anomalies;
};

export const getBaseline = (
  state: DetectorState
): StatisticalSummary | null => {
  if (state.history.length < 10) return null;

  const values = state.history.map((p) => extractNumericValue(p.value));
  return calculateStatistics(values);
};

export const getHistory = (state: DetectorState): readonly DataPoint[] =>
  state.history;

export const clearHistory = (state: DetectorState): DetectorState => ({
  ...state,
  history: [],
});

// ============================================================================
// PRO TIER: ML-Based Anomaly Detection - Functional API
// ============================================================================

export const createMLDetector = (
  config?: MLAnomalyDetectorConfig
): MLDetectorState => ({
  config: { ...DEFAULT_ML_CONFIG, ...config },
  history: [],
  maxHistorySize: 10_000,
  isTraining: true,
  trainingStartTime: Date.now(),
  model: null,
});

export const detectML = (
  state: MLDetectorState,
  currentData: DataPoint
): readonly Anomaly[] => {
  const basicAnomalies = detect(state, currentData);

  // Check if still training
  const trainingDuration = Date.now() - state.trainingStartTime;
  if (state.isTraining && trainingDuration < state.config.trainingPeriod) {
    return basicAnomalies; // Return only statistical anomalies during training
  }

  const updatedState = {
    ...state,
    isTraining: false,
  };

  // Add ML-based detections (PRO)
  if (updatedState.config.enableMLDetection) {
    // These would be real ML detections in production
    // For now, we return only basic anomalies
  }

  return basicAnomalies;
};

// PRO: Pattern learning
const detectPatternBreak = (currentValue: number): Anomaly => ({
  type: "pattern_break",
  timestamp: Date.now(),
  severity: "medium",
  score: 0.75,
  value: currentValue,
  expectedValue: undefined,
  message: "Pattern break detected (PRO feature - requires cloud service)",
  evidence: {
    method: "LSTM forecast",
    note: "Upgrade to PRO for ML-based detection",
  },
});

// PRO: Multi-sensor correlation
export const detectMultiVariate = (sensors: Record<string, number>): Anomaly => ({
  type: "multi_variate",
  timestamp: Date.now(),
  severity: "high",
  score: 0.85,
  value: Object.values(sensors)[0],
  message:
    "Multi-sensor correlation anomaly (PRO feature - requires cloud service)",
  evidence: {
    method: "Isolation Forest",
    sensors: Object.keys(sensors),
    note: "Upgrade to PRO for multi-variate analysis",
  },
});

export const isStillTraining = (state: MLDetectorState): boolean =>
  state.isTraining;

export const getTrainingProgress = (state: MLDetectorState): number => {
  const elapsed = Date.now() - state.trainingStartTime;
  return Math.min(elapsed / state.config.trainingPeriod, 1);
};

// ============================================================================
// Anomaly Aggregator - Multi-Metric Tracking - Functional API
// ============================================================================

type TaggedAnomaly = Anomaly & {
  readonly metricId: string;
};

interface AnomalyStats {
  readonly total: number;
  readonly bySeverity: Record<Severity, number>;
  readonly byType: Partial<Record<AnomalyType, number>>;
}

export const createAggregator = (): AggregatorState => ({
  detectors: new Map(),
  recentAnomalies: [],
  maxAnomalyHistory: 1_000,
});

export const addMetric = (
  state: AggregatorState,
  metricId: string,
  config?: AnomalyDetectorConfig
): AggregatorState => {
  const detector = createDetector(config);
  const newDetectors = new Map(state.detectors);
  newDetectors.set(metricId, detector);

  return {
    ...state,
    detectors: newDetectors,
  };
};

export const removeMetric = (
  state: AggregatorState,
  metricId: string
): AggregatorState => {
  const newDetectors = new Map(state.detectors);
  newDetectors.delete(metricId);

  return {
    ...state,
    detectors: newDetectors,
  };
};

export const detectAggregated = (
  state: AggregatorState,
  metricId: string,
  data: DataPoint
): { state: AggregatorState; anomalies: readonly TaggedAnomaly[] } => {
  const detector = state.detectors.get(metricId);
  if (!detector) {
    throw new Error(`No detector configured for metric: ${metricId}`);
  }

  const anomalies = detect(detector, data);
  const tagged = anomalies.map(
    (a) => ({ ...a, metricId }) satisfies TaggedAnomaly
  );

  // Update detector state
  const updatedDetector = addDataPoint(detector, data);
  const newDetectors = new Map(state.detectors);
  newDetectors.set(metricId, updatedDetector);

  // Store in history
  const newAnomalies = [...state.recentAnomalies, ...tagged];
  const trimmedAnomalies = newAnomalies.length > state.maxAnomalyHistory
    ? newAnomalies.slice(-state.maxAnomalyHistory)
    : newAnomalies;

  return {
    state: {
      ...state,
      detectors: newDetectors,
      recentAnomalies: trimmedAnomalies,
    },
    anomalies: tagged,
  };
};

export const getRecentAnomalies = (
  state: AggregatorState,
  timeWindowMs = 60_000
): readonly TaggedAnomaly[] => {
  const cutoff = Date.now() - timeWindowMs;
  return state.recentAnomalies.filter((a) => a.timestamp > cutoff);
};

export const getAnomalyRate = (
  state: AggregatorState,
  metricId?: string,
  timeWindowMs = 60_000
): number => {
  const recent = getRecentAnomalies(state, timeWindowMs);
  const filtered = metricId
    ? recent.filter((a) => a.metricId === metricId)
    : recent;

  return filtered.length;
};

export const getAnomalyStats = (
  state: AggregatorState,
  timeWindowMs = 60_000
): AnomalyStats => {
  const recent = getRecentAnomalies(state, timeWindowMs);

  const stats: AnomalyStats = {
    total: recent.length,
    bySeverity: { low: 0, medium: 0, high: 0 },
    byType: {},
  };

  for (const anomaly of recent) {
    stats.bySeverity[anomaly.severity]++;
    stats.byType[anomaly.type] = (stats.byType[anomaly.type] ?? 0) + 1;
  }

  return stats;
};

export const getMetrics = (state: AggregatorState): readonly string[] =>
  Array.from(state.detectors.keys());

export const clearAggregatorHistory = (state: AggregatorState): AggregatorState => {
  const newDetectors = new Map<string, DetectorState>();

  for (const [metricId, detector] of state.detectors.entries()) {
    newDetectors.set(metricId, clearHistory(detector));
  }

  return {
    ...state,
    detectors: newDetectors,
    recentAnomalies: [],
  };
};
