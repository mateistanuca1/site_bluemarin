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
  if (!loc) return { title: 'Locație' };

  return {
    title: loc.name,
    description: `Cursuri de înot Bluemarin la ${loc.name}, ${loc.address}. ${loc.intro.slice(0, 110)}`,
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

  const other = locations.items.find((l) => l.slug !== slug);
  const hasPricing = pricing.locations.some((p) => p.slug === loc.slug);
  const photos = gallery.images.slice(0, 8);

  return (
    <>
      <PageHero title={loc.name} kicker="Locație" image={loc.hero} quote={loc.galleryNote} />

      {/* Intro + specificatii */}
      <Section size="lg">
        <div className="prose-ro mx-auto max-w-prose text-center">
          <p>{loc.intro}</p>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loc.specs.map((s) => (
            <div key={s.label} className="card px-5 py-7 text-center">
              <dt className="label text-ink-muted">{s.label}</dt>
              <dd className="mt-3 text-[22px] font-bold text-brand">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[14px]">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-medium text-brand hover:underline"
          >
            <Icon name="pin" className="h-4 w-4" />
            {loc.address}
          </a>
          {loc.schedule.map((s) => (
            <span key={s} className="flex items-center gap-2 text-ink-muted">
              <Icon name="clock" className="h-4 w-4 text-brand" />
              {s}
            </span>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href={`/inscriere/${loc.slug}`} className="btn btn-primary">
            Înscrie-te la această locație
          </Link>
          {hasPricing && (
            <Link href="#abonamente" className="btn btn-outline">
              Vezi abonamentele
            </Link>
          )}
        </div>
      </Section>

      {/* Detalii */}
      <Section tone="soft">
        <SectionTitle kicker="Ce găsești aici">Despre locație</SectionTitle>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {loc.sections.map((s) => (
            <div key={s.title} className="card p-7">
              <h3 className="mb-3 text-[16px] font-bold uppercase tracking-wide2">{s.title}</h3>
              <p className="text-[14.5px] leading-[1.8] text-ink-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Harta */}
      <Section size="sm">
        <SectionTitle>Cum ajungi</SectionTitle>
        <div className="mt-10 aspect-[16/9] w-full overflow-hidden rounded-card border border-line">
          <iframe
            src={loc.mapEmbed}
            title={`Harta — ${loc.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full"
          />
        </div>
      </Section>

      {/* Abonamente */}
      {hasPricing && (
        <Section id="abonamente" tone="soft" size="lg">
          <SectionTitle kicker="Tarife" lead={pricing.lead}>
            Abonamente și program
          </SectionTitle>
          <div className="mt-12">
            <PricingTable
              locations={pricing.locations}
              currency={pricing.currency}
              commonConditions={pricing.commonConditions}
              onlySlug={loc.slug}
            />
          </div>
        </Section>
      )}

      {/* Galerie scurta */}
      {photos.length > 0 && (
        <Section size="lg">
          <SectionTitle lead={loc.galleryNote}>Galerie foto</SectionTitle>
          <div className="mt-12">
            <GalleryGrid images={photos} />
          </div>
          <div className="mt-10 text-center">
            <Link href="/galerie" className="btn btn-outline">
              Toată galeria
            </Link>
          </div>
        </Section>
      )}

      {/* Cealalta locatie */}
      {other && (
        <Section tone="soft" size="sm">
          <Link
            href={`/locatii/${other.slug}`}
            className="card card-hover group mx-auto flex max-w-3xl flex-col items-center gap-2 p-8 text-center"
          >
            <span className="label text-ink-muted">Cealaltă locație</span>
            <span className="text-[20px] font-bold uppercase tracking-wide2 transition-colors group-hover:text-brand">
              {other.name}
            </span>
            <span className="flex items-center gap-2 text-[13px] text-ink-muted">
              <Icon name="pin" className="h-4 w-4 text-brand" />
              {other.address}
            </span>
            <span className="mt-3 inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide2 text-brand">
              Vezi locația
              <Icon
                name="arrow-right"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          </Link>
        </Section>
      )}

      <Section image={loc.hero} size="sm">
        <ParallaxQuote quote={site.quote} cite={site.name} />
      </Section>

      <SocialCards site={site} />
    </>
  );
}
