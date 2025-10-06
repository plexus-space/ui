import type { Metadata } from "next";
import "./globals.css";
import { Mulish } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

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

const arima = Mulish({
  subsets: ["latin"],
  weight: "200",
  display: "swap",
});

const jgs = localFont({
  weight: "200",
  src: "../public/fonts/jgs_Font.ttf",
  variable: "--font-jgs",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${arima.className} ${jgs.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
