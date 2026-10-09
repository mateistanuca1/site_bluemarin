import Image from 'next/image';
import Link from 'next/link';

import Icon from './Icon';
import type { Site } from '@/lib/types';

export default function Footer({ site }: { site: Site }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white/70">
      <div className="shell grid gap-10 py-14 md:grid-cols-3 md:gap-8 lg:py-16">
        <div>
          <Image
            src={site.logo}
            alt={site.name}
            width={150}
            height={145}
            className="h-14 w-auto brightness-0 invert"
          />
          <p className="mt-5 text-[13px] font-light leading-relaxed">
            {site.tagline}
          </p>
          <p className="mt-4 text-[12px] leading-relaxed text-white/45">
            {site.company.legalName}
            <br />
            C.I.F. {site.company.cif}
            <br />
            {site.company.registeredOffice}
          </p>
        </div>

        <div>
          <h2 className="mb-5 text-[13px] font-semibold uppercase tracking-headline text-white">
            Contact
          </h2>
          <ul className="space-y-3 text-[13px]">
            <li>
              <a
                href={`tel:${site.contact.phoneHref}`}
                className="flex items-center gap-3 transition-colors hover:text-brand"
              >
                <Icon name="phone" className="h-4 w-4 shrink-0 text-brand" />
                {site.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="flex items-center gap-3 transition-colors hover:text-brand"
              >
                <Icon name="mail" className="h-4 w-4 shrink-0 text-brand" />
                {site.contact.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>{site.contact.address}</span>
            </li>
          </ul>

          <h2 className="mb-4 mt-8 text-[13px] font-semibold uppercase tracking-headline text-white">
            Program
          </h2>
          <ul className="space-y-3 text-[12px]">
            {site.schedule.map((s) => (
              <li key={s.label}>
                <span className="block font-semibold text-white/85">{s.label}</span>
                {s.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-5 text-[13px] font-semibold uppercase tracking-headline text-white">
            Social media
          </h2>
          <div className="flex gap-3">
            {(['facebook', 'instagram', 'youtube'] as const).map((n) => (
              <a
                key={n}
                href={site.social[n]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={n}
                className="flex h-10 w-10 items-center justify-center border border-white/20 transition-colors hover:border-brand hover:bg-brand hover:text-white"
              >
                <Icon name={n} className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>

          <h2 className="mb-4 mt-8 text-[13px] font-semibold uppercase tracking-headline text-white">
            Informatii
          </h2>
          <ul className="space-y-2.5 text-[13px]">
            {site.footerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col items-center justify-between gap-2 py-5 text-[11px] uppercase tracking-wide2 sm:flex-row">
          <span>
            © {year} {site.name}
          </span>
          <span className="text-white/40">Din pasiune pentru sport</span>
        </div>
      </div>
    </footer>
  );
}
