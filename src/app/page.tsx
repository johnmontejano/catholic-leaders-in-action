import { CommunityProof } from "@/components/community-proof";
import { EventBand } from "@/components/event-band";
import { EventsArchive } from "@/components/events-archive";
import { Hero } from "@/components/hero";
import { JoinSupport } from "@/components/join-support";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StorySequence } from "@/components/story-sequence";
import { events } from "@/data/events";
import { getEventCollections } from "@/lib/events";
import {
  eventJsonLd,
  organizationJsonLd,
  serializeJsonLd,
} from "@/lib/structured-data";

export default function Home() {
  const collections = getEventCollections(events);
  const verifiedEvents = events.filter((event) => event.status !== "draft");
  const structuredData = [
    organizationJsonLd(),
    ...verifiedEvents.map(eventJsonLd),
  ];

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-skip -translate-y-24 bg-white px-4 py-3 font-semibold text-cla-ink shadow-sm transition-transform duration-150 focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-cla-primary"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <EventBand event={collections.nextEvent} />

        <section
          id="mission"
          className="scroll-mt-18 bg-white px-page py-24 text-cla-ink sm:py-32"
          aria-labelledby="mission-title"
        >
          <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2
                id="mission-title"
                className="max-w-[16ch] text-balance font-serif text-[clamp(3rem,6vw,5.75rem)] font-medium leading-[1.02] tracking-[-0.035em]"
              >
                Catholic Leaders in Action brings young adults together to form leaders, build community, and carry faith into public and everyday life.
              </h2>
            </div>
            <div className="flex flex-col justify-end lg:col-span-4">
              <p className="max-w-[53ch] text-pretty text-lg leading-relaxed text-cla-muted">
                Gatherings combine community, prayer, Catholic Social Teaching,
                dialogue, and pathways into concrete service or advocacy. The
                tradition becomes something to understand together—and a way
                to meet the life in front of us.
              </p>
              <dl className="mt-10 border-t border-cla-line pt-6">
                <div className="grid grid-cols-[auto_1fr] gap-5">
                  <dt className="font-serif text-4xl font-medium tabular-nums text-cla-primary">
                    ~50
                  </dt>
                  <dd className="text-pretty leading-relaxed text-cla-muted">
                    young adults attended the inaugural gathering, according to
                    the Archdiocese of San Francisco.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <StorySequence />
        <EventsArchive collections={collections} />
        <CommunityProof />
        <JoinSupport />
      </main>
      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
    </>
  );
}
