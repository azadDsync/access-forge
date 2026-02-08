"use client";

import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";

export default function AccessibilityRootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccessibilityProvider>{children}</AccessibilityProvider>;
}
