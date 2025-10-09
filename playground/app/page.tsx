"use client";

import Image from "next/image";
import Link from "next/link";

const components = [
  {
    name: "earth",
    title: "Earth",
    description: "Earth with rotation, atmosphere, and clouds",
    category: "3D Planetary",
  },
  {
    name: "mars",
    title: "Mars",
    description: "Mars with surface features",
    category: "3D Planetary",
  },
  {
    name: "orbital-path",
    title: "Orbital Path",
    description: "Keplerian orbital path visualization",
    category: "Orbital Mechanics",
  },
  {
    name: "solar-system",
    title: "Solar System",
    description: "Complete solar system with all planets",
    category: "3D Planetary",
  },
  {
    name: "line-chart",
    title: "Line Chart",
    description: "Multi-series line chart with zoom support",
    category: "Charts",
  },
  {
    name: "scatter-plot",
    title: "Scatter Plot",
    description: "XY scatter plot with trendlines",
    category: "Charts",
  },
  {
    name: "polar-plot",
    title: "Polar Plot",
    description: "Radar and polar plots",
    category: "Charts",
  },
  {
    name: "heatmap",
    title: "Heatmap",
    description: "2D heatmap with scientific colormaps",
    category: "Charts",
  },
];

const categories = ["3D Planetary", "Orbital Mechanics", "Charts"];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-6xl text-foreground">Plexus UI</h1>
          <Image src="/main.png" alt="Plexus UI Logo" width={80} height={80} />
        </div>
        <p className="text-2xl text-zinc-600 dark:text-zinc-400 mb-4">
          Aerospace. Physics. Deep Tech.
        </p>
        <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Copy the code, customize it, and build your own mission control
          dashboards, orbital mechanics visualizations, and data analysis tools.
        </p>
        <div className="flex gap-4">
          <a
            href="https://github.com/plexus-space/ui"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            View on GitHub
          </a>
          <button className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Get Started
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="inline-flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg mb-6">
          <button className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-md text-sm font-medium shadow-sm">
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className="px-4 py-2 rounded-md text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((component) => (
          <Link
            key={component.name}
            href={`/component/${component.name}`}
            className="block p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {component.title}
              </h3>
              <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded text-zinc-600 dark:text-zinc-400">
                {component.category}
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
              {component.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span>View component →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <div className="space-y-4">
          <div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-2">
              1. Initialize your project
            </p>
            <code className="block bg-zinc-900 dark:bg-black text-white px-4 py-2 rounded font-mono text-sm">
              npx @plexusui/cli init
            </code>
          </div>
          <div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-2">
              2. Add components
            </p>
            <code className="block bg-zinc-900 dark:bg-black text-white px-4 py-2 rounded font-mono text-sm">
              npx @plexusui/cli add earth mars orbital-path
            </code>
          </div>
          <div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-2">
              3. Use them in your app
            </p>
            <code className="block bg-zinc-900 dark:bg-black text-white px-4 py-2 rounded font-mono text-sm whitespace-pre">
              {`import { Earth } from '@/components/plexusui/earth'

export default function App() {
  return <Earth />
}`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
