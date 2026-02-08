"use client";

import { useEffect, useMemo, useState } from "react";
import { Graph } from "@/components/tambo/graph";

type Repo = {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  htmlUrl: string;
  updatedAt: string;
  owner: string;
};

type Issue = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  url: string;
  labels: string[];
  updatedAt: string;
  author: string | null;
};

type Pull = {
  id: number;
  number: number;
  title: string;
  state: string;
  url: string;
  updatedAt: string;
  author: string | null;
};

type Profile = {
  login: string;
  name: string;
  avatarUrl: string | null;
  htmlUrl: string;
};

export default function GitHubDashboardCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfileAndRepos() {
      setIsLoading(true);
      setError(null);
      try {
        const [profileRes, reposRes] = await Promise.all([
          fetch("/api/github/profile", { credentials: "include" }),
          fetch("/api/github/repos?per_page=100", { credentials: "include" }),
        ]);

        if (!profileRes.ok || !reposRes.ok) {
          throw new Error("Unable to load GitHub data.");
        }

        const profileJson = (await profileRes.json()) as Profile;
        const reposJson = (await reposRes.json()) as { repos: Repo[] };

        if (!isMounted) return;
        setProfile(profileJson);
        setRepos(reposJson.repos);
        setSelectedRepo(reposJson.repos[0] ?? null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    loadProfileAndRepos();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedRepo) return;
    let isMounted = true;

    async function loadRepoStats(repo: Repo) {
      try {
        const owner = repo.owner;
        const repoName = repo.name;
        const [issuesRes, pullsRes] = await Promise.all([
          fetch(
            `/api/github/issues?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}&state=all&per_page=100`,
            { credentials: "include" },
          ),
          fetch(
            `/api/github/pulls?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}&state=all&per_page=100`,
            { credentials: "include" },
          ),
        ]);

        if (!issuesRes.ok || !pullsRes.ok) {
          throw new Error("Unable to load repo activity.");
        }

        const issuesJson = (await issuesRes.json()) as { issues: Issue[] };
        const pullsJson = (await pullsRes.json()) as { pulls: Pull[] };

        if (!isMounted) return;
        setIssues(issuesJson.issues);
        setPulls(pullsJson.pulls);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load activity.");
      }
    }

    loadRepoStats(selectedRepo);
    return () => {
      isMounted = false;
    };
  }, [selectedRepo]);

  const repoOptions = useMemo(
    () =>
      repos.map((repo) => ({
        value: repo.fullName,
        label: repo.fullName,
      })),
    [repos],
  );

  const issueCounts = useMemo(() => {
    const open = issues.filter((issue) => issue.state === "open").length;
    const closed = issues.filter((issue) => issue.state === "closed").length;
    return { open, closed };
  }, [issues]);

  const pullCounts = useMemo(() => {
    const open = pulls.filter((pull) => pull.state === "open").length;
    const closed = pulls.filter((pull) => pull.state === "closed").length;
    return { open, closed };
  }, [pulls]);

  const chartData = useMemo<{
    type: "bar";
    labels: string[];
    datasets: { label: string; data: number[]; color?: string }[];
  }>(() => {
    return {
      type: "bar",
      labels: ["Open", "Closed"],
      datasets: [
        {
          label: "Issues",
          data: [issueCounts.open, issueCounts.closed],
          color: "var(--chart-1)",
        },
        {
          label: "PRs",
          data: [pullCounts.open, pullCounts.closed],
          color: "var(--chart-3)",
        },
      ],
    };
  }, [issueCounts, pullCounts]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-foreground/15 bg-card p-4 text-xs text-foreground/60">
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        {error}
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-foreground/15 bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Contribution dashboard
          </h3>
          <p className="text-xs text-foreground/60">
            {profile?.name ?? "GitHub"} • {repos.length} repos
          </p>
        </div>
        {profile?.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="h-9 w-9 rounded-full border border-foreground/15"
          />
        )}
      </div>

      <div className="mt-3">
        <label className="text-xs text-foreground/70">Active repository</label>
        <select
          value={selectedRepo?.fullName ?? ""}
          onChange={(event) => {
            const next = repos.find(
              (repo) => repo.fullName === event.target.value,
            );
            setSelectedRepo(next ?? null);
          }}
          className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-xs"
        >
          {repoOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <Metric label="Open issues" value={issueCounts.open} />
        <Metric label="Closed issues" value={issueCounts.closed} />
        <Metric label="Open PRs" value={pullCounts.open} />
        <Metric label="Closed PRs" value={pullCounts.closed} />
      </div>

      <div className="mt-4">
        <Graph
          data={chartData}
          title="Issue + PR status"
          showLegend
          size="sm"
          variant="bordered"
          ariaLabel={`Issue and PR status chart. Issues open ${issueCounts.open}, closed ${issueCounts.closed}. PRs open ${pullCounts.open}, closed ${pullCounts.closed}.`}
        />
        <p className="mt-2 text-xs text-foreground/60">
          Issues: {issueCounts.open} open, {issueCounts.closed} closed. PRs:
          {" "}{pullCounts.open} open, {pullCounts.closed} closed.
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-foreground/10 bg-background/50 px-3 py-2">
      <p className="text-foreground/60">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
