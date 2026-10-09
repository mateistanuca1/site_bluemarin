'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import Icon from './Icon';
import { cx } from '@/lib/utils';
import type { Link as LinkType, NavItem } from '@/lib/types';

type Props = {
  logo: string;
  siteName: string;
  nav: NavItem[];
  phone: string;
  phoneHref: string;
  cta?: LinkType;
};

/**
 * Bara de sus.
 *
 * Culorile vin din variabilele `--hdr-*` definite in globals.css: bara e
 * transparenta doar cat timp stai in capul unei pagini care are banner
 * (`[data-page-hero]`). Pe paginile fara banner ramane alba — altfel textul
 * alb ar fi invizibil, cum se intampla pe 404 si pe paginile legale.
 * Decizia se ia din CSS, nu din JavaScript, ca sa nu palpaie la incarcare.
 */
export default function Header({ logo, siteName, nav, phone, phoneHref, cta }: Props) {
  const pathname = usePathname();
  const [atTop, setAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  // Blocheaza derularea paginii cat timp meniul mobil e deschis.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  const groupActive = (item: NavItem) =>
    isActive(item.href) || (item.children ?? []).some((c) => isActive(c.href));

  const linkBase =
    'rounded px-2.5 py-2 text-[11.5px] font-bold uppercase tracking-wide2 transition-colors xl:px-3 xl:text-[12px]';

  return (
    <header
      className="site-header fixed inset-x-0 top-0 z-50"
      data-top={atTop ? 'true' : 'false'}
      data-menu={menuOpen ? 'true' : 'false'}
    >
      <div className="shell flex h-[68px] items-center justify-between gap-3 lg:h-[84px] lg:gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded"
          aria-label={`${siteName} — pagina principală`}
        >
          <Image
            src={logo}
            alt={siteName}
            width={160}
            height={154}
            priority
            className="site-header__logo h-10 w-auto lg:h-[52px]"
          />
        </Link>

        {/* Navigatie desktop */}
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
          aria-label="Navigație principală"
        >
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {nav.map((item) =>
              item.children ? (
                <li key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={groupActive(item) ? 'page' : undefined}
                    className={cx(
                      linkBase,
                      'site-header__link flex items-center gap-1 whitespace-nowrap',
                      groupActive(item) && 'is-active',
                    )}
                  >
                    {item.label}
                    <Icon
                      name="chevron-down"
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
                    />
                  </Link>

                  <div
                    className="invisible absolute left-0 top-full min-w-[240px] translate-y-1 overflow-hidden
                               rounded-card border border-line bg-white opacity-0 shadow-card-hover
                               transition-all duration-200
                               group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100
                               group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <span aria-hidden="true" className="block h-[3px] w-full bg-brand" />
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cx(
                          'block whitespace-nowrap px-5 py-3 text-[12px] font-bold uppercase tracking-wide2',
                          'transition-colors hover:bg-brand-50 hover:text-brand',
                          isActive(child.href) ? 'text-brand' : 'text-ink',
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cx(
                      linkBase,
                      'site-header__link block whitespace-nowrap',
                      isActive(item.href) && 'is-active',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={`tel:${phoneHref}`}
            className="site-header__link hidden items-center gap-2 whitespace-nowrap rounded
                       text-[13px] font-semibold md:flex"
          >
            <Icon name="phone" className="h-4 w-4 shrink-0" />
            <span className="tabular-nums">{phone}</span>
          </a>

          {cta && (
            <Link href={cta.href} className="site-header__cta btn btn-sm hidden xl:inline-flex">
              {cta.label}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="meniu-mobil"
            aria-label={menuOpen ? 'Închide meniul' : 'Deschide meniul'}
            className="site-header__link -mr-2 rounded p-2 lg:hidden"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Navigatie mobil */}
      <div
        id="meniu-mobil"
        className={cx(
          'overflow-y-auto overscroll-contain border-t border-line bg-white lg:hidden',
          menuOpen ? 'max-h-[calc(100dvh-68px)]' : 'hidden',
        )}
      >
        <nav className="shell flex flex-col py-3" aria-label="Navigație principală (mobil)">
          {nav.map((item) =>
            item.children ? (
              <div key={item.label} className="border-b border-line last:border-0">
                <button
                  type="button"
                  onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}
                  aria-expanded={openGroup === item.label}
                  className={cx(
                    'flex w-full items-center justify-between py-3.5 text-left text-[13px]',
                    'font-bold uppercase tracking-wide2',
                    groupActive(item) ? 'text-brand' : 'text-ink',
                  )}
                >
                  {item.label}
                  <Icon
                    name="chevron-down"
                    className={cx(
                      'h-4 w-4 transition-transform duration-200',
                      openGroup === item.label && 'rotate-180',
                    )}
                  />
                </button>
                {openGroup === item.label && (
                  <div className="mb-2 space-y-1 border-l-2 border-brand-200 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cx(
                          'block py-2 text-[13px] font-semibold uppercase tracking-wide2',
                          isActive(child.href) ? 'text-brand' : 'text-ink-muted',
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  'border-b border-line py-3.5 text-[13px] font-bold uppercase tracking-wide2 last:border-0',
                  isActive(item.href) ? 'text-brand' : 'text-ink',
                )}
              >
                {item.label}
              </Link>
            ),
          )}

          <div className="mb-3 mt-5 grid gap-2.5">
            {cta && (
              <Link href={cta.href} className="btn btn-primary w-full">
                {cta.label}
              </Link>
            )}
            <a href={`tel:${phoneHref}`} className="btn btn-outline w-full">
              <Icon name="phone" className="h-4 w-4" />
              {phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
