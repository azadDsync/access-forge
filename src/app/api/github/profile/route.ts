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

  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "access-forge",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    return new Response(message || "GitHub API error", {
      status: response.status,
    });
  }

  const profile = (await response.json()) as {
    login: string;
    name: string | null;
    avatar_url: string | null;
    html_url: string;
  };

  return Response.json({
    login: profile.login,
    name: profile.name ?? profile.login,
    avatarUrl: profile.avatar_url,
    htmlUrl: profile.html_url,
  });
}
