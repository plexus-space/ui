"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { io, Socket } from "socket.io-client";
import { LineChart } from "@plexusui/components/charts/line-chart";
import { AttitudeIndicator } from "@plexusui/components/charts/attitude-indicator";
import { GanttChart } from "@plexusui/components/charts/gantt";
import { RadarChart } from "@plexusui/components/charts/radar-chart";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, Wifi, WifiOff, Zap, Gauge } from "lucide-react";
import dynamic from "next/dynamic";

const Skatepark3D = dynamic(() => import("./skatepark-3d"), { ssr: false });

interface SensorData {
  timestamp: number;
  pitch: number;
  roll: number;
  heading: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  temperature: number;
  g_force: number;
  trick?: string;
  airtime?: number;
  is_airborne?: boolean;
  sensor_type: string;
  anomalies?: string[];
}

interface TrickEvent {
  id: string;
  name: string;
  timestamp: number;
  airtime: number;
  maxG: number;
  landed: boolean;
}

const MAX_HISTORY_POINTS = 200; // Reduced for better performance
const DISPLAY_UPDATE_INTERVAL = 50; // 20Hz for numbers
const CHART_UPDATE_INTERVAL = 100; // 10Hz for charts

export function SkateboardTelemetry() {
  const [demoMode, setDemoMode] = useState(true);
  const [piHost, setPiHost] = useState("localhost");
  const [piPort, setPiPort] = useState("8080");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const demoTimeRef = useRef(0);
  const demoStateRef = useRef({
    trickInProgress: false,
    trickStartTime: 0,
    currentTrick: "",
    isAirborne: false,
  });

  // Historical data for charts
  const [pitchHistory, setPitchHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [rollHistory, setRollHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [gForceHistory, setGForceHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);

  // Trick detection
  const [trickCount, setTrickCount] = useState(0);
  const [maxGForce, setMaxGForce] = useState(0);
  const [trickHistory, setTrickHistory] = useState<TrickEvent[]>([]);

  // Total acceleration magnitude
  const [_totalAcceleration, setTotalAcceleration] = useState(0);

  // Position estimation from accelerometer
  const [_estimatedPosition, setEstimatedPosition] = useState({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const [positionHistory, setPositionHistory] = useState<
    Array<{ angle: number; distance: number; timestamp: number }>
  >([]);
  const lastPositionUpdateRef = useRef(0);

  // Velocity tracking for speed chart
  const [velocityHistory, setVelocityHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  // Gyroscope history for 3D visualization
  const [gyroXHistory, setGyroXHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [gyroYHistory, setGyroYHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [gyroZHistory, setGyroZHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);

  // Display smoothing - update display less frequently than data arrival
  const [displayData, setDisplayData] = useState<SensorData | null>(null);
  const lastDisplayUpdateRef = useRef(0);
  const lastChartUpdateRef = useRef(0);
  const dataBufferRef = useRef<SensorData | null>(null);

  // Generate realistic demo sensor data
  const generateDemoData = useCallback((): SensorData => {
    const time = demoTimeRef.current;
    const state = demoStateRef.current;

    // Simulate various skateboarding scenarios
    const scenarios = [
      { type: "cruising", duration: 5000, probability: 0.4 },
      { type: "trick", duration: 2000, probability: 0.3 },
      { type: "sharp_turn", duration: 1000, probability: 0.2 },
      { type: "ramp", duration: 1500, probability: 0.1 },
    ];

    let pitch = 0,
      roll = 0,
      heading = 0;
    let gyro_x = 0,
      gyro_y = 0,
      gyro_z = 0;
    let accel_x = 0,
      accel_y = 1,
      accel_z = 0; // Default 1g downward
    let g_force = 1;
    let trick = undefined;
    let airtime = undefined;
    let is_airborne = false;

    // Determine current scenario
    if (!state.trickInProgress && Math.random() > 0.98) {
      // Start a new trick/event
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      state.trickInProgress = true;
      state.trickStartTime = time;
      state.currentTrick = scenario.type;
    }

    if (state.trickInProgress) {
      const elapsed = time - state.trickStartTime;
      const progress = elapsed / 2000; // 2 second tricks

      switch (state.currentTrick) {
        case "trick":
          // Simulate ollie or kickflip
          if (progress < 0.3) {
            // Crouch phase
            pitch = -15 + Math.random() * 5;
            accel_z = 1.5 + Math.random() * 0.3;
            g_force = 1.5;
          } else if (progress < 0.6) {
            // Airborne phase
            pitch = 25 + Math.sin(progress * Math.PI * 4) * 30;
            roll = Math.sin(progress * Math.PI * 6) * 45;
            gyro_x = Math.sin(progress * Math.PI * 8) * 400;
            gyro_y = Math.sin(progress * Math.PI * 6) * 300;
            gyro_z = Math.sin(progress * Math.PI * 4) * 200;
            accel_z = 0.2 + Math.random() * 0.1; // Low g during airborne
            g_force = 0.3;
            is_airborne = true;
            airtime = elapsed - 600;
            trick = Math.random() > 0.5 ? "Kickflip" : "Ollie";
            state.isAirborne = true;
          } else {
            // Landing phase
            pitch = -5 + Math.random() * 3;
            roll = Math.random() * 5 - 2.5;
            accel_z = 2.5 + Math.random() * 1.5;
            g_force = 3.5 + Math.random() * 1.5;
            if (state.isAirborne) {
              trick = state.currentTrick === "trick" ? "Kickflip" : "Ollie";
              airtime = 600;
              state.isAirborne = false;
            }
          }
          if (progress > 1) state.trickInProgress = false;
          break;

        case "sharp_turn":
          roll = Math.sin(progress * Math.PI) * 50;
          gyro_z = Math.cos(progress * Math.PI) * 300;
          heading = (heading + 5) % 360;
          g_force = 1.2 + Math.abs(Math.sin(progress * Math.PI)) * 0.8;
          if (progress > 1) state.trickInProgress = false;
          break;

        case "ramp":
          if (progress < 0.5) {
            // Going up
            pitch = progress * 80;
            accel_y = 1.5 + progress * 0.5;
            g_force = 1.5 + progress * 0.5;
          } else {
            // Coming down
            pitch = (1 - progress) * 80;
            accel_y = 2 - (progress - 0.5) * 2;
            g_force = 2 - (progress - 0.5);
          }
          if (progress > 1) state.trickInProgress = false;
          break;

        default:
          // Cruising
          pitch = Math.sin(time / 1000) * 5;
          roll = Math.sin(time / 1500) * 3;
          heading = (heading + 0.1) % 360;
          g_force = 1 + Math.random() * 0.1;
          if (progress > 1) state.trickInProgress = false;
      }
    } else {
      // Normal cruising
      pitch = Math.sin(time / 2000) * 8;
      roll = Math.sin(time / 2500) * 5;
      heading = (time / 100) % 360;
      gyro_x = Math.sin(time / 1000) * 50 + (Math.random() - 0.5) * 20;
      gyro_y = Math.sin(time / 1200) * 40 + (Math.random() - 0.5) * 15;
      gyro_z = Math.sin(time / 1500) * 30 + (Math.random() - 0.5) * 10;
      accel_x = Math.sin(time / 1000) * 0.3 + (Math.random() - 0.5) * 0.1;
      accel_y = 1 + (Math.random() - 0.5) * 0.1;
      accel_z = (Math.random() - 0.5) * 0.1;
      g_force = 1 + Math.random() * 0.2;
    }

    demoTimeRef.current += 50;

    return {
      timestamp: Date.now(),
      pitch,
      roll,
      heading,
      gyro_x,
      gyro_y,
      gyro_z,
      accel_x,
      accel_y,
      accel_z,
      temperature: 25 + Math.random() * 5,
      g_force,
      trick,
      airtime,
      is_airborne,
      sensor_type: "MPU6050 (Demo Mode)",
      anomalies: g_force > 5 ? ["High G-Force Detected"] : undefined,
    };
  }, []);

  // Start demo mode
  useEffect(() => {
    if (demoMode) {
      setIsConnected(true);
      setConnectionError(null);

      demoIntervalRef.current = setInterval(() => {
        const data = generateDemoData();
        dataBufferRef.current = data;
        setCurrentData(data);

        const now = Date.now();

        // Throttle display updates
        if (now - lastDisplayUpdateRef.current > DISPLAY_UPDATE_INTERVAL) {
          setDisplayData(data);
          lastDisplayUpdateRef.current = now;
        }

        // Calculate total acceleration magnitude
        const totalAccel = Math.sqrt(
          data.accel_x ** 2 + data.accel_y ** 2 + data.accel_z ** 2
        );
        setTotalAcceleration(totalAccel);

        // Calculate speed from acceleration
        const speed = Math.sqrt(data.accel_x ** 2 + data.accel_y ** 2) * 10;
        setCurrentSpeed(speed);

        // Throttle chart updates
        if (now - lastChartUpdateRef.current > CHART_UPDATE_INTERVAL) {
          const timestamp = now;

          setPitchHistory((prev) => {
            const updated = [...prev, { x: timestamp, y: data.pitch }];
            return updated.slice(-MAX_HISTORY_POINTS);
          });

          setRollHistory((prev) => {
            const updated = [...prev, { x: timestamp, y: data.roll }];
            return updated.slice(-MAX_HISTORY_POINTS);
          });

          setGForceHistory((prev) => {
            const updated = [...prev, { x: timestamp, y: data.g_force }];
            return updated.slice(-MAX_HISTORY_POINTS);
          });

          setVelocityHistory((prev) => {
            const updated = [...prev, { x: timestamp, y: speed }];
            return updated.slice(-MAX_HISTORY_POINTS);
          });

          setGyroXHistory((prev) => {
            const updated = [...prev, { x: timestamp, y: data.gyro_x }];
            return updated.slice(-MAX_HISTORY_POINTS);
          });

          setGyroYHistory((prev) => {
            const updated = [...prev, { x: timestamp, y: data.gyro_y }];
            return updated.slice(-MAX_HISTORY_POINTS);
          });

          setGyroZHistory((prev) => {
            const updated = [...prev, { x: timestamp, y: data.gyro_z }];
            return updated.slice(-MAX_HISTORY_POINTS);
          });

          lastChartUpdateRef.current = now;
        }

        // Position estimation
        const POSITION_UPDATE_INTERVAL = 100;
        if (now - lastPositionUpdateRef.current > POSITION_UPDATE_INTERVAL) {
          const dt = (now - lastPositionUpdateRef.current) / 1000;
          const headingRad = (data.heading * Math.PI) / 180;

          const accelWorldX =
            data.accel_x * Math.cos(headingRad) -
            data.accel_y * Math.sin(headingRad);
          const accelWorldY =
            data.accel_x * Math.sin(headingRad) +
            data.accel_y * Math.cos(headingRad);

          velocityRef.current = {
            x: velocityRef.current.x + accelWorldX * dt * 0.5,
            y: velocityRef.current.y + accelWorldY * dt * 0.5,
          };

          setEstimatedPosition((prev) => {
            const newX = prev.x + velocityRef.current.x * dt;
            const newY = prev.y + velocityRef.current.y * dt;

            const distance = Math.sqrt(newX ** 2 + newY ** 2);
            const angle = (Math.atan2(newY, newX) * 180) / Math.PI + 180;

            setPositionHistory((prevHistory) => {
              const updated = [
                ...prevHistory,
                {
                  angle,
                  distance: Math.min(distance / 50, 1),
                  timestamp: now,
                },
              ];
              return updated.slice(-10);
            });

            return { x: newX, y: newY };
          });

          lastPositionUpdateRef.current = now;
        }

        // Track tricks
        if (data.trick) {
          setTrickCount((prev) => prev + 1);

          const trickEvent: TrickEvent = {
            id: `trick-${now}`,
            name: data.trick,
            timestamp: now,
            airtime: data.airtime || 0,
            maxG: data.g_force,
            landed: data.g_force < 6,
          };

          setTrickHistory((prev) => {
            const updated = [...prev, trickEvent];
            return updated.slice(-20);
          });
        }

        if (data.g_force > maxGForce) {
          setMaxGForce(data.g_force);
        }
      }, 50);

      return () => {
        if (demoIntervalRef.current) {
          clearInterval(demoIntervalRef.current);
        }
      };
    } else {
      // Clean up demo mode
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
      setIsConnected(false);
      setCurrentData(null);
      setDisplayData(null);
    }
  }, [demoMode, generateDemoData, maxGForce]);

  const connectWebSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }

    const serverUrl = `http://${piHost}:${piPort}`;

    try {
      const newSocket = io(serverUrl, {
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        setIsConnected(true);
        setConnectionError(null);

        newSocket.emit("start_stream");
      });

      newSocket.on("sensor_data", (data: SensorData) => {
        try {
          dataBufferRef.current = data;
          setCurrentData(data);

          const now = Date.now();

          // Throttle display updates to 20Hz (every 50ms) to prevent flickering
          if (now - lastDisplayUpdateRef.current > DISPLAY_UPDATE_INTERVAL) {
            setDisplayData(data);
            lastDisplayUpdateRef.current = now;
          }

          // Calculate total acceleration magnitude
          const totalAccel = Math.sqrt(
            data.accel_x ** 2 + data.accel_y ** 2 + data.accel_z ** 2
          );
          setTotalAcceleration(totalAccel);

          // Throttle chart updates to 10Hz (every 100ms) for better performance
          if (now - lastChartUpdateRef.current > CHART_UPDATE_INTERVAL) {
            const timestamp = now;

            setPitchHistory((prev) => {
              const updated = [...prev, { x: timestamp, y: data.pitch }];
              return updated.slice(-MAX_HISTORY_POINTS);
            });

            setRollHistory((prev) => {
              const updated = [...prev, { x: timestamp, y: data.roll }];
              return updated.slice(-MAX_HISTORY_POINTS);
            });

            setGForceHistory((prev) => {
              const updated = [...prev, { x: timestamp, y: data.g_force }];
              return updated.slice(-MAX_HISTORY_POINTS);
            });

            // Calculate speed from acceleration
            const speed = Math.sqrt(data.accel_x ** 2 + data.accel_y ** 2) * 10;
            setCurrentSpeed(speed);

            setVelocityHistory((prev) => {
              const updated = [...prev, { x: timestamp, y: speed }];
              return updated.slice(-MAX_HISTORY_POINTS);
            });

            setGyroXHistory((prev) => {
              const updated = [...prev, { x: timestamp, y: data.gyro_x }];
              return updated.slice(-MAX_HISTORY_POINTS);
            });

            setGyroYHistory((prev) => {
              const updated = [...prev, { x: timestamp, y: data.gyro_y }];
              return updated.slice(-MAX_HISTORY_POINTS);
            });

            setGyroZHistory((prev) => {
              const updated = [...prev, { x: timestamp, y: data.gyro_z }];
              return updated.slice(-MAX_HISTORY_POINTS);
            });

            lastChartUpdateRef.current = now;
          }

          // Position estimation from accelerometer (double integration)
          const POSITION_UPDATE_INTERVAL = 100; // 10Hz
          if (now - lastPositionUpdateRef.current > POSITION_UPDATE_INTERVAL) {
            const dt = (now - lastPositionUpdateRef.current) / 1000; // Convert to seconds

            // Convert heading to radians for coordinate transformation
            const headingRad = (data.heading * Math.PI) / 180;

            // Transform accelerations from board frame to world frame
            // Assuming heading is yaw, and we're working in a 2D plane
            const accelWorldX =
              data.accel_x * Math.cos(headingRad) -
              data.accel_y * Math.sin(headingRad);
            const accelWorldY =
              data.accel_x * Math.sin(headingRad) +
              data.accel_y * Math.cos(headingRad);

            // Update velocity (first integration) using ref
            velocityRef.current = {
              x: velocityRef.current.x + accelWorldX * dt * 0.5, // Damping factor to reduce drift
              y: velocityRef.current.y + accelWorldY * dt * 0.5,
            };

            // Update position (second integration)
            setEstimatedPosition((prev) => {
              const newX = prev.x + velocityRef.current.x * dt;
              const newY = prev.y + velocityRef.current.y * dt;

              // Calculate polar coordinates for radar chart
              const distance = Math.sqrt(newX ** 2 + newY ** 2);
              const angle = (Math.atan2(newY, newX) * 180) / Math.PI + 180; // 0-360 degrees

              // Update position history
              setPositionHistory((prevHistory) => {
                const updated = [
                  ...prevHistory,
                  {
                    angle,
                    distance: Math.min(distance / 50, 1),
                    timestamp: now,
                  },
                ];
                return updated.slice(-10); // Keep last 10 positions for trail
              });

              return { x: newX, y: newY };
            });

            lastPositionUpdateRef.current = now;
          }

          // Track tricks in history
          if (data.trick) {
            setTrickCount((prev) => prev + 1);

            // Add trick to history
            const trickEvent: TrickEvent = {
              id: `trick-${now}`,
              name: data.trick,
              timestamp: now,
              airtime: data.airtime || 0,
              maxG: data.g_force,
              landed: data.g_force < 6, // Assume successful landing if G-force is reasonable
            };

            setTrickHistory((prev) => {
              const updated = [...prev, trickEvent];
              return updated.slice(-20); // Keep last 20 tricks
            });
          }

          if (data.g_force > maxGForce) {
            setMaxGForce(data.g_force);
          }
        } catch (error) {
          console.error("Error processing sensor data:", error);
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket.IO connection error:", error);
        setConnectionError("Connection error - check Pi network");
        setIsConnected(false);
      });

      newSocket.on("disconnect", () => {
        console.log("🔌 Socket.IO disconnected");
        setIsConnected(false);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("Failed to create Socket.IO connection:", error);
      setConnectionError("Failed to connect - check hostname/port");
    }
  }, [piHost, piPort, socket, maxGForce]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <div className="space-y-4">
      <Card className="border-zinc-800 hover:border-zinc-700 transition-colors p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 border-r border-zinc-700 pr-3">
            <div className="flex items-center gap-2">
              <Switch
                id="demo-mode"
                checked={demoMode}
                onCheckedChange={(checked) => {
                  setDemoMode(checked);
                  if (socket && checked) {
                    disconnect();
                  }
                }}
              />
              <Label
                htmlFor="demo-mode"
                className="text-xs font-medium text-zinc-300 cursor-pointer"
              >
                Demo Mode
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-zinc-500" />
            )}
            <span className="text-xs font-medium text-zinc-300">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {!demoMode && (
            <>
              <Input
                placeholder="Raspberry Pi hostname"
                value={piHost}
                onChange={(e) => setPiHost(e.target.value)}
                className="w-56 h-8 text-xs border-zinc-700"
                disabled={isConnected}
              />

              <Input
                placeholder="Port"
                value={piPort}
                onChange={(e) => setPiPort(e.target.value)}
                className="w-20 h-8 text-xs border-zinc-700"
                disabled={isConnected}
              />

              {!isConnected ? (
                <Button
                  onClick={connectWebSocket}
                  size="sm"
                  className="h-8 text-xs bg-blue-500 hover:bg-blue-600"
                >
                  Connect
                </Button>
              ) : (
                <Button
                  onClick={disconnect}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-zinc-700"
                >
                  Disconnect
                </Button>
              )}

              {connectionError && (
                <span className="text-xs text-red-400">{connectionError}</span>
              )}
            </>
          )}

          {currentData && (
            <span className="text-xs text-zinc-500 ml-auto">
              {currentData.sensor_type}
              {currentData.is_airborne && (
                <span className="ml-2 text-yellow-400">AIRBORNE</span>
              )}
            </span>
          )}
        </div>
      </Card>

      {!isConnected && !demoMode ? (
        <div className="p-12  rounded-xl border text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-base font-medium mb-2">
            Connect Skateboard Telemetry
          </h3>
          <p className="text-sm text-zinc-500 mb-4 max-w-lg mx-auto leading-relaxed">
            Enter your Raspberry Pi hostname or IP address and connect to see
            real-time skateboard sensor data, or enable Demo Mode to see
            simulated data
          </p>
          <div className="inline-flex items-center gap-4 text-xs text-zinc-600">
            <div>
              Default:{" "}
              <code className="bg-zinc-900 px-2 py-1 rounded text-zinc-400">
                raspberrypi.local
              </code>
            </div>
            <div>
              or IP:{" "}
              <code className="bg-zinc-900 px-2 py-1 rounded text-zinc-400">
                192.168.1.X
              </code>
            </div>
          </div>
        </div>
      ) : isConnected ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard
              icon={Zap}
              title="Max G-Force"
              value={`${maxGForce.toFixed(1)}G`}
              subtitle={`Tricks detected: ${trickCount}`}
            />
            <StatCard
              icon={Gauge}
              title="Current Speed"
              value={`${currentSpeed.toFixed(1)} km/h`}
              subtitle={`Estimated velocity`}
            />
            <StatCard
              icon={Activity}
              title="Temperature"
              value={`${(displayData?.temperature ?? 0).toFixed(1)}°C`}
              subtitle={`MPU6050 sensor`}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ChartCard
              title="Board Orientation"
              description="Real-time pitch and roll angles"
            >
              {displayData ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <AttitudeIndicator
                      pitch={displayData.pitch}
                      roll={displayData.roll}
                      width={200}
                      height={200}
                    />

                    <div className="flex-1 space-y-4">
                      {/* Pitch */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            Pitch (Forward/Back)
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded transition-colors ${
                              Math.abs(displayData.pitch) < 30
                                ? "bg-green-500/20 text-green-400"
                                : Math.abs(displayData.pitch) < 60
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {Math.abs(displayData.pitch) < 30
                              ? "Normal"
                              : Math.abs(displayData.pitch) < 60
                              ? "Moderate"
                              : "Extreme"}
                          </span>
                        </div>
                        <div
                          className="text-4xl font-bold font-mono tabular-nums transition-all duration-200"
                          style={{ willChange: "contents" }}
                        >
                          {displayData.pitch > 0 ? "+" : ""}
                          {displayData.pitch.toFixed(0)}°
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ease-out ${
                              Math.abs(displayData.pitch) < 30
                                ? "bg-green-500"
                                : Math.abs(displayData.pitch) < 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (Math.abs(displayData.pitch) / 90) * 100,
                                100
                              )}%`,
                              willChange: "width",
                              transform: "translateZ(0)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Roll */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            Roll (Left/Right)
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded transition-colors ${
                              Math.abs(displayData.roll) < 30
                                ? "bg-green-500/20 text-green-400"
                                : Math.abs(displayData.roll) < 60
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {Math.abs(displayData.roll) < 30
                              ? "Normal"
                              : Math.abs(displayData.roll) < 60
                              ? "Moderate"
                              : "Extreme"}
                          </span>
                        </div>
                        <div
                          className="text-4xl font-bold font-mono tabular-nums transition-all duration-200"
                          style={{ willChange: "contents" }}
                        >
                          {displayData.roll > 0 ? "+" : ""}
                          {displayData.roll.toFixed(0)}°
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ease-out ${
                              Math.abs(displayData.roll) < 30
                                ? "bg-green-500"
                                : Math.abs(displayData.roll) < 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (Math.abs(displayData.roll) / 90) * 100,
                                100
                              )}%`,
                              willChange: "width",
                              transform: "translateZ(0)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  Waiting for data...
                </div>
              )}
            </ChartCard>
          </div>

          <ChartCard
            title="Orientation History"
            description="Real-time pitch and roll - interactive timeline"
          >
            {pitchHistory.length > 10 ? (
              <div className="w-full overflow-hidden space-y-2">
                <div className="relative flex items-center justify-center">
                  <LineChart
                    series={[
                      {
                        name: "Pitch",
                        data: pitchHistory,
                        color: "#ef4444",
                        strokeWidth: 2,
                      },
                      {
                        name: "Roll",
                        data: rollHistory,
                        color: "#3b82f6",
                        strokeWidth: 2,
                      },
                    ]}
                    width={750}
                    height={250}
                    xAxis={{ label: "Time" }}
                    yAxis={{ label: "Angle (°)" }}
                    showGrid
                    showAxes
                    showTooltip
                  />
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Pitch (red) and Roll (blue) angles over time
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                Collecting data... ({pitchHistory.length}/10 samples)
              </div>
            )}
          </ChartCard>

          {/* G-Force Tracking */}
          <ChartCard
            title="G-Force Impact Timeline"
            description="Landing impact force with safety thresholds - real-time anomaly detection"
          >
            {gForceHistory.length > 10 ? (
              <div className="w-full overflow-hidden space-y-3">
                <div className="relative flex items-center justify-center">
                  <LineChart
                    series={[
                      {
                        name: "G-Force",
                        data: gForceHistory,
                        color: "#f59e0b",
                        strokeWidth: 3,
                      },
                    ]}
                    width={750}
                    height={250}
                    xAxis={{ label: "Time" }}
                    yAxis={{ label: "G-Force" }}
                    showGrid
                    showAxes
                    showTooltip
                  />
                </div>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-400">&lt;3G: Safe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-400">3-6G: Hard Landing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-400">&gt;6G: Danger</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                Collecting data... ({gForceHistory.length}/10 samples)
              </div>
            )}
          </ChartCard>

          {/* Speed Tracking */}
          <ChartCard
            title="Speed Tracker"
            description="Estimated skateboard velocity over time"
          >
            {velocityHistory.length > 10 ? (
              <div className="w-full overflow-hidden space-y-2">
                <div className="relative flex items-center justify-center">
                  <LineChart
                    series={[
                      {
                        name: "Speed",
                        data: velocityHistory,
                        color: "#8b5cf6",
                        strokeWidth: 3,
                      },
                    ]}
                    width={750}
                    height={250}
                    xAxis={{ label: "Time" }}
                    yAxis={{ label: "Speed (km/h)" }}
                    showGrid
                    showAxes
                    showTooltip
                  />
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Velocity estimated from accelerometer data
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                Collecting data... ({velocityHistory.length}/10 samples)
              </div>
            )}
          </ChartCard>

          {/* Gyroscope Data */}
          <ChartCard
            title="Gyroscope Angular Velocity"
            description="Real-time rotation rates around X, Y, Z axes (degrees per second)"
          >
            {gyroXHistory.length > 10 ? (
              <div className="w-full overflow-hidden space-y-2">
                <div className="relative flex items-center justify-center">
                  <LineChart
                    series={[
                      {
                        name: "Gyro X (Roll Rate)",
                        data: gyroXHistory,
                        color: "#ef4444",
                        strokeWidth: 2,
                      },
                      {
                        name: "Gyro Y (Pitch Rate)",
                        data: gyroYHistory,
                        color: "#10b981",
                        strokeWidth: 2,
                      },
                      {
                        name: "Gyro Z (Yaw Rate)",
                        data: gyroZHistory,
                        color: "#3b82f6",
                        strokeWidth: 2,
                      },
                    ]}
                    width={750}
                    height={250}
                    xAxis={{ label: "Time" }}
                    yAxis={{ label: "Angular Velocity (°/s)" }}
                    showGrid
                    showAxes
                    showTooltip
                  />
                </div>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-400">X-axis (Roll)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-400">Y-axis (Pitch)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-400">Z-axis (Yaw)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                Collecting data... ({gyroXHistory.length}/10 samples)
              </div>
            )}
          </ChartCard>

          {/* Trick Timeline */}
          {trickHistory.length > 0 && (
            <ChartCard
              title="Trick Timeline"
              description="Interactive timeline of detected tricks with airtime and landing success"
            >
              <div className="w-full overflow-hidden">
                <GanttChart
                  tasks={trickHistory.map((trick) => ({
                    id: trick.id,
                    name: trick.name,
                    start: new Date(trick.timestamp),
                    end: new Date(trick.timestamp + trick.airtime),
                    status: trick.landed ? "completed" : "blocked",
                    description: `Airtime: ${
                      trick.airtime
                    }ms, Max G: ${trick.maxG.toFixed(1)}G`,
                    color: trick.landed ? "#10b981" : "#ef4444",
                  }))}
                  timezone="UTC"
                  timeWindowHours={2}
                  variant="compact"
                  rowHeight={40}
                />
              </div>
            </ChartCard>
          )}

          {/* Position Tracking */}
          {positionHistory.length > 3 && (
            <ChartCard
              title="Skatepark Position Tracker"
              description="Estimated position relative to start point based on accelerometer data"
            >
              <div className="flex items-center justify-center">
                <RadarChart
                  series={[
                    {
                      name: "Position History",
                      data: positionHistory.slice(0, -1).map((pos) => ({
                        angle: pos.angle,
                        distance: pos.distance,
                      })),
                      color: "#3b82f6",
                      showTrail: true,
                    },
                    {
                      name: "Current Position",
                      data:
                        positionHistory.length > 0
                          ? [
                              {
                                angle:
                                  positionHistory[positionHistory.length - 1]
                                    .angle,
                                distance:
                                  positionHistory[positionHistory.length - 1]
                                    .distance,
                                label: "Current",
                              },
                            ]
                          : [],
                      color: "#10b981",
                    },
                  ]}
                  rings={5}
                  sectors={12}
                  showSweep={false}
                  showGrid
                  showLabels
                  width={500}
                  height={500}
                />
              </div>
              <div className="text-xs text-gray-500 text-center mt-3">
                Green dot: Current position | Blue trail: Movement history
              </div>
            </ChartCard>
          )}

          {/* 3D Skatepark Visualization */}
          {demoMode && displayData && (
            <ChartCard
              title="3D Skatepark"
              description="Real-time 3D visualization of skateboard orientation and movement"
            >
              <div className="w-full h-[500px]">
                <Skatepark3D
                  pitch={displayData.pitch}
                  roll={displayData.roll}
                  heading={displayData.heading}
                  isAirborne={displayData.is_airborne || false}
                />
              </div>
            </ChartCard>
          )}
        </>
      ) : null}
    </div>
  );
}

const StatCard = memo(function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card className="border-zinc-800 hover:border-zinc-700 transition-colors p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
            <Icon className="h-3 w-3" />
            {title}
          </div>
          <div className="text-2xl font-semibold tabular-nums">{value}</div>
          <p className="text-xs text-zinc-600">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
});

const ChartCard = memo(function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-zinc-800 hover:border-zinc-700 transition-colors p-4">
      <div className="mb-3">
        <h3 className="text-xs font-medium text-zinc-400 mb-1">{title}</h3>
        <p className="text-xs text-zinc-600">{description}</p>
      </div>
      <div>{children}</div>
    </Card>
  );
});
