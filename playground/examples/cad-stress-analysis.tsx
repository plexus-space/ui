"use client";

import { useState, useMemo } from "react";
import { ModelViewer, generateBeamSTL, generateCubeSTL } from "@plexusui/components/charts/3d-model-viewer";
import { Gauge } from "@plexusui/components/charts/gauge";
import { LineChart } from "@plexusui/components/charts/line-chart";
import { ComponentPreview } from "@/components/component-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { viridis, plasma, turbo } from "@plexusui/components/lib/color-scales";

// ============================================================================
// Engineering Analysis Data Generation
// ============================================================================

/**
 * Material properties for common aerospace materials
 */
const MATERIALS = {
  aluminum_7075: {
    name: "Aluminum 7075-T6",
    yieldStrength: 503, // MPa
    ultimateStrength: 572, // MPa
    density: 2810, // kg/m³
    thermalConductivity: 130, // W/(m·K)
  },
  titanium_ti6al4v: {
    name: "Titanium Ti-6Al-4V",
    yieldStrength: 880, // MPa
    ultimateStrength: 950, // MPa
    density: 4430, // kg/m³
    thermalConductivity: 7.2, // W/(m·K)
  },
  steel_4340: {
    name: "Steel 4340",
    yieldStrength: 710, // MPa
    ultimateStrength: 1110, // MPa
    density: 7850, // kg/m³
    thermalConductivity: 44.5, // W/(m·K)
  },
  carbonFiber: {
    name: "Carbon Fiber Composite",
    yieldStrength: 600, // MPa
    ultimateStrength: 900, // MPa
    density: 1600, // kg/m³
    thermalConductivity: 10, // W/(m·K)
  },
} as const;

type MaterialType = keyof typeof MATERIALS;

/**
 * Load cases for structural analysis
 */
interface LoadCase {
  name: string;
  description: string;
  forceN: number; // Applied force in Newtons
  momentNm?: number; // Applied moment in Newton-meters
}

const LOAD_CASES: Record<string, LoadCase> = {
  nominal: {
    name: "Nominal Load",
    description: "Normal operating conditions",
    forceN: 5000,
  },
  max_static: {
    name: "Max Static Load",
    description: "Maximum expected static load",
    forceN: 15000,
  },
  limit_load: {
    name: "Limit Load",
    description: "Regulatory limit load (1.5x operating)",
    forceN: 22500,
  },
  ultimate_load: {
    name: "Ultimate Load",
    description: "Regulatory ultimate load (2.25x operating)",
    forceN: 33750,
  },
};

/**
 * Generate thermal distribution data
 * Simulates heat generation from friction/electrical components
 */
function generateThermalData(vertexCount: number, hotspotIntensity: number): number[] {
  const temps: number[] = [];
  const centerX = vertexCount / 2;

  for (let i = 0; i < vertexCount; i++) {
    // Temperature decreases with distance from hotspot
    const distFromCenter = Math.abs(i - centerX) / centerX;
    const baseTemp = 20; // Ambient temperature (°C)
    const maxTempRise = 80 * hotspotIntensity; // Max rise based on intensity

    // Exponential decay from hotspot
    const temp = baseTemp + maxTempRise * Math.exp(-distFromCenter * 3);

    // Add some randomness for realistic variation
    temps.push(temp + (Math.random() - 0.5) * 5);
  }

  return temps;
}

/**
 * Generate fatigue life data
 * Simulates cumulative damage from cyclic loading
 */
function generateFatigueData(stressValues: number[], yieldStrength: number): number[] {
  return stressValues.map((stress) => {
    // Simplified S-N curve (Basquin's equation)
    // Life = C * (stress)^(-b)
    const stressRatio = stress / yieldStrength;

    if (stressRatio < 0.3) {
      // Low stress - infinite life
      return 1e9; // 1 billion cycles
    }

    // High stress - calculate finite life
    const b = 3.5; // Fatigue exponent
    const C = 1e10; // Material constant
    const life = C * Math.pow(stressRatio, -b);

    return Math.min(life, 1e9);
  });
}

// ============================================================================
// Complete CAD Stress Analysis Dashboard
// ============================================================================

function CADStressAnalysisDashboard() {
  const [material, setMaterial] = useState<MaterialType>("aluminum_7075");
  const [loadCase, setLoadCase] = useState<keyof typeof LOAD_CASES>("nominal");
  const [viewMode, setViewMode] = useState<"stress" | "thermal" | "fatigue">("stress");
  const [showWireframe, setShowWireframe] = useState(false);
  const [loadIntensity, setLoadIntensity] = useState(1.0);

  // Generate 3D model
  const { modelBuffer, stressValues } = useMemo(() => {
    const { buffer, stressValues: stress } = generateBeamSTL(30);
    return { modelBuffer: buffer, stressValues: stress };
  }, []);

  // Scale stress values based on load intensity
  const scaledStressValues = useMemo(() => {
    const baseLoad = LOAD_CASES[loadCase].forceN;
    const scaleFactor = (baseLoad / 5000) * loadIntensity;
    return stressValues.map((s) => s * scaleFactor);
  }, [stressValues, loadCase, loadIntensity]);

  // Generate thermal data
  const thermalValues = useMemo(() => {
    return generateThermalData(stressValues.length, loadIntensity);
  }, [stressValues.length, loadIntensity]);

  // Generate fatigue life data
  const fatigueValues = useMemo(() => {
    const yieldStrength = MATERIALS[material].yieldStrength;
    return generateFatigueData(scaledStressValues, yieldStrength);
  }, [scaledStressValues, material]);

  // Select visualization data based on view mode
  const { displayValues, minValue, maxValue, colorScale, unit, label } = useMemo(() => {
    switch (viewMode) {
      case "stress":
        return {
          displayValues: scaledStressValues,
          minValue: 0,
          maxValue: MATERIALS[material].yieldStrength,
          colorScale: viridis,
          unit: "MPa",
          label: "von Mises Stress",
        };
      case "thermal":
        return {
          displayValues: thermalValues,
          minValue: 20,
          maxValue: 100,
          colorScale: turbo,
          unit: "°C",
          label: "Temperature",
        };
      case "fatigue":
        return {
          displayValues: fatigueValues,
          minValue: 1e4,
          maxValue: 1e9,
          colorScale: plasma,
          unit: "cycles",
          label: "Fatigue Life",
        };
      default:
        return {
          displayValues: scaledStressValues,
          minValue: 0,
          maxValue: 100,
          colorScale: viridis,
          unit: "MPa",
          label: "Stress",
        };
    }
  }, [viewMode, scaledStressValues, thermalValues, fatigueValues, material]);

  // Calculate max stress and safety factor
  const maxStress = Math.max(...scaledStressValues);
  const yieldStrength = MATERIALS[material].yieldStrength;
  const safetyFactor = yieldStrength / maxStress;
  const isOverstressed = maxStress > yieldStrength;

  // Stress distribution histogram data
  const stressHistogramData = useMemo(() => {
    const bins = 20;
    const binSize = yieldStrength / bins;
    const histogram: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < bins; i++) {
      const binMin = i * binSize;
      const binMax = (i + 1) * binSize;
      const count = scaledStressValues.filter((s) => s >= binMin && s < binMax).length;
      histogram.push({ x: binMin + binSize / 2, y: count });
    }

    return histogram;
  }, [scaledStressValues, yieldStrength]);

  return (
    <ComponentPreview
      title="CAD Stress Analysis - Finite Element Analysis (FEA)"
      description="Interactive 3D structural analysis with stress, thermal, and fatigue visualization. Upload CAD models (STL/OBJ) and visualize FEA results with vertex color overlays using scientifically accurate color scales."
      code={`import { ModelViewer } from "@/components/plexusui/charts/3d-model-viewer";
import { viridis, turbo, plasma } from "@/lib/color-scales";

// Load CAD model and FEA results
const { buffer, stressValues } = generateBeamSTL(30);

// Apply load case
const loadFactor = LOAD_CASES[loadCase].forceN / 5000;
const scaledStress = stressValues.map(s => s * loadFactor);

// 3D visualization with stress overlay
<ModelViewer
  modelData={buffer}
  modelType="stl"
  vertexColors={scaledStress}
  colorScale={viridis}
  minValue={0}
  maxValue={yieldStrength}
  showGrid={true}
  showAxes={false}
  autoRotate={false}
  width={800}
  height={600}
/>

// Support for thermal and fatigue analysis
<ModelViewer
  modelData={buffer}
  vertexColors={thermalValues}
  colorScale={turbo}
  minValue={20}
  maxValue={100}
/>

<ModelViewer
  modelData={buffer}
  vertexColors={fatigueLife}
  colorScale={plasma}
  minValue={1e4}
  maxValue={1e9}
/>`}
      preview={
        <div className="w-full space-y-4">
          {/* Analysis Configuration Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Structural Analysis - Cantilever Beam</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    Material: {MATERIALS[material].name} | Load: {LOAD_CASES[loadCase].name}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={isOverstressed ? "destructive" : "default"} className="text-sm px-3 py-1">
                    {isOverstressed ? "⚠️ OVERSTRESSED" : "✓ SAFE"}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1 font-mono">
                    FOS: {safetyFactor.toFixed(2)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Material</Label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value as MaterialType)}
                    className="w-full px-2 py-1.5 rounded-md border bg-background text-sm"
                  >
                    {Object.entries(MATERIALS).map(([key, mat]) => (
                      <option key={key} value={key}>
                        {mat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Load Case</Label>
                  <select
                    value={loadCase}
                    onChange={(e) => setLoadCase(e.target.value as keyof typeof LOAD_CASES)}
                    className="w-full px-2 py-1.5 rounded-md border bg-background text-sm"
                  >
                    {Object.entries(LOAD_CASES).map(([key, lc]) => (
                      <option key={key} value={key}>
                        {lc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Analysis Type</Label>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as "stress" | "thermal" | "fatigue")}
                    className="w-full px-2 py-1.5 rounded-md border bg-background text-sm"
                  >
                    <option value="stress">Stress (von Mises)</option>
                    <option value="thermal">Thermal</option>
                    <option value="fatigue">Fatigue Life</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wireframe" className="text-xs">Wireframe</Label>
                    <input
                      id="wireframe"
                      type="checkbox"
                      checked={showWireframe}
                      onChange={(e) => setShowWireframe(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="intensity" className="text-xs">
                      Load Intensity: {(loadIntensity * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      id="intensity"
                      min={10}
                      max={200}
                      step={10}
                      value={[loadIntensity * 100]}
                      onValueChange={(value) => setLoadIntensity(value[0] / 100)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Analysis View */}
          <div className="grid grid-cols-[1fr_400px] gap-4">
            {/* 3D Model Viewer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  3D Model - {label} Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[600px] bg-zinc-950 rounded-lg">
                  <ModelViewer
                    modelData={modelBuffer}
                    modelType="stl"
                    vertexColors={displayValues}
                    colorScale={colorScale}
                    minValue={minValue}
                    maxValue={maxValue}
                    showGrid={true}
                    showAxes={false}
                    autoRotate={false}
                    wireframe={showWireframe}
                    width="100%"
                    height={600}
                    backgroundColor="#09090b"
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>Min: {minValue.toFixed(1)} {unit}</span>
                  <span>Max: {maxValue.toFixed(1)} {unit}</span>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Metrics */}
            <div className="space-y-4">
              {/* Material Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Material Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Yield Strength</div>
                      <div className="font-mono font-bold">
                        {MATERIALS[material].yieldStrength} <span className="text-xs">MPa</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Ultimate Strength</div>
                      <div className="font-mono font-bold">
                        {MATERIALS[material].ultimateStrength} <span className="text-xs">MPa</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Density</div>
                      <div className="font-mono font-bold">
                        {MATERIALS[material].density} <span className="text-xs">kg/m³</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Thermal Cond.</div>
                      <div className="font-mono font-bold">
                        {MATERIALS[material].thermalConductivity} <span className="text-xs">W/(m·K)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stress Gauge */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Max Stress Indicator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <Gauge
                      value={maxStress}
                      min={0}
                      max={yieldStrength * 1.2}
                      zones={[
                        { from: 0, to: yieldStrength * 0.67, color: "#10b981" },
                        { from: yieldStrength * 0.67, to: yieldStrength, color: "#f59e0b" },
                        { from: yieldStrength, to: yieldStrength * 1.2, color: "#ef4444" },
                      ]}
                      label="von Mises"
                      unit="MPa"
                      variant="semi"
                      width={350}
                      height={200}
                      showValue
                      showTicks
                      tickCount={6}
                    />
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Stress:</span>
                      <span className="font-mono font-bold">{maxStress.toFixed(1)} MPa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Safety Factor:</span>
                      <span className={`font-mono font-bold ${safetyFactor < 1.5 ? "text-red-600" : "text-green-600"}`}>
                        {safetyFactor.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utilization:</span>
                      <span className="font-mono font-bold">{((maxStress / yieldStrength) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Load Case Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Applied Load</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Force:</span>
                    <span className="font-mono font-bold">
                      {(LOAD_CASES[loadCase].forceN * loadIntensity).toFixed(0)} N
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{LOAD_CASES[loadCase].description}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stress Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {label} Distribution - Element Count by Stress Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[250px]">
                <LineChart
                  series={[
                    {
                      name: "Distribution",
                      data: stressHistogramData,
                      color: "#3b82f6",
                      strokeWidth: 2,
                    },
                  ]}
                  xAxis={{
                    label: `${label} (${unit})`,
                  }}
                  yAxis={{ label: "Element Count" }}
                  width={1100}
                  height={250}
                  showAxes
                  showTooltip
                  preferWebGPU
                />
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function CadStressAnalysisExamples() {
  return (
    <div className="space-y-8">
      <CADStressAnalysisDashboard />
    </div>
  );
}
