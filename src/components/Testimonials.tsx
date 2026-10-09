'use client';

import { useState } from 'react';

import Icon from './Icon';
import { cx } from '@/lib/utils';

type Item = { author: string; text: string };

const PER_PAGE = 3;

/** Testimonialele, paginate ca sa nu umple pagina cu 11 citate deodata. */
export default function Testimonials({ items }: { items: Item[] }) {
  const pages = Math.ceil(items.length / PER_PAGE);
  const [page, setPage] = useState(0);

  const shown = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const go = (next: number) => setPage(((next % pages) + pages) % pages);

  return (
    <div>
      <div className="grid items-start gap-6 md:grid-cols-3">
        {shown.map((t) => (
          <figure
            key={t.author}
            className="flex h-full flex-col border border-black/10 bg-white p-7 shadow-sm"
          >
            <span
              aria-hidden="true"
              className="mb-1 block font-quote text-[52px] leading-[0.4] text-brand/35"
            >
              &ldquo;
            </span>
            <blockquote className="flex-1 text-[14px] font-light leading-relaxed text-ink/80">
              {t.text}
            </blockquote>
            <figcaption className="mt-6 text-[12px] font-semibold uppercase tracking-wide2 text-brand">
              {t.author}
            </figcaption>
          </figure>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(page - 1)}
            aria-label="Testimonialele anterioare"
            className="flex h-10 w-10 items-center justify-center border border-black/15 text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
          >
            <Icon name="chevron-left" className="h-4 w-4" />
          </button>

          <div className="flex gap-2" role="tablist" aria-label="Pagini de testimoniale">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === page}
                aria-label={`Pagina ${i + 1}`}
                onClick={() => setPage(i)}
                className={cx(
                  'h-2 w-2 rounded-full transition-all',
                  i === page ? 'w-6 bg-brand' : 'bg-black/20 hover:bg-black/40',
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(page + 1)}
            aria-label="Testimonialele urmatoare"
            className="flex h-10 w-10 items-center justify-center border border-black/15 text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
          >
            <Icon name="chevron-right" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
