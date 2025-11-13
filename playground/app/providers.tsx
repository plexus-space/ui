"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidenav } from "@/components/sidenav";
import { TopNav } from "@/components/top-nav";
import { ColorSchemeProvider } from "@/components/color-scheme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ColorSchemeProvider>{children}</ColorSchemeProvider>
    </ThemeProvider>
  );
}
