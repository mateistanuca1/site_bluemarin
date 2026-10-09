import type { Metadata } from 'next';

import GalleryGrid from '@/components/GalleryGrid';
import PageHero from '@/components/PageHero';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Galerie',
  description:
    'Poze din bazin: cursuri de înot pentru copii și adulți, antrenamente și competiții la Bluemarin Sport Club.',
  alternates: { canonical: '/galerie' },
};

export default async function GalleryPage() {
  const [site, gallery] = await Promise.all([getContent('site'), getContent('gallery')]);

  return (
    <>
      <PageHero title={gallery.title} kicker="Momente din bazin" image="/images/academia.webp" />

      <Section size="lg">
        <SectionTitle kicker={`${gallery.images.length} fotografii`} lead={gallery.lead}>
          {gallery.title}
        </SectionTitle>

        <div className="mt-12">
          {gallery.images.length > 0 ? (
            <GalleryGrid images={gallery.images} />
          ) : (
            <p className="text-center text-[14px] text-ink-muted">
              Galeria se completează în curând.
            </p>
          )}
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
