import type { Metadata } from "next";
export const metadata: Metadata = { title: "Yoga & Wellness", description: "Personalised yoga sessions for your Dosha." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }