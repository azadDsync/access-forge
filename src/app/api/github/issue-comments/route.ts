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
    issueNumber?: number;
    body?: string;
    confirm?: boolean;
  };

  if (!body?.confirm) {
    return Response.json({
      status: "confirmation_required",
      message: "Please confirm the issue comment.",
    });
  }

  if (!body.owner || !body.repo || !body.issueNumber || !body.body) {
    return new Response("owner, repo, issueNumber, and body are required", {
      status: 400,
    });
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${body.owner}/${body.repo}/issues/${body.issueNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "access-forge",
      },
      body: JSON.stringify({ body: body.body }),
    },
  );

  const responseBody = await response.text();
  if (!response.ok) {
    return new Response(responseBody || "GitHub API error", {
      status: response.status,
    });
  }

  const comment = JSON.parse(responseBody) as {
    id: number;
    html_url: string;
    body: string;
    created_at: string;
    user: { login: string } | null;
  };

  return Response.json({
    status: "created",
    message: "Comment added successfully.",
    comment: {
      id: comment.id,
      url: comment.html_url,
      body: comment.body,
      author: comment.user?.login ?? null,
      createdAt: comment.created_at,
    },
  });
}