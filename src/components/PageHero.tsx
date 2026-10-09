import Image from 'next/image';
import Link from 'next/link';

import Icon from './Icon';
import { cx } from '@/lib/utils';
import type { Link as LinkType } from '@/lib/types';

type Props = {
  title: string;
  kicker?: string;
  quote?: string;
  image: string;
  /** Ex. "50% 32%" — ce parte din fotografie ramane vizibila. */
  imagePosition?: string;
  cta?: LinkType;
  secondaryCta?: LinkType;
  /** Scurte argumente afisate sub titlu, pe prima pagina. */
  highlights?: string[];
  /** Inaltime mai mare pentru prima pagina. */
  tall?: boolean;
  /** Ancora catre care duce sageata de jos (doar pe varianta inalta). */
  scrollTo?: string;
};

/**
 * Banner-ul de sus al fiecarei pagini.
 *
 * `data-page-hero` e steagul dupa care bara de navigatie stie ca poate fi
 * transparenta (vezi `.site-header` din globals.css). Orice pagina fara
 * acest banner primeste automat o bara alba.
 */
export default function PageHero({
  title,
  kicker,
  quote,
  image,
  imagePosition,
  cta,
  secondaryCta,
  highlights,
  tall = false,
  scrollTo,
}: Props) {
  return (
    <section
      data-page-hero
      className={cx(
        'on-dark relative isolate flex items-center justify-center overflow-hidden',
        tall
          // Textul sta sub centru, ca sa nu acopere subiectul din fotografie.
          ? 'min-h-[88svh] pb-24 pt-[26vh] lg:min-h-[92svh] lg:pt-[30vh]'
          : 'min-h-[42svh] pb-14 pt-[108px] lg:min-h-[48svh] lg:pt-[140px]',
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
        style={imagePosition ? { objectPosition: imagePosition } : undefined}
        className="absolute inset-0 -z-20 object-cover"
      />
      {/* Degradeul lasa fotografia sa se vada sus si intuneca spre text. */}
      <div aria-hidden="true" className="scrim absolute inset-0 -z-10" />

      <div className="shell relative text-center text-white">
        {kicker && (
          <p className="label mb-5 text-brand-light">{kicker}</p>
        )}

        <h1
          className={cx(
            'mx-auto max-w-4xl font-bold uppercase tracking-headline',
            tall
              ? 'text-[clamp(2rem,7vw,4rem)] leading-[1.05]'
              : 'text-[clamp(1.6rem,5vw,3rem)] leading-[1.1]',
          )}
        >
          {title}
        </h1>

        {quote && (
          <p className="mx-auto mt-6 max-w-2xl font-quote text-[18px] italic leading-snug text-white/90 sm:text-[22px]">
            “{quote}”
          </p>
        )}

        {highlights && highlights.length > 0 && (
          <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-2.5">
            {highlights.map((h) => (
              <li
                key={h}
                className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10
                           px-4 py-1.5 text-[12px] font-medium backdrop-blur-sm sm:text-[13px]"
              >
                <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-brand-light" />
                {h}
              </li>
            ))}
          </ul>
        )}

        {(cta || secondaryCta) && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {cta && (
              <Link href={cta.href} className="btn btn-solid-light">
                {cta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link href={secondaryCta.href} className="btn btn-light">
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>

      {tall && scrollTo && (
        <a
          href={scrollTo}
          aria-label="Mergi la conținut"
          className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/30
                     p-2.5 text-white/70 transition-colors hover:border-white hover:text-white sm:block"
        >
          <Icon name="arrow-down" className="h-5 w-5 animate-bob" />
        </a>
      )}
    </section>
  );
}
