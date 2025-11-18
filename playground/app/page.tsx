"use client";

import { Footer } from "@/components/footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-5xl text-foreground">
            Simplifying human-computer interaction for hardware.
          </h1>
        </div>

        <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          A primitive-first, WebGPU-accelerated component library for physical
          systems.
        </p>

        <div className="space-y-8 mb-16">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Real-World Demos
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Production-ready examples showing observability for aerospace,
              medical devices, and industrial systems.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/quick-connect-demo"
                className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="font-medium text-foreground">
                  Quick Connect Demo
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Connect sensor → ask in English → get dashboard. Zero code.
                </div>
              </Link>

              <Link
                href="/vibration-monitoring"
                className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="font-medium text-foreground">
                  Vibration Monitoring
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Predictive maintenance with FFT + SPC. Detects bearing faults
                  before failure.
                </div>
              </Link>

              <Link
                href="/eeg-brain-interface"
                className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="font-medium text-foreground">
                  EEG Brain Interface
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Medical-grade neurological monitoring at 256 Hz.
                  Delta/Theta/Alpha/Beta/Gamma analysis.
                </div>
              </Link>

              <Link
                href="/cad-stress-analysis"
                className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="font-medium text-foreground">
                  CAD Stress Analysis
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Interactive FEA without desktop software. Upload STL →
                  visualize stress/thermal/fatigue.
                </div>
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Component Examples
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/line-chart"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  Line Chart
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Multi-series, 100k+ points
                </div>
              </Link>

              <Link
                href="/waterfall-chart"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  Waterfall Chart
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  FFT spectrograms
                </div>
              </Link>

              <Link
                href="/control-chart"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  Control Chart
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  SPC with WE rules
                </div>
              </Link>

              <Link
                href="/heatmap-chart"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  Heatmap Chart
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Thermal imaging
                </div>
              </Link>

              <Link
                href="/attitude-indicator"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  Attitude Indicator
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Artificial horizon
                </div>
              </Link>

              <Link
                href="/gantt"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  Gantt Chart
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Mission timelines
                </div>
              </Link>

              <Link
                href="/histogram-chart"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  Histogram
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Distribution analysis
                </div>
              </Link>

              <Link
                href="/data-grid"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  Data Grid
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Virtual scrolling
                </div>
              </Link>

              <Link
                href="/3d-model-viewer"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  3D Model Viewer
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  STL/OBJ with overlays
                </div>
              </Link>

              <Link
                href="/gauge"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">Gauge</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Circular indicators
                </div>
              </Link>

              <Link
                href="/status-grid"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  Status Grid
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  KPI dashboard
                </div>
              </Link>

              <Link
                href="/radar-chart"
                className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  Radar Chart
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Polar display
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
