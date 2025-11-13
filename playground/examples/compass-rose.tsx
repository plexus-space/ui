"use client";

import { useState, useEffect } from "react";
import { CompassRose } from "@plexusui/components/charts/compass-rose";

export function CompassRoseExamples() {
  const [heading, setHeading] = useState(0);
  const [desiredHeading, setDesiredHeading] = useState(45);
  const [showHeadingBug, setShowHeadingBug] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [variant, setVariant] = useState<"full" | "minimal">("full");

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setHeading((h) => (h + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Compass Rose / Heading Indicator
        </h1>
        <p className="text-zinc-400">
          Navigation heading display for aircraft, ships, autonomous vehicles,
          and directional systems
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Demo */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Interactive Demo</h2>
          <CompassRose
            heading={heading}
            desiredHeading={desiredHeading}
            showHeadingBug={showHeadingBug}
            variant={variant}
            width={400}
            height={400}
          />

          <div className="space-y-4 bg-zinc-900 p-4 rounded-lg">
            <div>
              <label
                htmlFor="heading-input"
                className="block text-sm font-medium mb-2"
              >
                Current Heading: {heading.toFixed(0)}° (
                {getCardinalDirection(heading)})
              </label>
              <input
                id="heading-input"
                type="range"
                min="0"
                max="359"
                step="1"
                value={heading}
                onChange={(e) => setHeading(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="show-heading-bug-checkbox"
                className="flex items-center gap-2 mb-2"
              >
                <input
                  id="show-heading-bug-checkbox"
                  type="checkbox"
                  checked={showHeadingBug}
                  onChange={(e) => setShowHeadingBug(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Show Heading Bug</span>
              </label>

              {showHeadingBug && (
                <>
                  <label
                    htmlFor="desired-heading-input"
                    className="block text-sm font-medium mb-2 mt-3"
                  >
                    Desired Heading: {desiredHeading.toFixed(0)}°
                  </label>
                  <input
                    id="desired-heading-input"
                    type="range"
                    min="0"
                    max="359"
                    step="1"
                    value={desiredHeading}
                    onChange={(e) => setDesiredHeading(Number(e.target.value))}
                    className="w-full"
                  />
                </>
              )}
            </div>

            <div>
              <label
                htmlFor="display-mode-select"
                className="block text-sm font-medium mb-2"
              >
                Display Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVariant("full")}
                  className={`px-4 py-2 rounded font-medium ${
                    variant === "full"
                      ? "bg-blue-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  Full
                </button>
                <button
                  type="button"
                  onClick={() => setVariant("minimal")}
                  className={`px-4 py-2 rounded font-medium ${
                    variant === "minimal"
                      ? "bg-blue-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  Minimal
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-4 py-2 rounded font-medium ${
                  autoRotate
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {autoRotate ? "Stop Rotation" : "Auto Rotate"}
              </button>
              <button
                type="button"
                onClick={() => setHeading(0)}
                className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 font-medium"
              >
                Reset North
              </button>
            </div>
          </div>
        </div>

        {/* Use Case Examples */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Cross-Domain Applications</h2>

          <div className="space-y-4">
            {/* Aerospace & Maritime */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-blue-500/30">
              <h3 className="font-semibold text-blue-400 mb-2">
                🛩️ Aerospace & Maritime
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Aircraft navigation and autopilot</li>
                <li>Ship compass and course plotting</li>
                <li>Helicopter directional gyro</li>
                <li>Drone heading indicator</li>
                <li>Spacecraft attitude reference</li>
              </ul>
            </div>

            {/* Autonomous Vehicles */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-green-500/30">
              <h3 className="font-semibold text-green-400 mb-2">
                🚗 Autonomous Vehicles
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Self-driving car navigation</li>
                <li>Robot navigation systems</li>
                <li>AGV (Automated Guided Vehicle) heading</li>
                <li>Delivery drone route display</li>
                <li>Agricultural robot guidance</li>
              </ul>
            </div>

            {/* Robotics & Systems */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-purple-500/30">
              <h3 className="font-semibold text-purple-400 mb-2">
                🤖 Robotics & Systems
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Robotic arm azimuth control</li>
                <li>Camera pan direction display</li>
                <li>Antenna pointing systems</li>
                <li>Turret rotation indicator</li>
                <li>Gimbal heading visualization</li>
              </ul>
            </div>

            {/* Medical & Scientific */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-red-500/30">
              <h3 className="font-semibold text-red-400 mb-2">
                🏥 Medical & Scientific
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>CT/MRI scan angle orientation</li>
                <li>Surgical camera rotation</li>
                <li>Microscope stage rotation</li>
                <li>Telescope azimuth display</li>
                <li>Weather vane direction</li>
              </ul>
            </div>

            {/* Industrial & IoT */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-orange-500/30">
              <h3 className="font-semibold text-orange-400 mb-2">
                🏭 Industrial & IoT
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Wind direction monitoring</li>
                <li>Solar panel orientation</li>
                <li>Crane rotation display</li>
                <li>Conveyor belt direction</li>
                <li>Satellite dish pointing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Directions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Direction Presets</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {[
            { label: "N", deg: 0 },
            { label: "NE", deg: 45 },
            { label: "E", deg: 90 },
            { label: "SE", deg: 135 },
            { label: "S", deg: 180 },
            { label: "SW", deg: 225 },
            { label: "W", deg: 270 },
            { label: "NW", deg: 315 },
          ].map(({ label, deg }) => (
            <button
              key={label}
              type="button"
              onClick={() => setHeading(deg)}
              className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-center"
            >
              <div className="font-bold text-lg">{label}</div>
              <div className="text-sm text-zinc-400">{deg}°</div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Scenarios */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Navigation Scenarios</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => {
              setHeading(270);
              setDesiredHeading(270);
              setShowHeadingBug(true);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Westbound Flight</div>
            <div className="text-sm text-zinc-400">Heading: 270°</div>
            <div className="text-xs text-zinc-500 mt-1">On course</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setHeading(45);
              setDesiredHeading(90);
              setShowHeadingBug(true);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Course Correction</div>
            <div className="text-sm text-zinc-400">Current: 45°</div>
            <div className="text-xs text-zinc-500 mt-1">Target: 90°</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setHeading(180);
              setDesiredHeading(180);
              setShowHeadingBug(true);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Southbound</div>
            <div className="text-sm text-zinc-400">Heading: 180°</div>
            <div className="text-xs text-zinc-500 mt-1">Aligned</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setHeading(350);
              setDesiredHeading(10);
              setShowHeadingBug(true);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Slight Turn</div>
            <div className="text-sm text-zinc-400">Current: 350°</div>
            <div className="text-xs text-zinc-500 mt-1">Target: 10°</div>
          </button>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="bg-zinc-900 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">Technical Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-zinc-300 mb-2">Features</h3>
            <ul className="space-y-1 text-zinc-400">
              <li>• Full 360° rotation range</li>
              <li>• Cardinal direction labels (N, E, S, W)</li>
              <li>• Major tick marks every 30°</li>
              <li>• Minor tick marks every 5° (full mode)</li>
              <li>• Optional heading bug for desired course</li>
              <li>• Real-time heading readout with cardinal direction</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-300 mb-2">Customization</h3>
            <ul className="space-y-1 text-zinc-400">
              <li>• Full or minimal display modes</li>
              <li>• Customizable colors (rose, heading, bug)</li>
              <li>• Smooth WebGL rendering at 60fps</li>
              <li>• Responsive sizing</li>
              <li>• Toggle heading bug visibility</li>
              <li>• Dark mode optimized</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCardinalDirection(hdg: number) {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const normalizedHdg = ((hdg % 360) + 360) % 360;
  const index = Math.round(normalizedHdg / 22.5) % 16;
  return dirs[index];
}
