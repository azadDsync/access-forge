"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccessibilityProfile } from "@/components/accessibility/AccessibilityProvider";

const STORAGE_KEY = "accessibility-tour-dismissed";

export default function ScreenReaderTour() {
  const { profile, isResolved } = useAccessibilityProfile();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const steps = useMemo(
    () => [
      "Start a message by focusing the input (Alt+M).",
      "Describe the change you want in plain language.",
      "Confirm before any write actions (fork, branch, file update, PR).",
      "Use Tab to reach suggestions, history, and settings.",
    ],
    [],
  );

  if (!isResolved || profile !== "blind" || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  return (
    <section
      className="rounded-lg border border-foreground/15 bg-card/70 p-3"
      role="region"
      aria-label="Screen reader tour"
    >
      <p className="text-xs font-semibold text-foreground">Screen reader tour</p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-foreground/70">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
      <div className="mt-3">
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-md border border-foreground/15 px-2 py-1 text-xs font-semibold text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Dismiss tour
        </button>
      </div>
    </section>
  );
}
