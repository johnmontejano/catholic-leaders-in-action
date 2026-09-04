import {
  ArrowRight,
  CalendarBlank,
  Clock,
  MapPin,
} from "@phosphor-icons/react";
import { links } from "../data";
import { asset } from "../lib/assets";
import { Reveal } from "./Reveal";

const details = [
  {
    icon: CalendarBlank,
    label: "Tuesday, October 6, 2026",
  },
  {
    icon: Clock,
    label: "6:30 to 9:30 PM",
  },
  {
    icon: MapPin,
    label: "San Francisco, address after registration",
  },
];

export function NextEvent() {
  return (
    <section className="section-space bg-void-black" id="next">
      <div className="page-shell">
        <Reveal className="mx-auto mb-14 max-w-[820px] text-center md:mb-20">
          <p className="label-caps mb-6 text-smoke">The next evening</p>
          <h2 className="section-title mx-auto text-balance text-pure-white">
            Called to <span className="accent-word">relationship.</span>
          </h2>
          <p className="section-copy mx-auto mt-6 text-pretty">
            Dating, love, marriage, family, discernment, and the spiritual
            battle surrounding our relationships.
          </p>
        </Reveal>

        <Reveal>
          <article className="media-card media-scrim min-h-[680px] md:min-h-[760px]">
            <img
              alt="The nave of Saint Philip the Apostle in San Francisco."
              height="1821"
              loading="lazy"
              src={asset("assets/img/nave-2400.jpg")}
              width="2400"
            />
            <div className="media-card-content grid gap-8 md:grid-cols-[1fr_380px] md:items-end">
              <div>
                <p className="text-sm font-medium text-pure-white/70">
                  With Ed Hopfner
                </p>
                <h3 className="mt-3 max-w-[720px] text-balance text-[clamp(2.8rem,6vw,5.75rem)] font-medium leading-[0.95] tracking-[-0.045em] text-pure-white">
                  A candid night about love and vocation.
                </h3>
              </div>
              <div className="flex flex-col items-start gap-5 md:items-stretch">
                <ul className="space-y-3">
                  {details.map(({ icon: Icon, label }) => (
                    <li
                      className="flex items-start gap-3 text-sm leading-5 text-pure-white/82"
                      key={label}
                    >
                      <Icon
                        aria-hidden="true"
                        className="mt-0.5 shrink-0"
                        size={17}
                      />
                      {label}
                    </li>
                  ))}
                </ul>
                <a
                  className="button-primary w-full"
                  href={links.nextEvent}
                  rel="noreferrer"
                  target="_blank"
                >
                  Reserve your seat
                  <ArrowRight aria-hidden="true" size={16} weight="bold" />
                </a>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
