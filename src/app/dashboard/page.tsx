"use client";

import AppHeader from "@/components/static-ui/AppHeader";
import Footer from "@/components/static-ui/Footer";
import GitHubDashboardPage from "@/components/github/GitHubDashboardPage";
import GitHubMcpOnboarding from "@/components/github/GitHubMcpOnboarding";
import GitHubMcpQuickStart from "@/components/github/GitHubMcpQuickStart";
import GitHubMcpStatus from "@/components/github/GitHubMcpStatus";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { useSession } from "@/lib/auth-client";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";

export default function DashboardPage() {
  const mcpServers = useMcpServers();
  const { data: session } = useSession();

  return (
    <AccessibilityProvider>
      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        components={components}
        tools={tools}
        tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
        mcpServers={mcpServers}
        userToken={session?.session?.token}
      >
        <TamboMcpProvider>
          <div className="min-h-screen flex flex-col bg-background">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-foreground focus:rounded focus:outline-none focus:ring-4 focus:ring-ring"
            >
              Skip to main content
            </a>
            <AppHeader />
            <main
              id="main-content"
              className="flex-1 px-6 py-6"
              role="main"
              aria-label="Analytics dashboard"
            >
              <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <GitHubDashboardPage />
                <div className="flex flex-col gap-6">
                  <section className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-foreground/60">
                          AI studio
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-foreground">
                          GitHub copilot workspace
                        </h2>
                        <p className="mt-1 text-xs text-foreground/60">
                          Ask for repo insights, issue triage, and PR assistance.
                        </p>
                      </div>
                      <GitHubMcpStatus />
                    </div>
                    <div className="mt-4 h-[560px]">
                      <MessageThreadFull
                        className="h-full"
                        showHistory={false}
                        showGitHubBanners
                        inputPlaceholder="Ask about your GitHub projects..."
                        initialSuggestions={[
                          {
                            id: "gh-1",
                            title: "List my repositories",
                            detailedSuggestion: "List my repositories",
                            messageId: "list-repos",
                          },
                          {
                            id: "gh-2",
                            title: "Triage accessibility issues",
                            detailedSuggestion:
                              "Find open issues labeled accessibility in my repos",
                            messageId: "triage-issues",
                          },
                          {
                            id: "gh-3",
                            title: "Create a repo",
                            detailedSuggestion:
                              "Create a new repository named access-forge with description 'Accessible GitHub workflows'",
                            messageId: "create-repo",
                          },
                        ]}
                      />
                    </div>
                  </section>
                  <GitHubMcpOnboarding />
                  <GitHubMcpQuickStart />
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </TamboMcpProvider>
      </TamboProvider>
    </AccessibilityProvider>
  );
}
