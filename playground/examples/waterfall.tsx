import { useColorScheme } from "@/components/color-scheme-provider";
import { WaterfallDataPoint } from "@plexusui/components/waterfall-plot";
import { useMemo } from "react";
import { seededRandom } from "./data";
import { ComponentPreview } from "@/components/component-preview";
import { WaterfallPlot } from "@plexusui/components/waterfall-plot";

export const WaterfallPlotExamples = () => {
  const { color } = useColorScheme();

  // Generate spectral emission data similar to the reference image
  const spectralData = useMemo(() => {
    const random = seededRandom(42);
    const points: WaterfallDataPoint[] = [];

    // Generate data for multiple excitation wavelengths (Y-axis)
    for (let excitation = 600; excitation <= 850; excitation += 10) {
      // For each excitation, generate emission spectrum (X-axis)
      for (let emission = 800; emission <= 1400; emission += 5) {
        // Create multiple peaks that shift with excitation wavelength
        const peak1Center = 900 + (excitation - 600) * 0.8;
        const peak1 =
          Math.exp(-Math.pow((emission - peak1Center) / 60, 2)) * 2000;

        const peak2Center = 1100 + (excitation - 600) * 0.6;
        const peak2 =
          Math.exp(-Math.pow((emission - peak2Center) / 70, 2)) * 1500;

        const peak3Center = 1300 + (excitation - 600) * 0.4;
        const peak3 =
          Math.exp(-Math.pow((emission - peak3Center) / 55, 2)) * 1200;

        // Background noise
        const noise = random() * 50;

        // Intensity varies with excitation
        const excitationEffect =
          0.3 + 0.7 * Math.sin(((excitation - 600) / 250) * Math.PI);

        const intensity = (peak1 + peak2 + peak3) * excitationEffect + noise;

        points.push({
          x: emission,
          y: excitation,
          z: Math.max(0, intensity),
        });
      }
    }

    return points;
  }, []);

  // Generate signal processing data
  const signalData = useMemo(() => {
    const random = seededRandom(123);
    const points: WaterfallDataPoint[] = [];

    // Generate frequency spectrum over time
    for (let time = 0; time <= 10; time += 0.5) {
      for (let freq = 0; freq <= 5000; freq += 40) {
        // Create a chirp signal
        const chirpFreq = 500 + time * 400;
        const chirpMag = Math.exp(-Math.pow((freq - chirpFreq) / 200, 2)) * 60;

        // Add harmonics
        const harmonic1 = Math.exp(-Math.pow((freq - 1500) / 150, 2)) * 30;
        const harmonic2 = Math.exp(-Math.pow((freq - 3000) / 180, 2)) * 20;

        // Time-varying envelope
        const envelope = 0.5 + 0.5 * Math.sin(time * Math.PI * 0.5);

        // Background noise
        const noise = random() * 2;

        const magnitude = (chirpMag + harmonic1 + harmonic2) * envelope + noise;

        points.push({
          x: freq,
          y: time,
          z: Math.max(0, magnitude),
        });
      }
    }

    return points;
  }, []);

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Interactive Rotation"
        description="Drag horizontally to rotate the waterfall plot and view from different angles. This interactive example uses the same signal processing data with grid lines for better depth perception."
        preview={
          <div className="w-full">
            <WaterfallPlot.Root
              data={signalData}
              xAxis={{ label: "Frequency (Hz)" }}
              yAxis={{ label: "Time (s)" }}
              zAxis={{ label: "Magnitude" }}
              colorScale="jet"
            >
              <WaterfallPlot.Container>
                <WaterfallPlot.Viewport height={500}>
                  <WaterfallPlot.Box />
                  <WaterfallPlot.Grid />
                  <WaterfallPlot.Lines />
                  <WaterfallPlot.Axes />
                  <WaterfallPlot.ColorBar />
                  <WaterfallPlot.Crosshairs />
                  <WaterfallPlot.Tooltip />
                </WaterfallPlot.Viewport>
              </WaterfallPlot.Container>
            </WaterfallPlot.Root>
          </div>
        }
        code={`<WaterfallPlot.Root
  data={signalData}
  xAxis={{ label: "Frequency (Hz)" }}
  yAxis={{ label: "Time (s)" }}
  zAxis={{ label: "Magnitude" }}
  colorScale="jet"
>
  <WaterfallPlot.Container>
    <WaterfallPlot.Viewport>
      <WaterfallPlot.Box />
      <WaterfallPlot.Grid />
      <WaterfallPlot.Lines />
      <WaterfallPlot.Axes />
      <WaterfallPlot.ColorBar />
      <WaterfallPlot.Crosshairs />
      <WaterfallPlot.Tooltip />
    </WaterfallPlot.Viewport>
  </WaterfallPlot.Container>
</WaterfallPlot.Root>`}
      />
    </div>
  );
};

export { waterfallPlotApiProps as WaterfallPlotApiReference } from "./api/waterfall-plot";
