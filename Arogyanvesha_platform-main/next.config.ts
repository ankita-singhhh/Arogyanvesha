import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ── Turbopack ── */
  turbopack: {
    // Pin the workspace root so Next.js ignores the extra package-lock.json
    // in the parent folder (D:\arogyan\Arogyanvesha).
    root: process.cwd(),
  },

  /* ── Images ── */
  images: {
    // Domains we will load remote images from.
    // Add CDN / Cloudinary / Supabase Storage URLs here as the backend is built.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Serve modern formats automatically
    formats: ["image/avif", "image/webp"],
  },

  /* ── Security Headers ── */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },

  /* ── Redirects ── */
  async redirects() {
    return [
      // Redirect bare /home to the dashboard so the auth gate fires
      {
        source: "/home",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;