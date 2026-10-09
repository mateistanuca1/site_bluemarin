import Image from 'next/image';

import { cx } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  id?: string;
  /** Imagine de fundal full-width. */
  image?: string;
  /** Cat de tare intuneca degradeul imaginea: 'soft' lasa poza sa se vada. */
  scrim?: 'soft' | 'strong';
  /** Fundal plat, fara imagine. */
  tone?: 'white' | 'soft' | 'deep' | 'night';
  className?: string;
  /** Spatiere verticala. */
  size?: 'sm' | 'md' | 'lg';
  /** Scoate containerul interior (pentru sectiuni full-bleed). */
  bleed?: boolean;
};

const TONES: Record<NonNullable<Props['tone']>, string> = {
  white: 'bg-white text-ink',
  soft: 'bg-brand-50 text-ink',
  deep: 'on-dark bg-deep text-white',
  night: 'on-dark bg-deep-900 text-white',
};

const SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'py-12 lg:py-16',
  md: 'py-16 lg:py-20',
  lg: 'py-20 lg:py-28',
};

export default function Section({
  children,
  id,
  image,
  scrim = 'strong',
  tone = 'white',
  className,
  size = 'md',
  bleed = false,
}: Props) {
  const hasImage = Boolean(image);

  return (
    <section
      id={id}
      className={cx(
        'relative isolate overflow-hidden',
        SIZES[size],
        hasImage ? 'on-dark text-white' : TONES[tone],
        className,
      )}
    >
      {hasImage && (
        <>
          <Image
            src={image!}
            alt=""
            fill
            sizes="100vw"
            aria-hidden="true"
            className="absolute inset-0 -z-20 object-cover"
          />
          <div
            aria-hidden="true"
            className={cx('absolute inset-0 -z-10', scrim === 'soft' ? 'scrim-soft' : 'scrim')}
          />
        </>
      )}

      {bleed ? children : <div className="shell relative">{children}</div>}
    </section>
  );
}
