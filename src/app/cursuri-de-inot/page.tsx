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
  title: 'Cursuri de inot',
  description:
    'Cursuri de inot pentru copii si adulti in Bucuresti: initiere, perfectionare si performanta. Grupe mici si antrenor personal, cu instructori licentiati.',
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
      <PageHero title={courses.title} quote={courses.quote} image={courses.hero} />

      <Section size="lg">
        <div className="mx-auto max-w-3xl prose-ro">
          {courses.intro.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      </Section>

      {/* Acreditari */}
      <Section tone="soft">
        <SectionTitle>{courses.credentials.title}</SectionTitle>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.credentials.items.map((c) => (
            <div key={c.title} className="flex gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-brand text-white">
                <Icon name="check" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[14px] font-semibold uppercase tracking-wide2">{c.title}</h3>
                <p className="mt-1.5 text-[13px] font-light leading-relaxed text-ink/70">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Etapele cursului */}
      <Section size="lg">
        <SectionTitle>{courses.stages.title}</SectionTitle>
        <ol className="mt-16 space-y-14">
          {courses.stages.items.map((s, i) => (
            <li key={s.title} className="grid gap-6 lg:grid-cols-[auto_1fr] lg:gap-10">
              <span
                aria-hidden="true"
                className="text-[42px] font-semibold leading-none text-brand/25 lg:text-[64px]"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-[19px] font-semibold uppercase tracking-wide2">{s.title}</h3>
                <div className="mt-4 prose-ro">
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
      <Section tone="deep" pattern className="bg-deep">
        <SectionTitle>{courses.materials.title}</SectionTitle>
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {courses.materials.groups.map((g) => (
            <div key={g.label} className="border border-white/25 px-7 py-8">
              <h3 className="mb-5 text-[14px] font-semibold uppercase tracking-headline">
                {g.label}
              </h3>
              <ul className="space-y-2.5">
                {g.items.map((it) => (
                  <li key={it} className="flex items-center gap-3 text-[14px] font-light text-white/85">
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
        <SectionTitle>{courses.formats.title}</SectionTitle>
        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {courses.formats.items.map((f) => (
            <div key={f.title} className="border border-black/10 p-8 shadow-sm">
              <h3 className="text-[19px] font-semibold uppercase tracking-wide2">{f.title}</h3>
              <p className="mt-2 text-[12px] font-light uppercase tracking-wide2 text-brand">
                {f.subtitle}
              </p>
              <div className="mt-5 prose-ro">
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
        <div className="mx-auto mt-12 max-w-3xl prose-ro">
          {paragraphs(courses.instructors.text).map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/echipa" className="btn btn-outline">
            Cunoaste echipa
          </Link>
        </div>
      </Section>

      {/* Locatii */}
      <Section size="lg">
        <SectionTitle>Locatii</SectionTitle>
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {locations.items.map((l) => (
            <Link
              key={l.slug}
              href={`/locatii/${l.slug}`}
              className="group border border-black/10 p-8 transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg"
            >
              <h3 className="text-[19px] font-semibold uppercase tracking-wide2 group-hover:text-brand">
                {l.name}
              </h3>
              <p className="mt-4 text-[14px] font-light leading-relaxed text-ink/75">{l.intro}</p>
              <p className="mt-5 flex items-center gap-2 text-[13px] text-brand">
                <Icon name="pin" className="h-4 w-4" />
                {l.address}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide2 text-brand">
                Vezi locatia
                <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Cum te inscrii */}
      <Section tone="soft" size="lg">
        <SectionTitle>{courses.enrollment.title}</SectionTitle>
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {courses.enrollment.steps.map((s, i) => (
            <div key={s.title}>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-brand text-[13px] font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="text-[16px] font-semibold uppercase tracking-wide2">{s.title}</h3>
              </div>
              <div className="mt-4 prose-ro text-[14px]">
                {paragraphs(s.text).map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link href="/tarife" className="btn btn-primary">
            Vezi tarifele
          </Link>
          <Link href="/inscriere/bazin-cs-rapid" className="btn btn-outline">
            Formular de inscriere
          </Link>
        </div>
      </Section>

      <Section image={courses.hero} overlay="rgba(6, 25, 130, 0.88)" size="sm">
        <ParallaxQuote quote={site.quote} cite={site.name} />
      </Section>

      <SocialCards site={site} />
    </>
  );
}
