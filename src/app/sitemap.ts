import type { MetadataRoute } from 'next';

import { getContentSync } from '@/lib/content';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bluemarin.ro').replace(/\/+$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const team = getContentSync('team');
  const locations = getContentSync('locations');
  const legal = getContentSync('legal');
  const now = new Date();

  const fixed: { path: string; priority: number }[] = [
    { path: '/', priority: 1 },
    { path: '/cursuri-de-inot', priority: 0.9 },
    { path: '/cursuri-inot-copii', priority: 0.9 },
    { path: '/tarife', priority: 0.9 },
    { path: '/echipa', priority: 0.7 },
    { path: '/galerie', priority: 0.6 },
    { path: '/cariere', priority: 0.5 },
    { path: '/regulament', priority: 0.4 },
    { path: '/contact', priority: 0.7 },
  ];

  return [
    ...fixed.map((f) => ({
      url: `${BASE}${f.path}`,
      lastModified: now,
      priority: f.priority,
      changeFrequency: 'monthly' as const,
    })),
    ...locations.items.map((l) => ({
      url: `${BASE}/locatii/${l.slug}`,
      lastModified: now,
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    })),
    ...team.members.map((m) => ({
      url: `${BASE}/echipa/${m.slug}`,
      lastModified: now,
      priority: 0.5,
      changeFrequency: 'yearly' as const,
    })),
    ...legal.pages.map((p) => ({
      url: `${BASE}/${p.slug}`,
      lastModified: now,
      priority: 0.2,
      changeFrequency: 'yearly' as const,
    })),
  ];
}
