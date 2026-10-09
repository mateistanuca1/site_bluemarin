import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
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
  if (!page) return { title: 'Informatii legale' };

  return {
    title: page.title,
    description: `${page.title} — Asociatia Clubul Sportiv Bluemarin.`,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function LegalPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = (await getContent('legal')).pages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <Section className="pt-32 lg:pt-40" size="lg">
      <div className="mx-auto max-w-3xl">
        <SectionTitle align="left" as="h1">
          {page.title}
        </SectionTitle>
        <div
          className="mt-12 prose-ro [&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:text-[17px] [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-wide2"
          // Textul vine din content/legal.json, administrat de noi — nu din input de utilizator.
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </div>
    </Section>
  );
}
