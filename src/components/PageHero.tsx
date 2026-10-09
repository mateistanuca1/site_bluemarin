import Image from 'next/image';
import Link from 'next/link';

import type { Link as LinkType } from '@/lib/types';

type Props = {
  title: string;
  kicker?: string;
  quote?: string;
  image: string;
  cta?: LinkType;
  /** Inaltime mai mare pentru prima pagina. */
  tall?: boolean;
};

/** Banner-ul de sus al fiecarei pagini. */
export default function PageHero({ title, kicker, quote, image, cta, tall = false }: Props) {
  return (
    <section
      className={`relative flex items-center justify-center overflow-hidden ${
        tall ? 'min-h-[78vh] lg:min-h-[86vh]' : 'min-h-[46vh] lg:min-h-[56vh]'
      }`}
    >
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
        className="absolute inset-0 -z-20 object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-deep-darker/80 via-deep-night/70 to-deep-darker/85"
      />

      <div className="shell relative pt-24 pb-14 text-center text-white lg:pt-28">
        {kicker && (
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-headline text-brand-light sm:text-[12px]">
            {kicker}
          </p>
        )}
        <h1
          className={`font-semibold uppercase tracking-headline ${
            tall ? 'text-[30px] sm:text-[44px] lg:text-[58px]' : 'text-[26px] sm:text-[36px] lg:text-[46px]'
          }`}
        >
          {title}
        </h1>
        {quote && (
          <p className="mx-auto mt-6 max-w-2xl font-quote text-[17px] italic text-white/90 sm:text-[21px]">
            “{quote}”
          </p>
        )}
        {cta && (
          <Link href={cta.href} className="btn btn-light mt-9">
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}
