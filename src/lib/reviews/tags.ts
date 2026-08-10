export const REVIEW_TAGS = [
  "Great teaching",
  "High demand",
  "Supportive culture",
  "Poor communication",
  "Toxic environment",
  "Worth the cost",
  "Disorganized",
  "Clear expectations",
] as const;

export type ReviewTag = (typeof REVIEW_TAGS)[number];

export function isReviewTag(value: string): value is ReviewTag {
  return (REVIEW_TAGS as readonly string[]).includes(value);
}
