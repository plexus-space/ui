"use client";

import { useState, useEffect } from "react";
import { WaterfallChart } from "@plexusui/components/charts/waterfall-chart";
import type { WaterfallData } from "@plexusui/components/charts/waterfall-chart";
import { ComponentPreview } from "@/components/component-preview";

function generateFFTData(bins: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < bins; i++) {
    // Simulate spectrum with some peaks
    const baseNoise = Math.random() * 0.2;
    const peak1 = Math.exp(-Math.pow((i - bins * 0.3) / 10, 2)) * 0.8;
    const peak2 = Math.exp(-Math.pow((i - bins * 0.7) / 15, 2)) * 0.6;
    data.push(baseNoise + peak1 + peak2);
  }
  return data;
}

function RFSpectrumAnalyzer() {
  const [data, setData] = useState<WaterfallData[]>(() => {
    const initial: WaterfallData[] = [];
    for (let i = 0; i < 100; i++) {
      initial.push({
        time: i,
        frequencies: generateFFTData(128),
      });
    }
    return initial;
  });

  // Simulate streaming spectrum data
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [
          ...prev.slice(1),
          {
            time: prev[prev.length - 1].time + 1,
            frequencies: generateFFTData(128),
          },
        ];
        return newData;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <ComponentPreview
      title="RF Spectrum Analyzer"
      description="Live radio frequency spectrum waterfall with real-time FFT visualization. Shows signal intensity across frequency bands over time."
      code={`function generateFFTData(bins: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < bins; i++) {
    const baseNoise = Math.random() * 0.2;
    const peak1 = Math.exp(-Math.pow((i - bins * 0.3) / 10, 2)) * 0.8;
    const peak2 = Math.exp(-Math.pow((i - bins * 0.7) / 15, 2)) * 0.6;
    data.push(baseNoise + peak1 + peak2);
  }
  return data;
}

const [data, setData] = useState<WaterfallData[]>(/* initial data */);

// Stream new spectrum data
useEffect(() => {
  const interval = setInterval(() => {
    setData(prev => [...prev.slice(1), {
      time: prev[prev.length - 1].time + 1,
      frequencies: generateFFTData(128),
    }]);
  }, 100);
  return () => clearInterval(interval);
}, []);

<WaterfallChart
  data={data}
  minFrequency={0}
  maxFrequency={3000}
  colormap="viridis"
  width={1000}
  height={600}
  xAxis={{ label: "Frequency (MHz)" }}
  yAxis={{ label: "Time" }}
/>`}
      preview={
        <div className="flex items-center justify-center p-4">
          <WaterfallChart
            data={data}
            minFrequency={0}
            maxFrequency={3000}
            colormap="viridis"
            width={1000}
            height={600}
            xAxis={{ label: "Frequency (MHz)" }}
            yAxis={{ label: "Time" }}
          />
        </div>
      }
    />
  );
}

function PlasmaSpectrogram() {
  const [data, setData] = useState<WaterfallData[]>(() => {
    const initial: WaterfallData[] = [];
    for (let i = 0; i < 50; i++) {
      initial.push({
        time: i,
        frequencies: generateFFTData(128),
      });
    }
    return initial;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => [
        ...prev.slice(1),
        {
          time: prev[prev.length - 1].time + 1,
          frequencies: generateFFTData(128),
        },
      ]);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <ComponentPreview
      title="Plasma Colormap Spectrogram"
      description="High-contrast plasma colormap for signal detection. Ideal for identifying weak signals in noisy environments."
      code={`<WaterfallChart
  data={data}
  colormap="plasma"
  width={480}
  height={400}
  showAxes={false}
/>`}
      preview={
        <div className="flex items-center justify-center p-4">
          <WaterfallChart
            data={data}
            colormap="plasma"
            width={480}
            height={400}
            showAxes={false}
          />
        </div>
      }
    />
  );
}

function ThermalImaging() {
  const [data, setData] = useState<WaterfallData[]>(() => {
    const initial: WaterfallData[] = [];
    for (let i = 0; i < 50; i++) {
      initial.push({
        time: i,
        frequencies: generateFFTData(128),
      });
    }
    return initial;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => [
        ...prev.slice(1),
        {
          time: prev[prev.length - 1].time + 1,
          frequencies: generateFFTData(128),
        },
      ]);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <ComponentPreview
      title="Thermal Colormap Display"
      description="Thermal imaging-style visualization. Red-orange-yellow palette for heat signature analysis."
      code={`<WaterfallChart
  data={data}
  colormap="thermal"
  width={480}
  height={400}
  showAxes={false}
/>`}
      preview={
        <div className="flex items-center justify-center p-4">
          <WaterfallChart
            data={data}
            colormap="thermal"
            width={480}
            height={400}
            showAxes={false}
          />
        </div>
      }
    />
  );
}

export function WaterfallChartExamples() {
  return (
    <div className="space-y-8">
      <RFSpectrumAnalyzer />
      <div className="grid grid-cols-2 gap-4">
        <PlasmaSpectrogram />
        <ThermalImaging />
      </div>
    </div>
  );
}
