import { useColorScheme } from "@/components/color-scheme-provider";
import { normalData, temperatureData } from "./data";
import { ComponentPreview } from "@/components/component-preview";
import { ViolinPlot } from "@plexusui/components/violin-plot";

export const ViolinPlotExamples = () => {
  const { color } = useColorScheme();

  return (
    <div className="space-y-12">
      {/* Basic Violin Plot */}
      <ComponentPreview
        title="Basic Violin Plot"
        description="Probability density visualization using kernel density estimation. The width at each value represents the probability density, providing more information about the distribution shape than traditional box plots."
        preview={
          <div className="w-full">
            <ViolinPlot.Root
              data={[
                {
                  name: "Dataset A",
                  values: normalData.slice(0, 30),
                  color: color,
                },
                {
                  name: "Dataset B",
                  values: temperatureData,
                  color: "#8b5cf6",
                },
                {
                  name: "Dataset C",
                  values: normalData.slice(30, 60),
                  color: "#f59e0b",
                },
              ]}
              yAxis={{ label: "Value" }}
              animate={false}
            >
              <ViolinPlot.Container>
                <ViolinPlot.Viewport>
                  <ViolinPlot.Grid />
                  <ViolinPlot.Axes />
                  <ViolinPlot.Violins />
                  <ViolinPlot.Tooltip />
                </ViolinPlot.Viewport>
              </ViolinPlot.Container>
            </ViolinPlot.Root>
          </div>
        }
        code={`<ViolinPlot.Root
  data={[
    { name: "Dataset A", values: dataA, color: "#06b6d4" },
    { name: "Dataset B", values: dataB, color: "#8b5cf6" },
    { name: "Dataset C", values: dataC, color: "#f59e0b" },
  ]}
  yAxis={{ label: "Value" }}
>
  <ViolinPlot.Container>
    <ViolinPlot.Viewport>
      <ViolinPlot.Grid />
      <ViolinPlot.Axes />
      <ViolinPlot.Violins />
      <ViolinPlot.Tooltip />
    </ViolinPlot.Viewport>
  </ViolinPlot.Container>
</ViolinPlot.Root>`}
      />

      <ComponentPreview
        title="Horizontal Orientation"
        description="Violin plots displayed horizontally with inner box plots showing quartiles. The combination provides both detailed distribution shape and traditional statistical summaries."
        preview={
          <div className="w-full">
            <ViolinPlot.Root
              data={[
                {
                  name: "Baseline",
                  values: normalData.slice(0, 30),
                  color: color,
                },
                {
                  name: "Week 1",
                  values: temperatureData.slice(0, 20),
                  color: "#8b5cf6",
                },
                {
                  name: "Week 2",
                  values: normalData.slice(30, 60),
                  color: "#f59e0b",
                },
                {
                  name: "Week 4",
                  values: temperatureData.slice(20),
                  color: "#ef4444",
                },
              ]}
              orientation="horizontal"
              xAxis={{ label: "Performance Score" }}
              showBox={true}
              showMean={true}
              animate={false}
            >
              <ViolinPlot.Container>
                <ViolinPlot.Viewport>
                  <ViolinPlot.Grid />
                  <ViolinPlot.Axes />
                  <ViolinPlot.Violins />
                  <ViolinPlot.Tooltip />
                </ViolinPlot.Viewport>
              </ViolinPlot.Container>
            </ViolinPlot.Root>
          </div>
        }
        code={`<ViolinPlot.Root
  data={[
    { name: "Baseline", values: baseline, color: "#06b6d4" },
    { name: "Week 1", values: week1, color: "#8b5cf6" },
    { name: "Week 2", values: week2, color: "#f59e0b" },
    { name: "Week 4", values: week4, color: "#ef4444" },
  ]}
  orientation="horizontal"
  xAxis={{ label: "Performance Score" }}
  showBox={true}
  showMean={true}
>
  <ViolinPlot.Container>
    <ViolinPlot.Viewport>
      <ViolinPlot.Grid />
      <ViolinPlot.Axes />
      <ViolinPlot.Violins />
      <ViolinPlot.Tooltip />
    </ViolinPlot.Viewport>
  </ViolinPlot.Container>
</ViolinPlot.Root>`}
      />
    </div>
  );
};

export { violinPlotApiProps as ViolinPlotApiReference } from "./api/violin-plot";
