export default function AppFooter() {
  return (
    <footer
      className="border-t border-foreground/10 bg-background"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-foreground/60 sm:flex-row">
        <span>© 2026 AccessForge</span>
        <div className="flex items-center gap-4">
          <a
            href="mailto:hello@accessforge.dev"
            className="hover:text-foreground"
          >
            Contact
          </a>
          <a
            href="https://github.com"
            className="hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
