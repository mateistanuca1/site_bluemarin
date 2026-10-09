import type { Metadata, Viewport } from 'next';
import { Crimson_Pro, Raleway } from 'next/font/google';

import CallNowButton from '@/components/CallNowButton';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getContent } from '@/lib/content';
import '@/styles/globals.css';

const raleway = Raleway({
  subsets: ['latin', 'latin-ext'],
  weight: ['200', '300', '400', '600', '700'],
  variable: '--font-raleway',
  display: 'swap',
});

const crimson = Crimson_Pro({
  subsets: ['latin', 'latin-ext'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-crimson',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getContent('site');

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bluemarin.ro'),
    title: {
      default: site.seo.title,
      template: `%s | ${site.name}`,
    },
    description: site.seo.description,
    keywords: site.seo.keywords,
    openGraph: {
      type: 'website',
      locale: 'ro_RO',
      siteName: site.name,
      title: site.seo.title,
      description: site.seo.description,
      images: ['/images/hero-bazin.webp'],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.seo.title,
      description: site.seo.description,
    },
    alternates: { canonical: '/' },
    icons: { icon: '/favicon.ico', apple: '/images/logo-bluemarin.png' },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#6b98ed',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getContent('site');

  // Date structurate pentru Google — ajuta la afisarea in rezultatele locale.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: site.name,
    description: site.seo.description,
    telephone: site.contact.phone,
    email: site.contact.email,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bluemarin.ro',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calea Giulesti 18',
      addressLocality: 'Bucuresti',
      addressCountry: 'RO',
    },
    sameAs: [site.social.facebook, site.social.instagram, site.social.youtube],
  };

  return (
    <html lang="ro" className={`${raleway.variable} ${crimson.variable}`}>
      <body>
        <a
          href="#continut"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70]
                     focus:bg-brand focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-white"
        >
          Sari la conținut
        </a>

        <Header
          logo={site.logo}
          siteName={site.name}
          nav={site.nav}
          phone={site.contact.phone}
          phoneHref={site.contact.phoneHref}
        />

        <main id="continut" className="pb-14 md:pb-0">
          {children}
        </main>

        <Footer site={site} />
        <CallNowButton phone={site.contact.phone} phoneHref={site.contact.phoneHref} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
