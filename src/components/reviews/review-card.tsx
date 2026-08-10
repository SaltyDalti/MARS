import type { PublicReview } from "@/types/database";

type ReviewCardProps = {
  review: PublicReview;
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="border-b border-border py-5 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-sm font-medium">
          Overall {review.score_overall}/5 · Demand {review.score_demand}/5
        </p>
        <p className="text-xs text-muted-foreground">
          Season {review.season_year}
          {review.would_recommend ? " · Recommends" : " · Does not recommend"}
        </p>
      </div>
      {review.tags?.length ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <li
              key={tag}
              className="text-xs text-muted-foreground underline-offset-2"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      {review.written_feedback ? (
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">
          {review.written_feedback}
        </p>
      ) : null}
    </article>
  );
}
