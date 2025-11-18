"use client";

import { BarChart } from "@plexusui/components/charts/bar-chart";
import type { DataPoint } from "@plexusui/components/charts/bar-chart";
import { ComponentPreview } from "@/components/component-preview";
import { ApiReferenceTable, type ApiProp } from "@/components/api-reference-table";
import {
  useColorScheme,
  useMultiColors,
} from "@/components/color-scheme-provider";

// ============================================================================
// Example Data
// ============================================================================

const monthlyData: DataPoint[] = [
  { x: "Jan", y: 45 },
  { x: "Feb", y: 52 },
  { x: "Mar", y: 48 },
  { x: "Apr", y: 61 },
  { x: "May", y: 55 },
  { x: "Jun", y: 67 },
];

const quarterlyData = [
  { x: "Q1", y: 145 },
  { x: "Q2", y: 183 },
  { x: "Q3", y: 201 },
  { x: "Q4", y: 167 },
];

const departmentData: DataPoint[] = [
  { x: "Engineering", y: 85 },
  { x: "Design", y: 62 },
  { x: "Sales", y: 78 },
  { x: "Marketing", y: 54 },
  { x: "Support", y: 91 },
];

// ============================================================================
// Example Components
// ============================================================================

function BasicBarChart() {
  const { color } = useColorScheme();

  return (
    <ComponentPreview
      title="Basic Bar Chart"
      description="Simple vertical bar chart showing monthly metrics"
      code={`import { BarChart } from "@/components/plexusui/charts/bar-chart";

const data = [
  { x: "Jan", y: 45 },
  { x: "Feb", y: 52 },
  { x: "Mar", y: 48 },
  { x: "Apr", y: 61 },
  { x: "May", y: 55 },
  { x: "Jun", y: 67 },
];

<BarChart
  series={[{ name: "Revenue", data, color: "#3b82f6" }]}
  width={800}
  height={400}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <BarChart
            series={[{ name: "Revenue ($K)", data: monthlyData, color: color }]}
            yAxis={{ label: "Revenue ($K)" }}
            width={800}
            height={400}
            showTooltip
            barWidth={60}
          />
        </div>
      }
    />
  );
}

function GroupedBarChart() {
  const colors = useMultiColors(2);

  return (
    <ComponentPreview
      title="Grouped Bar Chart"
      description="Multiple series displayed side-by-side for comparison"
      code={`const actualData = [
  { x: "Q1", y: 145 },
  { x: "Q2", y: 183 },
  { x: "Q3", y: 201 },
  { x: "Q4", y: 167 },
];

const targetData = [
  { x: "Q1", y: 150 },
  { x: "Q2", y: 175 },
  { x: "Q3", y: 190 },
  { x: "Q4", y: 180 },
];

<BarChart
  series={[
    { name: "Actual", data: actualData, color: "#10b981" },
    { name: "Target", data: targetData, color: "#6366f1" },
  ]}
  grouped={true}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <BarChart
            series={[
              { name: "Actual", data: quarterlyData, color: colors[0] },
              {
                name: "Target",
                data: [
                  { x: "Q1", y: 150 },
                  { x: "Q2", y: 175 },
                  { x: "Q3", y: 190 },
                  { x: "Q4", y: 180 },
                ],
                color: colors[1],
              },
            ]}
            yAxis={{ label: "Sales ($K)" }}
            width={800}
            height={400}
            grouped={true}
            showTooltip
            barWidth={80}
          />
        </div>
      }
    />
  );
}

function HorizontalBarChart() {
  const { color } = useColorScheme();

  return (
    <ComponentPreview
      title="Horizontal Bar Chart"
      description="Bar chart with horizontal orientation for categorical data"
      code={`const departmentData = [
  { x: "Engineering", y: 85 },
  { x: "Design", y: 62 },
  { x: "Sales", y: 78 },
  { x: "Marketing", y: 54 },
  { x: "Support", y: 91 },
];

<BarChart
  series={[{ name: "Team Size", data: departmentData, color: "#f59e0b" }]}
  orientation="horizontal"
  xAxis={{ label: "Number of Employees" }}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <BarChart
            series={[{ name: "Team Size", data: departmentData, color: color }]}
            orientation="horizontal"
            xAxis={{ label: "Number of Employees" }}
            width={800}
            height={400}
            showTooltip
            barWidth={50}
          />
        </div>
      }
    />
  );
}

function StackedBarChart() {
  const colors = useMultiColors(3);

  return (
    <ComponentPreview
      title="Multi-Category Comparison"
      description="Comparing multiple metrics across categories"
      code={`<BarChart
  series={[
    { name: "Product A", data: dataA, color: "#ef4444" },
    { name: "Product B", data: dataB, color: "#3b82f6" },
    { name: "Product C", data: dataC, color: "#10b981" },
  ]}
  grouped={true}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <BarChart
            series={[
              {
                name: "Product A",
                data: [
                  { x: "Jan", y: 30 },
                  { x: "Feb", y: 35 },
                  { x: "Mar", y: 28 },
                  { x: "Apr", y: 40 },
                ],
                color: colors[0],
              },
              {
                name: "Product B",
                data: [
                  { x: "Jan", y: 45 },
                  { x: "Feb", y: 50 },
                  { x: "Mar", y: 48 },
                  { x: "Apr", y: 55 },
                ],
                color: colors[1],
              },
              {
                name: "Product C",
                data: [
                  { x: "Jan", y: 25 },
                  { x: "Feb", y: 30 },
                  { x: "Mar", y: 35 },
                  { x: "Apr", y: 32 },
                ],
                color: colors[2],
              },
            ]}
            yAxis={{ label: "Sales (Units)" }}
            width={800}
            height={400}
            grouped={true}
            showTooltip
            barWidth={100}
          />
        </div>
      }
    />
  );
}

function PrimitiveBarChart() {
  const { color } = useColorScheme();

  return (
    <ComponentPreview
      title="Primitive Components"
      description="Build custom bar charts with primitive components"
      code={`import { BarChart } from "@/components/plexusui/charts/bar-chart";

<BarChart.Root
  series={[{ name: "Data", data, color: "#8b5cf6" }]}
  width={800}
  height={400}
>
  <BarChart.Canvas showGrid />
  <BarChart.Axes />
  <BarChart.Tooltip />
</BarChart.Root>`}
      preview={
        <div className="w-full h-[400px]">
          <BarChart.Root
            series={[
              { name: "Custom Metrics", data: monthlyData, color: color },
            ]}
            width={800}
            height={400}
            preferWebGPU={true}
          >
            <BarChart.Canvas showGrid />
            <BarChart.Axes />
            <BarChart.Tooltip />
          </BarChart.Root>
        </div>
      }
    />
  );
}

// ============================================================================
// API Reference
// ============================================================================

const barChartProps: ApiProp[] = [
  {
    name: "series",
    type: "Series[]",
    default: "required",
    description: "Array of data series. Series: { name: string, data: Point[], color?: string }",
  },
  {
    name: "xAxis",
    type: "{ label?: string, formatter?: (value: string | number) => string }",
    default: "{}",
    description: "X-axis configuration",
  },
  {
    name: "yAxis",
    type: "{ label?: string, domain?: [number, number] | 'auto', formatter?: (value: number) => string }",
    default: "{}",
    description: "Y-axis configuration",
  },
  {
    name: "orientation",
    type: '"vertical" | "horizontal"',
    default: '"vertical"',
    description: "Bar chart orientation",
  },
  {
    name: "grouped",
    type: "boolean",
    default: "false",
    description: "Display multiple series side-by-side (grouped) or as single bars",
  },
  {
    name: "barWidth",
    type: "number",
    default: "auto",
    description: "Width of each bar in pixels (or bar group width when grouped)",
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
    name: "showAxes",
    type: "boolean",
    default: "true",
    description: "Show axis labels and ticks",
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
    description: "Prefer WebGPU rendering over WebGL. Falls back automatically if unavailable",
  },
  {
    name: "className",
    type: "string",
    default: '""',
    description: "Additional CSS classes",
  },
];

const barSeriesType: ApiProp[] = [
  {
    name: "name",
    type: "string",
    default: "required",
    description: "Series name for legend and tooltip",
  },
  {
    name: "data",
    type: "Point[]",
    default: "required",
    description: "Array of data points. Point: { x: string | number, y: number }",
  },
  {
    name: "color",
    type: "string",
    default: '"#3b82f6"',
    description: "Bar color (hex or rgb)",
  },
];

const barChartRootProps: ApiProp[] = [
  {
    name: "series",
    type: "Series[]",
    default: "required",
    description: "Array of data series to plot",
  },
  {
    name: "xAxis",
    type: "{ label?: string, formatter?: (value: string | number) => string }",
    default: "{}",
    description: "X-axis configuration",
  },
  {
    name: "yAxis",
    type: "{ label?: string, domain?: [number, number] | 'auto', formatter?: (value: number) => string }",
    default: "{}",
    description: "Y-axis configuration",
  },
  {
    name: "orientation",
    type: '"vertical" | "horizontal"',
    default: '"vertical"',
    description: "Bar chart orientation",
  },
  {
    name: "grouped",
    type: "boolean",
    default: "false",
    description: "Display multiple series side-by-side",
  },
  {
    name: "barWidth",
    type: "number",
    default: "auto",
    description: "Width of each bar in pixels",
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
    name: "preferWebGPU",
    type: "boolean",
    default: "true",
    description: "Prefer WebGPU rendering",
  },
  {
    name: "children",
    type: "ReactNode",
    default: "undefined",
    description: "Primitive components (Canvas, Axes, Tooltip)",
  },
];

const barChartPrimitiveProps: ApiProp[] = [
  {
    name: "BarChart.Canvas",
    type: "component",
    default: "-",
    description: "Renders the bar series. Props: showGrid?: boolean",
  },
  {
    name: "BarChart.Axes",
    type: "component",
    default: "-",
    description: "Renders x and y axis with labels and ticks",
  },
  {
    name: "BarChart.Tooltip",
    type: "component",
    default: "-",
    description: "Interactive tooltip showing data values on hover",
  },
];

// ============================================================================
// Main Export
// ============================================================================

export function BarChartExamples() {
  return (
    <div className="space-y-12">
      {/* Examples Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Examples</h2>
        <BasicBarChart />
        <GroupedBarChart />
        <HorizontalBarChart />
        <StackedBarChart />
        <PrimitiveBarChart />
      </div>

      {/* API Reference Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">API Reference</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            BarChart component for comparing categorical data with vertical or horizontal bars
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">BarChart (All-in-One)</h3>
          <ApiReferenceTable props={barChartProps} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Series Type</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Configuration for each data series in the chart
          </p>
          <ApiReferenceTable props={barSeriesType} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">BarChart.Root (Composable)</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Root component for building custom layouts with primitives
          </p>
          <ApiReferenceTable props={barChartRootProps} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Primitive Components</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Use with BarChart.Root for complete control over composition
          </p>
          <ApiReferenceTable props={barChartPrimitiveProps} />
        </div>
      </div>
    </div>
  );
}
