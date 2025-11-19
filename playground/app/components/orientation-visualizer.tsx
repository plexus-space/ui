"use client";

import { AttitudeIndicator } from "@plexusui/components/charts/attitude-indicator";
import { LineChart } from "@plexusui/components/charts/line-chart";
import { useState, useEffect, useRef } from "react";
import { Smartphone, Navigation, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OrientationVisualizerProps {
  className?: string;
}

export function OrientationVisualizer({
  className,
}: OrientationVisualizerProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Current orientation
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [heading, setHeading] = useState(0);

  // Historical data
  const [pitchHistory, setPitchHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [rollHistory, setRollHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const startTimeRef = useRef<number>(0);
  const historyRef = useRef<
    Array<{ pitch: number; roll: number; heading: number; timestamp: number }>
  >([]);

  // Stats
  const [avgPitch, setAvgPitch] = useState(0);
  const [avgRoll, setAvgRoll] = useState(0);

  const MAX_HISTORY_POINTS = 300;

  useEffect(() => {
    // Check if DeviceOrientation is supported
    if (typeof window !== "undefined") {
      setIsSupported("DeviceOrientationEvent" in window);
    }
  }, []);

  const startOrientation = async () => {
    try {
      setError(null);

      // Request permission for iOS 13+
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === "function"
      ) {
        const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (permission !== "granted") {
          setError("Permission denied to access device orientation");
          return;
        }
      }

      startTimeRef.current = Date.now();
      historyRef.current = [];
      setPitchHistory([]);
      setRollHistory([]);

      window.addEventListener("deviceorientation", handleOrientation);
      setIsActive(true);

      // Test if we're getting orientation events
      setTimeout(() => {
        if (pitch === 0 && roll === 0 && heading === 0) {
          setError(
            "No orientation data detected. This feature requires a mobile device with gyroscope/accelerometer sensors. Try opening this on your phone or tablet."
          );
          stopOrientation();
        }
      }, 2000);
    } catch (err) {
      console.error("Error accessing device orientation:", err);
      setError(
        "Could not access device orientation. This feature requires a device with gyroscope/accelerometer (smartphones, tablets)."
      );
    }
  };

  const stopOrientation = () => {
    window.removeEventListener("deviceorientation", handleOrientation);
    setIsActive(false);
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // DeviceOrientationEvent provides:
    // - alpha: compass direction (0-360)
    // - beta: front-to-back tilt (-180 to 180) - pitch
    // - gamma: left-to-right tilt (-90 to 90) - roll

    // Check if we're getting valid data
    if (event.beta === null || event.gamma === null) {
      console.log('No orientation data available');
      return;
    }

    const beta = event.beta; // pitch
    const gamma = event.gamma; // roll
    const alpha = event.alpha || 0; // heading

    // Normalize pitch: -90 (face down) to +90 (face up)
    let normalizedPitch = beta;
    if (normalizedPitch > 90) {
      normalizedPitch = 180 - normalizedPitch;
    } else if (normalizedPitch < -90) {
      normalizedPitch = -180 - normalizedPitch;
    }

    // Roll is already in the right range (-90 to 90)
    const normalizedRoll = gamma;

    setPitch(normalizedPitch);
    setRoll(normalizedRoll);
    setHeading(alpha);

    // Store history
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    historyRef.current.push({
      pitch: normalizedPitch,
      roll: normalizedRoll,
      heading: alpha,
      timestamp: elapsed,
    });

    // Keep only recent history
    if (historyRef.current.length > MAX_HISTORY_POINTS) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY_POINTS);
    }

    // Update historical charts
    const pitchHist = historyRef.current.map((h) => ({
      x: h.timestamp,
      y: h.pitch,
    }));
    const rollHist = historyRef.current.map((h) => ({
      x: h.timestamp,
      y: h.roll,
    }));
    setPitchHistory(pitchHist);
    setRollHistory(rollHist);

    // Calculate averages
    if (historyRef.current.length > 0) {
      const avgP =
        historyRef.current.reduce((sum, h) => sum + h.pitch, 0) /
        historyRef.current.length;
      const avgR =
        historyRef.current.reduce((sum, h) => sum + h.roll, 0) /
        historyRef.current.length;
      setAvgPitch(avgP);
      setAvgRoll(avgR);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopOrientation();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSupported) {
    return (
      <div className={className}>
        <Card className="hover:border-zinc-700 mb-4">
          <div className="p-8 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
            <Smartphone className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Device Orientation Not Supported
            </h3>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto">
              This feature requires a device with gyroscope/accelerometer
              sensors. Try opening this page on a smartphone or tablet.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Controls */}
      <Card className="hover:border-zinc-700 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold mb-1">
              Device Orientation & Attitude
            </h3>
            <p className="text-xs text-gray-400">
              Real-time gyroscope/accelerometer visualization with aviation
              attitude indicator
            </p>
          </div>
          <button
            onClick={isActive ? stopOrientation : startOrientation}
            className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 text-sm ${
              isActive
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-cyan-500 text-white hover:bg-cyan-600"
            }`}
          >
            {isActive ? (
              <>
                <Smartphone className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4" />
                Start Sensors
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-xs">
            {error}
          </div>
        )}
      </Card>

      {/* Stats Cards */}
      {isActive && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <Card className="hover:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Pitch (β)</div>
                <div className="text-2xl font-bold">{pitch.toFixed(1)}°</div>
                <div className="text-xs text-gray-400 mt-1">
                  {pitch > 0 ? "Nose Up" : pitch < 0 ? "Nose Down" : "Level"}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="hover:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Roll (γ)</div>
                <div className="text-2xl font-bold">{roll.toFixed(1)}°</div>
                <div className="text-xs text-gray-400 mt-1">
                  {roll > 0 ? "Right Tilt" : roll < 0 ? "Left Tilt" : "Level"}
                </div>
              </div>
              <Navigation className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="hover:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Heading (α)</div>
                <div className="text-2xl font-bold">{heading.toFixed(0)}°</div>
                <div className="text-xs text-gray-400 mt-1">
                  {heading >= 337.5 || heading < 22.5
                    ? "N"
                    : heading >= 22.5 && heading < 67.5
                    ? "NE"
                    : heading >= 67.5 && heading < 112.5
                    ? "E"
                    : heading >= 112.5 && heading < 157.5
                    ? "SE"
                    : heading >= 157.5 && heading < 202.5
                    ? "S"
                    : heading >= 202.5 && heading < 247.5
                    ? "SW"
                    : heading >= 247.5 && heading < 292.5
                    ? "W"
                    : "NW"}
                </div>
              </div>
              <Smartphone className="h-8 w-8 text-purple-400" />
            </div>
          </Card>

          <Card className="hover:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Avg Pitch/Roll</div>
                <div className="text-lg font-bold">
                  {avgPitch.toFixed(1)}° / {avgRoll.toFixed(1)}°
                </div>
              </div>
              <div className="h-8 w-8 flex items-center justify-center">
                <div className="h-3 w-3 bg-cyan-500 rounded-full animate-pulse" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {!isActive && (
        <div className="p-8 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center mb-4">
          <Smartphone className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Start Device Orientation
          </h3>
          <p className="text-sm text-zinc-400 mb-4 max-w-lg mx-auto">
            Click "Start Sensors" to visualize your device's orientation in
            real-time. Tilt your phone/tablet to see the attitude indicator
            respond!
          </p>
          <ul className="text-xs text-zinc-500 space-y-1 max-w-md mx-auto">
            <li>✓ Real-time attitude indicator</li>
            <li>✓ Pitch, roll, and heading tracking</li>
            <li>✓ Aviation-style artificial horizon</li>
            <li>✓ Historical orientation data</li>
          </ul>
        </div>
      )}

      {/* Visualizations */}
      {isActive && (
        <>
          {/* Attitude Indicator */}
          <div className="mb-4">
            <ChartCard
              title="Attitude Indicator (Artificial Horizon)"
              description="Aviation-style pitch and roll display"
            >
              <div className="flex justify-center">
                <AttitudeIndicator
                  pitch={pitch}
                  roll={roll}
                  width={500}
                  height={500}
                  showPitchLadder
                  showBankIndicator
                />
              </div>
            </ChartCard>
          </div>

          {/* Historical data */}
          {pitchHistory.length > 10 && (
            <div className="grid gap-3 md:grid-cols-2 mb-4">
              <ChartCard
                title="Pitch Over Time"
                description="Front-to-back tilt (β angle)"
              >
                <LineChart
                  series={[
                    {
                      name: "Pitch",
                      color: "#3b82f6",
                      data: pitchHistory,
                    },
                  ]}
                  width={550}
                  height={250}
                  showGrid
                  showAxes
                  xAxis={{ label: "Time (s)" }}
                  yAxis={{ domain: [-90, 90], label: "Degrees" }}
                />
              </ChartCard>

              <ChartCard
                title="Roll Over Time"
                description="Left-to-right tilt (γ angle)"
              >
                <LineChart
                  series={[
                    {
                      name: "Roll",
                      color: "#10b981",
                      data: rollHistory,
                    },
                  ]}
                  width={550}
                  height={250}
                  showGrid
                  showAxes
                  xAxis={{ label: "Time (s)" }}
                  yAxis={{ domain: [-90, 90], label: "Degrees" }}
                />
              </ChartCard>
            </div>
          )}

          {/* Instructions */}
          <Card className="hover:border-zinc-700">
            <div className="text-xs text-gray-400">
              <p className="font-semibold mb-2">How to use:</p>
              <ul className="space-y-1 ml-4">
                <li>
                  • Tilt your device forward/backward to change{" "}
                  <strong>pitch</strong>
                </li>
                <li>
                  • Tilt your device left/right to change <strong>roll</strong>
                </li>
                <li>
                  • Rotate your device horizontally to change{" "}
                  <strong>heading</strong>
                </li>
                <li>• Watch the artificial horizon respond in real-time!</li>
              </ul>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="hover:border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-gray-500">{title}</h3>
      </div>
      <div className="space-y-3">
        <p className="text-xs text-gray-400">{description}</p>
        <div>{children}</div>
      </div>
    </Card>
  );
}
