"use client";

import { useEffect, useMemo, useState } from "react";
import { MCPTransport } from "@tambo-ai/react/mcp";
import GitHubMcpStatus from "@/components/github/GitHubMcpStatus";

export default function GitHubConnectionPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const [mcpUrl, setMcpUrl] = useState("");
  const [mcpName, setMcpName] = useState("GitHub MCP");
  const [mcpTransport, setMcpTransport] = useState<MCPTransport>(
    MCPTransport.HTTP,
  );
  const [mcpToken, setMcpToken] = useState("");
  const [servers, setServers] = useState<
    Array<{
      url: string;
      name?: string;
      transport?: string;
      customHeaders?: Record<string, string>;
      headers?: Record<string, string>;
    }>
  >([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const readServers = () => {
      const existing = window.localStorage.getItem("mcp-servers");
      if (!existing) {
        setServers([]);
            <p className="mt-2 text-[11px] text-foreground/60">
              GitHub hosted MCP requires server-side OAuth via the Tambo dashboard.
              Use client-side tokens only for browser-accessible servers.
            </p>
        return;
      }

      try {
        const parsed = JSON.parse(existing) as unknown[];
        const normalized = parsed
          .map((server) => {
            if (typeof server === "string") {
              return { url: server };
            }
            if (server && typeof server === "object" && "url" in server) {
              return server as {
                url: string;
                name?: string;
                transport?: string;
                customHeaders?: Record<string, string>;
                headers?: Record<string, string>;
              };
            }
            return null;
          })
          .filter(Boolean) as Array<{
          url: string;
          name?: string;
          transport?: string;
          customHeaders?: Record<string, string>;
          headers?: Record<string, string>;
        }>;
        setServers(normalized);
      } catch {
        setServers([]);
      }
    };

    readServers();
    const handler = () => readServers();
    window.addEventListener("mcp-servers-updated", handler as EventListener);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(
        "mcp-servers-updated",
        handler as EventListener,
      );
      window.removeEventListener("storage", handler);
    };
  }, []);

  const hasServers = useMemo(() => servers.length > 0, [servers.length]);

  const handleAddMcpServer = (event: React.FormEvent) => {
    event.preventDefault();
    if (typeof window === "undefined") {
      return;
    }
    if (!mcpUrl.trim()) {
      setStatus("Enter a GitHub MCP server URL first.");
      return;
    }

    const existing = window.localStorage.getItem("mcp-servers");
    const parsed = existing ? (JSON.parse(existing) as unknown[]) : [];
    const url = mcpUrl.trim();
    const already = parsed.some((server) => {
      if (typeof server === "string") {
        return server === url;
      }
      if (server && typeof server === "object" && "url" in server) {
        return (server as { url: string }).url === url;
      }
      return false;
    });

    if (already) {
      setStatus("That MCP server is already configured.");
      return;
    }

    const next = [
      ...parsed,
      {
        url,
        transport: mcpTransport,
        name: mcpName.trim() || "GitHub MCP",
        ...(mcpToken.trim()
          ? {
              customHeaders: {
                Authorization: `Bearer ${mcpToken.trim()}`,
              },
            }
          : {}),
      },
    ];

    window.localStorage.setItem("mcp-servers", JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("mcp-servers-updated", {
        detail: next,
      }),
    );

    setStatus("GitHub MCP server added. You can start using MCP tools now.");
    setMcpUrl("");
    setMcpToken("");
  };

  const handleRemoveServer = (urlToRemove: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const existing = window.localStorage.getItem("mcp-servers");
    const parsed = existing ? (JSON.parse(existing) as unknown[]) : [];
    const next = parsed.filter((server) => {
      if (typeof server === "string") {
        return server !== urlToRemove;
      }
      if (server && typeof server === "object" && "url" in server) {
        return (server as { url: string }).url !== urlToRemove;
      }
      return false;
    });

    window.localStorage.setItem("mcp-servers", JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("mcp-servers-updated", {
        detail: next,
      }),
    );
    setStatus("MCP server removed.");
  };

  return (
    <section
      aria-label="GitHub connection settings"
      className="rounded-lg border border-foreground/15 bg-card p-4"
    >
      <header className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">GitHub connection</h2>
        <p className="text-xs text-foreground/60">
          Optional: connect a browser-accessible MCP server for local tools. GitHub OAuth powers repo actions.
        </p>
        <GitHubMcpStatus />
      </header>
      <div className="mt-4">
        <form className="grid gap-3" onSubmit={handleAddMcpServer}>
          <div>
            <label htmlFor="github-mcp-url" className="block text-xs font-medium text-foreground/70">
              MCP server URL
            </label>
            <input
              id="github-mcp-url"
              type="url"
              value={mcpUrl}
              onChange={(event) => setMcpUrl(event.target.value)}
              placeholder="https://api.githubcopilot.com/mcp/"
              className="mt-1 w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-2 text-[11px] text-foreground/60">
              GitHub hosted MCP requires server-side OAuth and is not available in this client-side form.
            </div>
          </div>

          <div>
            <label htmlFor="github-mcp-token" className="block text-xs font-medium text-foreground/70">
              Authorization token (optional)
            </label>
            <input
              id="github-mcp-token"
              type="password"
              value={mcpToken}
              onChange={(event) => setMcpToken(event.target.value)}
              placeholder="GitHub PAT or OAuth token"
              className="mt-1 w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-describedby="github-mcp-token-hint"
            />
            <p id="github-mcp-token-hint" className="mt-1 text-xs text-foreground/60">
              Required for the GitHub-hosted MCP. Stored locally in your browser.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="github-mcp-name" className="block text-xs font-medium text-foreground/70">
                Display name
              </label>
              <input
                id="github-mcp-name"
                type="text"
                value={mcpName}
                onChange={(event) => setMcpName(event.target.value)}
                className="mt-1 w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="github-mcp-transport" className="block text-xs font-medium text-foreground/70">
                Transport
              </label>
              <select
                id="github-mcp-transport"
                value={mcpTransport}
                onChange={(event) =>
                  setMcpTransport(event.target.value as MCPTransport)
                }
                className="mt-1 w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={MCPTransport.HTTP}>HTTP</option>
                <option value={MCPTransport.SSE}>SSE</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Add MCP server
          </button>
        </form>
      </div>

      {status && (
        <p className="mt-3 text-xs text-foreground/60" role="status" aria-live="polite">
          {status}
        </p>
      )}

      {hasServers && (
        <div className="mt-4 border-t border-foreground/10 pt-4">
          <h3 className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
            Connected MCP servers
          </h3>
          <ul className="mt-2 space-y-2">
            {servers.map((server) => (
              <li
                key={server.url}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {server.name ?? "GitHub MCP"}
                  </span>
                  <span className="text-foreground/60">{server.url}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveServer(server.url)}
                  className="rounded-md border border-foreground/20 px-3 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
