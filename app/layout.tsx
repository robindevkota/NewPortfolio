import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Robin Devkota | Full Stack Engineer · AI Orchestration · SaaS",
  description:
    "Full Stack Engineer with 3+ years building production-grade SaaS platforms, hotel management systems, and AI-powered developer tools. 3 live products serving real users.",
  keywords: [
    "Robin Devkota",
    "Full Stack Engineer",
    "SaaS",
    "AI Orchestration",
    "Next.js",
    "React",
    "Nepal",
  ],
  openGraph: {
    title: "Robin Devkota — Mission Control",
    description:
      "Full Stack Engineer · AI Orchestration · 3 live production products.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
