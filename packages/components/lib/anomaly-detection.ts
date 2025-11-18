"use client";

/**
 * Anomaly Detection System
 *
 * FREE TIER: Statistical anomalies (Z-score, simple thresholds)
 * PAID TIER: ML-based pattern learning, forecasting, multi-variate analysis
 */

import type { DataPoint } from "./data-connectors";

// ============================================================================
// Types
// ============================================================================

export type AnomalyType =
  | "spike"           // Sudden increase/decrease
  | "drift"           // Gradual trend change
  | "oscillation"     // Unexpected periodic behavior
  | "flatline"        // No variation (sensor failure)
  | "pattern_break"   // Deviation from learned pattern (PRO)
  | "multi_variate";  // Correlation anomaly across sensors (PRO)

export interface Anomaly {
  type: AnomalyType;
  timestamp: number;
  severity: "low" | "medium" | "high";
  score: number; // 0-1 confidence
  value: number;
  expectedValue?: number;
  message: string;
  evidence: {
    method: string;
    baseline?: number;
    deviation?: number;
    context?: Record<string, unknown>;
  };
}

export interface AnomalyDetectorConfig {
  // FREE TIER
  spikeThreshold?: number;        // Z-score for spike detection (default: 3)
  driftWindowSize?: number;       // Samples to detect drift (default: 100)
  flatlineThreshold?: number;     // Min variance to detect flatline (default: 0.01)

  // PRO TIER
  enableMLDetection?: boolean;    // PRO: Use ML models
  trainingPeriod?: number;        // PRO: Time to learn baseline (ms)
  forecastHorizon?: number;       // PRO: Predict N steps ahead
}

// ============================================================================
// FREE TIER: Statistical Anomaly Detection
// ============================================================================

export class StatisticalAnomalyDetector {
  private config: Required<AnomalyDetectorConfig>;
  private history: DataPoint[] = [];
  private maxHistorySize = 10000;

  constructor(config: AnomalyDetectorConfig = {}) {
    this.config = {
      spikeThreshold: config.spikeThreshold || 3,
      driftWindowSize: config.driftWindowSize || 100,
      flatlineThreshold: config.flatlineThreshold || 0.01,
      enableMLDetection: false,
      trainingPeriod: 0,
      forecastHorizon: 0,
    };
  }

  addDataPoint(data: DataPoint) {
    this.history.push(data);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  detect(currentData: DataPoint): Anomaly[] {
    this.addDataPoint(currentData);

    const anomalies: Anomaly[] = [];
    const value = Array.isArray(currentData.value)
      ? currentData.value[0]
      : currentData.value;

    // Need minimum history
    if (this.history.length < 30) {
      return anomalies;
    }

    // Spike detection (Z-score)
    const spike = this.detectSpike(value);
    if (spike) anomalies.push(spike);

    // Drift detection (trend change)
    const drift = this.detectDrift();
    if (drift) anomalies.push(drift);

    // Flatline detection (sensor failure)
    const flatline = this.detectFlatline();
    if (flatline) anomalies.push(flatline);

    return anomalies;
  }

  private detectSpike(currentValue: number): Anomaly | null {
    const recentHistory = this.history.slice(-100);
    const values = recentHistory.map((p) =>
      Array.isArray(p.value) ? p.value[0] : p.value
    );

    // Calculate mean and std dev
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return null; // No variation

    const zScore = Math.abs((currentValue - mean) / stdDev);

    if (zScore > this.config.spikeThreshold) {
      return {
        type: "spike",
        timestamp: Date.now(),
        severity: zScore > 5 ? "high" : zScore > 4 ? "medium" : "low",
        score: Math.min(zScore / 6, 1), // Normalize to 0-1
        value: currentValue,
        expectedValue: mean,
        message: `Spike detected: ${currentValue.toFixed(2)} is ${zScore.toFixed(1)}σ from baseline ${mean.toFixed(2)}`,
        evidence: {
          method: "Z-score",
          baseline: mean,
          deviation: stdDev,
          context: { zScore, sampleSize: values.length },
        },
      };
    }

    return null;
  }

  private detectDrift(): Anomaly | null {
    const windowSize = this.config.driftWindowSize;
    if (this.history.length < windowSize * 2) return null;

    // Compare recent window vs older window
    const recentWindow = this.history.slice(-windowSize);
    const olderWindow = this.history.slice(-windowSize * 2, -windowSize);

    const recentValues = recentWindow.map((p) =>
      Array.isArray(p.value) ? p.value[0] : p.value
    );
    const olderValues = olderWindow.map((p) =>
      Array.isArray(p.value) ? p.value[0] : p.value
    );

    const recentMean =
      recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const olderMean =
      olderValues.reduce((a, b) => a + b, 0) / olderValues.length;

    const meanDrift = Math.abs(recentMean - olderMean);
    const olderStdDev = Math.sqrt(
      olderValues.reduce((a, b) => a + Math.pow(b - olderMean, 2), 0) /
        olderValues.length
    );

    // Drift is significant if mean shift > 2 std deviations
    if (meanDrift > olderStdDev * 2) {
      return {
        type: "drift",
        timestamp: Date.now(),
        severity: meanDrift > olderStdDev * 4 ? "high" : "medium",
        score: Math.min(meanDrift / (olderStdDev * 5), 1),
        value: recentMean,
        expectedValue: olderMean,
        message: `Baseline drift detected: Mean shifted from ${olderMean.toFixed(2)} to ${recentMean.toFixed(2)}`,
        evidence: {
          method: "Mean comparison",
          baseline: olderMean,
          deviation: olderStdDev,
          context: { meanDrift, windowSize },
        },
      };
    }

    return null;
  }

  private detectFlatline(): Anomaly | null {
    const windowSize = Math.min(50, this.history.length);
    const recentWindow = this.history.slice(-windowSize);

    const values = recentWindow.map((p) =>
      Array.isArray(p.value) ? p.value[0] : p.value
    );

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;

    // Check if variance is suspiciously low
    if (variance < this.config.flatlineThreshold) {
      return {
        type: "flatline",
        timestamp: Date.now(),
        severity: "high",
        score: 1 - variance / this.config.flatlineThreshold,
        value: mean,
        message: `Sensor flatline detected: No variation in last ${windowSize} samples (variance: ${variance.toFixed(6)})`,
        evidence: {
          method: "Variance check",
          baseline: mean,
          deviation: Math.sqrt(variance),
          context: { variance, windowSize },
        },
      };
    }

    return null;
  }

  getBaseline(): { mean: number; stdDev: number; sampleSize: number } | null {
    if (this.history.length < 10) return null;

    const values = this.history.map((p) =>
      Array.isArray(p.value) ? p.value[0] : p.value
    );
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev, sampleSize: values.length };
  }
}

// ============================================================================
// PRO TIER: ML-Based Anomaly Detection (Placeholder)
// ============================================================================

/**
 * ML-Based Anomaly Detection - PRO FEATURE
 *
 * Would implement:
 * - LSTM for time-series forecasting
 * - Isolation Forest for multi-variate anomalies
 * - Autoencoders for pattern learning
 * - Bayesian change point detection
 *
 * This would run in cloud backend with proper ML infrastructure
 */
export class MLAnomalyDetector extends StatisticalAnomalyDetector {
  private isTraining = true;
  private trainingStartTime = Date.now();
  private model: unknown = null; // Would be TensorFlow.js model

  constructor(config: AnomalyDetectorConfig = {}) {
    super(config);
  }

  // PRO: Pattern learning
  private detectPatternBreak(currentValue: number): Anomaly | null {
    // Placeholder for ML pattern detection
    // In production, this would:
    // 1. Use LSTM to forecast next value
    // 2. Compare actual vs predicted
    // 3. Flag if prediction error > threshold

    return {
      type: "pattern_break",
      timestamp: Date.now(),
      severity: "medium",
      score: 0.75,
      value: currentValue,
      expectedValue: undefined, // Would come from model prediction
      message: `Pattern break detected (PRO feature - requires cloud service)`,
      evidence: {
        method: "LSTM forecast",
        context: { note: "Upgrade to PRO for ML-based detection" },
      },
    };
  }

  // PRO: Multi-sensor correlation
  detectMultiVariate(
    sensors: Record<string, number>
  ): Anomaly | null {
    // Placeholder for multi-variate analysis
    // In production, this would:
    // 1. Use Isolation Forest or autoencoder
    // 2. Detect if combination of values is anomalous
    // 3. Even if individual sensors look normal

    return {
      type: "multi_variate",
      timestamp: Date.now(),
      severity: "high",
      score: 0.85,
      value: Object.values(sensors)[0],
      message: `Multi-sensor correlation anomaly (PRO feature - requires cloud service)`,
      evidence: {
        method: "Isolation Forest",
        context: {
          sensors: Object.keys(sensors),
          note: "Upgrade to PRO for multi-variate analysis",
        },
      },
    };
  }

  // Override to add ML detections
  detect(currentData: DataPoint): Anomaly[] {
    const anomalies = super.detect(currentData);

    // Check if still training
    const trainingDuration = Date.now() - this.trainingStartTime;
    if (this.isTraining && trainingDuration < 300000) {
      // 5 minutes training
      return anomalies; // Return only statistical anomalies during training
    }

    this.isTraining = false;

    // Add ML-based detections (PRO)
    if (this.config.enableMLDetection) {
      const value = Array.isArray(currentData.value)
        ? currentData.value[0]
        : currentData.value;

      // These would be real ML detections in production
      // For now, return placeholder messages
      // const patternBreak = this.detectPatternBreak(value);
      // if (patternBreak) anomalies.push(patternBreak);
    }

    return anomalies;
  }
}

// ============================================================================
// Anomaly Aggregator (FREE)
// ============================================================================

/**
 * Aggregates anomalies across multiple metrics
 * Helps identify system-wide issues vs individual sensor problems
 */
export class AnomalyAggregator {
  private detectors = new Map<string, StatisticalAnomalyDetector>();
  private recentAnomalies: Array<Anomaly & { metricId: string }> = [];
  private maxAnomalyHistory = 1000;

  addMetric(
    metricId: string,
    config?: AnomalyDetectorConfig
  ): StatisticalAnomalyDetector {
    const detector = new StatisticalAnomalyDetector(config);
    this.detectors.set(metricId, detector);
    return detector;
  }

  detect(
    metricId: string,
    data: DataPoint
  ): Array<Anomaly & { metricId: string }> {
    const detector = this.detectors.get(metricId);
    if (!detector) {
      throw new Error(`No detector configured for metric: ${metricId}`);
    }

    const anomalies = detector.detect(data);
    const tagged = anomalies.map((a) => ({ ...a, metricId }));

    // Store in history
    this.recentAnomalies.push(...tagged);
    if (this.recentAnomalies.length > this.maxAnomalyHistory) {
      this.recentAnomalies = this.recentAnomalies.slice(-this.maxAnomalyHistory);
    }

    return tagged;
  }

  getRecentAnomalies(
    timeWindowMs: number = 60000
  ): Array<Anomaly & { metricId: string }> {
    const cutoff = Date.now() - timeWindowMs;
    return this.recentAnomalies.filter((a) => a.timestamp > cutoff);
  }

  getAnomalyRate(
    metricId?: string,
    timeWindowMs: number = 60000
  ): number {
    const recent = this.getRecentAnomalies(timeWindowMs);
    const filtered = metricId
      ? recent.filter((a) => a.metricId === metricId)
      : recent;

    return filtered.length;
  }
}
