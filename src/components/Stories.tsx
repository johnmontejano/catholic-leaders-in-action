import {
  ArrowUpRight,
  CalendarDots,
  InstagramLogo,
  Newspaper,
  Play,
} from "@phosphor-icons/react";
import { links, socialPosts } from "../data";
import { asset } from "../lib/assets";
import { Reveal } from "./Reveal";

const channels = [
  {
    href: links.instagram,
    label: "Instagram",
    icon: InstagramLogo,
  },
  {
    href: links.luma,
    label: "Luma events",
    icon: CalendarDots,
  },
  {
    href: links.press,
    label: "Archdiocese coverage",
    icon: Newspaper,
  },
];

export function Stories() {
  return (
    <section className="bg-void-black pb-24 pt-28 md:pb-36 md:pt-40" id="stories">
      <div className="page-shell">
        <Reveal className="mx-auto mb-16 flex max-w-[900px] flex-col items-center text-center md:mb-24">
          <p className="label-caps mb-6 text-smoke">Stories</p>
          <h2 className="section-title text-balance text-pure-white">
            Faith becomes visible in the{" "}
            <span className="accent-word">lives around us.</span>
          </h2>
          <div className="mt-8 flex items-center gap-2">
            {channels.map(({ href, icon: Icon, label }) => (
              <a
                aria-label={label}
                className="focus-ring grid size-11 place-items-center rounded-full text-smoke transition-colors duration-200 hover:bg-charcoal hover:text-pure-white"
                href={href}
                key={label}
                rel="noreferrer"
                target="_blank"
              >
                <Icon aria-hidden="true" size={18} weight="bold" />
              </a>
            ))}
          </div>
        </Reveal>

        <div className="story-grid grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-3">
          {socialPosts.map((post, index) => (
            <Reveal
              className={
                index % 5 === 1 || index % 5 === 3
                  ? "md:pt-10"
                  : index % 3 === 1
                    ? "pt-5 md:pt-0"
                    : ""
              }
              delay={(index % 5) * 0.045}
              key={post.file}
              y={18}
            >
              <a
                aria-label={post.video ? "Watch this Instagram reel" : "View this Instagram post"}
                className="media-card group block aspect-[3/4] focus-ring"
                href={post.href}
                rel="noreferrer"
                target="_blank"
              >
                <img
                  alt={post.alt}
                  className="size-full object-cover"
                  loading="lazy"
                  src={asset(`assets/feed/${post.file}`)}
                />
                <span className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/24" />
                <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/44 text-pure-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {post.video ? (
                    <Play aria-hidden="true" size={13} weight="fill" />
                  ) : (
                    <ArrowUpRight aria-hidden="true" size={14} weight="bold" />
                  )}
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 flex justify-center md:mt-24">
          <a
            className="button-ghost"
            href={links.instagram}
            rel="noreferrer"
            target="_blank"
          >
            Follow on Instagram
            <InstagramLogo aria-hidden="true" size={17} weight="bold" />
          </a>
        </Reveal>
      </div>

      <Voices />
    </section>
  );
}

function Voices() {
  return (
    <div className="page-shell pt-28 md:pt-44">
      <div className="grid items-stretch gap-4 md:grid-cols-[1.1fr_.9fr] md:gap-6">
        <Reveal>
          <div className="media-card h-[520px] md:h-[720px]">
            <img
              alt="A large group of Catholic Leaders in Action attendees gathered in San Francisco."
              className="size-full object-cover"
              height="862"
              loading="lazy"
              src={asset("assets/img/group-august-1600.jpg")}
              width="1600"
            />
          </div>
        </Reveal>
        <Reveal className="flex" delay={0.08}>
          <div className="flex min-h-[520px] w-full flex-col justify-between rounded-cards bg-charcoal p-7 md:min-h-[720px] md:p-10">
            <figure>
              <blockquote className="text-pretty text-[clamp(2rem,4vw,3.75rem)] font-light leading-[1.08] tracking-[-0.035em] text-pure-white">
                “Connecting with people who are passionate about putting their
                faith into action.”
              </blockquote>
              <figcaption className="mt-7 text-sm text-smoke">
                Catherine Dombrowsky
                <br />
                Attendee
              </figcaption>
            </figure>
            <figure className="border-t border-graphite pt-8">
              <blockquote className="max-w-[520px] text-pretty text-xl leading-7 text-pure-white/86">
                “They are just humans who are deciding to say yes despite their
                fear.”
              </blockquote>
              <figcaption className="mt-5 text-sm text-smoke">
                Megan Sauter, attendee
              </figcaption>
              <a
                className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-pure-white underline decoration-graphite underline-offset-4 transition-colors duration-200 hover:decoration-pure-white"
                href={links.press}
                rel="noreferrer"
                target="_blank"
              >
                Read the Archdiocese story
                <ArrowUpRight aria-hidden="true" size={15} weight="bold" />
              </a>
            </figure>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
