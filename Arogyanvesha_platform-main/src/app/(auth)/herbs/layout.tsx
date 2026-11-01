import type { Metadata } from "next";
export const metadata: Metadata = { title: "Herb Encyclopedia", description: "Published educational Ayurvedic herb references." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
