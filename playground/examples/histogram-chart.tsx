"use client";

import {
  HistogramChart,
  generateNormalData,
  generateUniformData,
  generateExponentialData,
} from "@plexusui/components/charts/histogram-chart";
import { ComponentPreview } from "@/components/component-preview";
import {
  useColorScheme,
  useMultiColors,
} from "@/components/color-scheme-provider";
import { useMemo } from "react";

// ============================================================================
// Example Data
// ============================================================================

// Generate consistent datasets (memoized to avoid re-generation)
function useExampleData() {
  return useMemo(() => {
    return {
      normalData: generateNormalData(1000, 50, 15), // mean=50, stdDev=15
      uniformData: generateUniformData(800, 0, 100),
      exponentialData: generateExponentialData(600, 0.05),
      measurementData: [
        // Simulated quality control measurements (target: 100mm)
        ...generateNormalData(300, 100, 2), // Normal production
        ...generateNormalData(50, 108, 1), // Calibration drift outliers
      ],
    };
  }, []);
}

// ============================================================================
// Example Components
// ============================================================================

function BasicHistogram() {
  const { color } = useColorScheme();
  const { normalData } = useExampleData();

  return (
    <ComponentPreview
      title="Basic Histogram"
      description="Distribution analysis with automatic binning (Sturges method)"
      code={`import { HistogramChart, generateNormalData } from "@/components/plexusui/charts";

const data = generateNormalData(1000, 50, 15); // mean=50, stdDev=15

<HistogramChart
  data={data}
  binMethod="sturges"
  mode="count"
  color="#3b82f6"
  xAxis={{ label: "Value" }}
  yAxis={{ label: "Count" }}
  width={800}
  height={400}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <HistogramChart
            data={normalData}
            binMethod="sturges"
            mode="count"
            color={color}
            xAxis={{ label: "Measurement Value" }}
            yAxis={{ label: "Frequency" }}
            width={800}
            height={400}
            showTooltip
          />
        </div>
      }
    />
  );
}

function HistogramWithNormalCurve() {
  const { color } = useColorScheme();
  const { normalData } = useExampleData();

  return (
    <ComponentPreview
      title="Histogram with Normal Curve Overlay"
      description="Compare distribution to theoretical normal curve"
      code={`<HistogramChart
  data={normalData}
  binMethod="freedman-diaconis"
  mode="count"
  showNormalCurve={true}
  normalCurveColor="#ef4444"
  color="#10b981"
  xAxis={{ label: "Test Score" }}
  yAxis={{ label: "Number of Students" }}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <HistogramChart
            data={normalData}
            binMethod="freedman-diaconis"
            mode="count"
            showNormalCurve={true}
            normalCurveColor="#ef4444"
            color={color}
            xAxis={{ label: "Test Score" }}
            yAxis={{ label: "Number of Students" }}
            width={800}
            height={400}
            showTooltip
          />
        </div>
      }
    />
  );
}

function DensityHistogram() {
  const { color } = useColorScheme();
  const { exponentialData } = useExampleData();

  return (
    <ComponentPreview
      title="Probability Density Histogram"
      description="Display distribution as probability density (area under curve = 1)"
      code={`const exponentialData = generateExponentialData(600, 0.05);

<HistogramChart
  data={exponentialData}
  binMethod="scott"
  mode="density"
  color="#8b5cf6"
  xAxis={{ label: "Time to Failure (hours)" }}
  yAxis={{ label: "Probability Density" }}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <HistogramChart
            data={exponentialData}
            binMethod="scott"
            mode="density"
            color={color}
            xAxis={{ label: "Time to Failure (hours)" }}
            yAxis={{ label: "Probability Density" }}
            width={800}
            height={400}
            showTooltip
          />
        </div>
      }
    />
  );
}

function UniformDistribution() {
  const { color } = useColorScheme();
  const { uniformData } = useExampleData();

  return (
    <ComponentPreview
      title="Uniform Distribution"
      description="Random data from uniform distribution showing even spread"
      code={`const uniformData = generateUniformData(800, 0, 100);

<HistogramChart
  data={uniformData}
  binCount={20}
  mode="frequency"
  color="#f59e0b"
  xAxis={{ label: "Random Value" }}
  yAxis={{ label: "Relative Frequency" }}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <HistogramChart
            data={uniformData}
            binCount={20}
            mode="frequency"
            color={color}
            xAxis={{ label: "Random Value" }}
            yAxis={{ label: "Relative Frequency" }}
            width={800}
            height={400}
            showTooltip
          />
        </div>
      }
    />
  );
}

function QualityControlHistogram() {
  const { color } = useColorScheme();
  const { measurementData } = useExampleData();

  return (
    <ComponentPreview
      title="Quality Control Measurements"
      description="Distribution analysis for manufacturing tolerance (note outliers from calibration drift)"
      code={`// Simulated quality control measurements
// Target: 100mm ± 5mm tolerance
const measurementData = [
  ...generateNormalData(300, 100, 2),   // Normal production
  ...generateNormalData(50, 108, 1),    // Calibration drift outliers
];

<HistogramChart
  data={measurementData}
  binMethod="freedman-diaconis"
  mode="count"
  showNormalCurve={true}
  color="#06b6d4"
  normalCurveColor="#ec4899"
  xAxis={{
    label: "Dimension (mm)",
    formatter: (val) => \`\${val.toFixed(1)}mm\`
  }}
  yAxis={{ label: "Part Count" }}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <HistogramChart
            data={measurementData}
            binMethod="freedman-diaconis"
            mode="count"
            showNormalCurve={true}
            color={color}
            normalCurveColor="#ec4899"
            xAxis={{
              label: "Dimension (mm)",
              formatter: (val: number) => `${val.toFixed(1)}mm`,
            }}
            yAxis={{ label: "Part Count" }}
            width={800}
            height={400}
            showTooltip
          />
        </div>
      }
    />
  );
}

function ComparisonOfBinMethods() {
  const { normalData } = useExampleData();
  const colors = useMultiColors(3);

  return (
    <ComponentPreview
      title="Bin Method Comparison"
      description="Different binning methods can reveal different aspects of the distribution"
      code={`// Sturges: Good for normal distributions (recommended default)
<HistogramChart data={data} binMethod="sturges" />

// Scott: Good for continuous data with outliers
<HistogramChart data={data} binMethod="scott" />

// Freedman-Diaconis: Robust to outliers, good for non-normal
<HistogramChart data={data} binMethod="freedman-diaconis" />

// Manual: Specify exact number of bins
<HistogramChart data={data} binCount={15} />`}
      preview={
        <div className="w-full grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Sturges (default)</p>
            <HistogramChart
              data={normalData}
              binMethod="sturges"
              mode="count"
              color={colors[0]}
              width={380}
              height={250}
              showAxes={true}
              showGrid={false}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Scott (continuous)</p>
            <HistogramChart
              data={normalData}
              binMethod="scott"
              mode="count"
              color={colors[1]}
              width={380}
              height={250}
              showAxes={true}
              showGrid={false}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">
              Freedman-Diaconis (robust)
            </p>
            <HistogramChart
              data={normalData}
              binMethod="freedman-diaconis"
              mode="count"
              color={colors[2]}
              width={380}
              height={250}
              showAxes={true}
              showGrid={false}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Manual (15 bins)</p>
            <HistogramChart
              data={normalData}
              binCount={15}
              mode="count"
              color={colors[0]}
              width={380}
              height={250}
              showAxes={true}
              showGrid={false}
            />
          </div>
        </div>
      }
    />
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function HistogramChartExamples() {
  return (
    <div className="space-y-8">
      <BasicHistogram />
      <HistogramWithNormalCurve />
      <QualityControlHistogram />
      <DensityHistogram />
      <UniformDistribution />
      <ComparisonOfBinMethods />
    </div>
  );
}
