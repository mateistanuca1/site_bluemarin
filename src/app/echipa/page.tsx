import type { Metadata } from 'next';
import Link from 'next/link';

import PageHero from '@/components/PageHero';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import TeamCard from '@/components/TeamCard';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Echipa',
  description:
    'Antrenorii și instructorii de înot Bluemarin: foști și actuali sportivi de performanță, acreditați de Ministerul Tineretului și Sportului.',
  alternates: { canonical: '/echipa' },
};

export default async function TeamPage() {
  const [site, team] = await Promise.all([getContent('site'), getContent('team')]);

  return (
    <>
      <PageHero title={team.title} kicker="Oamenii din bazin" image="/images/academia.webp" quote={site.quote} />

      <Section size="lg">
        <SectionTitle kicker={`${team.members.length} antrenori`} lead={team.lead}>
          Antrenorii noștri
        </SectionTitle>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.members.map((m) => (
            <TeamCard key={m.slug} member={m} />
          ))}
        </div>
      </Section>

      <Section tone="soft" size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(1.2rem,2.6vw,1.6rem)] font-bold uppercase tracking-headline">
            Vrei să ni te alături?
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            Căutăm mereu antrenori și instructori pasionați de mediul acvatic.
          </p>
          <Link href="/cariere" className="btn btn-primary mt-7">
            Vezi pagina Cariere
          </Link>
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
