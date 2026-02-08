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

export async function PUT(request: Request) {
  const token = await getGithubAccessToken(request);
  if (!token) {
    return new Response("GitHub session not found", { status: 401 });
  }

  const body = (await request.json()) as {
    owner?: string;
    repo?: string;
    path?: string;
    content?: string;
    message?: string;
    branch?: string;
    sha?: string;
    confirm?: boolean;
  };

  if (!body?.confirm) {
    return Response.json({
      status: "confirmation_required",
      message: "Please confirm file update.",
    });
  }

  if (!body.owner || !body.repo || !body.path || !body.content || !body.message) {
    return new Response("owner, repo, path, content, and message are required", {
      status: 400,
    });
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${body.owner}/${body.repo}/contents/${body.path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "access-forge",
      },
      body: JSON.stringify({
        message: body.message,
        content: Buffer.from(body.content, "utf-8").toString("base64"),
        branch: body.branch,
        sha: body.sha,
      }),
    },
  );

  const responseBody = await response.text();
  if (!response.ok) {
    return new Response(responseBody || "GitHub API error", {
      status: response.status,
    });
  }

  const result = JSON.parse(responseBody) as {
    content?: { sha?: string; path?: string };
    commit?: { sha?: string; html_url?: string };
  };

  return Response.json({
    status: "updated",
    message: "File updated successfully.",
    path: result.content?.path,
    sha: result.content?.sha,
    commitUrl: result.commit?.html_url,
  });
}
