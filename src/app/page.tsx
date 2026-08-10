import Link from "next/link";
import { searchEntities } from "@/lib/search/search-entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HomePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const { q = "" } = await searchParams;
  const hits = q ? await searchEntities(q) : [];

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Full-bleed atmospheric plane — oxide dust horizon */}
      <div
        aria-hidden
        className="mars-haze pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,color-mix(in_oklch,var(--oxide)_28%,transparent),transparent_55%),radial-gradient(ellipse_80%_50%_at_80%_100%,color-mix(in_oklch,var(--foreground)_8%,transparent),transparent_50%),var(--background)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_7%,transparent)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_95%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-20">
        <div className="mars-horizon-in">
          <p className="text-[0.7rem] font-medium tracking-[0.28em] text-muted-foreground uppercase">
            Marching Arts Review System
          </p>
          <h1 className="font-heading mt-5 text-7xl leading-none font-semibold tracking-tight text-foreground sm:text-8xl">
            MARS
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Field notes from the activity — verified performers, anonymous on
            the surface, accountable underneath.
          </p>

          <form
            action="/"
            method="get"
            className="mt-12 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <Input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Survey organizations or staff…"
              className="h-11 flex-1 bg-card/60"
              aria-label="Search organizations or staff"
            />
            <Button type="submit" className="h-11 shrink-0 px-6">
              Search
            </Button>
          </form>
        </div>

        {q ? (
          <section className="mars-horizon-in mt-14" style={{ animationDelay: "80ms" }}>
            <h2 className="text-[0.7rem] font-medium tracking-[0.22em] text-muted-foreground uppercase">
              Results · “{q}”
            </h2>
            {!hits.length ? (
              <div className="mt-5 space-y-3 text-sm">
                <p className="text-muted-foreground">
                  No mapped matches. Log a new profile:
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/create/organization?name=${encodeURIComponent(q)}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Create organization
                  </Link>
                  <Link
                    href={`/create/staff?name=${encodeURIComponent(q)}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Create staff member
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-border border-t border-border">
                {hits.map((hit) =>
                  hit.kind === "organization" ? (
                    <li key={`org-${hit.item.id}`} className="py-4">
                      <Link
                        href={`/organizations/${hit.item.id}`}
                        className="font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {hit.item.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Organization
                        {hit.item.division ? ` · ${hit.item.division}` : ""}
                        {hit.item.is_verified ? " · Verified" : ""}
                      </p>
                    </li>
                  ) : (
                    <li key={`staff-${hit.item.id}`} className="py-4">
                      <Link
                        href={`/staff/${hit.item.id}`}
                        className="font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {hit.item.first_name} {hit.item.last_name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Staff
                      </p>
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
