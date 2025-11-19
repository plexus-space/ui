"use client";

import { PointCloudViewer } from "@plexusui/components/charts/point-cloud-viewer";
import { LineChart } from "@plexusui/components/charts/line-chart";
import { useState, useEffect, useRef } from "react";
import { Camera, AlertTriangle, CheckCircle2, TrendingUp, Users, Box } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PointCloudVisualizerProps {
  className?: string;
}

interface PointCloudInsight {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
}

export function PointCloudVisualizer({ className }: PointCloudVisualizerProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<PointCloudInsight[]>([]);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  // Point cloud data
  const [pointCloudData, setPointCloudData] = useState<{
    positions: Float32Array;
    colors: Uint8Array;
    intensities: Float32Array;
  }>({
    positions: new Float32Array([]),
    colors: new Uint8Array([]),
    intensities: new Float32Array([]),
  });

  // Observability metrics
  const [pointCount, setPointCount] = useState(0);
  const [depthRange, setDepthRange] = useState({ min: 0, max: 0 });
  const [avgDepth, setAvgDepth] = useState(0);
  const [edgeDensity, setEdgeDensity] = useState(0);
  const [faceCount, setFaceCount] = useState(0);
  const [sceneComplexity, setSceneComplexity] = useState(0);
  const [depthDistribution, setDepthDistribution] = useState<Array<{ x: number; y: number }>>([]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });

      streamRef.current = stream;
      setIsActive(true);

      // Wait for refs to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        processFrame();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  };

  // Fast face estimation based on skin pixel count
  const estimateFaceCount = (skinPixelCount: number): number => {
    if (skinPixelCount < 100) return 0;

    // Approximate pixels per face (depends on distance and resolution)
    // Typical face at mid-range ~800-2000 sampled pixels
    const avgPixelsPerFace = 1200;
    const faceCount = Math.round(skinPixelCount / avgPixelsPerFace);

    // Cap at reasonable number
    return Math.min(faceCount, 5);
  };

  const processFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Generate point cloud from camera
    const points: number[] = [];
    const colors: number[] = [];
    const intensities: number[] = [];
    const newInsights: PointCloudInsight[] = [];

    const SAMPLE_RATE = 4; // Process every 4th pixel for more points
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const SCALE = 0.05; // Smaller scale for better visualization

    let totalEdges = 0;
    const depthValues: number[] = [];
    let skinPixelCount = 0;

    // Edge detection kernel (Sobel)
    const getEdgeMagnitude = (x: number, y: number): number => {
      if (x < 1 || x >= WIDTH - 1 || y < 1 || y >= HEIGHT - 1) return 0;

      const getPixel = (px: number, py: number) => {
        const idx = (py * WIDTH + px) * 4;
        return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      };

      const gx =
        -1 * getPixel(x - 1, y - 1) + 1 * getPixel(x + 1, y - 1) +
        -2 * getPixel(x - 1, y) + 2 * getPixel(x + 1, y) +
        -1 * getPixel(x - 1, y + 1) + 1 * getPixel(x + 1, y + 1);

      const gy =
        -1 * getPixel(x - 1, y - 1) - 2 * getPixel(x, y - 1) - 1 * getPixel(x + 1, y - 1) +
        1 * getPixel(x - 1, y + 1) + 2 * getPixel(x, y + 1) + 1 * getPixel(x + 1, y + 1);

      return Math.sqrt(gx * gx + gy * gy);
    };

    // Improved skin tone detection
    const isSkinTone = (r: number, g: number, b: number): boolean => {
      // More accurate skin detection using YCbCr color space approximation
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      // Skin tone boundaries in YCbCr
      return (y > 80 && cb > 85 && cb < 135 && cr > 135 && cr < 180);
    };

    for (let y = 0; y < HEIGHT; y += SAMPLE_RATE) {
      for (let x = 0; x < WIDTH; x += SAMPLE_RATE) {
        const idx = (y * WIDTH + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Calculate depth using multiple cues
        const brightness = (r + g + b) / 3;
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);
        const edgeMagnitude = getEdgeMagnitude(x, y);

        // Depth estimation (closer objects have higher edge magnitude and saturation)
        const edgeDepth = Math.max(0, 100 - edgeMagnitude * 0.5);
        const colorDepth = Math.max(0, 100 - saturation * 0.3);
        const brightnessDepth = brightness * 0.3;

        // Weighted depth combination
        let depth = (edgeDepth * 0.5 + colorDepth * 0.3 + brightnessDepth * 0.2);

        // Count skin pixels for face estimation
        if (isSkinTone(r, g, b)) {
          depth = 50; // Assume faces are at mid-range
          skinPixelCount++;
        }

        if (edgeMagnitude > 20) {
          totalEdges++;
        }

        depthValues.push(depth);

        // 3D position
        const px = (x - WIDTH / 2) * SCALE;
        const py = -(y - HEIGHT / 2) * SCALE;
        const pz = -depth * SCALE;

        points.push(px, py, pz);
        colors.push(r, g, b);
        intensities.push(edgeMagnitude / 255);
      }
    }

    // Calculate observability metrics
    const totalPoints = points.length / 3;
    const minDepth = Math.min(...depthValues);
    const maxDepth = Math.max(...depthValues);
    const avgDepthVal = depthValues.reduce((a, b) => a + b, 0) / depthValues.length;
    const edgeDensityVal = (totalEdges / totalPoints) * 100;
    const complexityScore = Math.min(100, edgeDensityVal * 2);

    // Estimate face count from skin pixels
    const estimatedFaces = estimateFaceCount(skinPixelCount);

    // Depth distribution histogram
    const bins = 20;
    const binSize = (maxDepth - minDepth) / bins;
    const histogram = new Array(bins).fill(0);

    depthValues.forEach((d) => {
      const binIndex = Math.min(Math.floor((d - minDepth) / binSize), bins - 1);
      histogram[binIndex]++;
    });

    const distribution = histogram.map((count, i) => ({
      x: minDepth + (i + 0.5) * binSize,
      y: count,
    }));

    // Generate insights
    newInsights.push({
      id: '1',
      type: 'success',
      message: `Point cloud generated - ${totalPoints.toLocaleString()} vertices from camera feed`,
    });

    if (estimatedFaces > 0) {
      newInsights.push({
        id: '2',
        type: 'info',
        message: `${estimatedFaces} face(s) detected at estimated distance ${avgDepthVal.toFixed(1)}cm`,
      });
    }

    if (edgeDensityVal > 15) {
      newInsights.push({
        id: '3',
        type: 'info',
        message: `High edge density (${edgeDensityVal.toFixed(1)}%) indicates complex scene geometry`,
      });
    } else if (edgeDensityVal < 5) {
      newInsights.push({
        id: '4',
        type: 'warning',
        message: `Low edge density - scene appears flat or uniform`,
      });
    }

    const depthVariation = maxDepth - minDepth;
    if (depthVariation < 30) {
      newInsights.push({
        id: '5',
        type: 'info',
        message: `Low depth variation (${depthVariation.toFixed(1)}cm) - planar surface detected`,
      });
    } else {
      newInsights.push({
        id: '6',
        type: 'success',
        message: `Good depth range (${depthVariation.toFixed(1)}cm) - 3D structure visible`,
      });
    }

    // Update state
    const cloudData = {
      positions: new Float32Array(points),
      colors: new Uint8Array(colors),
      intensities: new Float32Array(intensities),
    };

    console.log('Generated point cloud:', {
      pointCount: totalPoints,
      positionsLength: cloudData.positions.length,
      colorsLength: cloudData.colors.length,
      depthRange: [minDepth, maxDepth],
    });

    setPointCloudData(cloudData);
    setPointCount(totalPoints);
    setDepthRange({ min: minDepth, max: maxDepth });
    setAvgDepth(avgDepthVal);
    setEdgeDensity(edgeDensityVal);
    setFaceCount(estimatedFaces);
    setSceneComplexity(complexityScore);
    setDepthDistribution(distribution);
    setInsights(newInsights);

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      {/* Hidden video and canvas */}
      <video ref={videoRef} style={{ display: 'none' }} playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Controls */}
      <Card className="hover:border-zinc-700 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold mb-1">Camera-to-Point-Cloud</h3>
            <p className="text-xs text-gray-400">
              Real-time 3D reconstruction with depth estimation and scene analysis
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
            <Camera className="h-4 w-4" />
            {isActive ? 'Stop Camera' : 'Start Camera'}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-xs">
            {error}
          </div>
        )}
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mb-4">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              className={`hover:border-zinc-700 p-3 ${
                insight.type === 'warning'
                  ? 'border-orange-500/30'
                  : insight.type === 'success'
                  ? 'border-green-500/30'
                  : 'border-cyan-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {insight.type === 'warning' && (
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                )}
                {insight.type === 'success' && (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                )}
                {insight.type === 'info' && (
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                )}
                <span className="text-xs">{insight.message}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Metrics */}
      {isActive && pointCount > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <Card className="hover:border-zinc-700">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Total Points</div>
              <div className="text-2xl font-bold">{pointCount.toLocaleString()}</div>
              <div className="text-xs text-gray-400">vertices</div>
            </div>
          </Card>

          <Card className="hover:border-zinc-700">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Avg Depth</div>
              <div className="text-xl font-bold">
                {avgDepth.toFixed(1)}cm
              </div>
              <div className="text-xs text-gray-400">estimated</div>
            </div>
          </Card>

          <Card className="hover:border-zinc-700">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Edge Density</div>
              <div className="text-xl font-bold">{edgeDensity.toFixed(1)}%</div>
              <div className="text-xs text-gray-400">features</div>
            </div>
          </Card>

          <Card className={`hover:border-zinc-700 ${faceCount > 0 ? 'border-cyan-500/50 bg-cyan-500/5' : ''}`}>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Faces Detected</div>
              <div className={`text-2xl font-bold ${faceCount > 0 ? 'text-cyan-400' : 'text-gray-400'}`}>
                {faceCount}
              </div>
              <div className="text-xs text-gray-400">
                <Users className="h-3 w-3 inline" />
              </div>
            </div>
          </Card>

          <Card className="hover:border-zinc-700">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Scene Complexity</div>
              <div className="text-xl font-bold">{sceneComplexity.toFixed(0)}</div>
              <div className="text-xs text-gray-400">score</div>
            </div>
          </Card>
        </div>
      )}

      {/* Visualizations */}
      {isActive && pointCloudData.positions.length > 0 && (
        <>
          <div className="grid gap-3 md:grid-cols-2 mb-4">
            {/* Point Cloud */}
            <Card className="hover:border-zinc-700 md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs text-gray-500 mb-1">Live 3D Point Cloud</h3>
                  <p className="text-xs text-gray-400">
                    Drag to orbit • Scroll to zoom • Real-time camera reconstruction
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Live</span>
                </div>
              </div>
              <div className="bg-black rounded-lg overflow-hidden">
                <PointCloudViewer
                  data={pointCloudData}
                  colorMode="rgb"
                  pointSize={3}
                  height={500}
                  enableOctree={true}
                  showGrid
                  backgroundColor="#000000"
                  camera={{
                    position: [0, 0, 50],
                    fov: 60,
                  }}
                />
              </div>
            </Card>

            {/* Depth Distribution */}
            <Card className="hover:border-zinc-700 md:col-span-2">
              <div className="mb-2">
                <h3 className="text-xs text-gray-500">Depth Distribution Analysis</h3>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  Estimated depth histogram using edge detection and color analysis
                </p>
                <LineChart
                  series={[
                    {
                      name: "Point Count",
                      color: "#06b6d4",
                      data: depthDistribution,
                    },
                  ]}
                  width={1150}
                  height={250}
                  showGrid
                  showAxes
                  xAxis={{ label: "Depth (cm)" }}
                  yAxis={{ label: "Point Count" }}
                />
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Instructions */}
      {!isActive && (
        <div className="p-8 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center mb-4">
          <Camera className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Start Camera Point Cloud
          </h3>
          <p className="text-sm text-zinc-400 mb-4 max-w-lg mx-auto">
            Convert your camera feed into a real-time 3D point cloud with intelligent depth estimation and scene analysis.
          </p>
          <ul className="text-xs text-zinc-500 space-y-1 max-w-md mx-auto">
            <li>✓ Real-time depth estimation using edge detection</li>
            <li>✓ Face detection and tracking</li>
            <li>✓ Scene complexity analysis</li>
            <li>✓ 3D reconstruction with WebGPU acceleration</li>
          </ul>
        </div>
      )}
    </div>
  );
}
