import type { Metadata } from 'next';

import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import ContactForm from '@/components/forms/ContactForm';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contacteaza Bluemarin Sport Club: telefon 0744 258 258, contact@bluemarin.ro, Calea Giulesti 18, sector 6, Bucuresti.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const [site, contact, locations] = await Promise.all([
    getContent('site'),
    getContent('contact'),
    getContent('locations'),
  ]);

  return (
    <>
      <PageHero title={contact.title} kicker="Hai sa vorbim" image={contact.hero} />

      <Section size="lg">
        <SectionTitle>Date de contact</SectionTitle>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {contact.cards.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group border border-black/10 px-6 py-9 text-center transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg"
            >
              <Icon name={c.icon as 'phone'} className="mx-auto mb-4 h-7 w-7 text-brand" />
              <span className="block text-[12px] font-semibold uppercase tracking-headline text-muted">
                {c.label}
              </span>
              <span className="mt-2 block text-[15px] font-medium group-hover:text-brand">
                {c.value}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="mb-7 text-[17px] font-semibold uppercase tracking-headline">
              Unde ne gasesti
            </h2>
            <div className="space-y-8">
              {locations.items.map((l) => (
                <div key={l.slug}>
                  <h3 className="text-[15px] font-semibold uppercase tracking-wide2 text-brand">
                    {l.name}
                  </h3>
                  <p className="mt-1.5 text-[14px] text-ink/75">{l.address}</p>
                  {l.schedule.map((s) => (
                    <p key={s} className="mt-1 text-[13px] text-muted">
                      {s}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-10 aspect-[4/3] w-full border border-black/10">
              <iframe
                src={site.contact.mapEmbed}
                title="Harta — Bluemarin Sport Club"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="border border-black/10 p-7 shadow-sm sm:p-9">
            <h2 className="text-[20px] font-semibold uppercase tracking-wide2">
              {contact.formTitle}
            </h2>
            <p className="mb-7 mt-3 text-[14px] font-light leading-relaxed text-ink/75">
              {contact.formLead}
            </p>
            <ContactForm />
          </div>
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
