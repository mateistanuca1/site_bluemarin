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
    'Vrei să fii antrenor sau instructor de înot la Bluemarin Sport Club? Trimite-ne CV-ul tău.',
  alternates: { canonical: '/cariere' },
};

export default async function CareersPage() {
  const [site, careers] = await Promise.all([getContent('site'), getContent('careers')]);

  return (
    <>
      <PageHero title={careers.title} kicker="Hai în echipă" image={careers.hero} />

      <Section size="lg">
        <SectionTitle lead={careers.lead}>Căutăm colegi</SectionTitle>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div>
            <h2 className="label mb-6 text-brand">Ingredientele noastre</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {careers.criteria.map((c) => (
                <li key={c} className="card flex items-center gap-4 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Icon name="check" className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-[14.5px] font-medium">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card h-fit p-7 sm:p-9">
            <h2 className="text-[20px] font-bold uppercase tracking-wide2">{careers.formTitle}</h2>
            <p className="mb-7 mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
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
