import Image from 'next/image';
import Link from 'next/link';

import type { TeamMember } from '@/lib/types';

/** Cardul unui antrenor, folosit pe prima pagina si pe pagina Echipa. */
export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <Link
      href={`/echipa/${member.slug}`}
      className="group flex flex-col text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-deep/0 transition-colors duration-300 group-hover:bg-deep/25"
        />
      </div>

      <h3 className="mt-5 text-[17px] font-semibold uppercase tracking-wide2 transition-colors group-hover:text-brand">
        {member.name}
      </h3>
      <p className="mt-1 text-[12px] font-light uppercase tracking-wide2 text-muted">
        {member.shortRole}
      </p>
      <p className="mt-4 font-quote text-[15px] italic leading-relaxed text-ink/70">
        “{member.quote}”
      </p>
    </Link>
  );
}
