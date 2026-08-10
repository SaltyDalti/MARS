import { createClient } from "@/lib/supabase/server";
import { aggregateReviews } from "@/lib/reviews/aggregate";
import type { PublicReview, ReviewTargetType } from "@/types/database";

export async function getPublicReviewsForTarget(
  targetType: ReviewTargetType,
  targetId: string,
  page = 1,
  pageSize = 10,
) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("public_reviews")
    .select("*", { count: "exact" })
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const reviews = (data ?? []) as PublicReview[];
  return {
    reviews,
    total: count ?? 0,
    page,
    pageSize,
    aggregates: aggregateReviews(reviews),
  };
}

/** Aggregates across all published reviews for a target (not just current page) */
export async function getTargetAggregates(
  targetType: ReviewTargetType,
  targetId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_reviews")
    .select("score_overall, score_demand, would_recommend")
    .eq("target_type", targetType)
    .eq("target_id", targetId);

  if (error) throw new Error(error.message);
  return aggregateReviews(data ?? []);
}
