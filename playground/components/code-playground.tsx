"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

interface CodePlaygroundProps {
  initialCode: string;
  language?: string;
  title?: string;
}

export default function CodePlayground({
  initialCode,
  title = "Code",
}: CodePlaygroundProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(initialCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className=" bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="flex justify-end bg-zinc-200/50 dark:bg-black/30">
        <CopyButton copyText={initialCode} />
      </div>

      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-zinc-700 dark:text-zinc-300 font-mono">
          {initialCode}
        </code>
      </pre>
    </div>
  );
}
