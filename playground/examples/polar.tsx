import { useColorScheme } from "@/components/color-scheme-provider";
import { useMemo } from "react";
import { seededRandom } from "./data";
import { ComponentPreview } from "@/components/component-preview";
import { PolarPlot } from "@plexusui/components/polar-plot";

export const PolarPlotExamples = () => {
  const { color } = useColorScheme();

  // Antenna radiation pattern
  const radiationPattern = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const theta = (i / 36) * 2 * Math.PI;
        const r = 0.5 + 0.5 * Math.abs(Math.cos(2 * theta));
        return { theta, r };
      }),
    []
  );

  // Radar chart for spacecraft subsystems
  const subsystemHealth = useMemo(
    () => [
      { theta: 0, r: 0.9, label: "Power" },
      { theta: Math.PI / 3, r: 0.7, label: "Propulsion" },
      { theta: (2 * Math.PI) / 3, r: 0.85, label: "Thermal" },
      { theta: Math.PI, r: 0.95, label: "Comm" },
      { theta: (4 * Math.PI) / 3, r: 0.6, label: "ADCS" },
      { theta: (5 * Math.PI) / 3, r: 0.8, label: "CDH" },
    ],
    []
  );

  // Wind rose (directional data)
  const windData = useMemo(() => {
    const random = seededRandom(11111);
    return Array.from({ length: 16 }, (_, i) => {
      const theta = (i / 16) * 2 * Math.PI;
      const r = random() * 0.5 + 0.3;
      return { theta, r };
    });
  }, []);

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Antenna Radiation Pattern"
        description="Polar plot showing the directional gain pattern of an antenna."
        preview={
          <div className="flex justify-center w-full">
            <div
              className="w-full max-w-[600px]"
              style={{ aspectRatio: "1/1" }}
            >
              <PolarPlot.Root
                series={[
                  {
                    name: "Gain Pattern",
                    data: radiationPattern,
                    color: color,
                    filled: true,
                    closed: true,
                  },
                ]}
                axis={{
                  label: "Gain (dB)",
                  angleLabels: [
                    "0°",
                    "45°",
                    "90°",
                    "135°",
                    "180°",
                    "225°",
                    "270°",
                    "315°",
                  ],
                  rings: 5,
                }}
                showLegend={false}
                variant="polar"
                responsive={true}
              >
                <PolarPlot.Container>
                  <PolarPlot.Viewport>
                    <PolarPlot.Grid />
                    <PolarPlot.Lines />
                    <PolarPlot.Tooltip />
                  </PolarPlot.Viewport>
                </PolarPlot.Container>
              </PolarPlot.Root>
            </div>
          </div>
        }
        code={`<PolarPlot.Root
  series={[{
    name: "Gain Pattern",
    data: radiationPattern,
    filled: true,
    closed: true,
  }]}
  axis={{
    angleLabels: ["0°", "45°", "90°", ...],
    rings: 5,
  }}
  variant="polar"
>
  <PolarPlot.Container>
    <PolarPlot.Viewport>
      <PolarPlot.Grid />
      <PolarPlot.Lines />
      <PolarPlot.Tooltip />
    </PolarPlot.Viewport>
  </PolarPlot.Container>
</PolarPlot.Root>`}
      />

      <ComponentPreview
        title="Spacecraft Subsystem Health Radar"
        description="Radar chart displaying multiple subsystem health metrics. Perfect for multi-dimensional comparisons at a glance."
        preview={
          <div className="flex justify-center w-full">
            <div
              className="w-full max-w-[600px]"
              style={{ aspectRatio: "1/1" }}
            >
              <PolarPlot.Root
                series={[
                  {
                    name: "Health Status",
                    data: subsystemHealth,
                    color: color,
                    filled: true,
                    closed: true,
                    strokeWidth: 3,
                  },
                ]}
                axis={{
                  label: "Health Score",
                  angleLabels: [
                    "Power",
                    "Propulsion",
                    "Thermal",
                    "Comm",
                    "ADCS",
                    "CDH",
                  ],
                  rings: 4,
                  angleCount: 6,
                }}
                showLegend={false}
                variant="radar"
                responsive={true}
              >
                <PolarPlot.Container>
                  <PolarPlot.Viewport>
                    <PolarPlot.Grid />
                    <PolarPlot.Lines />
                    <PolarPlot.Tooltip />
                  </PolarPlot.Viewport>
                </PolarPlot.Container>
              </PolarPlot.Root>
            </div>
          </div>
        }
        code={`<PolarPlot.Root
  series={[{
    name: "Health Status",
    data: subsystemHealth,
    filled: true,
  }]}
  variant="radar"
>
  <PolarPlot.Container>
    <PolarPlot.Viewport>
      <PolarPlot.Grid />
      <PolarPlot.Lines />
      <PolarPlot.Tooltip />
    </PolarPlot.Viewport>
  </PolarPlot.Container>
</PolarPlot.Root>`}
      />

      <ComponentPreview
        title="Rose Diagram"
        description="Rose diagram for directional data like wind direction or orbital phase distribution."
        preview={
          <div className="flex justify-center w-full">
            <div
              className="w-full max-w-[600px]"
              style={{ aspectRatio: "1/1" }}
            >
              <PolarPlot.Root
                series={[
                  {
                    name: "Wind Distribution",
                    data: windData,
                    color: color,
                    filled: true,
                    closed: true,
                  },
                ]}
                axis={{
                  label: "Frequency",
                  rings: 4,
                  angleCount: 16,
                }}
                showLegend={false}
                variant="rose"
                responsive={true}
              >
                <PolarPlot.Container>
                  <PolarPlot.Viewport>
                    <PolarPlot.Grid />
                    <PolarPlot.Lines />
                    <PolarPlot.Tooltip />
                  </PolarPlot.Viewport>
                </PolarPlot.Container>
              </PolarPlot.Root>
            </div>
          </div>
        }
        code={`<PolarPlot.Root
  series={[{
    name: "Wind Distribution",
    data: windData,
    filled: true,
  }]}
  variant="rose"
>
  <PolarPlot.Container>
    <PolarPlot.Viewport>
      <PolarPlot.Grid />
      <PolarPlot.Lines />
      <PolarPlot.Tooltip />
    </PolarPlot.Viewport>
  </PolarPlot.Container>
</PolarPlot.Root>`}
      />
    </div>
  );
};

export { polarPlotApiProps as PolarPlotApiReference } from "./api/polar-plot";
