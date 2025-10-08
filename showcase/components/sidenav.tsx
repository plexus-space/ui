"use client";
import Link from "next/link";
import { components } from "@/constants/components";
import { useParams } from "next/navigation";

export const Sidenav = () => {
  const params = useParams();
  const componentId = params.component as string;
  return (
    <aside className="w-52 flex flex-col  h-screen overflow-hidden">
      <div className="p-4">
        <h1 className="text-lg font-bold">Plexus UI</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          <Link
            href="/"
            className="block px-3 py-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors"
          >
            Getting Started
          </Link>

          {["Planetary Bodies", "Orbital Mechanics", "Charts"].map(
            (category) => (
              <div key={category}>
                <div className="mt-6 mb-2 px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                  {category}
                </div>
                {components
                  .filter((comp) => comp.category === category)
                  .map((comp) => (
                    <Link
                      key={comp.id}
                      href={`/${comp.id}`}
                      className={`block px-3 py-2 rounded transition-colors ${
                        comp.id === componentId
                          ? "bg-zinc-200 dark:bg-zinc-800 text-foreground font-medium"
                          : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-foreground"
                      }`}
                    >
                      {comp.name}
                    </Link>
                  ))}
              </div>
            )
          )}
        </div>
      </nav>
    </aside>
  );
};
