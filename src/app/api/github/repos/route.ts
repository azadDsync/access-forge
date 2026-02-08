import { auth } from "@/lib/auth";

const GITHUB_API_BASE = "https://api.github.com";

async function getGithubAccessToken(request: Request) {
	const cookie = request.headers.get("cookie");
	if (!cookie) return null;
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
	const params = url.searchParams;
	const githubUrl = new URL(`${GITHUB_API_BASE}/user/repos`);

	const allowed = ["visibility", "per_page", "page", "sort", "direction"];
	allowed.forEach((key) => {
		const value = params.get(key);
		if (value) githubUrl.searchParams.set(key, value);
	});

	const response = await fetch(githubUrl.toString(), {
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

	const repos = (await response.json()) as Array<{
		id: number;
		name: string;
		full_name: string;
		private: boolean;
		description: string | null;
		html_url: string;
		updated_at: string;
		owner: { login: string };
	}>;

	const normalized = repos.map((repo) => ({
		id: repo.id,
		name: repo.name,
		fullName: repo.full_name,
		private: repo.private,
		description: repo.description,
		htmlUrl: repo.html_url,
		updatedAt: repo.updated_at,
		owner: repo.owner?.login ?? "",
	}));

	return Response.json({ repos: normalized });
}

export async function POST(request: Request) {
	const token = await getGithubAccessToken(request);
	if (!token) {
		return new Response("GitHub session not found", { status: 401 });
	}

	const body = (await request.json()) as {
		name?: string;
		description?: string;
		visibility?: "public" | "private";
		includeReadme?: boolean;
		topics?: string[];
		confirm?: boolean;
	};

	if (!body?.confirm) {
		return Response.json({
			status: "confirmation_required",
			message: "Please confirm the repository creation.",
		});
	}

	if (!body.name || !body.description) {
		return new Response("Name and description are required", { status: 400 });
	}

	const payload = {
		name: body.name,
		description: body.description,
		private: body.visibility !== "public",
		auto_init: body.includeReadme ?? true,
		...(body.topics?.length ? { topics: body.topics } : {}),
	};

	const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github+json",
			"Content-Type": "application/json",
			"User-Agent": "access-forge",
		},
		body: JSON.stringify(payload),
	});

	const responseBody = await response.text();
	if (!response.ok) {
		return new Response(responseBody || "GitHub API error", {
			status: response.status,
		});
	}

	const repo = JSON.parse(responseBody) as {
		id: number;
		name: string;
		full_name: string;
		private: boolean;
		description: string | null;
		html_url: string;
		updated_at: string;
		owner: { login: string };
	};

	return Response.json({
		status: "created",
		message: `Repository ${repo.full_name} created successfully.`,
		repo: {
			id: repo.id,
			name: repo.name,
			fullName: repo.full_name,
			private: repo.private,
			description: repo.description,
			htmlUrl: repo.html_url,
			updatedAt: repo.updated_at,
			owner: repo.owner?.login ?? "",
		},
	});
}
