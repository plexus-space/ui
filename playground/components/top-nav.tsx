import { Button } from "@/components/ui/button";
import { SimpleLogo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { ColorSchemeToggle } from "./color-scheme-toggle";
import Link from "next/link";
import { Github } from "lucide-react";

export const TopNav = () => {
  return (
    <div className="flex-shrink-0 flex flex-row w-full items-center justify-between gap-4 px-6 h-14 bg-background">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <SimpleLogo className="w-5 h-5" />
          Plexus
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/components"
            className="hover:text-foreground/80 transition-colors"
          >
            Components
          </Link>
          <Link
            href="/docs"
            className="hover:text-foreground/80 transition-colors"
          >
            Docs
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <ColorSchemeToggle />
        <ThemeToggle />
        <Link
          href="https://github.com/plexus-space/ui"
          className="cursor-pointer"
          target="_blank"
        >
          <Button variant="ghost" size="sm">
            <Github />
          </Button>
        </Link>
      </div>
    </div>
  );
};
