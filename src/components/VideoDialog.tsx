import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Play, X } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { links } from "../data";
import { cn } from "../lib/cn";

type VideoDialogProps = {
  children: ReactNode;
  className?: string;
};

export function VideoDialog({ children, className }: VideoDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className={cn("group", className)} type="button">
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-modal bg-black/86" />
        <Dialog.Content
          aria-describedby="community-film-description"
          className="dialog-content fixed left-1/2 top-1/2 z-modal w-[min(94vw,470px)] -translate-x-1/2 -translate-y-1/2 rounded-cards border border-graphite bg-charcoal p-2 shadow-2xl outline-none"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <div>
              <Dialog.Title className="text-sm font-medium text-pure-white">
                A story from service
              </Dialog.Title>
              <Dialog.Description
                id="community-film-description"
                className="mt-0.5 text-xs text-smoke"
              >
                Roberto reflects on encountering Christ through service.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close video"
              className="grid size-10 place-items-center rounded-full text-smoke transition-colors duration-200 hover:bg-graphite hover:text-pure-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp-cream"
            >
              <X aria-hidden="true" size={18} weight="bold" />
            </Dialog.Close>
          </div>
          <div className="aspect-[9/16] overflow-hidden rounded-[8px] bg-void-black">
            <iframe
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              className="size-full border-0"
              loading="lazy"
              src={links.instagramReelEmbed}
              title="Catholic Leaders in Action Instagram video"
            />
          </div>
          <a
            className="mx-3 my-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-pure-white underline decoration-graphite underline-offset-4 transition-colors duration-200 hover:decoration-pure-white"
            href={links.instagramReel}
            rel="noreferrer"
            target="_blank"
          >
            Open on Instagram
            <ArrowUpRight aria-hidden="true" size={16} />
          </a>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function PlayBadge() {
  return (
    <span className="glass-control inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-pure-white">
      <span className="grid size-6 place-items-center rounded-full border border-white/45">
        <Play aria-hidden="true" className="ml-0.5" size={10} weight="fill" />
      </span>
      Watch the story
    </span>
  );
}
