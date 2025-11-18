"use client";

import {
  ControlChart,
  calculateControlLimits,
  generateSPCData,
  type ControlViolation,
} from "@plexusui/components/charts/control-chart";
import { ComponentPreview } from "@/components/component-preview";
import {
  ApiReferenceTable,
  type ApiProp,
} from "@/components/api-reference-table";
import { useColorScheme } from "@/components/color-scheme-provider";
import { useMemo, useState } from "react";

// ============================================================================
// Example Data
// ============================================================================

function useExampleData() {
  return useMemo(() => {
    // Stable process
    const stableData = generateSPCData(50, 100, 2);

    // Process with drift (goes out of control after sample 30)
    const driftData = generateSPCData(60, 100, 2, 30);

    // Process with increased variation
    const variableData = generateSPCData(40, 100, 4);

    // Mix of stable and outliers
    const withOutliers = [
      ...generateSPCData(25, 100, 2),
      { x: 26, y: 112 }, // Outlier beyond UCL
      ...generateSPCData(24, 100, 2).map((p, i) => ({ ...p, x: p.x + 26 })),
    ];

    return {
      stableData,
      driftData,
      variableData,
      withOutliers,
    };
  }, []);
}

// ============================================================================
// Example Components
// ============================================================================

function BasicControlChart() {
  const { color } = useColorScheme();
  const { stableData } = useExampleData();
  const [violations, setViolations] = useState<ControlViolation[]>([]);

  const limits = useMemo(() => {
    return calculateControlLimits(stableData.map((p) => p.y));
  }, [stableData]);

  return (
    <ComponentPreview
      title="Basic Control Chart (In Control)"
      description="Process monitoring with 3-sigma control limits (UCL/LCL) and Western Electric rules"
      code={`import { ControlChart, calculateControlLimits } from "@/components/plexusui/charts";

const data = generateSPCData(50, 100, 2); // mean=100, stdDev=2
const limits = calculateControlLimits(data.map(p => p.y));

<ControlChart
  data={data}
  limits={limits}
  rules={["rule1", "rule2", "rule3", "rule4"]}
  onOutOfControl={(violations) => console.log(violations)}
  showZones={true}
  color="#3b82f6"
  xAxis={{ label: "Sample Number" }}
  yAxis={{ label: "Measurement (mm)" }}
/>`}
      preview={
        <div className="w-full h-[400px] space-y-2">
          <ControlChart
            data={stableData}
            limits={limits}
            rules={["rule1", "rule2", "rule3", "rule4"]}
            onOutOfControl={(v) => setViolations(v)}
            showZones={true}
            color={color}
            xAxis={{ label: "Sample Number" }}
            yAxis={{ label: "Measurement (mm)" }}
            width={800}
            height={350}
            showTooltip
          />
          {violations.length > 0 && (
            <div className="text-sm text-red-600 font-medium">
              ⚠️ {violations.length} violation(s) detected
            </div>
          )}
        </div>
      }
    />
  );
}

function HighVariationProcess() {
  const { color } = useColorScheme();
  const { variableData } = useExampleData();

  const limits = useMemo(() => {
    return calculateControlLimits(variableData.map((p) => p.y));
  }, [variableData]);

  return (
    <ComponentPreview
      title="High Variation Process"
      description="Process with larger standard deviation (4 vs normal 2) - still in control but wider limits"
      code={`// Higher variation process
const variableData = generateSPCData(40, 100, 4); // stdDev=4 (vs normal 2)
const limits = calculateControlLimits(variableData.map(p => p.y));

<ControlChart
  data={variableData}
  limits={limits}
  showZones={true}
  color="#f59e0b"
/>`}
      preview={
        <div className="w-full h-[400px]">
          <ControlChart
            data={variableData}
            limits={limits}
            showZones={true}
            color={color}
            xAxis={{ label: "Sample Number" }}
            yAxis={{ label: "Measurement" }}
            width={800}
            height={400}
            showTooltip
          />
        </div>
      }
    />
  );
}

function WithOutliers() {
  const { color } = useColorScheme();
  const { withOutliers } = useExampleData();
  const [violations, setViolations] = useState<ControlViolation[]>([]);

  const limits = useMemo(() => {
    return calculateControlLimits(withOutliers.map((p) => p.y));
  }, [withOutliers]);

  return (
    <ComponentPreview
      title="Outlier Detection (Rule 1)"
      description="Single point beyond 3-sigma limit detected - possible measurement error or special cause"
      code={`const withOutliers = [
  ...generateSPCData(25, 100, 2),
  { x: 26, y: 112 }, // Outlier beyond UCL
  ...generateSPCData(24, 100, 2),
];

<ControlChart
  data={withOutliers}
  limits={limits}
  rules={["rule1"]} // Only check for points beyond 3-sigma
  onOutOfControl={(violations) => {
    // Alert operator about outlier
    violations.forEach(v => console.warn(v.description));
  }}
/>`}
      preview={
        <div className="w-full h-[400px] space-y-2">
          <ControlChart
            data={withOutliers}
            limits={limits}
            rules={["rule1"]}
            onOutOfControl={(v) => setViolations(v)}
            showZones={true}
            color={color}
            xAxis={{ label: "Sample Number" }}
            yAxis={{ label: "Quality Metric" }}
            width={800}
            height={350}
            showTooltip
          />
          {violations.length > 0 && (
            <div className="text-sm text-orange-600 font-medium">
              🔍 {violations[0].description}
            </div>
          )}
        </div>
      }
    />
  );
}

function CustomLimits() {
  const { color } = useColorScheme();
  const { stableData } = useExampleData();

  // Manual control limits (engineering specification)
  const limits = {
    mean: 100,
    stdDev: 2,
    uclSigma: 3, // 3-sigma UCL/LCL
    warningSigma: 2, // 2-sigma warning limits
  };

  return (
    <ComponentPreview
      title="Custom Control Limits"
      description="Manually specified limits based on engineering specifications (target ± tolerance)"
      code={`// Engineering specification: 100mm ± 6mm (3-sigma)
const limits = {
  mean: 100,
  stdDev: 2,
  uclSigma: 3,    // UCL = 100 + 3*2 = 106mm
  warningSigma: 2, // Warning = 100 ± 2*2 = 96-104mm
};

<ControlChart
  data={measurementData}
  limits={limits}
  showZones={true}
  xAxis={{ label: "Part Number" }}
  yAxis={{
    label: "Dimension (mm)",
    formatter: (val) => \`\${val.toFixed(1)}mm\`
  }}
/>`}
      preview={
        <div className="w-full h-[400px]">
          <ControlChart
            data={stableData}
            limits={limits}
            showZones={true}
            color={color}
            xAxis={{ label: "Part Number" }}
            yAxis={{
              label: "Dimension (mm)",
              formatter: (val: number) => `${val.toFixed(1)}mm`,
            }}
            width={800}
            height={400}
            showTooltip
          />
        </div>
      }
    />
  );
}

function SelectiveRules() {
  const { color } = useColorScheme();
  const { driftData } = useExampleData();

  const limits = useMemo(() => {
    const baseline = driftData.slice(0, 30).map((p) => p.y);
    return calculateControlLimits(baseline);
  }, [driftData]);

  return (
    <ComponentPreview
      title="Selective Western Electric Rules"
      description="Apply only specific rules (Rule 1 and Rule 4) for targeted monitoring"
      code={`// Only check for extreme outliers (Rule 1) and sustained shifts (Rule 4)
<ControlChart
  data={data}
  limits={limits}
  rules={["rule1", "rule4"]} // Omit Rule 2 and Rule 3
  showZones={false} // Hide zone backgrounds for cleaner view
/>`}
      preview={
        <div className="w-full h-[400px]">
          <ControlChart
            data={driftData}
            limits={limits}
            rules={["rule1", "rule4"]}
            showZones={false}
            color={color}
            xAxis={{ label: "Sample" }}
            yAxis={{ label: "Value" }}
            width={800}
            height={400}
            showTooltip
          />
        </div>
      }
    />
  );
}

// ============================================================================
// API Reference
// ============================================================================

const controlChartProps: ApiProp[] = [
  {
    name: "data",
    type: "number[]",
    default: "required",
    description: "Array of measurement values to plot",
  },
  {
    name: "centerLine",
    type: "number | 'auto'",
    default: '"auto"',
    description: "Center line (CL) value. 'auto' calculates mean from data",
  },
  {
    name: "upperControlLimit",
    type: "number | 'auto'",
    default: '"auto"',
    description:
      "Upper Control Limit (UCL). 'auto' calculates from data (mean + 3σ)",
  },
  {
    name: "lowerControlLimit",
    type: "number | 'auto'",
    default: '"auto"',
    description:
      "Lower Control Limit (LCL). 'auto' calculates from data (mean - 3σ)",
  },
  {
    name: "upperWarningLimit",
    type: "number",
    default: "undefined",
    description: "Upper Warning Limit (mean + 2σ)",
  },
  {
    name: "lowerWarningLimit",
    type: "number",
    default: "undefined",
    description: "Lower Warning Limit (mean - 2σ)",
  },
  {
    name: "rules",
    type: "ControlRule[]",
    default: "all western electric rules",
    description:
      "SPC rules to detect special causes. Includes Western Electric rules 1-4 by default",
  },
  {
    name: "highlightViolations",
    type: "boolean",
    default: "true",
    description: "Highlight points that violate control rules",
  },
  {
    name: "xAxis",
    type: "{ label?: string, formatter?: (value: number) => string }",
    default: "{}",
    description: "X-axis configuration",
  },
  {
    name: "yAxis",
    type: "{ label?: string, formatter?: (value: number) => string }",
    default: "{}",
    description: "Y-axis configuration",
  },
  {
    name: "width",
    type: "number",
    default: "800",
    description: "Chart width in pixels",
  },
  {
    name: "height",
    type: "number",
    default: "400",
    description: "Chart height in pixels",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "true",
    description: "Show grid lines",
  },
  {
    name: "showTooltip",
    type: "boolean",
    default: "false",
    description: "Show interactive tooltip on hover",
  },
  {
    name: "preferWebGPU",
    type: "boolean",
    default: "true",
    description:
      "Prefer WebGPU rendering over WebGL. Falls back automatically if unavailable",
  },
  {
    name: "className",
    type: "string",
    default: '""',
    description: "Additional CSS classes",
  },
];

const controlViolationType: ApiProp[] = [
  {
    name: "index",
    type: "number",
    default: "-",
    description: "Index of the violating data point",
  },
  {
    name: "rule",
    type: "string",
    default: "-",
    description: "Name of the violated rule (e.g., 'Rule 1: Beyond UCL/LCL')",
  },
  {
    name: "severity",
    type: '"critical" | "warning"',
    default: "-",
    description: "Severity level of the violation",
  },
];

const helperFunctionsControl: ApiProp[] = [
  {
    name: "calculateControlLimits",
    type: "(data: number[]) => { cl: number, ucl: number, lcl: number, uwl: number, lwl: number }",
    default: "-",
    description: "Calculate control limits from data using ±3σ and ±2σ",
  },
  {
    name: "generateSPCData",
    type: "(count: number, mean?: number, stdDev?: number, outliers?: number) => number[]",
    default: "-",
    description:
      "Generate synthetic SPC data with optional outliers for testing",
  },
];

// ============================================================================
// Main Export
// ============================================================================

export function ControlChartExamples() {
  return (
    <div className="space-y-12">
      {/* Examples Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Examples</h2>
        <BasicControlChart />
        <WithOutliers />
        <HighVariationProcess />
        <CustomLimits />
        <SelectiveRules />
      </div>

      {/* API Reference Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">API Reference</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            ControlChart component for Statistical Process Control (SPC) with
            Western Electric rules
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ControlChart (All-in-One)</h3>
          <ApiReferenceTable props={controlChartProps} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ControlViolation Type</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Structure for detected control rule violations
          </p>
          <ApiReferenceTable props={controlViolationType} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Helper Functions</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Utility functions for SPC calculations and test data
          </p>
          <ApiReferenceTable props={helperFunctionsControl} />
        </div>
      </div>
    </div>
  );
}
