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
import { Activity, Wifi, WifiOff, Zap } from "lucide-react";

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
  const [piHost, setPiHost] = useState("localhost");
  const [piPort, setPiPort] = useState("8080");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

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

  // Display smoothing - update display less frequently than data arrival
  const [displayData, setDisplayData] = useState<SensorData | null>(null);
  const lastDisplayUpdateRef = useRef(0);
  const lastChartUpdateRef = useRef(0);
  const dataBufferRef = useRef<SensorData | null>(null);

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

      {!isConnected ? (
        <div className="p-12  rounded-xl border text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-base font-medium mb-2">
            Connect Skateboard Telemetry
          </h3>
          <p className="text-sm text-zinc-500 mb-4 max-w-lg mx-auto leading-relaxed">
            Enter your Raspberry Pi hostname or IP address and connect to see
            real-time skateboard sensor data
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
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <StatCard
              icon={Zap}
              title="Max G-Force"
              value={`${maxGForce.toFixed(1)}G`}
              subtitle={`Tricks detected: ${trickCount}`}
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
        </>
      )}
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
