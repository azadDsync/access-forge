/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import GitHubRepoCreator, {
  gitHubRepoCreatorSchema,
} from "@/components/github/GitHubRepoCreator";
import ContributionFlowCard, {
  contributionFlowSchema,
} from "@/components/github/ContributionFlowCard";
import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import {
  getChannelPerformance,
  getKPIs,
  getRevenueTrend,
  getTopProducts,
  getUserGrowth,
} from "@/services/analytics-data";
import {
  createGithubRepo,
  createGithubBranch,
  createGithubFork,
  createGithubPullRequest,
  addGithubIssueComment,
  addGithubIssueLabels,
  getGithubRepo,
  getGithubIssue,
  getGithubFileContent,
  listGithubRepos,
  listGithubIssues,
  listGithubRepoTree,
  searchGithubCode,
  updateGithubIssue,
  upsertGithubFile,
} from "@/services/github-oauth-tools";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "listGitHubRepos",
    description:
      "List repositories for the signed-in GitHub user via OAuth (supports public/private depending on scopes).",
    tool: listGithubRepos,
    inputSchema: z.object({
      visibility: z.enum(["all", "public", "private"]).optional(),
      perPage: z.number().min(1).max(100).optional(),
      page: z.number().min(1).optional(),
      sort: z.enum(["created", "updated", "pushed", "full_name"]).optional(),
      direction: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.object({
      repos: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          fullName: z.string(),
          private: z.boolean(),
          description: z.string().nullable(),
          htmlUrl: z.string(),
          updatedAt: z.string(),
          owner: z.string(),
        }),
      ),
    }),
  },
  {
    name: "getGitHubRepo",
    description:
      "Fetch details for a specific repository by owner/name for the signed-in GitHub user.",
    tool: getGithubRepo,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
    }),
    outputSchema: z.object({
      repo: z.object({
        id: z.number(),
        name: z.string(),
        fullName: z.string(),
        private: z.boolean(),
        description: z.string().nullable(),
        htmlUrl: z.string(),
        updatedAt: z.string(),
        owner: z.string(),
        defaultBranch: z.string().optional(),
        topics: z.array(z.string()).optional(),
        openIssuesCount: z.number().optional(),
      }),
    }),
  },
  {
    name: "createGitHubRepo",
    description:
      "Create a GitHub repository for the signed-in user. Requires explicit confirmation.",
    tool: createGithubRepo,
    inputSchema: z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      visibility: z.enum(["public", "private"]).optional(),
      includeReadme: z.boolean().optional(),
      topics: z.array(z.string()).optional(),
      confirm: z.boolean().optional(),
    }),
    outputSchema: z.object({
      status: z.enum(["confirmation_required", "created"]),
      message: z.string(),
      repo: z
        .object({
          id: z.number(),
          name: z.string(),
          fullName: z.string(),
          private: z.boolean(),
          description: z.string().nullable(),
          htmlUrl: z.string(),
          updatedAt: z.string(),
          owner: z.string(),
        })
        .optional(),
    }),
  },
  {
    name: "listGitHubIssues",
    description:
      "List issues for a repository (optionally filtered by label) for the signed-in GitHub user.",
    tool: listGithubIssues,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      label: z.string().optional(),
      state: z.enum(["open", "closed", "all"]).optional(),
      perPage: z.number().min(1).max(100).optional(),
      page: z.number().min(1).optional(),
    }),
    outputSchema: z.object({
      issues: z.array(
        z.object({
          id: z.number(),
          number: z.number(),
          title: z.string(),
          state: z.enum(["open", "closed"]),
          url: z.string(),
          labels: z.array(z.string()),
          updatedAt: z.string(),
          author: z.string().nullable(),
        }),
      ),
    }),
  },
  {
    name: "getGitHubIssue",
    description: "Fetch a single issue by number from a repository.",
    tool: getGithubIssue,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      issueNumber: z.number().int().min(1),
    }),
    outputSchema: z.object({
      issue: z.object({
        id: z.number(),
        number: z.number(),
        title: z.string(),
        body: z.string().nullable(),
        state: z.enum(["open", "closed"]),
        url: z.string(),
        labels: z.array(z.string()),
        updatedAt: z.string(),
        author: z.string().nullable(),
      }),
    }),
  },
  {
    name: "updateGitHubIssue",
    description:
      "Update an issue (title/body/state) for the signed-in GitHub user. Requires explicit confirmation.",
    tool: updateGithubIssue,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      issueNumber: z.number().int().min(1),
      title: z.string().optional(),
      body: z.string().optional(),
      state: z.enum(["open", "closed"]).optional(),
      confirm: z.boolean().optional(),
    }),
    outputSchema: z.object({
      status: z.enum(["confirmation_required", "updated"]),
      message: z.string(),
      issue: z
        .object({
          id: z.number(),
          number: z.number(),
          title: z.string(),
          body: z.string().nullable(),
          state: z.enum(["open", "closed"]),
          url: z.string(),
          labels: z.array(z.string()),
          updatedAt: z.string(),
          author: z.string().nullable(),
        })
        .optional(),
    }),
  },
  {
    name: "addGitHubIssueComment",
    description:
      "Add a comment to an issue for the signed-in GitHub user. Requires explicit confirmation.",
    tool: addGithubIssueComment,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      issueNumber: z.number().int().min(1),
      body: z.string().min(1),
      confirm: z.boolean().optional(),
    }),
    outputSchema: z.object({
      status: z.enum(["confirmation_required", "created"]),
      message: z.string(),
      comment: z
        .object({
          id: z.number(),
          url: z.string(),
          body: z.string(),
          author: z.string().nullable(),
          createdAt: z.string(),
        })
        .optional(),
    }),
  },
  {
    name: "addGitHubIssueLabels",
    description:
      "Add labels to an issue for the signed-in GitHub user. Requires explicit confirmation.",
    tool: addGithubIssueLabels,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      issueNumber: z.number().int().min(1),
      labels: z.array(z.string().min(1)).min(1),
      confirm: z.boolean().optional(),
    }),
    outputSchema: z.object({
      status: z.enum(["confirmation_required", "updated"]),
      message: z.string(),
      labels: z.array(z.string()).optional(),
    }),
  },
  {
    name: "createGitHubPullRequest",
    description:
      "Create a pull request for the signed-in user. Requires explicit confirmation.",
    tool: createGithubPullRequest,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      title: z.string().min(1),
      body: z.string().optional(),
      head: z.string().min(1),
      base: z.string().min(1),
      draft: z.boolean().optional(),
      confirm: z.boolean().optional(),
    }),
    outputSchema: z.object({
      status: z.enum(["confirmation_required", "created"]),
      message: z.string(),
      pull: z
        .object({
          id: z.number(),
          number: z.number(),
          title: z.string(),
          url: z.string(),
          state: z.string(),
        })
        .optional(),
    }),
  },
  {
    name: "createGitHubBranch",
    description:
      "Create a branch from a base branch for the signed-in user. Requires confirmation.",
    tool: createGithubBranch,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      base: z.string().min(1),
      branch: z.string().min(1),
      confirm: z.boolean().optional(),
    }),
    outputSchema: z.object({
      status: z.enum(["confirmation_required", "created"]),
      message: z.string(),
      ref: z.string().optional(),
      sha: z.string().optional(),
    }),
  },
  {
    name: "upsertGitHubFile",
    description:
      "Create or update a file in a repository branch. Requires confirmation.",
    tool: upsertGithubFile,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      path: z.string().min(1),
      content: z.string().min(1),
      message: z.string().min(1),
      branch: z.string().optional(),
      sha: z.string().optional(),
      confirm: z.boolean().optional(),
    }),
    outputSchema: z.object({
      status: z.enum(["confirmation_required", "updated"]),
      message: z.string(),
      path: z.string().optional(),
      sha: z.string().optional(),
      commitUrl: z.string().optional(),
    }),
  },
  {
    name: "createGitHubFork",
    description:
      "Fork a repository to the signed-in user's account (or organization). Requires confirmation.",
    tool: createGithubFork,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      organization: z.string().optional(),
      confirm: z.boolean().optional(),
    }),
    outputSchema: z.object({
      status: z.enum(["confirmation_required", "created"]),
      message: z.string(),
      fork: z
        .object({
          id: z.number(),
          fullName: z.string(),
          htmlUrl: z.string(),
          owner: z.string(),
        })
        .optional(),
    }),
  },
  {
    name: "listGitHubRepoTree",
    description: "List files and folders in a repository (supports recursive).",
    tool: listGithubRepoTree,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      ref: z.string().optional(),
      recursive: z.boolean().optional(),
    }),
    outputSchema: z.object({
      sha: z.string().optional(),
      entries: z.array(
        z.object({
          path: z.string(),
          type: z.string(),
          sha: z.string(),
          size: z.number().optional(),
        }),
      ),
    }),
  },
  {
    name: "getGitHubFileContent",
    description: "Read a file from a repository (decoded).",
    tool: getGithubFileContent,
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      path: z.string().min(1),
      ref: z.string().optional(),
    }),
    outputSchema: z.object({
      name: z.string().optional(),
      path: z.string().optional(),
      sha: z.string().optional(),
      size: z.number().optional(),
      content: z.string(),
    }),
  },
  {
    name: "searchGitHubCode",
    description: "Search code across GitHub repositories.",
    tool: searchGithubCode,
    inputSchema: z.object({
      query: z.string().min(1),
    }),
    outputSchema: z.object({
      total: z.number(),
      results: z.array(
        z.object({
          name: z.string(),
          path: z.string(),
          htmlUrl: z.string(),
          sha: z.string(),
          repository: z.string(),
        }),
      ),
    }),
  },
  {
    name: "getAnalyticsKPIs",
    description:
      "Return KPI snapshots (revenue, active users, retention, NPS) for the requested range and segment.",
    tool: getKPIs,
    inputSchema: z.object({
      range: z.enum(["7d", "30d", "90d"]).optional(),
      segment: z.enum(["All", "Free", "Pro", "Enterprise"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        value: z.number(),
        change: z.number(),
        trend: z.enum(["up", "down", "flat"]),
        format: z.enum(["currency", "number", "percent"]),
      }),
    ),
  },
  {
    name: "getRevenueTrend",
    description:
      "Return revenue trend points for a range/segment to visualize in charts.",
    tool: getRevenueTrend,
    inputSchema: z.object({
      range: z.enum(["7d", "30d", "90d"]).optional(),
      segment: z.enum(["All", "Free", "Pro", "Enterprise"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        label: z.string(),
        value: z.number(),
      }),
    ),
  },
  {
    name: "getUserGrowth",
    description:
      "Return user growth points (total and active) for analytics charts.",
    tool: getUserGrowth,
    inputSchema: z.object({
      range: z.enum(["7d", "30d", "90d"]).optional(),
      segment: z.enum(["All", "Free", "Pro", "Enterprise"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        label: z.string(),
        value: z.number(),
        secondary: z.number().optional(),
      }),
    ),
  },
  {
    name: "getChannelPerformance",
    description:
      "Return signups and conversion performance by acquisition channel.",
    tool: getChannelPerformance,
    inputSchema: z.object({
      segment: z.enum(["All", "Free", "Pro", "Enterprise"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        channel: z.string(),
        signups: z.number(),
        conversionRate: z.number(),
      }),
    ),
  },
  {
    name: "getTopProducts",
    description:
      "Return the top products by revenue and orders for leaderboard cards.",
    tool: getTopProducts,
    inputSchema: z.object({
      limit: z.number().min(1).max(10).optional(),
    }),
    outputSchema: z.array(
      z.object({
        name: z.string(),
        revenue: z.number(),
        orders: z.number(),
      }),
    ),
  },
  // Add more tools here
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "ContributionFlow",
    description:
      "Guided one-command contribution flow. Collects repo, issue, branch, file changes, commit message, and PR details.",
    component: ContributionFlowCard,
    propsSchema: contributionFlowSchema,
  },
  {
    name: "GitHubRepoCreator",
    description:
      "Collects repo name and description before creating a GitHub repository via MCP. Use when a user asks to create a new repo.",
    component: GitHubRepoCreator,
    propsSchema: gitHubRepoCreatorSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  // Add more components here
];
