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
    'Poze din bazin: cursuri de inot pentru copii si adulti, antrenamente si competitii la Bluemarin Sport Club.',
  alternates: { canonical: '/galerie' },
};

export default async function GalleryPage() {
  const [site, gallery] = await Promise.all([getContent('site'), getContent('gallery')]);

  return (
    <>
      <PageHero
        title={gallery.title}
        kicker="Momente din bazin"
        image="/images/academia.webp"
      />

      <Section size="lg">
        <SectionTitle lead={gallery.lead}>{gallery.title}</SectionTitle>
        <div className="mt-14">
          {gallery.images.length > 0 ? (
            <GalleryGrid images={gallery.images} />
          ) : (
            <p className="text-center text-[14px] text-muted">
              Galeria se completeaza in curand.
            </p>
          )}
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
