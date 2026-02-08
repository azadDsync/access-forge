"use client";

import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import Button from "@/components/static-ui/Button";
import { useAccessibilityProfile } from "@/components/accessibility/AccessibilityProvider";
import { ACCESSIBILITY_LABELS } from "@/types/accessibility";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

export default function AppHeader() {
  const { data: session } = useSession();
  const user = session?.user;
  const { profile } = useAccessibilityProfile();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AF";

  return (
    <header
      className="sticky top-0 z-50 bg-background border-b border-foreground/5"
      role="banner"
    >
      <div className="px-5 md:px-20 py-1 md:py-2">
        <nav className="flex items-center justify-between" aria-label="Main navigation">
          <Link
            href="/"
            className="font-serif text-2xl md:text-3xl font-bold italic focus:outline-none focus:ring-4 focus:ring-ring rounded"
            aria-label="AccessForge home"
          >
            AccessForge
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            {user ? (
              <>
                <Link
                  href="/chat"
                  className="text-sm md:text-base font-semibold text-foreground/70 hover:text-foreground"
                >
                  Chat
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm md:text-base font-semibold text-foreground/70 hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="text-sm md:text-base font-semibold text-foreground/70 hover:text-foreground"
                >
                  Settings
                </Link>
              </>
            ) : null}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-full border border-foreground/15 bg-background px-3 py-1.5 focus:outline-none focus:ring-4 focus:ring-ring"
                    aria-label="Open user menu"
                  >
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-foreground/10 text-sm font-semibold text-foreground ring-2 ring-foreground/5">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt={user.name ?? "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className="hidden text-sm font-semibold text-foreground sm:inline">
                      {user.name ?? "GitHub user"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[200px] rounded-md border border-foreground/10 bg-card p-2 text-sm shadow-lg"
                >
                  <div className="px-2 py-1">
                    <p className="text-xs text-foreground/60">Signed in as</p>
                    <p className="text-sm font-semibold text-foreground">
                      {user.name ?? "GitHub user"}
                    </p>
                    <p className="mt-1 text-xs text-foreground/60">
                      Accessibility: {ACCESSIBILITY_LABELS[profile]}
                    </p>
                  </div>
                  <div className="my-2 h-px bg-foreground/10" />
                  <DropdownMenuItem
                    onSelect={() => signOut()}
                    className="cursor-pointer rounded-sm px-2 py-2 text-sm font-semibold text-foreground/80 focus:bg-foreground/5 focus:outline-none"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/sign-in" aria-label="Sign in to AccessForge">
                <Button variant="filled" showArrow={false} className="text-xs py-1 px-3">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
