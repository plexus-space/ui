"use client";

import { CopyButton } from "@/components/copy-button";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-5xl text-foreground">
            The foundation for all future human-computer interaction for
            physical systems.
          </h1>
        </div>

        <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          A primitive-first, WebGPU-powered component library for medical,
          aerospace, defense, and autonomous systems. Built for real-time
          sensor fusion, HUD interfaces, and mission-critical visualization.
        </p>
      </div>
      {/* TODO amazing demo here */}

      {/* <div className="mb-12 flex flex-col gap-2">
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
              npx @plexusui/cli add hud
            </pre>
            <CopyButton hideText copyText={`npx @plexusui/cli hud`} />
          </div>
        </div>
      </div> */}

      <Footer />
    </div>
  );
}
