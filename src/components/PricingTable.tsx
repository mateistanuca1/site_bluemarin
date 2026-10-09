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
          className="mb-10 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Alege locatia"
        >
          {shown.map((l) => (
            <button
              key={l.slug}
              type="button"
              role="tab"
              aria-selected={l.slug === active}
              onClick={() => setActive(l.slug)}
              className={cx(
                'border-2 px-6 py-3 text-[12px] font-semibold uppercase tracking-wide2 transition-colors',
                l.slug === active
                  ? 'border-brand bg-brand text-white'
                  : 'border-black/15 text-ink hover:border-brand hover:text-brand',
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      <p className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-[13px] text-muted">
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

      <div className="space-y-12">
        {current.categories.map((cat) => (
          <div key={cat.id}>
            <div className="mb-6 text-center">
              <h3 className="text-[18px] font-semibold uppercase tracking-headline sm:text-[21px]">
                {cat.name}
              </h3>
              {cat.note && <p className="mt-2 text-[13px] text-muted">{cat.note}</p>}
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
                    className="group flex flex-col border border-black/10 bg-white p-7 text-center
                               shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-lg"
                  >
                    <p className="text-[12px] font-semibold uppercase tracking-headline text-muted">
                      {p.label}
                    </p>
                    <p className="mt-4 text-[34px] font-semibold leading-none text-brand">
                      {formatPrice(p.price)}
                      <span className="ml-1.5 text-[15px] font-light text-muted">{currency}</span>
                    </p>
                    {p.sessions > 1 && (
                      <p className="mt-2 text-[12px] text-muted">
                        ≈ {formatPrice(perSession)} {currency} / sedinta
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelected({ pkg: label, location: current.name })}
                      className="btn btn-outline mt-6 w-full"
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

      <div className="mt-12 border-t border-black/10 pt-8 text-center">
        <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-muted">
          {commonConditions.map((c) => (
            <span key={c} className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 text-brand" />
              {c}
            </span>
          ))}
        </p>
        <p className="mt-6 text-[13px] text-muted">
          Vrei sa te inscrii direct?{' '}
          <Link href={`/inscriere/${current.slug}`} className="font-semibold text-brand underline">
            Completeaza formularul de inscriere
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
