'use client'

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidenav } from "@/components/sidenav";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen overflow-hidden">
        <Sidenav />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ThemeToggle />
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
