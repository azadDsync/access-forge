"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Trash2 } from "lucide-react";
import * as React from "react";

type CanvasItem = {
  id: string;
  title: string;
  component: React.ReactNode;
  createdAt: string;
};

type ShowComponentEvent = CustomEvent<{
  messageId?: string;
  component?: React.ReactNode;
}>;

const buildTitle = (component: React.ReactNode) => {
  if (React.isValidElement(component)) {
    const title = (component.props as { title?: string })?.title;
    if (title) return title;
  }
  return "Generated insight";
};

const createItem = (component: React.ReactNode): CanvasItem => ({
  id: `canvas-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: buildTitle(component),
  component,
  createdAt: new Date().toLocaleString(),
});

export default function AnalyticsCanvas({ className }: { className?: string }) {
  const [items, setItems] = React.useState<CanvasItem[]>([]);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as ShowComponentEvent).detail;
      if (!detail?.component) return;
      setItems((prev) => [createItem(detail.component), ...prev]);
    };

    window.addEventListener("tambo:showComponent", handler as EventListener);
    return () => {
      window.removeEventListener("tambo:showComponent", handler as EventListener);
    };
  }, []);

  return (
    <div
      data-canvas-space="true"
      className={cn(
        "rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/60">
            Generative canvas
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Pinned AI insights
          </h2>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setItems([])}
            className="inline-flex items-center gap-1.5 rounded-md border border-foreground/10 px-3 py-1.5 text-xs text-foreground/70 hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear canvas
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 text-sm text-foreground/60">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4 text-foreground/70" />
            Ask the AI to generate a chart, then select “View component” to pin it
            here.
          </div>
          <p className="mt-2 text-xs text-foreground/60">
            Try: “Show retention by segment for the last 90 days.”
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-foreground/10 bg-background/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-foreground/50">
                    Added {item.createdAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.filter((entry) => entry.id !== item.id))
                  }
                  className="text-xs text-foreground/50 hover:text-foreground"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3">{item.component}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
