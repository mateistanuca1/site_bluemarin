import type { Metadata } from 'next';
import Link from 'next/link';

import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import PricingTable from '@/components/PricingTable';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Tarife',
  description:
    'Tarifele cursurilor de inot Bluemarin la Bazinul CS Rapid si Militari Wellness: abonamente de grup, mini-grup si antrenor personal, de la 80 lei sedinta.',
  alternates: { canonical: '/tarife' },
};

export default async function PricingPage() {
  const [site, pricing] = await Promise.all([getContent('site'), getContent('pricing')]);

  return (
    <>
      <PageHero title={pricing.title} kicker="Abonamente" image="/images/tarife-hero.webp" />

      <Section size="lg">
        <SectionTitle lead={pricing.lead}>Alege abonamentul potrivit</SectionTitle>
        <div className="mt-14">
          <PricingTable
            locations={pricing.locations}
            currency={pricing.currency}
            commonConditions={pricing.commonConditions}
          />
        </div>
      </Section>

      <Section tone="soft">
        <SectionTitle>Bun de stiut</SectionTitle>
        <div className="mx-auto mt-12 grid max-w-4xl gap-7 sm:grid-cols-2">
          {[
            {
              title: 'Programarea e obligatorie',
              text: 'Avand un numar limitat de cursanti pe ora, stabilim de comun acord zilele si orele. Programarile se fac la receptie, telefonic sau online.',
            },
            {
              title: 'Anulare cu 24 de ore inainte',
              text: 'Poti anula o sedinta cu cel putin 24 de ore in avans ca sa fie reprogramata. In caz contrar, sedinta se considera efectuata.',
            },
            {
              title: 'Aviz medical',
              text: 'Este necesara o adeverinta de la medicul de familie care atesta ca cursantul este apt din punct de vedere fizic si epidemiologic.',
            },
            {
              title: 'Echipament',
              text: 'Casca de inot, ochelari, costum de baie, prosop si papuci de baie.',
            },
          ].map((c) => (
            <div key={c.title} className="flex gap-4">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-brand text-white">
                <Icon name="check" className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold uppercase tracking-wide2">{c.title}</h3>
                <p className="mt-1.5 text-[14px] font-light leading-relaxed text-ink/75">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/regulament" className="btn btn-outline">
            Regulamentul complet
          </Link>
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
