"use client";

import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { LineChart } from "@plexusui/components/charts/line-chart";
import { AreaChart } from "@plexusui/components/charts/area-chart";
import { AttitudeIndicator } from "@plexusui/components/charts/attitude-indicator";
import { GanttChart } from "@plexusui/components/charts/gantt";
import { RadarChart } from "@plexusui/components/charts/radar-chart";
import { HistogramChart } from "@plexusui/components/charts/histogram-chart";
import { downsampleLTTB } from "@plexusui/components/lib/data-utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, Wifi, WifiOff, Zap, Gauge } from "lucide-react";
import { useMultiColors } from "@/components/color-scheme-provider";
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

// Performance tuning
const MAX_HISTORY_POINTS = 150; // Keep 150 points (15 seconds at 10Hz)
const DISPLAY_UPDATE_INTERVAL = 50; // 20Hz for real-time numbers
const CHART_UPDATE_INTERVAL = 100; // 10Hz for charts - WebGPU handles this smoothly
const DOWNSAMPLE_TARGET = 75; // Downsample to 75 points for rendering

export function SkateboardTelemetry() {
  // Get dynamic colors from color scheme
  const colors = useMultiColors(5);

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
    currentSpeed: 8, // km/h - average cruising speed (~5 mph)
    heading: 0, // Current heading in degrees (0-360)
    lastTrickEndTime: 0, // Track when last trick ended for spacing
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
  const [minGForce, setMinGForce] = useState(Infinity);
  const [trickHistory, setTrickHistory] = useState<TrickEvent[]>([]);

  // Min/max tracking for stats
  const [minSpeed, setMinSpeed] = useState(Infinity);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [minTemp, setMinTemp] = useState(Infinity);
  const [maxTemp, setMaxTemp] = useState(0);

  // Total acceleration magnitude
  const [_totalAcceleration, setTotalAcceleration] = useState(0);

  // Position estimation from accelerometer
  const [_estimatedPosition, setEstimatedPosition] = useState({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const headingRef = useRef(0); // Track heading based on roll angle integration
  const lastTrickTimestampRef = useRef(0); // Track last trick for spacing
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

  // Performance: Downsample data for charts using LTTB (Largest Triangle Three Buckets)
  // This reduces points from 150 to 75 while preserving visual fidelity
  const downsampledPitch = useMemo(
    () =>
      pitchHistory.length > DOWNSAMPLE_TARGET
        ? downsampleLTTB(pitchHistory, DOWNSAMPLE_TARGET)
        : pitchHistory,
    [pitchHistory]
  );
  const downsampledRoll = useMemo(
    () =>
      rollHistory.length > DOWNSAMPLE_TARGET
        ? downsampleLTTB(rollHistory, DOWNSAMPLE_TARGET)
        : rollHistory,
    [rollHistory]
  );
  const downsampledGForce = useMemo(
    () =>
      gForceHistory.length > DOWNSAMPLE_TARGET
        ? downsampleLTTB(gForceHistory, DOWNSAMPLE_TARGET)
        : gForceHistory,
    [gForceHistory]
  );
  const downsampledSpeed = useMemo(
    () =>
      velocityHistory.length > DOWNSAMPLE_TARGET
        ? downsampleLTTB(velocityHistory, DOWNSAMPLE_TARGET)
        : velocityHistory,
    [velocityHistory]
  );
  const downsampledGyroX = useMemo(
    () =>
      gyroXHistory.length > DOWNSAMPLE_TARGET
        ? downsampleLTTB(gyroXHistory, DOWNSAMPLE_TARGET)
        : gyroXHistory,
    [gyroXHistory]
  );
  const downsampledGyroY = useMemo(
    () =>
      gyroYHistory.length > DOWNSAMPLE_TARGET
        ? downsampleLTTB(gyroYHistory, DOWNSAMPLE_TARGET)
        : gyroYHistory,
    [gyroYHistory]
  );
  const downsampledGyroZ = useMemo(
    () =>
      gyroZHistory.length > DOWNSAMPLE_TARGET
        ? downsampleLTTB(gyroZHistory, DOWNSAMPLE_TARGET)
        : gyroZHistory,
    [gyroZHistory]
  );

  // Helper function to calculate dynamic Y-axis domain with padding
  const calculateDomain = useCallback(
    (
      data: Array<{ x: number; y: number }>,
      minPadding = 0.1
    ): [number, number] => {
      if (data.length === 0) return [0, 1];

      const values = data.map((d) => d.y);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;

      // Add padding (default 10% on each side)
      const paddedMin = min - range * minPadding;
      const paddedMax = max + range * minPadding;

      // Ensure we don't have zero range
      if (paddedMin === paddedMax) {
        return [paddedMin - 1, paddedMax + 1];
      }

      return [paddedMin, paddedMax];
    },
    []
  );

  // Dynamic Y-axis domains based on actual data (using original downsampled data for Y values)
  const pitchRollDomain = useMemo((): [number, number] => {
    const allValues = [...downsampledPitch, ...downsampledRoll];
    if (allValues.length === 0) return [-50, 50];
    const [min, max] = calculateDomain(allValues, 0.15);
    return [Math.floor(min / 5) * 5, Math.ceil(max / 5) * 5]; // Round to nearest 5
  }, [downsampledPitch, downsampledRoll, calculateDomain]);

  const gForceDomain = useMemo((): [number, number] => {
    if (downsampledGForce.length === 0) return [0, 5];
    const [min, max] = calculateDomain(downsampledGForce, 0.2);
    // Dynamic scaling - only force zero if range is far from it
    const minBound = min < 0.5 ? 0 : Math.floor(min * 2) / 2;
    return [minBound, Math.ceil(max * 2) / 2]; // Round to nearest 0.5
  }, [downsampledGForce, calculateDomain]);

  const speedDomain = useMemo((): [number, number] => {
    if (downsampledSpeed.length === 0) return [0, 12];
    const [min, max] = calculateDomain(downsampledSpeed, 0.2);
    // Dynamic scaling - only force zero if close to it
    const minBound = min < 1 ? 0 : Math.floor(min);
    return [minBound, Math.min(Math.ceil(max), 16)]; // Cap at 16 km/h (10 mph)
  }, [downsampledSpeed, calculateDomain]);

  const gyroDomain = useMemo((): [number, number] => {
    const allGyroValues = [
      ...downsampledGyroX,
      ...downsampledGyroY,
      ...downsampledGyroZ,
    ];
    if (allGyroValues.length === 0) return [-400, 400];
    const [min, max] = calculateDomain(allGyroValues, 0.15);
    return [Math.floor(min / 50) * 50, Math.ceil(max / 50) * 50]; // Round to nearest 50
  }, [downsampledGyroX, downsampledGyroY, downsampledGyroZ, calculateDomain]);

  // Convert chart data to normalized X values (0-based) but keep timestamp for formatting
  const normalizeChartData = useCallback(
    (data: Array<{ x: number; y: number }>) => {
      if (data.length === 0) return { data: [], minTime: 0, maxTime: 1 };
      const minTime = data[0].x;
      const maxTime = data[data.length - 1].x;
      const normalized = data.map((point, index) => ({
        x: index, // Use index for X position (0, 1, 2, 3...)
        y: point.y,
        timestamp: point.x, // Keep original timestamp for formatting
      }));
      return { data: normalized, minTime, maxTime };
    },
    []
  );

  // Format X-axis tick to show time based on position
  const createTimeFormatter = useCallback(
    (minTime: number, maxTime: number, dataLength: number) => {
      return (value: number) => {
        // Convert index back to timestamp
        const ratio = dataLength > 1 ? value / (dataLength - 1) : 0;
        const timestamp = minTime + ratio * (maxTime - minTime);
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      };
    },
    []
  );

  // Normalize all chart data
  const normalizedPitch = useMemo(
    () => normalizeChartData(downsampledPitch),
    [downsampledPitch, normalizeChartData]
  );
  const normalizedRoll = useMemo(
    () => normalizeChartData(downsampledRoll),
    [downsampledRoll, normalizeChartData]
  );
  const normalizedGForce = useMemo(
    () => normalizeChartData(downsampledGForce),
    [downsampledGForce, normalizeChartData]
  );
  const normalizedSpeed = useMemo(
    () => normalizeChartData(downsampledSpeed),
    [downsampledSpeed, normalizeChartData]
  );
  const normalizedGyroX = useMemo(
    () => normalizeChartData(downsampledGyroX),
    [downsampledGyroX, normalizeChartData]
  );
  const normalizedGyroY = useMemo(
    () => normalizeChartData(downsampledGyroY),
    [downsampledGyroY, normalizeChartData]
  );
  const normalizedGyroZ = useMemo(
    () => normalizeChartData(downsampledGyroZ),
    [downsampledGyroZ, normalizeChartData]
  );

  // Memoize formatters to prevent chart flashing
  const pitchTimeFormatter = useMemo(
    () =>
      createTimeFormatter(
        normalizedPitch.minTime,
        normalizedPitch.maxTime,
        normalizedPitch.data.length
      ),
    [
      normalizedPitch.minTime,
      normalizedPitch.maxTime,
      normalizedPitch.data.length,
      createTimeFormatter,
    ]
  );
  const gForceTimeFormatter = useMemo(
    () =>
      createTimeFormatter(
        normalizedGForce.minTime,
        normalizedGForce.maxTime,
        normalizedGForce.data.length
      ),
    [
      normalizedGForce.minTime,
      normalizedGForce.maxTime,
      normalizedGForce.data.length,
      createTimeFormatter,
    ]
  );
  const speedTimeFormatter = useMemo(
    () =>
      createTimeFormatter(
        normalizedSpeed.minTime,
        normalizedSpeed.maxTime,
        normalizedSpeed.data.length
      ),
    [
      normalizedSpeed.minTime,
      normalizedSpeed.maxTime,
      normalizedSpeed.data.length,
      createTimeFormatter,
    ]
  );
  const gyroTimeFormatter = useMemo(
    () =>
      createTimeFormatter(
        normalizedGyroX.minTime,
        normalizedGyroX.maxTime,
        normalizedGyroX.data.length
      ),
    [
      normalizedGyroX.minTime,
      normalizedGyroX.maxTime,
      normalizedGyroX.data.length,
      createTimeFormatter,
    ]
  );

  // Memoize axis configurations to prevent chart flashing
  const pitchXAxis = useMemo(
    () => ({
      label: "Time",
      domain: [0, Math.max(normalizedPitch.data.length - 1, 1)] as [number, number],
      formatter: pitchTimeFormatter,
    }),
    [normalizedPitch.data.length, pitchTimeFormatter]
  );

  const pitchYAxis = useMemo(
    () => ({
      label: "Degrees",
      domain: pitchRollDomain,
    }),
    [pitchRollDomain]
  );

  const gForceXAxis = useMemo(
    () => ({
      label: "Time",
      domain: [0, Math.max(normalizedGForce.data.length - 1, 1)] as [number, number],
      formatter: gForceTimeFormatter,
    }),
    [normalizedGForce.data.length, gForceTimeFormatter]
  );

  const gForceYAxis = useMemo(
    () => ({
      label: "G-Force",
      domain: gForceDomain,
    }),
    [gForceDomain]
  );

  const speedXAxis = useMemo(
    () => ({
      label: "Time",
      domain: [0, Math.max(normalizedSpeed.data.length - 1, 1)] as [number, number],
      formatter: speedTimeFormatter,
    }),
    [normalizedSpeed.data.length, speedTimeFormatter]
  );

  const speedYAxis = useMemo(
    () => ({
      label: "km/h",
      domain: speedDomain,
    }),
    [speedDomain]
  );

  const gyroXAxis = useMemo(
    () => ({
      label: "Time",
      domain: [0, Math.max(normalizedGyroX.data.length - 1, 1)] as [number, number],
      formatter: gyroTimeFormatter,
    }),
    [normalizedGyroX.data.length, gyroTimeFormatter]
  );

  const gyroYAxis = useMemo(
    () => ({
      label: "°/s",
      domain: gyroDomain,
    }),
    [gyroDomain]
  );

  // Memoize series to prevent chart re-renders
  const pitchRollSeries = useMemo(
    () => [
      {
        name: "Pitch",
        data: normalizedPitch.data,
        color: colors[0],
        strokeWidth: 2,
      },
      {
        name: "Roll",
        data: normalizedRoll.data,
        color: colors[1],
        strokeWidth: 2,
      },
    ],
    [normalizedPitch.data, normalizedRoll.data, colors]
  );

  const gForceSeries = useMemo(
    () => [
      {
        name: "G-Force",
        data: normalizedGForce.data,
        color: colors[2],
        strokeWidth: 2,
      },
    ],
    [normalizedGForce.data, colors]
  );

  const speedSeries = useMemo(
    () => [
      {
        name: "Speed",
        data: normalizedSpeed.data,
        color: colors[3],
        strokeWidth: 2,
      },
    ],
    [normalizedSpeed.data, colors]
  );

  const gyroSeries = useMemo(
    () => [
      {
        name: "Roll",
        data: normalizedGyroX.data,
        color: colors[1],
        strokeWidth: 1.5,
      },
      {
        name: "Pitch",
        data: normalizedGyroY.data,
        color: colors[0],
        strokeWidth: 1.5,
      },
      {
        name: "Yaw",
        data: normalizedGyroZ.data,
        color: colors[4],
        strokeWidth: 1.5,
      },
    ],
    [normalizedGyroX.data, normalizedGyroY.data, normalizedGyroZ.data, colors]
  );

  // Batch update all chart histories for better performance
  const updateChartHistories = useCallback(
    (data: SensorData, timestamp: number, speed: number) => {
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
    },
    []
  );

  // Generate realistic demo sensor data
  const generateDemoData = useCallback((): SensorData => {
    const time = demoTimeRef.current;
    const state = demoStateRef.current;

    // Simulate various skateboarding scenarios with realistic probabilities
    const scenarios = [
      { type: "trick", duration: 1500, probability: 0.3 },
      { type: "sharp_turn", duration: 800, probability: 0.2 },
      { type: "ramp", duration: 2000, probability: 0.15 },
      { type: "manual", duration: 1200, probability: 0.1 },
    ];

    let pitch = 0,
      roll = 0,
      heading = 0;
    let gyro_x = 0,
      gyro_y = 0,
      gyro_z = 0;
    let accel_x = 0,
      accel_y = 0,
      accel_z = 9.81; // Default 1g downward (9.81 m/s²)
    let g_force = 1.0;
    let trick = undefined;
    let airtime = undefined;
    let is_airborne = false;

    // Determine current scenario - 0.3% chance per frame (~every 15-20 seconds)
    // Ensure minimum 5 seconds between tricks to prevent overlap on Gantt
    const MIN_TRICK_SPACING = 5000; // 5 seconds minimum between tricks
    const timeSinceLastTrick = time - state.lastTrickEndTime;

    if (
      !state.trickInProgress &&
      timeSinceLastTrick > MIN_TRICK_SPACING &&
      Math.random() > 0.997
    ) {
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      state.trickInProgress = true;
      state.trickStartTime = time;
      state.currentTrick = scenario.type;
    }

    if (state.trickInProgress) {
      const elapsed = time - state.trickStartTime;
      const progress = elapsed / 1500; // 1.5 second average

      switch (state.currentTrick) {
        case "trick": {
          // Realistic ollie or kickflip physics
          const trickType = Math.random() > 0.6 ? "Ollie" : "Kickflip";

          if (progress < 0.2) {
            // Crouch phase (200-300ms)
            pitch = -8 - Math.random() * 4; // -8 to -12 degrees
            roll = (Math.random() - 0.5) * 3; // Small variations
            accel_z = 10.5 + Math.random() * 1.0; // 1.07-1.17g compression
            g_force = 1.07 + Math.random() * 0.1;
            gyro_x = (Math.random() - 0.5) * 20;
            gyro_y = -30 - Math.random() * 20; // Pitching down
            gyro_z = (Math.random() - 0.5) * 15;
          } else if (progress < 0.5) {
            // Jump/Airborne phase (300-450ms)
            // Realistic ollie: 0.3-0.6 seconds airtime, 30-60cm height
            const airPhase = (progress - 0.2) / 0.3;
            pitch = -10 + airPhase * 25; // Nose lifts first, then levels

            // Kickflip adds rotation
            if (trickType === "Kickflip") {
              roll = Math.sin(airPhase * Math.PI * 1.2) * 360; // ~1 rotation
              gyro_x = Math.sin(airPhase * Math.PI * 1.2) * 720; // Peak ~720°/s
            } else {
              roll = (Math.random() - 0.5) * 8;
              gyro_x = (Math.random() - 0.5) * 50;
            }

            accel_x = (Math.random() - 0.5) * 0.5;
            accel_y = (Math.random() - 0.5) * 0.3;
            accel_z = 0.5 + Math.random() * 0.3; // Near zero-g, ~0.05-0.08g
            g_force = 0.05 + Math.random() * 0.03;

            gyro_y = 30 + (Math.random() - 0.5) * 40;
            gyro_z = (Math.random() - 0.5) * 25;

            is_airborne = true;
            airtime = elapsed - 300;
            trick = trickType;
            state.isAirborne = true;
          } else {
            // Landing phase (750ms+)
            pitch = 2 + (Math.random() - 0.5) * 4;
            roll = (Math.random() - 0.5) * 6;

            // Landing impact: 2-4g for good landing, up to 5g for sketchy
            const landingG = 2.5 + Math.random() * 1.5;
            accel_z = landingG * 9.81;
            g_force = landingG;

            gyro_x = (Math.random() - 0.5) * 100;
            gyro_y = -20 + (Math.random() - 0.5) * 40;
            gyro_z = (Math.random() - 0.5) * 50;

            if (state.isAirborne) {
              trick = trickType;
              airtime = 450 + Math.random() * 150; // 450-600ms realistic airtime
              state.isAirborne = false;
            }
          }
          if (progress > 1) {
            state.trickInProgress = false;
            state.lastTrickEndTime = time; // Record when trick ended
          }
          break;
        }

        case "sharp_turn": {
          // Carving turn physics
          const turnAngle = Math.sin(progress * Math.PI) * 45; // Max 45° lean
          roll = turnAngle;
          pitch = Math.abs(turnAngle) * 0.15; // Slight forward lean in turns

          // Centripetal force during turn
          g_force = 1 + (Math.abs(turnAngle) / 45) * 0.4; // Up to 1.4g in hard carve
          accel_z = g_force * 9.81;

          // Yaw rate during turn
          gyro_z = Math.sin(progress * Math.PI) * 180; // Peak 180°/s
          gyro_x = Math.cos(progress * Math.PI) * 40; // Roll rate
          gyro_y = (Math.random() - 0.5) * 20;

          if (progress > 1) {
            state.trickInProgress = false;
            state.lastTrickEndTime = time;
          }
          break;
        }

        case "ramp": {
          // Quarter pipe or ramp physics
          if (progress < 0.4) {
            // Going up the ramp
            const rampAngle = (progress / 0.4) * 35; // Up to 35° ramp
            pitch = rampAngle;
            roll = (Math.random() - 0.5) * 4;

            // Deceleration going up
            accel_y = -2 + (Math.random() - 0.5) * 0.5; // Negative accel
            g_force = 1.0 + (rampAngle / 35) * 0.3;
            accel_z = g_force * 9.81;

            gyro_y = rampAngle * 2; // Pitch rate
            gyro_x = (Math.random() - 0.5) * 20;
            gyro_z = (Math.random() - 0.5) * 15;
          } else if (progress < 0.6) {
            // At the peak / transition
            pitch = 35 - ((progress - 0.4) / 0.2) * 70; // Peak then down
            roll = (Math.random() - 0.5) * 8;

            g_force = 0.8 + Math.random() * 0.3; // Lighter at peak
            accel_z = g_force * 9.81;

            gyro_y = -100 + (Math.random() - 0.5) * 40;
            gyro_x = (Math.random() - 0.5) * 30;
            gyro_z = (Math.random() - 0.5) * 25;
          } else {
            // Coming back down
            const downPhase = (progress - 0.6) / 0.4;
            pitch = -35 + downPhase * 35;
            roll = (Math.random() - 0.5) * 5;

            // Acceleration coming down
            accel_y = 2 + (Math.random() - 0.5) * 0.5;
            g_force = 1.2 + downPhase * 0.5;
            accel_z = g_force * 9.81;

            gyro_y = 50 + (Math.random() - 0.5) * 30;
            gyro_x = (Math.random() - 0.5) * 25;
            gyro_z = (Math.random() - 0.5) * 20;
          }
          if (progress > 1) {
            state.trickInProgress = false;
            state.lastTrickEndTime = time;
          }
          break;
        }

        case "manual": {
          // Manual (wheelie) balance
          const manualPitch = 15 + Math.sin(progress * Math.PI * 3) * 8; // 7-23° wobble
          pitch = manualPitch;
          roll = Math.sin(progress * Math.PI * 4) * 4; // Balance corrections

          g_force = 0.95 + Math.random() * 0.1; // Slightly lighter on one set of wheels
          accel_z = g_force * 9.81;

          gyro_y = Math.sin(progress * Math.PI * 3) * 60; // Pitch corrections
          gyro_x = Math.sin(progress * Math.PI * 4) * 40; // Roll corrections
          gyro_z = (Math.random() - 0.5) * 15;

          if (progress > 1) {
            state.trickInProgress = false;
            state.lastTrickEndTime = time;
          }
          break;
        }

        default:
          if (progress > 1) {
            state.trickInProgress = false;
            state.lastTrickEndTime = time;
          }
      }
    } else {
      // Normal cruising - realistic flat ground riding with varied carving
      // Pitch: slight forward lean, 2-5 degrees with small bumps
      pitch = 3 + Math.sin(time / 2000) * 2 + (Math.random() - 0.5) * 1;

      // Roll: carving side to side with varied patterns for interesting movement
      // Combine multiple sine waves for natural carving patterns
      roll =
        Math.sin(time / 3000) * 8 + // Slow carves (±8°)
        Math.sin(time / 1200) * 4 + // Faster S-curves (±4°)
        (Math.random() - 0.5) * 2; // Small corrections (±2°)

      // Heading: slow gradual changes, not constantly spinning
      heading = (Math.sin(time / 8000) * 30 + 180) % 360; // Gentle curves

      // Gyro rates during cruising (varied from carving)
      gyro_x = Math.sin(time / 2500) * 25 + (Math.random() - 0.5) * 10; // ±25°/s
      gyro_y = Math.sin(time / 2000) * 12 + (Math.random() - 0.5) * 6; // ±12°/s
      gyro_z = Math.sin(time / 3000) * 15 + (Math.random() - 0.5) * 8; // ±15°/s

      // Acceleration: mostly gravity + small vibrations
      accel_x = Math.sin(time / 1500) * 0.5 + (Math.random() - 0.5) * 0.2; // ±0.5 m/s²
      accel_y = 0.2 + (Math.random() - 0.5) * 0.3; // Forward accel
      accel_z = 9.81 + (Math.random() - 0.5) * 0.5; // 1g ± vibration

      // G-force: very close to 1g on flat ground
      g_force =
        1.0 + Math.sin(time / 1800) * 0.05 + (Math.random() - 0.5) * 0.03;
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
      temperature: 28 + Math.sin(time / 30000) * 3 + Math.random() * 1, // 26-32°C sensor warming
      g_force,
      trick,
      airtime,
      is_airborne,
      sensor_type: "MPU6050 (Demo Mode)",
      anomalies: g_force > 4.5 ? ["High G-Force Detected"] : undefined,
    };
  }, []);

  // Start demo mode
  useEffect(() => {
    if (demoMode) {
      setIsConnected(true);
      setConnectionError(null);

      // Reset position tracking when demo mode starts
      setEstimatedPosition({ x: 0, y: 0 });
      setPositionHistory([]);
      demoStateRef.current.heading = 0;
      demoStateRef.current.lastTrickEndTime = 0; // Reset trick spacing
      velocityRef.current = { x: 0, y: 0 };
      lastPositionUpdateRef.current = Date.now();
      lastTrickTimestampRef.current = 0; // Reset logged trick spacing

      // Reset min/max tracking
      setMinGForce(Infinity);
      setMaxGForce(0);
      setMinSpeed(Infinity);
      setMaxSpeed(0);
      setMinTemp(Infinity);
      setMaxTemp(0);

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

        // Realistic speed simulation based on scenario (max ~10 mph / 16 km/h)
        const state = demoStateRef.current;
        let targetSpeed = 8; // Default cruising speed in km/h (~5 mph)

        if (state.trickInProgress) {
          const elapsed = now - state.trickStartTime;
          const progress = elapsed / 1500;

          switch (state.currentTrick) {
            case "trick":
              // Speed drops slightly during trick, picks back up after landing
              if (progress < 0.5) {
                targetSpeed = 7 - progress * 4; // 7 -> 5 km/h during jump
              } else {
                targetSpeed = 5 + (progress - 0.5) * 6; // 5 -> 8 km/h after landing
              }
              break;
            case "sharp_turn":
              // Slow down in turn
              targetSpeed = 8 - Math.abs(Math.sin(progress * Math.PI)) * 3; // 5-8 km/h
              break;
            case "ramp":
              // Speed varies with ramp
              if (progress < 0.4) {
                targetSpeed = 10 - progress * 15; // Decelerate going up
              } else if (progress < 0.6) {
                targetSpeed = 5; // Slow at peak
              } else {
                targetSpeed = 5 + (progress - 0.6) * 12.5; // Accelerate down
              }
              break;
            case "manual":
              targetSpeed = 6 + Math.sin(progress * Math.PI) * 2; // 4-8 km/h, slowing
              break;
            default:
              targetSpeed = 8;
          }
        } else {
          // Gentle speed variations while cruising
          targetSpeed = 8 + Math.sin(now / 5000) * 2; // 6-10 km/h (~4-6 mph)
        }

        // Smooth speed transitions
        state.currentSpeed = state.currentSpeed * 0.9 + targetSpeed * 0.1;
        const finalSpeed = Math.max(0, state.currentSpeed);
        setCurrentSpeed(finalSpeed);

        // Track min/max speed
        setMinSpeed((prev) => Math.min(prev, finalSpeed));
        setMaxSpeed((prev) => Math.max(prev, finalSpeed));

        // Update heading based on roll angle (turning physics)
        // Roll angle causes turning: ~30° roll = ~120°/s turn rate (more responsive)
        const turnRate = (data.roll / 30) * 120; // degrees per second
        state.heading = (state.heading + turnRate * 0.05) % 360; // 0.05s update interval
        if (state.heading < 0) state.heading += 360;

        // Throttle chart updates
        if (now - lastChartUpdateRef.current > CHART_UPDATE_INTERVAL) {
          const timestamp = now;
          updateChartHistories(data, timestamp, state.currentSpeed);
          lastChartUpdateRef.current = now;
        }

        // Physics-based position tracking using speed and heading from roll
        const POSITION_UPDATE_INTERVAL = 50; // Update more frequently (20Hz)
        if (now - lastPositionUpdateRef.current > POSITION_UPDATE_INTERVAL) {
          const dt = (now - lastPositionUpdateRef.current) / 1000;
          const headingRad = (state.heading * Math.PI) / 180;

          // Convert speed (km/h) to m/s
          const speedMs = state.currentSpeed / 3.6;

          // Calculate displacement in world coordinates
          const deltaX = speedMs * Math.sin(headingRad) * dt;
          const deltaY = speedMs * Math.cos(headingRad) * dt;

          setEstimatedPosition((prev) => {
            // Apply position damping to prevent infinite drift (decay toward center)
            const dampingFactor = 0.98; // 2% decay per update
            const dampedX = prev.x * dampingFactor;
            const dampedY = prev.y * dampingFactor;

            const newX = dampedX + deltaX;
            const newY = dampedY + deltaY;

            // Calculate polar coordinates for radar (distance from center, angle)
            const distance = Math.sqrt(newX ** 2 + newY ** 2);
            const angle =
              ((Math.atan2(newX, newY) * 180) / Math.PI + 360) % 360;

            setPositionHistory((prevHistory) => {
              const updated = [
                ...prevHistory,
                {
                  angle,
                  distance: Math.min(distance / 3, 1), // Normalize to 0-1 range, 3m max (more visible)
                  timestamp: now,
                },
              ];
              return updated.slice(-50); // Keep more history for longer trail
            });

            return { x: newX, y: newY };
          });

          lastPositionUpdateRef.current = now;
        }

        // Track tricks with minimum spacing
        const MIN_TRICK_SPACING = 3000; // 3 seconds minimum between logged tricks
        if (
          data.trick &&
          now - lastTrickTimestampRef.current > MIN_TRICK_SPACING
        ) {
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

          lastTrickTimestampRef.current = now; // Update last trick time
        }

        // Track min/max G-Force
        if (data.g_force > maxGForce) {
          setMaxGForce(data.g_force);
        }
        if (data.g_force < minGForce) {
          setMinGForce(data.g_force);
        }

        // Track min/max temperature
        if (data.temperature < minTemp) {
          setMinTemp(data.temperature);
        }
        if (data.temperature > maxTemp) {
          setMaxTemp(data.temperature);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Reset position tracking when connecting to live data
        setEstimatedPosition({ x: 0, y: 0 });
        setPositionHistory([]);
        headingRef.current = 0;
        velocityRef.current = { x: 0, y: 0 };
        lastPositionUpdateRef.current = Date.now();
        lastTrickTimestampRef.current = 0; // Reset trick spacing

        // Reset min/max tracking
        setMinGForce(Infinity);
        setMaxGForce(0);
        setMinSpeed(Infinity);
        setMaxSpeed(0);
        setMinTemp(Infinity);
        setMaxTemp(0);

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

            // Estimate speed from forward acceleration (realistic for < 10 mph)
            // Average skateboard cruising: 6-10 km/h (~4-6 mph)
            const forwardAccel = data.accel_y; // m/s²
            const estimatedSpeed = 8 + forwardAccel * 2; // Centered at 8 km/h
            const clampedSpeed = Math.max(0, Math.min(16, estimatedSpeed)); // 0-16 km/h (10 mph max)
            setCurrentSpeed(clampedSpeed);

            // Track min/max speed
            setMinSpeed((prev) => Math.min(prev, clampedSpeed));
            setMaxSpeed((prev) => Math.max(prev, clampedSpeed));

            updateChartHistories(data, timestamp, clampedSpeed);
            lastChartUpdateRef.current = now;
          }

          // Physics-based position tracking using speed and heading from roll
          const POSITION_UPDATE_INTERVAL = 50; // Update more frequently (20Hz)
          if (now - lastPositionUpdateRef.current > POSITION_UPDATE_INTERVAL) {
            const dt = (now - lastPositionUpdateRef.current) / 1000; // Convert to seconds

            // Update heading based on roll angle (turning physics)
            // Roll angle causes turning: ~30° roll = ~120°/s turn rate (more responsive)
            const turnRate = (data.roll / 30) * 120; // degrees per second
            headingRef.current = (headingRef.current + turnRate * dt) % 360;
            if (headingRef.current < 0) headingRef.current += 360;

            const headingRad = (headingRef.current * Math.PI) / 180;

            // Convert speed (km/h) to m/s
            const speedMs = currentSpeed / 3.6;

            // Calculate displacement in world coordinates
            const deltaX = speedMs * Math.sin(headingRad) * dt;
            const deltaY = speedMs * Math.cos(headingRad) * dt;

            // Update position
            setEstimatedPosition((prev) => {
              // Apply position damping to prevent infinite drift (decay toward center)
              const dampingFactor = 0.98; // 2% decay per update
              const dampedX = prev.x * dampingFactor;
              const dampedY = prev.y * dampingFactor;

              const newX = dampedX + deltaX;
              const newY = dampedY + deltaY;

              // Calculate polar coordinates for radar (distance from center, angle)
              const distance = Math.sqrt(newX ** 2 + newY ** 2);
              const angle =
                ((Math.atan2(newX, newY) * 180) / Math.PI + 360) % 360;

              // Update position history
              setPositionHistory((prevHistory) => {
                const updated = [
                  ...prevHistory,
                  {
                    angle,
                    distance: Math.min(distance / 3, 1), // Normalize to 0-1 range, 3m max (more visible)
                    timestamp: now,
                  },
                ];
                return updated.slice(-50); // Keep more history for longer trail
              });

              return { x: newX, y: newY };
            });

            lastPositionUpdateRef.current = now;
          }

          // Track tricks in history with minimum spacing
          const MIN_TRICK_SPACING = 3000; // 3 seconds minimum between logged tricks
          if (
            data.trick &&
            now - lastTrickTimestampRef.current > MIN_TRICK_SPACING
          ) {
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

            lastTrickTimestampRef.current = now; // Update last trick time
          }

          // Track min/max G-Force
          if (data.g_force > maxGForce) {
            setMaxGForce(data.g_force);
          }
          if (data.g_force < minGForce) {
            setMinGForce(data.g_force);
          }

          // Track min/max temperature
          if (data.temperature < minTemp) {
            setMinTemp(data.temperature);
          }
          if (data.temperature > maxTemp) {
            setMaxTemp(data.temperature);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piHost, piPort, socket, maxGForce, updateChartHistories]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Memoize connection handlers to prevent unnecessary re-creations
  const handleDemoModeChange = useCallback(
    (checked: boolean) => {
      setDemoMode(checked);
      if (socket && checked) {
        disconnect();
      }
    },
    [socket, disconnect]
  );

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
                onCheckedChange={handleDemoModeChange}
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
              title="G-Force"
              value={`${(displayData?.g_force ?? 0).toFixed(1)}G`}
              subtitle={`Tricks: ${trickCount}`}
              min={
                minGForce !== Infinity ? `${minGForce.toFixed(1)}G` : undefined
              }
              max={`${maxGForce.toFixed(1)}G`}
            />
            <StatCard
              icon={Gauge}
              title="Speed"
              value={`${currentSpeed.toFixed(1)} km/h`}
              subtitle={`Current velocity`}
              min={
                minSpeed !== Infinity
                  ? `${minSpeed.toFixed(1)} km/h`
                  : undefined
              }
              max={`${maxSpeed.toFixed(1)} km/h`}
            />
            <StatCard
              icon={Activity}
              title="Temperature"
              value={`${(displayData?.temperature ?? 0).toFixed(1)}°C`}
              subtitle={`MPU6050 sensor`}
              min={minTemp !== Infinity ? `${minTemp.toFixed(1)}°C` : undefined}
              max={maxTemp > 0 ? `${maxTemp.toFixed(1)}°C` : undefined}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
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
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  Waiting for data...
                </div>
              )}
            </ChartCard>

            <ChartCard title="Orientation" description="Pitch & roll (degrees)">
              {pitchHistory.length > 10 ? (
                <div className="w-full overflow-hidden">
                  <LineChart.Root
                    series={pitchRollSeries}
                    width={360}
                    height={200}
                    xAxis={pitchXAxis}
                    yAxis={pitchYAxis}
                    preferWebGPU={true}
                  >
                    <LineChart.Canvas showGrid={true} />
                    <LineChart.Axes />
                    <LineChart.Tooltip />
                  </LineChart.Root>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500 text-xs">
                  Collecting data... ({pitchHistory.length}/10)
                </div>
              )}
            </ChartCard>

            <ChartCard title="G-Force" description="Impact force (G)">
              {gForceHistory.length > 10 ? (
                <div className="w-full overflow-hidden" key="gforce-container">
                  <AreaChart.Root
                    key="gforce-chart"
                    series={gForceSeries}
                    width={360}
                    height={200}
                    xAxis={gForceXAxis}
                    yAxis={gForceYAxis}
                    preferWebGPU={true}
                  >
                    <AreaChart.Canvas key="gforce-canvas" showGrid={true} />
                    <AreaChart.Axes key="gforce-axes" />
                    <AreaChart.Tooltip key="gforce-tooltip" />
                  </AreaChart.Root>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500 text-xs">
                  Collecting data... ({gForceHistory.length}/10)
                </div>
              )}
            </ChartCard>

            <ChartCard title="Speed" description="Velocity (km/h)">
              {velocityHistory.length > 10 ? (
                <div className="w-full overflow-hidden" key="speed-container">
                  <AreaChart.Root
                    key="speed-chart"
                    series={speedSeries}
                    width={360}
                    height={200}
                    xAxis={speedXAxis}
                    yAxis={speedYAxis}
                    preferWebGPU={true}
                  >
                    <AreaChart.Canvas key="speed-canvas" showGrid={true} />
                    <AreaChart.Axes key="speed-axes" />
                    <AreaChart.Tooltip key="speed-tooltip" />
                  </AreaChart.Root>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500 text-xs">
                  Collecting data... ({velocityHistory.length}/10)
                </div>
              )}
            </ChartCard>

            <ChartCard
              title="Rotation Rate"
              description="Angular velocity (°/s)"
            >
              {gyroXHistory.length > 10 ? (
                <div className="w-full overflow-hidden">
                  <LineChart.Root
                    series={gyroSeries}
                    width={360}
                    height={200}
                    xAxis={gyroXAxis}
                    yAxis={gyroYAxis}
                    preferWebGPU={true}
                  >
                    <LineChart.Canvas showGrid={true} />
                    <LineChart.Axes />
                    <LineChart.Tooltip />
                  </LineChart.Root>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500 text-xs">
                  Collecting data... ({gyroXHistory.length}/10)
                </div>
              )}
            </ChartCard>

            {/* New: G-Force Distribution Histogram */}
            <ChartCard
              title="Impact Distribution"
              description="G-Force histogram"
            >
              {gForceHistory.length > 20 ? (
                <div className="w-full overflow-hidden">
                  <HistogramChart
                    data={gForceHistory.map((d) => d.y)}
                    binCount={15}
                    width={360}
                    height={200}
                    xAxis={{ label: "G-Force", domain: gForceDomain }}
                    yAxis={{ label: "Count" }}
                    color={colors[2]}
                    showGrid
                    showAxes
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500 text-xs">
                  Collecting data... ({gForceHistory.length}/20)
                </div>
              )}
            </ChartCard>
          </div>
          <ChartCard
            title="Trick Timeline"
            description="Each row shows all attempts of a trick • Green=landed, Orange=sketchy"
          >
            <div className="w-full overflow-hidden">
              {trickHistory.length > 0 ? (
                <GanttChart
                  tasks={trickHistory.map((trick) => ({
                    id: trick.id, // Unique ID for each instance
                    name: trick.name, // Same name groups tricks on same row
                    start: new Date(trick.timestamp),
                    end: new Date(trick.timestamp + trick.airtime),
                    status: trick.landed ? "completed" : "in-progress",
                    description: `${trick.airtime.toFixed(
                      0
                    )}ms airtime • ${trick.maxG.toFixed(1)}G impact`,
                    color: trick.landed ? colors[4] : colors[2],
                  }))}
                  timezone="UTC"
                  timeWindowHours={2}
                  variant="compact"
                  rowHeight={36}
                />
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500 text-xs">
                  Waiting for tricks... ({trickCount} total)
                </div>
              )}
            </div>
          </ChartCard>

          <div className="grid gap-3 md:grid-cols-2">
            {/* Position Tracking */}
            {positionHistory.length > 5 && (
              <ChartCard
                title="Movement Path"
                description="Live position tracking • Roll = steering • Speed = distance"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <RadarChart
                    series={[
                      {
                        name: "Movement Path",
                        data: positionHistory.map((pos) => ({
                          angle: pos.angle,
                          distance: pos.distance,
                        })),
                        color: colors[1],
                        showTrail: true,
                      },
                      {
                        name: "Current",
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
                                  label: "●",
                                },
                              ]
                            : [],
                        color: colors[4],
                      },
                    ]}
                    rings={5}
                    sectors={12}
                    showSweep={false}
                    showGrid
                    showLabels
                    width={360}
                    height={360}
                  />
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-8 h-0.5"
                        style={{
                          background: `linear-gradient(to right, transparent, ${colors[1]}, ${colors[1]})`
                        }}
                      ></div>
                      <span>Path</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors[4] }}
                      ></div>
                      <span>Position</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-600 text-center">
                    Carve left/right to steer • Speed forward to explore
                  </div>
                </div>
              </ChartCard>
            )}
          </div>
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
  min,
  max,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subtitle: string;
  min?: string;
  max?: string;
}) {
  return (
    <Card className="dark:bg-[#09090b] bg-white transition-colors p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1 flex-1">
          <div className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
            <Icon className="h-3 w-3" />
            {title}
          </div>
          <div className="text-2xl font-semibold tabular-nums">{value}</div>
          <p className="text-xs text-zinc-600">{subtitle}</p>
        </div>
        {(min || max) && (
          <div className="flex flex-col items-end gap-0.5 text-xs text-zinc-500 tabular-nums ml-2">
            {max && (
              <div className="flex items-center gap-1">
                <span className="text-[10px]">↑</span>
                <span>{max}</span>
              </div>
            )}
            {min && (
              <div className="flex items-center gap-1">
                <span className="text-[10px]">↓</span>
                <span>{min}</span>
              </div>
            )}
          </div>
        )}
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
    <Card className=" dark:bg-[#09090b] bg-white transition-colors p-4">
      <div className="mb-3">
        <h3 className="text-xs font-medium text-zinc-400 mb-1">{title}</h3>
        <p className="text-xs text-zinc-600">{description}</p>
      </div>
      <div>{children}</div>
    </Card>
  );
});
