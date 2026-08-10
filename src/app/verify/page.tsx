import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { KycUploadForm } from "@/components/kyc/kyc-upload-form";

export default async function VerifyPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/verify");

  if (
    profile.role === "verified_performer" ||
    profile.role === "verified_org_admin" ||
    profile.role === "super_admin"
  ) {
    redirect("/reviews/new");
  }

  const supabase = await createClient();
  const { data: latest } = await supabase
    .from("kyc_submissions")
    .select("id, status, created_at, admin_notes")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Verify as a performer
      </h1>
      <p className="mt-2 text-muted-foreground">
        Upload a season contract or payment receipt. Reviews stay anonymous on
        the public site; verification happens on the backend.
      </p>

      {latest?.status === "pending" ? (
        <p className="mt-8 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          Your submission is pending admin review.
        </p>
      ) : null}

      {latest?.status === "rejected" ? (
        <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <p>Your last submission was rejected.</p>
          {latest.admin_notes ? (
            <p className="mt-1 text-muted-foreground">{latest.admin_notes}</p>
          ) : null}
          <p className="mt-2">You can upload a new document below.</p>
        </div>
      ) : null}

      {latest?.status !== "pending" ? (
        <div className="mt-8">
          <KycUploadForm />
        </div>
      ) : null}
    </main>
  );
}
