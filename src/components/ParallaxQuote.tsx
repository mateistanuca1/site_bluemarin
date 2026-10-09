import { cx } from '@/lib/utils';

type Props = { quote: string; cite?: string; className?: string };

/** Citatul mare cu ghilimele decorative, preluat din tema veche. */
export default function ParallaxQuote({ quote, cite, className }: Props) {
  return (
    <figure className={cx('relative text-center', className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none block select-none font-quote text-[80px] leading-[0.5] text-white/25 sm:text-[110px]"
      >
        &ldquo;
      </span>
      <blockquote className="mx-auto max-w-3xl font-quote text-[20px] italic leading-snug sm:text-[28px] lg:text-[34px]">
        {quote}
      </blockquote>
      {cite && (
        <figcaption className="mt-6 text-[13px] font-semibold uppercase tracking-headline opacity-80 sm:text-[15px]">
          {cite}
        </figcaption>
      )}
    </figure>
  );
}
