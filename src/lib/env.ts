/**
 * Citirea variabilelor de mediu.
 *
 * `process.env.X ?? implicit` nu e de ajuns: pe Vercel o variabila adaugata si
 * lasata necompletata ajunge sir gol, nu `undefined`, iar `??` o lasa sa treaca.
 * De acolo `new URL('')` arunca si cade tot build-ul. Tratam golul ca absent.
 */

/** Valoarea variabilei, sau `fallback` daca lipseste ori e goala. */
export function env(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/** Adresa publica a site-ului, fara slash la final. */
export function siteUrl(): string {
  return env(process.env.NEXT_PUBLIC_SITE_URL, 'https://www.bluemarin.ro').replace(/\/+$/, '');
}
