import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Arogyanvesha — Your Ayurvedic Health Companion",
    template: "%s | Arogyanvesha",
  },
  description:
    "Discover your Prakriti and explore personalised Ayurvedic wellness with AI-powered guidance.",
  keywords: ["Ayurveda", "Prakriti", "holistic health", "wellness", "Dosha"],
  authors: [{ name: "Arogyanvesha" }],
  creator: "Arogyanvesha",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),

  // Arogyanvesha favicon and browser-tab icon
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Arogyanvesha",
    title: "Arogyanvesha — Your Ayurvedic Health Companion",
    description:
      "Discover your Prakriti and explore personalised Ayurvedic wellness with AI-powered guidance.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FEFCF8" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1A12" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );}