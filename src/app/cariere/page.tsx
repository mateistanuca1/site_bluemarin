import type { Metadata } from 'next';

import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import CareerForm from '@/components/forms/CareerForm';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Cariere',
  description:
    'Vrei sa fii antrenor sau instructor de inot la Bluemarin Sport Club? Trimite-ne CV-ul tau.',
  alternates: { canonical: '/cariere' },
};

export default async function CareersPage() {
  const [site, careers] = await Promise.all([getContent('site'), getContent('careers')]);

  return (
    <>
      <PageHero title={careers.title} kicker="Hai in echipa" image={careers.hero} />

      <Section size="lg">
        <SectionTitle lead={careers.lead}>Ne caut colegi</SectionTitle>

        <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h3 className="mb-7 text-[15px] font-semibold uppercase tracking-headline text-brand">
              Ingredientele noastre
            </h3>
            <ul className="space-y-4">
              {careers.criteria.map((c) => (
                <li key={c} className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand text-white">
                    <Icon name="thumbs-up" className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-[14px] font-light">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-black/10 p-7 shadow-sm sm:p-9">
            <h3 className="text-[20px] font-semibold uppercase tracking-wide2">
              {careers.formTitle}
            </h3>
            <p className="mb-7 mt-3 text-[14px] font-light leading-relaxed text-ink/75">
              {careers.formLead}
            </p>
            <CareerForm />
          </div>
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
