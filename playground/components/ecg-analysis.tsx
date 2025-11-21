"use client";

import { useState, useEffect, useRef } from "react";
import { LineChart } from "@plexusui/components/charts/line-chart";

// Generate realistic ECG waveform with PQRST complex
function generateECGPoint(position: number): number {
  const beatCycle = position % 100;
  let y = 0;

  // P wave (atrial depolarization)
  if (beatCycle >= 5 && beatCycle < 15) {
    y = Math.sin((beatCycle - 5) * 0.628) * 0.3;
  }
  // PR segment
  else if (beatCycle >= 15 && beatCycle < 25) {
    y = 0;
  }
  // Q wave (small downward)
  else if (beatCycle >= 25 && beatCycle < 28) {
    y = -(beatCycle - 25) * 0.3;
  }
  // R wave (sharp upward spike)
  else if (beatCycle >= 28 && beatCycle < 32) {
    if (beatCycle < 30) {
      y = -0.9 + (beatCycle - 28) * 3.5;
    } else {
      y = 6.1 - (beatCycle - 30) * 3.5;
    }
  }
  // S wave (small downward)
  else if (beatCycle >= 32 && beatCycle < 35) {
    y = -(35 - beatCycle) * 0.6;
  }
  // ST segment
  else if (beatCycle >= 35 && beatCycle < 45) {
    y = 0;
  }
  // T wave (ventricular repolarization)
  else if (beatCycle >= 45 && beatCycle < 65) {
    y = Math.sin((beatCycle - 45) * 0.314) * 0.5;
  }
  // Baseline
  else {
    y = 0;
  }

  return y + (Math.random() - 0.5) * 0.15;
}

export function ECGAnalysis() {
  const [ecgData, setEcgData] = useState(() => [
    {
      name: "ECG Lead II",
      color: "#10b981",
      data: Array.from({ length: 150 }, (_, i) => ({
        x: i,
        y: generateECGPoint(i),
      })),
    },
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // Initialize audio context for ECG frequency analysis simulation
  useEffect(() => {
    // Create audio context for frequency analysis
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Update ECG waveform
  useEffect(() => {
    const interval = setInterval(() => {
      setEcgData((prev) =>
        prev.map((series) => {
          const newData = [...series.data];
          newData.shift();
          const lastX = newData[newData.length - 1].x;
          newData.push({
            x: lastX + 1,
            y: generateECGPoint(lastX + 1),
          });
          return { ...series, data: newData };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-gray-400 mb-2">
          Real-time Cardiac Rhythm
        </div>
        <LineChart
          series={ecgData}
          width={550}
          height={180}
          showGrid
          showAxes
          yAxis={{ domain: [-3, 7], label: "mV" }}
        />
      </div>
    </div>
  );
}
