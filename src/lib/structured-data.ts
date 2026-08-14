import type { ClaEvent } from "@/data/events";
import { EXTERNAL_LINKS } from "@/lib/links";

const SITE_URL = "https://catholicleadersinaction.org";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Catholic Leaders in Action",
    url: `${SITE_URL}/`,
    sameAs: [EXTERNAL_LINKS.instagram],
    areaServed: "San Francisco Bay Area",
  };
}

export function eventJsonLd(event: ClaEvent) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventStatus:
      event.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      ...(event.address
        ? {
            address: {
              "@type": "PostalAddress",
              streetAddress: event.address,
              addressRegion: "CA",
              addressCountry: "US",
            },
          }
        : {}),
    },
    image: event.image ? `${SITE_URL}${event.image}` : undefined,
    organizer: {
      "@type": "Organization",
      name: "Catholic Leaders in Action",
      url: `${SITE_URL}/`,
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
