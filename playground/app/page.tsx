"use client";

import { Footer } from "@/components/footer";
import { CameraShake } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Particles } from "@/components/particles";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme } = useTheme();

  const props = {
    curl: 0.5,
    focus: 5.1,
    fov: 50,
    aperture: 4.8,
    speed: 9.4,
    color: theme === "dark" ? "#ffffff" : "#000000",
  };

  return (
    <div className="relative w-full h-screen">
      <div
        className="relative z-10 max-w-5xl mx-auto px-8 pt-12 pb-0
       pointer-events-none"
      >
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-5xl text-foreground">
              Simplifying human-computer interaction for hardware.
            </h1>
          </div>

          <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            A primitive-first, WebGPU-powered component library for physical
            systems.
          </p>
        </div>
      </div>
      <div className="relative h-[500px]">
        <Canvas camera={{ position: [0, 0, 5], fov: 40 }} gl={{ alpha: true }}>
          <CameraShake
            yawFrequency={1}
            maxYaw={0.05}
            pitchFrequency={1}
            maxPitch={0.05}
            rollFrequency={0.5}
            maxRoll={0.5}
            intensity={0.2}
          />
          <Particles {...props} />
        </Canvas>
      </div>
      <Footer />
    </div>
  );
}
