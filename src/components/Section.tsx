import Image from 'next/image';

import { cx } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  id?: string;
  /** Imagine de fundal full-width. */
  image?: string;
  /** Culoarea overlay-ului peste imagine (ex. "#4048c9" sau rgba). */
  overlay?: string;
  /** Opacitatea overlay-ului cand e dat ca hex. */
  overlayOpacity?: number;
  /** Adauga textura de puncte peste overlay, ca pe site-ul vechi. */
  pattern?: boolean;
  /** Fundal plat, fara imagine. */
  tone?: 'white' | 'soft' | 'deep' | 'ink';
  className?: string;
  /** Spatiere verticala. */
  size?: 'sm' | 'md' | 'lg';
};

const TONES: Record<NonNullable<Props['tone']>, string> = {
  white: 'bg-white text-ink',
  soft: 'bg-brand-soft text-ink',
  deep: 'bg-deep text-white',
  ink: 'bg-ink text-white',
};

const SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'py-12 lg:py-16',
  md: 'py-16 lg:py-24',
  lg: 'py-20 lg:py-32',
};

export default function Section({
  children,
  id,
  image,
  overlay,
  overlayOpacity = 0.86,
  pattern = false,
  tone = 'white',
  className,
  size = 'md',
}: Props) {
  const hasImage = Boolean(image);

  return (
    <section
      id={id}
      className={cx(
        'relative overflow-hidden',
        SIZES[size],
        hasImage ? 'text-white' : TONES[tone],
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
            className="absolute inset-0 -z-10"
            style={{
              backgroundColor: overlay ?? '#061982',
              opacity: overlay?.startsWith('rgba') ? 1 : overlayOpacity,
            }}
          />
        </>
      )}

      {pattern && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '4px 4px',
          }}
        />
      )}

      <div className="shell relative">{children}</div>
    </section>
  );
}
