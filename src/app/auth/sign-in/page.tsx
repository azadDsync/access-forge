"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await socialSignIn();
  };

  const socialSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn.social(
        {
          provider: "github",
          callbackURL: `${process.env.NEXT_PUBLIC_CLIENT_URL ?? "http://localhost:3000"}/chat`,
        },
        {
          onError: (ctx) => {
            const code = ctx?.error?.code;
            const message =
              ctx?.error?.message || "Failed to sign in with GitHub";

            if (
              code === "signup_disabled" ||
              message.toLowerCase().includes("signup_disabled")
            ) {
              setError(
                "New users must create an account first. Please sign up to select your accessibility profile.",
              );
              router.push("/auth/sign-up");
              return;
            }

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
      {/* Skip Link */}
      <a 
        href="#signin-form" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-foreground focus:rounded focus:outline-none focus:ring-4 focus:ring-ring"
      >
        Skip to sign in form
      </a>

      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border-2 border-foreground/10 p-8">
          <header>
            <h1 id="signin-heading" className="text-3xl font-bold text-center mb-2">
              Welcome Back
            </h1>
            <p className="text-center text-foreground/60 mb-8">
              Sign in to AccessForge
            </p>
          </header>

          {/* Screen Reader Announcements */}
          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {loading && "Signing you in, please wait..."}
            {error && `Error: ${error}`}
          </div>

          {error && (
            <div 
              className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4" 
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span>
                {error}
                {error.toLowerCase().includes("sign up") && (
                  <span>
                    {" "}
                    <Link
                      href="/auth/sign-up"
                      className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                    >
                      Go to sign up
                    </Link>
                  </span>
                )}
              </span>
            </div>
          )}

          <form id="signin-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
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
              We use GitHub OAuth for new and existing users. New here?{" "}
              <Link
                href="/auth/sign-up"
                className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
              >
                Sign up
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
