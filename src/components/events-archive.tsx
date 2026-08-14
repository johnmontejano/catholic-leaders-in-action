import Image from "next/image";
import type { EventCollections } from "@/lib/events";
import { formatEventDate, formatEventTime } from "@/lib/events";
import { EXTERNAL_LINKS } from "@/lib/links";
import { LinkButton } from "@/components/link-button";
import { assetPath } from "@/lib/asset-path";

type EventsArchiveProps = {
  collections: EventCollections;
};

export function EventsArchive({ collections }: EventsArchiveProps) {
  return (
    <section
      className="bg-white px-page py-24 text-cla-ink sm:py-32"
      aria-labelledby="events-archive-title"
    >
      <div className="mx-auto max-w-site">
        <div className="grid gap-8 border-b border-cla-line pb-10 lg:grid-cols-12 lg:items-end">
          <h2
            id="events-archive-title"
            className="max-w-[10ch] text-balance font-serif text-[clamp(3rem,6vw,5.5rem)] font-medium leading-none tracking-[-0.035em] lg:col-span-7"
          >
            Gather around what matters.
          </h2>
          <p className="max-w-[52ch] text-pretty text-lg leading-relaxed text-cla-muted lg:col-span-5">
            Each gathering brings community, Catholic Social Teaching,
            dialogue, and prayer into one evening—then points toward a
            concrete way to live what was learned.
          </p>
        </div>

        <div className="grid gap-12 py-14 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h3 className="text-xl font-semibold">Upcoming</h3>
          </div>
          <div className="lg:col-span-9">
            {collections.upcoming.length > 0 ? (
              <ol className="divide-y divide-cla-line border-y border-cla-line">
                {collections.upcoming.map((event) => (
                  <li
                    key={event.id}
                    className="grid gap-5 py-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-semibold tabular-nums text-cla-primary">
                        <time dateTime={event.startsAt}>
                          {formatEventDate(event)} · {formatEventTime(event)}
                        </time>
                      </p>
                      <h4 className="mt-2 text-balance font-serif text-3xl font-medium">
                        {event.title}
                      </h4>
                      <p className="mt-2 text-cla-muted">{event.venue}</p>
                    </div>
                    {event.rsvpUrl ? (
                      <LinkButton href={event.rsvpUrl} external>
                        RSVP
                      </LinkButton>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="max-w-3xl border-y border-cla-line py-10">
                <p className="text-balance font-serif text-[clamp(2rem,4vw,3.5rem)] leading-tight">
                  No future date is published yet.
                </p>
                <p className="mt-4 max-w-[56ch] text-pretty text-lg leading-relaxed text-cla-muted">
                  Join the WhatsApp community for gathering announcements and
                  updates from Catholic Leaders in Action.
                </p>
                <LinkButton
                  href={EXTERNAL_LINKS.whatsapp}
                  external
                  variant="ink"
                  className="mt-7"
                >
                  Get community updates
                </LinkButton>
              </div>
            )}
          </div>
        </div>

        {collections.cancelled.length > 0 ? (
          <div className="grid gap-8 border-t border-cla-line py-12 lg:grid-cols-12">
            <h3 className="text-xl font-semibold lg:col-span-3">Cancelled</h3>
            <ol className="space-y-6 lg:col-span-9">
              {collections.cancelled.map((event) => (
                <li key={event.id} className="flex flex-wrap gap-x-5 gap-y-2">
                  <span className="font-semibold text-cla-action">Cancelled</span>
                  <span>{event.title}</span>
                  <time className="text-cla-muted" dateTime={event.startsAt}>
                    {formatEventDate(event)}
                  </time>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="grid gap-10 border-t border-cla-line pt-14 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h3 className="text-xl font-semibold">Past gatherings</h3>
          </div>
          <ol className="space-y-12 lg:col-span-9">
            {collections.past.map((event) => (
              <li
                key={event.id}
                className="grid gap-7 md:grid-cols-[minmax(0,1fr)_minmax(240px,360px)] md:items-start"
              >
                <div>
                  <p className="font-semibold tabular-nums text-cla-primary">
                    <time dateTime={event.startsAt}>{formatEventDate(event)}</time>
                  </p>
                  <h4 className="mt-3 text-balance font-serif text-[clamp(2.25rem,4vw,4rem)] font-medium leading-tight">
                    {event.title}
                  </h4>
                  <p className="mt-5 max-w-[58ch] text-pretty text-lg leading-relaxed text-cla-muted">
                    {event.summary}
                  </p>
                  <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-cla-line pt-5 text-sm">
                    <div>
                      <dt className="text-cla-muted">Place</dt>
                      <dd className="mt-1 font-semibold">{event.venue}</dd>
                    </div>
                    {event.speaker ? (
                      <div>
                        <dt className="text-cla-muted">Speaker</dt>
                        <dd className="mt-1 font-semibold">{event.speaker}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <a
                    href={EXTERNAL_LINKS.archdiocese}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex min-h-11 items-center font-semibold text-cla-primary underline decoration-1 underline-offset-4 hover:text-cla-primary-deep focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cla-primary"
                  >
                    Read the Archdiocese recap
                  </a>
                </div>
                {event.image ? (
                  <div className="relative aspect-[3/2] max-w-[600px] overflow-hidden">
                    <Image
                      src={assetPath(event.image)}
                      alt="A speaker addresses attendees during a Catholic Leaders in Action panel discussion."
                      fill
                      sizes="(min-width: 768px) 360px, 92vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
