import { describe, expect, it } from "vitest";
import type { ClaEvent } from "../src/data/events";
import { createIcs } from "../src/lib/calendar";
import { getEventCollections } from "../src/lib/events";

const baseEvent: ClaEvent = {
  id: "base",
  slug: "base",
  title: "Base event",
  summary: "A verified event.",
  startsAt: "2026-08-20T19:00:00-07:00",
  endsAt: "2026-08-20T21:00:00-07:00",
  timezone: "America/Los_Angeles",
  venue: "Parish Hall",
  status: "published",
};

describe("getEventCollections", () => {
  it("computes upcoming and past from the supplied current time", () => {
    const collections = getEventCollections(
      [
        { ...baseEvent, id: "future", slug: "future" },
        {
          ...baseEvent,
          id: "past",
          slug: "past",
          startsAt: "2026-07-01T19:00:00-07:00",
        },
      ],
      new Date("2026-08-14T12:00:00-07:00"),
    );

    expect(collections.upcoming.map((event) => event.id)).toEqual(["future"]);
    expect(collections.past.map((event) => event.id)).toEqual(["past"]);
    expect(collections.nextEvent?.id).toBe("future");
  });

  it("sorts upcoming ascending, past descending, and ignores drafts", () => {
    const collections = getEventCollections(
      [
        { ...baseEvent, id: "later", slug: "later", startsAt: "2026-10-01T19:00:00-07:00" },
        { ...baseEvent, id: "sooner", slug: "sooner", startsAt: "2026-09-01T19:00:00-07:00" },
        { ...baseEvent, id: "old", slug: "old", startsAt: "2026-06-01T19:00:00-07:00" },
        { ...baseEvent, id: "newer-past", slug: "newer-past", startsAt: "2026-07-01T19:00:00-07:00" },
        { ...baseEvent, id: "draft", slug: "draft", status: "draft" },
      ],
      new Date("2026-08-14T12:00:00-07:00"),
    );

    expect(collections.upcoming.map((event) => event.id)).toEqual([
      "sooner",
      "later",
    ]);
    expect(collections.past.map((event) => event.id)).toEqual([
      "newer-past",
      "old",
    ]);
  });

  it("labels cancelled events separately and never selects one as next", () => {
    const collections = getEventCollections(
      [
        { ...baseEvent, id: "cancelled", slug: "cancelled", status: "cancelled", featured: true },
        { ...baseEvent, id: "valid", slug: "valid", startsAt: "2026-09-01T19:00:00-07:00" },
      ],
      new Date("2026-08-14T12:00:00-07:00"),
    );

    expect(collections.cancelled.map((event) => event.id)).toEqual([
      "cancelled",
    ]);
    expect(collections.nextEvent?.id).toBe("valid");
  });
});

describe("createIcs", () => {
  it("creates a UTC calendar download from the event record", () => {
    const calendar = createIcs(baseEvent);

    expect(calendar).toContain("BEGIN:VCALENDAR");
    expect(calendar).toContain("SUMMARY:Base event");
    expect(calendar).toContain("DTSTART:20260821T020000Z");
    expect(calendar).toContain("DTEND:20260821T040000Z");
    expect(calendar).toContain("LOCATION:Parish Hall");
  });
});
