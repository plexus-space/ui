import { NextResponse } from "next/server";

/**
 * Simulation API for vibration sensor data
 * Used by quick-connect demo for testing the auto-dashboard integration
 */

// Track fault state across requests (in real app, use Redis or similar)
let hasFault = false;
let faultStartTime = 0;

// Generate realistic bearing vibration signal
function generateBearingVibration(
  samples: number,
  sampleRate: number,
  rpm: number,
  withFault: boolean
): number[] {
  const signal = new Array(samples).fill(0);
  const rotationFreq = rpm / 60; // Convert RPM to Hz
  const bpfo = rotationFreq * 3.57; // Ball Pass Frequency Outer race
  const bpfi = rotationFreq * 5.43; // Ball Pass Frequency Inner race

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;

    // Normal operation harmonics
    signal[i] += 0.3 * Math.sin(2 * Math.PI * rotationFreq * t);
    signal[i] += 0.15 * Math.sin(2 * Math.PI * rotationFreq * 2 * t);

    // Bearing fault signatures (if present)
    if (withFault) {
      const modulation =
        0.5 + 0.5 * Math.sin(2 * Math.PI * (rotationFreq / 2) * t);
      signal[i] += 0.5 * modulation * Math.sin(2 * Math.PI * bpfo * t);
      signal[i] += 0.4 * modulation * Math.sin(2 * Math.PI * bpfi * t);
    }

    // Noise
    signal[i] += (Math.random() - 0.5) * 0.15;

    // Occasional impulses for faults
    if (withFault && Math.random() < 0.001) {
      signal[i] += (Math.random() - 0.5) * 2;
    }
  }

  return signal;
}

function calculateRMS(signal: number[]): number {
  const sum = signal.reduce((acc, val) => acc + val * val, 0);
  return Math.sqrt(sum / signal.length);
}

export async function GET() {
  const rpm = 1800;
  const sampleRate = 2000;
  const windowSamples = sampleRate * 0.5; // 0.5 seconds of data

  // Randomly introduce faults (20% chance every 5 seconds)
  const now = Date.now();
  if (!hasFault && Math.random() < 0.2 && now - faultStartTime > 5000) {
    hasFault = true;
    faultStartTime = now;
  } else if (hasFault && now - faultStartTime > 10000) {
    // Clear fault after 10 seconds
    hasFault = false;
  }

  // Generate signal
  const signal = generateBearingVibration(
    windowSamples,
    sampleRate,
    rpm,
    hasFault
  );

  // Calculate RMS for scalar value
  const rms = calculateRMS(signal);

  // Return data in format expected by data connectors
  return NextResponse.json({
    timestamp: now,
    value: rms * 100, // Scale to mm/s
    signal: signal, // Full waveform for FFT analysis
    metadata: {
      rpm,
      sampleRate,
      hasFault,
      bpfo: (rpm / 60) * 3.57,
      bpfi: (rpm / 60) * 5.43,
    },
  });
}

// Toggle fault mode via POST
export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === "toggleFault") {
    hasFault = !hasFault;
    faultStartTime = Date.now();
    return NextResponse.json({ hasFault });
  }

  if (body.action === "setFault") {
    hasFault = body.value ?? false;
    faultStartTime = Date.now();
    return NextResponse.json({ hasFault });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
