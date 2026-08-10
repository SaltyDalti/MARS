import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { CreateStaffForm } from "@/components/create/create-staff-form";

type PageProps = {
  searchParams: Promise<{ name?: string }>;
};

export default async function CreateStaffPage({ searchParams }: PageProps) {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/create/staff");

  const { name = "" } = await searchParams;
  const parts = name.trim().split(/\s+/);
  const defaultFirst = parts[0] ?? "";
  const defaultLast = parts.length > 1 ? parts.slice(1).join(" ") : "";

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Search
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Create staff profile
      </h1>
      <p className="mt-2 text-muted-foreground">
        Add an educator or caption head that isn&apos;t listed yet.
      </p>
      <div className="mt-8">
        <CreateStaffForm
          defaultFirst={defaultFirst}
          defaultLast={defaultLast}
        />
      </div>
    </main>
  );
}
