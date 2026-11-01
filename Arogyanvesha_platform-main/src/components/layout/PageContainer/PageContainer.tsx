import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps {
  children: React.ReactNode;
  /** Limits content to reading width — used for Wisdom articles */
  narrow?: boolean;
  className?: string;
}

export function PageContainer({ children, narrow = false, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8",
        narrow ? "max-w-[680px]" : "max-w-[1280px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

PageContainer.displayName = "PageContainer";