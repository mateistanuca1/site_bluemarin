import type { Metadata } from 'next';

import PageHero from '@/components/PageHero';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import TeamCard from '@/components/TeamCard';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Echipa',
  description:
    'Antrenorii si instructorii de inot Bluemarin: fosti si actuali sportivi de performanta, acreditati de Ministerul Tineretului si Sportului.',
  alternates: { canonical: '/echipa' },
};

export default async function TeamPage() {
  const [site, team] = await Promise.all([getContent('site'), getContent('team')]);

  return (
    <>
      <PageHero title={team.title} image="/images/academia.webp" quote={site.quote} />

      <Section size="lg">
        <SectionTitle lead={team.lead}>Antrenorii nostri</SectionTitle>
        <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {team.members.map((m) => (
            <TeamCard key={m.slug} member={m} />
          ))}
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
