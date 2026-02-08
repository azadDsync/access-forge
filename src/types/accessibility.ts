export type AccessibilityProfile =
  | "blind"
  | "partially-blind"
  | "color-blind"
  | "non-blind";

export const ACCESSIBILITY_STORAGE_KEY = "accessibility-profile";

export const ACCESSIBILITY_OPTIONS: Array<{
  value: AccessibilityProfile;
  label: string;
}> = [
  { value: "blind", label: "Blind" },
  { value: "partially-blind", label: "Partially Blind" },
  { value: "color-blind", label: "Color Blind" },
  { value: "non-blind", label: "Non-blind" },
];

export const ACCESSIBILITY_LABELS: Record<AccessibilityProfile, string> = {
  blind: "Blind",
  "partially-blind": "Partially Blind",
  "color-blind": "Color Blind",
  "non-blind": "Non-blind",
};

export const normalizeAccessibilityProfile = (
  value?: string | null,
): AccessibilityProfile => {
  switch (value) {
    case "blind":
    case "fully-blind":
      return "blind";
    case "partially-blind":
    case "partially-sighted":
      return "partially-blind";
    case "color-blind":
      return "color-blind";
    case "non-blind":
    case "none":
    default:
      return "non-blind";
  }
};
