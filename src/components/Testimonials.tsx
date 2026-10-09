'use client';

import { useState } from 'react';

import Icon from './Icon';
import { cx } from '@/lib/utils';

type Item = { author: string; text: string };

const PER_PAGE = 3;

/** Initialele autorului, pentru avatarul colorat. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Testimonialele, paginate ca sa nu umple pagina cu toate citatele deodata. */
export default function Testimonials({ items }: { items: Item[] }) {
  const pages = Math.ceil(items.length / PER_PAGE);
  const [page, setPage] = useState(0);

  const shown = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const go = (next: number) => setPage(((next % pages) + pages) % pages);

  return (
    <div>
      <div className="grid items-stretch gap-6 md:grid-cols-3">
        {shown.map((t) => (
          <figure key={t.author} className="card flex h-full flex-col p-7">
            <Icon name="quote" className="mb-4 h-7 w-7 shrink-0 text-brand-200" />

            <blockquote className="flex-1 text-[14.5px] leading-[1.75] text-ink-soft">
              {t.text}
            </blockquote>

            <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                           bg-brand-100 text-[13px] font-bold text-brand-700"
              >
                {initials(t.author)}
              </span>
              <span className="text-[13px] font-bold uppercase tracking-wide2 text-ink">
                {t.author}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(page - 1)}
            aria-label="Testimonialele anterioare"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line
                       text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
          >
            <Icon name="chevron-left" className="h-4 w-4" />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Pagina ${i + 1} din ${pages}`}
                aria-current={i === page ? 'true' : undefined}
                onClick={() => setPage(i)}
                className={cx(
                  'h-2 rounded-full transition-all duration-200',
                  i === page ? 'w-7 bg-brand' : 'w-2 bg-ink/20 hover:bg-ink/40',
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(page + 1)}
            aria-label="Testimonialele următoare"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line
                       text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
          >
            <Icon name="chevron-right" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
