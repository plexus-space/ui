"use client";

/**
 * WebGPU 2D Shape Renderer - Aerospace HUD Examples
 * Advanced flight displays and tactical interfaces
 */

import { useRef, useState, useEffect } from "react";
import { ComponentPreview } from "@/components/component-preview";
import {
  WebGPU2DRenderer,
  ShapeType,
  createLine,
  createCircle,
  createRectangle,
  createRoundedRectangle,
  createArc,
  createPolygon,
  type Shape,
} from "@plexusui/components/primitives/webgpu/shape-2d-renderer";

export const Shape2DExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Primary Flight Display (PFD)"
        description="Full artificial horizon with pitch ladder, bank angle indicator, and flight path vector"
        preview={<PrimaryFlightDisplayDemo />}
        code={`// Artificial horizon with pitch ladder
const horizon = generatePitchLadder(400, 200, pitch);
const bankArc = createArc(400, 80, 60, ...);
const flightPathVector = createFPV(400, 200);`}
      />

      <ComponentPreview
        title="Tactical Targeting HUD"
        description="Advanced targeting reticle with range rings and lead indicator"
        preview={<TacticalTargetingDemo />}
        code={`// Multi-ring targeting system
const reticle = [
  ...createTargetingReticle(400, 200),
  ...createRangeRings(400, 200, [50, 100, 150]),
  createLeadIndicator(targetPos),
];`}
      />

      <ComponentPreview
        title="Instrument Cluster"
        description="Altimeter, airspeed, and heading indicators with animated needles"
        preview={<InstrumentClusterDemo />}
        code={`// Triple gauge cluster
const gauges = [
  ...createAltimeter(200, 200, altitude),
  ...createAirspeedIndicator(400, 200, speed),
  ...createHeadingIndicator(600, 200, heading),
];`}
      />
    </div>
  );
};

// ============================================================================
// Demo Components
// ============================================================================

function PrimaryFlightDisplayDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      setCanvas(canvasRef.current);
    }
  }, [canvas]);

  // Animate pitch and roll
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.016);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const centerX = 400;
  const centerY = 200;

  const green: [number, number, number, number] = [0, 1, 0, 1];
  const greenDim: [number, number, number, number] = [0, 1, 0, 0.6];
  const greenGlow: [number, number, number, number] = [0, 1, 0, 0.3];
  const white: [number, number, number, number] = [1, 1, 1, 1];
  const whiteDim: [number, number, number, number] = [1, 1, 1, 0.7];

  // Animated pitch (slowly oscillate)
  const pitch = Math.sin(time * 0.5) * 15; // -15 to +15 degrees
  const roll = Math.sin(time * 0.3) * 20; // -20 to +20 degrees
  const rollRad = (roll * Math.PI) / 180;

  const shapes: Shape[] = [
    // ===== ARTIFICIAL HORIZON =====
    // Horizon line (animated with pitch)
    ...(() => {
      const horizonY = centerY - pitch * 3; // 3 pixels per degree
      return [
        // Main horizon line
        createLine(centerX - 250, horizonY, centerX + 250, horizonY, 2, green),
        // Tick marks on horizon
        ...Array.from({ length: 11 }, (_, i) => {
          const x = centerX - 250 + i * 50;
          return createLine(x, horizonY - 8, x, horizonY + 8, 2, green);
        }),
      ];
    })(),

    // ===== PITCH LADDER =====
    // Pitch ladder lines every 10 degrees
    ...Array.from({ length: 7 }, (_, i) => {
      const pitchAngle = (i - 3) * 10; // -30, -20, -10, 0, 10, 20, 30
      if (pitchAngle === 0) return []; // Skip 0 (horizon line)

      const y = centerY - (pitchAngle - pitch) * 3;
      const lineWidth = pitchAngle > 0 ? 80 : 100;

      return [
        // Pitch line
        createLine(
          centerX - lineWidth,
          y,
          centerX + lineWidth,
          y,
          pitchAngle > 0 ? 2 : 1.5,
          pitchAngle > 0 ? greenDim : whiteDim
        ),
        // End caps for negative pitch
        ...(pitchAngle < 0
          ? [
              createLine(centerX - lineWidth, y - 10, centerX - lineWidth, y, 1.5, whiteDim),
              createLine(centerX + lineWidth, y - 10, centerX + lineWidth, y, 1.5, whiteDim),
            ]
          : []),
      ];
    }).flat(),

    // ===== BANK ANGLE INDICATOR =====
    // Bank angle arc at top
    createArc(centerX, centerY, 140, -Math.PI * 0.7, -Math.PI * 0.3, 2, white),
    // Bank angle tick marks
    ...Array.from({ length: 7 }, (_, i) => {
      const angles = [-60, -45, -30, 0, 30, 45, 60];
      const angle = angles[i];
      const angleRad = (-Math.PI / 2 + (angle * Math.PI) / 180);
      const r1 = 135;
      const r2 = i === 3 ? 125 : 130; // Longer tick at 0
      const x1 = centerX + Math.cos(angleRad) * r1;
      const y1 = centerY + Math.sin(angleRad) * r1;
      const x2 = centerX + Math.cos(angleRad) * r2;
      const y2 = centerY + Math.sin(angleRad) * r2;
      return createLine(x1, y1, x2, y2, i === 3 ? 2 : 1.5, white);
    }),
    // Current roll indicator (triangle)
    ...(() => {
      const angle = -Math.PI / 2 + rollRad;
      const r = 145;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      return [
        createPolygon(x, y, 5, 3, angle + Math.PI / 2, green),
      ];
    })(),

    // ===== FLIGHT PATH VECTOR (FPV) =====
    // Center circle
    createCircle(centerX, centerY, 8, green),
    createCircle(centerX, centerY, 4, greenGlow),
    // Wings
    createLine(centerX - 25, centerY, centerX - 10, centerY, 2, green),
    createLine(centerX + 10, centerY, centerX + 25, centerY, 2, green),
    // Vertical bar
    createLine(centerX, centerY + 10, centerX, centerY + 20, 2, green),

    // ===== REFERENCE BRACKETS =====
    // Fixed reference brackets (show aircraft attitude)
    ...(() => {
      const bracketSize = 40;
      const gap = 30;
      return [
        // Left bracket
        createLine(centerX - gap - bracketSize, centerY, centerX - gap, centerY, 2.5, green),
        createLine(centerX - gap - bracketSize, centerY - 10, centerX - gap - bracketSize, centerY + 10, 2.5, green),
        // Right bracket
        createLine(centerX + gap, centerY, centerX + gap + bracketSize, centerY, 2.5, green),
        createLine(centerX + gap + bracketSize, centerY - 10, centerX + gap + bracketSize, centerY + 10, 2.5, green),
      ];
    })(),
  ];

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-b from-blue-950 to-amber-950 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full"
      />
      {canvas && (
        <WebGPU2DRenderer
          canvas={canvas}
          shapes={shapes}
          width={800}
          height={400}
          onReady={() => setIsReady(true)}
        />
      )}
      {isReady && (
        <>
          <div className="absolute top-4 left-4 text-xs text-green-400 font-mono space-y-1">
            <div>PITCH: {pitch.toFixed(1)}°</div>
            <div>ROLL: {roll.toFixed(1)}°</div>
            <div>ALT: 31,000 FT</div>
          </div>
          <div className="absolute bottom-4 right-4 text-xs text-green-400">
            WebGPU Active • {shapes.length} shapes @ 60fps
          </div>
        </>
      )}
    </div>
  );
}

function TacticalTargetingDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      setCanvas(canvasRef.current);
    }
  }, [canvas]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.016);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const centerX = 400;
  const centerY = 200;

  const cyan: [number, number, number, number] = [0, 1, 1, 1];
  const cyanDim: [number, number, number, number] = [0, 1, 1, 0.5];
  const cyanFaint: [number, number, number, number] = [0, 1, 1, 0.25];
  const yellow: [number, number, number, number] = [1, 1, 0, 1];
  const red: [number, number, number, number] = [1, 0.2, 0.2, 1];

  // Animated target position
  const targetX = centerX + Math.cos(time * 0.8) * 80;
  const targetY = centerY + Math.sin(time * 0.8) * 40;

  const shapes: Shape[] = [
    // ===== CENTRAL RETICLE =====
    // Main targeting circle
    createCircle(centerX, centerY, 100, cyan),
    createCircle(centerX, centerY, 80, cyanDim),
    createCircle(centerX, centerY, 60, cyanFaint),

    // Center dot
    createCircle(centerX, centerY, 3, cyan),

    // Cross hairs with gaps
    createLine(centerX - 120, centerY, centerX - 60, centerY, 1.5, cyan),
    createLine(centerX + 60, centerY, centerX + 120, centerY, 1.5, cyan),
    createLine(centerX, centerY - 120, centerX, centerY - 60, 1.5, cyan),
    createLine(centerX, centerY + 60, centerX, centerY + 120, 1.5, cyan),

    // Corner brackets
    ...(() => {
      const corners = [
        [-1, -1], [1, -1], [-1, 1], [1, 1]
      ];
      const distance = 140;
      const size = 20;
      return corners.flatMap(([dx, dy]) => {
        const x = centerX + dx * distance;
        const y = centerY + dy * distance;
        return [
          createLine(x, y, x + dx * size, y, 2, cyan),
          createLine(x, y, x, y + dy * size, 2, cyan),
        ];
      });
    })(),

    // ===== RANGE RINGS =====
    // Rotating range indicators
    ...Array.from({ length: 4 }, (_, i) => {
      const angle = time + i * Math.PI / 2;
      const radius = 120;
      const x1 = centerX + Math.cos(angle) * (radius - 15);
      const y1 = centerY + Math.sin(angle) * (radius - 15);
      const x2 = centerX + Math.cos(angle) * (radius + 15);
      const y2 = centerY + Math.sin(angle) * (radius + 15);
      return createLine(x1, y1, x2, y2, 2, cyanDim);
    }),

    // ===== TARGET LOCK INDICATOR =====
    // Tracking square around moving target
    ...(() => {
      const size = 25;
      const corners = [
        [-1, -1], [1, -1], [-1, 1], [1, 1]
      ];
      return corners.flatMap(([dx, dy]) => {
        const x = targetX + dx * size;
        const y = targetY + dy * size;
        const len = 12;
        return [
          createLine(x, y, x + dx * len, y, 2, yellow),
          createLine(x, y, x, y + dy * len, 2, yellow),
        ];
      });
    })(),

    // Lead indicator (diamond)
    createPolygon(targetX, targetY, 6, 4, Math.PI / 4, yellow),

    // Connecting line from center to target
    createLine(centerX, centerY, targetX, targetY, 0.5, cyanFaint),

    // ===== WEAPONS INDICATOR =====
    // Simulated weapon release cue at bottom
    ...(() => {
      const weaponY = 350;
      return [
        // Release line
        createLine(centerX - 50, weaponY, centerX + 50, weaponY, 2, red),
        // Side markers
        createLine(centerX - 50, weaponY - 8, centerX - 50, weaponY + 8, 2, red),
        createLine(centerX + 50, weaponY - 8, centerX + 50, weaponY + 8, 2, red),
        // Center marker (pulsing)
        createCircle(centerX, weaponY, Math.abs(Math.sin(time * 4)) * 4 + 2, red),
      ];
    })(),

    // ===== HEADING INDICATORS =====
    // Simplified heading tape simulation at top
    ...Array.from({ length: 9 }, (_, i) => {
      const x = centerX - 200 + i * 50;
      const y = 40;
      return [
        createLine(x, y, x, y + 10, 1.5, cyan),
      ];
    }).flat(),
  ];

  return (
    <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full"
      />
      {canvas && (
        <WebGPU2DRenderer
          canvas={canvas}
          shapes={shapes}
          width={800}
          height={400}
          onReady={() => setIsReady(true)}
        />
      )}
      {isReady && (
        <>
          <div className="absolute top-4 left-4 text-xs text-cyan-400 font-mono space-y-1">
            <div>TARGET LOCK</div>
            <div>RNG: 2.4 NM</div>
            <div>TGT SPD: 450 KTS</div>
          </div>
          <div className="absolute top-4 right-4 text-xs text-yellow-400 font-mono">
            TRACK MODE
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-red-400 font-mono animate-pulse">
            WPN READY
          </div>
          <div className="absolute bottom-4 right-4 text-xs text-green-400">
            WebGPU Active • {shapes.length} shapes @ 60fps
          </div>
        </>
      )}
    </div>
  );
}

function InstrumentClusterDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      setCanvas(canvasRef.current);
    }
  }, [canvas]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.016);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Animated values
  const altitude = 31000 + Math.sin(time * 0.3) * 5000; // 26k - 36k ft
  const airspeed = 450 + Math.sin(time * 0.5) * 100; // 350 - 550 kts
  const heading = ((time * 20) % 360); // Slowly rotating

  const white: [number, number, number, number] = [1, 1, 1, 1];
  const whiteDim: [number, number, number, number] = [0.8, 0.8, 0.8, 1];
  const cyan: [number, number, number, number] = [0, 1, 1, 1];
  const green: [number, number, number, number] = [0, 1, 0, 1];
  const amber: [number, number, number, number] = [1, 0.75, 0, 1];
  const dark: [number, number, number, number] = [0.1, 0.1, 0.12, 1];
  const darkGlow: [number, number, number, number] = [0.05, 0.05, 0.1, 0.5];

  // Helper to create a circular gauge
  const createGauge = (
    cx: number,
    cy: number,
    radius: number,
    value: number,
    min: number,
    max: number,
    color: [number, number, number, number],
    label: string
  ): Shape[] => {
    const normalized = (value - min) / (max - min);
    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;
    const needleAngle = startAngle + normalized * (endAngle - startAngle);

    return [
      // Background glow
      createCircle(cx, cy, radius + 3, darkGlow),
      createCircle(cx, cy, radius, dark),

      // Inner ring
      createCircle(cx, cy, radius - 5, [0.15, 0.15, 0.17, 1]),
      createCircle(cx, cy, radius - 8, dark),

      // Arc track
      createArc(cx, cy, radius - 15, startAngle, endAngle, 2, whiteDim),

      // Tick marks (11 major ticks)
      ...Array.from({ length: 11 }, (_, i) => {
        const angle = startAngle + (i / 10) * (endAngle - startAngle);
        const innerR = radius - 25;
        const outerR = radius - 15;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * outerR;
        const y2 = cy + Math.sin(angle) * outerR;
        return createLine(x1, y1, x2, y2, i % 5 === 0 ? 2 : 1, white);
      }),

      // Needle with glow
      ...(() => {
        const needleLength = radius - 30;
        const x2 = cx + Math.cos(needleAngle) * needleLength;
        const y2 = cy + Math.sin(needleAngle) * needleLength;
        return [
          // Needle glow
          createLine(cx, cy, x2, y2, 6, [color[0], color[1], color[2], 0.3]),
          // Needle
          createLine(cx, cy, x2, y2, 3, color),
        ];
      })(),

      // Center pivot
      createCircle(cx, cy, 8, [color[0], color[1], color[2], 0.3]),
      createCircle(cx, cy, 5, color),
    ];
  };

  const shapes: Shape[] = [
    // ===== ALTIMETER (LEFT) =====
    ...createGauge(200, 200, 80, altitude, 0, 50000, green, "ALT"),

    // ===== AIRSPEED INDICATOR (CENTER) =====
    ...createGauge(400, 200, 80, airspeed, 0, 600, cyan, "IAS"),

    // ===== HEADING INDICATOR (RIGHT) =====
    // Compass rose with rotating card
    ...(() => {
      const cx = 600;
      const cy = 200;
      const radius = 80;

      return [
        // Background
        createCircle(cx, cy, radius + 3, darkGlow),
        createCircle(cx, cy, radius, dark),
        createCircle(cx, cy, radius - 5, [0.15, 0.15, 0.17, 1]),
        createCircle(cx, cy, radius - 8, dark),

        // Rotating compass marks (every 30 degrees)
        ...Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 - heading) * Math.PI / 180;
          const r1 = radius - 20;
          const r2 = radius - 10;
          const x1 = cx + Math.cos(angle) * r1;
          const y1 = cy + Math.sin(angle) * r1;
          const x2 = cx + Math.cos(angle) * r2;
          const y2 = cy + Math.sin(angle) * r2;
          const isCardinal = i % 3 === 0;
          return createLine(x1, y1, x2, y2, isCardinal ? 2.5 : 1.5, isCardinal ? amber : white);
        }),

        // Fixed heading bug at top (triangle pointing up)
        createPolygon(cx, cy - radius + 15, 6, 3, 0, amber),

        // Center dot
        createCircle(cx, cy, 5, amber),
        createCircle(cx, cy, 3, [1, 0.75, 0, 0.5]),
      ];
    })(),

    // ===== DIVIDER LINES =====
    createLine(300, 120, 300, 280, 0.5, [0.3, 0.3, 0.3, 0.5]),
    createLine(500, 120, 500, 280, 0.5, [0.3, 0.3, 0.3, 0.5]),
  ];

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full"
      />
      {canvas && (
        <WebGPU2DRenderer
          canvas={canvas}
          shapes={shapes}
          width={800}
          height={400}
          onReady={() => setIsReady(true)}
        />
      )}
      {isReady && (
        <>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-8 text-xs font-mono">
            <div className="text-center">
              <div className="text-green-400 font-bold">{Math.round(altitude).toLocaleString()} FT</div>
              <div className="text-gray-400 text-[10px]">ALTITUDE</div>
            </div>
            <div className="text-center">
              <div className="text-cyan-400 font-bold">{Math.round(airspeed)} KTS</div>
              <div className="text-gray-400 text-[10px]">AIRSPEED</div>
            </div>
            <div className="text-center">
              <div className="text-amber-400 font-bold">{Math.round(heading)}°</div>
              <div className="text-gray-400 text-[10px]">HEADING</div>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 text-xs text-green-400">
            WebGPU Active • {shapes.length} shapes @ 60fps
          </div>
        </>
      )}
    </div>
  );
}

export { shape2DApiProps as Shape2DApiReference } from "./api/shape-2d";
