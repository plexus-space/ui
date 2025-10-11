import { useColorScheme } from "@/components/color-scheme-provider";
import { ComponentPreview } from "@/components/component-preview";
import { BoxPlot } from "@plexusui/components/box-plot";
import { normalData, temperatureData } from "./data";

export const BoxPlotExamples = () => {
  const { color } = useColorScheme();

  return (
    <div className="space-y-12">
      {/* Basic Box Plot */}
      <ComponentPreview
        title="Basic Box Plot"
        description="Statistical distribution visualization showing quartiles, median, and outliers across multiple categories. Each box represents the interquartile range (IQR) with whiskers extending to 1.5×IQR."
        preview={
          <div className="w-full">
            <BoxPlot.Root
              data={[
                {
                  name: "Sample A",
                  values: normalData.slice(0, 30),
                  color: color,
                },
                { name: "Sample B", values: temperatureData, color: "#8b5cf6" },
                {
                  name: "Sample C",
                  values: normalData.slice(30, 60),
                  color: "#f59e0b",
                },
              ]}
              yAxis={{ label: "Value" }}
              animate={false}
            >
              <BoxPlot.Container>
                <BoxPlot.Viewport>
                  <BoxPlot.Grid />
                  <BoxPlot.Axes />
                  <BoxPlot.Boxes />
                  <BoxPlot.Tooltip />
                </BoxPlot.Viewport>
              </BoxPlot.Container>
            </BoxPlot.Root>
          </div>
        }
        code={`<BoxPlot.Root
  data={[
    { name: "Sample A", values: sampleA, color: "#06b6d4" },
    { name: "Sample B", values: sampleB, color: "#8b5cf6" },
    { name: "Sample C", values: sampleC, color: "#f59e0b" },
  ]}
  yAxis={{ label: "Value" }}
>
  <BoxPlot.Container>
    <BoxPlot.Viewport>
      <BoxPlot.Grid />
      <BoxPlot.Axes />
      <BoxPlot.Boxes />
      <BoxPlot.Tooltip />
    </BoxPlot.Viewport>
  </BoxPlot.Container>
</BoxPlot.Root>`}
      />

      {/* Horizontal Box Plot */}
      <ComponentPreview
        title="Horizontal Orientation"
        description="Box plots displayed horizontally for easier label reading and compact vertical space. Ideal for comparing many categories or when category names are long."
        preview={
          <div className="w-full">
            <BoxPlot.Root
              data={[
                {
                  name: "Control Group",
                  values: normalData.slice(0, 25),
                  color: color,
                },
                {
                  name: "Treatment A",
                  values: temperatureData.slice(0, 25),
                  color: "#8b5cf6",
                },
                {
                  name: "Treatment B",
                  values: normalData.slice(25, 50),
                  color: "#f59e0b",
                },
                {
                  name: "Treatment C",
                  values: temperatureData.slice(25),
                  color: "#ef4444",
                },
              ]}
              orientation="horizontal"
              xAxis={{ label: "Measurement" }}
              showMean={true}
              animate={false}
            >
              <BoxPlot.Container>
                <BoxPlot.Viewport>
                  <BoxPlot.Grid />
                  <BoxPlot.Axes />
                  <BoxPlot.Boxes />
                  <BoxPlot.Tooltip />
                </BoxPlot.Viewport>
              </BoxPlot.Container>
            </BoxPlot.Root>
          </div>
        }
        code={`<BoxPlot.Root
  data={[
    { name: "Control Group", values: control, color: "#06b6d4" },
    { name: "Treatment A", values: treatmentA, color: "#8b5cf6" },
    { name: "Treatment B", values: treatmentB, color: "#f59e0b" },
    { name: "Treatment C", values: treatmentC, color: "#ef4444" },
  ]}
  orientation="horizontal"
  xAxis={{ label: "Measurement" }}
  showMean={true}
>
  <BoxPlot.Container>
    <BoxPlot.Viewport>
      <BoxPlot.Grid />
      <BoxPlot.Axes />
      <BoxPlot.Boxes />
      <BoxPlot.Tooltip />
    </BoxPlot.Viewport>
  </BoxPlot.Container>
</BoxPlot.Root>`}
      />
    </div>
  );
};

export { boxPlotApiProps as BoxPlotApiReference } from "./api/box-plot";
