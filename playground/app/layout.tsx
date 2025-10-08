import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { Providers } from "@/app/providers";
import { Sidenav } from "@/components/sidenav";
import { TopNav } from "@/components/top-nav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plexus UI Aerospace - Component Showcase",
  description:
    "Primitive-based aerospace & physics component library for React Three Fiber. Build stunning 3D planetary visualizations and aerospace UI with composable primitives.",
  keywords: [
    "aerospace",
    "react-three-fiber",
    "3d",
    "visualization",
    "physics",
    "orbital-mechanics",
    "planets",
    "ui-components",
    "primitives",
  ],
  authors: [{ name: "Plexus UI" }],
  openGraph: {
    title: "Plexus UI Aerospace - Component Showcase",
    description:
      "Primitive-based aerospace component library for React Three Fiber",
    type: "website",
  },
};

const arima = Geist({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const jgs = localFont({
  weight: "200",
  src: "../public/fonts/jgs_Font.ttf",
  variable: "--font-jgs",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${arima.className} ${jgs.variable} antialiased`}>
        <Providers>
          <div className="flex flex-col h-screen w-screen overflow-hidden">
            {/* Top navigation spans full width */}
            <TopNav />

            {/* Bottom section with sidenav and content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidenav */}
              <Sidenav />

              {/* Main content */}
              <main className="flex-1 overflow-y-auto bg-background">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
