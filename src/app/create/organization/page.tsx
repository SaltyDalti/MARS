import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { CreateOrganizationForm } from "@/components/create/create-organization-form";

type PageProps = {
  searchParams: Promise<{ name?: string }>;
};

export default async function CreateOrganizationPage({
  searchParams,
}: PageProps) {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/create/organization");

  const { name = "" } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Search
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Create organization
      </h1>
      <p className="mt-2 text-muted-foreground">
        Add a corps, band, or ensemble that isn&apos;t listed yet.
      </p>
      <div className="mt-8">
        <CreateOrganizationForm defaultName={name} />
      </div>
    </main>
  );
}
