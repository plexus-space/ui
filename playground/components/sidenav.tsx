"use client";
import Link from "next/link";
import { components } from "@/constants/components";
import { useParams } from "next/navigation";
import { Logo, SimpleLogo } from "./logo";
import { Button } from "./ui/button";

export const Sidenav = () => {
  const params = useParams();
  const componentId = params.component as string;
  return (
    <aside className="w-52 flex-shrink-0  bg-background overflow-y-auto">
      <nav className="p-4 pt-6">
        <div className="space-y-1">
          {["Planetary Bodies", "Orbital Mechanics", "Charts"].map(
            (category) => (
              <div key={category}>
                <div className="mt-6 mb-2 px-3 text-xs font-geist-mono uppercase font-semibold text-zinc-400 dark:text-zinc-600 ">
                  {category}
                </div>
                <div className="flex flex-col gap-1">
                  {components
                    .filter((comp) => comp.category === category)
                    .map((comp) => (
                      <Link
                        key={comp.id}
                        href={`/${comp.id}`}
                        className="w-full"
                      >
                        <Button
                          variant="ghost"
                          className={`${
                            comp.id === componentId
                              ? "bg-zinc-200 dark:bg-zinc-800"
                              : ""
                          } cursor-pointer`}
                          size="sm"
                        >
                          {comp.name}
                        </Button>
                      </Link>
                    ))}
                </div>
              </div>
            )
          )}
        </div>
      </nav>
    </aside>
  );
};
