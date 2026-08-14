import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { ArrowUpRightIcon } from "@/components/icons";
import { EXTERNAL_LINKS } from "@/lib/links";

export function CommunityProof() {
  return (
    <section
      id="community"
      className="scroll-mt-18 bg-cla-surface px-page py-24 text-cla-ink sm:py-32"
      aria-labelledby="community-title"
    >
      <div className="mx-auto max-w-site">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="max-w-[27ch] text-lg font-semibold text-cla-primary">
              A real community, already gathering
            </p>
            <h2
              id="community-title"
              className="mt-4 max-w-[13ch] text-balance font-serif text-[clamp(3rem,6vw,5.5rem)] font-medium leading-none tracking-[-0.035em]"
            >
              Serious formation. Ordinary friendship.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="max-w-[54ch] text-pretty text-lg leading-relaxed text-cla-muted">
              About 50 young adults attended the inaugural gathering,
              according to the Archdiocese of San Francisco. The evening made
              room for conversation before the program, questions during it,
              and prayer at its center.
            </p>
            <a
              href={EXTERNAL_LINKS.archdiocese}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-cla-primary underline underline-offset-4 hover:text-cla-primary-deep focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cla-primary"
            >
              Featured by the Archdiocese of San Francisco
              <ArrowUpRightIcon className="size-4" />
            </a>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-12 md:grid-rows-[auto_auto]">
          <figure className="md:col-span-8 md:row-span-1">
            <div className="relative aspect-[3/2] max-w-[600px] overflow-hidden md:ml-auto">
              <Image
                src={assetPath("/images/community-group.png")}
                alt="A group of young adults pose together after a Catholic Leaders in Action gathering."
                fill
                sizes="(min-width: 768px) 600px, 92vw"
                className="object-cover"
              />
            </div>
          </figure>
          <figure className="md:col-span-4 md:row-span-2 md:pt-20">
            <div className="relative aspect-[2/3] max-w-[400px] overflow-hidden">
              <Image
                src={assetPath("/images/community-conversation.png")}
                alt="Three young adults laugh together during a Catholic community social."
                fill
                sizes="(min-width: 768px) 32vw, 88vw"
                className="object-cover"
              />
            </div>
          </figure>
          <blockquote className="max-w-[27ch] border-t border-cla-line pt-8 font-serif text-[clamp(2.2rem,4vw,4rem)] leading-tight md:col-span-7 md:mt-12">
            <p>“We want to bring people’s faith into action.”</p>
            <cite className="mt-6 block font-sans text-base not-italic leading-relaxed text-cla-muted">
              Saul Perez, quoted by the Archdiocese of San Francisco
            </cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
