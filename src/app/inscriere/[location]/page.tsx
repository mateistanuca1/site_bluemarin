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
  if (!loc) return { title: 'Formular de inscriere' };

  return {
    title: `Formular inscriere — ${loc.name}`,
    description: `Completeaza formularul de inscriere la cursurile de inot Bluemarin, locatia ${loc.name}.`,
    alternates: { canonical: `/inscriere/${loc.slug}` },
    // Formularele nu trebuie sa apara in Google.
    robots: { index: false, follow: true },
  };
}

export default async function EnrollPage({ params }: { params: Promise<Params> }) {
  const { location } = await params;
  const locations = await getContent('locations');

  const loc = locations.items.find((l) => l.slug === location);
  if (!loc) notFound();

  const others = locations.items.filter((l) => l.slug !== location);

  return (
    <>
      <PageHero
        title="Formular de inscriere"
        kicker={loc.name}
        image={loc.hero}
      />

      <Section size="lg">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <h2 className="text-[22px] font-semibold uppercase tracking-headline sm:text-[26px]">
              Hai in echipa Bluemarin!
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] font-light leading-relaxed text-ink/80">
              Completeaza formularul de mai jos pentru a face parte din comunitatea noastra. La
              final, vei primi pe email un PDF cu toate informatiile completate, iar un exemplar
              va fi salvat in sistemul nostru intern.
            </p>

            <p className="mt-7 inline-flex items-center gap-2 border border-brand/30 bg-brand-soft px-5 py-2.5 text-[13px] font-medium text-deep-dark">
              <Icon name="pin" className="h-4 w-4 text-brand" />
              {loc.name} — {loc.address}
            </p>

            {others.length > 0 && (
              <p className="mt-5 text-[13px] text-muted">
                Alta locatie?{' '}
                {others.map((o, i) => (
                  <span key={o.slug}>
                    {i > 0 && ' · '}
                    <Link
                      href={`/inscriere/${o.slug}`}
                      className="font-semibold text-brand underline"
                    >
                      {o.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>

          <EnrollmentForm locationSlug={loc.slug} locationName={loc.name} />
        </div>
      </Section>
    </>
  );
}
