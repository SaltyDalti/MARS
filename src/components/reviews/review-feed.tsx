import { getPublicReviewsForTarget } from "@/lib/reviews/queries";
import { ReviewCard } from "@/components/reviews/review-card";
import type { ReviewTargetType } from "@/types/database";
import Link from "next/link";

type ReviewFeedProps = {
  targetType: ReviewTargetType;
  targetId: string;
  page?: number;
};

export async function ReviewFeed({
  targetType,
  targetId,
  page = 1,
}: ReviewFeedProps) {
  const { reviews, total, pageSize } = await getPublicReviewsForTarget(
    targetType,
    targetId,
    page,
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const basePath =
    targetType === "organization"
      ? `/organizations/${targetId}`
      : targetType === "staff"
        ? `/staff/${targetId}`
        : `/housing/${targetId}`;

  if (!reviews.length) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        No published reviews yet.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <div className="divide-y-0">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      {totalPages > 1 ? (
        <div className="mt-6 flex items-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={`${basePath}?page=${page - 1}`}
              className="underline underline-offset-4"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`${basePath}?page=${page + 1}`}
              className="underline underline-offset-4"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
