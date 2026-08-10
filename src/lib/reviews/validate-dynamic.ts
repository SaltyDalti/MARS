import {
  flattenBooleanFields,
  flattenScoreFields,
  isOrgActivityType,
  isReviewerRoleId,
  isSectionId,
  isStaffRevieweeRoleId,
  isStaffReviewerRelationId,
  resolveQuestionGroups,
  type OrgActivityType,
  type ReviewTargetKind,
  type ReviewerRoleId,
  type SectionId,
  type StaffRevieweeRoleId,
  type StaffReviewerRelationId,
} from "@/lib/reviews/master-config";

export type DynamicReviewInput = {
  target_type: ReviewTargetKind;
  target_id: string;
  season_year: number;
  activity_type?: OrgActivityType | null;
  reviewer_roles: ReviewerRoleId[];
  sections: SectionId[];
  staff_reviewee_role?: StaffRevieweeRoleId | null;
  staff_reviewer_relation?: StaffReviewerRelationId | null;
  responses: Record<string, number | boolean>;
  would_recommend: boolean;
  written_feedback: string | null;
  tags: string[];
};

export type DynamicReviewValidation =
  | {
      ok: true;
      data: DynamicReviewInput & {
        score_overall: number;
        score_demand: number;
      };
    }
  | { ok: false; error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateDynamicReview(
  input: DynamicReviewInput,
  nowYear = new Date().getFullYear(),
): DynamicReviewValidation {
  if (
    input.target_type !== "organization" &&
    input.target_type !== "staff" &&
    input.target_type !== "housing_site"
  ) {
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

  let roles = [...new Set(input.reviewer_roles)].filter(isReviewerRoleId);
  let sections = [...new Set(input.sections)].filter(isSectionId);
  let staff_reviewee_role =
    input.staff_reviewee_role && isStaffRevieweeRoleId(input.staff_reviewee_role)
      ? input.staff_reviewee_role
      : null;
  let staff_reviewer_relation =
    input.staff_reviewer_relation &&
    isStaffReviewerRelationId(input.staff_reviewer_relation)
      ? input.staff_reviewer_relation
      : null;

  if (input.target_type === "staff") {
    if (!staff_reviewee_role) {
      return {
        ok: false,
        error: "Select this individual’s primary role for the season.",
      };
    }
    if (!staff_reviewer_relation) {
      return {
        ok: false,
        error: "Select your role relative to them.",
      };
    }
    roles = [];
    sections = [];
  } else if (input.target_type === "organization") {
    if (roles.length === 0) {
      return { ok: false, error: "Select at least one role for this season." };
    }
    if (
      sections.includes("visual") &&
      !roles.includes("instructional_staff")
    ) {
      return {
        ok: false,
        error: "Visual section requires Instructional staff role.",
      };
    }
  }

  const activityType =
    input.target_type === "organization"
      ? input.activity_type && isOrgActivityType(input.activity_type)
        ? input.activity_type
        : null
      : null;

  if (input.target_type === "organization" && !activityType) {
    return { ok: false, error: "Organization activity type is required." };
  }

  const groups = resolveQuestionGroups({
    targetKind: input.target_type,
    activityType,
    roles,
    sections,
    staffRevieweeRole: staff_reviewee_role,
    staffReviewerRelation: staff_reviewer_relation,
  });

  const scoreFields = flattenScoreFields(groups);
  const boolFields = flattenBooleanFields(groups);

  if (scoreFields.length === 0 && boolFields.length === 0) {
    return { ok: false, error: "No questions resolved for this context." };
  }

  const responses: Record<string, number | boolean> = {};
  for (const field of scoreFields) {
    const value = Number(input.responses[field.id]);
    if (!Number.isInteger(value) || value < field.min || value > field.max) {
      return {
        ok: false,
        error: `Invalid score for “${field.label}” (need ${field.min}–${field.max}).`,
      };
    }
    responses[field.id] = value;
  }

  for (const field of boolFields) {
    const raw = input.responses[field.id];
    if (typeof raw !== "boolean") {
      return {
        ok: false,
        error: `Please answer “${field.label}”.`,
      };
    }
    responses[field.id] = raw;
  }

  const numericScores = Object.values(responses).filter(
    (v): v is number => typeof v === "number",
  );

  const score_overall =
    (typeof responses.score_overall === "number"
      ? responses.score_overall
      : undefined) ??
    (typeof responses.score_indiv_conduct === "number"
      ? responses.score_indiv_conduct
      : undefined) ??
    (typeof responses.score_site_quality === "number"
      ? responses.score_site_quality
      : undefined) ??
    numericScores[0] ??
    3;

  const score_demand =
    (typeof responses.score_perf_demand === "number"
      ? responses.score_perf_demand
      : undefined) ??
    (typeof responses.score_environment === "number"
      ? responses.score_environment
      : undefined) ??
    (typeof responses.score_indiv_comm === "number"
      ? responses.score_indiv_comm
      : undefined) ??
    score_overall;

  const would_recommend =
    typeof responses.score_indiv_recommend === "boolean"
      ? responses.score_indiv_recommend
      : input.would_recommend;

  const feedback = input.written_feedback?.trim() || null;
  if (feedback && feedback.length > 5000) {
    return { ok: false, error: "Feedback is too long." };
  }

  const tags = [...new Set(input.tags.map((t) => t.trim()).filter(Boolean))];
  if (tags.length > 3) {
    return { ok: false, error: "Select at most 3 tags." };
  }

  return {
    ok: true,
    data: {
      target_type: input.target_type,
      target_id: input.target_id,
      season_year: input.season_year,
      activity_type: activityType,
      reviewer_roles: roles,
      sections,
      staff_reviewee_role,
      staff_reviewer_relation,
      responses,
      would_recommend,
      written_feedback: feedback,
      tags,
      score_overall,
      score_demand,
    },
  };
}
