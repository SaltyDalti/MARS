"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/auth/get-profile";

export type KycActionState = {
  error?: string;
  success?: string;
};

export async function submitKyc(
  _prev: KycActionState,
  formData: FormData,
): Promise<KycActionState> {
  const profile = await getProfile();
  if (!profile) {
    return { error: "You must be signed in." };
  }
  if (profile.role !== "visitor") {
    return { error: "Your account is already verified or elevated." };
  }

  const file = formData.get("document");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please upload a contract or receipt." };
  }

  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (!allowed.includes(file.type)) {
    return { error: "File must be PDF, JPEG, PNG, or WebP." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File must be 10MB or smaller." };
  }

  const ext =
    file.type === "application/pdf"
      ? "pdf"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
  const storagePath = `${profile.id}/${Date.now()}.${ext}`;

  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("kyc-documents")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: insertError } = await supabase.from("kyc_submissions").insert({
    user_id: profile.id,
    storage_path: storagePath,
    status: "pending",
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/verify");
  return { success: "Submitted for review. An admin will approve soon." };
}

export async function approveKyc(submissionId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }

  const admin = createAdminClient();
  const { data: submission, error } = await admin
    .from("kyc_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (error || !submission) {
    throw new Error(error?.message ?? "Submission not found");
  }

  const { error: updateSubError } = await admin
    .from("kyc_submissions")
    .update({
      status: "approved",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (updateSubError) throw new Error(updateSubError.message);

  const { error: roleError } = await admin
    .from("profiles")
    .update({ role: "verified_performer" })
    .eq("id", submission.user_id);

  if (roleError) throw new Error(roleError.message);

  revalidatePath("/admin/kyc");
  redirect("/admin/kyc");
}

export async function rejectKyc(submissionId: string, formData: FormData) {
  const profile = await getProfile();
  if (!profile || profile.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }

  const notes = String(formData.get("admin_notes") ?? "").trim();
  const admin = createAdminClient();

  const { error } = await admin
    .from("kyc_submissions")
    .update({
      status: "rejected",
      admin_notes: notes || null,
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/kyc");
  redirect("/admin/kyc");
}

export async function publishReview(reviewId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("reviews")
    .update({ status: "published" })
    .eq("id", reviewId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/kyc");
}
