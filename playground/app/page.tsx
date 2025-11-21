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
            <h1 className="text-4xl mb-3">
              Simplifying human-computer interaction for hardware.
            </h1>
            <p className="text-sm text-gray-400 max-w-3xl mx-auto">
              Observability made Simple. Unified visibility and optimization
              across all physical systems.
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
        <p className="text-lg max-w-3xl mx-auto text-center pt-12">
          Want more than just the components? Check out our full product for
          more information.
        </p>
        <div className="flex justify-center items-center text-center pt-4">
          <Button asChild variant="default">
            <Link href="https://plexusaero.space">Try free now!</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
