import { cx } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  /** Eticheta mica de deasupra titlului. */
  kicker?: string;
  /** Paragraful introductiv de sub titlu. */
  lead?: string;
  as?: 'h1' | 'h2' | 'h3';
  align?: 'center' | 'left';
  className?: string;
};

/** Titlul de sectiune cu linia de dedesubt — semnatura vizuala a site-ului. */
export default function SectionTitle({
  children,
  kicker,
  lead,
  as: Tag = 'h2',
  align = 'center',
  className,
}: Props) {
  const centered = align === 'center';

  return (
    <div className={cx(centered ? 'text-center' : 'text-left', className)}>
      {kicker && <p className="label mb-4 text-brand">{kicker}</p>}

      <Tag className="text-[clamp(1.4rem,3.4vw,2.2rem)] font-bold uppercase leading-[1.15] tracking-headline">
        {children}
      </Tag>

      <span
        aria-hidden="true"
        className={cx(
          'mt-5 block h-[3px] w-12 rounded-full bg-current opacity-40',
          centered && 'mx-auto',
        )}
      />

      {lead && (
        <p
          className={cx(
            'mt-6 text-[15.5px] leading-relaxed opacity-80 sm:text-base',
            centered ? 'mx-auto max-w-3xl' : 'max-w-3xl',
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
