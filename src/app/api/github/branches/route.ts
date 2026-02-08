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
    base?: string;
    branch?: string;
    confirm?: boolean;
  };

  if (!body?.confirm) {
    return Response.json({
      status: "confirmation_required",
      message: "Please confirm branch creation.",
    });
  }

  if (!body.owner || !body.repo || !body.base || !body.branch) {
    return new Response("owner, repo, base, and branch are required", {
      status: 400,
    });
  }

  const baseRefRes = await fetch(
    `${GITHUB_API_BASE}/repos/${body.owner}/${body.repo}/git/ref/heads/${body.base}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "access-forge",
      },
    },
  );

  const baseRefBody = await baseRefRes.text();
  if (!baseRefRes.ok) {
    return new Response(baseRefBody || "Failed to resolve base branch", {
      status: baseRefRes.status,
    });
  }

  const baseRef = JSON.parse(baseRefBody) as { object?: { sha?: string } };
  const baseSha = baseRef.object?.sha;
  if (!baseSha) {
    return new Response("Base branch SHA not found", { status: 400 });
  }

  const createRes = await fetch(
    `${GITHUB_API_BASE}/repos/${body.owner}/${body.repo}/git/refs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "access-forge",
      },
      body: JSON.stringify({
        ref: `refs/heads/${body.branch}`,
        sha: baseSha,
      }),
    },
  );

  const createBody = await createRes.text();
  if (!createRes.ok) {
    return new Response(createBody || "Failed to create branch", {
      status: createRes.status,
    });
  }

  const ref = JSON.parse(createBody) as { ref?: string; object?: { sha?: string } };

  return Response.json({
    status: "created",
    message: `Branch ${body.branch} created from ${body.base}.`,
    ref: ref.ref,
    sha: ref.object?.sha ?? baseSha,
  });
}
