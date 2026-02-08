"use client";

import { useMemo } from "react";
import { useTamboMcpServers } from "@tambo-ai/react/mcp";

export default function GitHubMcpStatus() {
  const mcpServers = useTamboMcpServers();

  const status = useMemo(() => {
    if (mcpServers.length === 0) {
      return "No MCP servers connected";
    }

    const connected = mcpServers.filter((server) => !!server.client).length;
    const failed = mcpServers.filter(
      (server) => !server.client && server.connectionError,
    ).length;

    if (failed > 0) {
      return `${connected} connected · ${failed} failed`;
    }

    return connected === 1
      ? "1 MCP server connected"
      : `${connected} MCP servers connected`;
  }, [mcpServers]);

  return (
    <p className="text-xs text-foreground/60" role="status" aria-live="polite">
      {status}
    </p>
  );
}
