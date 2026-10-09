import Icon from './Icon';
import { cx } from '@/lib/utils';

type Props = { quote: string; cite?: string; className?: string };

/** Citatul mare, cu ghilimele decorative. */
export default function ParallaxQuote({ quote, cite, className }: Props) {
  return (
    <figure className={cx('relative text-center', className)}>
      <Icon
        name="quote"
        className="mx-auto mb-7 h-9 w-9 text-white/25 sm:h-11 sm:w-11"
      />

      <blockquote className="mx-auto max-w-3xl font-quote text-[clamp(1.25rem,3.2vw,2.1rem)] italic leading-[1.35]">
        {quote}
      </blockquote>

      {cite && (
        <figcaption className="mt-7 flex items-center justify-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-white/30" />
          <span className="label text-white/75">{cite}</span>
          <span aria-hidden="true" className="h-px w-8 bg-white/30" />
        </figcaption>
      )}
    </figure>
  );
}
