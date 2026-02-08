import { auth } from "@/lib/auth";

const GITHUB_API_BASE = "https://api.github.com";

async function getGithubAccessToken(request: Request) {
  try {
    const tokenResponse = await auth.api.getAccessToken({
      headers: request.headers,
      body: { providerId: "github" },
    });

    return tokenResponse.accessToken;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const token = await getGithubAccessToken(request);
  if (!token) {
    return new Response("GitHub session not found", { status: 401 });
  }

  const url = new URL(request.url);
  const owner = url.searchParams.get("owner");
  const repo = url.searchParams.get("repo");
  const issueNumber = url.searchParams.get("issueNumber");

  if (!owner || !repo) {
    return new Response("owner and repo are required", { status: 400 });
  }

  if (issueNumber) {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "access-forge",
        },
      },
    );

    const body = await response.text();
    if (!response.ok) {
      return new Response(body || "GitHub API error", {
        status: response.status,
      });
    }

    const issue = JSON.parse(body) as {
      id: number;
      number: number;
      title: string;
      body: string | null;
      state: "open" | "closed";
      html_url: string;
      labels: Array<{ name: string }>;
      updated_at: string;
      user: { login: string } | null;
      pull_request?: unknown;
    };

    if (issue.pull_request) {
      return new Response("This issue is a pull request", { status: 400 });
    }

    return Response.json({
      issue: {
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        url: issue.html_url,
        labels: issue.labels?.map((label) => label.name) ?? [],
        updatedAt: issue.updated_at,
        author: issue.user?.login ?? null,
      },
    });
  }

  const githubUrl = new URL(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`,
  );
  const allowed = ["labels", "state", "per_page", "page"];
  allowed.forEach((key) => {
    const value = url.searchParams.get(key === "labels" ? "label" : key);
    if (value) githubUrl.searchParams.set(key, value);
  });

  const response = await fetch(githubUrl.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "access-forge",
    },
  });

  const body = await response.text();
  if (!response.ok) {
    return new Response(body || "GitHub API error", { status: response.status });
  }

  const issues = (JSON.parse(body) as Array<{
    id: number;
    number: number;
    title: string;
    state: "open" | "closed";
    html_url: string;
    labels: Array<{ name: string }>;
    updated_at: string;
    user: { login: string } | null;
    pull_request?: unknown;
  }>).filter((issue) => !issue.pull_request);

  const normalized = issues.map((issue) => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    url: issue.html_url,
    labels: issue.labels?.map((label) => label.name) ?? [],
    updatedAt: issue.updated_at,
    author: issue.user?.login ?? null,
  }));

  return Response.json({ issues: normalized });
}

export async function PATCH(request: Request) {
  const token = await getGithubAccessToken(request);
  if (!token) {
    return new Response("GitHub session not found", { status: 401 });
  }

  const body = (await request.json()) as {
    owner?: string;
    repo?: string;
    issueNumber?: number;
    title?: string;
    body?: string;
    state?: "open" | "closed";
    confirm?: boolean;
  };

  if (!body?.confirm) {
    return Response.json({
      status: "confirmation_required",
      message: "Please confirm the issue update.",
    });
  }

  if (!body.owner || !body.repo || !body.issueNumber) {
    return new Response("owner, repo, and issueNumber are required", {
      status: 400,
    });
  }

  const payload: { title?: string; body?: string; state?: "open" | "closed" } = {};
  if (body.title) payload.title = body.title;
  if (body.body) payload.body = body.body;
  if (body.state) payload.state = body.state;

  if (!payload.title && !payload.body && !payload.state) {
    return new Response("title, body, or state must be provided", {
      status: 400,
    });
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${body.owner}/${body.repo}/issues/${body.issueNumber}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "access-forge",
      },
      body: JSON.stringify(payload),
    },
  );

  const responseBody = await response.text();
  if (!response.ok) {
    return new Response(responseBody || "GitHub API error", {
      status: response.status,
    });
  }

  const issue = JSON.parse(responseBody) as {
    id: number;
    number: number;
    title: string;
    body: string | null;
    state: "open" | "closed";
    html_url: string;
    labels: Array<{ name: string }>;
    updated_at: string;
    user: { login: string } | null;
  };

  return Response.json({
    status: "updated",
    message: "Issue updated successfully.",
    issue: {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      url: issue.html_url,
      labels: issue.labels?.map((label) => label.name) ?? [],
      updatedAt: issue.updated_at,
      author: issue.user?.login ?? null,
    },
  });
}
