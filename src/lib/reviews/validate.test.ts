import { describe, expect, it } from "vitest";
import { validateCreateReview } from "@/lib/reviews/validate";

const base = {
  target_type: "organization" as const,
  target_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  season_year: 2024,
  score_overall: 4,
  score_demand: 3,
  would_recommend: true,
  tags: ["Great teaching"],
  written_feedback: "Good",
};

describe("validateCreateReview", () => {
  it("accepts a valid payload", () => {
    const result = validateCreateReview(base, 2026);
    expect(result.ok).toBe(true);
  });

  it("rejects more than 3 tags", () => {
    const result = validateCreateReview(
      {
        ...base,
        tags: [
          "Great teaching",
          "High demand",
          "Supportive culture",
          "Worth the cost",
        ],
      },
      2026,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects out-of-range scores", () => {
    const result = validateCreateReview(
      { ...base, score_overall: 6 },
      2026,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects invalid tags", () => {
    const result = validateCreateReview(
      { ...base, tags: ["Not a real tag"] },
      2026,
    );
    expect(result.ok).toBe(false);
  });
});
