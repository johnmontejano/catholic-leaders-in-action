import { events } from "@/data/events";
import { createIcs } from "@/lib/calendar";
import { findPublishedEvent } from "@/lib/events";

export const dynamic = "force-static";

export function generateStaticParams() {
  return events
    .filter((event) => event.status !== "draft")
    .map((event) => ({ slug: event.slug }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = findPublishedEvent(events, slug);

  if (!event || event.status === "cancelled") {
    return new Response("Event not found", { status: 404 });
  }

  return new Response(createIcs(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
