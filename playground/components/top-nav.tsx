import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleLogo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";

export const TopNav = () => {
  return (
    <div className="flex-shrink-0 flex flex-row w-full items-center justify-between gap-4 px-6 h-14 bg-background">
      <div className="flex items-center gap-2 ml-2">
        <Link href="/">
          <SimpleLogo className="w-5 h-5" />
        </Link>
        <Link href="/docs">
          <Button variant="ghost" size="sm">
            Documentation
          </Button>
        </Link>
        <Link href="/components">
          <Button variant="ghost" size="sm">
            Components
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Input type="text" placeholder="Search..." className="w-64" />
        <ThemeToggle />
      </div>
    </div>
  );
};
