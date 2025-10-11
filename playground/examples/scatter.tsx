import { useColorScheme } from "@/components/color-scheme-provider";
import { useMemo } from "react";
import { seededRandom } from "./data";
import { ComponentPreview } from "@/components/component-preview";
import { ScatterPlot } from "@plexusui/components/scatter-plot";

export const ScatterPlotExamples = () => {
  const { color } = useColorScheme();

  // Correlation dataset
  const correlationData = useMemo(() => {
    const random = seededRandom(42);
    return Array.from({ length: 100 }, (_, i) => {
      const x = random() * 100;
      const noise = (random() - 0.5) * 20;
      return { x, y: 0.8 * x + 20 + noise };
    });
  }, []);

  // Clustered data (3 clusters)
  const clusteredData = useMemo(() => {
    const random = seededRandom(123);
    const clusters = [
      { cx: 30, cy: 30, color: color },
      { cx: 70, cy: 50, color: "#ef4444" },
      { cx: 50, cy: 80, color: "#f59e0b" },
    ];

    return clusters.map((cluster, clusterIdx) => ({
      name: `Cluster ${clusterIdx + 1}`,
      data: Array.from({ length: 50 }, () => ({
        x: cluster.cx + (random() - 0.5) * 20,
        y: cluster.cy + (random() - 0.5) * 20,
      })),
      color: cluster.color,
      radius: 4,
      opacity: 0.7,
    }));
  }, [color]);

  // Experimental data with labels
  const experimentalData = useMemo(() => {
    const random = seededRandom(999);
    return Array.from({ length: 30 }, (_, i) => ({
      x: i * 3,
      y: 50 + Math.sin(i / 3) * 20 + (random() - 0.5) * 10,
      label: `Point ${i + 1}`,
    }));
  }, []);

  // Altitude vs Velocity (orbital mechanics)
  const orbitalData = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const altitude = i * 10 + 200; // km
      const earthRadius = 6371;
      const mu = 398600; // km³/s²
      const r = earthRadius + altitude;
      const velocity = Math.sqrt(mu / r);
      return { x: altitude, y: velocity };
    });
  }, []);

  // Temperature vs Pressure (thermodynamics)
  const thermoData = useMemo(() => {
    const random = seededRandom(777);
    return Array.from({ length: 40 }, (_, i) => {
      const temp = 273 + i * 5; // Kelvin
      const pressure = (temp / 273) * 101.325 + (random() - 0.5) * 10; // kPa
      return { x: temp, y: pressure };
    });
  }, []);

  // High-volume sensor data (50,000 points)
  const highVolumeSensorData = useMemo(() => {
    const random = seededRandom(777777);
    return Array.from({ length: 50000 }, (_, i) => {
      const cluster = Math.floor(i / 16667);
      const centerX = cluster * 33 + 17 + (random() - 0.5) * 25;
      const centerY = 50 + Math.sin(cluster * 2) * 20 + (random() - 0.5) * 20;
      return { x: centerX, y: centerY };
    });
  }, []);

  return (
    <div className="space-y-12">
      {/* Basic Scatter Plot with Correlation */}
      <ComponentPreview
        title="Linear Correlation with Regression"
        description="Scatter plot showing strong positive correlation (R² ≈ 0.85). The regression line helps identify trends and outliers in experimental data."
        preview={
          <div className="w-full">
            <ScatterPlot.Root
              series={[
                {
                  name: "Data Points",
                  data: correlationData,
                  color: color,
                  radius: 5,
                  opacity: 0.7,
                },
              ]}
              xAxis={{ label: "Independent Variable" }}
              yAxis={{ label: "Dependent Variable" }}
              showRegression={true}
            >
              <ScatterPlot.Container>
                <ScatterPlot.Viewport>
                  <ScatterPlot.Grid />
                  <ScatterPlot.Axes />
                  <ScatterPlot.Regression />
                  <ScatterPlot.Points />
                  <ScatterPlot.Interaction />
                  <ScatterPlot.Tooltip />
                </ScatterPlot.Viewport>
              </ScatterPlot.Container>
            </ScatterPlot.Root>
          </div>
        }
        code={`<ScatterPlot.Root
  series={[
    {
      name: "Data Points",
      data: correlationData,
      color: "#06b6d4",
      radius: 5,
      opacity: 0.7,
    },
  ]}
  xAxis={{ label: "Independent Variable" }}
  yAxis={{ label: "Dependent Variable" }}
  showRegression={true}
  width={850}
  height={400}
>
  <ScatterPlot.Container>
    <ScatterPlot.Viewport>
      <ScatterPlot.Grid />
      <ScatterPlot.Axes />
      <ScatterPlot.Regression />
      <ScatterPlot.Points />
      <ScatterPlot.Interaction />
      <ScatterPlot.Tooltip />
    </ScatterPlot.Viewport>
  </ScatterPlot.Container>
</ScatterPlot.Root>`}
      />

      {/* Multi-series Clustering */}
      <ComponentPreview
        title="Multi-cluster Point Cloud"
        description="Visualizing multiple clusters in 2D space. Common in machine learning classification, particle tracking, and spatial analysis. Uses responsive HTML legend for better UX."
        preview={
          <div className="w-full">
            <ScatterPlot.Root
              series={clusteredData}
              xAxis={{ label: "Feature 1" }}
              yAxis={{ label: "Feature 2" }}
            >
              <ScatterPlot.LegendHTML interactive={true} />
              <ScatterPlot.Container>
                <ScatterPlot.Viewport>
                  <ScatterPlot.Grid />
                  <ScatterPlot.Axes />
                  <ScatterPlot.Points />
                  <ScatterPlot.Interaction />
                  <ScatterPlot.Tooltip />
                </ScatterPlot.Viewport>
              </ScatterPlot.Container>
            </ScatterPlot.Root>
          </div>
        }
        code={`<ScatterPlot.Root
  series={clusteredData}
  xAxis={{ label: "Feature 1" }}
  yAxis={{ label: "Feature 2" }}
>
  <ScatterPlot.LegendHTML interactive={true} />
  <ScatterPlot.Container>
    <ScatterPlot.Viewport>
      <ScatterPlot.Grid />
      <ScatterPlot.Axes />
      <ScatterPlot.Points />
      <ScatterPlot.Interaction />
      <ScatterPlot.Tooltip />
    </ScatterPlot.Viewport>
  </ScatterPlot.Container>
</ScatterPlot.Root>`}
      />

      {/* Orbital Mechanics */}
      <ComponentPreview
        title="Orbital Velocity vs Altitude"
        description="Relationship between circular orbital velocity and altitude above Earth. Shows inverse square root relationship from orbital mechanics."
        preview={
          <div className="w-full">
            <ScatterPlot.Root
              series={[
                {
                  name: "Circular Orbit",
                  data: orbitalData,
                  color: color,
                  radius: 4,
                  opacity: 0.8,
                },
              ]}
              xAxis={{ label: "Altitude (km)" }}
              yAxis={{ label: "Velocity (km/s)" }}
              showRegression={false}
            >
              <ScatterPlot.Container>
                <ScatterPlot.Viewport>
                  <ScatterPlot.Grid />
                  <ScatterPlot.Axes />
                  <ScatterPlot.Points />
                  <ScatterPlot.Interaction />
                  <ScatterPlot.Tooltip />
                </ScatterPlot.Viewport>
              </ScatterPlot.Container>
            </ScatterPlot.Root>
          </div>
        }
        code={`<ScatterPlot.Root
  series={[
    {
      name: "Circular Orbit",
      data: orbitalData,
      color: "#06b6d4",
      radius: 4,
    },
  ]}
  xAxis={{ label: "Altitude (km)" }}
  yAxis={{ label: "Velocity (km/s)" }}
  width={850}
  height={400}
>
  <ScatterPlot.Container>
    <ScatterPlot.Viewport>
      <ScatterPlot.Grid />
      <ScatterPlot.Axes />
      <ScatterPlot.Points />
      <ScatterPlot.Interaction />
      <ScatterPlot.Tooltip />
    </ScatterPlot.Viewport>
  </ScatterPlot.Container>
</ScatterPlot.Root>`}
      />

      {/* Thermodynamics */}
      <ComponentPreview
        title="Temperature-Pressure Relationship"
        description="Gas behavior following ideal gas law (P ∝ T). Linear relationship with experimental scatter demonstrates real-world measurement noise."
        preview={
          <div className="w-full">
            <ScatterPlot.Root
              series={[
                {
                  name: "Measurements",
                  data: thermoData,
                  color: color,
                  radius: 5,
                  opacity: 0.7,
                },
              ]}
              xAxis={{ label: "Temperature (K)" }}
              yAxis={{ label: "Pressure (kPa)" }}
              showRegression={true}
            >
              <ScatterPlot.Container>
                <ScatterPlot.Viewport>
                  <ScatterPlot.Grid />
                  <ScatterPlot.Axes />
                  <ScatterPlot.Regression />
                  <ScatterPlot.Points />
                  <ScatterPlot.Interaction />
                  <ScatterPlot.Tooltip />
                </ScatterPlot.Viewport>
              </ScatterPlot.Container>
            </ScatterPlot.Root>
          </div>
        }
        code={`<ScatterPlot.Root
  series={[
    {
      name: "Measurements",
      data: thermoData,
      color: "#06b6d4",
      radius: 5,
      opacity: 0.7,
    },
  ]}
  xAxis={{ label: "Temperature (K)" }}
  yAxis={{ label: "Pressure (kPa)" }}
  showRegression={true}
  width={850}
  height={400}
>
  <ScatterPlot.Container>
    <ScatterPlot.Viewport>
      <ScatterPlot.Grid />
      <ScatterPlot.Axes />
      <ScatterPlot.Regression />
      <ScatterPlot.Points />
      <ScatterPlot.Interaction />
      <ScatterPlot.Tooltip />
    </ScatterPlot.Viewport>
  </ScatterPlot.Container>
</ScatterPlot.Root>`}
      />

      {/* High-Volume Data with Automatic Sampling */}
      <ComponentPreview
        title="High-Volume Data Performance (50,000 Points)"
        description="Demonstrates density-aware sampling for large datasets. 50,000 raw data points are intelligently sampled down to 5,000 using spatial grid analysis. Dense clusters are reduced while outliers and sparse regions are preserved, maintaining accurate visual distribution. Hover still works seamlessly."
        preview={
          <div className="w-full">
            <ScatterPlot.Root
              series={[
                {
                  name: "Sensor Measurements",
                  data: highVolumeSensorData,
                  color: color,
                  radius: 3,
                  opacity: 0.6,
                },
              ]}
              xAxis={{ label: "Parameter X" }}
              yAxis={{ label: "Parameter Y" }}
              maxPoints={5000}
            >
              <ScatterPlot.Container>
                <ScatterPlot.Viewport>
                  <ScatterPlot.Grid />
                  <ScatterPlot.Axes />
                  <ScatterPlot.Points />
                  <ScatterPlot.Interaction />
                  <ScatterPlot.Tooltip />
                </ScatterPlot.Viewport>
              </ScatterPlot.Container>
            </ScatterPlot.Root>
          </div>
        }
        code={`// Generate 50,000 data points
const sensorData = Array.from({ length: 50000 }, (_, i) => {
  const cluster = Math.floor(i / 16667);
  const centerX = (cluster * 33 + 17) + (Math.random() - 0.5) * 25;
  const centerY = 50 + Math.sin(cluster * 2) * 20 + (Math.random() - 0.5) * 20;
  return { x: centerX, y: centerY };
});

<ScatterPlot.Root
  series={[
    {
      name: "Sensor Measurements",
      data: sensorData, // 50,000 points
      color: "#06b6d4",
      radius: 3,
      opacity: 0.6,
    },
  ]}
  xAxis={{ label: "Parameter X" }}
  yAxis={{ label: "Parameter Y" }}
  maxPoints={5000} // Density-aware sampling to 5,000 points
  width={850}
  height={400}
>
  <ScatterPlot.Container>
    <ScatterPlot.Viewport>
      <ScatterPlot.Grid />
      <ScatterPlot.Axes />
      <ScatterPlot.Points />
      <ScatterPlot.Interaction />
      <ScatterPlot.Tooltip />
    </ScatterPlot.Viewport>
  </ScatterPlot.Container>
</ScatterPlot.Root>`}
      />
    </div>
  );
};

export { scatterPlotApiProps as ScatterPlotApiReference } from "./api/scatter-plot";
