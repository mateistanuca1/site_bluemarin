import type { Metadata } from 'next';
import Link from 'next/link';

import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import { getContent } from '@/lib/content';
import { paragraphs } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Cursuri înot copii',
  description:
    'Cursuri de înot pentru copii de la 4 ani: acomodare cu apa, inițiere, avansați și performanță. Grupe mici, cu un culoar de bazin și antrenori licențiați.',
  alternates: { canonical: '/cursuri-inot-copii' },
};

export default async function KidsPage() {
  const [site, kids, pricing] = await Promise.all([
    getContent('site'),
    getContent('kids'),
    getContent('pricing'),
  ]);

  return (
    <>
      <PageHero
        title={kids.title}
        kicker="De la 4 ani"
        quote={kids.quote}
        image={kids.hero}
      />

      <Section size="lg">
        <SectionTitle lead={kids.subtitle}>{kids.title}</SectionTitle>
        <div className="prose-ro mx-auto mt-10 max-w-prose">
          {kids.intro.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      </Section>

      {/* Acomodarea cu apa */}
      <Section tone="soft">
        <SectionTitle>{kids.acclimatisation.title}</SectionTitle>
        <div className="mx-auto mt-10 max-w-prose">
          <div className="prose-ro">
            {paragraphs(kids.acclimatisation.text).map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>

          <div className="my-8 flex flex-wrap justify-center gap-2.5">
            {kids.acclimatisation.materials.map((m) => (
              <span
                key={m}
                className="flex items-center gap-2 rounded-full border border-brand-200 bg-white
                           px-4 py-2 text-[13px] font-medium text-ink"
              >
                <Icon name="check" className="h-3.5 w-3.5 text-brand" />
                {m}
              </span>
            ))}
          </div>

          <p className="prose-ro">{kids.acclimatisation.closing}</p>
        </div>
      </Section>

      {/* Niveluri */}
      <Section size="lg">
        <SectionTitle kicker="Parcursul copilului">{kids.levels.title}</SectionTitle>

        <ol className="mx-auto mt-14 max-w-4xl">
          {kids.levels.items.map((l, i) => (
            <li
              key={l.title}
              className="relative grid gap-5 pb-12 last:pb-0 sm:grid-cols-[auto_1fr] sm:gap-8"
            >
              {i < kids.levels.items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[23px] top-14 hidden h-[calc(100%-3rem)] w-px bg-brand-200 sm:block"
                />
              )}

              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] font-bold text-white">
                {i + 1}
              </span>

              <div className="sm:pt-1.5">
                <h3 className="text-[19px] font-bold uppercase tracking-headline">{l.title}</h3>
                <p className="label mt-2 text-brand">{l.subtitle}</p>
                <div className="prose-ro mt-4">
                  {paragraphs(l.text).map((p) => (
                    <p key={p.slice(0, 32)}>{p}</p>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Grupe vs antrenor personal */}
      <Section tone="deep">
        <SectionTitle>{kids.formats.title}</SectionTitle>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {kids.formats.items.map((f) => (
            <div key={f.title} className="card-dark p-8">
              <h3 className="text-[17px] font-bold uppercase tracking-wide2">{f.title}</h3>
              <div className="mt-5 space-y-4 text-[14.5px] leading-relaxed text-white/80">
                {paragraphs(f.text).map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Tarife pe scurt */}
      <Section tone="soft" size="lg">
        <SectionTitle kicker="Tarife" lead="Vârsta minimă pentru participare: 4 ani.">
          Abonamente
        </SectionTitle>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {pricing.locations.map((l) => (
            <div key={l.slug} className="card flex flex-col p-8">
              <h3 className="text-[17px] font-bold uppercase tracking-wide2">{l.name}</h3>
              <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-muted">
                <Icon name="pin" className="h-4 w-4 shrink-0 text-brand" />
                {l.address}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {l.categories.map((c) => {
                  const cheapest = Math.min(...c.packages.map((p) => p.price));
                  return (
                    <li
                      key={c.id}
                      className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-0"
                    >
                      <span className="text-[14.5px] font-medium">{c.name}</span>
                      <span className="shrink-0 text-[14.5px] font-semibold text-brand">
                        de la {cheapest} {pricing.currency}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <Link href="/tarife" className="btn btn-outline mt-7 w-full">
                Toate tarifele
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
