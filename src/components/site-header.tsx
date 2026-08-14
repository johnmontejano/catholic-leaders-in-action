import { LinkButton } from "@/components/link-button";
import { MenuIcon } from "@/components/icons";

const navigation = [
  { href: "#mission", label: "Mission" },
  { href: "#events", label: "Events" },
  { href: "#community", label: "Community" },
  { href: "#join", label: "Join" },
];

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-nav border-b border-cla-line bg-white">
      <div className="mx-auto flex min-h-18 max-w-site items-center justify-between gap-5 px-page py-2">
        <a
          href="#top"
          className="max-w-52 font-semibold leading-tight text-cla-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cla-primary md:max-w-none"
        >
          Catholic Leaders in Action
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center text-sm font-medium text-cla-muted transition-colors duration-150 hover:text-cla-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cla-primary"
            >
              {item.label}
            </a>
          ))}
          <LinkButton href="#events" variant="ink" className="min-h-11 px-5">
            See events
          </LinkButton>
        </nav>

        <details className="mobile-menu relative md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-cla-line px-4 text-sm font-semibold text-cla-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cla-primary">
            <MenuIcon className="size-5" />
            Menu
          </summary>
          <nav
            className="absolute right-0 top-[calc(100%+0.5rem)] w-64 border border-cla-line bg-white p-3 shadow-sm"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex min-h-11 items-center px-3 font-medium text-cla-ink hover:bg-cla-surface focus-visible:outline-2 focus-visible:outline-cla-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <LinkButton href="#events" variant="ink" className="mt-2 w-full">
              See events
            </LinkButton>
          </nav>
        </details>
      </div>
    </header>
  );
}
