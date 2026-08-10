"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-profile";
import { validateDynamicReview } from "@/lib/reviews/validate-dynamic";
import {
  isOrgActivityType,
  isReviewerRoleId,
  isSectionId,
  isStaffRevieweeRoleId,
  isStaffReviewerRelationId,
  type ReviewTargetKind,
} from "@/lib/reviews/master-config";
import type { OrgActivityType } from "@/types/database";

export type ReviewActionState = {
  error?: string;
  success?: string;
};

function canReview(role: string | undefined) {
  return (
    role === "verified_performer" ||
    role === "verified_org_admin" ||
    role === "super_admin"
  );
}

function pathForTarget(type: ReviewTargetKind, id: string) {
  if (type === "organization") return `/organizations/${id}`;
  if (type === "staff") return `/staff/${id}`;
  return `/housing/${id}`;
}

function parseResponseValue(raw: FormDataEntryValue): number | boolean {
  const value = String(raw);
  if (value === "true") return true;
  if (value === "false") return false;
  return Number(value);
}

export async function createReview(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const profile = await getProfile();
  if (!profile) return { error: "You must be signed in." };
  if (!canReview(profile.role)) {
    return { error: "Verify as a performer before writing a review." };
  }

  const responses: Record<string, number | boolean> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("response__")) {
      responses[key.replace("response__", "")] = parseResponseValue(value);
    }
  }

  const rawActivity = String(formData.get("activity_type") ?? "");
  const activity_type = isOrgActivityType(rawActivity) ? rawActivity : null;

  const rawRevieweeRole = String(formData.get("staff_reviewee_role") ?? "");
  const rawReviewerRelation = String(
    formData.get("staff_reviewer_relation") ?? "",
  );

  const validated = validateDynamicReview({
    target_type: String(formData.get("target_type")) as ReviewTargetKind,
    target_id: String(formData.get("target_id") ?? ""),
    season_year: Number(formData.get("season_year")),
    activity_type,
    reviewer_roles: formData
      .getAll("reviewer_roles")
      .map(String)
      .filter(isReviewerRoleId),
    sections: formData.getAll("sections").map(String).filter(isSectionId),
    staff_reviewee_role: isStaffRevieweeRoleId(rawRevieweeRole)
      ? rawRevieweeRole
      : null,
    staff_reviewer_relation: isStaffReviewerRelationId(rawReviewerRelation)
      ? rawReviewerRelation
      : null,
    responses,
    would_recommend: formData.get("would_recommend") === "true",
    written_feedback: String(formData.get("written_feedback") ?? ""),
    tags: formData
      .getAll("tags")
      .map(String)
      .map((t) => t.trim())
      .filter(Boolean),
  });

  if (!validated.ok) return { error: validated.error };

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    target_type: validated.data.target_type,
    target_id: validated.data.target_id,
    author_id: profile.id,
    season_year: validated.data.season_year,
    score_overall: validated.data.score_overall,
    score_demand: validated.data.score_demand,
    would_recommend: validated.data.would_recommend,
    tags: validated.data.tags,
    written_feedback: validated.data.written_feedback,
    reviewer_roles: validated.data.reviewer_roles,
    sections: validated.data.sections,
    staff_reviewee_role: validated.data.staff_reviewee_role,
    staff_reviewer_relation: validated.data.staff_reviewer_relation,
    responses: validated.data.responses,
    status: "pending_moderation",
  });

  if (error) return { error: error.message };

  const path = pathForTarget(
    validated.data.target_type,
    validated.data.target_id,
  );
  revalidatePath(path);
  redirect(`${path}?submitted=1`);
}

export async function createOrganization(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const profile = await getProfile();
  if (!profile) return { error: "You must be signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const division = String(formData.get("division") ?? "").trim() || null;
  const rawType = String(formData.get("activity_type") ?? "dci");
  const activity_type: OrgActivityType = isOrgActivityType(rawType)
    ? rawType
    : "dci";
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .insert({ name, division, activity_type })
    .select("id")
    .single();

  if (error) return { error: error.message };
  redirect(`/organizations/${data.id}`);
}

export async function createStaff(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const profile = await getProfile();
  if (!profile) return { error: "You must be signed in." };

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  if (!first_name || !last_name) {
    return { error: "First and last name are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_profiles")
    .insert({ first_name, last_name })
    .select("id")
    .single();

  if (error) return { error: error.message };
  redirect(`/staff/${data.id}`);
}
