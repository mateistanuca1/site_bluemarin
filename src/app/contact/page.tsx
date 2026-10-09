import type { Metadata } from 'next';
import Link from 'next/link';

import Icon, { type IconName } from '@/components/Icon';
import PageHero from '@/components/PageHero';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import ContactForm from '@/components/forms/ContactForm';
import { getContent } from '@/lib/content';
import { cx } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactează Bluemarin Sport Club: telefon 0744 258 258, contact@bluemarin.ro, Calea Giulești 18, sector 6, București.',
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
      <PageHero title={contact.title} kicker="Hai să vorbim" image={contact.hero} />

      <Section size="lg">
        <SectionTitle kicker="Suntem aproape">Date de contact</SectionTitle>

        {/* Grila urmeaza numarul de carduri, ca sa nu ramana coloane goale. */}
        <div
          className={cx(
            'mt-12 grid gap-4',
            contact.cards.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3',
          )}
        >
          {contact.cards.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="card card-hover group px-6 py-8 text-center"
            >
              <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Icon name={c.icon as IconName} className="h-5 w-5" />
              </span>
              <span className="label block text-ink-muted">{c.label}</span>
              <span className="mt-2 block text-[14.5px] font-medium leading-snug transition-colors group-hover:text-brand">
                {c.value}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div>
            <h2 className="label mb-6 text-ink-muted">Unde ne găsești</h2>

            <div className="space-y-4">
              {locations.items.map((l) => (
                <Link
                  key={l.slug}
                  href={`/locatii/${l.slug}`}
                  className="card card-hover group block p-6"
                >
                  <h3 className="text-[15.5px] font-bold uppercase tracking-wide2 transition-colors group-hover:text-brand">
                    {l.name}
                  </h3>
                  <p className="mt-2 flex items-start gap-2 text-[14px] text-ink-soft">
                    <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {l.address}
                  </p>
                  {l.schedule.map((s) => (
                    <p key={s} className="mt-1.5 flex items-center gap-2 text-[13px] text-ink-muted">
                      <Icon name="clock" className="h-4 w-4 shrink-0 text-brand" />
                      {s}
                    </p>
                  ))}
                </Link>
              ))}
            </div>

            <div className="mt-6 aspect-[4/3] w-full overflow-hidden rounded-card border border-line">
              <iframe
                src={site.contact.mapEmbed}
                title={`Harta — ${site.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="card h-fit p-7 sm:p-9">
            <h2 className="text-[20px] font-bold uppercase tracking-wide2">{contact.formTitle}</h2>
            <p className="mb-7 mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
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
