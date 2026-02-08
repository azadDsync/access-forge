import Link from "next/link";
import AppHeader from "@/components/static-ui/AppHeader";
import Footer from "@/components/static-ui/Footer";
import Button from "@/components/static-ui/Button";

const capabilities = [
  { text: "AI-powered GitHub navigation & control" },
  { text: "Create, review, and update PRs using voice or text" },
  { text: "Issue triaging, commenting, and labeling via intent" },
  { text: "Accessibility-first open-source workflows" },
];

const audiences = [
  "Blind & low-vision open-source contributors",
  "Accessibility-first developers",
  "Maintainers seeking inclusive contribution models",
  "Developers who prefer AI-assisted GitHub workflows",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-foreground focus:rounded focus:outline-none focus:ring-4 focus:ring-ring"
      >
        Skip to main content
      </a>

      <AppHeader />

      <main
        id="main-content"
        className="flex-1"
        role="main"
        aria-label="Main content"
      >
        {/* Hero Section */}
        <section
          className="px-5 md:px-20 pt-12 md:pt-20 pb-8 md:pb-12"
          aria-labelledby="hero-heading"
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Title */}
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl md:text-7xl lg:text-[120px] font-extrabold uppercase mb-8 leading-[0.85] tracking-[-1.5px]"
            >
              <span className="sr-only">AccessForge: </span>
              ACCESSFORGE
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl leading-relaxed text-foreground/80 max-w-3xl mx-auto mb-8 font-serif">
              AccessForge is an accessibility-first, AI-powered interface that
              enables visually impaired developers to contribute to open-source
              projects — navigate repositories, manage issues, and control GitHub
              workflows using voice, text and intent.
            </p>

            {/* CTA */}
            <div className="mb-16">
              <Link
                href="/auth/sign-up"
                aria-label="Start contributing to open source with AccessForge"
              >
                <Button variant="transparent" showArrow>
                  START CONTRIBUTING
                </Button>
              </Link>
            </div>

            {/* Core Capabilities */}
            <section
              className="mb-16"
              aria-labelledby="capabilities-heading"
            >
              <h2
                id="capabilities-heading"
                className="text-sm md:text-base font-medium tracking-widest uppercase text-foreground/60 mb-8"
              >
                What You Can Do
              </h2>

              <ul
                className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto list-none"
                role="list"
              >
                {capabilities.map((cap, index) => (
                  <li
                    key={index}
                    className="text-center p-6 rounded-lg border-2 border-foreground/10 hover:border-foreground/30 transition-colors"
                  >
                    <p className="text-base md:text-lg font-medium">
                      {cap.text}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Audience */}
            <section
              className="border-t border-foreground/10 pt-12"
              aria-labelledby="audience-heading"
            >
              <h2
                id="audience-heading"
                className="text-sm md:text-base font-medium tracking-widest uppercase text-foreground/60 mb-6"
              >
                Who This Is For
              </h2>

              <ul
                className="flex flex-wrap justify-center gap-3 list-none"
                role="list"
              >
                {audiences.map((audience, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 rounded-full border border-foreground/20 text-sm md:text-base font-serif text-foreground/80"
                  >
                    {audience}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
