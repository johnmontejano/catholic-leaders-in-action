"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { assetPath } from "@/lib/asset-path";
import { ArrowDownIcon } from "@/components/icons";
import { LinkButton } from "@/components/link-button";
import { EXTERNAL_LINKS } from "@/lib/links";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });

        gsap.set(".hero-reveal-panel", { autoAlpha: 1, xPercent: 0 });
        timeline
          .from(
            ".hero-enter",
            {
              opacity: 0,
              y: 24,
              duration: 0.72,
              stagger: 0.06,
            },
            0.06,
          )
          .fromTo(
            ".hero-photo",
            { scale: 1.035 },
            { scale: 1, duration: 1.08, ease: "quart.out" },
            0,
          )
          .to(
            ".hero-reveal-panel",
            { xPercent: 101, duration: 0.82, ease: "quart.inOut" },
            0,
          );
      });

      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      id="top"
      ref={rootRef}
      className="grid min-h-[calc(100dvh-4.5rem)] scroll-mt-18 bg-cla-primary text-white lg:grid-cols-12"
      aria-labelledby="hero-title"
    >
      <div className="flex flex-col justify-between px-page py-12 sm:py-16 lg:col-span-6 lg:min-h-[calc(100dvh-4.5rem)] lg:py-18">
        <div className="hero-enter max-w-xl text-base font-semibold">
          Catholic Leaders in Action
        </div>

        <div className="my-12 max-w-2xl lg:my-16">
          <h1
            id="hero-title"
            className="max-w-[12ch] text-balance font-serif text-[clamp(3rem,5.3vw,5.2rem)] font-medium leading-[0.98] tracking-[-0.035em]"
          >
            Form your faith. Find your people. Put Catholic social teaching into action.
          </h1>
          <p className="hero-enter mt-7 max-w-[57ch] text-pretty text-lg leading-relaxed text-white/90">
            A community of young Catholics in the San Francisco Bay Area,
            rooted in Christ and learning to lead with conviction.
          </p>
          <div className="hero-enter mt-8 flex flex-wrap gap-3">
            <LinkButton href="#events" variant="action">
              See event updates
            </LinkButton>
            <LinkButton
              href={EXTERNAL_LINKS.membership}
              variant="outline"
              external
            >
              Join the community
            </LinkButton>
          </div>
        </div>

        <div className="hero-enter flex flex-wrap items-center justify-between gap-5 border-t border-white/40 pt-5 text-sm font-semibold">
          <span>Formation · Prayer · Action</span>
          <a
            href="#events"
            className="inline-flex min-h-11 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
          >
            What’s next
            <ArrowDownIcon className="size-4" />
          </a>
        </div>
      </div>

      <div className="relative min-h-[52dvh] overflow-hidden lg:col-span-6 lg:min-h-[calc(100dvh-4.5rem)]">
        <Image
          src={assetPath("/images/community-reception-wide.png")}
          alt="Young Catholic adults talk and take a selfie during a community gathering in a parish hall."
          fill
          priority
          quality={88}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="hero-photo object-cover object-[48%_46%] sm:object-[50%_44%] lg:object-[50%_50%]"
        />
        <div
          className="hero-reveal-panel invisible absolute inset-0 bg-cla-primary"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
