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
  const query = url.searchParams.get("q");

  if (!query) {
    return new Response("q is required", { status: 400 });
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/search/code?q=${encodeURIComponent(query)}`,
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

  const payload = JSON.parse(body) as {
    total_count?: number;
    items?: Array<{
      name?: string;
      path?: string;
      html_url?: string;
      sha?: string;
      repository?: { full_name?: string };
    }>;
  };

  return Response.json({
    total: payload.total_count ?? 0,
    results:
      payload.items?.map((item) => ({
        name: item.name ?? "",
        path: item.path ?? "",
        htmlUrl: item.html_url ?? "",
        sha: item.sha ?? "",
        repository: item.repository?.full_name ?? "",
      })) ?? [],
  });
}
