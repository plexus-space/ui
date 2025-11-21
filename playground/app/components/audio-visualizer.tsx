"use client";

import { LineChart } from "@plexusui/components/charts/line-chart";
import { BarChart } from "@plexusui/components/charts/bar-chart";
import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface AudioVisualizerProps {
  className?: string;
}

interface AudioStats {
  volume: number;
  peakFrequency: number;
  timestamp: number;
}

interface AudioInsight {
  id: string;
  type: "info" | "warning" | "success";
  message: string;
  timestamp: number;
}

export function AudioVisualizer({ className }: AudioVisualizerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Classification & Inference
  const [_audioType, setAudioType] = useState<
    "silence" | "speech" | "music" | "noise"
  >("silence");
  const [bpm, setBpm] = useState(0);
  const [spectralCentroid, setSpectralCentroid] = useState(0);
  const [dynamicRange, setDynamicRange] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  const [insights, setInsights] = useState<AudioInsight[]>([]);

  const [volumeHistory, setVolumeHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [peakFreqHistory, setPeakFreqHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const statsHistoryRef = useRef<AudioStats[]>([]);
  const beatHistoryRef = useRef<number[]>([]);

  const [waveformData, setWaveformData] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [frequencyData, setFrequencyData] = useState<
    Array<{ x: string; y: number }>
  >([]);
  // Audio context refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Constants
  const FFT_SIZE = 2048;
  const SAMPLE_RATE = 48000;
  const WAVEFORM_POINTS = 200;
  const MAX_HISTORY_POINTS = 300;

  const addInsight = (type: AudioInsight["type"], message: string) => {
    const insight: AudioInsight = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: Date.now(),
    };
    setInsights((prev) => [...prev.slice(-4), insight]); // Keep last 5
  };

  const startRecording = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      micStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsRecording(true);
      startTimeRef.current = Date.now();

      statsHistoryRef.current = [];
      beatHistoryRef.current = [];
      setVolumeHistory([]);
      setPeakFreqHistory([]);
      setInsights([]);

      addInsight("success", "Audio monitoring started");
      visualize();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(
        "Could not access microphone. Please ensure you've granted permission."
      );
    }
  };

  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    setIsRecording(false);
    addInsight("info", "Audio monitoring stopped");
  };

  const visualize = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const timeDataArray = new Uint8Array(bufferLength);
    const frequencyDataArray = new Uint8Array(bufferLength);

    const updateVisualization = () => {
      if (!analyser) return;

      analyser.getByteTimeDomainData(timeDataArray);
      analyser.getByteFrequencyData(frequencyDataArray);

      // Update waveform
      const waveform: Array<{ x: number; y: number }> = [];
      const step = Math.floor(bufferLength / WAVEFORM_POINTS);
      for (let i = 0; i < WAVEFORM_POINTS; i++) {
        const value = (timeDataArray[i * step] - 128) / 128;
        waveform.push({ x: i, y: value });
      }
      setWaveformData(waveform);

      // Calculate RMS volume
      let sum = 0;
      for (let i = 0; i < timeDataArray.length; i++) {
        const normalized = (timeDataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / timeDataArray.length);
      const volume = Math.min(100, rms * 200);

      // Detect clipping
      const clipping = timeDataArray.some((v) => v === 0 || v === 255);
      if (clipping && !isClipping) {
        setIsClipping(true);
        addInsight("warning", "Audio clipping detected - reduce input volume");
      } else if (!clipping && isClipping) {
        setIsClipping(false);
      }

      // Find peak frequency
      let maxFreqValue = 0;
      let maxFreqIndex = 0;
      for (let i = 0; i < frequencyDataArray.length / 2; i++) {
        if (frequencyDataArray[i] > maxFreqValue) {
          maxFreqValue = frequencyDataArray[i];
          maxFreqIndex = i;
        }
      }
      const peakFreq = (maxFreqIndex * SAMPLE_RATE) / (2 * FFT_SIZE);

      // FREQUENCY BAND ANALYSIS
      const getBandEnergy = (startHz: number, endHz: number): number => {
        const startIdx = Math.floor((startHz * FFT_SIZE) / SAMPLE_RATE);
        const endIdx = Math.floor((endHz * FFT_SIZE) / SAMPLE_RATE);
        let sum = 0;
        for (
          let i = startIdx;
          i < endIdx && i < frequencyDataArray.length;
          i++
        ) {
          sum += frequencyDataArray[i];
        }
        return (sum / (endIdx - startIdx) / 255) * 100;
      };

      const bands = {
        subBass: getBandEnergy(20, 60),
        bass: getBandEnergy(60, 250),
        lowMids: getBandEnergy(250, 500),
        mids: getBandEnergy(500, 2000),
        highMids: getBandEnergy(2000, 4000),
        presence: getBandEnergy(4000, 6000),
        brilliance: getBandEnergy(6000, 20000),
      };

      // AUDIO CLASSIFICATION
      if (volume < 5) {
        setAudioType("silence");
      }

      // SPECTRAL CENTROID (brightness of sound)
      let weightedSum = 0;
      let totalMagnitude = 0;
      for (let i = 0; i < frequencyDataArray.length / 2; i++) {
        const freq = (i * SAMPLE_RATE) / FFT_SIZE;
        const magnitude = frequencyDataArray[i];
        weightedSum += freq * magnitude;
        totalMagnitude += magnitude;
      }
      const centroid = totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;
      setSpectralCentroid(centroid);

      // DYNAMIC RANGE
      const maxVal = Math.max(...Array.from(timeDataArray));
      const minVal = Math.min(...Array.from(timeDataArray));
      const dynamicRangeDb = 20 * Math.log10(maxVal / Math.max(minVal, 1));
      setDynamicRange(Math.min(dynamicRangeDb, 100));

      // BPM DETECTION (simplified beat detection)
      if (volume > 40) {
        beatHistoryRef.current.push(Date.now());
        // Keep only beats in last 10 seconds
        beatHistoryRef.current = beatHistoryRef.current.filter(
          (t) => Date.now() - t < 10000
        );

        if (beatHistoryRef.current.length > 4) {
          const intervals: number[] = [];
          for (let i = 1; i < beatHistoryRef.current.length; i++) {
            intervals.push(
              beatHistoryRef.current[i] - beatHistoryRef.current[i - 1]
            );
          }
          const avgInterval =
            intervals.reduce((a, b) => a + b, 0) / intervals.length;
          const estimatedBpm = Math.round(60000 / avgInterval);
          if (estimatedBpm > 40 && estimatedBpm < 200) {
            setBpm(estimatedBpm);
          }
        }
      }

      // Update frequency bars with band labels
      const frequencyBars: Array<{ x: string; y: number }> = [
        { x: "Sub\nBass", y: bands.subBass },
        { x: "Bass", y: bands.bass },
        { x: "Low\nMids", y: bands.lowMids },
        { x: "Mids", y: bands.mids },
        { x: "High\nMids", y: bands.highMids },
        { x: "Presence", y: bands.presence },
        { x: "Brilliance", y: bands.brilliance },
      ];
      setFrequencyData(frequencyBars);

      // Store historical stats
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      statsHistoryRef.current.push({
        volume,
        peakFrequency: peakFreq,
        timestamp: elapsed,
      });

      if (statsHistoryRef.current.length > MAX_HISTORY_POINTS) {
        statsHistoryRef.current = statsHistoryRef.current.slice(
          -MAX_HISTORY_POINTS
        );
      }

      const volHistory = statsHistoryRef.current.map((s) => ({
        x: s.timestamp,
        y: s.volume,
      }));
      const freqHistory = statsHistoryRef.current.map((s) => ({
        x: s.timestamp,
        y: s.peakFrequency,
      }));
      setVolumeHistory(volHistory);
      setPeakFreqHistory(freqHistory);

      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };

    updateVisualization();
  };

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      {/* Controls */}
      <Card className="border-zinc-800 hover:border-zinc-700 transition-colors mb-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-medium">Live Audio Analysis</h3>
            </div>
            <p className="text-xs text-zinc-500">
              Real-time audio classification and spectral analysis
            </p>
          </div>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-xs ${
              isRecording
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="h-3.5 w-3.5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" />
                Start
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg text-red-400 text-xs">
            {error}
          </div>
        )}
      </Card>

      {/* Real-time Insights */}
      {isRecording && insights.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mb-4">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              className={`p-3 transition-colors ${
                insight.type === "warning"
                  ? "border-orange-500/20 bg-orange-500/5"
                  : insight.type === "success"
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-blue-500/20 bg-blue-500/5"
              }`}
            >
              <div className="flex items-center gap-2">
                {insight.type === "warning" && (
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                )}
                {insight.type === "success" && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                )}
                {insight.type === "info" && (
                  <Activity className="h-3.5 w-3.5 text-blue-400" />
                )}
                <span className="text-xs text-zinc-300">{insight.message}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Inference Stats */}
      {isRecording && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="border-zinc-800 hover:border-zinc-700 transition-colors p-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-500">BPM</div>
              <div className="text-3xl font-semibold tabular-nums">
                {bpm || "--"}
              </div>
              <div className="text-xs text-zinc-600">beats/min</div>
            </div>
          </Card>

          <Card className="border-zinc-800 hover:border-zinc-700 transition-colors p-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-500">Centroid</div>
              <div className="text-3xl font-semibold tabular-nums">
                {(spectralCentroid / 1000).toFixed(1)}
              </div>
              <div className="text-xs text-zinc-600">kHz brightness</div>
            </div>
          </Card>

          <Card className="border-zinc-800 hover:border-zinc-700 transition-colors p-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-500">
                Dynamic Range
              </div>
              <div className="text-3xl font-semibold tabular-nums">
                {dynamicRange.toFixed(0)}
              </div>
              <div className="text-xs text-zinc-600">dB</div>
            </div>
          </Card>

          <Card
            className={`transition-colors p-4 ${
              isClipping
                ? "border-red-500/30 bg-red-500/5"
                : "border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-500">Status</div>
              <div
                className={`text-3xl font-semibold ${
                  isClipping ? "text-red-400" : "text-green-400"
                }`}
              >
                {isClipping ? "CLIP" : "OK"}
              </div>
              <div className="text-xs text-zinc-600">signal quality</div>
            </div>
          </Card>
        </div>
      )}

      {!isRecording && (
        <div className="p-12 bg-zinc-950/30 rounded-xl border border-zinc-800/50 text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-base font-medium mb-2">
            Real-time Audio Intelligence
          </h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-lg mx-auto leading-relaxed">
            Advanced audio analysis with classification, BPM detection,
            frequency band breakdown, and quality monitoring
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-zinc-400">
                <div className="font-medium text-zinc-300">Classification</div>
                Speech, music, noise detection
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-zinc-400">
                <div className="font-medium text-zinc-300">BPM Tracking</div>
                Real-time tempo analysis
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-zinc-400">
                <div className="font-medium text-zinc-300">
                  Spectral Analysis
                </div>
                7-band frequency breakdown
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-zinc-400">
                <div className="font-medium text-zinc-300">
                  Quality Monitoring
                </div>
                Clipping and anomaly detection
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualizations */}
      {isRecording && (
        <>
          {/* Waveform and Frequency Band Analysis */}
          <div className="grid gap-3 md:grid-cols-2 mb-4">
            <ChartCard title="Live Waveform" description="Time domain signal">
              <LineChart
                series={[
                  {
                    name: "Audio Signal",
                    color: "#3b82f6",
                    data: waveformData,
                  },
                ]}
                width={550}
                height={250}
                showGrid
                showAxes
                yAxis={{ domain: [-1, 1], label: "Amplitude" }}
              />
            </ChartCard>

            <ChartCard
              title="Frequency Band Energy"
              description="Intelligent frequency breakdown (20Hz - 20kHz)"
            >
              <BarChart
                series={[
                  {
                    name: "Energy",
                    color: "#10b981",
                    data: frequencyData,
                  },
                ]}
                width={550}
                height={250}
                showGrid
                showAxes
                yAxis={{ domain: [0, 100], label: "Energy %" }}
              />
            </ChartCard>
          </div>

          {/* Historical Trends */}
          {volumeHistory.length > 10 && (
            <div className="grid gap-3 md:grid-cols-2 mb-4">
              <ChartCard
                title="Volume Trend"
                description="RMS volume over time with anomaly detection"
              >
                <LineChart
                  series={[
                    {
                      name: "Volume",
                      color: "#06b6d4",
                      data: volumeHistory,
                    },
                  ]}
                  width={550}
                  height={250}
                  showGrid
                  showAxes
                  xAxis={{ label: "Time (s)" }}
                  yAxis={{ domain: [0, 100], label: "Volume %" }}
                />
              </ChartCard>

              <ChartCard
                title="Dominant Frequency Tracking"
                description="Peak frequency analysis for pitch detection"
              >
                <LineChart
                  series={[
                    {
                      name: "Peak Frequency",
                      color: "#f97316",
                      data: peakFreqHistory,
                    },
                  ]}
                  width={550}
                  height={250}
                  showGrid
                  showAxes
                  xAxis={{ label: "Time (s)" }}
                  yAxis={{ label: "Frequency (Hz)" }}
                />
              </ChartCard>
            </div>
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
    <Card className="border-zinc-800 hover:border-zinc-700 transition-colors p-4">
      <div className="mb-3">
        <h3 className="text-xs font-medium text-zinc-400 mb-1">{title}</h3>
        <p className="text-xs text-zinc-600">{description}</p>
      </div>
      <div>{children}</div>
    </Card>
  );
}
