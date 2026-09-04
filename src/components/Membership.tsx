import {
  ArrowRight,
  Clock,
  HandHeart,
  MicrophoneStage,
  UsersThree,
  Wine,
} from "@phosphor-icons/react";
import { membershipTiles, links } from "../data";
import { asset } from "../lib/assets";
import { Reveal } from "./Reveal";
import { PlayBadge, VideoDialog } from "./VideoDialog";

const stats = [
  { value: "1", label: "evening every month" },
  { value: "21-40", label: "community age range" },
  { value: "$0", label: "monthly admission" },
  { value: "2.5h+", label: "time together" },
];

const eveningFlow = [
  { icon: Wine, title: "Arrive", copy: "Reception and check-in" },
  { icon: MicrophoneStage, title: "Listen", copy: "Featured talk and panel" },
  { icon: UsersThree, title: "Ask", copy: "Honest conversation and Q&A" },
  { icon: Clock, title: "Stay", copy: "Wine, small bites, and friendship" },
];

export function Membership() {
  return (
    <section className="overflow-hidden bg-void-black" id="community">
      <div className="page-shell pb-16 pt-24 text-center md:pb-24 md:pt-36">
        <Reveal className="mx-auto flex max-w-[850px] flex-col items-center">
          <h2 className="section-title text-balance text-pure-white">
            Belong before you have it all{" "}
            <span className="accent-word">figured out.</span>
          </h2>
          <p className="section-copy mt-6 text-pretty">
            No prior knowledge required. Come with conviction, questions, or
            both.
          </p>
        </Reveal>
      </div>

      <div className="membership-rail flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-6 md:gap-4 md:px-[max(24px,calc((100vw-1200px)/2))]">
        {membershipTiles.map((tile, index) => (
          <Reveal
            className="w-[78vw] shrink-0 snap-center sm:w-[48vw] lg:w-[360px]"
            delay={index * 0.05}
            key={tile.title}
          >
            <article className="media-card media-scrim aspect-[4/5]">
              <img alt={tile.alt} loading="lazy" src={tile.image} />
              <div className="media-card-content">
                <h3 className="text-balance text-2xl font-medium leading-[1.06] tracking-[-0.025em] text-pure-white">
                  {tile.title}
                </h3>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="page-shell pb-28 pt-20 md:pb-36 md:pt-28">
        <dl className="grid grid-cols-2 border-l border-graphite md:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal
              className="flex min-h-[210px] flex-col justify-between border-r border-t border-graphite p-5 first:border-t-0 md:min-h-[285px] md:border-t-0 md:p-6"
              delay={index * 0.06}
              key={stat.label}
              y={18}
            >
              <dt className="label-caps max-w-[130px] text-smoke">
                {stat.label}
              </dt>
              <dd className="tabular-nums text-[clamp(3rem,5vw,4.2rem)] font-light leading-none tracking-[-0.04em] text-pure-white">
                {stat.value}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>

      <BentoExperience />
    </section>
  );
}

function BentoExperience() {
  return (
    <div className="page-shell pb-24 md:pb-36">
      <Reveal className="mb-14 max-w-[760px] md:mb-20">
        <h2 className="section-title text-balance text-pure-white">
          An evening, seen from <span className="accent-word">inside.</span>
        </h2>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-12 md:auto-rows-[250px]">
        <Reveal className="md:col-span-7 md:row-span-2">
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

        <Reveal className="md:col-span-5 md:row-span-2" delay={0.06}>
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

        <Reveal className="md:col-span-4 md:row-span-2">
          <VideoDialog className="media-card media-scrim min-h-[520px] size-full text-left">
            <img
              alt="A participant reflecting on service in an Instagram video."
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

        <Reveal className="md:col-span-4" delay={0.05}>
          <article className="flex min-h-[300px] size-full flex-col justify-between rounded-cards bg-lamp-cream p-7 text-void-black md:min-h-0 md:p-8">
            <HandHeart aria-hidden="true" size={34} weight="light" />
            <div>
              <p className="tabular-nums text-6xl font-light tracking-[-0.05em]">
                Free.
              </p>
              <p className="mt-3 max-w-[260px] text-base leading-6 text-black/64">
                Monthly evenings are free for young professionals ages 21-40.
              </p>
            </div>
          </article>
        </Reveal>

        <Reveal className="md:col-span-4" delay={0.1}>
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
