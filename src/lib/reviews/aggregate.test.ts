import { describe, expect, it } from "vitest";
import { aggregateReviews } from "@/lib/reviews/aggregate";

describe("aggregateReviews", () => {
  it("returns nulls for empty list", () => {
    expect(aggregateReviews([])).toEqual({
      count: 0,
      avgOverall: null,
      avgDemand: null,
      recommendPercent: null,
    });
  });

  it("averages scores and recommend percent", () => {
    const result = aggregateReviews([
      { score_overall: 5, score_demand: 4, would_recommend: true },
      { score_overall: 3, score_demand: 2, would_recommend: false },
      { score_overall: 4, score_demand: 3, would_recommend: true },
    ]);
    expect(result.count).toBe(3);
    expect(result.avgOverall).toBe(4);
    expect(result.avgDemand).toBe(3);
    expect(result.recommendPercent).toBe(67);
  });
});
