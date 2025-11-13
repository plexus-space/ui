/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
"use client";

import { useState, useEffect } from "react";
import { AttitudeIndicator } from "@plexusui/components/charts/attitude-indicator";

export function AttitudeIndicatorExamples() {
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setPitch((p) => {
        const newPitch = p + 0.5;
        return newPitch > 30 ? -30 : newPitch;
      });
      setRoll((r) => {
        const newRoll = r + 1;
        return newRoll > 45 ? -45 : newRoll;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Attitude Indicator</h1>
        <p className="text-zinc-400">
          Artificial horizon showing pitch and roll for aircraft, drones,
          surgical robots, and spacecraft
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Demo */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Interactive Demo</h2>
          <AttitudeIndicator
            pitch={pitch}
            roll={roll}
            width={400}
            height={400}
            showPitchLadder={true}
            showBankIndicator={true}
            pitchStep={10}
          />

          <div className="space-y-4 bg-zinc-900 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2">
                Pitch: {pitch.toFixed(1)}°{" "}
                {pitch > 0 ? "(nose up)" : pitch < 0 ? "(nose down)" : ""}
              </label>
              <input
                type="range"
                min="-90"
                max="90"
                step="0.5"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Roll: {roll.toFixed(1)}°{" "}
                {roll > 0
                  ? "(right wing down)"
                  : roll < 0
                  ? "(left wing down)"
                  : ""}
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={roll}
                onChange={(e) => setRoll(Number(e.target.value))}
                className="w-full"
              />
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
                {autoRotate ? "Stop Animation" : "Auto Rotate"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPitch(0);
                  setRoll(0);
                }}
                className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 font-medium"
              >
                Reset Level
              </button>
            </div>
          </div>
        </div>

        {/* Use Case Examples */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Cross-Domain Applications</h2>

          <div className="space-y-4">
            {/* Aerospace */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-blue-500/30">
              <h3 className="font-semibold text-blue-400 mb-2">
                🛩️ Aerospace & Aviation
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Commercial aircraft primary flight display</li>
                <li>Drone/UAV control interfaces</li>
                <li>Flight simulators and training systems</li>
                <li>Spacecraft attitude control displays</li>
                <li>Helicopter attitude monitoring</li>
              </ul>
            </div>

            {/* Medical */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-green-500/30">
              <h3 className="font-semibold text-green-400 mb-2">
                🏥 Medical & Surgical
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Surgical robot orientation (da Vinci systems)</li>
                <li>Endoscope camera angle visualization</li>
                <li>Patient positioning monitors</li>
                <li>Medical imaging device orientation</li>
                <li>Rehabilitation balance tracking</li>
              </ul>
            </div>

            {/* Robotics */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-purple-500/30">
              <h3 className="font-semibold text-purple-400 mb-2">
                🤖 Robotics & Automation
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Autonomous vehicle orientation</li>
                <li>ROV/submarine pitch and roll</li>
                <li>Robotic arm end-effector angle</li>
                <li>Mobile robot tilt monitoring</li>
                <li>Camera gimbal stabilization display</li>
              </ul>
            </div>

            {/* Defense */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-red-500/30">
              <h3 className="font-semibold text-red-400 mb-2">
                🛡️ Defense & Military
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Military aircraft HUD</li>
                <li>Missile guidance systems</li>
                <li>Tank turret orientation</li>
                <li>Naval vessel pitch and roll</li>
                <li>Tactical vehicle monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Preset Scenarios</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => {
              setPitch(0);
              setRoll(0);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Level Flight</div>
            <div className="text-sm text-zinc-400">Pitch: 0° Roll: 0°</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setPitch(15);
              setRoll(0);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Climb</div>
            <div className="text-sm text-zinc-400">Pitch: +15° Roll: 0°</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setPitch(0);
              setRoll(30);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Right Turn</div>
            <div className="text-sm text-zinc-400">Pitch: 0° Roll: +30°</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setPitch(-10);
              setRoll(-25);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Descending Left</div>
            <div className="text-sm text-zinc-400">Pitch: -10° Roll: -25°</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setPitch(20);
              setRoll(15);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Climbing Turn</div>
            <div className="text-sm text-zinc-400">Pitch: +20° Roll: +15°</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setPitch(0);
              setRoll(45);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Steep Bank</div>
            <div className="text-sm text-zinc-400">Pitch: 0° Roll: +45°</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setPitch(30);
              setRoll(0);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Steep Climb</div>
            <div className="text-sm text-zinc-400">Pitch: +30° Roll: 0°</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setPitch(-15);
              setRoll(0);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg text-left"
          >
            <div className="font-semibold">Descent</div>
            <div className="text-sm text-zinc-400">Pitch: -15° Roll: 0°</div>
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
              <li>• Pitch range: -90° to +90°</li>
              <li>• Roll range: -180° to +180°</li>
              <li>• Configurable pitch ladder (5°, 10°, or custom)</li>
              <li>• Bank angle indicator with major/minor marks</li>
              <li>• Fixed aircraft symbol overlay</li>
              <li>• Smooth WebGL rendering at 60fps</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-300 mb-2">Customization</h3>
            <ul className="space-y-1 text-zinc-400">
              <li>• Customizable sky/ground colors</li>
              <li>• Toggle pitch ladder visibility</li>
              <li>• Toggle bank indicator visibility</li>
              <li>• Adjustable pitch step intervals</li>
              <li>• Responsive sizing</li>
              <li>• Dark mode optimized</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
