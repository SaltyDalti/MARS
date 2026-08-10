import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="mb-8 text-sm text-muted-foreground hover:text-foreground"
      >
        ← MARS
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-muted-foreground">
        After signup you&apos;ll verify with a contract or receipt upload.
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
    </main>
  );
}
