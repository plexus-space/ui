"use client";

import { SurfacePlot } from "@plexusui/components/charts/surface-plot";
import type { SurfaceData } from "@plexusui/components/charts/surface-plot";
import { ComponentPreview } from "@/components/component-preview";

function generateTerrainData(): SurfaceData {
  const size = 50;
  const x: number[] = [];
  const y: number[] = [];
  const z: number[][] = [];

  for (let i = 0; i < size; i++) {
    x.push((i / size) * 10 - 5);
    y.push((i / size) * 10 - 5);
  }

  for (let i = 0; i < size; i++) {
    z[i] = [];
    for (let j = 0; j < size; j++) {
      const dx = x[j];
      const dy = y[i];
      // Create a wavy surface
      const height =
        Math.sin(dx) * Math.cos(dy) * 2 +
        Math.sin(dx * 2) * 0.5 +
        Math.cos(dy * 2) * 0.5;
      z[i][j] = height;
    }
  }

  return { x, y, z };
}

function generateGaussianData(): SurfaceData {
  const size = 40;
  const x: number[] = [];
  const y: number[] = [];
  const z: number[][] = [];

  for (let i = 0; i < size; i++) {
    x.push((i / size) * 6 - 3);
    y.push((i / size) * 6 - 3);
  }

  for (let i = 0; i < size; i++) {
    z[i] = [];
    for (let j = 0; j < size; j++) {
      const dx = x[j];
      const dy = y[i];
      // Gaussian peak
      const height = Math.exp(-(dx * dx + dy * dy) / 2) * 3;
      z[i][j] = height;
    }
  }

  return { x, y, z };
}

function generateWaveInterference(): SurfaceData {
  const size = 45;
  const x: number[] = [];
  const y: number[] = [];
  const z: number[][] = [];

  for (let i = 0; i < size; i++) {
    x.push((i / size) * 8 - 4);
    y.push((i / size) * 8 - 4);
  }

  for (let i = 0; i < size; i++) {
    z[i] = [];
    for (let j = 0; j < size; j++) {
      const dx = x[j];
      const dy = y[i];
      // Wave interference pattern
      const r1 = Math.sqrt((dx - 1) ** 2 + (dy - 1) ** 2);
      const r2 = Math.sqrt((dx + 1) ** 2 + (dy + 1) ** 2);
      const wave1 = Math.sin(r1 * 3) / (r1 + 0.5);
      const wave2 = Math.sin(r2 * 3) / (r2 + 0.5);
      z[i][j] = wave1 + wave2;
    }
  }

  return { x, y, z };
}

function TerrainElevationMap() {
  const terrainData = generateTerrainData();

  return (
    <ComponentPreview
      title="Terrain Elevation Map"
      description="3D topographical surface with terrain colormap. Wavy surface demonstrating elevation changes and natural terrain features."
      code={`function generateTerrainData(): SurfaceData {
  const size = 50;
  const x: number[] = [];
  const y: number[] = [];
  const z: number[][] = [];

  for (let i = 0; i < size; i++) {
    x.push((i / size) * 10 - 5);
    y.push((i / size) * 10 - 5);
  }

  for (let i = 0; i < size; i++) {
    z[i] = [];
    for (let j = 0; j < size; j++) {
      const dx = x[j];
      const dy = y[i];
      const height =
        Math.sin(dx) * Math.cos(dy) * 2 +
        Math.sin(dx * 2) * 0.5 +
        Math.cos(dy * 2) * 0.5;
      z[i][j] = height;
    }
  }

  return { x, y, z };
}

<SurfacePlot
  data={terrainData}
  colormap="terrain"
  width={800}
  height={600}
/>`}
      preview={
        <div className="flex items-center justify-center p-4">
          <SurfacePlot
            data={terrainData}
            colormap="terrain"
            width={800}
            height={600}
          />
        </div>
      }
    />
  );
}

function WireframeVisualization() {
  const gaussianData = generateGaussianData();

  return (
    <ComponentPreview
      title="Wireframe View"
      description="Gaussian peak rendered in wireframe mode with viridis colormap. Perfect for analyzing mathematical surfaces."
      code={`function generateGaussianData(): SurfaceData {
  const size = 40;
  const x: number[] = [];
  const y: number[] = [];
  const z: number[][] = [];

  for (let i = 0; i < size; i++) {
    x.push((i / size) * 6 - 3);
    y.push((i / size) * 6 - 3);
  }

  for (let i = 0; i < size; i++) {
    z[i] = [];
    for (let j = 0; j < size; j++) {
      const dx = x[j];
      const dy = y[i];
      const height = Math.exp(-(dx * dx + dy * dy) / 2) * 3;
      z[i][j] = height;
    }
  }

  return { x, y, z };
}

<SurfacePlot
  data={gaussianData}
  colormap="viridis"
  wireframe={true}
  width={480}
  height={400}
/>`}
      preview={
        <div className="flex items-center justify-center p-4">
          <SurfacePlot
            data={gaussianData}
            colormap="viridis"
            wireframe={true}
            width={480}
            height={400}
          />
        </div>
      }
    />
  );
}

function ThermalMapping() {
  const gaussianData = generateGaussianData();

  return (
    <ComponentPreview
      title="Thermal Surface Mapping"
      description="Heat distribution visualization with thermal colormap. Solid surface rendering for temperature analysis."
      code={`<SurfacePlot
  data={gaussianData}
  colormap="thermal"
  wireframe={false}
  width={480}
  height={400}
/>`}
      preview={
        <div className="flex items-center justify-center p-4">
          <SurfacePlot
            data={gaussianData}
            colormap="thermal"
            wireframe={false}
            width={480}
            height={400}
          />
        </div>
      }
    />
  );
}

function WaveInterferencePattern() {
  const waveData = generateWaveInterference();

  return (
    <ComponentPreview
      title="Wave Interference Pattern"
      description="Dual-source wave interference demonstrating constructive and destructive interference. Plasma colormap highlights wave peaks and troughs."
      code={`function generateWaveInterference(): SurfaceData {
  const size = 45;
  const x: number[] = [];
  const y: number[] = [];
  const z: number[][] = [];

  for (let i = 0; i < size; i++) {
    x.push((i / size) * 8 - 4);
    y.push((i / size) * 8 - 4);
  }

  for (let i = 0; i < size; i++) {
    z[i] = [];
    for (let j = 0; j < size; j++) {
      const dx = x[j];
      const dy = y[i];
      const r1 = Math.sqrt((dx - 1) ** 2 + (dy - 1) ** 2);
      const r2 = Math.sqrt((dx + 1) ** 2 + (dy + 1) ** 2);
      const wave1 = Math.sin(r1 * 3) / (r1 + 0.5);
      const wave2 = Math.sin(r2 * 3) / (r2 + 0.5);
      z[i][j] = wave1 + wave2;
    }
  }

  return { x, y, z };
}

<SurfacePlot
  data={waveData}
  colormap="plasma"
  wireframe={false}
  width={700}
  height={500}
/>`}
      preview={
        <div className="flex items-center justify-center p-4">
          <SurfacePlot
            data={waveData}
            colormap="plasma"
            wireframe={false}
            width={700}
            height={500}
          />
        </div>
      }
    />
  );
}

export function SurfacePlotExamples() {
  return (
    <div className="space-y-8">
      <TerrainElevationMap />
      <div className="grid grid-cols-2 gap-4">
        <WireframeVisualization />
        <ThermalMapping />
      </div>
      <WaveInterferencePattern />
    </div>
  );
}
