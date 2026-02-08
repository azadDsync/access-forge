"use client";

import { ReactNode } from "react";
import GitHubDashboardCard from "@/components/github/GitHubDashboardCard";
import GitHubMcpOnboarding from "@/components/github/GitHubMcpOnboarding";
import { useAccessibilityProfile } from "@/components/accessibility/AccessibilityProvider";

export default function AdaptiveChatLayout({ children }: { children: ReactNode }) {
  const { profile, isResolved } = useAccessibilityProfile();

  if (!isResolved) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-foreground/70" role="status" aria-live="polite">
        Loading your accessibility preferences…
      </div>
    );
  }

  const isVisual = profile !== "blind";

  return (
    <div className="flex h-full flex-1 flex-col min-h-0">
      <div
        className={`flex-1 w-full grid gap-6 min-h-0 ${
          isVisual ? "lg:grid-cols-[2fr_1fr]" : "grid-cols-1"
        }`}
      >
        <section
          aria-label="Chat workspace"
          className="min-h-0 flex flex-1 flex-col space-y-4 px-0"
        >
          {/* GitHub connection panel temporarily hidden — will live in Settings. */}
          {/* <GitHubConnectionPanel /> */}
          <GitHubMcpOnboarding />
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card/70 shadow-sm">
            {children}
          </div>
        </section>

        {isVisual && (
          <aside
            aria-label="Contribution dashboard"
            className="space-y-4 px-0"
          >
            <GitHubDashboardCard />
          </aside>
        )}
      </div>
    </div>
  );
}
