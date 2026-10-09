import type { MetadataRoute } from 'next';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bluemarin.ro').replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Formularele si panoul de admin nu au ce cauta in Google.
        disallow: ['/inscriere/', '/api/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
