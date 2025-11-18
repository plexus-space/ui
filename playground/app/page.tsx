"use client";

import { Footer } from "@/components/footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-5xl text-foreground">
            Simplifying human-computer interaction for hardware.
          </h1>
        </div>

        <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          A primitive-first, WebGPU-accelerated component library for physical
          systems.
        </p>
      </div>

      <Footer />
    </div>
  );
}
