"use client";

import { LineChart } from "@plexusui/components/charts/line-chart";
import { useState, useEffect, useRef } from "react";

/**
 * Example: Real-time Streaming Line Chart
 *
 * Demonstrates high-performance real-time data streaming with:
 * - 60fps updates with WebGL rendering
 * - Sliding window for continuous data streams
 * - Multiple sensor streams
 * - Play/pause controls
 * - Efficient updates without full re-renders
 */

interface DataPoint {
  x: number;
  y: number;
}

const MAX_POINTS = 500; // Sliding window size
const UPDATE_INTERVAL = 50; // Update every 50ms (20fps)

export function LineChartStreamingDemo() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [data, setData] = useState<{
    sensorA: DataPoint[];
    sensorB: DataPoint[];
    sensorC: DataPoint[];
  }>({
    sensorA: [],
    sensorB: [],
    sensorC: [],
  });

  const timeRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate new data points
  const generateDataPoint = (time: number, offset: number): DataPoint => {
    return {
      x: time,
      y: Math.sin(time / 10 + offset) * 50 + Math.random() * 10,
    };
  };

  // Start/stop streaming
  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = setInterval(() => {
        timeRef.current += 0.1;
        const time = timeRef.current;

        setData((prev) => ({
          sensorA: [
            ...prev.sensorA.slice(-MAX_POINTS + 1),
            generateDataPoint(time, 0),
          ],
          sensorB: [
            ...prev.sensorB.slice(-MAX_POINTS + 1),
            generateDataPoint(time, Math.PI / 2),
          ],
          sensorC: [
            ...prev.sensorC.slice(-MAX_POINTS + 1),
            generateDataPoint(time, Math.PI),
          ],
        }));
      }, UPDATE_INTERVAL);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming]);

  const series = [
    {
      name: "Sensor A",
      data: data.sensorA,
      color: "#06b6d4",
      strokeWidth: 2,
    },
    {
      name: "Sensor B",
      data: data.sensorB,
      color: "#f59e0b",
      strokeWidth: 2,
    },
    {
      name: "Sensor C",
      data: data.sensorC,
      color: "#ec4899",
      strokeWidth: 2,
    },
  ];

  const handleReset = () => {
    setIsStreaming(false);
    setData({
      sensorA: [],
      sensorB: [],
      sensorC: [],
    });
    timeRef.current = 0;
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          Real-time Streaming Data
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Live sensor data streaming at 20fps with WebGL rendering - smooth 60fps display
        </p>

        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isStreaming
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isStreaming ? "⏸ Pause Stream" : "▶ Start Stream"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-zinc-500 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
          >
            🔄 Reset
          </button>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Points: {data.sensorA.length}</span>
            <span>•</span>
            <span>
              Status:{" "}
              {isStreaming ? (
                <span className="text-green-600 font-semibold">● Streaming</span>
              ) : (
                <span className="text-zinc-500">● Paused</span>
              )}
            </span>
          </div>
        </div>

        <LineChart
          series={series}
          xAxis={{
            label: "Time (s)",
            domain: "auto",
            formatter: (value: number) => `${value.toFixed(1)}s`,
          }}
          yAxis={{
            label: "Value (mV)",
            domain: "auto",
            formatter: (value: number) => `${value.toFixed(1)}mV`,
          }}
          width={1000}
          height={500}
          showGrid
          showAxes
          showLegend
          showTooltip
          className="border border-zinc-300 dark:border-zinc-800 rounded-lg"
        />

        <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            ⚡ <strong>Performance:</strong> WebGL handles 20 updates/second with 500-point sliding window
          </p>
          <p>
            🎨 <strong>Tip:</strong> The chart automatically adjusts its domain as new data arrives
          </p>
          <p>
            📊 <strong>Sliding Window:</strong> Maintains last {MAX_POINTS} points for optimal performance
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">High-Frequency Single Stream</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Single sensor with higher update frequency
        </p>
        <HighFrequencyStream />
      </div>
    </div>
  );
}

// High-frequency single stream component
function HighFrequencyStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);
  const timeRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = setInterval(() => {
        timeRef.current += 0.05;
        const time = timeRef.current;

        setData((prev) => [
          ...prev.slice(-1000),
          {
            x: time,
            y: Math.sin(time * 2) * 30 + Math.cos(time * 5) * 20 + Math.random() * 5,
          },
        ]);
      }, 16); // ~60fps updates
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming]);

  const series = [
    {
      name: "High-Freq Signal",
      data,
      color: "#8b5cf6",
      strokeWidth: 2,
    },
  ];

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setIsStreaming(!isStreaming)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isStreaming
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isStreaming ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsStreaming(false);
            setData([]);
            timeRef.current = 0;
          }}
          className="px-4 py-2 bg-zinc-500 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
        >
          🔄 Reset
        </button>
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span>Points: {data.length}</span>
          <span>•</span>
          <span>Update Rate: ~60fps</span>
        </div>
      </div>

      <LineChart
        series={series}
        xAxis={{
          label: "Time",
          domain: "auto",
        }}
        yAxis={{
          label: "Amplitude",
          domain: "auto",
        }}
        width={1000}
        height={400}
        showGrid
        showAxes
        showLegend={false}
        className="border border-zinc-300 dark:border-zinc-800 rounded-lg"
      />
    </div>
  );
}

export default LineChartStreamingDemo;
