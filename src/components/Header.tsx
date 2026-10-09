'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import Icon from './Icon';
import { cx } from '@/lib/utils';
import type { NavItem } from '@/lib/types';

type Props = {
  logo: string;
  siteName: string;
  nav: NavItem[];
  phone: string;
  phoneHref: string;
};

export default function Header({ logo, siteName, nav, phone, phoneHref }: Props) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Bara devine opaca dupa ce derulezi — ca pe site-ul vechi.
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Inchide meniul la schimbarea paginii.
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

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid || menuOpen ? 'bg-white shadow-md' : 'bg-gradient-to-b from-black/50 to-transparent',
      )}
    >
      <div className="shell flex h-[72px] items-center justify-between gap-4 lg:h-[88px]">
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${siteName} — acasa`}>
          <Image
            src={logo}
            alt={siteName}
            width={160}
            height={154}
            priority
            className={cx(
              'h-11 w-auto transition-all duration-300 lg:h-14',
              solid || menuOpen ? '' : 'brightness-0 invert',
            )}
          />
        </Link>

        {/* Navigatie desktop */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigatie principala">
          {nav.map((item) =>
            item.children ? (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className={cx(
                    'flex items-center gap-1 px-3 py-2 text-[12px] font-semibold uppercase tracking-wide2 transition-colors',
                    solid ? 'text-ink' : 'text-white',
                    groupActive(item) && (solid ? '!text-brand' : 'underline decoration-2 underline-offset-8'),
                    'hover:!text-brand',
                  )}
                >
                  {item.label}
                  <Icon name="chevron-down" className="h-3.5 w-3.5" />
                </Link>
                <div
                  className="invisible absolute left-0 top-full min-w-[230px] translate-y-1 border-t-2 border-brand
                             bg-white opacity-0 shadow-xl transition-all duration-200
                             group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100
                             group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cx(
                        'block px-5 py-3 text-[12px] font-semibold uppercase tracking-wide2 transition-colors hover:bg-brand-soft hover:text-brand',
                        isActive(child.href) ? 'text-brand' : 'text-ink',
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  'px-3 py-2 text-[12px] font-semibold uppercase tracking-wide2 transition-colors hover:!text-brand',
                  solid ? 'text-ink' : 'text-white',
                  isActive(item.href) && (solid ? '!text-brand' : 'underline decoration-2 underline-offset-8'),
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${phoneHref}`}
            className={cx(
              'hidden items-center gap-2 text-[13px] font-semibold tracking-wide transition-colors md:flex',
              solid ? 'text-brand hover:text-deep' : 'text-white hover:text-brand-light',
            )}
          >
            <Icon name="phone" className="h-4 w-4" />
            {phone}
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="meniu-mobil"
            aria-label={menuOpen ? 'Inchide meniul' : 'Deschide meniul'}
            className={cx('p-2 lg:hidden', solid || menuOpen ? 'text-ink' : 'text-white')}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Navigatie mobil */}
      <div
        id="meniu-mobil"
        className={cx(
          'overflow-y-auto border-t border-black/5 bg-white lg:hidden',
          menuOpen ? 'max-h-[calc(100vh-72px)]' : 'hidden',
        )}
      >
        <nav className="shell flex flex-col py-4" aria-label="Navigatie principala mobil">
          {nav.map((item) =>
            item.children ? (
              <div key={item.label} className="border-b border-black/5 last:border-0">
                <button
                  type="button"
                  onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}
                  aria-expanded={openGroup === item.label}
                  className={cx(
                    'flex w-full items-center justify-between py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide2',
                    groupActive(item) ? 'text-brand' : 'text-ink',
                  )}
                >
                  {item.label}
                  <Icon
                    name="chevron-down"
                    className={cx(
                      'h-4 w-4 transition-transform',
                      openGroup === item.label && 'rotate-180',
                    )}
                  />
                </button>
                {openGroup === item.label && (
                  <div className="pb-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cx(
                          'block py-2.5 pl-4 text-[13px] font-medium uppercase tracking-wide2',
                          isActive(child.href) ? 'text-brand' : 'text-muted',
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
                  'border-b border-black/5 py-3.5 text-[13px] font-semibold uppercase tracking-wide2 last:border-0',
                  isActive(item.href) ? 'text-brand' : 'text-ink',
                )}
              >
                {item.label}
              </Link>
            ),
          )}

          <a
            href={`tel:${phoneHref}`}
            className="mt-4 flex items-center justify-center gap-2 bg-brand px-5 py-3.5 text-[13px] font-semibold uppercase tracking-wide2 text-white"
          >
            <Icon name="phone" className="h-4 w-4" />
            {phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
