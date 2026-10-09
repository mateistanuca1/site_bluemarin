import type { Metadata } from 'next';

import PageHero from '@/components/PageHero';
import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SocialCards from '@/components/SocialCards';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Regulament intern',
  description:
    'Regulamentul cursurilor de inot Bluemarin: abonamente, programari si anulari, acces in bazin, echipament, conduita si conditii de inscriere.',
  alternates: { canonical: '/regulament' },
};

export default async function RulesPage() {
  const [site, rules] = await Promise.all([getContent('site'), getContent('rules')]);

  return (
    <>
      <PageHero title={rules.title} kicker={rules.subtitle} image={rules.hero} />

      <Section size="lg">
        <div className="mx-auto max-w-3xl">
          <SectionTitle align="left" lead={rules.lead}>
            {rules.subtitle}
          </SectionTitle>

          <div className="mt-16 space-y-14">
            {rules.sections.map((s, i) => (
              <section key={s.title}>
                <h2 className="flex items-baseline gap-4 text-[17px] font-semibold uppercase tracking-wide2">
                  <span aria-hidden="true" className="text-[14px] font-light text-brand">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.title}
                </h2>

                <div className="mt-5 prose-ro">
                  {s.intro && <p>{s.intro}</p>}

                  {s.items && (
                    <ul>
                      {s.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  )}

                  {s.groups?.map((g) => (
                    <div key={g.label} className="mb-6">
                      <h3>{g.label}</h3>
                      <ul>
                        {g.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {s.closing &&
                    s.closing.split(/\n{2,}/).map((p) => <p key={p.slice(0, 32)}>{p}</p>)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
