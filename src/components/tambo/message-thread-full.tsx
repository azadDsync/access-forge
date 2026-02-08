"use client";

import type { messageVariants } from "@/components/tambo/message";
import {
  MessageInput,
  MessageInputError,
  MessageInputFileButton,
  MessageInputMcpPromptButton,
  MessageInputMcpResourceButton,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import {
  MessageSuggestions,
  MessageSuggestionsList,
  MessageSuggestionsStatus,
} from "@/components/tambo/message-suggestions";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { MessageInputMcpConfigButton } from "@/components/tambo/message-input";
import { ThreadContainer, useThreadContainerContext } from "./thread-container";
import GitHubMcpRequiredBanner from "@/components/github/GitHubMcpRequiredBanner";
import AccessibilityInputGuidance from "@/components/accessibility/AccessibilityInputGuidance";
import ScreenReaderTour from "@/components/accessibility/ScreenReaderTour";
import KeyboardShortcutsHelp from "@/components/accessibility/KeyboardShortcutsHelp";
import GitHubMcpIntentBanner from "@/components/github/GitHubMcpIntentBanner";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import {
  ThreadHistory,
  ThreadHistoryHeader,
  ThreadHistoryList,
  ThreadHistoryNewButton,
  ThreadHistorySearch,
} from "@/components/tambo/thread-history";
import { useMergeRefs } from "@/lib/thread-hooks";
import type { Suggestion } from "@tambo-ai/react";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Props for the MessageThreadFull component
 */
export interface MessageThreadFullProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls the visual styling of messages in the thread.
   * Possible values include: "default", "compact", etc.
   * These values are defined in messageVariants from "@/components/tambo/message".
   * @example variant="compact"
   */
  variant?: VariantProps<typeof messageVariants>["variant"];
  /**
   * Optional suggestions list to seed the suggestion rail.
   */
  initialSuggestions?: Suggestion[];
  /**
   * Toggle display of the thread history sidebar.
   * @default true
   */
  showHistory?: boolean;
  /**
   * Toggle GitHub-specific banners for MCP requirements and intent.
   * @default true
   */
  showGitHubBanners?: boolean;
  /**
   * Override the message input placeholder text.
   */
  inputPlaceholder?: string;
  /**
   * Whether to auto-focus the message input on mount (for blind users).
   * @default false
   */
  autoFocus?: boolean;
}

/**
 * A full-screen chat thread component with message history, input, and suggestions
 */
export const MessageThreadFull = React.forwardRef<
  HTMLDivElement,
  MessageThreadFullProps
>(({ className, variant, initialSuggestions, showHistory = true, showGitHubBanners = true, inputPlaceholder, autoFocus = false, ...props }, ref) => {
  const { containerRef, historyPosition } = useThreadContainerContext();
  const mergedRef = useMergeRefs<HTMLDivElement | null>(ref, containerRef);

  // Auto-focus input on mount if requested (for blind users)
  React.useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        const input = document.getElementById("chat-input");
        if (input) {
          (input as HTMLElement).focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Keyboard shortcut: Alt+M to focus input
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.key.toLowerCase() !== "m") return;
      const input = document.getElementById("chat-input");
      if (input) {
        event.preventDefault();
        (input as HTMLElement).focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const threadHistorySidebar = (
    <ThreadHistory position={historyPosition}>
      <ThreadHistoryHeader />
      <ThreadHistoryNewButton />
      <ThreadHistorySearch />
      <ThreadHistoryList />
    </ThreadHistory>
  );

  const defaultSuggestions: Suggestion[] = [
    {
      id: "suggestion-1",
      title: "List my repositories",
      detailedSuggestion: "List my repositories",
      messageId: "list-repos",
    },
    {
      id: "suggestion-2",
      title: "Find accessibility issues",
      detailedSuggestion:
        "Find open issues labeled accessibility in zendalona/world-map-explorer-v2",
      messageId: "issues-by-label",
    },
    {
      id: "suggestion-3",
      title: "Fetch an issue",
      detailedSuggestion: "Fetch issue 42 from zendalona/world-map-explorer-v2",
      messageId: "fetch-issue",
    },
  ];

  const suggestions = initialSuggestions ?? defaultSuggestions;

  return (
    <div className="flex h-full w-full min-h-0">
      {/* Thread History Sidebar - rendered first if history is on the left */}
      {showHistory && historyPosition === "left" && threadHistorySidebar}

      <ThreadContainer
        ref={mergedRef}
        disableSidebarSpacing
        className={`min-h-0 ${className ?? ""}`}
        {...props}
      >
        <ScrollableMessageContainer className="p-6 min-h-0">
          <ThreadContent variant={variant} className="mx-auto w-full max-w-4xl">
            <ThreadContentMessages />
          </ThreadContent>
        </ScrollableMessageContainer>

        {/* Message suggestions status */}
        <MessageSuggestions>
          <MessageSuggestionsStatus />
        </MessageSuggestions>

        {/* Message suggestions */}
        <MessageSuggestions initialSuggestions={suggestions}>
          <MessageSuggestionsList />
        </MessageSuggestions>

        {/* Message input */}
        <div className="px-4 pb-4">
          {showGitHubBanners && (
            <>
              <GitHubMcpRequiredBanner />
              <GitHubMcpIntentBanner />
            </>
          )}
          <ScreenReaderTour />
          <KeyboardShortcutsHelp />
          <AccessibilityInputGuidance />
          <MessageInput>
            <MessageInputTextarea
              placeholder={
                inputPlaceholder ?? "Type your message or paste images..."
              }
              inputId="chat-input"
              ariaLabel="Message input"
            />
            <MessageInputToolbar>
              <MessageInputFileButton />
              <MessageInputMcpPromptButton />
              <MessageInputMcpResourceButton />
              {/* Uncomment this to enable client-side MCP config modal button */}
              <MessageInputMcpConfigButton />
              <MessageInputSubmitButton />
            </MessageInputToolbar>
            <MessageInputError />
          </MessageInput>
        </div>
      </ThreadContainer>

      {/* Thread History Sidebar - rendered last if history is on the right */}
      {showHistory && historyPosition === "right" && threadHistorySidebar}
    </div>
  );
});
MessageThreadFull.displayName = "MessageThreadFull";
