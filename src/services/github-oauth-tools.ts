export interface GitHubRepoSummary {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  htmlUrl: string;
  updatedAt: string;
  owner: string;
}

export interface GitHubRepoDetail extends GitHubRepoSummary {
  defaultBranch?: string;
  topics?: string[];
  openIssuesCount?: number;
}

export interface ListReposInput {
  visibility?: "all" | "public" | "private";
  perPage?: number;
  page?: number;
  sort?: "created" | "updated" | "pushed" | "full_name";
  direction?: "asc" | "desc";
}

export async function listGithubRepos(input: ListReposInput) {
  const params = new URLSearchParams();
  if (input.visibility) params.set("visibility", input.visibility);
  if (input.perPage) params.set("per_page", String(input.perPage));
  if (input.page) params.set("page", String(input.page));
  if (input.sort) params.set("sort", input.sort);
  if (input.direction) params.set("direction", input.direction);

  const response = await fetch(`/api/github/repos?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to list repositories.");
  }

  return (await response.json()) as { repos: GitHubRepoSummary[] };
}

export interface GetRepoInput {
  owner: string;
  repo: string;
}

export async function getGithubRepo(input: GetRepoInput) {
  const params = new URLSearchParams();
  params.set("owner", input.owner);
  params.set("repo", input.repo);

  const response = await fetch(`/api/github/repo?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch repository details.");
  }

  return (await response.json()) as { repo: GitHubRepoDetail };
}

export interface CreateRepoInput {
  name: string;
  description: string;
  visibility?: "public" | "private";
  includeReadme?: boolean;
  topics?: string[];
  confirm?: boolean;
}

export async function createGithubRepo(input: CreateRepoInput) {
  const response = await fetch("/api/github/repos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create repository.");
  }

  return (await response.json()) as {
    status: "confirmation_required" | "created";
    message: string;
    repo?: GitHubRepoSummary;
  };
}

export interface CreateBranchInput {
  owner: string;
  repo: string;
  base: string;
  branch: string;
  confirm?: boolean;
}

export async function createGithubBranch(input: CreateBranchInput) {
  const response = await fetch("/api/github/branches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create branch.");
  }

  return (await response.json()) as {
    status: "confirmation_required" | "created";
    message: string;
    ref?: string;
    sha?: string;
  };
}

export interface UpsertFileInput {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch?: string;
  sha?: string;
  confirm?: boolean;
}

export async function upsertGithubFile(input: UpsertFileInput) {
  const response = await fetch("/api/github/contents", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to update file.");
  }

  return (await response.json()) as {
    status: "confirmation_required" | "updated";
    message: string;
    path?: string;
    sha?: string;
    commitUrl?: string;
  };
}

export interface CreateForkInput {
  owner: string;
  repo: string;
  organization?: string;
  confirm?: boolean;
}

export async function createGithubFork(input: CreateForkInput) {
  const response = await fetch("/api/github/forks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fork repository.");
  }

  return (await response.json()) as {
    status: "confirmation_required" | "created";
    message: string;
    fork?: {
      id: number;
      fullName: string;
      htmlUrl: string;
      owner: string;
    };
  };
}

export interface ListRepoTreeInput {
  owner: string;
  repo: string;
  ref?: string;
  recursive?: boolean;
}

export async function listGithubRepoTree(input: ListRepoTreeInput) {
  const params = new URLSearchParams();
  params.set("owner", input.owner);
  params.set("repo", input.repo);
  if (input.ref) params.set("ref", input.ref);
  if (input.recursive !== undefined) {
    params.set("recursive", input.recursive ? "1" : "0");
  }

  const response = await fetch(`/api/github/tree?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to list repository files.");
  }

  return (await response.json()) as {
    sha?: string;
    entries: Array<{
      path: string;
      type: string;
      sha: string;
      size?: number;
    }>;
  };
}

export interface GetFileContentInput {
  owner: string;
  repo: string;
  path: string;
  ref?: string;
}

export async function getGithubFileContent(input: GetFileContentInput) {
  const params = new URLSearchParams();
  params.set("owner", input.owner);
  params.set("repo", input.repo);
  params.set("path", input.path);
  if (input.ref) params.set("ref", input.ref);

  const response = await fetch(`/api/github/file?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to read file.");
  }

  return (await response.json()) as {
    name?: string;
    path?: string;
    sha?: string;
    size?: number;
    content: string;
  };
}

export interface SearchCodeInput {
  query: string;
}

export async function searchGithubCode(input: SearchCodeInput) {
  const params = new URLSearchParams();
  params.set("q", input.query);

  const response = await fetch(`/api/github/search?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to search code.");
  }

  return (await response.json()) as {
    total: number;
    results: Array<{
      name: string;
      path: string;
      htmlUrl: string;
      sha: string;
      repository: string;
    }>;
  };
}

export interface ListIssuesInput {
  owner: string;
  repo: string;
  label?: string;
  state?: "open" | "closed" | "all";
  perPage?: number;
  page?: number;
}

export async function listGithubIssues(input: ListIssuesInput) {
  const params = new URLSearchParams();
  if (input.label) params.set("labels", input.label);
  if (input.state) params.set("state", input.state);
  if (input.perPage) params.set("per_page", String(input.perPage));
  if (input.page) params.set("page", String(input.page));

  const response = await fetch(
    `/api/github/issues?owner=${encodeURIComponent(input.owner)}&repo=${encodeURIComponent(input.repo)}&${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to list issues.");
  }

  return (await response.json()) as {
    issues: Array<{
      id: number;
      number: number;
      title: string;
      state: "open" | "closed";
      url: string;
      labels: string[];
      updatedAt: string;
      author: string | null;
    }>;
  };
}

export interface GetIssueInput {
  owner: string;
  repo: string;
  issueNumber: number;
}

export async function getGithubIssue(input: GetIssueInput) {
  const response = await fetch(
    `/api/github/issues?owner=${encodeURIComponent(input.owner)}&repo=${encodeURIComponent(input.repo)}&issueNumber=${input.issueNumber}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch issue.");
  }

  return (await response.json()) as {
    issue: {
      id: number;
      number: number;
      title: string;
      body: string | null;
      state: "open" | "closed";
      url: string;
      labels: string[];
      updatedAt: string;
      author: string | null;
    };
  };
}

export interface UpdateIssueInput {
  owner: string;
  repo: string;
  issueNumber: number;
  title?: string;
  body?: string;
  state?: "open" | "closed";
  confirm?: boolean;
}

export async function updateGithubIssue(input: UpdateIssueInput) {
  const response = await fetch("/api/github/issues", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to update issue.");
  }

  return (await response.json()) as {
    status: "confirmation_required" | "updated";
    message: string;
    issue?: {
      id: number;
      number: number;
      title: string;
      body: string | null;
      state: "open" | "closed";
      url: string;
      labels: string[];
      updatedAt: string;
      author: string | null;
    };
  };
}

export interface AddIssueCommentInput {
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
  confirm?: boolean;
}

export async function addGithubIssueComment(input: AddIssueCommentInput) {
  const response = await fetch("/api/github/issue-comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to add issue comment.");
  }

  return (await response.json()) as {
    status: "confirmation_required" | "created";
    message: string;
    comment?: {
      id: number;
      url: string;
      body: string;
      author: string | null;
      createdAt: string;
    };
  };
}

export interface AddIssueLabelsInput {
  owner: string;
  repo: string;
  issueNumber: number;
  labels: string[];
  confirm?: boolean;
}

export async function addGithubIssueLabels(input: AddIssueLabelsInput) {
  const response = await fetch("/api/github/issue-labels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to add issue labels.");
  }

  return (await response.json()) as {
    status: "confirmation_required" | "updated";
    message: string;
    labels?: string[];
  };
}

export interface CreatePullRequestInput {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  head: string;
  base: string;
  draft?: boolean;
  confirm?: boolean;
}

export async function createGithubPullRequest(input: CreatePullRequestInput) {
  const response = await fetch("/api/github/pulls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create pull request.");
  }

  return (await response.json()) as {
    status: "confirmation_required" | "created";
    message: string;
    pull?: {
      id: number;
      number: number;
      title: string;
      url: string;
      state: string;
    };
  };
}
