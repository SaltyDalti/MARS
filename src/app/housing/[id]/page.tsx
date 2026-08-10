import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTargetAggregates } from "@/lib/reviews/queries";
import { AggregateSummary } from "@/components/reviews/aggregate-summary";
import { ReviewFeed } from "@/components/reviews/review-feed";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function HousingSitePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

  const supabase = await createClient();
  const { data: site } = await supabase
    .from("housing_sites")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!site) notFound();

  const aggregates = await getTargetAggregates("housing_site", id);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Search
      </Link>
      <h1 className="font-heading mt-6 text-4xl font-semibold tracking-tight">
        {site.name}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Housing site
        {site.city || site.state
          ? ` · ${[site.city, site.state].filter(Boolean).join(", ")}`
          : ""}
      </p>
      <div className="mt-8">
        <AggregateSummary aggregates={aggregates} />
      </div>
      <div className="mt-6">
        <Link
          href={`/reviews/new?target_type=housing_site&target_id=${site.id}`}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Write a review
        </Link>
      </div>
      <h2 className="mt-12 text-lg font-medium">Reviews</h2>
      <ReviewFeed targetType="housing_site" targetId={id} page={page} />
    </main>
  );
}
