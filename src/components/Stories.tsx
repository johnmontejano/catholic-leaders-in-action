import {
  ArrowUpRight,
  CalendarDots,
  InstagramLogo,
  Newspaper,
} from "@phosphor-icons/react";
import { links, socialPosts } from "../data";
import { asset } from "../lib/assets";
import { Reveal } from "./Reveal";
import { PlayBadge, VideoDialog } from "./VideoDialog";

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

const featuredStory = socialPosts.find((post) => post.video) ?? socialPosts[0];
const galleryStories = socialPosts.filter((post) => post !== featuredStory);

export function Stories() {
  return (
    <section className="bg-void-black pb-24 pt-28 md:pb-36 md:pt-40" id="stories">
      <div className="page-shell">
        <div className="mb-16 grid items-end gap-9 md:mb-24 md:grid-cols-12">
          <Reveal className="md:col-span-9" variant="heading">
            <p className="label-caps mb-6 text-smoke">Stories</p>
            <h2 className="section-title text-balance text-pure-white">
              Faith becomes visible in the lives around us.
            </h2>
          </Reveal>
          <Reveal className="md:col-span-3">
            <div className="flex items-center gap-2 border-t border-graphite pt-5 md:justify-end">
            {channels.map(({ href, icon: Icon, label }) => (
              <a
                aria-label={label}
                className="social-icon focus-ring grid size-11 place-items-center rounded-full text-smoke transition-colors duration-200 hover:bg-charcoal hover:text-pure-white"
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
        </div>

        <div className="grid gap-3 md:auto-rows-[250px] md:grid-cols-12 md:gap-4">
          <Reveal className="md:col-span-7 md:row-span-2" variant="media">
            <VideoDialog
              className="interactive-media media-card media-scrim aspect-[4/5] size-full text-left md:aspect-auto"
              label="Open featured Instagram video."
            >
              <img
                alt=""
                className="size-full object-cover object-[50%_36%]"
                loading="lazy"
                src={asset(`assets/feed/${featuredStory.file}`)}
              />
              <span className="media-card-content">
                <p className="label-caps mb-4 text-pure-white/66">Instagram reel</p>
                <h3 className="max-w-[620px] text-balance text-[clamp(2.4rem,5vw,5.3rem)] font-medium leading-[0.96] tracking-[-0.045em] text-pure-white">
                  Faith becomes encounter.
                </h3>
                <span className="mt-6 block">
                  <PlayBadge />
                </span>
              </span>
            </VideoDialog>
          </Reveal>

          {galleryStories.slice(0, 2).map((post, index) => (
            <Reveal
              className="min-h-[300px] md:col-span-5 md:min-h-0"
              delay={index * 0.06}
              key={post.file}
              variant="media"
            >
              <a
                aria-label={`Open Instagram post: ${post.alt}`}
                className="media-card group block size-full focus-ring"
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
                <span className="story-corner absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/44 text-pure-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <ArrowUpRight aria-hidden="true" size={14} weight="bold" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 md:mt-4 md:grid-cols-3 md:gap-4">
          {galleryStories.slice(2).map((post, index) => (
            <Reveal delay={(index % 3) * 0.055} key={post.file} variant="media">
              <a
                aria-label={`Open Instagram post: ${post.alt}`}
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
                <span className="story-corner absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/44 text-pure-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <ArrowUpRight aria-hidden="true" size={14} weight="bold" />
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
        <Reveal variant="media">
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
        <Reveal className="flex" delay={0.08} variant="media">
          <div className="flex min-h-[520px] w-full flex-col justify-between rounded-cards bg-charcoal p-7 md:min-h-[720px] md:p-10">
            <figure>
              <blockquote className="text-pretty text-[clamp(2rem,4vw,3.75rem)] font-light leading-[1.08] tracking-[-0.035em] text-pure-white">
                “Connecting with people who are passionate about putting their
                faith into action.”
              </blockquote>
              <figcaption className="mt-7 text-sm text-smoke">
                Catherine Dombrowski
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
