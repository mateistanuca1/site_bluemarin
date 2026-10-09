/**
 * Incarcarea continutului site-ului.
 *
 * Ordinea in care se caută conținutul:
 *   1. Backend-ul Flask (daca CONTENT_API_URL e setat) — ce editezi in panoul de admin.
 *   2. Fisierele din content/*.json — valorile initiale, incluse in build.
 *
 * Asa site-ul merge si inainte sa configurezi baza de date, si nu cade
 * daca backend-ul e indisponibil.
 */
import 'server-only';

import type { ContentKey, ContentMap } from './types';

import careers from '../../content/careers.json';
import contact from '../../content/contact.json';
import courses from '../../content/courses.json';
import gallery from '../../content/gallery.json';
import home from '../../content/home.json';
import kids from '../../content/kids.json';
import legal from '../../content/legal.json';
import locations from '../../content/locations.json';
import pricing from '../../content/pricing.json';
import rules from '../../content/rules.json';
import site from '../../content/site.json';
import team from '../../content/team.json';

const FALLBACK = {
  careers,
  contact,
  courses,
  gallery,
  home,
  kids,
  legal,
  locations,
  pricing,
  rules,
  site,
  team,
} as unknown as ContentMap;

/** Cat timp Next.js tine in cache un raspuns de la backend (secunde). */
const REVALIDATE = Number(process.env.CONTENT_REVALIDATE ?? 300);

function apiBase(): string | null {
  const url = process.env.CONTENT_API_URL?.trim();
  return url ? url.replace(/\/+$/, '') : null;
}

/** Eticheta de cache pentru o colectie — backend-ul o foloseste la revalidare. */
export function contentTag(key: ContentKey): string {
  return `content:${key}`;
}

/**
 * Returneaza o colectie de continut. Daca backend-ul nu raspunde sau trimite
 * altceva decat JSON valid, se folosesc fisierele locale.
 */
export async function getContent<K extends ContentKey>(key: K): Promise<ContentMap[K]> {
  const base = apiBase();
  if (!base) return FALLBACK[key];

  try {
    const res = await fetch(`${base}/content/${key}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE, tags: ['content', contentTag(key)] },
    });

    if (!res.ok) return FALLBACK[key];

    const data = await res.json();
    // Backend-ul poate raspunde cu {} daca nu are inca nimic salvat pentru cheia asta.
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      return FALLBACK[key];
    }
    return data as ContentMap[K];
  } catch {
    return FALLBACK[key];
  }
}

/** Varianta sincrona, doar pe fisiere — pentru generateStaticParams si sitemap. */
export function getContentSync<K extends ContentKey>(key: K): ContentMap[K] {
  return FALLBACK[key];
}
