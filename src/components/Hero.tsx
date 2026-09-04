import { ArrowDown, ArrowRight } from "@phosphor-icons/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { asset } from "../lib/assets";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [1, 1.06],
  );
  const mediaY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["0%", "5%"],
  );
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);

  const parent = {
    hidden: {},
    show: {
      transition: {
        delayChildren: 0.15,
        staggerChildren: 0.1,
      },
    },
  };
  const child = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" as const },
    },
  };

  return (
    <section
      className="relative min-h-[100dvh] overflow-hidden bg-void-black"
      id="top"
      ref={sectionRef}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ scale: mediaScale, y: mediaY }}
      >
        <video
          autoPlay
          className="size-full object-cover"
          loop
          muted
          playsInline
          poster={asset("assets/video/sf-hero-poster.jpg")}
          preload="metadata"
        >
          <source src={asset("assets/video/sf-hero.mp4")} type="video/mp4" />
        </video>
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.24)_0%,rgba(0,0,0,.04)_36%,rgba(0,0,0,.86)_100%)]"
      />

      <motion.div
        className="page-shell relative flex min-h-[100dvh] items-end pb-6 pt-28 md:pb-12 lg:pb-16 lg:pt-32"
        style={{ opacity: contentOpacity }}
      >
        <motion.div
          animate="show"
          className="grid w-full items-end gap-7 lg:grid-cols-[1fr_360px] lg:gap-16"
          initial={reduceMotion ? "show" : "hidden"}
          variants={parent}
        >
          <motion.h1
            className="display-title max-w-[860px] text-balance text-pure-white"
            variants={child}
          >
            Faith, made <span className="accent-word">active.</span>
          </motion.h1>

          <motion.div
            className="flex flex-col items-start gap-5 lg:items-stretch"
            variants={child}
          >
            <p className="max-w-[360px] text-pretty text-base leading-6 text-pure-white/86 md:text-lg">
              Free monthly evenings for Catholic young professionals in San
              Francisco, formed with the Archdiocese.
            </p>
            <div className="flex w-full flex-wrap gap-3">
              <a
                className="button-ghost flex-1"
                href="#experience"
              >
                See the experience
                <ArrowDown aria-hidden="true" size={15} weight="bold" />
              </a>
              <a
                className="button-primary flex-1"
                href="#next"
              >
                Next evening
                <ArrowRight aria-hidden="true" size={15} weight="bold" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
