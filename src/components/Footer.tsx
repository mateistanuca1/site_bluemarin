import Image from 'next/image';
import Link from 'next/link';

import Icon from './Icon';
import type { Site } from '@/lib/types';

export default function Footer({ site }: { site: Site }) {
  const year = new Date().getFullYear();
  const { contact } = site;

  return (
    <footer className="on-dark bg-deep-900 text-white/70">
      {/* Banda de chemare la actiune, peste footer. */}
      <div className="border-b border-white/10 bg-brand-700">
        <div className="shell flex flex-col items-center justify-between gap-5 py-8 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-[17px] font-bold uppercase tracking-wide2 text-white sm:text-[19px]">
              Gata să intri în apă?
            </h2>
            <p className="mt-1.5 text-[14px] text-white/80">
              Completează formularul de înscriere sau sună-ne — îți găsim grupa potrivită.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <Link href="/inscriere/bazin-cs-rapid" className="btn btn-solid-light">
              Înscrie-te
            </Link>
            <a href={`tel:${contact.phoneHref}`} className="btn btn-light">
              <Icon name="phone" className="h-4 w-4" />
              {contact.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
        {/* Identitate */}
        <div className="lg:col-span-1">
          <Image
            src={site.logo}
            alt={site.name}
            width={150}
            height={145}
            className="h-12 w-auto brightness-0 invert"
          />
          <p className="mt-5 text-[14px] leading-relaxed text-white/80">{site.tagline}</p>

          <div className="mt-6 flex gap-2.5">
            {(['facebook', 'instagram', 'youtube'] as const).map((n) => (
              <a
                key={n}
                href={site.social[n]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={n[0].toUpperCase() + n.slice(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20
                           transition-colors hover:border-brand hover:bg-brand hover:text-white"
              >
                <Icon name={n} className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="label mb-5 text-white">Contact</h2>
          <ul className="space-y-3.5 text-[14px]">
            <li>
              <a
                href={`tel:${contact.phoneHref}`}
                className="flex items-start gap-3 transition-colors hover:text-brand-light"
              >
                <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
                <span>
                  {contact.phone}
                  {contact.phoneLabel && (
                    <span className="block text-[12px] text-white/45">{contact.phoneLabel}</span>
                  )}
                </span>
              </a>
            </li>

            {contact.phoneSecondary && contact.phoneSecondaryHref && (
              <li>
                <a
                  href={`tel:${contact.phoneSecondaryHref}`}
                  className="flex items-start gap-3 transition-colors hover:text-brand-light"
                >
                  <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
                  <span>
                    {contact.phoneSecondary}
                    {contact.phoneSecondaryLabel && (
                      <span className="block text-[12px] text-white/45">
                        {contact.phoneSecondaryLabel}
                      </span>
                    )}
                  </span>
                </a>
              </li>
            )}

            <li>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-start gap-3 transition-colors hover:text-brand-light"
              >
                <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
                {contact.email}
              </a>
            </li>

            <li className="flex items-start gap-3">
              <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
              <span>{contact.address}</span>
            </li>
          </ul>
        </div>

        {/* Program */}
        <div>
          <h2 className="label mb-5 text-white">Program</h2>
          <ul className="space-y-4 text-[13.5px]">
            {site.schedule.map((s) => (
              <li key={s.label}>
                <span className="block font-semibold text-white/90">{s.label}</span>
                {s.lines.map((l) => (
                  <span key={l} className="mt-0.5 block text-white/65">
                    {l}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>

        {/* Informatii */}
        <div>
          <h2 className="label mb-5 text-white">Informații</h2>
          <ul className="space-y-2.5 text-[14px]">
            {site.footerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-brand-light">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-7 text-[12px] leading-relaxed text-white/55">
            {site.company.legalName}
            <br />
            C.I.F. {site.company.cif}
            <br />
            {site.company.registeredOffice}
          </p>
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
