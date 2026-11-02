import Link from "next/link";
import { PoseReferenceImage } from "@/components/yoga/PoseReferenceImage";
import { YOGA_POSES } from "@/lib/yogaPoses";

export function YogaPoseLibrary() {
  return (
    <section aria-labelledby="pose-library-heading" className="mt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label font-semibold uppercase tracking-wider text-brand-burgundy">
            Learn at your own pace
          </p>
          <h2
            id="pose-library-heading"
            className="mt-1 text-h2 font-display font-bold text-text-heading"
          >
            Explore the pose library
          </h2>
          <p className="mt-2 max-w-2xl text-body-sm text-text-muted">
            Clear instructions, beginner options, and a private in-browser
            alignment check for each pose.
          </p>
        </div>
        <Link
          href="/yoga/progress"
          className="w-fit rounded-lg px-1 py-2 text-body-sm font-semibold text-brand-burgundy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold"
        >
          View yoga progress
        </Link>
      </div>

      <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4">
        {YOGA_POSES.map((pose) => (
          <li key={pose.id}>
            <Link
              href={`/yoga/poses/${pose.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-card transition hover:-translate-y-0.5 hover:border-brand-gold hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-sage">
                <PoseReferenceImage
                  pose={pose}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-label font-medium text-text-muted">
                  {pose.sanskrit} · {pose.difficulty}
                </p>
                <h3 className="mt-1 text-h4 font-semibold text-text-heading">
                  {pose.english}
                </h3>
                <p className="mt-2 line-clamp-2 text-body-sm text-text-muted">
                  {pose.summary}
                </p>
                <span className="mt-auto pt-4 text-body-sm font-semibold text-brand-burgundy">
                  View instructions & practice <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
