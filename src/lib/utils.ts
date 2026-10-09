/** Mici ajutoare folosite in toate paginile. */

/** Lipeste clase CSS, ignorand valorile false/null/undefined. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** 1200 -> "1.200" (separator de mii romanesc). */
export function formatPrice(value: number): string {
  return value.toLocaleString('ro-RO');
}

/** Imparte un text pe linii goale in paragrafe. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** "Bazin C.S. Rapid" -> "bazin-c-s-rapid" */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
