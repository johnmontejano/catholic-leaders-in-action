import { ArrowDown, ArrowRight } from "@phosphor-icons/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { asset } from "../lib/assets";
import { motionDurations, motionEasings } from "../lib/motion";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
  const headlineY = useTransform(
    scrollYProgress,
    [0, 0.36],
    reduceMotion ? [0, 0] : [0, -48],
  );
  const headlineOpacity = useTransform(
    scrollYProgress,
    [0, 0.34],
    reduceMotion ? [1, 1] : [1, 0],
  );
  const supportY = useTransform(
    scrollYProgress,
    [0.05, 0.3],
    reduceMotion ? [0, 0] : [0, -24],
  );
  const supportOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.3],
    reduceMotion ? [1, 1] : [1, 0],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    const syncPlayback = () => {
      if (document.hidden) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };

    document.addEventListener("visibilitychange", syncPlayback);
    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [reduceMotion]);

  const parent = {
    hidden: {},
    show: {
      transition: {
        delayChildren: 0.12,
        staggerChildren: 0.07,
      },
    },
  };
  const child = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionDurations.copy,
        ease: motionEasings.enter,
      },
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
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0.72, scale: 1.08 }}
        transition={{
          duration: motionDurations.hero,
          ease: motionEasings.cinematic,
        }}
      >
        <motion.div
          className="size-full"
          style={{ scale: mediaScale, y: mediaY }}
        >
          {reduceMotion ? (
            <img
              alt=""
              className="size-full object-cover"
              src={asset("assets/video/sf-hero-poster.jpg")}
            />
          ) : (
            <video
              ref={videoRef}
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
          )}
        </motion.div>
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.24)_0%,rgba(0,0,0,.04)_36%,rgba(0,0,0,.86)_100%)]"
      />

      <motion.div
        className="page-shell relative flex min-h-[100dvh] items-end pb-[max(28px,calc(env(safe-area-inset-bottom)+16px))] pt-28 md:pb-12 lg:pb-16 lg:pt-32"
      >
        <motion.div
          animate="show"
          className="grid w-full grid-cols-1 items-end gap-7 lg:grid-cols-12 lg:gap-6"
          initial={reduceMotion ? "show" : "hidden"}
          variants={parent}
        >
          <motion.div
            className="overflow-hidden lg:col-span-8 xl:col-span-9"
            style={{ opacity: headlineOpacity, y: headlineY }}
          >
            <motion.h1
              className="display-title max-w-[980px] text-balance text-pure-white xl:whitespace-nowrap"
              variants={child}
            >
              Faith, made <span className="accent-word">active.</span>
            </motion.h1>
          </motion.div>

          <motion.div
            className="lg:col-span-4 xl:col-span-3"
            style={{ opacity: supportOpacity, y: supportY }}
          >
            <motion.div
              className="flex flex-col items-start gap-5 lg:items-stretch"
              variants={child}
            >
              <p className="max-w-[360px] text-pretty text-base leading-6 text-pure-white/86 md:text-lg">
                Free monthly evenings for Catholic young professionals, ages
                21–40, formed in partnership with the Archdiocese of San
                Francisco.
              </p>
              <div className="flex w-full flex-wrap gap-3">
                <motion.a
                  className="button-ghost flex-1"
                  href="#experience"
                  variants={child}
                >
                  See the experience
                  <ArrowDown aria-hidden="true" size={15} weight="bold" />
                </motion.a>
                <motion.a
                  className="button-primary flex-1"
                  href="#next"
                  variants={child}
                >
                  Next evening
                  <ArrowRight aria-hidden="true" size={15} weight="bold" />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
