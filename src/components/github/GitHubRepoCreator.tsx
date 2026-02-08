"use client";

import { useEffect, useMemo, useState } from "react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";

export const gitHubRepoCreatorSchema = z.object({
  name: z
    .string()
    .describe("Repository name (required, e.g. access-forge)")
    .min(1),
  description: z
    .string()
    .describe("Short repo description (required)")
    .min(1),
  visibility: z
    .enum(["public", "private"])
    .optional()
    .describe("Repository visibility (default: private)"),
  includeReadme: z
    .boolean()
    .optional()
    .describe("Create the repository with a README (default: true)"),
  topics: z
    .array(z.string())
    .optional()
    .describe("Optional GitHub topics/tags"),
});

export type GitHubRepoCreatorProps = z.infer<typeof gitHubRepoCreatorSchema>;

export default function GitHubRepoCreator({
  name,
  description,
  visibility,
  includeReadme,
  topics,
}: GitHubRepoCreatorProps) {
  const { setValue, submit } = useTamboThreadInput();
  const [repoName, setRepoName] = useState(name ?? "");
  const [repoDescription, setRepoDescription] = useState(description ?? "");
  const [repoVisibility, setRepoVisibility] = useState<"public" | "private">(
    visibility ?? "private",
  );
  const [readme, setReadme] = useState(includeReadme ?? true);
  const [repoTopics, setRepoTopics] = useState(
    topics?.join(", ") ?? "",
  );

  useEffect(() => setRepoName(name ?? ""), [name]);
  useEffect(() => setRepoDescription(description ?? ""), [description]);
  useEffect(
    () => setRepoVisibility(visibility ?? "private"),
    [visibility],
  );
  useEffect(() => setReadme(includeReadme ?? true), [includeReadme]);
  useEffect(() => setRepoTopics(topics?.join(", ") ?? ""), [topics]);

  const isReady = repoName.trim().length > 0 && repoDescription.trim().length > 0;

  const message = useMemo(() => {
    const trimmedTopics = repoTopics
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);
    const topicLine = trimmedTopics.length
      ? ` Topics: ${trimmedTopics.join(", ")}.`
      : "";

    return `Create a GitHub repository named "${repoName}" with description "${repoDescription}". Visibility: ${repoVisibility}. Include README: ${readme ? "yes" : "no"}.${topicLine} Confirm: yes.`;
  }, [repoName, repoDescription, repoVisibility, readme, repoTopics]);

  const handleSubmit = async () => {
    if (!isReady) return;
    setValue(message);
    requestAnimationFrame(() => {
      void submit();
    });
  };

  return (
    <section className="rounded-xl border border-foreground/10 bg-card p-5 shadow-sm">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          Create GitHub repository
        </h3>
        <p className="text-xs text-foreground/60">
          Provide the required name and description. We will send a creation
          request through the GitHub MCP server.
        </p>
      </header>

      <div className="mt-4 grid gap-3">
        <label className="text-xs font-medium text-foreground/70">
          Repository name
          <input
            value={repoName}
            onChange={(event) => setRepoName(event.target.value)}
            placeholder="access-forge"
            className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground shadow-sm"
          />
        </label>

        <label className="text-xs font-medium text-foreground/70">
          Description
          <textarea
            value={repoDescription}
            onChange={(event) => setRepoDescription(event.target.value)}
            placeholder="Accessible contribution dashboards and chat"
            rows={3}
            className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground shadow-sm"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-foreground/70">
            Visibility
            <select
              value={repoVisibility}
              onChange={(event) =>
                setRepoVisibility(event.target.value as "public" | "private")
              }
              className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground shadow-sm"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </label>

          <label className="text-xs font-medium text-foreground/70">
            README
            <select
              value={readme ? "yes" : "no"}
              onChange={(event) => setReadme(event.target.value === "yes")}
              className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground shadow-sm"
            >
              <option value="yes">Include README</option>
              <option value="no">No README</option>
            </select>
          </label>
        </div>

        <label className="text-xs font-medium text-foreground/70">
          Topics (comma-separated)
          <input
            value={repoTopics}
            onChange={(event) => setRepoTopics(event.target.value)}
            placeholder="accessibility, tambo, mcp"
            className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground shadow-sm"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-foreground/60">
          {isReady
            ? "Ready to create the repo via GitHub MCP."
            : "Add a name and description to continue."}
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isReady}
          className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background shadow transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send creation request
        </button>
      </div>
    </section>
  );
}
