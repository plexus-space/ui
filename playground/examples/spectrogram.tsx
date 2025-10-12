import { useMemo } from "react";
import { ComponentPreview } from "@/components/component-preview";
import {
  Spectrogram,
  SpectrogramDataPoint,
} from "@plexusui/components/spectrogram";
import { seededRandom } from "./data";

export const SpectrogramExamples = () => {
  const spectrogramData = useMemo(() => {
    const random = seededRandom(42);
    const points: SpectrogramDataPoint[] = [];

    for (let t = 0; t < 100; t++) {
      for (let f = 0; f < 128; f++) {
        const freq = f * 40; // 0 to 5120 Hz
        const time = t * 0.05; // 0 to 5 seconds

        // Create a chirp signal (frequency increases over time)
        const chirpFreq = 300 + time * 800; // 300Hz to 4300Hz
        const chirpMag = Math.exp(-Math.pow((freq - chirpFreq) / 150, 2)) * 80;

        // Add harmonics
        const harmonic1 = Math.exp(-Math.pow((freq - 1200) / 200, 2)) * 40;
        const harmonic2 = Math.exp(-Math.pow((freq - 2400) / 180, 2)) * 25;

        // Background noise
        const noise = random() * 2;

        // Time-varying amplitude modulation
        const envelope = 0.5 + 0.5 * Math.sin(time * 2 * Math.PI * 0.5);

        const magnitude = (chirpMag + harmonic1 + harmonic2) * envelope + noise;

        points.push({ time, frequency: freq, magnitude });
      }
    }

    return points;
  }, []);

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Chirp Signal Spectrogram"
        description="Time-frequency representation showing a chirp signal (frequency sweep from 300Hz to 4300Hz) with harmonics at 1200Hz and 2400Hz. The color intensity represents signal magnitude with amplitude modulation creating the pulsing pattern."
        preview={
          <div className="w-full">
            <Spectrogram.Root
              data={spectrogramData}
              timeAxis={{ label: "Time (s)" }}
              frequencyAxis={{ label: "Frequency (Hz)" }}
              colorScale="inferno"
              magnitudeScale="linear"
              height={450}
            >
              <Spectrogram.Container>
                <Spectrogram.Viewport>
                  <Spectrogram.Heatmap />
                  <Spectrogram.Axes />
                  <Spectrogram.ColorBar />
                  <Spectrogram.Tooltip />
                </Spectrogram.Viewport>
              </Spectrogram.Container>
            </Spectrogram.Root>
          </div>
        }
        code={`<Spectrogram.Root
  data={spectrogramData}
  timeAxis={{ label: "Time (s)" }}
  frequencyAxis={{ label: "Frequency (Hz)" }}
  colorScale="inferno"
  magnitudeScale="linear"
>
  <Spectrogram.Container>
    <Spectrogram.Viewport>
      <Spectrogram.Heatmap />
      <Spectrogram.Axes />
      <Spectrogram.ColorBar />
      <Spectrogram.Tooltip />
    </Spectrogram.Viewport>
  </Spectrogram.Container>
</Spectrogram.Root>`}
      />
    </div>
  );
};

export { spectrogramApiProps as SpectrogramApiReference } from "./api/spectrogram";
