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
  const ref = url.searchParams.get("ref") ?? "main";
  const recursive = url.searchParams.get("recursive") ?? "1";

  if (!owner || !repo) {
    return new Response("owner and repo are required", { status: 400 });
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${ref}?recursive=${recursive}`,
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
    return new Response(body || "GitHub API error", { status: response.status });
  }

  const tree = JSON.parse(body) as {
    sha?: string;
    tree?: Array<{
      path?: string;
      type?: string;
      sha?: string;
      size?: number;
    }>;
  };

  return Response.json({
    sha: tree.sha,
    entries:
      tree.tree?.map((entry) => ({
        path: entry.path ?? "",
        type: entry.type ?? "",
        sha: entry.sha ?? "",
        size: entry.size,
      })) ?? [],
  });
}
