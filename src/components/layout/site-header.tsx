import Link from "next/link";
import { getProfile, getSessionUser } from "@/lib/auth/get-profile";
import { signOut } from "@/lib/auth/actions";
import { Button, buttonVariants } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getSessionUser();
  const profile = user ? await getProfile() : null;

  return (
    <header className="relative z-20 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-[0.12em] text-foreground"
        >
          MARS
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {profile?.role === "visitor" ? (
                <Link
                  href="/verify"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Verify
                </Link>
              ) : null}
              {profile?.role === "super_admin" ? (
                <Link
                  href="/admin/kyc"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Admin
                </Link>
              ) : null}
              {(profile?.role === "verified_performer" ||
                profile?.role === "verified_org_admin" ||
                profile?.role === "super_admin") && (
                <Link
                  href="/reviews/new"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Write review
                </Link>
              )}
              <span className="hidden text-muted-foreground sm:inline">
                {user.email}
              </span>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ size: "sm" })}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
