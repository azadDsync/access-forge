"use client";

import { useAccessibilityProfile } from "@/components/accessibility/AccessibilityProvider";

const HINTS = {
  blind: [
    "Use voice dictation from the microphone button to speak your request.",
    "Ask for repo and issue summaries; I will read them in a screen-reader-friendly format.",
    "Say “confirm” only when you want to execute commits or PRs.",
  ],
  "partially-blind": [
    "Increase zoom with your browser if needed; the interface already uses larger text.",
    "Use keyboard shortcuts: Tab to focus input, Shift+Tab to move backward.",
    "Say “confirm” only when you want to execute commits or PRs.",
  ],
  "color-blind": [
    "Charts and alerts use color-blind-safe palettes and text labels.",
    "Ask for textual summaries of any chart or trend data.",
  ],
  "non-blind": [
    "Use the dashboard on the right for quick GitHub analytics.",
    "Ask for summaries if you want the assistant to explain metrics.",
  ],
};

export default function AccessibilityChatHints() {
  const { profile, isResolved } = useAccessibilityProfile();

  if (!isResolved) {
    return null;
  }

  const hints = HINTS[profile];

  return (
    <div
      className="rounded-lg border border-foreground/15 bg-card p-4"
      role="note"
      aria-label="Accessibility tips"
    >
      <h3 className="text-sm font-semibold text-foreground">
        Accessibility tips
      </h3>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-foreground/70">
        {hints.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>
    </div>
  );
}
