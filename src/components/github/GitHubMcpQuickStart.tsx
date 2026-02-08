"use client";

import { useMemo } from "react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { useSession } from "@/lib/auth-client";

const SAMPLE_PROMPTS = [
  "List my repositories",
  "Create a new repository named access-forge with description \"Accessible GitHub workflows\"",
  "Find open issues labeled accessibility in Zendolena/accessible-map",
  "Fetch issue 42 from Zendolena/accessible-map",
  "Open a PR from fix/accessibility to main in Zendolena/accessible-map",
];

export default function GitHubMcpQuickStart() {
  const { setValue } = useTamboThreadInput();
  const { data: session } = useSession();

  const isEnabled = useMemo(() => !!session?.user, [session?.user]);

  if (!isEnabled) {
    return null;
  }

  return (
    <section
      aria-label="GitHub MCP quick start"
      className="rounded-lg border border-foreground/15 bg-card p-4"
    >
      <h3 className="text-sm font-semibold text-foreground">Quick start</h3>
      <p className="mt-1 text-xs text-foreground/60">
        Tap a sample command to populate the chat input.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setValue(prompt)}
            className="rounded-full border border-foreground/20 px-3 py-1.5 text-xs text-foreground hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}
