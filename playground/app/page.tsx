"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          Aerospace. Physics. Deep Tech. UI Components
        </h1>
        <p className="max-w-2xl text-zinc-600 font-geist-mono dark:text-zinc-400 mb-4">
          A set of purposefully designed components that you can customize,
          extend, and build on. Start here then make it your own. Open Source.
          Open Code.
        </p>
        <Image src="/main.png" alt="Plexus UI Logo" width={100} height={100} />
      </div>
      {/* TODO: Add components grid */}
      {/* show real components rendered here */}
      {/* allow the change theme from mono to scaled to normal and allow default color and then a green color */}
    </div>
  );
}
