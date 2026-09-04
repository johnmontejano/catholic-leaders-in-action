import { ArrowRight, InstagramLogo } from "@phosphor-icons/react";
import { links } from "../data";
import { asset } from "../lib/assets";
import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="border-t border-graphite bg-[#0d0d0d] pb-[max(32px,env(safe-area-inset-bottom))] pt-24 md:pt-36">
      <div className="page-shell">
        <Reveal>
          <h2 className="display-title max-w-[1100px] text-balance text-pure-white">
            See you in <span className="accent-word">San Francisco.</span>
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-14 border-t border-graphite pt-10 md:mt-28 md:grid-cols-[1.2fr_.8fr_.8fr] md:gap-8 md:pt-12">
          <div>
            <img
              alt=""
              className="size-14 brightness-0 invert"
              height="56"
              src={asset("assets/brand/seal-192.webp")}
              width="56"
            />
            <p className="mt-5 max-w-[360px] text-pretty text-base leading-6 text-smoke">
              Forming Catholics to lead with faith, wisdom, and courage.
            </p>
          </div>

          <div>
            <p className="label-caps text-smoke">Gather</p>
            <div className="mt-5 flex flex-col items-start gap-2">
              <a
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full text-lg text-pure-white"
                href={links.luma}
                rel="noreferrer"
                target="_blank"
              >
                See every gathering
                <ArrowRight aria-hidden="true" size={16} weight="bold" />
              </a>
              <a
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full text-lg text-pure-white"
                href={links.instagram}
                rel="noreferrer"
                target="_blank"
              >
                Follow the community
                <InstagramLogo aria-hidden="true" size={17} weight="bold" />
              </a>
            </div>
          </div>

          <div>
            <p className="label-caps text-smoke">Navigate</p>
            <nav aria-label="Footer navigation" className="mt-5 flex flex-col items-start">
              <a className="focus-ring min-h-11 rounded-full py-2 text-lg" href="#experience">
                Experience
              </a>
              <a className="focus-ring min-h-11 rounded-full py-2 text-lg" href="#next">
                Next evening
              </a>
              <a className="focus-ring min-h-11 rounded-full py-2 text-lg" href="#stories">
                Stories
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-graphite pt-6 text-xs leading-5 text-smoke sm:flex-row sm:items-center sm:justify-between">
          <p>In partnership with the Archdiocese of San Francisco.</p>
          <p>© 2026 Catholic Leaders in Action</p>
        </div>
      </div>
    </footer>
  );
}
