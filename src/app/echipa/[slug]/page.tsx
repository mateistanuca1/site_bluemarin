import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Icon from '@/components/Icon';
import Section from '@/components/Section';
import SocialCards from '@/components/SocialCards';
import TeamCard from '@/components/TeamCard';
import { getContent, getContentSync } from '@/lib/content';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getContentSync('team').members.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = (await getContent('team')).members.find((m) => m.slug === slug);
  if (!member) return { title: 'Antrenor' };

  return {
    title: member.name,
    description: `${member.name} — ${member.role} la Bluemarin Sport Club.`,
    alternates: { canonical: `/echipa/${member.slug}` },
    openGraph: { images: [member.photo] },
  };
}

export default async function MemberPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [site, team] = await Promise.all([getContent('site'), getContent('team')]);

  const member = team.members.find((m) => m.slug === slug);
  if (!member) notFound();

  const others = team.members.filter((m) => m.slug !== slug).slice(0, 3);

  return (
    <>
      <Section tone="soft" className="pt-28 lg:pt-36">
        <Link
          href="/echipa"
          className="mb-10 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide2 text-brand hover:underline"
        >
          <Icon name="chevron-left" className="h-4 w-4" />
          Toata echipa
        </Link>

        <div className="grid gap-10 lg:grid-cols-[400px_1fr] lg:gap-16">
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={member.photo}
              alt={member.name}
              fill
              priority
              sizes="(min-width: 1024px) 400px, 92vw"
              className="object-cover"
            />
          </div>

          <div>
            <h1 className="text-[28px] font-semibold uppercase tracking-headline sm:text-[36px]">
              {member.name}
            </h1>
            <p className="mt-3 text-[13px] font-light uppercase tracking-wide2 text-brand">
              {member.role}
            </p>

            <blockquote className="mt-8 border-l-2 border-brand pl-6 font-quote text-[19px] italic leading-relaxed text-ink/80 sm:text-[22px]">
              “{member.quote}”
            </blockquote>

            <div className="mt-8 prose-ro">
              {member.bio.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/tarife" className="btn btn-primary">
                Vezi tarifele
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Contacteaza-ne
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {others.length > 0 && (
        <Section size="lg">
          <h2 className="mb-14 text-center text-[20px] font-semibold uppercase tracking-headline">
            Restul echipei
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((m) => (
              <TeamCard key={m.slug} member={m} />
            ))}
          </div>
        </Section>
      )}

      <SocialCards site={site} />
    </>
  );
}
