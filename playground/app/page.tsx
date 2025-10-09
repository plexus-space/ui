"use client";

import { Footer } from "@/components/footer";
import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-5xl font-bold text-foreground">
            {" "}
            Aerospace. Physics. Deep Tech. Components
          </h1>
        </div>

        <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          A set of thoughtfully designed components that you can customize,
          extend, and build on. Start here then make it your own.
        </p>
        <Image src="/main.png" alt="Plexus UI Logo" width={200} height={200} />
      </div>

      <Footer />
    </div>
  );
}
