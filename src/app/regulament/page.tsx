import type { Metadata } from 'next';
import Link from 'next/link';

import PageHero from '@/components/PageHero';
import Section from '@/components/Section';
import SocialCards from '@/components/SocialCards';
import { getContent } from '@/lib/content';
import { slugify } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Regulament intern',
  description:
    'Regulamentul cursurilor de înot Bluemarin: abonamente, programări și anulări, acces în bazin, echipament, conduită și condiții de înscriere.',
  alternates: { canonical: '/regulament' },
};

export default async function RulesPage() {
  const [site, rules] = await Promise.all([getContent('site'), getContent('rules')]);

  return (
    <>
      <PageHero title={rules.title} kicker={rules.subtitle} image={rules.hero} />

      <Section size="lg">
        <div className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          {/* Cuprins lipicios, ca sa nu te pierzi intr-un text lung. */}
          <nav className="lg:sticky lg:top-28 lg:self-start" aria-label="Cuprinsul regulamentului">
            <p className="label mb-4 text-ink-muted">Cuprins</p>
            <ol className="space-y-1.5 border-l border-line">
              {rules.sections.map((s, i) => (
                <li key={s.title}>
                  <a
                    href={`#${slugify(s.title)}`}
                    className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-[13px]
                               leading-snug text-ink-muted transition-colors
                               hover:border-brand hover:text-brand"
                  >
                    <span aria-hidden="true" className="mr-1.5 tabular-nums opacity-60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0">
            <p className="prose-ro border-l-2 border-brand pl-6 text-[16px] italic">{rules.lead}</p>

            <div className="mt-14 space-y-12">
              {rules.sections.map((s, i) => (
                <section key={s.title} id={slugify(s.title)} className="scroll-mt-28">
                  <h2 className="flex items-baseline gap-3.5 text-[17px] font-bold uppercase tracking-wide2 sm:text-[18px]">
                    <span aria-hidden="true" className="text-[14px] font-bold tabular-nums text-brand">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.title}
                  </h2>

                  <div className="prose-ro mt-4">
                    {s.intro && <p>{s.intro}</p>}

                    {s.items && (
                      <ul>
                        {s.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    )}

                    {s.groups?.map((g) => (
                      <div key={g.label}>
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

            <div className="mt-14 rounded-card border border-line bg-brand-50 p-7">
              <h2 className="text-[16px] font-bold uppercase tracking-wide2">
                Documentele conexe
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {site.footerLinks
                  .filter((l) => l.href !== '/regulament')
                  .map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-block rounded-full border border-line bg-white px-4 py-2
                                   text-[13px] font-medium transition-colors hover:border-brand hover:text-brand"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <SocialCards site={site} />
    </>
  );
}
