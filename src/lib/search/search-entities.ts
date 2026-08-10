import { createClient } from "@/lib/supabase/server";
import type { Organization, StaffProfile } from "@/types/database";

export type SearchHit =
  | { kind: "organization"; item: Organization }
  | { kind: "staff"; item: StaffProfile };

export async function searchEntities(query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const supabase = await createClient();
  const pattern = `%${q}%`;

  const [orgs, staff] = await Promise.all([
    supabase
      .from("organizations")
      .select("*")
      .ilike("name", pattern)
      .limit(10),
    supabase
      .from("staff_profiles")
      .select("*")
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .limit(10),
  ]);

  const hits: SearchHit[] = [];
  for (const item of orgs.data ?? []) {
    hits.push({ kind: "organization", item });
  }
  for (const item of staff.data ?? []) {
    hits.push({ kind: "staff", item });
  }
  return hits;
}
