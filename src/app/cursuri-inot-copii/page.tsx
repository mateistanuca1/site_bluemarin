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
  title: 'Cursuri inot copii',
  description:
    'Cursuri de inot pentru copii de la 4 ani: acomodare cu apa, initiere, avansati si performanta. Grupe mici cu un culoar de bazin si antrenori licentiati.',
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
      <PageHero title={kids.title} quote={kids.quote} image={kids.hero} />

      <Section size="lg">
        <SectionTitle lead={kids.subtitle}>{kids.title}</SectionTitle>
        <div className="mx-auto mt-10 max-w-3xl prose-ro">
          {kids.intro.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      </Section>

      {/* Acomodarea cu apa */}
      <Section tone="soft">
        <SectionTitle>{kids.acclimatisation.title}</SectionTitle>
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="prose-ro">
            {paragraphs(kids.acclimatisation.text).map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>

          <div className="my-8 flex flex-wrap justify-center gap-3">
            {kids.acclimatisation.materials.map((m) => (
              <span
                key={m}
                className="flex items-center gap-2 border border-brand/35 bg-white px-5 py-2.5 text-[13px] font-medium"
              >
                <Icon name="check" className="h-4 w-4 text-brand" />
                {m}
              </span>
            ))}
          </div>

          <p className="prose-ro">{kids.acclimatisation.closing}</p>
        </div>
      </Section>

      {/* Niveluri */}
      <Section size="lg">
        <SectionTitle>{kids.levels.title}</SectionTitle>
        <div className="mt-16 space-y-14">
          {kids.levels.items.map((l, i) => (
            <div key={l.title} className="grid gap-6 lg:grid-cols-[auto_1fr] lg:gap-10">
              <span
                aria-hidden="true"
                className="text-[42px] font-semibold leading-none text-brand/25 lg:text-[64px]"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-[20px] font-semibold uppercase tracking-headline">{l.title}</h3>
                <p className="mt-1.5 text-[12px] font-light uppercase tracking-wide2 text-brand">
                  {l.subtitle}
                </p>
                <div className="mt-5 prose-ro">
                  {paragraphs(l.text).map((p) => (
                    <p key={p.slice(0, 32)}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Grupe vs antrenor personal */}
      <Section tone="deep" pattern className="bg-deep">
        <SectionTitle>{kids.formats.title}</SectionTitle>
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {kids.formats.items.map((f) => (
            <div key={f.title} className="border border-white/25 px-7 py-8">
              <h3 className="text-[17px] font-semibold uppercase tracking-headline">{f.title}</h3>
              <div className="mt-5 space-y-4 text-[14px] font-light leading-relaxed text-white/85">
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
        <SectionTitle lead="Varsta minima pentru participare: 4 ani.">
          Abonamente
        </SectionTitle>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {pricing.locations.map((l) => (
            <div key={l.slug} className="border border-black/10 bg-white p-8">
              <h3 className="text-[17px] font-semibold uppercase tracking-wide2">{l.name}</h3>
              <p className="mt-2 flex items-center gap-2 text-[13px] text-muted">
                <Icon name="pin" className="h-4 w-4 text-brand" />
                {l.address}
              </p>
              <ul className="mt-6 space-y-3">
                {l.categories.map((c) => {
                  const cheapest = Math.min(...c.packages.map((p) => p.price));
                  return (
                    <li
                      key={c.id}
                      className="flex items-baseline justify-between gap-4 border-b border-black/5 pb-3 last:border-0"
                    >
                      <span className="text-[14px] font-medium">{c.name}</span>
                      <span className="shrink-0 text-[14px] text-brand">
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
