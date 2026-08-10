import type { PublicReview } from "@/types/database";

export type ReviewAggregateInput = Pick<
  PublicReview,
  "score_overall" | "score_demand" | "would_recommend"
>;

export type ReviewAggregates = {
  count: number;
  avgOverall: number | null;
  avgDemand: number | null;
  recommendPercent: number | null;
};

export function aggregateReviews(
  reviews: ReviewAggregateInput[],
): ReviewAggregates {
  const count = reviews.length;
  if (count === 0) {
    return {
      count: 0,
      avgOverall: null,
      avgDemand: null,
      recommendPercent: null,
    };
  }

  const sumOverall = reviews.reduce((acc, r) => acc + r.score_overall, 0);
  const sumDemand = reviews.reduce((acc, r) => acc + r.score_demand, 0);
  const recommendCount = reviews.filter((r) => r.would_recommend).length;

  return {
    count,
    avgOverall: round1(sumOverall / count),
    avgDemand: round1(sumDemand / count),
    recommendPercent: Math.round((recommendCount / count) * 100),
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
