import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveKyc, rejectKyc, publishReview } from "@/lib/kyc/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function resolveTargetLabels(
  reviews: {
    target_type: "organization" | "staff";
    target_id: string;
  }[],
) {
  const admin = createAdminClient();
  const orgIds = [
    ...new Set(
      reviews
        .filter((r) => r.target_type === "organization")
        .map((r) => r.target_id),
    ),
  ];
  const staffIds = [
    ...new Set(
      reviews.filter((r) => r.target_type === "staff").map((r) => r.target_id),
    ),
  ];

  const labels = new Map<string, string>();

  if (orgIds.length) {
    const { data } = await admin
      .from("organizations")
      .select("id, name")
      .in("id", orgIds);
    for (const org of data ?? []) {
      labels.set(org.id, org.name);
    }
  }

  if (staffIds.length) {
    const { data } = await admin
      .from("staff_profiles")
      .select("id, first_name, last_name")
      .in("id", staffIds);
    for (const staff of data ?? []) {
      labels.set(staff.id, `${staff.first_name} ${staff.last_name}`);
    }
  }

  return labels;
}

export default async function AdminKycPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/admin/kyc");
  if (profile.role !== "super_admin") redirect("/");

  const admin = createAdminClient();
  const { data: pending } = await admin
    .from("kyc_submissions")
    .select("id, user_id, storage_path, status, created_at, admin_notes")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const { data: pendingReviews } = await admin
    .from("reviews")
    .select(
      "id, target_type, target_id, season_year, score_overall, score_demand, would_recommend, tags, written_feedback, status, created_at",
    )
    .eq("status", "pending_moderation")
    .order("created_at", { ascending: true })
    .limit(20);

  const targetLabels = await resolveTargetLabels(pendingReviews ?? []);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Admin — KYC & reviews
      </h1>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Pending KYC</h2>
        {!pending?.length ? (
          <p className="mt-3 text-sm text-muted-foreground">No pending KYC.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {pending.map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-border px-4 py-4"
              >
                <p className="text-sm">
                  User <code className="text-xs">{row.user_id}</code>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Path: {row.storage_path}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted {new Date(row.created_at).toLocaleString()}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={approveKyc.bind(null, row.id)}>
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form
                    action={rejectKyc.bind(null, row.id)}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <Input
                      name="admin_notes"
                      placeholder="Rejection notes"
                      className="h-8 w-48"
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Reject
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium">Pending reviews</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish so they appear on public feeds (no author shown).
        </p>
        {!pendingReviews?.length ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No pending reviews.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {pendingReviews.map((review) => {
              const name =
                targetLabels.get(review.target_id) ?? "Unknown target";
              const href =
                review.target_type === "organization"
                  ? `/organizations/${review.target_id}`
                  : `/staff/${review.target_id}`;

              return (
                <li
                  key={review.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">
                      <Link href={href} className="hover:underline">
                        {name}
                      </Link>
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {review.target_type === "organization"
                        ? "Organization"
                        : "Staff"}{" "}
                      · Season {review.season_year} · Overall{" "}
                      {review.score_overall}/5 · Demand {review.score_demand}/5
                      {review.would_recommend
                        ? " · Recommends"
                        : " · Does not recommend"}
                    </p>
                    {review.tags?.length ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {review.tags.join(" · ")}
                      </p>
                    ) : null}
                    {review.written_feedback ? (
                      <p className="mt-2 line-clamp-3 text-foreground/90">
                        {review.written_feedback}
                      </p>
                    ) : null}
                  </div>
                  <form action={publishReview.bind(null, review.id)}>
                    <Button type="submit" size="sm">
                      Publish
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
