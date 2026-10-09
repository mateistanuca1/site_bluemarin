import Link from 'next/link';

import Counter from '@/components/Counter';
import Icon, { type IconName } from '@/components/Icon';
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
        imagePosition={home.hero.imagePosition}
        highlights={home.hero.highlights}
        cta={home.hero.primaryCta}
        secondaryCta={home.hero.secondaryCta}
        scrollTo="#despre"
      />

      {/* 1. Intro */}
      <Section id="despre" size="lg">
        <SectionTitle kicker="Despre noi">{home.intro.title}</SectionTitle>
        <div className="prose-ro mx-auto mt-10 max-w-prose text-center">
          {home.intro.paragraphs.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href={home.hero.primaryCta.href} className="btn btn-primary">
            {home.hero.primaryCta.label}
          </Link>
          <Link href={home.hero.secondaryCta.href} className="btn btn-outline">
            {home.hero.secondaryCta.label}
          </Link>
        </div>
      </Section>

      {/* 2. Valori */}
      <Section tone="deep">
        <SectionTitle lead={home.values.lead}>{home.values.title}</SectionTitle>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {home.values.items.map((v) => (
            <div key={v.title} className="card-dark p-7">
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10">
                <Icon name={(v.icon ?? 'check') as IconName} className="h-5 w-5 text-brand-light" />
              </span>
              <h3 className="text-[16px] font-bold uppercase tracking-wide2">{v.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-white/75">{v.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Filozofia noastra */}
      <Section image={home.philosophy.image} scrim="soft" size="lg">
        <SectionTitle lead={home.philosophy.text}>{home.philosophy.title}</SectionTitle>
        <ParallaxQuote
          quote={home.philosophy.quote}
          cite={home.philosophy.cite}
          className="mt-14"
        />
      </Section>

      {/* 4. Academia de inot */}
      <Section tone="soft" size="lg">
        <SectionTitle kicker="Academia" lead={home.academy.text}>
          {home.academy.title}
        </SectionTitle>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {home.academy.cards.map((c) => (
            <Link key={c.href} href={c.href} className="card card-hover group flex flex-col p-8">
              <h3 className="text-[18px] font-bold uppercase tracking-wide2 transition-colors group-hover:text-brand">
                {c.title}
              </h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-soft">{c.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide2 text-brand">
                Află mai mult
                <Icon
                  name="arrow-right"
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* 5. Echipa */}
      <Section size="lg">
        <SectionTitle kicker="Antrenorii" lead={home.team.lead}>
          {home.team.title}
        </SectionTitle>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((m) => (
            <TeamCard key={m.slug} member={m} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href={home.team.cta.href} className="btn btn-outline">
            {home.team.cta.label}
          </Link>
        </div>
      </Section>

      {/* 6. Experienta — countere */}
      <Section image={home.academy.image} size="lg">
        <SectionTitle lead={home.experience.lead}>{home.experience.title}</SectionTitle>
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {home.experience.counters.map((c) => (
            <Counter key={c.label} {...c} />
          ))}
        </div>
      </Section>

      {/* 7. Testimoniale */}
      <Section tone="soft" size="lg">
        <SectionTitle kicker="Ce spun părinții" lead={home.testimonials.lead}>
          {home.testimonials.title}
        </SectionTitle>
        <div className="mt-12">
          <Testimonials items={home.testimonials.items} />
        </div>
      </Section>

      {/* 8. Contact */}
      <Section id="contact" tone="night" size="lg">
        <SectionTitle kicker="Hai să vorbim">{home.contactSection.title}</SectionTitle>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {contact.cards.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="card-dark card-dark-hover flex items-start gap-3.5 p-5"
                >
                  <Icon
                    name={c.icon as IconName}
                    className="mt-0.5 h-5 w-5 shrink-0 text-brand-light"
                  />
                  <span>
                    <span className="label block text-white/55">{c.label}</span>
                    <span className="mt-1.5 block text-[14px] leading-snug">{c.value}</span>
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-5 aspect-[16/11] w-full overflow-hidden rounded-card border border-white/15">
              <iframe
                src={site.contact.mapEmbed}
                title={`Harta — ${site.name}, ${site.contact.address}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="rounded-card bg-white p-7 text-ink shadow-card-hover sm:p-9">
            <h3 className="text-[19px] font-bold uppercase tracking-wide2">
              {home.contactSection.formTitle}
            </h3>
            <p className="mb-7 mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
              {home.contactSection.formLead}
            </p>
            <ContactForm />
          </div>
        </div>
      </Section>

      {/* 9. Social media */}
      <SocialCards site={site} />
    </>
  );
}
