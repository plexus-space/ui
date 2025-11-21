"use client";

import { useState, useEffect } from "react";
import { PointCloudViewer } from "@plexusui/components/charts/point-cloud-viewer";

// Generate a brain-like 3D point cloud with realistic structure
function generateBrainPointCloud(numPoints: number = 20000) {
  const points = [];

  // Create a brain-shaped ellipsoid with internal structures
  for (let i = 0; i < numPoints; i++) {
    // Generate points in spherical coordinates for organic shape
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    // Brain-like ellipsoid (wider, slightly flattened)
    const r = 0.7 + Math.random() * 0.3;
    const x = r * Math.sin(phi) * Math.cos(theta) * 1.2;
    const y = r * Math.sin(phi) * Math.sin(theta) * 0.9;
    const z = r * Math.cos(phi);

    // Add internal structures (ventricles, cortical layers)
    const distFromCenter = Math.sqrt(x * x + y * y + z * z);

    // Skip some internal points to create ventricles
    if (distFromCenter < 0.3 && Math.random() > 0.3) continue;

    // Create cortical folds (surface detail)
    const surfaceNoise =
      Math.sin(x * 15) * 0.05 +
      Math.sin(y * 12) * 0.05 +
      Math.sin(z * 18) * 0.05;

    // Intensity based on depth (surface brighter, core darker)
    // Simulates tissue density / perfusion
    const intensity =
      (distFromCenter > 0.6 ? 0.8 : 0.5) + // Cortex vs deep structures
      surfaceNoise +
      Math.random() * 0.2;

    points.push({
      x: x + surfaceNoise,
      y: y + surfaceNoise,
      z: z + surfaceNoise,
      intensity: Math.max(0, Math.min(1, intensity)),
    });
  }

  return points;
}

export function MedicalScanViewer() {
  const [pointCloud, setPointCloud] = useState(() => generateBrainPointCloud());
  const [isRotating, setIsRotating] = useState(true);

  // Simulate subtle intensity changes (blood flow, oxygenation)
  useEffect(() => {
    const interval = setInterval(() => {
      setPointCloud((prev) =>
        prev.map((point) => ({
          ...point,
          intensity: Math.max(
            0,
            Math.min(1, point.intensity + (Math.random() - 0.5) * 0.02)
          ),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700"
        >
          {isRotating ? "Pause" : "Rotate"}
        </button>
        <button
          type="button"
          onClick={() => setPointCloud(generateBrainPointCloud())}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700"
        >
          New Scan
        </button>
      </div>

      <PointCloudViewer
        data={{
          positions: new Float32Array(
            pointCloud.flatMap((p) => [p.x, p.y, p.z])
          ),
          intensities: new Float32Array(pointCloud.map((p) => p.intensity)),
        }}
        width={550}
        height={400}
        colorMode="intensity"
        showGrid={false}
        showAxes={false}
        autoRotate={isRotating}
        backgroundColor="#09090b"
        cameraPosition={[2, 2, 2]}
      />

      <div className="mt-2 text-xs text-gray-400 text-center">
        3D Brain Scan • {pointCloud.length.toLocaleString()} points •
        Color-mapped by tissue density
      </div>
    </div>
  );
}
