"use client";

import { useSession } from "@/lib/auth-client";

export default function GitHubMcpRequiredBanner() {
  const { data: session } = useSession();

  if (session?.user) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-foreground/80"
      role="status"
      aria-live="polite"
    >
      GitHub tools are unavailable. Sign in with GitHub to enable repo, issue, commit, and PR actions.
    </div>
  );
}
