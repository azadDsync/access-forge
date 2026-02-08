"use client";

import { useMemo, useState } from "react";
import AppHeader from "@/components/static-ui/AppHeader";
import Footer from "@/components/static-ui/Footer";
import { McpConfigModal, useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { useSession } from "@/lib/auth-client";
import { ACCESSIBILITY_LABELS, ACCESSIBILITY_OPTIONS, type AccessibilityProfile } from "@/types/accessibility";
import { useAccessibilityProfile } from "@/components/accessibility/AccessibilityProvider";
import { TamboProvider } from "@tambo-ai/react";
import {
  TamboMcpProvider,
  useTamboMcpPromptList,
  useTamboMcpResourceList,
} from "@tambo-ai/react/mcp";

function AccessibilitySettings() {
  const { profile, setProfile, isResolved } = useAccessibilityProfile();
  const [selection, setSelection] = useState<AccessibilityProfile>(profile);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!isResolved) {
    return (
      <section className="rounded-lg border border-foreground/15 bg-card p-4" aria-busy="true">
        <p className="text-sm text-foreground/70">Loading accessibility settings…</p>
      </section>
    );
  }

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    try {
      const response = await fetch("/api/user/ability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ability: selection }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to update accessibility profile.");
      }

      setProfile(selection);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  return (
    <section
      className="rounded-lg border border-foreground/15 bg-card p-4"
      aria-labelledby="accessibility-settings"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="accessibility-settings" className="text-sm font-semibold text-foreground">
            Accessibility profile
          </h2>
          <p className="mt-1 text-xs text-foreground/60">
            Current: {ACCESSIBILITY_LABELS[profile]}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Accessibility profile">
        {ACCESSIBILITY_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs transition ${
              selection === option.value
                ? "border-foreground bg-foreground/5"
                : "border-foreground/15"
            }`}
          >
            <span className="font-semibold text-foreground">{option.label}</span>
            <input
              type="radio"
              name="accessibility-profile"
              value={option.value}
              checked={selection === option.value}
              onChange={() => setSelection(option.value)}
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>

      {status === "success" && (
        <p className="mt-2 text-xs text-success">Saved.</p>
      )}
      {status === "error" && error && (
        <p className="mt-2 text-xs text-error">{error}</p>
      )}
    </section>
  );
}

function McpServerSection() {
  const servers = useMcpServers();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="rounded-lg border border-foreground/15 bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">MCP servers</h2>
          <p className="mt-1 text-xs text-foreground/60">
            Connect client-side MCP servers to extend tools and prompts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-md border border-foreground/20 px-3 py-2 text-xs font-semibold text-foreground"
        >
          Configure
        </button>
      </div>

      <div className="mt-3 space-y-2 text-xs">
        {servers.length === 0 ? (
          <p className="text-foreground/60">No MCP servers configured yet.</p>
        ) : (
          servers.map((server) => (
            <div
              key={`${server.url}-${server.transport ?? "http"}`}
              className="rounded-md border border-foreground/10 bg-background/60 px-3 py-2"
            >
              <p className="font-semibold text-foreground">
                {server.name ?? "Unnamed server"}
              </p>
              <p className="text-foreground/70">{server.url}</p>
              <p className="text-foreground/60">
                Transport: {server.transport ?? "HTTP"}
              </p>
            </div>
          ))
        )}
      </div>

      <McpConfigModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}

function McpExplorer() {
  const [promptSearch, setPromptSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const { data: prompts, isLoading: promptsLoading } = useTamboMcpPromptList(promptSearch);
  const { data: resources, isLoading: resourcesLoading } = useTamboMcpResourceList(resourceSearch);

  const promptRows = useMemo(() => prompts ?? [], [prompts]);
  const resourceRows = useMemo(() => resources ?? [], [resources]);

  return (
    <section className="rounded-lg border border-foreground/15 bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">MCP explorer</h2>
      <p className="mt-1 text-xs text-foreground/60">
        Browse prompts and resources exposed by connected MCP servers.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-foreground/70" htmlFor="mcp-prompt-search">
              Prompt search
            </label>
            <input
              id="mcp-prompt-search"
              value={promptSearch}
              onChange={(event) => setPromptSearch(event.target.value)}
              className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
              placeholder="Search prompts"
            />
          </div>
          <div className="space-y-2 text-xs">
            {promptsLoading ? (
              <p className="text-foreground/60">Loading prompts…</p>
            ) : promptRows.length === 0 ? (
              <p className="text-foreground/60">No prompts available.</p>
            ) : (
              promptRows.map((entry) => (
                <div
                  key={`${entry.server.key}-${entry.prompt.name}`}
                  className="rounded-md border border-foreground/10 bg-background/60 px-3 py-2"
                >
                  <p className="font-semibold text-foreground">
                    {entry.prompt.title ?? entry.prompt.name}
                  </p>
                  <p className="text-foreground/60">{entry.server.name ?? entry.server.url}</p>
                  {entry.prompt.description && (
                    <p className="mt-1 text-foreground/70">{entry.prompt.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-foreground/70" htmlFor="mcp-resource-search">
              Resource search
            </label>
            <input
              id="mcp-resource-search"
              value={resourceSearch}
              onChange={(event) => setResourceSearch(event.target.value)}
              className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
              placeholder="Search resources"
            />
          </div>
          <div className="space-y-2 text-xs">
            {resourcesLoading ? (
              <p className="text-foreground/60">Loading resources…</p>
            ) : resourceRows.length === 0 ? (
              <p className="text-foreground/60">No resources available.</p>
            ) : (
              resourceRows.map((entry) => (
                <div
                  key={`${entry.server?.key ?? "registry"}-${entry.resource.uri}`}
                  className="rounded-md border border-foreground/10 bg-background/60 px-3 py-2"
                >
                  <p className="font-semibold text-foreground">{entry.resource.name ?? entry.resource.uri}</p>
                  <p className="text-foreground/60">
                    {entry.server ? entry.server.name ?? entry.server.url : "Local registry"}
                  </p>
                  {entry.resource.description && (
                    <p className="mt-1 text-foreground/70">{entry.resource.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const mcpServers = useMcpServers();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-foreground focus:rounded focus:outline-none focus:ring-4 focus:ring-ring"
      >
        Skip to main content
      </a>
      <AppHeader />
      <main id="main-content" className="flex-1 px-6 py-8" role="main" aria-label="Settings">
        <TamboProvider
          apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
          components={components}
          tools={tools}
          tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
          mcpServers={mcpServers}
          userToken={session?.session?.token}
        >
          <TamboMcpProvider>
            <div className="mx-auto max-w-5xl space-y-6">
              <header>
                <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
                <p className="mt-1 text-sm text-foreground/60">
                  Manage accessibility preferences and MCP integrations.
                </p>
              </header>
              <AccessibilitySettings />
              <McpServerSection />
              <McpExplorer />
            </div>
          </TamboMcpProvider>
        </TamboProvider>
      </main>
      <Footer />
    </div>
  );
}
