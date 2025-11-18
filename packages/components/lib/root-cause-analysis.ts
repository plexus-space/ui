"use client";

/**
 * Root Cause Analysis System
 *
 * FREE TIER: Basic correlation analysis, simple cause identification
 * PAID TIER: Graph-based causal inference, historical pattern matching, AI explanations
 */

import type { DataPoint } from "./data-connectors";
import type { Anomaly } from "./anomaly-detection";
import type { RuleEvaluation } from "./rules-engine";

// ============================================================================
// Types
// ============================================================================

export interface RootCause {
  primary: CauseHypothesis;
  contributing: CauseHypothesis[];
  confidence: number; // 0-1
  evidence: Evidence[];
  recommendation: string;
  timestamp: number;
}

export interface CauseHypothesis {
  type: CauseType;
  description: string;
  likelihood: number; // 0-1
  affectedMetrics: string[];
  timelineEvents?: TimelineEvent[];
}

export type CauseType =
  | "sensor_failure"
  | "environmental"
  | "mechanical_fault"
  | "electrical"
  | "software"
  | "operator_error"
  | "cascading_failure"   // PRO: Multi-component failure
  | "known_pattern";      // PRO: Matches historical incident

export interface Evidence {
  type: "correlation" | "temporal" | "domain_knowledge" | "historical" | "causal_graph";
  description: string;
  strength: number; // 0-1
  data?: Record<string, unknown>;
}

export interface TimelineEvent {
  timestamp: number;
  metric: string;
  event: string;
  value?: number;
}

// ============================================================================
// FREE TIER: Basic Root Cause Analysis
// ============================================================================

export class BasicRootCauseAnalyzer {
  private anomalyHistory: Map<string, Anomaly[]> = new Map();
  private alertHistory: Map<string, RuleEvaluation[]> = new Map();
  private domainKnowledge: Map<string, DomainPattern> = new Map();

  constructor() {
    // Load built-in domain knowledge
    this.initializeDomainKnowledge();
  }

  private initializeDomainKnowledge() {
    // Vibration domain patterns
    this.domainKnowledge.set("vibration_spike_with_drift", {
      domain: "vibration",
      pattern: "spike followed by drift",
      likelyCause: "bearing_degradation",
      description: "Sudden spike followed by elevated baseline suggests bearing surface damage",
      confidence: 0.85,
    });

    this.domainKnowledge.set("flatline_all_channels", {
      domain: "eeg",
      pattern: "flatline across all channels",
      likelyCause: "sensor_disconnection",
      description: "All channels reading zero or constant suggests electrode disconnection",
      confidence: 0.95,
    });

    this.domainKnowledge.set("power_drop_thermal_spike", {
      domain: "aerospace",
      pattern: "power drop with thermal spike",
      likelyCause: "component_failure",
      description: "Simultaneous power loss and temperature increase indicates electrical component failure",
      confidence: 0.90,
    });
  }

  recordAnomaly(metricId: string, anomaly: Anomaly) {
    if (!this.anomalyHistory.has(metricId)) {
      this.anomalyHistory.set(metricId, []);
    }
    const history = this.anomalyHistory.get(metricId)!;
    history.push(anomaly);

    // Keep last 1000 anomalies per metric
    if (history.length > 1000) {
      history.shift();
    }
  }

  recordAlert(metricId: string, alert: RuleEvaluation) {
    if (!this.alertHistory.has(metricId)) {
      this.alertHistory.set(metricId, []);
    }
    const history = this.alertHistory.get(metricId)!;
    history.push(alert);

    if (history.length > 1000) {
      history.shift();
    }
  }

  analyze(
    triggeringEvent: Anomaly | RuleEvaluation,
    context: {
      metricId: string;
      domain?: string;
      recentData?: Map<string, DataPoint[]>;
    }
  ): RootCause {
    const evidence: Evidence[] = [];
    const contributing: CauseHypothesis[] = [];

    // 1. Check for sensor failure (flatline)
    if ("type" in triggeringEvent && triggeringEvent.type === "flatline") {
      return this.analyzeSensorFailure(triggeringEvent, context, evidence);
    }

    // 2. Check for correlated anomalies (temporal proximity)
    const correlatedAnomalies = this.findCorrelatedAnomalies(
      triggeringEvent.timestamp,
      context.metricId
    );

    if (correlatedAnomalies.length > 0) {
      evidence.push({
        type: "temporal",
        description: `${correlatedAnomalies.length} correlated anomalies detected within 60 seconds`,
        strength: Math.min(correlatedAnomalies.length / 5, 1),
        data: { anomalies: correlatedAnomalies.length },
      });
    }

    // 3. Check domain knowledge patterns
    const domainCause = this.matchDomainPattern(
      triggeringEvent,
      correlatedAnomalies,
      context.domain
    );

    if (domainCause) {
      contributing.push(domainCause);
    }

    // 4. Analyze trend leading to event
    const trend = this.analyzeTrend(context.metricId);
    if (trend) {
      evidence.push({
        type: "correlation",
        description: trend.description,
        strength: trend.confidence,
      });
    }

    // 5. Build primary hypothesis
    const primary = this.buildPrimaryHypothesis(
      triggeringEvent,
      evidence,
      contributing,
      context
    );

    // 6. Generate recommendation
    const recommendation = this.generateRecommendation(primary, context.domain);

    return {
      primary,
      contributing,
      confidence: this.calculateOverallConfidence(primary, contributing, evidence),
      evidence,
      recommendation,
      timestamp: Date.now(),
    };
  }

  private analyzeSensorFailure(
    anomaly: Anomaly,
    context: { metricId: string; domain?: string },
    evidence: Evidence[]
  ): RootCause {
    evidence.push({
      type: "domain_knowledge",
      description: "Zero variance indicates sensor malfunction or disconnection",
      strength: 0.95,
    });

    const primary: CauseHypothesis = {
      type: "sensor_failure",
      description: "Sensor appears to be disconnected or malfunctioning",
      likelihood: 0.95,
      affectedMetrics: [context.metricId],
    };

    return {
      primary,
      contributing: [],
      confidence: 0.95,
      evidence,
      recommendation: "Check sensor connection, power supply, and physical integrity. Replace if necessary.",
      timestamp: Date.now(),
    };
  }

  private findCorrelatedAnomalies(
    timestamp: number,
    excludeMetric: string,
    windowMs: number = 60000
  ): Array<{ metricId: string; anomaly: Anomaly }> {
    const correlated: Array<{ metricId: string; anomaly: Anomaly }> = [];

    for (const [metricId, anomalies] of this.anomalyHistory.entries()) {
      if (metricId === excludeMetric) continue;

      const nearby = anomalies.filter(
        (a) => Math.abs(a.timestamp - timestamp) < windowMs
      );

      nearby.forEach((anomaly) => {
        correlated.push({ metricId, anomaly });
      });
    }

    return correlated;
  }

  private matchDomainPattern(
    event: Anomaly | RuleEvaluation,
    correlatedAnomalies: Array<{ metricId: string; anomaly: Anomaly }>,
    domain?: string
  ): CauseHypothesis | null {
    // Simple pattern matching based on event characteristics
    if ("type" in event && event.type === "spike") {
      // Check if followed by drift (bearing failure pattern)
      const hasDrift = correlatedAnomalies.some(
        (ca) => ca.anomaly.type === "drift"
      );

      if (hasDrift && domain === "vibration") {
        return {
          type: "mechanical_fault",
          description: "Spike followed by elevated baseline indicates bearing surface damage or imbalance",
          likelihood: 0.85,
          affectedMetrics: correlatedAnomalies.map((ca) => ca.metricId),
        };
      }
    }

    return null;
  }

  private analyzeTrend(metricId: string): { description: string; confidence: number } | null {
    const anomalies = this.anomalyHistory.get(metricId) || [];
    if (anomalies.length < 3) return null;

    const recentAnomalies = anomalies.slice(-10);
    const severityCounts = {
      low: recentAnomalies.filter((a) => a.severity === "low").length,
      medium: recentAnomalies.filter((a) => a.severity === "medium").length,
      high: recentAnomalies.filter((a) => a.severity === "high").length,
    };

    if (severityCounts.high > severityCounts.medium) {
      return {
        description: "Escalating severity pattern detected - condition is worsening",
        confidence: 0.75,
      };
    }

    return null;
  }

  private buildPrimaryHypothesis(
    event: Anomaly | RuleEvaluation,
    evidence: Evidence[],
    contributing: CauseHypothesis[],
    context: { metricId: string; domain?: string }
  ): CauseHypothesis {
    // If we have a strong contributing cause, promote it to primary
    if (contributing.length > 0 && contributing[0].likelihood > 0.8) {
      return contributing[0];
    }

    // Default hypothesis based on event type
    if ("type" in event) {
      switch (event.type) {
        case "spike":
          return {
            type: "environmental",
            description: "Sudden spike suggests external disturbance or transient event",
            likelihood: 0.65,
            affectedMetrics: [context.metricId],
          };

        case "drift":
          return {
            type: "mechanical_fault",
            description: "Gradual drift indicates component degradation or calibration drift",
            likelihood: 0.70,
            affectedMetrics: [context.metricId],
          };

        default:
          return {
            type: "environmental",
            description: "Anomalous behavior detected - cause requires further investigation",
            likelihood: 0.50,
            affectedMetrics: [context.metricId],
          };
      }
    }

    // For rule evaluations
    return {
      type: "environmental",
      description: "Threshold exceeded - monitor for continued violations",
      likelihood: 0.60,
      affectedMetrics: [context.metricId],
    };
  }

  private generateRecommendation(
    primary: CauseHypothesis,
    domain?: string
  ): string {
    const baseRecommendations: Record<CauseType, string> = {
      sensor_failure: "Check sensor connection and power supply. Consider sensor replacement.",
      environmental: "Review recent environmental changes. Check for external interference sources.",
      mechanical_fault: "Schedule maintenance inspection. Monitor vibration trends closely.",
      electrical: "Inspect wiring and electrical connections. Check for voltage fluctuations.",
      software: "Review recent software changes. Check for configuration errors or updates.",
      operator_error: "Review operating procedures. Verify correct system operation.",
      cascading_failure: "PRO: Multi-component analysis available with upgrade",
      known_pattern: "PRO: Historical pattern matching available with upgrade",
    };

    let recommendation = baseRecommendations[primary.type];

    // Add domain-specific context
    if (domain === "vibration" && primary.type === "mechanical_fault") {
      recommendation += " Analyze frequency spectrum for bearing fault signatures (BPFO/BPFI).";
    }

    return recommendation;
  }

  private calculateOverallConfidence(
    primary: CauseHypothesis,
    contributing: CauseHypothesis[],
    evidence: Evidence[]
  ): number {
    const primaryWeight = 0.5;
    const contributingWeight = 0.3;
    const evidenceWeight = 0.2;

    const contributingAvg =
      contributing.length > 0
        ? contributing.reduce((sum, c) => sum + c.likelihood, 0) / contributing.length
        : 0;

    const evidenceAvg =
      evidence.length > 0
        ? evidence.reduce((sum, e) => sum + e.strength, 0) / evidence.length
        : 0;

    return (
      primary.likelihood * primaryWeight +
      contributingAvg * contributingWeight +
      evidenceAvg * evidenceWeight
    );
  }
}

// ============================================================================
// Domain Pattern Database
// ============================================================================

interface DomainPattern {
  domain: string;
  pattern: string;
  likelyCause: string;
  description: string;
  confidence: number;
}

// ============================================================================
// PRO TIER: Advanced Root Cause Analysis (Placeholder)
// ============================================================================

/**
 * Advanced Root Cause Analysis - PRO FEATURE
 *
 * Would implement:
 * - Causal graph inference (Bayesian networks)
 * - Historical incident matching (vector similarity search)
 * - Multi-step fault propagation analysis
 * - AI-generated explanations with references
 * - Counterfactual reasoning ("what if" scenarios)
 *
 * Requires cloud backend with:
 * - Vector database for incident history
 * - Graph database for causal relationships
 * - LLM for natural language explanations
 */
export class AdvancedRootCauseAnalyzer extends BasicRootCauseAnalyzer {
  // PRO: Match against historical incidents
  private async findSimilarIncidents(
    event: Anomaly | RuleEvaluation,
    context: { metricId: string; domain?: string }
  ): Promise<CauseHypothesis | null> {
    // In production, this would:
    // 1. Embed current incident as vector
    // 2. Query vector DB for similar historical incidents
    // 3. Return root cause from most similar match

    return {
      type: "known_pattern",
      description: "Matches historical incident from 2024-03-15 (PRO feature - requires cloud service)",
      likelihood: 0.88,
      affectedMetrics: [context.metricId],
      timelineEvents: [
        // Would come from historical DB
      ],
    };
  }

  // PRO: Analyze causal graph
  private analyzeCausalGraph(
    metrics: string[]
  ): { cause: string; effect: string; strength: number }[] {
    // In production, this would:
    // 1. Build causal graph from historical correlations
    // 2. Use do-calculus for causal inference
    // 3. Identify root nodes (likely causes)

    return [
      {
        cause: "bearing_temperature",
        effect: "vibration_rms",
        strength: 0.92,
      },
    ];
  }
}
