import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="mb-8 text-sm text-muted-foreground hover:text-foreground"
      >
        ← MARS
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-muted-foreground">
        Verified performers review anonymously after KYC.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
