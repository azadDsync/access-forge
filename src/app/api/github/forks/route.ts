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
    organization?: string;
    confirm?: boolean;
  };

  if (!body?.confirm) {
    return Response.json({
      status: "confirmation_required",
      message: "Please confirm forking this repository.",
    });
  }

  if (!body.owner || !body.repo) {
    return new Response("owner and repo are required", { status: 400 });
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${body.owner}/${body.repo}/forks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "access-forge",
      },
      body: JSON.stringify({
        ...(body.organization ? { organization: body.organization } : {}),
      }),
    },
  );

  const responseBody = await response.text();
  if (!response.ok) {
    return new Response(responseBody || "GitHub API error", {
      status: response.status,
    });
  }

  const repo = JSON.parse(responseBody) as {
    id: number;
    full_name: string;
    html_url: string;
    owner: { login: string };
  };

  return Response.json({
    status: "created",
    message: `Fork created: ${repo.full_name}.`,
    fork: {
      id: repo.id,
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      owner: repo.owner?.login ?? "",
    },
  });
}
