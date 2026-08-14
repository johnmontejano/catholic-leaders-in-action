import type { ClaEvent } from "@/data/events";
import { LinkButton } from "@/components/link-button";
import { EXTERNAL_LINKS } from "@/lib/links";
import { formatEventDate, formatEventTime } from "@/lib/events";
import { assetPath } from "@/lib/asset-path";

type EventBandProps = {
  event?: ClaEvent;
};

export function EventBand({ event }: EventBandProps) {
  return (
    <section
      id="events"
      className="scroll-mt-18 bg-cla-primary-deep px-page py-14 text-white sm:py-18"
      aria-labelledby="next-gathering-title"
    >
      <div className="mx-auto grid max-w-site gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-3">
          <p className="text-lg font-semibold">Next gathering</p>
          <p className="mt-2 max-w-[24ch] text-pretty text-sm leading-relaxed text-white/75">
            Event details are published here only after the date and logistics are confirmed.
          </p>
        </div>

        {event ? (
          <div className="grid gap-8 lg:col-span-9 lg:grid-cols-9 lg:items-end">
            <div className="lg:col-span-6">
              <h2
                id="next-gathering-title"
                className="text-balance font-serif text-[clamp(2.5rem,5vw,4.6rem)] font-medium leading-none tracking-[-0.03em]"
              >
                {event.title}
              </h2>
              {event.theme ? (
                <p className="mt-4 text-xl text-white/90">{event.theme}</p>
              ) : null}
              <dl className="mt-7 grid gap-5 border-t border-white/30 pt-6 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-white/70">Date</dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    <time dateTime={event.startsAt}>{formatEventDate(event)}</time>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-white/70">Time</dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    {formatEventTime(event)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-white/70">Place</dt>
                  <dd className="mt-1 font-semibold">{event.venue}</dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-3">
              {event.rsvpUrl ? (
                <LinkButton href={event.rsvpUrl} external variant="action">
                  RSVP for this gathering
                </LinkButton>
              ) : null}
              <LinkButton
                href={assetPath(`/events/${event.slug}/calendar`)}
                variant="outline"
                download
              >
                Add to calendar
              </LinkButton>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-9">
            <h2
              id="next-gathering-title"
              className="max-w-[18ch] text-balance font-serif text-[clamp(2.7rem,5.8vw,5rem)] font-medium leading-[1.02] tracking-[-0.035em]"
            >
              The next gathering will be announced soon.
            </h2>
            <p className="mt-6 max-w-[62ch] text-pretty text-lg leading-relaxed text-white/82">
              Follow the latest announcements or join the WhatsApp community so you know when registration opens.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton
                href={EXTERNAL_LINKS.instagram}
                variant="light"
                external
              >
                Follow on Instagram
              </LinkButton>
              <LinkButton
                href={EXTERNAL_LINKS.whatsapp}
                variant="outline"
                external
              >
                Join the WhatsApp community
              </LinkButton>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
