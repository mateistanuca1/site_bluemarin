import Link from 'next/link';

import Counter from '@/components/Counter';
import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import ParallaxQuote from '@/components/ParallaxQuote';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import TeamCard from '@/components/TeamCard';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/forms/ContactForm';
import { getContent } from '@/lib/content';

export default async function HomePage() {
  const [site, home, team, contact] = await Promise.all([
    getContent('site'),
    getContent('home'),
    getContent('team'),
    getContent('contact'),
  ]);

  const featured = home.team.featured
    .map((slug) => team.members.find((m) => m.slug === slug))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <>
      <PageHero
        tall
        kicker={home.hero.kicker}
        title={home.hero.title}
        quote={site.tagline}
        image={home.hero.image}
        cta={home.hero.primaryCta}
      />

      {/* 1. Intro */}
      <Section size="lg">
        <SectionTitle>{home.intro.title}</SectionTitle>
        <div className="mx-auto mt-10 max-w-3xl prose-ro text-center">
          {home.intro.paragraphs.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href={home.hero.primaryCta.href} className="btn btn-primary">
            {home.hero.primaryCta.label}
          </Link>
          <Link href={home.hero.secondaryCta.href} className="btn btn-outline">
            {home.hero.secondaryCta.label}
          </Link>
        </div>
      </Section>

      {/* 2. Valori */}
      <Section tone="deep" pattern className="bg-deep">
        <SectionTitle>{home.values.title}</SectionTitle>
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {home.values.items.map((v) => (
            <div key={v.title} className="flex gap-5">
              <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center border-2 border-white/40">
                <Icon name="check" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[17px] font-semibold uppercase tracking-headline">{v.title}</h3>
                <p className="mt-2 text-[14px] font-light leading-relaxed text-white/80">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Filozofia noastra */}
      <Section image={home.philosophy.image} overlay="#4048c9" overlayOpacity={0.88} pattern size="lg">
        <SectionTitle lead={home.philosophy.text}>{home.philosophy.title}</SectionTitle>
        <ParallaxQuote
          quote={home.philosophy.quote}
          cite={home.philosophy.cite}
          className="mt-16"
        />
      </Section>

      {/* 4. Academia de inot */}
      <Section image={home.academy.image} overlay="rgba(16, 12, 109, 0.84)" size="lg">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[24px] font-semibold uppercase tracking-headline sm:text-[32px]">
            {home.academy.title}
          </h2>
          <p className="mt-5 text-[15px] font-light leading-relaxed text-white/85 sm:text-base">
            {home.academy.text}
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {home.academy.cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group border border-white/25 px-8 py-10 text-center transition-colors hover:border-white hover:bg-white/10"
            >
              <h3 className="text-[17px] font-semibold uppercase tracking-headline">{c.title}</h3>
              <p className="mt-3 text-[14px] font-light leading-relaxed text-white/80">{c.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide2">
                Afla mai mult
                <Icon
                  name="arrow-right"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* 5. Echipa */}
      <Section size="lg">
        <SectionTitle lead={home.team.lead}>{home.team.title}</SectionTitle>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((m) => (
            <TeamCard key={m.slug} member={m} />
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link href={home.team.cta.href} className="btn btn-outline">
            {home.team.cta.label}
          </Link>
        </div>
      </Section>

      {/* 6. Experienta — countere */}
      <Section tone="deep" pattern className="bg-deep">
        <SectionTitle lead={home.experience.lead}>{home.experience.title}</SectionTitle>
        <div className="mt-16 grid grid-cols-2 gap-y-14 lg:grid-cols-4">
          {home.experience.counters.map((c) => (
            <Counter key={c.label} {...c} />
          ))}
        </div>
      </Section>

      {/* 7. Testimoniale */}
      <Section tone="soft" size="lg">
        <SectionTitle lead={home.testimonials.lead}>{home.testimonials.title}</SectionTitle>
        <div className="mt-14">
          <Testimonials items={home.testimonials.items} />
        </div>
      </Section>

      {/* 8. Social media */}
      <SocialCards site={site} />

      {/* 9. Contact */}
      <Section
        id="contact"
        image={home.contactSection.image}
        overlay="rgba(6, 21, 106, 0.88)"
        size="lg"
      >
        <SectionTitle>{home.contactSection.title}</SectionTitle>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <div>
            <div className="grid gap-6 sm:grid-cols-3">
              {contact.cards.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group text-center transition-colors hover:text-brand-light"
                >
                  <Icon name={c.icon as 'phone'} className="mx-auto mb-3 h-7 w-7 text-brand-light" />
                  <span className="block text-[12px] font-semibold uppercase tracking-headline">
                    {c.label}
                  </span>
                  <span className="mt-1.5 block text-[13px] font-light text-white/80">
                    {c.value}
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-10 aspect-[4/3] w-full border border-white/20">
              <iframe
                src={site.contact.mapEmbed}
                title="Harta — Bluemarin Sport Club, Calea Giulesti 18"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="bg-white p-7 text-ink shadow-xl sm:p-9">
            <h3 className="text-[20px] font-semibold uppercase tracking-wide2">
              {home.contactSection.formTitle}
            </h3>
            <p className="mb-7 mt-3 text-[14px] font-light leading-relaxed text-ink/75">
              {home.contactSection.formLead}
            </p>
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
