"use client";

import { useMemo } from "react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { useSession } from "@/lib/auth-client";

const GITHUB_INTENT_REGEX =
  /(github|repo|repository|issue|pull request|pr\b|commit|branch|label|merge)/i;

export default function GitHubMcpIntentBanner() {
  const { value } = useTamboThreadInput();
  const { data: session } = useSession();

  const shouldShow = useMemo(() => {
    if (session?.user) return false;
    if (!value || typeof value !== "string") return false;
    return GITHUB_INTENT_REGEX.test(value);
  }, [session?.user, value]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-foreground/80"
      role="status"
      aria-live="polite"
    >
      It looks like you want GitHub actions. Sign in with GitHub to enable repo, issue, commit, and PR tools.
    </div>
  );
}
