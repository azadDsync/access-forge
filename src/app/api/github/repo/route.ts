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

  if (!owner || !repo) {
    return new Response("owner and repo are required", { status: 400 });
  }

  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
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

  const repoData = JSON.parse(body) as {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    description: string | null;
    html_url: string;
    updated_at: string;
    owner: { login: string } | null;
    default_branch?: string;
    topics?: string[];
    open_issues_count?: number;
  };

  return Response.json({
    repo: {
      id: repoData.id,
      name: repoData.name,
      fullName: repoData.full_name,
      private: repoData.private,
      description: repoData.description,
      htmlUrl: repoData.html_url,
      updatedAt: repoData.updated_at,
      owner: repoData.owner?.login ?? owner,
      defaultBranch: repoData.default_branch,
      topics: repoData.topics ?? [],
      openIssuesCount: repoData.open_issues_count ?? 0,
    },
  });
}