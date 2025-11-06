"use client";

import * as React from "react";
import { WebGPULineRenderer } from "@plexusui/components/primitives/webgpu/line-renderer";

// Create a super simple test first - just a static line
export const WaveformMonitorSimple: React.FC = () => {
  const canvas2dRef = React.useRef<HTMLCanvasElement>(null);
  const webgpuCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const [webgpuCanvas, setWebgpuCanvas] = React.useState<HTMLCanvasElement | null>(null);

  // Canvas2D test
  React.useEffect(() => {
    const canvas = canvas2dRef.current;
    if (!canvas) return;

    console.log("[Simple] Canvas ref:", canvas);
    console.log("[Simple] WebGPU available:", !!navigator.gpu);

    // Draw something simple with Canvas2D first
    const ctx = canvas.getContext("2d");
    if (ctx) {
      console.log("[Simple] Drawing with Canvas2D");

      // Background
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, 800, 400);

      // Grid
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * 800;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 400);
        ctx.stroke();
      }
      for (let i = 0; i <= 8; i++) {
        const y = (i / 8) * 400;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // Draw a simple waveform
      ctx.strokeStyle = "#0f8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < 800; x++) {
        const t = (x / 800) * Math.PI * 4;
        const y = 200 + Math.sin(t) * 100;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      console.log("[Simple] Canvas2D drawing complete");
    }
  }, []);

  // Set WebGPU canvas
  React.useEffect(() => {
    if (webgpuCanvasRef.current && !webgpuCanvas) {
      console.log("[Simple] Setting WebGPU canvas");
      setWebgpuCanvas(webgpuCanvasRef.current);
    }
  }, [webgpuCanvas]);

  // Generate simple static data - a sine wave
  const staticPoints: Array<[number, number]> = React.useMemo(() => {
    console.log("[Simple] Generating static points");
    const points: Array<[number, number]> = [];
    for (let i = 0; i < 200; i++) {
      const x = i / 200;
      const y = 0.5 + Math.sin(i / 20) * 0.3;
      points.push([x, y]);
    }
    console.log("[Simple] Generated", points.length, "points");
    return points;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Canvas2D Test</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          This tests basic canvas rendering without WebGPU. If you see a green
          sine wave, Canvas2D works.
        </p>
        <canvas
          ref={canvas2dRef}
          width={800}
          height={400}
          className="border border-zinc-800 rounded"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">WebGPU LineRenderer Test</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          This tests the WebGPU LineRenderer primitive with static data. You
          should see a blue sine wave if WebGPU works.
        </p>
        <div className="relative bg-zinc-950 border border-zinc-800 rounded p-4">
          <canvas
            ref={webgpuCanvasRef}
            width={800}
            height={400}
            className="border border-zinc-700"
          />
          {webgpuCanvas && (
            <WebGPULineRenderer
              canvas={webgpuCanvas}
              points={staticPoints}
              color={[0.3, 0.6, 1.0]}
              width={800}
              height={400}
              xDomain={[0, 1]}
              yDomain={[0, 1]}
              onReady={() => console.log("[Simple] WebGPU renderer ready!")}
              onError={(err) => console.error("[Simple] WebGPU error:", err)}
            />
          )}
        </div>
      </div>

      <div className="text-xs text-zinc-500 space-y-1">
        <div>
          WebGPU Available:{" "}
          {typeof navigator !== "undefined" && navigator.gpu ? "✓ Yes" : "✗ No"}
        </div>
        <div>
          Canvas API:{" "}
          {typeof HTMLCanvasElement !== "undefined" ? "✓ Yes" : "✗ No"}
        </div>
        <div>Static Points Generated: {staticPoints.length}</div>
        <div>WebGPU Canvas Set: {webgpuCanvas ? "✓ Yes" : "✗ No"}</div>
      </div>

      <div className="text-xs text-zinc-400 bg-zinc-900 p-3 rounded border border-zinc-800">
        <div className="font-semibold mb-1">Check Console for:</div>
        <div className="font-mono space-y-1">
          <div>[LineRenderer] Initializing WebGPU renderer</div>
          <div>[LineRenderer] Creating renderer...</div>
          <div>[LineRenderer] Renderer created successfully</div>
          <div>[LineRenderer] Updating data</div>
          <div>[Simple] WebGPU renderer ready!</div>
        </div>
      </div>
    </div>
  );
};
