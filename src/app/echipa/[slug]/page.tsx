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

/** Pagina unui antrenor. Nu are banner foto, deci bara de sus ramane alba. */
export default async function MemberPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [site, team] = await Promise.all([getContent('site'), getContent('team')]);

  const member = team.members.find((m) => m.slug === slug);
  if (!member) notFound();

  const others = team.members.filter((m) => m.slug !== slug).slice(0, 3);

  return (
    <>
      <Section tone="soft" size="lg" className="page-offset">
        <Link
          href="/echipa"
          className="mb-9 inline-flex items-center gap-2 text-[11.5px] font-bold uppercase
                     tracking-wide2 text-brand hover:underline"
        >
          <Icon name="chevron-left" className="h-4 w-4" />
          Toată echipa
        </Link>

        <div className="grid gap-9 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-14">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-brand-100 shadow-card">
            <Image
              src={member.photo}
              alt={member.name}
              fill
              priority
              sizes="(min-width: 1024px) 380px, 92vw"
              className="object-cover"
            />
          </div>

          <div className="lg:pt-2">
            <p className="label text-brand">{member.shortRole}</p>

            <h1 className="mt-3 text-[clamp(1.7rem,4.5vw,2.5rem)] font-bold uppercase leading-tight tracking-headline">
              {member.name}
            </h1>

            {/* Rolul complet doar cand spune ceva in plus fata de eticheta de sus. */}
            {member.role !== member.shortRole && (
              <p className="mt-2.5 text-[14px] text-ink-muted">{member.role}</p>
            )}

            <blockquote className="mt-8 border-l-[3px] border-brand pl-6 font-quote text-[19px] italic leading-relaxed text-ink-soft sm:text-[22px]">
              “{member.quote}”
            </blockquote>

            <div className="prose-ro mt-8">
              {member.bio.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/inscriere/bazin-cs-rapid" className="btn btn-primary">
                Înscrie-te
              </Link>
              <Link href="/tarife" className="btn btn-outline">
                Vezi tarifele
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {others.length > 0 && (
        <Section size="lg">
          <h2 className="mb-12 text-center text-[clamp(1.1rem,2.4vw,1.5rem)] font-bold uppercase tracking-headline">
            Restul echipei
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((m) => (
              <TeamCard key={m.slug} member={m} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/echipa" className="btn btn-outline">
              Echipa completă
            </Link>
          </div>
        </Section>
      )}

      <SocialCards site={site} />
    </>
  );
}
