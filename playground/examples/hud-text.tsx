"use client";

/**
 * HUD Text Examples - MSDF
 * Working implementation using WebGPU samples MSDF renderer
 */

import { useRef, useState } from "react";
import { ComponentPreview } from "@/components/component-preview";
import { MsdfTextRenderer } from "@plexusui/components/primitives/webgpu/msdf-text-renderer";

const FONT_URL = "/ya-hei-ascii-msdf.json";

export const HUDTextExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Basic MSDF Text Rendering"
        description="High-performance GPU-accelerated text rendering using Multi-channel Signed Distance Fields from WebGPU samples."
        preview={<BasicTextDemo />}
        code={`const FONT_URL = "/ya-hei-ascii-msdf.json";

<MsdfTextRenderer
  canvas={canvasRef.current}
  fontJsonUrl={FONT_URL}
  labels={[
    { text: "ALTITUDE: 10000 FT", x: 50, y: 100, color: [0, 1, 1, 1] },
    { text: "VELOCITY: 250 KTS", x: 50, y: 150, color: [0, 1, 1, 1] },
    { text: "HEADING: 245°", x: 50, y: 200, color: [1, 1, 0, 1], scale: 1.2 },
  ]}
  width={800}
  height={400}
  pixelScale={0.5}
/>`}
      />
    </div>
  );
};

function BasicTextDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  return (
    <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
      <canvas
        ref={(el) => {
          canvasRef.current = el;
          setCanvas(el);
        }}
        width={800}
        height={400}
        className="w-full h-full"
      />
      {canvas && (
        <MsdfTextRenderer
          canvas={canvas}
          fontJsonUrl={FONT_URL}
          labels={[
            {
              text: "ALTITUDE 10000 FT",
              x: 20,
              y: 50,
              color: [0, 1, 1, 1],
              scale: 0.5,
            },
            {
              text: "VELOCITY 250 KTS",
              x: 20,
              y: 75,
              color: [0, 1, 1, 1],
              scale: 0.5,
            },
          ]}
          width={800}
          height={400}
          pixelScale={0.5}
          onReady={() => setIsReady(true)}
        />
      )}
      {isReady && (
        <div className="absolute bottom-4 right-4 text-xs text-green-400">
          WebGPU Active
        </div>
      )}
    </div>
  );
}

export { hudTextApiProps as HUDTextApiReference } from "./api/hud-text";
