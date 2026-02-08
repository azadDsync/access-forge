"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "@/lib/auth-client";
import {
  ACCESSIBILITY_STORAGE_KEY,
  type AccessibilityProfile,
  normalizeAccessibilityProfile,
} from "@/types/accessibility";

const DEFAULT_PROFILE: AccessibilityProfile = "non-blind";

type AccessibilityContextValue = {
  profile: AccessibilityProfile;
  setProfile: (profile: AccessibilityProfile) => void;
  isResolved: boolean;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isPending } = useSession();
  const [profile, setProfileState] = useState<AccessibilityProfile>(
    DEFAULT_PROFILE,
  );
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (stored) {
      setProfileState(normalizeAccessibilityProfile(stored));
    }
  }, []);

  useEffect(() => {
    const abilityFromSession = (data?.user as { ability?: string } | undefined)
      ?.ability;

    if (abilityFromSession) {
      setProfileState(normalizeAccessibilityProfile(abilityFromSession));
      setIsResolved(true);
      return;
    }

    if (!isPending) {
      setIsResolved(true);
    }
  }, [data, isPending]);


  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, profile);
    document.documentElement.dataset.accessibility = profile;
  }, [profile]);

  const setProfile = (nextProfile: AccessibilityProfile) => {
    setProfileState(nextProfile);
  };

  const value = useMemo(
    () => ({ profile, setProfile, isResolved }),
    [profile, isResolved],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityProfile() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibilityProfile must be used within AccessibilityProvider",
    );
  }
  return context;
}
