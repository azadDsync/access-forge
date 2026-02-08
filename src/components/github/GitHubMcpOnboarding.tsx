"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export default function GitHubMcpOnboarding() {
  const { data: session } = useSession();

  if (session?.user) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-dashed border-foreground/30 bg-card/60 p-4"
      role="status"
      aria-live="polite"
    >
      <h3 className="text-sm font-semibold text-foreground">Sign in with GitHub</h3>
      <p className="mt-1 text-xs text-foreground/60">
        Connect your GitHub account to unlock repository, issue, and PR actions.
      </p>
      <Link
        href="/auth/sign-in"
        className="mt-3 inline-flex items-center rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
      >
        Sign in
      </Link>
    </div>
  );
}
