import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import GalleryGrid from '@/components/GalleryGrid';
import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import ParallaxQuote from '@/components/ParallaxQuote';
import PricingTable from '@/components/PricingTable';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import { getContent, getContentSync } from '@/lib/content';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getContentSync('locations').items.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loc = (await getContent('locations')).items.find((l) => l.slug === slug);
  if (!loc) return { title: 'Locatie' };

  return {
    title: loc.name,
    description: `Cursuri de inot Bluemarin la ${loc.name}, ${loc.address}. ${loc.intro.slice(0, 110)}`,
    alternates: { canonical: `/locatii/${loc.slug}` },
    openGraph: { images: [loc.hero] },
  };
}

export default async function LocationPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [site, locations, pricing, gallery] = await Promise.all([
    getContent('site'),
    getContent('locations'),
    getContent('pricing'),
    getContent('gallery'),
  ]);

  const loc = locations.items.find((l) => l.slug === slug);
  if (!loc) notFound();

  const hasPricing = pricing.locations.some((p) => p.slug === loc.slug);
  const photos = gallery.images.slice(0, 8);

  return (
    <>
      <PageHero title={loc.name} kicker="Locatie" image={loc.hero} quote={loc.galleryNote} />

      {/* Intro + specificatii */}
      <Section size="lg">
        <div className="mx-auto max-w-3xl prose-ro text-center">
          <p>{loc.intro}</p>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {loc.specs.map((s) => (
            <div key={s.label} className="border border-black/10 px-5 py-7 text-center">
              <dt className="text-[11px] font-semibold uppercase tracking-headline text-muted">
                {s.label}
              </dt>
              <dd className="mt-2.5 text-[22px] font-semibold text-brand">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px]">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-brand hover:underline"
          >
            <Icon name="pin" className="h-4 w-4" />
            {loc.address}
          </a>
          {loc.schedule.map((s) => (
            <span key={s} className="flex items-center gap-2 text-muted">
              <Icon name="clock" className="h-4 w-4 text-brand" />
              {s}
            </span>
          ))}
        </div>
      </Section>

      {/* Detalii */}
      <Section tone="soft">
        <SectionTitle>Despre locatie</SectionTitle>
        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:gap-14">
          {loc.sections.map((s) => (
            <div key={s.title}>
              <h3 className="mb-3 text-[16px] font-semibold uppercase tracking-wide2">{s.title}</h3>
              <p className="text-[14px] font-light leading-[1.85] text-ink/80">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Harta */}
      <Section size="sm">
        <SectionTitle>Cum ajungi</SectionTitle>
        <div className="mt-12 aspect-[16/9] w-full border border-black/10">
          <iframe
            src={loc.mapEmbed}
            title={`Harta — ${loc.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full"
          />
        </div>
      </Section>

      {/* Galerie scurta */}
      {photos.length > 0 && (
        <Section tone="soft">
          <SectionTitle lead={loc.galleryNote}>Galerie foto</SectionTitle>
          <div className="mt-12">
            <GalleryGrid images={photos} />
          </div>
          <div className="mt-10 text-center">
            <Link href="/galerie" className="btn btn-outline">
              Toata galeria
            </Link>
          </div>
        </Section>
      )}

      {/* Abonamente */}
      {hasPricing && (
        <Section id="abonamente" size="lg">
          <SectionTitle lead={pricing.lead}>Abonamente si program</SectionTitle>
          <div className="mt-14">
            <PricingTable
              locations={pricing.locations}
              currency={pricing.currency}
              commonConditions={pricing.commonConditions}
              onlySlug={loc.slug}
            />
          </div>
        </Section>
      )}

      <Section image={loc.hero} overlay="rgba(6, 25, 130, 0.88)" size="sm">
        <ParallaxQuote quote={site.quote} cite={site.name} />
      </Section>

      <SocialCards site={site} />
    </>
  );
}
