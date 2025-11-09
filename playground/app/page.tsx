"use client";

import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { Footer } from "@/components/footer";

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
          A primitive-first, WebGPU-powered component library for medical,
          aerospace, defense, and robotic systems.
        </p>
      </div>

      <div className="mb-12 flex flex-col gap-2">
        <h1 className="text-4xl mb-4">Documentation</h1>
        <p className="text-zinc-600  dark:text-zinc-400 mb-4">
          Install cli and use it to add components to your project - get all the
          code
        </p>
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md p-2">
          <div className="flex items-center justify-between gap-2">
            <pre className="text-sm font-geist-mono text-emerald-600 dark:text-emerald-400">
              npx @plexusui/cli init
            </pre>
            <CopyButton hideText copyText={`npx @plexusui/cli init`} />
          </div>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md p-2">
          <div className="flex items-center justify-between gap-2">
            <pre className="text-sm font-geist-mono text-emerald-600 dark:text-emerald-400">
              npx @plexusui/cli add chart
            </pre>
            <CopyButton hideText copyText={`npx @plexusui/cli add chart`} />
          </div>
        </div>
      </div>

      <div className="mb-12 flex flex-col gap-2">
        <h1 className="text-4xl mb-4">Live Demos</h1>
        <p className="text-zinc-600  dark:text-zinc-400 mb-4">
          Explore interactive examples of WebGPU-powered components
        </p>
        <Link
          href="/chart-demo"
          className="group bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md p-4 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                WebGPU Chart System
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                High-performance real-time telemetry visualization with automatic downsampling
              </p>
            </div>
            <svg
              className="w-6 h-6 text-zinc-400 group-hover:text-emerald-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      </div>

      <Footer />
    </div>
  );
}
