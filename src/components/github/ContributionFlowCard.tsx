"use client";

import { useEffect, useMemo, useState } from "react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";

export const contributionFlowSchema = z.object({
  owner: z.string().min(1).describe("Repository owner"),
  repo: z.string().min(1).describe("Repository name"),
  issueNumber: z.number().int().min(1).describe("Issue number"),
  forkOwner: z
    .string()
    .optional()
    .describe("Fork owner (defaults to authenticated user)"),
  baseBranch: z.string().optional().describe("Base branch (default: main)"),
  branchName: z
    .string()
    .optional()
    .describe("Feature branch name (default: fix/issue-<n>)"),
  files: z
    .array(
      z.object({
        path: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .optional()
    .describe("Files to update (path + new content)"),
  commitMessage: z
    .string()
    .optional()
    .describe("Commit message (default: Fix issue #<n>)"),
  prTitle: z.string().optional().describe("PR title"),
  prBody: z.string().optional().describe("PR body/description"),
});

export type ContributionFlowProps = z.infer<typeof contributionFlowSchema>;

export default function ContributionFlowCard({
  owner,
  repo,
  issueNumber,
  forkOwner,
  baseBranch,
  branchName,
  files,
  commitMessage,
  prTitle,
  prBody,
}: ContributionFlowProps) {
  const { setValue, submit } = useTamboThreadInput();
  const [localOwner, setLocalOwner] = useState(owner ?? "");
  const [localRepo, setLocalRepo] = useState(repo ?? "");
  const [localIssue, setLocalIssue] = useState(
    issueNumber ? String(issueNumber) : "",
  );
  const [localForkOwner, setLocalForkOwner] = useState(forkOwner ?? "");
  const [localBase, setLocalBase] = useState(baseBranch ?? "main");
  const [localBranch, setLocalBranch] = useState(
    branchName ?? (issueNumber ? `fix/issue-${issueNumber}` : ""),
  );
  const [localCommit, setLocalCommit] = useState(
    commitMessage ?? (issueNumber ? `Fix issue #${issueNumber}` : ""),
  );
  const [localPrTitle, setLocalPrTitle] = useState(
    prTitle ?? (issueNumber ? `Fix issue #${issueNumber}` : ""),
  );
  const [localPrBody, setLocalPrBody] = useState(
    prBody ?? "",
  );
  const [localFiles, setLocalFiles] = useState(
    files?.map((file) => `${file.path}::${file.content}`)?.join("\n\n") ?? "",
  );

  useEffect(() => setLocalOwner(owner ?? ""), [owner]);
  useEffect(() => setLocalRepo(repo ?? ""), [repo]);
  useEffect(() => setLocalIssue(issueNumber ? String(issueNumber) : ""), [issueNumber]);
  useEffect(() => setLocalForkOwner(forkOwner ?? ""), [forkOwner]);

  const isReady =
    localOwner.trim().length > 0 &&
    localRepo.trim().length > 0 &&
    localIssue.trim().length > 0;

  const message = useMemo(() => {
    const issue = localIssue.trim();
    const base = localBase.trim() || "main";
    const branch = localBranch.trim() || `fix/issue-${issue}`;
    const forkTarget = localForkOwner.trim();
    const commit = localCommit.trim() || `Fix issue #${issue}`;
    const title = localPrTitle.trim() || `Fix issue #${issue}`;
    const body = localPrBody.trim();
    const fileLines = localFiles
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const filesPayload = fileLines.length
      ? `Files to update:\n${fileLines.join("\n")}`
      : "Files to update: (ask me for file paths + content)";

    return `Contribute to ${localOwner}/${localRepo} issue #${issue}. First fork the repo${forkTarget ? ` into ${forkTarget}` : ""}. Use base ${base} on the upstream and create branch ${branch} on the fork. ${filesPayload}. Commit message: ${commit}. PR title: ${title}. ${body ? `PR body: ${body}.` : ""} Please confirm before write actions.`;
  }, [
    localOwner,
    localRepo,
    localIssue,
    localForkOwner,
    localBase,
    localBranch,
    localCommit,
    localPrTitle,
    localPrBody,
    localFiles,
  ]);

  const handleSubmit = async () => {
    if (!isReady) return;
    setValue(message);
    requestAnimationFrame(() => {
      void submit();
    });
  };

  return (
    <section className="rounded-lg border border-foreground/15 bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">
        One-command contribution flow
      </h3>
      <p className="mt-1 text-xs text-foreground/60">
        Fill the minimum fields and let the assistant orchestrate fork, branch,
        file updates, and PR creation with confirmations.
      </p>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-foreground/70">
            Owner
            <input
              value={localOwner}
              onChange={(event) => setLocalOwner(event.target.value)}
              className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
            />
          </label>
          <label className="text-xs text-foreground/70">
            Repo
            <input
              value={localRepo}
              onChange={(event) => setLocalRepo(event.target.value)}
              className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-foreground/70">
            Issue #
            <input
              value={localIssue}
              onChange={(event) => setLocalIssue(event.target.value)}
              className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
            />
          </label>
          <label className="text-xs text-foreground/70">
            Base branch
            <input
              value={localBase}
              onChange={(event) => setLocalBase(event.target.value)}
              className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
            />
          </label>
        </div>

        <label className="text-xs text-foreground/70">
          Fork owner (optional)
          <input
            value={localForkOwner}
            onChange={(event) => setLocalForkOwner(event.target.value)}
            className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
            placeholder="Defaults to your GitHub user"
          />
        </label>

        <label className="text-xs text-foreground/70">
          Branch name
          <input
            value={localBranch}
            onChange={(event) => setLocalBranch(event.target.value)}
            className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
          />
        </label>

        <label className="text-xs text-foreground/70">
          Files (path::content per line)
          <textarea
            rows={4}
            value={localFiles}
            onChange={(event) => setLocalFiles(event.target.value)}
            className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
          />
        </label>

        <label className="text-xs text-foreground/70">
          Commit message
          <input
            value={localCommit}
            onChange={(event) => setLocalCommit(event.target.value)}
            className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
          />
        </label>

        <label className="text-xs text-foreground/70">
          PR title
          <input
            value={localPrTitle}
            onChange={(event) => setLocalPrTitle(event.target.value)}
            className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
          />
        </label>

        <label className="text-xs text-foreground/70">
          PR body (optional)
          <textarea
            rows={3}
            value={localPrBody}
            onChange={(event) => setLocalPrBody(event.target.value)}
            className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-foreground/60">
          {isReady
            ? "Ready to launch the contribution flow."
            : "Fill owner, repo, and issue number."}
        </p>
        <button
          type="button"
          disabled={!isReady}
          onClick={handleSubmit}
          className="rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background disabled:opacity-50"
        >
          Run flow
        </button>
      </div>
    </section>
  );
}
