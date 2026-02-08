

const Footer = () => {
  const connectLinks = [
    { label: "CONTACT", href: "mailto:hello@accessforge.dev" },
    { label: "ACCESSIBILITY", href: "#" },
  ];

  const socialLinks = [
    { label: "GITHUB", href: "https://github.com" },
    { label: "TWITTER", href: "https://twitter.com" },
    { label: "DISCORD", href: "https://discord.com" },
  ];

  return (
    <footer className="bg-accent-red text-foreground" role="contentinfo" aria-label="Site footer">
      <div className="px-5 md:px-20 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 items-start">
          {/* Logo Section */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="font-serif text-3xl md:text-4xl font-bold italic mb-2">
              AccessForge
            </div>
            <p className="text-sm mt-3 max-w-xs">
              Accessibility-first development for everyone
            </p>
          </div>

          {/* Connect */}
          <div className="col-span-1">
            <h3 className="footer-header" id="footer-connect">CONNECT</h3>
            <nav className="flex flex-col gap-2" aria-labelledby="footer-connect">
              {connectLinks.map((link) => (
                <a key={link.label} href={link.href} className="footer-link">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="col-span-1">
            <h3 className="footer-header" id="footer-social">FOLLOW</h3>
            <nav className="flex flex-col gap-2" aria-labelledby="footer-social">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-foreground/20">
          <p className="text-xs md:text-sm text-center md:text-left uppercase tracking-wide">
            © 2026 ACCESSFORGE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
