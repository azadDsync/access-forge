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

export async function POST(request: Request) {
  const token = await getGithubAccessToken(request);
  if (!token) {
    return new Response("GitHub session not found", { status: 401 });
  }

  const body = (await request.json()) as {
    owner?: string;
    repo?: string;
    title?: string;
    body?: string;
    head?: string;
    base?: string;
    draft?: boolean;
    confirm?: boolean;
  };

  if (!body?.confirm) {
    return Response.json({
      status: "confirmation_required",
      message: "Please confirm the pull request creation.",
    });
  }

  if (!body.owner || !body.repo || !body.title || !body.head || !body.base) {
    return new Response(
      "owner, repo, title, head, and base are required",
      { status: 400 },
    );
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${body.owner}/${body.repo}/pulls`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "access-forge",
      },
      body: JSON.stringify({
        title: body.title,
        body: body.body,
        head: body.head,
        base: body.base,
        draft: body.draft ?? false,
      }),
    },
  );

  const responseBody = await response.text();
  if (!response.ok) {
    return new Response(responseBody || "GitHub API error", {
      status: response.status,
    });
  }

  const pull = JSON.parse(responseBody) as {
    id: number;
    number: number;
    title: string;
    html_url: string;
    state: string;
  };

  return Response.json({
    status: "created",
    message: `Pull request #${pull.number} created successfully.`,
    pull: {
      id: pull.id,
      number: pull.number,
      title: pull.title,
      url: pull.html_url,
      state: pull.state,
    },
  });
}

export async function GET(request: Request) {
  const token = await getGithubAccessToken(request);
  if (!token) {
    return new Response("GitHub session not found", { status: 401 });
  }

  const url = new URL(request.url);
  const owner = url.searchParams.get("owner");
  const repo = url.searchParams.get("repo");

  if (!owner || !repo) {
    return new Response("owner and repo are required", { status: 400 });
  }

  const githubUrl = new URL(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`,
  );

  const allowed = ["state", "per_page", "page", "base", "head", "sort", "direction"];
  allowed.forEach((key) => {
    const value = url.searchParams.get(key);
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

  const pulls = JSON.parse(body) as Array<{
    id: number;
    number: number;
    title: string;
    state: string;
    html_url: string;
    updated_at: string;
    user: { login: string } | null;
  }>;

  return Response.json({
    pulls: pulls.map((pull) => ({
      id: pull.id,
      number: pull.number,
      title: pull.title,
      state: pull.state,
      url: pull.html_url,
      updatedAt: pull.updated_at,
      author: pull.user?.login ?? null,
    })),
  });
}
