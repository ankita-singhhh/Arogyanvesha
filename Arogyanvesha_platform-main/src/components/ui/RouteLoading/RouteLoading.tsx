import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

export function RouteLoading({ variant = "card" as const }: { variant?: "card" | "list" | "text" }) {
  return (
    <div className="max-w-[1320px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SkeletonLoader variant={variant} />
        <SkeletonLoader variant={variant} />
        <SkeletonLoader variant={variant} />
      </div>
    </div>
  );
}