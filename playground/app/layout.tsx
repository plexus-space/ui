import type { Metadata } from "next";
import "./globals.css";
import { Geist, Open_Sans, Space_Grotesk } from "next/font/google";
import { Providers } from "@/app/providers";
import { Sidenav } from "@/components/sidenav";
import { TopNav } from "@/components/top-nav";

export const metadata: Metadata = {
  title: "Plexus UI - Playground",
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
    title: "Plexus UI - Playground",
    description:
      "Primitive-based aerospace component library for React Three Fiber",
    type: "website",
  },
};

const geist = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="flex flex-col h-screen w-screen overflow-hidden">
            <TopNav />
            <div className="flex flex-1 overflow-hidden">
              <Sidenav />
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
