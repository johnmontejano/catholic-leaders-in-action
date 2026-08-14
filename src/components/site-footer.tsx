import { EXTERNAL_LINKS } from "@/lib/links";

const footerLinks = [
  { href: EXTERNAL_LINKS.instagram, label: "Instagram" },
  { href: EXTERNAL_LINKS.whatsapp, label: "WhatsApp" },
  { href: EXTERNAL_LINKS.membership, label: "Membership" },
  { href: EXTERNAL_LINKS.venmo, label: "Venmo" },
  { href: EXTERNAL_LINKS.archdiocese, label: "Archdiocese feature" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer bg-cla-ink px-page py-14 text-white">
      <div className="mx-auto grid max-w-site gap-12 border-t border-white/25 pt-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="text-xl font-semibold">Catholic Leaders in Action</p>
          <p className="mt-3 max-w-[44ch] text-pretty leading-relaxed text-white/72">
            A community of young Catholics in the San Francisco Bay Area,
            rooted in Christ and leading with conviction.
          </p>
          <p className="mt-8 text-sm text-white/60">San Francisco Bay Area</p>
        </div>
        <nav className="lg:col-span-6" aria-label="Footer navigation">
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {footerLinks.map((link) => (
              <li key={link.href} className="border-b border-white/20">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-12 items-center justify-between gap-4 py-2 font-semibold hover:text-cla-primary-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
