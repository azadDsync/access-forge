"use client";

import { useAccessibilityProfile } from "@/components/accessibility/AccessibilityProvider";

const GUIDANCE = {
  blind: "Tip: Use Tab to focus the message field. Press Enter to send. Use the microphone button for dictation.",
  "partially-blind": "Tip: Use Tab to focus the message field. Press Enter to send. Use the microphone button for dictation.",
  "color-blind": "Tip: Focus outlines indicate active controls. Use Tab to move between inputs.",
  "non-blind": "Tip: Use Tab to navigate controls. Press Enter to send a message.",
} as const;

export default function AccessibilityInputGuidance() {
  const { profile, isResolved } = useAccessibilityProfile();

  if (!isResolved) {
    return null;
  }

  const text = GUIDANCE[profile] ?? GUIDANCE["non-blind"];

  return (
    <p className="text-xs text-foreground/60" role="status" aria-live="polite">
      {text}
    </p>
  );
}
