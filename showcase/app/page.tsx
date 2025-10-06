"use client";

import Link from "next/link";
import Image from "next/image";

const components = [
  {
    id: "earth",
    name: "Earth",
    package: "@plexusui/earth",
    category: "Planetary Bodies",
  },
  {
    id: "mars",
    name: "Mars",
    package: "@plexusui/mars",
    category: "Planetary Bodies",
  },
  {
    id: "mercury",
    name: "Mercury",
    package: "@plexusui/mercury",
    category: "Planetary Bodies",
  },
  {
    id: "venus",
    name: "Venus",
    package: "@plexusui/venus",
    category: "Planetary Bodies",
  },
  {
    id: "moon",
    name: "Moon",
    package: "@plexusui/moon",
    category: "Planetary Bodies",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    package: "@plexusui/jupiter",
    category: "Planetary Bodies",
  },
  {
    id: "saturn",
    name: "Saturn",
    package: "@plexusui/saturn",
    category: "Planetary Bodies",
  },
  {
    id: "uranus",
    name: "Uranus",
    package: "@plexusui/uranus",
    category: "Planetary Bodies",
  },
  {
    id: "neptune",
    name: "Neptune",
    package: "@plexusui/neptune",
    category: "Planetary Bodies",
  },
  {
    id: "gantt",
    name: "Gantt",
    package: "@plexusui/gantt",
    category: "Charts",
  },
  {
    id: "orbital-path",
    name: "OrbitalPath",
    package: "@plexusui/orbital-path",
    category: "Orbital Mechanics",
  },
  {
    id: "ground-track",
    name: "GroundTrack",
    package: "@plexusui/ground-track",
    category: "Orbital Mechanics",
  },
  {
    id: "trajectory",
    name: "Trajectory",
    package: "@plexusui/trajectory",
    category: "Orbital Mechanics",
  },
  {
    id: "transfer-orbit",
    name: "TransferOrbit",
    package: "@plexusui/transfer-orbit",
    category: "Orbital Mechanics",
  },
  {
    id: "lagrange-points",
    name: "LaGrangePoints",
    package: "@plexusui/lagrange-points",
    category: "Orbital Mechanics",
  },
];

export default function Home() {
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-950">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-lg font-bold">Plexus UI</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded bg-zinc-800 text-zinc-50"
            >
              Getting Started
            </Link>
            {["Planetary Bodies", "Orbital Mechanics", "Charts"].map(
              (category) => (
                <div key={category}>
                  <div className="pt-4 mb-2 px-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                    {category}
                  </div>
                  {components
                    .filter((c) => c.category === category)
                    .map((component) => (
                      <Link
                        key={component.id}
                        href={`/${component.id}`}
                        className="block px-3 py-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50 transition-colors"
                      >
                        {component.name}
                      </Link>
                    ))}
                </div>
              )
            )}

            <div className="pt-4 mb-2 px-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Utilities
            </div>
            <Link
              href="/orbital-math"
              className="block px-3 py-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50 transition-colors"
            >
              Orbital Math
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <div className="max-w-5xl mx-auto p-8 flex flex-col items-center">
          <h1 className="text-xl mb-4 text-zinc-50">Plexus UI</h1>
          <p className="text-zinc-400 text-md mb-8">
            Primitive-based aerospace & physics component library
          </p>
          <Image src="/main.png" alt="Plexus UI" width={500} height={500} />

          {/* Installation */}
          <section className="mb-12">
            <p className="text-zinc-400 mb-4">
              Install cli and use it to add components to your project - get all
              the code
            </p>
            <div className="bg-zinc-900 border border-zinc-800 p-4 mb-2">
              <pre className="text-sm text-emerald-400">
                npx @plexusui/cli init
              </pre>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4">
              <pre className="text-sm text-emerald-400">
                npx @plexusui/cli add earth
              </pre>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
