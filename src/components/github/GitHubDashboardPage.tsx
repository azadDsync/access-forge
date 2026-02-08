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

type Range = "7d" | "30d" | "90d";

export default function GitHubDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [range, setRange] = useState<Range>("30d");
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

  const activitySeries = useMemo<{
    type: "line";
    labels: string[];
    datasets: { label: string; data: number[]; color?: string }[];
  }>(() => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const now = new Date();
    const buckets = Array.from({ length: days }).map((_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (days - 1 - index));
      const key = date.toISOString().slice(0, 10);
      return { key, label: date.toLocaleDateString([], { month: "short", day: "numeric" }) };
    });

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, 0]));

    [...issues, ...pulls].forEach((item) => {
      const key = new Date(item.updatedAt).toISOString().slice(0, 10);
      if (bucketMap.has(key)) {
        bucketMap.set(key, (bucketMap.get(key) ?? 0) + 1);
      }
    });

    return {
      type: "line",
      labels: buckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: "Activity",
          data: buckets.map((bucket) => bucketMap.get(bucket.key) ?? 0),
          color: "var(--chart-2)",
        },
      ],
    };
  }, [issues, pulls, range]);

  const activitySummary = useMemo(() => {
    const values = activitySeries.datasets[0]?.data ?? [];
    const total = values.reduce((sum, value) => sum + value, 0);
    const maxValue = Math.max(0, ...values);
    const peakIndex = values.findIndex((value) => value === maxValue);
    const peakLabel = activitySeries.labels[peakIndex] ?? "N/A";
    return { total, maxValue, peakLabel };
  }, [activitySeries]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-foreground/15 bg-card p-6 text-sm text-foreground/60">
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-warning/40 bg-warning/10 p-6 text-sm text-foreground/80">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-foreground/10 bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-foreground/60">
              GitHub analytics
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              {profile?.name ?? "GitHub"} dashboard
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              {repos.length} repositories • Live activity insights
            </p>
          </div>
          {profile?.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-12 w-12 rounded-full border border-foreground/10"
            />
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
          <div>
            <label className="text-xs text-foreground/70">Active repository</label>
            <select
              value={selectedRepo?.fullName ?? ""}
              onChange={(event) => {
                const next = repos.find(
                  (repo) => repo.fullName === event.target.value,
                );
                setSelectedRepo(next ?? null);
              }}
              className="mt-1 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm"
            >
              {repos.map((repo) => (
                <option key={repo.fullName} value={repo.fullName}>
                  {repo.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-foreground/70">Time range</label>
            <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
              {(["7d", "30d", "90d"] as Range[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value)}
                  className={`rounded-md border px-3 py-2 font-semibold ${
                    range === value
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/15 bg-background text-foreground/70"
                  }`}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Open issues" value={issueCounts.open} />
        <Metric label="Closed issues" value={issueCounts.closed} />
        <Metric label="Open PRs" value={pullCounts.open} />
        <Metric label="Closed PRs" value={pullCounts.closed} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
          <Graph
            data={activitySeries}
            title="Activity trend"
            showLegend={false}
            size="lg"
            variant="solid"
            ariaLabel={`Activity trend over ${range}. Total activity ${activitySummary.total}. Peak ${activitySummary.maxValue} on ${activitySummary.peakLabel}.`}
          />
          <p className="mt-2 text-xs text-foreground/60">
            Total activity: {activitySummary.total}. Peak day: {activitySummary.peakLabel}
            {activitySummary.maxValue ? ` (${activitySummary.maxValue})` : ""}.
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
          <Graph
            data={{
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
                  color: "var(--chart-4)",
                },
              ],
            }}
            title="Issues vs PRs"
            showLegend
            size="lg"
            variant="bordered"
            ariaLabel={`Issues vs PRs chart. Issues open ${issueCounts.open}, closed ${issueCounts.closed}. PRs open ${pullCounts.open}, closed ${pullCounts.closed}.`}
          />
          <p className="mt-2 text-xs text-foreground/60">
            Issues: {issueCounts.open} open, {issueCounts.closed} closed. PRs:
            {" "}{pullCounts.open} open, {pullCounts.closed} closed.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Latest issues</h2>
          <div className="mt-3 space-y-2 text-sm">
            {issues.slice(0, 5).map((issue) => (
              <a
                key={issue.id}
                href={issue.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-md border border-foreground/10 px-3 py-2 hover:bg-foreground/5"
              >
                <span className="font-medium text-foreground">
                  #{issue.number} {issue.title}
                </span>
                <span className="text-xs text-foreground/60">
                  {issue.state}
                </span>
              </a>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Latest pull requests</h2>
          <div className="mt-3 space-y-2 text-sm">
            {pulls.slice(0, 5).map((pull) => (
              <a
                key={pull.id}
                href={pull.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-md border border-foreground/10 px-3 py-2 hover:bg-foreground/5"
              >
                <span className="font-medium text-foreground">
                  #{pull.number} {pull.title}
                </span>
                <span className="text-xs text-foreground/60">
                  {pull.state}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-foreground/60">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
