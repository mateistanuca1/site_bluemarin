import { cx } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  lead?: string;
  as?: 'h1' | 'h2' | 'h3';
  align?: 'center' | 'left';
  className?: string;
};

/** Titlul de secțiune cu linia de dedesubt — semnatura vizuala a temei vechi. */
export default function SectionTitle({
  children,
  lead,
  as: Tag = 'h2',
  align = 'center',
  className,
}: Props) {
  return (
    <div className={cx(align === 'center' ? 'text-center' : 'text-left', className)}>
      <Tag
        className={cx(
          'text-[26px] font-semibold uppercase tracking-headline sm:text-[32px] lg:text-[36px]',
        )}
      >
        {children}
      </Tag>
      <span
        aria-hidden="true"
        className={cx(
          'mt-5 block h-[2px] w-14 bg-current opacity-50',
          align === 'center' && 'mx-auto',
        )}
      />
      {lead && (
        <p
          className={cx(
            'mt-7 text-[15px] font-light leading-relaxed opacity-90 sm:text-base',
            align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-3xl',
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
