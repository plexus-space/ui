"use client";

import Link from "next/link";
import Image from "next/image";

const components = [
  {
    id: "earth",
    name: "Earth",
    category: "Planetary Bodies",
  },
  {
    id: "mars",
    name: "Mars",
    category: "Planetary Bodies",
  },
  {
    id: "mercury",
    name: "Mercury",
    category: "Planetary Bodies",
  },
  {
    id: "venus",
    name: "Venus",
    category: "Planetary Bodies",
  },
  {
    id: "moon",
    name: "Moon",
    category: "Planetary Bodies",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    category: "Planetary Bodies",
  },
  {
    id: "saturn",
    name: "Saturn",
    category: "Planetary Bodies",
  },
  {
    id: "uranus",
    name: "Uranus",
    category: "Planetary Bodies",
  },
  {
    id: "neptune",
    name: "Neptune",
    category: "Planetary Bodies",
  },
  {
    id: "orbital-path",
    name: "OrbitalPath",
    category: "Orbital Mechanics",
  },
  {
    id: "solar-system",
    name: "SolarSystem",
    category: "Systems",
  },
  {
    id: "line-chart",
    name: "LineChart",
    category: "Charts",
  },
  {
    id: "xy-plot",
    name: "XYPlot",
    category: "Charts",
  },
  {
    id: "polar-plot",
    name: "PolarPlot",
    category: "Charts",
  },
];

export default function Home() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-background">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-lg font-bold">Plexus UI</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-800 text-foreground"
            >
              Getting Started
            </Link>
            {["Planetary Bodies", "Orbital Mechanics", "Systems", "Charts"].map(
              (category) => (
                <div key={category}>
                  <div className="pt-4 mb-2 px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                    {category}
                  </div>
                  {components
                    .filter((c) => c.category === category)
                    .map((component) => (
                      <Link
                        key={component.id}
                        href={`/${component.id}`}
                        className="block px-3 py-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors"
                      >
                        {component.name}
                      </Link>
                    ))}
                </div>
              )
            )}

            <div className="pt-4 mb-2 px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
              Utilities
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-5xl mx-auto p-8 flex flex-col items-center">
          <h1 className="text-xl mb-4 text-foreground">Plexus UI</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-md mb-8">
            Primitive-based aerospace & physics component library
          </p>
          <Image src="/main.png" alt="Plexus UI" width={500} height={500} />

          {/* Installation */}
          <section className="mb-12">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Install cli and use it to add components to your project - get all
              the code
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 mb-2">
              <pre className="text-sm text-emerald-600 dark:text-emerald-400">
                npx @plexusui/cli init
              </pre>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4">
              <pre className="text-sm text-emerald-600 dark:text-emerald-400">
                npx @plexusui/cli add earth
              </pre>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
