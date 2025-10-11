import { useColorScheme } from "@/components/color-scheme-provider";
import { useMemo } from "react";
import { ComponentPreview } from "@/components/component-preview";
import { BarChart } from "@plexusui/components/bar-chart";

export const BarChartExamples = () => {
  const { color } = useColorScheme();

  // Monthly sales data
  const salesData = useMemo(() => {
    return [
      { category: "Jan", value: 45 },
      { category: "Feb", value: 52 },
      { category: "Mar", value: 61 },
      { category: "Apr", value: 58 },
      { category: "May", value: 67 },
      { category: "Jun", value: 73 },
    ];
  }, []);

  // Multi-series revenue data for grouped bars
  const revenueData = useMemo(() => {
    return [
      {
        name: "Product A",
        data: [
          { category: "Q1", value: 120 },
          { category: "Q2", value: 135 },
          { category: "Q3", value: 148 },
          { category: "Q4", value: 162 },
        ],
        color: color,
      },
      {
        name: "Product B",
        data: [
          { category: "Q1", value: 95 },
          { category: "Q2", value: 108 },
          { category: "Q3", value: 121 },
          { category: "Q4", value: 134 },
        ],
        color: "#ef4444",
      },
      {
        name: "Product C",
        data: [
          { category: "Q1", value: 78 },
          { category: "Q2", value: 85 },
          { category: "Q3", value: 92 },
          { category: "Q4", value: 101 },
        ],
        color: "#f59e0b",
      },
    ];
  }, [color]);

  // Stacked data - mission phases
  const missionData = useMemo(() => {
    return [
      {
        name: "Planning",
        data: [
          { category: "Phase 1", value: 120 },
          { category: "Phase 2", value: 80 },
          { category: "Phase 3", value: 60 },
          { category: "Phase 4", value: 40 },
        ],
        color: color,
      },
      {
        name: "Execution",
        data: [
          { category: "Phase 1", value: 80 },
          { category: "Phase 2", value: 140 },
          { category: "Phase 3", value: 160 },
          { category: "Phase 4", value: 120 },
        ],
        color: "#10b981",
      },
      {
        name: "Analysis",
        data: [
          { category: "Phase 1", value: 40 },
          { category: "Phase 2", value: 60 },
          { category: "Phase 3", value: 80 },
          { category: "Phase 4", value: 140 },
        ],
        color: "#3b82f6",
      },
    ];
  }, [color]);

  // Horizontal bar data - satellite performance
  const satelliteData = useMemo(() => {
    return [
      {
        name: "Satellites",
        data: [
          { category: "GOES-16", value: 98.5 },
          { category: "NOAA-20", value: 96.2 },
          { category: "Landsat 9", value: 99.1 },
          { category: "Sentinel-2", value: 94.8 },
          { category: "Terra", value: 97.3 },
        ],
        color: color,
      },
    ];
  }, [color]);

  return (
    <div className="space-y-12">
      {/* Simple Vertical Bar Chart */}
      <ComponentPreview
        title="Vertical Bar Chart"
        description="Basic vertical bar chart showing monthly sales data. Clean and straightforward visualization for categorical data with single series."
        preview={
          <div className="w-full">
            <BarChart.Root
              series={[
                {
                  name: "Sales",
                  data: salesData,
                  color: color,
                },
              ]}
              xAxis={{ label: "Month" }}
              yAxis={{ label: "Sales ($K)" }}
              orientation="vertical"
              mode="grouped"
              animate={false}
            >
              <BarChart.Container>
                <BarChart.Viewport>
                  <BarChart.Grid />
                  <BarChart.Axes />
                  <BarChart.Bars />
                  <BarChart.Interaction />
                  <BarChart.Tooltip />
                </BarChart.Viewport>
              </BarChart.Container>
            </BarChart.Root>
          </div>
        }
        code={`<BarChart.Root
  series={[
    {
      name: "Sales",
      data: salesData,
      color: "#3b82f6",
    },
  ]}
  xAxis={{ label: "Month" }}
  yAxis={{ label: "Sales ($K)" }}
  orientation="vertical"
  mode="grouped"
>
  <BarChart.Container>
    <BarChart.Viewport>
      <BarChart.Grid />
      <BarChart.Axes />
      <BarChart.Bars />
      <BarChart.Interaction />
      <BarChart.Tooltip />
    </BarChart.Viewport>
  </BarChart.Container>
</BarChart.Root>`}
      />

      {/* Grouped Bar Chart */}
      <ComponentPreview
        title="Grouped Bar Chart"
        description="Multiple series displayed side-by-side for easy comparison. Perfect for comparing multiple products or categories across time periods."
        preview={
          <div className="w-full">
            <BarChart.Root
              series={revenueData}
              xAxis={{ label: "Quarter" }}
              yAxis={{ label: "Revenue ($K)" }}
              orientation="vertical"
              mode="grouped"
              barWidth={0.7}
              barGap={0.05}
              animate={false}
            >
              <BarChart.Container>
                <BarChart.Viewport>
                  <BarChart.Grid />
                  <BarChart.Axes />
                  <BarChart.Bars />
                  <BarChart.Interaction />
                  <BarChart.Tooltip />
                </BarChart.Viewport>
              </BarChart.Container>
            </BarChart.Root>
          </div>
        }
        code={`<BarChart.Root
  series={revenueData}
  xAxis={{ label: "Quarter" }}
  yAxis={{ label: "Revenue ($K)" }}
  orientation="vertical"
  mode="grouped"
  barWidth={0.7}
>
  <BarChart.Container>
    <BarChart.Viewport>
      <BarChart.Grid />
      <BarChart.Axes />
      <BarChart.Bars />
      <BarChart.Interaction />
      <BarChart.Tooltip />
    </BarChart.Viewport>
  </BarChart.Container>
</BarChart.Root>`}
      />

      {/* Stacked Bar Chart */}
      <ComponentPreview
        title="Stacked Bar Chart"
        description="Stacked bars showing the composition of totals across categories. Ideal for showing part-to-whole relationships over time or across categories."
        preview={
          <div className="w-full">
            <BarChart.Root
              series={missionData}
              xAxis={{ label: "Mission Phase" }}
              yAxis={{ label: "Hours Allocated" }}
              orientation="vertical"
              mode="stacked"
              animate={false}
            >
              <BarChart.Container>
                <BarChart.Viewport>
                  <BarChart.Grid />
                  <BarChart.Axes />
                  <BarChart.Bars />
                  <BarChart.Interaction />
                  <BarChart.Tooltip />
                </BarChart.Viewport>
              </BarChart.Container>
            </BarChart.Root>
          </div>
        }
        code={`<BarChart.Root
  series={missionData}
  xAxis={{ label: "Mission Phase" }}
  yAxis={{ label: "Hours Allocated" }}
  orientation="vertical"
  mode="stacked"
>
  <BarChart.Container>
    <BarChart.Viewport>
      <BarChart.Grid />
      <BarChart.Axes />
      <BarChart.Bars />
      <BarChart.Interaction />
      <BarChart.Tooltip />
    </BarChart.Viewport>
  </BarChart.Container>
</BarChart.Root>`}
      />

      {/* Horizontal Bar Chart */}
      <ComponentPreview
        title="Horizontal Bar Chart"
        description="Horizontal orientation is ideal for comparing values with longer category labels. Perfect for rankings, ratings, or performance metrics."
        preview={
          <div className="w-full">
            <BarChart.Root
              series={satelliteData}
              xAxis={{ label: "Uptime (%)" }}
              yAxis={{ label: "Satellite" }}
              orientation="horizontal"
              mode="grouped"
              animate={false}
            >
              <BarChart.Container>
                <BarChart.Viewport>
                  <BarChart.Grid />
                  <BarChart.Axes />
                  <BarChart.Bars />
                  <BarChart.Interaction />
                  <BarChart.Tooltip />
                </BarChart.Viewport>
              </BarChart.Container>
            </BarChart.Root>
          </div>
        }
        code={`<BarChart.Root
  series={satelliteData}
  xAxis={{ label: "Uptime (%)" }}
  yAxis={{ label: "Satellite" }}
  orientation="horizontal"
  mode="grouped"
>
  <BarChart.Container>
    <BarChart.Viewport>
      <BarChart.Grid />
      <BarChart.Axes />
      <BarChart.Bars />
      <BarChart.Interaction />
      <BarChart.Tooltip />
    </BarChart.Viewport>
  </BarChart.Container>
</BarChart.Root>`}
      />
    </div>
  );
};

export { barChartApiProps as BarChartApiReference } from "./api/bar-chart";
