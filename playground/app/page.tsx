"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { AudioVisualizer } from "@/components/audio-visualizer";
import { CameraVisualizer } from "@/components/camera-visualizer";
import { OrientationVisualizer } from "@/components/orientation-visualizer";
import { SkateboardTelemetry } from "@/components/skateboard-telemetry";
import { Button } from "@/components/ui/button";

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="py-12">
            <h1 className="text-4xl md:text-5xl mb-4">
              GPU-Accelerated Charts for Physical Systems
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-2">
              Handle 100k+ data points at 60fps. Built for real-time sensor data, telemetry, and streaming hardware systems.
            </p>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              WebGPU-powered • Zero-copy buffers • Free & Open Source
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 justify-center items-center">
        <Tabs
          defaultValue="skateboard"
          className="w-full justify-center items-center flex flex-col"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="skateboard" className="text-xs">
              Skateboard Telemetry
            </TabsTrigger>

            <TabsTrigger value="audio" className="text-xs">
              Live Audio
            </TabsTrigger>
            <TabsTrigger value="camera" className="text-xs">
              Motion Detection
            </TabsTrigger>
            <TabsTrigger value="orientation" className="text-xs">
              Device Tilt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skateboard" className="space-y-4 w-full">
            <SkateboardTelemetry />
          </TabsContent>

          <TabsContent value="audio" className="space-y-4 w-full">
            <AudioVisualizer />
          </TabsContent>

          <TabsContent value="camera" className="space-y-4 w-full">
            <CameraVisualizer />
          </TabsContent>

          <TabsContent value="orientation" className="space-y-4 w-full">
            <OrientationVisualizer />
          </TabsContent>
        </Tabs>
        <div className="max-w-3xl mx-auto text-center pt-12 space-y-4">
          <p className="text-lg">
            Ready to use these components in your project?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button asChild variant="default" size="lg">
              <Link href="https://github.com/plexus-space/ui">
                View on GitHub
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="https://plexusaero.space">
                See Full Platform
              </Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Free & Open Source (MIT) • Copy-paste components • WebGPU accelerated
          </p>
        </div>
      </div>
    </div>
  );
}
