import type { Metadata } from 'next';
import Link from 'next/link';

import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import ParallaxQuote from '@/components/ParallaxQuote';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import { getContent } from '@/lib/content';
import { paragraphs } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Cursuri de înot',
  description:
    'Cursuri de înot pentru copii și adulți în București: inițiere, perfecționare și performanță. Grupe mici și antrenor personal, cu instructori licențiați.',
  alternates: { canonical: '/cursuri-de-inot' },
};

export default async function CoursesPage() {
  const [site, courses, locations] = await Promise.all([
    getContent('site'),
    getContent('courses'),
    getContent('locations'),
  ]);

  return (
    <>
      <PageHero
        title={courses.title}
        kicker="Copii și adulți"
        quote={courses.quote}
        image={courses.hero}
      />

      <Section size="lg">
        <div className="prose-ro mx-auto max-w-prose">
          {courses.intro.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      </Section>

      {/* Acreditari */}
      <Section tone="soft">
        <SectionTitle kicker="De încredere">{courses.credentials.title}</SectionTitle>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.credentials.items.map((c) => (
            <div key={c.title} className="card flex gap-4 p-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-wide2">{c.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Etapele cursului */}
      <Section size="lg">
        <SectionTitle kicker="Pas cu pas">{courses.stages.title}</SectionTitle>

        <ol className="mx-auto mt-14 max-w-4xl">
          {courses.stages.items.map((s, i) => (
            <li
              key={s.title}
              className="relative grid gap-5 pb-12 last:pb-0 sm:grid-cols-[auto_1fr] sm:gap-8"
            >
              {/* Linia verticala care leaga etapele. */}
              {i < courses.stages.items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[23px] top-14 hidden h-[calc(100%-3rem)] w-px bg-brand-200 sm:block"
                />
              )}

              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] font-bold text-white">
                {i + 1}
              </span>

              <div className="sm:pt-2">
                <h3 className="text-[18px] font-bold uppercase tracking-wide2">{s.title}</h3>
                <div className="prose-ro mt-3.5">
                  {paragraphs(s.text).map((p) => (
                    <p key={p.slice(0, 32)}>{p}</p>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Materiale */}
      <Section tone="deep">
        <SectionTitle>{courses.materials.title}</SectionTitle>
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          {courses.materials.groups.map((g) => (
            <div key={g.label} className="card-dark p-7">
              <h3 className="label mb-5 text-brand-light">{g.label}</h3>
              <ul className="space-y-3">
                {g.items.map((it) => (
                  <li key={it} className="flex items-center gap-3 text-[14.5px] text-white/85">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-brand-light" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Grup vs antrenor personal */}
      <Section size="lg">
        <SectionTitle kicker="Alege formatul">{courses.formats.title}</SectionTitle>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {courses.formats.items.map((f) => (
            <div key={f.title} className="card p-8">
              <h3 className="text-[19px] font-bold uppercase tracking-wide2">{f.title}</h3>
              <p className="label mt-2 text-brand">{f.subtitle}</p>
              <div className="prose-ro mt-5">
                {paragraphs(f.text).map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Antrenorii */}
      <Section tone="soft">
        <SectionTitle>{courses.instructors.title}</SectionTitle>
        <div className="prose-ro mx-auto mt-10 max-w-prose">
          {paragraphs(courses.instructors.text).map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/echipa" className="btn btn-outline">
            Cunoaște echipa
          </Link>
        </div>
      </Section>

      {/* Locatii */}
      <Section size="lg">
        <SectionTitle kicker="Unde ne găsești">Locații</SectionTitle>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {locations.items.map((l) => (
            <Link
              key={l.slug}
              href={`/locatii/${l.slug}`}
              className="card card-hover group flex flex-col p-8"
            >
              <h3 className="text-[19px] font-bold uppercase tracking-wide2 transition-colors group-hover:text-brand">
                {l.name}
              </h3>
              <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-muted">
                <Icon name="pin" className="h-4 w-4 shrink-0 text-brand" />
                {l.address}
              </p>
              <p className="mt-5 flex-1 text-[14.5px] leading-relaxed text-ink-soft">{l.intro}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide2 text-brand">
                Vezi locația
                <Icon
                  name="arrow-right"
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Cum te inscrii */}
      <Section tone="soft" size="lg">
        <SectionTitle kicker="Simplu și rapid">{courses.enrollment.title}</SectionTitle>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {courses.enrollment.steps.map((s, i) => (
            <div key={s.title} className="card p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="text-[15.5px] font-bold uppercase tracking-wide2">{s.title}</h3>
              </div>
              <div className="prose-ro mt-4 text-[14.5px]">
                {paragraphs(s.text).map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/tarife" className="btn btn-primary">
            Vezi tarifele
          </Link>
          <Link href="/inscriere/bazin-cs-rapid" className="btn btn-outline">
            Formular de înscriere
          </Link>
        </div>
      </Section>

      <Section image={courses.hero} size="sm">
        <ParallaxQuote quote={site.quote} cite={site.name} />
      </Section>

      <SocialCards site={site} />
    </>
  );
}
