import { useColorScheme } from "@/components/color-scheme-provider";
import { ComponentPreview } from "@/components/component-preview";
import { normalData, temperatureData, signalData, velocityData } from "./data";
import { Histogram } from "@plexusui/components/histogram";

export const HistogramExamples = () => {
  const { color } = useColorScheme();

  return (
    <div className="space-y-12">
      {/* Basic Histogram */}
      <ComponentPreview
        title="Basic Distribution"
        description="Simple histogram showing a normal distribution with automatic binning. The data follows a bell curve centered around 50 with standard deviation of 15."
        preview={
          <div className="w-full">
            <Histogram.Root
              data={normalData}
              bins={{ count: 20 }}
              xAxis={{ label: "Value" }}
              yAxis={{ label: "Frequency" }}
              color={color}
              animate={false}
            >
              <Histogram.Container>
                <Histogram.Viewport>
                  <Histogram.Grid />
                  <Histogram.Axes />
                  <Histogram.Bars />
                  <Histogram.Tooltip />
                </Histogram.Viewport>
              </Histogram.Container>
            </Histogram.Root>
          </div>
        }
        code={`<Histogram.Root
  data={normalData}
  bins={{ count: 20 }}
  xAxis={{ label: "Value" }}
  yAxis={{ label: "Frequency" }}
  color="#06b6d4"
>
  <Histogram.Container>
    <Histogram.Viewport>
      <Histogram.Grid />
      <Histogram.Axes />
      <Histogram.Bars />
      <Histogram.Tooltip />
    </Histogram.Viewport>
  </Histogram.Container>
</Histogram.Root>`}
      />

      {/* Histogram with Statistics */}
      <ComponentPreview
        title="With Statistical Overlays"
        description="Temperature measurements with mean and median lines. Useful for quickly identifying central tendency and distribution shape in experimental data."
        preview={
          <div className="w-full">
            <Histogram.Root
              data={temperatureData}
              bins={{ count: 12 }}
              xAxis={{ label: "Temperature (°C)" }}
              yAxis={{ label: "Count" }}
              color={color}
              showMean={true}
              showMedian={true}
              animate={false}
            >
              <Histogram.Container>
                <Histogram.Viewport>
                  <Histogram.Grid />
                  <Histogram.Axes />
                  <Histogram.Bars />
                  <Histogram.Statistics />
                  <Histogram.Tooltip />
                </Histogram.Viewport>
              </Histogram.Container>
            </Histogram.Root>
          </div>
        }
        code={`<Histogram.Root
  data={temperatureData}
  bins={{ count: 12 }}
  xAxis={{ label: "Temperature (°C)" }}
  yAxis={{ label: "Count" }}
  color="#06b6d4"
  showMean={true}
  showMedian={true}
>
  <Histogram.Container>
    <Histogram.Viewport>
      <Histogram.Grid />
      <Histogram.Axes />
      <Histogram.Bars />
      <Histogram.Statistics />
      <Histogram.Tooltip />
    </Histogram.Viewport>
  </Histogram.Container>
</Histogram.Root>`}
      />

      {/* Density Mode */}
      <ComponentPreview
        title="Density Mode"
        description="Normalized density histogram showing probability distribution. The y-axis represents probability density rather than raw counts, useful for comparing distributions of different sample sizes."
        preview={
          <div className="w-full">
            <Histogram.Root
              data={normalData}
              bins={{ count: 25 }}
              xAxis={{ label: "Value" }}
              yAxis={{ label: "Density" }}
              color={color}
              mode="density"
              showMean={true}
              animate={false}
            >
              <Histogram.Container>
                <Histogram.Viewport>
                  <Histogram.Grid />
                  <Histogram.Axes />
                  <Histogram.Bars />
                  <Histogram.Statistics />
                  <Histogram.Tooltip />
                </Histogram.Viewport>
              </Histogram.Container>
            </Histogram.Root>
          </div>
        }
        code={`<Histogram.Root
  data={normalData}
  bins={{ count: 25 }}
  xAxis={{ label: "Value" }}
  yAxis={{ label: "Density" }}
  color="#06b6d4"
  mode="density"
  showMean={true}
>
  <Histogram.Container>
    <Histogram.Viewport>
      <Histogram.Grid />
      <Histogram.Axes />
      <Histogram.Bars />
      <Histogram.Statistics />
      <Histogram.Tooltip />
    </Histogram.Viewport>
  </Histogram.Container>
</Histogram.Root>`}
      />

      {/* Bimodal Distribution */}
      <ComponentPreview
        title="Bimodal Distribution"
        description="Satellite signal strength showing two distinct operating modes. The bimodal distribution reveals two separate satellite systems with different signal characteristics."
        preview={
          <div className="w-full">
            <Histogram.Root
              data={signalData}
              bins={{ count: 30 }}
              xAxis={{ label: "Signal Strength (dBm)" }}
              yAxis={{ label: "Count" }}
              color={color}
              showMean={true}
              showMedian={true}
              barGap={0.05}
              animate={false}
            >
              <Histogram.Container>
                <Histogram.Viewport>
                  <Histogram.Grid />
                  <Histogram.Axes />
                  <Histogram.Bars />
                  <Histogram.Statistics />
                  <Histogram.Tooltip />
                </Histogram.Viewport>
              </Histogram.Container>
            </Histogram.Root>
          </div>
        }
        code={`<Histogram.Root
  data={signalData}
  bins={{ count: 30 }}
  xAxis={{ label: "Signal Strength (dBm)" }}
  yAxis={{ label: "Count" }}
  color="#06b6d4"
  showMean={true}
  showMedian={true}
  barGap={0.05}
>
  <Histogram.Container>
    <Histogram.Viewport>
      <Histogram.Grid />
      <Histogram.Axes />
      <Histogram.Bars />
      <Histogram.Statistics />
      <Histogram.Tooltip />
    </Histogram.Viewport>
  </Histogram.Container>
</Histogram.Root>`}
      />

      {/* Physical Distribution */}
      <ComponentPreview
        title="Particle Velocity Distribution"
        description="Maxwell-Boltzmann velocity distribution for gas particles. This right-skewed distribution is characteristic of kinetic theory and shows the probability distribution of particle speeds in an ideal gas."
        preview={
          <div className="w-full">
            <Histogram.Root
              data={velocityData}
              bins={{ count: 40 }}
              xAxis={{ label: "Velocity (m/s)" }}
              yAxis={{ label: "Frequency" }}
              color={color}
              mode="count"
              showMean={true}
              barOpacity={0.9}
              animate={false}
            >
              <Histogram.Container>
                <Histogram.Viewport>
                  <Histogram.Grid />
                  <Histogram.Axes />
                  <Histogram.Bars />
                  <Histogram.Statistics />
                  <Histogram.Tooltip />
                </Histogram.Viewport>
              </Histogram.Container>
            </Histogram.Root>
          </div>
        }
        code={`<Histogram.Root
  data={velocityData}
  bins={{ count: 40 }}
  xAxis={{ label: "Velocity (m/s)" }}
  yAxis={{ label: "Frequency" }}
  color="#06b6d4"
  mode="count"
  showMean={true}
  barOpacity={0.9}
>
  <Histogram.Container>
    <Histogram.Viewport>
      <Histogram.Grid />
      <Histogram.Axes />
      <Histogram.Bars />
      <Histogram.Statistics />
      <Histogram.Tooltip />
    </Histogram.Viewport>
  </Histogram.Container>
</Histogram.Root>`}
      />
    </div>
  );
};

export { histogramApiProps as HistogramApiReference } from "./api/histogram";
