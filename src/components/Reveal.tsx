import { motion, useReducedMotion } from "motion/react";
import type { PropsWithChildren } from "react";
import { cn } from "../lib/cn";
import { motionDurations, motionEasings } from "../lib/motion";

type RevealVariant = "copy" | "heading" | "media";

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  y?: number;
}>;

export function Reveal({
  children,
  className,
  delay = 0,
  variant = "copy",
  y = 24,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const states = {
    copy: {
      initial: { opacity: 0, y },
      visible: { opacity: 1, y: 0 },
      duration: motionDurations.copy,
      ease: motionEasings.enter,
    },
    heading: {
      initial: { opacity: 0, y: Math.max(y, 36), clipPath: "inset(0 0 100% 0)" },
      visible: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" },
      duration: motionDurations.media,
      ease: motionEasings.cinematic,
    },
    media: {
      initial: { opacity: 1, y: 0, clipPath: "inset(8% 0 0 0)" },
      visible: { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" },
      duration: motionDurations.media,
      ease: motionEasings.cinematic,
    },
  }[variant];

  if (variant === "heading" || variant === "media") {
    return (
      <motion.div
        className={cn(className)}
        data-reveal={variant}
        initial={reduceMotion ? false : "hidden"}
        viewport={{ once: true, amount: 0.18 }}
        whileInView="visible"
      >
        <motion.div
          className="size-full"
          variants={{ hidden: states.initial, visible: states.visible }}
          transition={{ duration: states.duration, delay, ease: states.ease }}
        >
          {children}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      data-reveal={variant}
      initial={reduceMotion ? false : states.initial}
      whileInView={states.visible}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: states.duration, delay, ease: states.ease }}
    >
      {children}
    </motion.div>
  );
}
