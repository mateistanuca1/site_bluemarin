import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/env';
const BASE = siteUrl();

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
