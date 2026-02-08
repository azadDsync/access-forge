"use client";

import AdaptiveChatLayout from "@/components/accessibility/AdaptiveChatLayout";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";
import AppHeader from "@/components/static-ui/AppHeader";
import Footer from "@/components/static-ui/Footer";
import { useSession } from "@/lib/auth-client";

/**
 * Home page component that renders the Tambo chat interface.
 *
 * @remarks
 * The `NEXT_PUBLIC_TAMBO_URL` environment variable specifies the URL of the Tambo server.
 * You do not need to set it if you are using the default Tambo server.
 * It is only required if you are running the API server locally.
 *
 * @see {@link https://github.com/tambo-ai/tambo/blob/main/CONTRIBUTING.md} for instructions on running the API server locally.
 */
export default function Home() {
  // Load MCP server configurations
  const mcpServers = useMcpServers();
  const { data: session } = useSession();
  const contextHelpers = {
    githubRepoCreation: () => ({
      instructions:
        "When the user wants to create a GitHub repo, render the GitHubRepoCreator component to collect name + description (required) and optional settings. After confirmation, send a creation request through the GitHub MCP server.",
      requiredFields: ["name", "description"],
      defaults: {
        visibility: "private",
        includeReadme: true,
      },
      mcpConnected: mcpServers.length > 0,
    }),
    contributionFlow: () => ({
      instructions:
        "When the user asks to contribute to a repo/issue, render the ContributionFlow component to collect repo, issue number, fork owner, branch, file changes, commit message, and PR details. Ensure the flow forks first, then creates a branch and commits on the fork, and finally opens a PR to the upstream repo. Ask follow-up questions if any required data is missing.",
      requiredFields: ["owner", "repo", "issueNumber"],
    }),
    issueTriage: () => ({
      instructions:
        "When the user wants to triage issues, use listGitHubIssues to fetch by label/state, then offer to add labels, add comments, or close/reopen issues. Confirm before write actions (labels, comments, or updates).",
      requiredFields: ["owner", "repo"],
    }),
  };

  return (
    <AccessibilityProvider>
      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        components={components}
        tools={tools}
        tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
        mcpServers={mcpServers}
        contextHelpers={contextHelpers}
        userToken={session?.session?.token}
      >
        <TamboMcpProvider>
          <div className="min-h-screen bg-background">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-foreground focus:rounded focus:outline-none focus:ring-4 focus:ring-ring"
            >
              Skip to main content
            </a>
            <AppHeader />
            <main
              id="main-content"
              className="flex-1 min-h-0 flex flex-col"
              role="main"
              aria-label="Chat"
            >
              <AdaptiveChatLayout>
                <div className="h-[93vh]">
                  <MessageThreadFull className="max-w-4xl mx-auto" />
                </div>
              </AdaptiveChatLayout>
            </main>
            <Footer />
          </div>
        </TamboMcpProvider>
      </TamboProvider>
    </AccessibilityProvider>
  );
}
