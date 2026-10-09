'use client';

import Link from 'next/link';
import { useState } from 'react';

import Icon from './Icon';
import PackageDialog from './forms/PackageDialog';
import { cx, formatPrice } from '@/lib/utils';
import type { PricingLocation } from '@/lib/types';

type Props = {
  locations: PricingLocation[];
  currency: string;
  commonConditions: string[];
  /** Arata doar o locatie (pe paginile de locatie). */
  onlySlug?: string;
};

export default function PricingTable({ locations, currency, commonConditions, onlySlug }: Props) {
  const shown = onlySlug ? locations.filter((l) => l.slug === onlySlug) : locations;
  const [active, setActive] = useState(shown[0]?.slug ?? '');
  const [selected, setSelected] = useState<{ pkg: string; location: string } | null>(null);

  const current = shown.find((l) => l.slug === active) ?? shown[0];
  if (!current) return null;

  return (
    <div>
      {/* Taburi de locatie, doar cand afisam mai multe */}
      {shown.length > 1 && (
        <div
          className="mb-10 flex flex-wrap justify-center gap-2 rounded-full border border-line bg-white p-1.5
                     shadow-card mx-auto w-fit"
          role="tablist"
          aria-label="Alege locația"
        >
          {shown.map((l) => (
            <button
              key={l.slug}
              type="button"
              role="tab"
              aria-selected={l.slug === active}
              onClick={() => setActive(l.slug)}
              className={cx(
                'rounded-full px-6 py-2.5 text-[12px] font-bold uppercase tracking-wide2 transition-colors',
                l.slug === active
                  ? 'bg-brand text-white'
                  : 'text-ink-soft hover:bg-brand-50 hover:text-brand',
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      <p className="mb-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-[13.5px] text-ink-muted">
        <span className="flex items-center gap-2">
          <Icon name="pin" className="h-4 w-4 text-brand" />
          {current.address}
        </span>
        {current.schedule.map((s) => (
          <span key={s} className="flex items-center gap-2">
            <Icon name="clock" className="h-4 w-4 text-brand" />
            {s}
          </span>
        ))}
      </p>

      <div className="space-y-14">
        {current.categories.map((cat) => (
          <div key={cat.id}>
            <div className="mb-7 text-center">
              <h3 className="text-[18px] font-bold uppercase tracking-headline sm:text-[21px]">
                {cat.name}
              </h3>
              {cat.note && <p className="mt-2 text-[13.5px] text-ink-muted">{cat.note}</p>}
            </div>

            <div
              className={cx(
                'grid gap-5',
                cat.packages.length >= 4
                  ? 'sm:grid-cols-2 lg:grid-cols-4'
                  : cat.packages.length === 3
                    ? 'sm:grid-cols-3'
                    : 'sm:grid-cols-2',
              )}
            >
              {cat.packages.map((p) => {
                const perSession = Math.round(p.price / p.sessions);
                const label = `${cat.name} — ${p.label} (${formatPrice(p.price)} ${currency})`;

                return (
                  <div
                    key={p.sessions}
                    className={cx(
                      'card card-hover relative flex flex-col p-7 text-center',
                      p.featured && 'border-brand ring-1 ring-brand',
                    )}
                  >
                    {p.featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wide2 text-white">
                        Cel mai ales
                      </span>
                    )}

                    <p className="label text-ink-muted">{p.label}</p>

                    <p className="mt-4 text-[34px] font-bold leading-none text-brand">
                      {formatPrice(p.price)}
                      <span className="ml-1.5 text-[15px] font-normal text-ink-muted">
                        {currency}
                      </span>
                    </p>

                    {/* Inaltime rezervata si cand pachetul are o singura sedinta,
                        ca butoanele din acelasi rand sa ramana aliniate. */}
                    <p className="mt-2 min-h-[1.25rem] text-[12.5px] text-ink-muted">
                      {p.sessions > 1 && `≈ ${formatPrice(perSession)} ${currency} / ședință`}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelected({ pkg: label, location: current.name })}
                      className={cx(
                        'btn mt-auto w-full',
                        p.featured ? 'btn-primary' : 'btn-outline',
                      )}
                    >
                      Alege
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-card border border-line bg-brand-50 px-6 py-7 text-center">
        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-[13.5px] text-ink-soft">
          {commonConditions.map((c) => (
            <li key={c} className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 shrink-0 text-brand" />
              {c}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[14px] text-ink-soft">
          Vrei să te înscrii direct?{' '}
          <Link
            href={`/inscriere/${current.slug}`}
            className="font-semibold text-brand underline underline-offset-2 hover:no-underline"
          >
            Completează formularul de înscriere
          </Link>
        </p>
      </div>

      <PackageDialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        packageLabel={selected?.pkg ?? ''}
        locationName={selected?.location ?? ''}
      />
    </div>
  );
}
