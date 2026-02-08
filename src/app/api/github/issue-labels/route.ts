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
    labels?: string[];
    confirm?: boolean;
  };

  if (!body?.confirm) {
    return Response.json({
      status: "confirmation_required",
      message: "Please confirm label updates.",
    });
  }

  if (!body.owner || !body.repo || !body.issueNumber || !body.labels?.length) {
    return new Response("owner, repo, issueNumber, and labels are required", {
      status: 400,
    });
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${body.owner}/${body.repo}/issues/${body.issueNumber}/labels`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "access-forge",
      },
      body: JSON.stringify({ labels: body.labels }),
    },
  );

  const responseBody = await response.text();
  if (!response.ok) {
    return new Response(responseBody || "GitHub API error", {
      status: response.status,
    });
  }

  const labels = JSON.parse(responseBody) as Array<{ name?: string }>;

  return Response.json({
    status: "updated",
    message: "Labels updated successfully.",
    labels: labels.map((label) => label.name ?? "").filter(Boolean),
  });
}