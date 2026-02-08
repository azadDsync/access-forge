"use client";

import { useMemo } from "react";
import { useTambo } from "@tambo-ai/react";
import type { TamboThreadMessage } from "@tambo-ai/react";
import { getToolCallRequest } from "@/components/tambo/message";

const EMPTY_METRICS = {
  contributions: undefined as number | undefined,
  repos: undefined as number | undefined,
  issues: undefined as number | undefined,
  prs: undefined as number | undefined,
  lastUpdated: undefined as string | undefined,
};

type Metrics = typeof EMPTY_METRICS;

const safeParseJson = (value: unknown): unknown | null => {
  if (!value) return null;
  if (typeof value === "object") return value;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (Array.isArray(value)) {
    const textParts = value
      .filter((item) => item && typeof item === "object" && "type" in item)
      .map((item) =>
        (item as { type?: string; text?: string }).type === "text"
          ? (item as { text?: string }).text ?? ""
          : "",
      )
      .join("");
    if (textParts) {
      try {
        return JSON.parse(textParts);
      } catch {
        return null;
      }
    }
  }

  return null;
};

const extractCountFromResult = (
  toolName: string,
  result: unknown,
): Partial<Metrics> => {
  if (!result || typeof result !== "object") {
    return {};
  }

  const toolKey = toolName.toLowerCase();
  const payload = result as Record<string, unknown>;

  const getArrayCount = (value: unknown) =>
    Array.isArray(value) ? value.length : undefined;

  const countFromTotal = (value: unknown) =>
    typeof value === "number" ? value : undefined;

  const issuesArray =
    getArrayCount(payload.issues) ??
    getArrayCount(payload.items) ??
    getArrayCount(payload.results);
  const prsArray =
    getArrayCount(payload.pull_requests) ??
    getArrayCount(payload.pullRequests) ??
    getArrayCount(payload.pulls);
  const reposArray =
    getArrayCount(payload.repositories) ??
    getArrayCount(payload.repos);
  const contributionsArray =
    getArrayCount(payload.contributions) ??
    getArrayCount(payload.commits);

  const totalCount = countFromTotal(payload.total_count ?? payload.count);

  const metrics: Partial<Metrics> = {};

  if (issuesArray !== undefined || (totalCount !== undefined && toolKey.includes("issue"))) {
    metrics.issues = issuesArray ?? totalCount;
  }

  if (prsArray !== undefined || (totalCount !== undefined && toolKey.includes("pull"))) {
    metrics.prs = prsArray ?? totalCount;
  }

  if (reposArray !== undefined || (totalCount !== undefined && toolKey.includes("repo"))) {
    metrics.repos = reposArray ?? totalCount;
  }

  if (contributionsArray !== undefined || (totalCount !== undefined && toolKey.includes("commit"))) {
    metrics.contributions = contributionsArray ?? totalCount;
  }

  return metrics;
};

const formatTimestamp = (value?: string | number | Date) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getToolResponseForMessage = (
  messages: TamboThreadMessage[],
  index: number,
) => {
  for (let i = index + 1; i < messages.length; i += 1) {
    const next = messages[i];
    if (next.role === "tool") {
      return next;
    }
    if (next.role === "assistant" && getToolCallRequest(next)) {
      break;
    }
  }
  return null;
};

export default function GitHubMcpAnalytics() {
  const { thread } = useTambo();

  const metrics = useMemo(() => {
    if (!thread?.messages?.length) {
      return EMPTY_METRICS;
    }

    let current = { ...EMPTY_METRICS } as Metrics;
    let lastUpdated: string | undefined;

    thread.messages.forEach((message, index) => {
      if (message.role !== "assistant") return;
      const toolCallRequest = getToolCallRequest(message);
      if (!toolCallRequest) return;

      const response = getToolResponseForMessage(thread.messages, index);
      if (!response) return;

      const parsed = safeParseJson(response.content);
      if (!parsed) return;

      const extracted = extractCountFromResult(toolCallRequest.toolName ?? "", parsed);
      current = { ...current, ...extracted };
      lastUpdated = formatTimestamp(response.createdAt ?? message.createdAt) ?? lastUpdated;
    });

    return { ...current, lastUpdated };
  }, [thread?.messages]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          title="Contributions"
          value={metrics.contributions}
          fallback="—"
          description="Commits and contributions"
        />
        <MetricCard
          title="Repos"
          value={metrics.repos}
          fallback="—"
          description="Repositories tracked"
        />
        <MetricCard
          title="Issues"
          value={metrics.issues}
          fallback="—"
          description="Issues from MCP tools"
        />
        <MetricCard
          title="PRs"
          value={metrics.prs}
          fallback="—"
          description="Pull requests from MCP tools"
        />
      </div>
      <div className="rounded-lg border border-foreground/15 bg-card p-4">
        <p className="text-xs uppercase tracking-wide text-foreground/60">
          Activity trend
        </p>
        <div className="mt-2 text-xs text-foreground/60">
          {metrics.lastUpdated
            ? `Updated at ${metrics.lastUpdated}`
            : "Run GitHub MCP tools to populate analytics."}
        </div>
        <div className="mt-3 h-20 rounded-md border border-dashed border-foreground/20 flex items-center justify-center text-xs text-foreground/60">
          MCP data will render here when tool results include time series data.
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  fallback,
  description,
}: {
  title: string;
  value?: number;
  fallback: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-foreground/15 bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-foreground/60">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">
        {value ?? fallback}
      </p>
      <p className="mt-1 text-xs text-foreground/60">{description}</p>
    </div>
  );
}
