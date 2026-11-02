import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Yoga & Wellness",
  description:
    "Pose-by-pose yoga guidance, private in-browser alignment checks, and guided wellness sessions.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }