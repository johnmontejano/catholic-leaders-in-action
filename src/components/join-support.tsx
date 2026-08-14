import { LinkButton } from "@/components/link-button";
import { EXTERNAL_LINKS } from "@/lib/links";

export function JoinSupport() {
  return (
    <section id="join" className="scroll-mt-18 text-white" aria-labelledby="join-title">
      <div className="grid lg:grid-cols-12">
        <div className="bg-cla-primary px-page py-20 sm:py-24 lg:col-span-8 lg:px-[max(2rem,calc((100vw-80rem)/2))] lg:pr-16">
          <h2
            id="join-title"
            className="max-w-[12ch] text-balance font-serif text-[clamp(3rem,6vw,5.5rem)] font-medium leading-none tracking-[-0.035em]"
          >
            Come for the next gathering. Stay for the community.
          </h2>
          <p className="mt-6 max-w-[57ch] text-pretty text-lg leading-relaxed text-white/85">
            Membership and WhatsApp updates keep you close to upcoming
            gatherings, community news, and opportunities to serve. Choose the
            channel that fits how you want to participate.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton
              href={EXTERNAL_LINKS.membership}
              variant="light"
              external
            >
              Become a member
            </LinkButton>
            <LinkButton
              href={EXTERNAL_LINKS.whatsapp}
              variant="outline"
              external
            >
              Join on WhatsApp
            </LinkButton>
          </div>
        </div>

        <div className="bg-cla-action px-page py-16 sm:py-20 lg:col-span-4 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-24">
          <div>
            <p className="text-lg font-semibold">Support the mission</p>
            <h3 className="mt-4 max-w-[12ch] text-balance font-serif text-4xl font-medium leading-tight sm:text-5xl">
              Help make formation and community possible.
            </h3>
            <p className="mt-5 max-w-[42ch] text-pretty leading-relaxed text-white/85">
              Give through the organization’s verified public Venmo profile.
              Participation remains the first invitation; financial support is
              another way to stand behind the work.
            </p>
          </div>
          <LinkButton
            href={EXTERNAL_LINKS.venmo}
            variant="light"
            external
            className="mt-8 self-start"
          >
            Give with Venmo
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
