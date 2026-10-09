import type { Metadata } from 'next';
import Link from 'next/link';

import Icon, { type IconName } from '@/components/Icon';
import PageHero from '@/components/PageHero';
import PricingTable from '@/components/PricingTable';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Tarife',
  description:
    'Tarifele cursurilor de înot Bluemarin la Bazinul CS Rapid și Militari Wellness: abonamente de grup, mini-grup și antrenor personal, de la 80 lei ședința.',
  alternates: { canonical: '/tarife' },
};

const GOOD_TO_KNOW: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'calendar',
    title: 'Programarea e obligatorie',
    text: 'Având un număr limitat de cursanți pe oră, stabilim de comun acord zilele și orele. Programările se fac la recepție, telefonic sau online.',
  },
  {
    icon: 'clock',
    title: 'Anulare cu 24 de ore înainte',
    text: 'Poți anula o ședință cu cel puțin 24 de ore în avans, ca să fie reprogramată. În caz contrar, ședința se consideră efectuată.',
  },
  {
    icon: 'file-text',
    title: 'Aviz medical',
    text: 'Este necesară o adeverință de la medicul de familie care atestă că ești apt din punct de vedere fizic și epidemiologic.',
  },
  {
    icon: 'swimmer',
    title: 'Echipament',
    text: 'Cască de înot, ochelari, costum de baie, prosop și papuci de baie.',
  },
];

export default async function PricingPage() {
  const [site, pricing] = await Promise.all([getContent('site'), getContent('pricing')]);

  return (
    <>
      <PageHero title={pricing.title} kicker="Abonamente" image="/images/tarife-hero.webp" />

      <Section size="lg">
        <SectionTitle lead={pricing.lead}>Alege abonamentul potrivit</SectionTitle>
        <div className="mt-12">
          <PricingTable
            locations={pricing.locations}
            currency={pricing.currency}
            commonConditions={pricing.commonConditions}
          />
        </div>
      </Section>

      <Section tone="soft">
        <SectionTitle kicker="Înainte de prima ședință">Bun de știut</SectionTitle>
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
          {GOOD_TO_KNOW.map((c) => (
            <div key={c.title} className="card flex gap-4 p-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[14.5px] font-bold uppercase tracking-wide2">{c.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/inscriere/bazin-cs-rapid" className="btn btn-primary">
            Înscrie-te
          </Link>
          <Link href="/regulament" className="btn btn-outline">
            Regulamentul complet
          </Link>
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
