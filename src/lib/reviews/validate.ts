import { isReviewTag, type ReviewTag } from "@/lib/reviews/tags";
import type { ReviewTargetType } from "@/types/database";

export type CreateReviewInput = {
  target_type: ReviewTargetType;
  target_id: string;
  season_year: number;
  score_overall: number;
  score_demand: number;
  would_recommend: boolean;
  tags: string[];
  written_feedback: string | null;
};

export type CreateReviewValidation =
  | { ok: true; data: CreateReviewInput & { tags: ReviewTag[] } }
  | { ok: false; error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateCreateReview(
  input: CreateReviewInput,
  nowYear = new Date().getFullYear(),
): CreateReviewValidation {
  if (input.target_type !== "organization" && input.target_type !== "staff") {
    return { ok: false, error: "Invalid target type." };
  }
  if (!UUID_RE.test(input.target_id)) {
    return { ok: false, error: "Invalid target id." };
  }
  if (
    !Number.isInteger(input.season_year) ||
    input.season_year < 1970 ||
    input.season_year > nowYear + 1
  ) {
    return { ok: false, error: "Invalid season year." };
  }
  if (
    !Number.isInteger(input.score_overall) ||
    input.score_overall < 1 ||
    input.score_overall > 5
  ) {
    return { ok: false, error: "Overall score must be 1–5." };
  }
  if (
    !Number.isInteger(input.score_demand) ||
    input.score_demand < 1 ||
    input.score_demand > 5
  ) {
    return { ok: false, error: "Demand score must be 1–5." };
  }
  const unique = [
    ...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean)),
  ];
  if (unique.length > 3) {
    return { ok: false, error: "Select at most 3 tags." };
  }
  if (!unique.every(isReviewTag)) {
    return { ok: false, error: "One or more tags are invalid." };
  }
  const feedback = input.written_feedback?.trim() || null;
  if (feedback && feedback.length > 5000) {
    return { ok: false, error: "Feedback is too long." };
  }

  return {
    ok: true,
    data: {
      ...input,
      tags: unique as ReviewTag[],
      written_feedback: feedback,
    },
  };
}
