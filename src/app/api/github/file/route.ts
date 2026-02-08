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
  const path = url.searchParams.get("path");
  const ref = url.searchParams.get("ref") ?? undefined;

  if (!owner || !repo || !path) {
    return new Response("owner, repo, and path are required", { status: 400 });
  }

  const contentUrl = new URL(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
  );
  if (ref) contentUrl.searchParams.set("ref", ref);

  const response = await fetch(contentUrl.toString(), {
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

  const payload = JSON.parse(body) as
    | {
        type?: string;
        name?: string;
        path?: string;
        sha?: string;
        size?: number;
        content?: string;
        encoding?: string;
      }
    | Array<unknown>;

  if (Array.isArray(payload)) {
    return new Response("Path is a directory, not a file", { status: 400 });
  }

  const encoded = payload.content ?? "";
  const content =
    payload.encoding === "base64"
      ? Buffer.from(encoded, "base64").toString("utf-8")
      : encoded;

  return Response.json({
    name: payload.name,
    path: payload.path,
    sha: payload.sha,
    size: payload.size,
    content,
  });
}
