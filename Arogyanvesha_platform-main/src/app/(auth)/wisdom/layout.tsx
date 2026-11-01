import type { Metadata } from "next";
export const metadata: Metadata = { title: "Wisdom Library", description: "Ancient Ayurvedic knowledge for modern life." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }