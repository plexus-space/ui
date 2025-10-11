import { seededRandom } from "./data";
import { useMemo } from "react";
import { ComponentPreview } from "@/components/component-preview";
import { Heatmap } from "@plexusui/components/heatmap";

export const HeatmapExample = () => {
  // High-volume honeycomb data (optimized for SVG rendering)
  const honeycombData = useMemo(() => {
    const random = seededRandom(44444);
    const width = 80;
    const height = 60;

    // Generate flat array for optimal performance
    return Array.from({ length: width * height }, (_, i) => {
      const x = i % width;
      const y = Math.floor(i / width);

      // Create interesting pattern with multiple wave functions
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Combine radial and angular patterns
      const radialPattern = 100 * Math.exp(-(dist * dist) / 400);
      const wavePattern = 50 * Math.sin(dist / 3) * Math.cos(angle * 3);
      const noise = random() * 20;

      return {
        x,
        y,
        value: radialPattern + wavePattern + noise,
      };
    });
  }, []);

  // Time-series heatmap (ground station contacts)
  const contactHeatmap = useMemo(() => {
    const random = seededRandom(33333);
    return Array.from({ length: 24 }, (_, hour) =>
      Array.from({ length: 7 }, (_, day) => Math.floor(random() * 10))
    );
  }, []);

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Ground Station Contact Schedule"
        description="Time-series heatmap showing satellite contact opportunities across days and hours."
        preview={
          <div className="flex justify-center w-full">
            <div className="w-full max-w-[850px]">
              <Heatmap.Root
                data={contactHeatmap}
                xLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
                yLabels={Array.from({ length: 24 }, (_, i) => `${i}:00`)}
                xAxisLabel="Day of Week"
                yAxisLabel="Hour (UTC)"
                colormap="blues"
                animate={false}
                showColorbar={true}
                showValues={false}
                responsive={true}
              >
                <Heatmap.Container>
                  <Heatmap.Viewport>
                    <Heatmap.Cells />
                    <Heatmap.Axes />

                    <Heatmap.Tooltip />
                  </Heatmap.Viewport>
                </Heatmap.Container>
              </Heatmap.Root>
            </div>
          </div>
        }
        code={`<Heatmap.Root
  data={contactHeatmap}
  xLabels={["Sun", "Mon", "Tue", ...]}
  yLabels={["0:00", "1:00", ...]}
  colormap="plasma"
  showValues={true}
>
  <Heatmap.Container>
    <Heatmap.Viewport>
      <Heatmap.Cells />
      <Heatmap.Axes />
      <Heatmap.Tooltip />
    </Heatmap.Viewport>
  </Heatmap.Container>
</Heatmap.Root>`}
      />

      <ComponentPreview
        title="Honeycomb Heatmap"
        description="Hexagonal cell layout with smooth interactions. Optimized with disabled animations for instant rendering."
        preview={
          <div className="flex justify-center w-full">
            <div className="w-full max-w-[850px]">
              <Heatmap.Root
                data={honeycombData}
                colormap="inferno"
                showColorbar={true}
                cellShape="hexagon"
                cellGap={0.08}
                showGrid={false}
                animate={false}
                responsive={true}
              >
                <Heatmap.Container>
                  <Heatmap.Viewport>
                    <Heatmap.Cells />
                    <Heatmap.Axes />
                    <Heatmap.Tooltip />
                  </Heatmap.Viewport>
                </Heatmap.Container>
              </Heatmap.Root>
            </div>
          </div>
        }
        code={`// Generate honeycomb data with interesting pattern
const honeycombData = useMemo(() => {
  const width = 80;
  const height = 60;

  return Array.from({ length: width * height }, (_, i) => {
    const x = i % width;
    const y = Math.floor(i / width);

    // Create interesting pattern
    const centerX = width / 2;
    const centerY = height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const radialPattern = 100 * Math.exp(-(dist * dist) / 400);
    const wavePattern = 50 * Math.sin(dist / 3) * Math.cos(angle * 3);

    return { x, y, value: radialPattern + wavePattern };
  });
}, []);

<Heatmap.Root
  data={honeycombData}
  colormap="inferno"
  cellShape="hexagon"
  cellGap={0.08}
  showGrid={false}
  animate={false} // Disable for performance
  responsive={true}
>
  <Heatmap.Container>
    <Heatmap.Viewport>
      <Heatmap.Cells />
      <Heatmap.Axes />
      <Heatmap.Tooltip />
    </Heatmap.Viewport>
  </Heatmap.Container>
</Heatmap.Root>`}
      />
    </div>
  );
};

export { heatmapApiProps as HeatmapApiReference } from "./api/heatmap";
