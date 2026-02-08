"use client";

import { useSession } from "@/lib/auth-client";
import { useAccessibilityProfile } from "@/components/accessibility/AccessibilityProvider";
import { ACCESSIBILITY_LABELS } from "@/types/accessibility";

export default function UserDashboardPanel() {
  const { data: session } = useSession();
  const { profile } = useAccessibilityProfile();
  const user = session?.user;

  return (
    <div className="rounded-lg border border-foreground/15 bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">User dashboard</h3>
      <p className="mt-1 text-xs text-foreground/60">
        Personalized workspace summary and quick actions.
      </p>

      <div className="mt-4 grid gap-3 text-xs">
        <div className="rounded-md border border-foreground/10 bg-background/50 px-3 py-2">
          <p className="text-foreground/60">Signed in as</p>
          <p className="font-semibold text-foreground">
            {user?.name ?? "GitHub user"}
          </p>
        </div>
        <div className="rounded-md border border-foreground/10 bg-background/50 px-3 py-2">
          <p className="text-foreground/60">Accessibility mode</p>
          <p className="font-semibold text-foreground">
            {ACCESSIBILITY_LABELS[profile]}
          </p>
        </div>
        <div className="rounded-md border border-foreground/10 bg-background/50 px-3 py-2 text-foreground/70">
          Use natural language to find issues, open repos, draft fixes, commit
          changes, and open PRs. Destructive actions require confirmation.
        </div>
        <div className="rounded-md border border-foreground/10 bg-background/50 px-3 py-2">
          <p className="text-foreground/60">Quick actions</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-foreground/80">
            <li>List my repositories</li>
            <li>Find issues labeled accessibility</li>
            <li>Open a pull request</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
