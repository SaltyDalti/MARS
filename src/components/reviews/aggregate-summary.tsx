import type { ReviewAggregates } from "@/lib/reviews/aggregate";

export function AggregateSummary({
  aggregates,
}: {
  aggregates: ReviewAggregates;
}) {
  if (aggregates.count === 0) {
    return (
      <p className="text-sm text-muted-foreground">No published scores yet.</p>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          Reviews
        </dt>
        <dd className="text-2xl font-semibold">{aggregates.count}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          Overall
        </dt>
        <dd className="text-2xl font-semibold">{aggregates.avgOverall}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          Demand
        </dt>
        <dd className="text-2xl font-semibold">{aggregates.avgDemand}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          Recommend
        </dt>
        <dd className="text-2xl font-semibold">
          {aggregates.recommendPercent}%
        </dd>
      </div>
    </dl>
  );
}
