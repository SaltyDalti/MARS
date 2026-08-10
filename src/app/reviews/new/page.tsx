import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/reviews/review-form";
import type { OrgActivityType, ReviewTargetType } from "@/types/database";

type PageProps = {
  searchParams: Promise<{
    target_type?: string;
    target_id?: string;
  }>;
};

export default async function NewReviewPage({ searchParams }: PageProps) {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/reviews/new");

  if (profile.role === "visitor") {
    redirect("/verify");
  }

  const params = await searchParams;
  const targetType = params.target_type as ReviewTargetType | undefined;
  const targetId = params.target_id;

  if (
    !targetType ||
    !targetId ||
    (targetType !== "organization" &&
      targetType !== "staff" &&
      targetType !== "housing_site")
  ) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Write a review
        </h1>
        <p className="mt-3 text-muted-foreground">
          Search for an organization or staff member first, then choose Write a
          review.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-primary underline-offset-4 hover:underline"
        >
          Go to search
        </Link>
      </main>
    );
  }

  const supabase = await createClient();
  let targetLabel = "Unknown";
  let activityType: OrgActivityType | null = null;
  let backHref = "/";

  if (targetType === "organization") {
    const { data } = await supabase
      .from("organizations")
      .select("name, activity_type")
      .eq("id", targetId)
      .maybeSingle();
    if (!data) redirect("/");
    targetLabel = data.name;
    activityType = data.activity_type;
    backHref = `/organizations/${targetId}`;
  } else if (targetType === "staff") {
    const { data } = await supabase
      .from("staff_profiles")
      .select("first_name, last_name")
      .eq("id", targetId)
      .maybeSingle();
    if (!data) redirect("/");
    targetLabel = `${data.first_name} ${data.last_name}`;
    backHref = `/staff/${targetId}`;
  } else {
    const { data } = await supabase
      .from("housing_sites")
      .select("name")
      .eq("id", targetId)
      .maybeSingle();
    if (!data) redirect("/");
    targetLabel = data.name;
    backHref = `/housing/${targetId}`;
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <Link
        href={backHref}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>
      <h1 className="font-heading mt-6 text-3xl font-semibold tracking-tight">
        Write a review
      </h1>
      <div className="mt-8">
        <ReviewForm
          targetType={targetType}
          targetId={targetId}
          targetLabel={targetLabel}
          activityType={activityType}
        />
      </div>
    </main>
  );
}
