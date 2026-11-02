"use client";

import * as React from "react";
import Image from "next/image";
import type { YogaPoseDefinition } from "@/lib/yogaPoses";

export function PoseReferenceImage({
  pose,
  className,
}: {
  pose: YogaPoseDefinition;
  className: string;
}) {
  const [failedSource, setFailedSource] = React.useState<string | null>(null);

  if (failedSource === pose.image) {
    return (
      <div
        role="img"
        aria-label={`${pose.sanskrit} reference image unavailable`}
        className="flex h-full min-h-40 w-full items-center justify-center bg-surface-sage px-6 text-center text-body-sm text-text-muted"
      >
        Reference image unavailable
      </div>
    );
  }

  return (
    <Image
      src={pose.image}
      alt={pose.imageAlt}
      width={1200}
      height={900}
      sizes="(min-width: 1024px) 50vw, 100vw"
      className={className}
      onError={() => setFailedSource(pose.image)}
    />
  );
}
