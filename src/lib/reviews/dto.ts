import type { PublicReview, ReviewStatus, ReviewTargetType } from "@/types/database";

/** Row shape that must never be sent to public clients */
export type ReviewRowWithAuthor = PublicReview & {
  author_id?: string;
};

export function toPublicReview(
  row: ReviewRowWithAuthor & {
    status: ReviewStatus;
    target_type: ReviewTargetType;
  },
): PublicReview {
  return {
    id: row.id,
    target_type: row.target_type,
    target_id: row.target_id,
    season_year: row.season_year,
    score_overall: row.score_overall,
    score_demand: row.score_demand,
    would_recommend: row.would_recommend,
    tags: row.tags,
    written_feedback: row.written_feedback,
    status: row.status,
    created_at: row.created_at,
  };
}

export function assertNoAuthorId(payload: object): boolean {
  return !Object.prototype.hasOwnProperty.call(payload, "author_id");
}
