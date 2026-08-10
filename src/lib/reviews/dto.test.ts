import { describe, expect, it } from "vitest";
import { assertNoAuthorId, toPublicReview } from "@/lib/reviews/dto";

describe("toPublicReview", () => {
  it("strips author_id from public payload", () => {
    const pub = toPublicReview({
      id: "11111111-1111-1111-1111-111111111111",
      author_id: "22222222-2222-2222-2222-222222222222",
      target_type: "organization",
      target_id: "33333333-3333-3333-3333-333333333333",
      season_year: 2024,
      score_overall: 5,
      score_demand: 4,
      would_recommend: true,
      tags: ["Great teaching"],
      written_feedback: "Solid season",
      status: "published",
      created_at: "2024-01-01T00:00:00Z",
    });

    expect(assertNoAuthorId(pub)).toBe(true);
    expect(pub).not.toHaveProperty("author_id");
    expect(pub.score_overall).toBe(5);
  });
});
