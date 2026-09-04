import { ArrowRight, InstagramLogo } from "@phosphor-icons/react";
import { links } from "../data";
import { asset } from "../lib/assets";
import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="border-t border-graphite bg-[#0d0d0d] pb-[max(32px,env(safe-area-inset-bottom))] pt-24 md:pt-36">
      <div className="page-shell">
        <Reveal variant="heading">
          <h2 className="display-title max-w-[1180px] text-balance text-pure-white">
            Your faith, in <span className="accent-word">action.</span>
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-14 border-t border-graphite pt-10 md:mt-32 md:grid-cols-12 md:gap-6 md:pt-12">
          <div className="md:col-span-4">
            <img
              alt=""
              className="size-14 brightness-0 invert"
              height="56"
              src={asset("assets/brand/seal-192.webp")}
              width="56"
            />
            <p className="mt-5 max-w-[390px] text-pretty text-base leading-6 text-smoke">
              Connecting and equipping Catholics who desire to lead with
              conviction, excellence, and faith in everyday life.
            </p>
          </div>

          <div className="md:col-span-2 md:col-start-6">
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

          <div className="md:col-span-2">
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

          <div className="md:col-span-3">
            <p className="label-caps text-smoke">San Francisco</p>
            <p className="mt-5 max-w-[260px] text-lg leading-7 text-pure-white">
              Free monthly evenings in San Francisco for Catholics ages 21–40.
            </p>
            <a
              className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-full text-sm text-smoke transition-colors duration-200 hover:text-pure-white"
              href={links.archdiocese}
              rel="noreferrer"
              target="_blank"
            >
              Archdiocese partnership
              <ArrowRight aria-hidden="true" size={15} weight="bold" />
            </a>
          </div>
        </div>

        <div className="mt-20 grid gap-5 border-t border-graphite pt-6 text-xs leading-5 text-smoke md:grid-cols-12 md:items-center">
          <p className="md:col-span-6">
            Formed in partnership with the Archdiocese of San Francisco.
          </p>
          <a
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full text-pure-white md:col-span-3 md:justify-self-center"
            href={links.instagram}
            rel="noreferrer"
            target="_blank"
          >
            <InstagramLogo aria-hidden="true" size={16} weight="bold" />
            Instagram
          </a>
          <p className="md:col-span-3 md:text-right">
            © 2026 Catholic Leaders in Action
          </p>
        </div>
      </div>
    </footer>
  );
}
