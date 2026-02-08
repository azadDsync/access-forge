"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";

const accessibilityOptions = [
  { value: "blind", label: "Blind" },
  { value: "partially-blind", label: "Partially Blind" },
  { value: "color-blind", label: "Color Blind" },
  { value: "non-blind", label: "Non-blind" },
];

export default function SignUpPage() {
  const [ability, setAbility] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!ability) {
      setError("Please select your accessibility ability");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("accessibility-profile", ability);
    }

    await socialSignIn(ability);
  };

  const socialSignIn = async (selectedAbility?: string) => {
    setError("");
    setLoading(true);
    try {
      await signIn.social(
        {
          provider: "github",
          additionalData: selectedAbility
            ? {
                ability: selectedAbility,
              }
            : undefined,
          callbackURL: `${process.env.NEXT_PUBLIC_CLIENT_URL ?? "http://localhost:3000"}/chat`,
        },
        {
          onError: (ctx) => {
            const message =
              ctx?.error?.message || "Failed to sign in with GitHub";
            setError(message);
          },
        },
      );
    } catch (err) {
      setError("Failed to sign in with GitHub");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <a
        href="#signup-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-foreground focus:rounded focus:outline-none focus:ring-4 focus:ring-ring"
      >
        Skip to sign up form
      </a>

      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border-2 border-foreground/10 p-8">
          <header>
            <h1
              id="signup-heading"
              className="text-3xl font-bold text-center mb-2"
            >
              Create Account
            </h1>
            <p className="text-center text-foreground/60 mb-8">
              Join AccessForge
            </p>
          </header>

          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {loading && "Creating your account, please wait..."}
            {error && `Error: ${error}`}
          </div>

          {error && (
            <div
              className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span>{error}</span>
            </div>
          )}

          <form id="signup-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
            <fieldset className="border-0 p-0">
              <legend className="block text-sm font-medium mb-3">
                Select your accessibility need <span className="text-error" aria-label="required">*</span>
              </legend>
              <div className="space-y-2" role="radiogroup" aria-required="true" aria-describedby="ability-hint">
                {accessibilityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all focus-within:ring-4 focus-within:ring-ring ${
                      ability === option.value
                        ? "border-primary bg-primary/10 font-semibold"
                        : "border-foreground/20 hover:border-foreground/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="ability"
                      value={option.value}
                      checked={ability === option.value}
                      onChange={(e) => setAbility(e.target.value)}
                      className="w-5 h-5 mr-3 focus:ring-4 focus:ring-ring"
                      required
                      aria-checked={ability === option.value}
                    />
                    <span className="text-base">{option.label}</span>
                  </label>
                ))}
              </div>
              <p id="ability-hint" className="text-xs text-foreground/60 mt-2 sr-only">
                Choose the option that best describes your accessibility needs. This helps us tailor the experience for you.
              </p>
            </fieldset>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-filled py-4 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? "Continuing with GitHub..." : "Continue with GitHub"}
            </button>
          </form>

          <footer>
            <p className="text-center text-sm text-foreground/60 mt-6">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
              >
                Sign In
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
