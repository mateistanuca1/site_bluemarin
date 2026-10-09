/** Adresa backend-ului, folosita din browser. Implicit /api, acelasi domeniu. */
export function publicApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? '/api').replace(/\/+$/, '');
}
