import { MeshGradientComponent } from "@/components/MeshGradient";
import { MusicPlayer } from "@/components/MusicPlayer";
import { RouteTransitionSync } from "@/components/RouteTransitionSync";
import { settings } from "@/lib/settings";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ExternalLinks, Navigation } from "../components/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || "https://yiannismorfos.com"),
  title: {
    default: "Yiannis Morfos – Creative Full‑Stack & Animation Engineer",
    template: "%s | Yiannis Morfos",
  },
  description:
    "Portfolio of Yiannis Morfos – full‑stack & animation-focused engineer crafting polished interactive experiences with TypeScript, Next.js, motion & 3D.",
  openGraph: {
    title: "Yiannis Morfos – Creative Full‑Stack & Animation Engineer",
    description:
      "Explore projects, interactive experiments, and approach to high-quality product engineering & motion craftsmanship.",
    url: "/",
    siteName: "Yiannis Morfos",
    images: [
      {
        url: "/me.png",
        width: 800,
        height: 800,
        alt: "Yiannis Morfos",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yiannis Morfos – Creative Full‑Stack & Animation Engineer",
    description:
      "Full‑stack & animation engineering portfolio: Next.js, TypeScript, motion, 3D & experience design.",
    images: ["/me.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload portrait image globally so it's cached before visiting /hello */}
        <link rel="preload" as="image" href="/me.png" fetchPriority="high" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black h-dvh relative`}
      >
        <RouteTransitionSync />
        <MeshGradientComponent
          speed={settings.background.speed}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 0,
            width: "100%",
            height: "100%",
          }}
        />

        {/* Main content container with max-width constraint */}
        <main className="relative z-20 max-w-screen-2xl mx-auto h-dvh overflow-hidden flex flex-col">
          <div className="shrink-0">
            <Navigation />
          </div>
          <div className="text-white px-6 sm:px-10 lg:px-18 flex-1 min-h-0">
            {children}
          </div>

          {/* Global footer bar: music player on the left, external links on the right */}
          <div className="px-6 sm:px-10 lg:px-18 py-4 flex items-center justify-between shrink-0">
            <MusicPlayer />
            <ExternalLinks />
          </div>
        </main>
      </body>
    </html>
  );
}
