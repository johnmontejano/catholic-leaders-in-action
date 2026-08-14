import type { ClaEvent } from "@/data/events";

export type EventCollections = {
  upcoming: ClaEvent[];
  past: ClaEvent[];
  cancelled: ClaEvent[];
  nextEvent?: ClaEvent;
};

export function getEventCollections(
  allEvents: ClaEvent[],
  now = new Date(),
): EventCollections {
  const published = allEvents.filter((event) => event.status !== "draft");
  const upcoming: ClaEvent[] = [];
  const past: ClaEvent[] = [];
  const cancelled: ClaEvent[] = [];

  for (const event of published) {
    if (event.status === "cancelled") {
      cancelled.push(event);
      continue;
    }

    if (new Date(event.startsAt).getTime() > now.getTime()) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  upcoming.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
  past.sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );
  cancelled.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  return {
    upcoming,
    past,
    cancelled,
    nextEvent: upcoming.find((event) => event.featured) ?? upcoming[0],
  };
}

export function findPublishedEvent(
  allEvents: ClaEvent[],
  slug: string,
): ClaEvent | undefined {
  return allEvents.find(
    (event) => event.slug === slug && event.status !== "draft",
  );
}

export function formatEventDate(event: ClaEvent): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: event.timezone,
  }).format(new Date(event.startsAt));
}

export function formatEventTime(event: ClaEvent): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: event.timezone,
    timeZoneName: "short",
  });
  const start = formatter.format(new Date(event.startsAt));

  if (!event.endsAt) return start;

  const end = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: event.timezone,
  }).format(new Date(event.endsAt));

  return `${start}–${end}`;
}
