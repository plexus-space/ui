"use client";

import { useState } from "react";
import { AudioVisualizer } from "./audio-visualizer";
import { CameraVisualizer } from "./camera-visualizer";
import { OrientationVisualizer } from "./orientation-visualizer";
import { ChevronDown, ChevronUp } from "lucide-react";

export function SensorIntegration() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [enableAudio, setEnableAudio] = useState(false);
  const [enableCamera, setEnableCamera] = useState(false);
  const [enableOrientation, setEnableOrientation] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">Real Device Sensors</div>
          <div className="text-xs text-gray-400">
            Optional: Integrate live audio, camera, and orientation data
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-zinc-950">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAudio}
                onChange={(e) => setEnableAudio(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900"
              />
              <span className="text-sm">Audio (Heart Sounds)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableCamera}
                onChange={(e) => setEnableCamera(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900"
              />
              <span className="text-sm">Camera (Patient Monitor)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableOrientation}
                onChange={(e) => setEnableOrientation(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900"
              />
              <span className="text-sm">Orientation (Bed Angle)</span>
            </label>
          </div>

          {(enableAudio || enableCamera || enableOrientation) && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enableAudio && (
                <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900">
                  <div className="text-xs text-gray-400 mb-2">
                    Live Audio Input
                  </div>
                  <AudioVisualizer />
                </div>
              )}

              {enableCamera && (
                <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900">
                  <div className="text-xs text-gray-400 mb-2">
                    Live Camera Feed
                  </div>
                  <CameraVisualizer />
                </div>
              )}

              {enableOrientation && (
                <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900">
                  <div className="text-xs text-gray-400 mb-2">
                    Device Orientation
                  </div>
                  <OrientationVisualizer />
                </div>
              )}
            </div>
          )}

          {!enableAudio && !enableCamera && !enableOrientation && (
            <div className="text-center text-sm text-gray-500 py-8">
              Enable sensors above to see live device integration
            </div>
          )}
        </div>
      )}
    </div>
  );
}
