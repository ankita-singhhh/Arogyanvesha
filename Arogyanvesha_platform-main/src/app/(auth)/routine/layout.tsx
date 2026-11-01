import type { Metadata } from "next";
export const metadata: Metadata = { title: "Daily Routine", description: "Track your Dinacharya practices." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }