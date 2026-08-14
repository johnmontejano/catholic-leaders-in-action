"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { assetPath } from "@/lib/asset-path";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

const chapters = [
  {
    id: "formation",
    label: "Formation",
    title: "Learn the tradition deeply enough to live it.",
    copy:
      "Speakers, panel discussion, and audience Q&A make Catholic Social Teaching concrete, serious, and open to honest questions.",
    image: "/images/panel-discussion.png",
    alt: "A speaker addresses attendees during a Catholic Leaders in Action panel discussion.",
    imageClass: "aspect-[3/2]",
    sizes: "(min-width: 1024px) 46vw, 92vw",
  },
  {
    id: "prayer",
    label: "Prayer",
    title: "Let leadership begin in communion.",
    copy:
      "The work is rooted in Christ and sustained by communal prayer—so conviction grows from relationship, not performance.",
    image: "/images/clergy-and-speakers.png",
    alt: "A priest and several speakers stand before attendees during a parish-hall program.",
    imageClass: "aspect-[3/2]",
    sizes: "(min-width: 1024px) 46vw, 92vw",
  },
  {
    id: "action",
    label: "Action",
    title: "Carry faith into the life in front of you.",
    copy:
      "Formation moves toward accompaniment, service, civic responsibility, and the daily vocation to meet another person with courage and care.",
    image: "/images/leaders-in-conversation.png",
    alt: "Two attendees speak face to face between rows of chairs after an event.",
    imageClass: "aspect-[2/3] max-w-[400px]",
    sizes: "(min-width: 1024px) 32vw, 88vw",
  },
] as const;

export function StorySequence() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          isDesktop: "(min-width: 1024px) and (min-height: 700px)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reducedMotion } = context.conditions as {
            isDesktop: boolean;
            reducedMotion: boolean;
          };

          if (!isDesktop || reducedMotion || !rootRef.current || !stageRef.current) {
            return;
          }

          rootRef.current.classList.add("story-enhanced");
          const frames = gsap.utils.toArray<HTMLElement>(".story-frame");
          const copy = gsap.utils.toArray<HTMLElement>(".story-chapter-copy");

          gsap.set([...frames.slice(1), ...copy.slice(1)], {
            opacity: 0,
            yPercent: 4,
          });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: stageRef.current,
              start: "top top",
              end: "+=240%",
              pin: true,
              scrub: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          for (let index = 1; index < chapters.length; index += 1) {
            const previous = index - 1;
            timeline
              .to(
                [frames[previous], copy[previous]],
                { opacity: 0, yPercent: -4, duration: 0.38 },
                `chapter-${index}`,
              )
              .to(
                [frames[index], copy[index]],
                { opacity: 1, yPercent: 0, duration: 0.62 },
                `chapter-${index}`,
              );
          }

          return () => {
            rootRef.current?.classList.remove("story-enhanced");
          };
        },
      );

      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="story-sequence bg-cla-ink text-white"
      aria-labelledby="story-title"
    >
      <div className="mx-auto max-w-site px-page pb-10 pt-24 sm:pt-32">
        <p className="max-w-[22ch] text-lg font-semibold text-cla-primary-bright">
          The gathering becomes action
        </p>
        <h2
          id="story-title"
          className="mt-4 max-w-[15ch] text-balance font-serif text-[clamp(2.8rem,6vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.035em]"
        >
          Faith forms a way of being in the world.
        </h2>
      </div>

      <div ref={stageRef} className="story-stage px-page pb-24 sm:pb-32">
        <div className="story-stage-grid mx-auto max-w-site">
          <ol className="story-markers" aria-label="Formation, prayer, and action sequence">
            {chapters.map((chapter, index) => (
              <li
                key={chapter.id}
                className="story-marker flex items-baseline gap-3 border-t border-white/25 py-4"
              >
                <span className="text-sm tabular-nums text-white/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-lg font-semibold">{chapter.label}</span>
              </li>
            ))}
          </ol>

          <div className="story-content">
            {chapters.map((chapter) => (
              <article key={chapter.id} className="story-chapter">
                <div className={`story-frame relative overflow-hidden ${chapter.imageClass}`}>
                  <Image
                    src={assetPath(chapter.image)}
                    alt={chapter.alt}
                    fill
                    sizes={chapter.sizes}
                    className="object-cover"
                  />
                </div>
                <div className="story-chapter-copy">
                  <p className="text-lg font-semibold text-cla-primary-bright">
                    {chapter.label}
                  </p>
                  <h3 className="mt-3 max-w-[17ch] text-balance font-serif text-[clamp(2.35rem,4.4vw,4.7rem)] font-medium leading-[1.02] tracking-[-0.03em]">
                    {chapter.title}
                  </h3>
                  <p className="mt-5 max-w-[46ch] text-pretty text-lg leading-relaxed text-white/78">
                    {chapter.copy}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
