import Image from 'next/image';
import Link from 'next/link';

import Icon from './Icon';
import type { TeamMember } from '@/lib/types';

/** Cardul unui antrenor, folosit pe prima pagina si pe pagina Echipa. */
export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <Link
      href={`/echipa/${member.slug}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-50">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Degradeul de jos tine eticheta lizibila peste orice fotografie. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-deep-900/80 to-transparent"
        />
        <span className="absolute bottom-3 left-3 rounded bg-white/95 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide2 text-deep-700">
          {member.shortRole}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[17px] font-bold uppercase tracking-wide2 transition-colors group-hover:text-brand">
          {member.name}
        </h3>

        <p className="mt-4 flex-1 font-quote text-[15.5px] italic leading-relaxed text-ink-soft">
          “{member.quote}”
        </p>

        <span className="mt-6 inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide2 text-brand">
          Vezi profilul
          <Icon
            name="arrow-right"
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
