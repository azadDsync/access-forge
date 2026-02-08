"use client";

import { useAccessibilityProfile } from "@/components/accessibility/AccessibilityProvider";
import { ACCESSIBILITY_LABELS } from "@/types/accessibility";

export default function AccessibilityModeBanner() {
  const { profile, isResolved } = useAccessibilityProfile();

  if (!isResolved) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="text-xs text-foreground/60"
      >
        Loading accessibility settings…
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="text-xs text-foreground/60"
    >
      Accessibility mode: {ACCESSIBILITY_LABELS[profile]}
    </div>
  );
}
