import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Section from '@/components/Section';
import { getContent, getContentSync } from '@/lib/content';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getContentSync('legal').pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = (await getContent('legal')).pages.find((p) => p.slug === slug);
  if (!page) return { title: 'Informații legale' };

  return {
    title: page.title,
    description: `${page.title} — Asociația Clubul Sportiv Bluemarin.`,
    alternates: { canonical: `/${page.slug}` },
  };
}

/** Paginile legale nu au banner, deci bara de sus ramane alba (`page-offset`). */
export default async function LegalPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const legal = await getContent('legal');

  const page = legal.pages.find((p) => p.slug === slug);
  if (!page) notFound();

  const others = legal.pages.filter((p) => p.slug !== slug);

  return (
    <Section size="lg" className="page-offset">
      <div className="mx-auto max-w-3xl">
        <p className="label mb-4 text-brand">Informații legale</p>
        <h1 className="text-[clamp(1.5rem,4vw,2.2rem)] font-bold uppercase leading-tight tracking-headline">
          {page.title}
        </h1>
        <span aria-hidden="true" className="mt-5 block h-[3px] w-12 rounded-full bg-brand" />

        <div
          className="prose-ro mt-10"
          // Textul vine din content/legal.json, administrat de noi — nu din input de utilizator.
          dangerouslySetInnerHTML={{ __html: page.html }}
        />

        {others.length > 0 && (
          <nav className="mt-16 border-t border-line pt-8" aria-label="Alte pagini legale">
            <p className="label mb-4 text-ink-muted">Vezi și</p>
            <ul className="flex flex-wrap gap-2.5">
              {[...others, { slug: 'regulament', title: 'Regulament intern' }].map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className="inline-block rounded-full border border-line px-4 py-2 text-[13px]
                               font-medium transition-colors hover:border-brand hover:text-brand"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </Section>
  );
}
