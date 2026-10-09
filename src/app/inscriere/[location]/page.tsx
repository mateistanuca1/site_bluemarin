import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import Section from '@/components/Section';
import EnrollmentForm from '@/components/forms/EnrollmentForm';
import { getContent, getContentSync } from '@/lib/content';

type Params = { location: string };

export function generateStaticParams(): Params[] {
  return getContentSync('locations').items.map((l) => ({ location: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { location } = await params;
  const loc = (await getContent('locations')).items.find((l) => l.slug === location);
  if (!loc) return { title: 'Formular de înscriere' };

  return {
    title: `Formular înscriere — ${loc.name}`,
    description: `Completează formularul de înscriere la cursurile de înot Bluemarin, locația ${loc.name}.`,
    alternates: { canonical: `/inscriere/${loc.slug}` },
    // Formularele nu trebuie sa apara in Google.
    robots: { index: false, follow: true },
  };
}

const NEEDED = [
  'Aviz epidemiologic de la medicul de familie',
  'Adeverință „apt efort fizic”',
  'Semnătura ta, direct pe ecran',
];

export default async function EnrollPage({ params }: { params: Promise<Params> }) {
  const { location } = await params;
  const locations = await getContent('locations');

  const loc = locations.items.find((l) => l.slug === location);
  if (!loc) notFound();

  const others = locations.items.filter((l) => l.slug !== location);

  return (
    <>
      <PageHero title="Formular de înscriere" kicker={loc.name} image={loc.hero} />

      <Section size="lg">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-[clamp(1.3rem,3.4vw,1.8rem)] font-bold uppercase tracking-headline">
              Hai în echipa Bluemarin!
            </h2>
            <p className="mx-auto mt-5 text-[15.5px] leading-relaxed text-ink-soft">
              Completează formularul de mai jos pentru a face parte din comunitatea noastră. La
              final primești pe e-mail fișa de înscriere în format PDF, iar un exemplar rămâne
              arhivat la noi.
            </p>

            <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-5 py-2.5 text-[13.5px] font-medium text-deep-700">
              <Icon name="pin" className="h-4 w-4 shrink-0 text-brand" />
              {loc.name} — {loc.address}
            </p>

            {others.length > 0 && (
              <p className="mt-4 text-[13px] text-ink-muted">
                Altă locație?{' '}
                {others.map((o, i) => (
                  <span key={o.slug}>
                    {i > 0 && ' · '}
                    <Link
                      href={`/inscriere/${o.slug}`}
                      className="font-semibold text-brand underline underline-offset-2 hover:no-underline"
                    >
                      {o.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
            <div className="card order-2 p-6 sm:p-9 lg:order-1">
              <EnrollmentForm locationSlug={loc.slug} locationName={loc.name} />
            </div>

            {/* Ce trebuie pregatit inainte de a incepe — reduce abandonul la mijlocul formularului. */}
            <aside className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-card border border-line bg-brand-50 p-6">
                <h3 className="label mb-4 text-brand">Pregătește înainte</h3>
                <ul className="space-y-3">
                  {NEEDED.map((n) => (
                    <li key={n} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-ink-soft">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      {n}
                    </li>
                  ))}
                </ul>

                <p className="mt-5 border-t border-brand-200 pt-5 text-[13px] leading-relaxed text-ink-muted">
                  O fotografie clară făcută cu telefonul este suficientă pentru documentele
                  medicale.
                </p>
              </div>

              <div className="mt-4 rounded-card border border-line p-6">
                <h3 className="label mb-3 text-ink-muted">Ai o întrebare?</h3>
                <a
                  href="tel:+40744258258"
                  className="flex items-center gap-2 text-[14.5px] font-semibold text-brand hover:underline"
                >
                  <Icon name="phone" className="h-4 w-4" />
                  0744 258 258
                </a>
                <Link
                  href="/regulament"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-brand"
                >
                  <Icon name="file-text" className="h-4 w-4" />
                  Citește regulamentul
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </Section>
    </>
  );
}
