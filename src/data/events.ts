export type ClaEvent = {
  id: string;
  slug: string;
  title: string;
  theme?: string;
  summary: string;
  startsAt: string;
  endsAt?: string;
  timezone: "America/Los_Angeles";
  venue: string;
  address?: string;
  speaker?: string;
  image?: string;
  rsvpUrl?: string;
  status: "draft" | "published" | "cancelled";
  featured?: boolean;
};

/**
 * Event publishing checklist
 * 1. Add only organization-confirmed logistics, with an ISO 8601 offset.
 * 2. Use status "draft" until the public details and RSVP destination are approved.
 * 3. Never infer a future date from the reported monthly cadence.
 * 4. Add a verified RSVP URL before setting featured: true.
 *
 * TODO(organization): confirm the next gathering's date, venue, theme, speaker,
 * accessibility details, cost, and canonical RSVP URL before adding it here.
 */
export const events: ClaEvent[] = [
  {
    id: "cla-2026-06-02-called-to-lead",
    slug: "called-to-lead-june-2026",
    title: "Called to Lead",
    summary:
      "The inaugural gathering combined a social hour, Catholic Social Teaching formation, a panel, audience Q&A, and prayer for about 50 young adults.",
    startsAt: "2026-06-02T19:00:00-07:00",
    endsAt: "2026-06-02T21:00:00-07:00",
    timezone: "America/Los_Angeles",
    venue: "St. Philip Parish Hall",
    speaker: "Ryan Mayer",
    image: "/images/panel-discussion.png",
    status: "published",
  },
];
