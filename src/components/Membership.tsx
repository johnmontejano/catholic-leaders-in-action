import {
  ArrowLeft,
  ArrowRight,
  Clock,
  HandHeart,
  MicrophoneStage,
  UsersThree,
  Wine,
} from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { membershipTiles, links } from "../data";
import { asset } from "../lib/assets";
import { Reveal } from "./Reveal";
import { PlayBadge, VideoDialog } from "./VideoDialog";

const stats = [
  {
    value: "1",
    label: "gathering every month",
    note: "Formation and friendship",
  },
  {
    value: "21–40",
    label: "community age range",
    note: "Catholic young professionals",
  },
  {
    value: "$0",
    label: "for every monthly evening",
    note: "Registration required",
  },
  {
    value: "2.5h+",
    label: "time together",
    note: "Talk, questions, and community",
  },
];

const eveningFlow = [
  { icon: Wine, title: "Arrive", copy: "Reception and check-in" },
  { icon: MicrophoneStage, title: "Listen", copy: "Featured talk and panel" },
  { icon: UsersThree, title: "Ask", copy: "Honest conversation and Q&A" },
  { icon: Clock, title: "Stay", copy: "Wine, small bites, and friendship" },
];

export function Membership() {
  const railRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [railPaused, setRailPaused] = useState(false);

  const moveRail = (direction: -1 | 1) => {
    setRailPaused(true);
    railRef.current?.scrollBy({
      behavior: reduceMotion ? "auto" : "smooth",
      left: direction * Math.min(window.innerWidth * 0.82, 390),
    });
  };

  return (
    <section className="overflow-hidden bg-void-black" id="community">
      <div className="page-shell grid items-end gap-10 pb-12 pt-28 md:grid-cols-12 md:pb-20 md:pt-52">
        <Reveal className="md:col-span-9" variant="heading">
          <p className="label-caps mb-6 text-smoke">Belonging, monthly</p>
          <h2 className="section-title text-balance text-pure-white">
            Belong before you have it all{" "}
            <span className="accent-word">figured out.</span>
          </h2>
        </Reveal>
        <Reveal className="flex flex-col items-start gap-7 md:col-span-3">
          <p className="section-copy text-pretty">
            No prior knowledge required. Come with conviction, questions, or
            both.
          </p>
          <div className="flex gap-2" aria-label="Browse community moments">
            <button
              aria-label="Previous community moment"
              className="rail-control"
              onClick={() => moveRail(-1)}
              type="button"
            >
              <ArrowLeft aria-hidden="true" size={17} weight="bold" />
            </button>
            <button
              aria-label="Next community moment"
              className="rail-control"
              onClick={() => moveRail(1)}
              type="button"
            >
              <ArrowRight aria-hidden="true" size={17} weight="bold" />
            </button>
          </div>
        </Reveal>
      </div>

      <Reveal variant="media">
        <div
          aria-label="Community moments. Use the arrow keys or controls to browse."
          className="membership-viewport membership-rail overflow-x-auto pb-6"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              moveRail(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
          ref={railRef}
          role="region"
          tabIndex={0}
        >
          <div
            className="membership-track flex w-max snap-x snap-mandatory gap-3 px-4 md:gap-4 md:px-6"
            data-paused={railPaused || reduceMotion ? "true" : "false"}
          >
            {[...membershipTiles, ...membershipTiles].map((tile, index) => {
              const duplicate = index >= membershipTiles.length;
              return (
                <article
                  aria-hidden={duplicate || undefined}
                  className={`membership-tile media-card media-scrim aspect-[4/5] w-[78vw] shrink-0 snap-center sm:w-[48vw] md:w-[360px] ${duplicate ? "membership-duplicate" : ""}`}
                  key={`${tile.title}-${index}`}
                >
                  <img alt={duplicate ? "" : tile.alt} loading="lazy" src={tile.image} />
                  <div className="media-card-content">
                    <h3 className="text-balance text-2xl font-medium leading-[1.06] tracking-[-0.025em] text-pure-white">
                      {tile.title}
                    </h3>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Reveal>

      <div className="page-shell pb-32 pt-28 md:pb-52 md:pt-52">
        <Reveal className="mb-16 max-w-[780px] md:mb-24" variant="heading">
          <p className="label-caps mb-6 text-smoke">The shape of the community</p>
          <h2 className="section-title text-balance text-pure-white">
            A simple rhythm. A real place to belong.
          </h2>
        </Reveal>
        <dl className="grid grid-cols-2 border-y border-graphite md:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal
              className="stat-cell flex min-h-[250px] flex-col justify-between border-r border-t border-graphite p-5 even:border-r-0 first:border-t-0 [&:nth-child(2)]:border-t-0 md:min-h-[360px] md:border-t-0 md:p-6 md:even:border-r"
              delay={index * 0.055}
              key={stat.label}
              y={18}
            >
              <dt className="label-caps max-w-[150px] text-smoke">
                {stat.label}
              </dt>
              <dd className="m-0">
                <span
                  className={`block tabular-nums whitespace-nowrap font-light leading-[0.82] tracking-[-0.065em] text-pure-white ${
                    stat.value === "21–40"
                      ? "text-[2.55rem] sm:text-[3rem] md:text-[clamp(3.5rem,5.2vw,5.6rem)]"
                      : stat.value.length > 2
                        ? "text-[2.55rem] sm:text-[3rem] md:text-[clamp(3.7rem,5.8vw,6rem)]"
                        : "text-[clamp(4.2rem,8.3vw,8.5rem)]"
                  }`}
                >
                  {stat.value}
                </span>
                <span className="mt-6 block max-w-[180px] text-sm leading-5 text-smoke">
                  {stat.note}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>

      <BentoExperience />

      <div className="page-shell pb-32 pt-8 md:pb-52 md:pt-16">
        <Reveal variant="media">
          <div className="grid min-h-[620px] items-end gap-12 rounded-cards bg-charcoal p-7 md:grid-cols-12 md:p-12 lg:p-16">
            <div className="md:col-span-8">
              <p className="label-caps mb-6 text-smoke">Your place in the room</p>
              <h2 className="section-title max-w-[760px] text-balance text-pure-white">
                Come for one evening. Stay for the people.
              </h2>
            </div>
            <div className="md:col-span-4">
              <p className="text-pretty text-lg leading-7 text-pure-white/72">
                Registration is required, and monthly evenings are free for
                Catholic young professionals ages 21–40.
              </p>
              <a
                className="button-primary mt-7"
                href={links.nextEvent}
                rel="noreferrer"
                target="_blank"
              >
                Request to join
                <ArrowRight aria-hidden="true" size={16} weight="bold" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BentoExperience() {
  return (
    <div className="page-shell pb-24 md:pb-36">
      <Reveal className="mb-14 max-w-[760px] md:mb-20" variant="heading">
        <h2 className="section-title text-balance text-pure-white">
          An evening, seen from inside.
        </h2>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-12 md:auto-rows-[250px]">
        <Reveal className="md:col-span-7 md:row-span-2" variant="media">
          <article className="media-card media-scrim min-h-[560px] size-full">
            <img
              alt="Young Catholic professionals talking together at a monthly gathering."
              loading="lazy"
              src={asset("assets/img/after-talk-2160.jpg")}
            />
            <div className="media-card-content">
              <p className="text-sm text-pure-white/66">6:30 PM</p>
              <h3 className="mt-2 max-w-[520px] text-balance text-[clamp(2rem,4vw,3.6rem)] font-medium leading-[1] tracking-[-0.035em]">
                Arrive as you are. Leave knowing someone new.
              </h3>
            </div>
          </article>
        </Reveal>

        <Reveal className="md:col-span-5 md:row-span-2" delay={0.06} variant="media">
          <article className="flex min-h-[560px] size-full flex-col justify-between rounded-cards bg-charcoal p-7 md:p-9">
            <div>
              <p className="text-sm text-smoke">The rhythm of the night</p>
              <h3 className="mt-3 text-balance text-3xl font-medium leading-[1.05] tracking-[-0.03em] md:text-4xl">
                Talk, then conversation.
              </h3>
            </div>
            <ul className="space-y-1">
              {eveningFlow.map(({ icon: Icon, title, copy }) => (
                <li
                  className="flex items-center gap-4 border-b border-graphite py-4 last:border-b-0"
                  key={title}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-graphite text-pure-white">
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <p className="font-medium text-pure-white">{title}</p>
                    <p className="mt-0.5 text-sm text-smoke">{copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>

        <Reveal className="md:col-span-4 md:row-span-2" variant="media">
          <VideoDialog
            className="interactive-media media-card media-scrim min-h-[520px] size-full text-left"
            label="Open service video."
          >
            <img
              alt=""
              className="size-full object-cover"
              loading="lazy"
              src={asset("assets/feed/Db3x4v6hxow-640.jpg")}
            />
            <span className="media-card-content">
              <PlayBadge />
              <span className="mt-4 block text-balance text-3xl font-medium leading-[1.04] tracking-[-0.03em]">
                Faith becomes encounter.
              </span>
            </span>
          </VideoDialog>
        </Reveal>

        <Reveal className="md:col-span-4" delay={0.05} variant="media">
          <article className="flex min-h-[300px] size-full flex-col justify-between rounded-cards bg-lamp-cream p-7 text-void-black md:min-h-0 md:p-8">
            <HandHeart aria-hidden="true" size={34} weight="light" />
            <div>
              <p className="tabular-nums text-6xl font-light tracking-[-0.05em]">
                Free.
              </p>
              <p className="mt-3 max-w-[260px] text-base leading-6 text-black/64">
                Monthly evenings are free for young professionals ages 21–40.
                Registration is required.
              </p>
            </div>
          </article>
        </Reveal>

        <Reveal className="md:col-span-4" delay={0.1} variant="media">
          <article className="media-card media-scrim min-h-[300px] size-full">
            <img
              alt="Catholic volunteers walking together during a service action."
              loading="lazy"
              src={asset("assets/img/serve-camp-p-1440.jpg")}
            />
            <div className="media-card-content p-7 md:p-8">
              <h3 className="text-balance text-2xl font-medium tracking-[-0.025em]">
                Formation that moves into service.
              </h3>
              <a
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium underline decoration-white/40 underline-offset-4 transition-colors duration-200 hover:decoration-white"
                href={links.serviceAction}
                rel="noreferrer"
                target="_blank"
              >
                See the next action
                <ArrowRight aria-hidden="true" size={15} weight="bold" />
              </a>
            </div>
          </article>
        </Reveal>
      </div>
    </div>
  );
}
