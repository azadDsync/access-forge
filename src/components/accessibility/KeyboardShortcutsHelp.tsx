"use client";

import { useAccessibilityProfile } from "@/components/accessibility/AccessibilityProvider";

const SHORTCUTS = [
  { keys: "Alt + M", action: "Focus message input" },
  { keys: "Tab", action: "Move to next control" },
  { keys: "Shift + Tab", action: "Move to previous control" },
  { keys: "Enter", action: "Send message" },
  { keys: "Shift + Enter", action: "Insert new line" },
] as const;

export default function KeyboardShortcutsHelp() {
  const { profile, isResolved } = useAccessibilityProfile();

  if (!isResolved || profile !== "blind") {
    return null;
  }

  return (
    <section
      className="rounded-lg border border-foreground/15 bg-card/70 p-3"
      role="region"
      aria-label="Keyboard shortcuts"
    >
      <p className="text-xs font-semibold text-foreground">Keyboard shortcuts</p>
      <dl className="mt-2 grid gap-2 text-xs text-foreground/70">
        {SHORTCUTS.map((item) => (
          <div key={item.keys} className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-foreground/80" aria-label={item.keys}>
              {item.keys}
            </dt>
            <dd className="text-right" aria-label={item.action}>
              {item.action}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
