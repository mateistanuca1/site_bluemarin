import Link from 'next/link';

import Icon from '@/components/Icon';
import Section from '@/components/Section';

/**
 * Pagina 404 nu are banner, deci bara de sus ramane alba (vezi `.site-header`).
 * `page-offset` lasa loc sub ea.
 */
export default function NotFound() {
  return (
    <Section tone="soft" size="lg" className="page-offset">
      <div className="mx-auto max-w-xl text-center">
        <p aria-hidden="true" className="text-[84px] font-bold leading-none text-brand-200">
          404
        </p>

        <h1 className="mt-4 text-[clamp(1.4rem,4vw,2rem)] font-bold uppercase tracking-headline">
          Pagina nu a fost găsită
        </h1>

        <p className="mt-5 text-[15.5px] leading-relaxed text-ink-soft">
          Se pare că linkul pe care ai venit nu mai există. Încearcă din meniu sau întoarce-te la
          prima pagină.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Prima pagină
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Contact
          </Link>
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <p className="label mb-4 text-ink-muted">Poate căutai</p>
          <ul className="flex flex-wrap justify-center gap-2.5">
            {[
              { label: 'Cursuri de înot', href: '/cursuri-de-inot' },
              { label: 'Cursuri înot copii', href: '/cursuri-inot-copii' },
              { label: 'Tarife', href: '/tarife' },
              { label: 'Echipa', href: '/echipa' },
              { label: 'Galerie', href: '/galerie' },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white
                             px-4 py-2 text-[13px] font-medium transition-colors hover:border-brand hover:text-brand"
                >
                  {l.label}
                  <Icon name="arrow-right" className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
