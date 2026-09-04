import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, List, X } from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "motion/react";
import { asset } from "../lib/assets";

const navigation = [
  { label: "Experience", href: "#experience" },
  { label: "Next", href: "#next" },
  { label: "Stories", href: "#stories" },
];

function Brand() {
  return (
    <a
      aria-label="Catholic Leaders in Action home"
      className="focus-ring pointer-events-auto flex min-h-11 items-center gap-3 rounded-full"
      href="#top"
    >
      <img
        alt=""
        className="size-9 object-contain brightness-0 invert"
        height="36"
        src={asset("assets/brand/seal-192.webp")}
        width="36"
      />
      <span className="hidden text-sm font-medium leading-tight text-pure-white sm:block">
        Catholic Leaders
        <br />
        in Action
      </span>
    </a>
  );
}

export function Navigation() {
  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 80], [0, 0.94]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-nav">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-void-black"
        style={{ opacity: backgroundOpacity }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-graphite"
        style={{ opacity: borderOpacity }}
      />
      <nav
        aria-label="Primary navigation"
        className="page-shell relative flex h-[88px] items-center justify-between pt-[env(safe-area-inset-top)] lg:h-[125px]"
      >
        <Brand />

        <div className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <a
              className="focus-ring rounded-full px-2 py-3 text-[15px] font-medium text-pure-white/80 transition-opacity duration-200 hover:text-pure-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="pointer-events-auto hidden lg:block">
          <a className="button-primary" href="#next">
            October 6
            <ArrowRight aria-hidden="true" size={16} weight="bold" />
          </a>
        </div>

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              aria-label="Open navigation"
              className="focus-ring pointer-events-auto grid size-11 place-items-center rounded-full text-pure-white lg:hidden"
              type="button"
            >
              <List aria-hidden="true" size={25} weight="bold" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-menu bg-void-black" />
            <Dialog.Content className="fixed inset-0 z-menu flex flex-col bg-void-black px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))] outline-none">
              <div className="flex items-center justify-between">
                <Brand />
                <Dialog.Close
                  aria-label="Close navigation"
                  className="focus-ring grid size-11 place-items-center rounded-full text-pure-white"
                >
                  <X aria-hidden="true" size={24} weight="bold" />
                </Dialog.Close>
              </div>
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <div className="flex flex-1 flex-col justify-center">
                {navigation.map((item) => (
                  <Dialog.Close asChild key={item.href}>
                    <a
                      className="focus-ring border-b border-graphite py-5 text-5xl font-medium tracking-[-0.04em] text-pure-white"
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  </Dialog.Close>
                ))}
              </div>
              <a
                className="button-primary w-full"
                href="#next"
              >
                October 6
                <ArrowRight aria-hidden="true" size={16} weight="bold" />
              </a>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </nav>
    </header>
  );
}
