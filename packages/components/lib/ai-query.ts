"use client";

/**
 * AI-powered natural language query system for observability data
 * Helps users analyze streaming data, set up alerts, and build dashboards
 */

// ============================================================================
// Types
// ============================================================================

export interface QueryIntent {
  action: "analyze" | "alert" | "dashboard" | "filter" | "export";
  domain?:
    | "vibration"
    | "eeg"
    | "aerospace"
    | "thermal"
    | "structural"
    | "general";
  parameters: Record<string, unknown>;
  confidence: number;
}

export interface AnalysisResult {
  insights: string[];
  recommendations: string[];
  visualizations: {
    type: string;
    config: Record<string, unknown>;
  }[];
}

// ============================================================================
// Domain Knowledge Bases
// ============================================================================

const VIBRATION_KNOWLEDGE = {
  keywords: [
    "vibration",
    "bearing",
    "motor",
    "rpm",
    "frequency",
    "rms",
    "acceleration",
    "fault",
    "BPFO",
    "BPFI",
  ],
  metrics: {
    rms: { unit: "mm/s", thresholds: { good: 2.8, acceptable: 7.1, bad: 18 } },
    peakToPeak: {
      unit: "mm/s",
      thresholds: { good: 5, acceptable: 12, bad: 30 },
    },
  },
  faultFrequencies: {
    BPFO: (rpm: number, ballCount = 8, contactAngle = 0) =>
      (rpm / 60) *
      (ballCount / 2) *
      (1 - Math.cos((contactAngle * Math.PI) / 180)),
    BPFI: (rpm: number, ballCount = 8, contactAngle = 0) =>
      (rpm / 60) *
      (ballCount / 2) *
      (1 + Math.cos((contactAngle * Math.PI) / 180)),
  },
};

const EEG_KNOWLEDGE = {
  keywords: [
    "eeg",
    "brain",
    "waves",
    "alpha",
    "beta",
    "theta",
    "delta",
    "gamma",
    "electrode",
    "seizure",
    "sleep",
  ],
  bands: {
    delta: { range: [0.5, 4], description: "Deep sleep, unconscious" },
    theta: { range: [4, 8], description: "Drowsiness, meditation" },
    alpha: { range: [8, 13], description: "Relaxed, eyes closed" },
    beta: { range: [13, 30], description: "Active thinking, concentration" },
    gamma: { range: [30, 50], description: "High-level cognitive processing" },
  },
  sampleRate: 256, // Hz
};

const AEROSPACE_KNOWLEDGE = {
  keywords: [
    "satellite",
    "spacecraft",
    "orbit",
    "altitude",
    "telemetry",
    "attitude",
    "pitch",
    "roll",
    "yaw",
  ],
  orbits: {
    LEO: { altitudeKm: [200, 2000], velocityKms: 7.8 },
    MEO: { altitudeKm: [2000, 35786], velocityKms: 4.9 },
    GEO: { altitudeKm: [35786, 35786], velocityKms: 3.1 },
  },
};

// ============================================================================
// Intent Detection
// ============================================================================

export function detectIntent(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase();

  // Detect domain
  let domain: QueryIntent["domain"] = "general";
  if (VIBRATION_KNOWLEDGE.keywords.some((k) => lowerQuery.includes(k)))
    domain = "vibration";
  else if (EEG_KNOWLEDGE.keywords.some((k) => lowerQuery.includes(k)))
    domain = "eeg";
  else if (AEROSPACE_KNOWLEDGE.keywords.some((k) => lowerQuery.includes(k)))
    domain = "aerospace";

  // Detect action
  let action: QueryIntent["action"] = "analyze";
  if (
    lowerQuery.includes("alert") ||
    lowerQuery.includes("notify") ||
    lowerQuery.includes("warn")
  )
    action = "alert";
  else if (
    lowerQuery.includes("dashboard") ||
    lowerQuery.includes("visualize") ||
    lowerQuery.includes("show")
  )
    action = "dashboard";
  else if (
    lowerQuery.includes("filter") ||
    lowerQuery.includes("where") ||
    lowerQuery.includes("only")
  )
    action = "filter";
  else if (
    lowerQuery.includes("export") ||
    lowerQuery.includes("save") ||
    lowerQuery.includes("download")
  )
    action = "export";

  // Extract parameters based on domain
  const parameters: Record<string, unknown> = {};

  if (domain === "vibration") {
    // Extract RPM
    const rpmMatch = lowerQuery.match(/(\d+)\s*rpm/);
    if (rpmMatch) parameters.rpm = parseInt(rpmMatch[1]);

    // Extract frequency
    const freqMatch = lowerQuery.match(/(\d+)\s*hz/);
    if (freqMatch) parameters.frequency = parseFloat(freqMatch[1]);

    // Detect specific analysis
    if (lowerQuery.includes("bearing")) parameters.analysis = "bearing_fault";
    if (lowerQuery.includes("imbalance")) parameters.analysis = "imbalance";
    if (lowerQuery.includes("misalignment"))
      parameters.analysis = "misalignment";
  }

  if (domain === "eeg") {
    // Extract band
    for (const [band, info] of Object.entries(EEG_KNOWLEDGE.bands)) {
      if (lowerQuery.includes(band)) {
        parameters.band = band;
        parameters.bandRange = info.range;
      }
    }

    // Extract channel
    const channelMatch = lowerQuery.match(/channel\s*(\d+)/);
    if (channelMatch) parameters.channel = parseInt(channelMatch[1]);

    // Detect mental state
    if (lowerQuery.includes("sleep")) parameters.state = "sleep";
    if (lowerQuery.includes("focus") || lowerQuery.includes("concentrate"))
      parameters.state = "focused";
    if (lowerQuery.includes("meditat")) parameters.state = "meditation";
  }

  if (domain === "aerospace") {
    // Detect subsystem
    if (lowerQuery.includes("power")) parameters.subsystem = "power";
    if (lowerQuery.includes("thermal")) parameters.subsystem = "thermal";
    if (lowerQuery.includes("attitude")) parameters.subsystem = "attitude";
    if (lowerQuery.includes("communication"))
      parameters.subsystem = "communication";
  }

  return {
    action,
    domain,
    parameters,
    confidence: 0.85, // Simplified - in production use ML model
  };
}

// ============================================================================
// Query Suggestions
// ============================================================================

export const QUERY_EXAMPLES = {
  vibration: [
    "Show me bearing fault frequencies for a 1800 RPM motor",
    "Alert me when RMS vibration exceeds 7.1 mm/s",
    "Analyze vibration spectrum for imbalance",
    "Create a dashboard for predictive maintenance monitoring",
    "Filter data to show only fault frequencies above 100 Hz",
  ],
  eeg: [
    "Show alpha wave activity for all channels",
    "Alert me if seizure patterns are detected",
    "Create a sleep stage analysis dashboard",
    "Filter to show only gamma band (30-50 Hz) activity",
    "Analyze meditation effectiveness based on theta/alpha ratio",
  ],
  aerospace: [
    "Monitor satellite power system during eclipse",
    "Alert me when battery drops below 70%",
    "Create a ground station dashboard with contact schedule",
    "Show thermal trends for all subsystems",
    "Analyze attitude control performance",
  ],
  structural: [
    "Show stress distribution on the beam",
    "Alert me when safety factor drops below 1.5",
    "Analyze fatigue life for cyclic loading",
    "Create a thermal analysis dashboard",
    "Filter to show elements above yield strength",
  ],
};

// ============================================================================
// Auto-generate dashboard configuration
// ============================================================================

export function generateDashboard(intent: QueryIntent): {
  layout: string;
  components: Array<{
    type: string;
    config: Record<string, unknown>;
    position: { row: number; col: number };
  }>;
} {
  const components: Array<{
    type: string;
    config: Record<string, unknown>;
    position: { row: number; col: number };
  }> = [];

  switch (intent.domain) {
    case "vibration":
      components.push(
        {
          type: "WaterfallChart",
          config: {
            fftSize: 512,
            frequencyRange: [0, 400],
            label: "Frequency Spectrum Analysis",
          },
          position: { row: 0, col: 0 },
        },
        {
          type: "ControlChart",
          config: {
            rules: ["rule1", "rule2", "rule3", "rule4"],
            label: "RMS Vibration Trend (SPC)",
          },
          position: { row: 0, col: 1 },
        },
        {
          type: "Gauge",
          config: {
            zones: [
              { from: 0, to: 2.8, color: "#10b981" },
              { from: 2.8, to: 7.1, color: "#f59e0b" },
              { from: 7.1, to: 18, color: "#ef4444" },
            ],
            label: "Current RMS Level",
            unit: "mm/s",
          },
          position: { row: 1, col: 0 },
        },
        {
          type: "LineChart",
          config: {
            label: "Time Domain Signal",
          },
          position: { row: 1, col: 1 },
        }
      );
      break;

    case "eeg":
      components.push(
        {
          type: "WaterfallChart",
          config: {
            fftSize: 256,
            frequencyRange: [0.5, 50],
            label: "Frequency Band Analysis",
          },
          position: { row: 0, col: 0 },
        },
        {
          type: "HeatmapChart",
          config: {
            label: "Electrode Spatial Activity",
          },
          position: { row: 0, col: 1 },
        },
        {
          type: "LineChart",
          config: {
            series: true,
            label: "Multi-Channel EEG",
          },
          position: { row: 1, col: 0 },
        }
      );
      break;

    case "aerospace":
      components.push(
        {
          type: "AttitudeIndicator",
          config: {
            label: "Spacecraft Orientation",
          },
          position: { row: 0, col: 0 },
        },
        {
          type: "LineChart",
          config: {
            series: true,
            label: "Orbital Parameters",
          },
          position: { row: 0, col: 1 },
        },
        {
          type: "Gantt",
          config: {
            showNowLine: true,
            label: "Ground Station Contacts",
          },
          position: { row: 1, col: 0 },
        },
        {
          type: "StatusGrid",
          config: {
            label: "Subsystem Health",
          },
          position: { row: 1, col: 1 },
        }
      );
      break;

    case "structural":
      components.push(
        {
          type: "ModelViewer",
          config: {
            showGrid: true,
            autoRotate: false,
            label: "3D Stress Visualization",
          },
          position: { row: 0, col: 0 },
        },
        {
          type: "Gauge",
          config: {
            variant: "semi",
            label: "Max Stress Indicator",
          },
          position: { row: 0, col: 1 },
        },
        {
          type: "LineChart",
          config: {
            label: "Stress Distribution",
          },
          position: { row: 1, col: 0 },
        }
      );
      break;
  }

  return {
    layout: "grid-2x2",
    components,
  };
}

// ============================================================================
// Alert Rule Generation
// ============================================================================

export function generateAlertRule(intent: QueryIntent): {
  condition: string;
  threshold: number;
  action: string;
  message: string;
} {
  const { domain, parameters } = intent;

  let condition = "value > threshold";
  let threshold = 0;
  const action = "notify";
  let message = "Alert triggered";

  switch (domain) {
    case "vibration":
      threshold = VIBRATION_KNOWLEDGE.metrics.rms.thresholds.acceptable;
      message = `Vibration level exceeded ${threshold} mm/s - Potential bearing fault`;
      if (parameters.rpm) {
        const bpfo = VIBRATION_KNOWLEDGE.faultFrequencies.BPFO(
          parameters.rpm as number
        );
        message += ` (Check BPFO: ${bpfo.toFixed(1)} Hz)`;
      }
      break;

    case "eeg":
      if (parameters.band === "delta" && parameters.state === "sleep") {
        threshold = 40; // Delta power threshold for deep sleep
        message = "Deep sleep stage detected (Delta > 40%)";
      } else {
        threshold = 50;
        message = "Abnormal brain activity detected";
      }
      break;

    case "aerospace":
      if (parameters.subsystem === "power") {
        condition = "batteryCharge < threshold";
        threshold = 70;
        message = "Battery charge below 70% - Monitor closely during eclipse";
      } else if (parameters.subsystem === "thermal") {
        threshold = 45;
        message = "Core temperature exceeded 45°C - Activate thermal control";
      }
      break;

    case "structural":
      condition = "stress > yieldStrength * safetyMargin";
      threshold = 0.67; // Alert at 67% of yield (FOS < 1.5)
      message = "Safety factor below 1.5 - Overstress condition";
      break;
  }

  return { condition, threshold, action, message };
}

// ============================================================================
// Data Analysis Recommendations
// ============================================================================

export function getRecommendations(
  intent: QueryIntent,
  data?: unknown[]
): string[] {
  const recommendations: string[] = [];
  const { domain, parameters } = intent;

  switch (domain) {
    case "vibration":
      recommendations.push(
        "Use FFT analysis to identify bearing fault frequencies (BPFO, BPFI)",
        "Monitor RMS trends with SPC control charts to detect drift",
        "Set up alerts at ISO 10816 vibration severity thresholds"
      );
      if (parameters.rpm) {
        const rpm = parameters.rpm as number;
        const bpfo = VIBRATION_KNOWLEDGE.faultFrequencies.BPFO(rpm);
        const bpfi = VIBRATION_KNOWLEDGE.faultFrequencies.BPFI(rpm);
        recommendations.push(
          `For ${rpm} RPM motor: Watch for peaks at ${bpfo.toFixed(
            1
          )} Hz (BPFO) and ${bpfi.toFixed(1)} Hz (BPFI)`
        );
      }
      break;

    case "eeg":
      recommendations.push(
        "Use 10-20 electrode system for clinical-grade recordings",
        "Apply notch filter at 50/60 Hz to remove line noise",
        "Analyze frequency bands (Delta/Theta/Alpha/Beta/Gamma) for mental state classification"
      );
      if (parameters.state === "sleep") {
        recommendations.push(
          "Look for K-complexes and sleep spindles in Stage 2",
          "Monitor Delta activity for deep sleep stages"
        );
      }
      break;

    case "aerospace":
      recommendations.push(
        "Monitor battery state during eclipse periods",
        "Track thermal trends across day/night cycles",
        "Schedule ground station contacts during optimal passes"
      );
      if (parameters.subsystem === "power") {
        recommendations.push(
          "Maintain battery charge above 70% for safe operations",
          "Monitor solar array voltage during sun exposure"
        );
      }
      break;

    case "structural":
      recommendations.push(
        "Maintain Factor of Safety (FOS) above 1.5 for static loads",
        "Use von Mises stress criterion for ductile materials",
        "Analyze fatigue life for cyclic loading conditions"
      );
      break;
  }

  return recommendations;
}
