import { NextResponse } from "next/server";

/**
 * Smoke check: reports which env vars are present without leaking values.
 */
export async function GET() {
  const checks = {
    ok: true,
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  const ready =
    checks.supabaseUrl && checks.supabaseAnonKey;

  return NextResponse.json(
    {
      service: "mars",
      ready,
      env: checks,
    },
    { status: ready ? 200 : 503 },
  );
}
