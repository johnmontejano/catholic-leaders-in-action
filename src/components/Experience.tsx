import { ArrowRight } from "@phosphor-icons/react";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { links, storyFrames } from "../data";
import { asset } from "../lib/assets";
import { Reveal } from "./Reveal";

const introCards = [
  {
    title: "Questions worth carrying into Monday.",
    copy: "Catholic formation meets the decisions, pressures, and relationships that shape ordinary life.",
    image: asset("assets/img/panel-table-1600.jpg"),
    alt: "Four panelists discussing faith and action with Catholic young professionals.",
  },
  {
    title: "The room is half the reason.",
    copy: "Come for the speaker. Stay for friendship, honest conversation, wine, and the people you did not know you needed.",
    image: asset("assets/img/after-talk-2160.jpg"),
    alt: "Catholic Leaders in Action attendees laughing together after a monthly evening.",
  },
];

export function Experience() {
  return (
    <section className="bg-void-black" id="experience">
      <div className="page-shell section-space">
        <Reveal className="mx-auto mb-16 flex max-w-[900px] flex-col items-center text-center md:mb-24" variant="heading">
          <p className="label-caps mb-6 text-smoke">Formation and friendship</p>
          <h2 className="section-title text-balance text-pure-white">
            Formation for the life you actually lead.
          </h2>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {introCards.map((card, index) => (
            <Reveal delay={index * 0.08} key={card.title} variant="media">
              <article className="media-card media-scrim aspect-[4/5] md:aspect-[4/5]">
                <img
                  alt={card.alt}
                  loading="lazy"
                  src={card.image}
                />
                <div className="media-card-content">
                  <h3 className="max-w-[460px] text-balance text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-pure-white">
                    {card.title}
                  </h3>
                  <p className="mt-4 max-w-[520px] text-pretty text-base leading-6 text-pure-white/78">
                    {card.copy}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <StoryScroll />

      <div className="page-shell py-24 text-center md:py-32">
        <Reveal className="mx-auto flex max-w-[820px] flex-col items-center" variant="heading">
          <h2 className="section-title text-balance text-pure-white">
            A faith that leaves the room with you.
          </h2>
          <p className="section-copy mt-6 text-pretty">
            CLIA also offers opportunities to serve alongside Catholic
            ministries in San Francisco.
          </p>
          <a
            className="button-primary mt-8"
            href={links.serviceAction}
            rel="noreferrer"
            target="_blank"
          >
            Join the next service action
            <ArrowRight aria-hidden="true" size={16} weight="bold" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

type StoryFrameProps = {
  index: number;
  progress: MotionValue<number>;
};

function StoryFrame({ index, progress }: StoryFrameProps) {
  const entries = [
    [0, 0.001],
    [0.24, 0.38],
    [0.57, 0.71],
  ];
  const exits = [
    [0.24, 0.4],
    [0.57, 0.73],
    [0.98, 1],
  ];
  const [entryStart, entryEnd] = entries[index];
  const [exitStart, exitEnd] = exits[index];
  const clipPath = useTransform(
    progress,
    index === 0 ? [0, 1] : [entryStart, entryEnd],
    index === 0
      ? ["inset(0% 0 0 0)", "inset(0% 0 0 0)"]
      : ["inset(100% 0 0 0)", "inset(0% 0 0 0)"],
  );
  const imageScale = useTransform(
    progress,
    index === 2
      ? [entryStart, entryEnd, 1]
      : [entryStart, entryEnd, exitStart, exitEnd],
    index === 2 ? [1.08, 1, 1] : [index === 0 ? 1.035 : 1.08, 1, 1, 0.96],
  );
  const imageFilter = useTransform(
    progress,
    index === 2 ? [entryStart, entryEnd, 1] : [exitStart, exitEnd],
    index === 2
      ? ["brightness(1)", "brightness(1)", "brightness(1)"]
      : ["brightness(1)", "brightness(.68)"],
  );
  const textWindows = [
    [0, 0.025, 0.23, 0.31],
    [0.35, 0.41, 0.55, 0.63],
    [0.68, 0.74, 0.97, 1],
  ];
  const [textStart, textVisible, textHold, textEnd] = textWindows[index];
  const textOpacity = useTransform(
    progress,
    [textStart, textVisible, textHold, textEnd],
    index === 0 ? [1, 1, 1, 0] : index === 2 ? [0, 1, 1, 1] : [0, 1, 1, 0],
  );
  const kickerY = useTransform(
    progress,
    [textStart, textVisible, textHold, textEnd],
    [22, 0, 0, -16],
  );
  const titleY = useTransform(
    progress,
    [textStart, textVisible, textHold, textEnd],
    [30, 0, 0, -20],
  );
  const copyY = useTransform(
    progress,
    [textStart, textVisible, textHold, textEnd],
    [38, 0, 0, -12],
  );
  const frame = storyFrames[index];

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ clipPath, zIndex: index + 1 }}
    >
      <motion.img
        alt={frame.alt}
        className="size-full object-cover"
        decoding="async"
        fetchPriority="low"
        loading="lazy"
        src={frame.image}
        style={{
          filter: imageFilter,
          objectPosition: frame.position,
          scale: imageScale,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.82),rgba(0,0,0,.12)_68%,rgba(0,0,0,.3))]" />
      <motion.div
        className="page-shell absolute inset-x-0 bottom-12 md:bottom-20"
        style={{ opacity: textOpacity }}
      >
        <motion.p className="label-caps mb-5 text-pure-white/62" style={{ y: kickerY }}>
          {frame.kicker}
        </motion.p>
        <motion.h3
          className="text-balance text-[clamp(3.3rem,8vw,7rem)] font-medium leading-[0.94] tracking-[-0.045em] text-pure-white"
          style={{ y: titleY }}
        >
          {frame.title}
        </motion.h3>
        <motion.p
          className="mt-5 max-w-[520px] text-pretty text-lg leading-7 text-pure-white/78"
          style={{ y: copyY }}
        >
          {frame.copy}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function StoryScroll() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.35,
  });

  if (reduceMotion) {
    return (
      <div className="page-shell grid gap-4 pb-20">
        {storyFrames.map((frame) => (
          <article
            className="media-card media-scrim aspect-[4/5] md:aspect-[16/9]"
            key={frame.title}
          >
            <img alt={frame.alt} loading="lazy" src={frame.image} />
            <div className="media-card-content">
              <p className="label-caps mb-3 text-pure-white/62">{frame.kicker}</p>
              <h3 className="text-5xl font-medium tracking-[-0.04em]">
                {frame.title}
              </h3>
              <p className="mt-4 max-w-[520px] text-pretty text-pure-white/78">
                {frame.copy}
              </p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <section
      aria-label="How Catholic Leaders in Action forms community"
      className="relative h-[270dvh] md:h-[330dvh]"
      ref={ref}
    >
      <ol className="sr-only">
        {storyFrames.map((frame) => (
          <li key={frame.title}>
            {frame.kicker}: {frame.title}. {frame.copy}
          </li>
        ))}
      </ol>
      <div className="sticky top-0 h-dvh overflow-hidden bg-charcoal">
        {storyFrames.map((_, index) => (
          <StoryFrame index={index} key={index} progress={smoothProgress} />
        ))}
      </div>
    </section>
  );
}
