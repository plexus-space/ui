"use client";

import { HeatmapChart } from "@plexusui/components/charts/heatmap-chart";
import { LineChart } from "@plexusui/components/charts/line-chart";
import { useState, useEffect, useRef } from "react";
import { Camera, CameraOff, Activity, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CameraVisualizerProps {
  className?: string;
}

export function CameraVisualizer({ className }: CameraVisualizerProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [motionIntensity, setMotionIntensity] = useState(0);
  const [avgMotion, setAvgMotion] = useState(0);
  const [motionHistory, setMotionHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);

  // Heatmap data
  const [heatmapData, setHeatmapData] = useState<
    Array<{ x: number; y: number; value: number }>
  >([]);

  // Camera refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const displayVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousFrameRef = useRef<ImageData | null>(null);
  const startTimeRef = useRef<number>(0);
  const motionHistoryRef = useRef<number[]>([]);
  const lastHeatmapUpdateRef = useRef<number>(0);
  const smoothedMotionGridRef = useRef<number[][]>(
    Array(20)
      .fill(0)
      .map(() => Array(20).fill(0))
  );

  // Constants
  const GRID_SIZE = 20; // 20x20 grid for heatmap
  const MAX_HISTORY_POINTS = 300;
  const HEATMAP_UPDATE_INTERVAL = 100; // Update heatmap every 100ms (10fps) instead of 60fps
  const MOTION_SMOOTHING = 0.3; // Smoothing factor for motion data

  const startCamera = async () => {
    try {
      setError(null);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      streamRef.current = stream;

      setIsActive(true);
      startTimeRef.current = Date.now();
      motionHistoryRef.current = [];
      setMotionHistory([]);

      // Initialize with empty heatmap data
      const initialHeatmap: Array<{ x: number; y: number; value: number }> = [];
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          initialHeatmap.push({ x, y, value: 0 });
        }
      }
      setHeatmapData(initialHeatmap);

      // Wait for refs to be available after state update
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Set up video elements
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
          console.log("Hidden video playing");
        } catch (e) {
          console.error("Error playing hidden video:", e);
        }

        // Wait for video to be ready then start detection
        videoRef.current.onloadedmetadata = () => {
          console.log("Video loaded, starting motion detection");
          console.log(
            "Video dimensions:",
            videoRef.current?.videoWidth,
            "x",
            videoRef.current?.videoHeight
          );
          detectMotion();
        };
      } else {
        console.error("videoRef.current is null");
      }

      if (displayVideoRef.current) {
        displayVideoRef.current.srcObject = stream;
        try {
          await displayVideoRef.current.play();
          console.log(
            "Display video playing",
            displayVideoRef.current.videoWidth,
            "x",
            displayVideoRef.current.videoHeight
          );
        } catch (e) {
          console.error("Error playing display video:", e);
        }
      } else {
        console.error("displayVideoRef.current is null - will retry");
        // Retry after a short delay to let React render
        setTimeout(() => {
          if (displayVideoRef.current) {
            displayVideoRef.current.srcObject = stream;
            displayVideoRef.current.play();
            console.log("Display video playing (delayed)");
          }
        }, 100);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      let errorMessage = "Could not access camera. ";

      if (err.name === "NotAllowedError") {
        errorMessage +=
          "Camera permission was denied. Please allow camera access and try again.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No camera found on this device.";
      } else if (err.name === "NotReadableError") {
        errorMessage += "Camera is already in use by another application.";
      } else {
        errorMessage +=
          "Please ensure you've granted permission and your camera is available.";
      }

      setError(errorMessage);
    }
  };

  const stopCamera = () => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Clear video elements
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (displayVideoRef.current) {
      displayVideoRef.current.srcObject = null;
    }

    setIsActive(false);
    previousFrameRef.current = null;
  };

  const detectMotion = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      console.error("Video or canvas not available");
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }

    console.log("Motion detection started");

    const update = () => {
      if (!video || !canvas || !ctx) return;

      // Check if video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameRef.current = requestAnimationFrame(update);
        return;
      }

      // Set canvas size to match video
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        console.log(
          "Setting canvas size to:",
          video.videoWidth,
          "x",
          video.videoHeight
        );
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (previousFrameRef.current) {
        // Calculate motion in grid cells
        const cellWidth = Math.floor(canvas.width / GRID_SIZE);
        const cellHeight = Math.floor(canvas.height / GRID_SIZE);
        const motionGrid: number[][] = Array(GRID_SIZE)
          .fill(0)
          .map(() => Array(GRID_SIZE).fill(0));

        let totalMotion = 0;

        // Compare current frame with previous frame
        for (let gridY = 0; gridY < GRID_SIZE; gridY++) {
          for (let gridX = 0; gridX < GRID_SIZE; gridX++) {
            let cellMotion = 0;
            let pixelCount = 0;

            // Sample pixels in this grid cell
            const startX = gridX * cellWidth;
            const startY = gridY * cellHeight;
            const endX = Math.min(startX + cellWidth, canvas.width);
            const endY = Math.min(startY + cellHeight, canvas.height);

            for (let y = startY; y < endY; y += 2) {
              // Skip every other pixel for performance
              for (let x = startX; x < endX; x += 2) {
                const i = (y * canvas.width + x) * 4;

                // Calculate pixel difference (grayscale)
                const currentGray =
                  (currentFrame.data[i] +
                    currentFrame.data[i + 1] +
                    currentFrame.data[i + 2]) /
                  3;
                const previousGray =
                  (previousFrameRef.current.data[i] +
                    previousFrameRef.current.data[i + 1] +
                    previousFrameRef.current.data[i + 2]) /
                  3;

                const diff = Math.abs(currentGray - previousGray);
                cellMotion += diff;
                pixelCount++;
              }
            }

            // Normalize cell motion
            if (pixelCount > 0) {
              cellMotion = cellMotion / pixelCount / 255; // Normalize to [0, 1]

              // Apply smoothing
              const smoothed =
                smoothedMotionGridRef.current[gridY][gridX] *
                  (1 - MOTION_SMOOTHING) +
                cellMotion * MOTION_SMOOTHING;
              smoothedMotionGridRef.current[gridY][gridX] = smoothed;

              motionGrid[gridY][gridX] = smoothed;
              totalMotion += smoothed;
            }
          }
        }

        // Update heatmap at reduced frequency (throttled)
        const now = Date.now();
        if (now - lastHeatmapUpdateRef.current >= HEATMAP_UPDATE_INTERVAL) {
          lastHeatmapUpdateRef.current = now;

          const heatmap: Array<{ x: number; y: number; value: number }> = [];
          for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
              heatmap.push({
                x: GRID_SIZE - 1 - x, // Flip X axis to mirror
                y: GRID_SIZE - 1 - y, // Flip Y axis
                value: smoothedMotionGridRef.current[y][x] * 100, // Scale to 0-100
              });
            }
          }

          if (heatmap.length > 0) {
            setHeatmapData(heatmap);
          }
        }

        // Calculate overall motion intensity
        const avgCellMotion = totalMotion / (GRID_SIZE * GRID_SIZE);
        const intensity = Math.min(100, avgCellMotion * 500); // Scale for visibility
        setMotionIntensity(intensity);

        // Store motion history
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        motionHistoryRef.current.push(intensity);

        // Keep only recent history
        if (motionHistoryRef.current.length > MAX_HISTORY_POINTS) {
          motionHistoryRef.current = motionHistoryRef.current.slice(
            -MAX_HISTORY_POINTS
          );
        }

        // Update motion history chart
        const history = motionHistoryRef.current.map((val, idx) => ({
          x: elapsed - (motionHistoryRef.current.length - idx - 1) * (1 / 30), // Assume ~30fps
          y: val,
        }));
        setMotionHistory(history);

        // Calculate average motion
        if (motionHistoryRef.current.length > 0) {
          const avg =
            motionHistoryRef.current.reduce((a, b) => a + b, 0) /
            motionHistoryRef.current.length;
          setAvgMotion(avg);
        }
      }

      // Store current frame for next comparison
      previousFrameRef.current = currentFrame;

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(update);
    };

    update();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopCamera();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      {/* Controls */}
      <Card className="hover:border-zinc-700 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold mb-1">
              Real-Time Motion Detection
            </h3>
            <p className="text-xs text-gray-400">
              Camera-based motion heatmap with pixel-level analysis
            </p>
          </div>
          <button
            onClick={isActive ? stopCamera : startCamera}
            className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 text-sm ${
              isActive
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-cyan-500 text-white hover:bg-cyan-600"
            }`}
          >
            {isActive ? (
              <>
                <CameraOff className="h-4 w-4" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Start Camera
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Card className="hover:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Motion Intensity
                </div>
                <div className="text-2xl font-bold">
                  {motionIntensity.toFixed(1)}%
                </div>
              </div>
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="hover:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Average Motion</div>
                <div className="text-2xl font-bold">
                  {avgMotion.toFixed(1)}%
                </div>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="hover:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Grid Resolution
                </div>
                <div className="text-2xl font-bold">
                  {GRID_SIZE}x{GRID_SIZE}
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
          <Camera className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start Motion Detection</h3>
          <p className="text-sm text-zinc-400 mb-4 max-w-lg mx-auto">
            Click "Start Camera" to see real-time motion analysis. Move your
            hand, wave, or walk around to see motion tracking in action!
          </p>
          <ul className="text-xs text-zinc-500 space-y-1 max-w-md mx-auto">
            <li>✓ Real-time motion heatmap</li>
            <li>✓ 20x20 grid analysis</li>
            <li>✓ Pixel-level motion detection</li>
            <li>✓ Historical motion tracking</li>
          </ul>
        </div>
      )}

      {/* Hidden video and canvas elements */}
      <video ref={videoRef} style={{ display: "none" }} playsInline muted />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Visualizations */}
      {isActive && (
        <>
          {/* Live camera feed and motion heatmap */}
          <div className="grid gap-3 md:grid-cols-2 mb-4">
            <ChartCard title="Live Camera Feed" description="Your camera input">
              <div
                className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center"
                style={{ height: "300px" }}
              >
                <video
                  ref={displayVideoRef}
                  className="max-w-full max-h-full"
                  style={{ transform: "scaleX(-1)" }}
                  playsInline
                  muted
                  autoPlay
                />
              </div>
            </ChartCard>

            <ChartCard
              title="Motion Heatmap"
              description="20x20 grid motion detection (warmer = more movement)"
            >
              {heatmapData.length > 0 && (
                <HeatmapChart
                  data={heatmapData}
                  width={550}
                  height={300}
                  cellGap={1}
                />
              )}
            </ChartCard>
          </div>

          {/* Motion history */}
          {motionHistory.length > 10 && (
            <ChartCard
              title="Motion Intensity Over Time"
              description="Historical motion tracking"
            >
              <LineChart
                series={[
                  {
                    name: "Motion",
                    color: "#eab308",
                    data: motionHistory,
                  },
                ]}
                width={1150}
                height={250}
                showGrid
                showAxes
                xAxis={{ label: "Time (s)" }}
                yAxis={{ domain: [0, 100], label: "Intensity %" }}
              />
            </ChartCard>
          )}
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
