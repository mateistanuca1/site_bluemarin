#!/usr/bin/env node
/**
 * Descarca pozele de pe bluemarin.ro si le optimizeaza (WebP) in public/images/.
 *
 *   npm run images              — descarca tot ce lipseste
 *   npm run images -- --force   — redescarca tot
 *
 * Ce poze se descarca e definit in scripts/images.manifest.json.
 * Adauga linii acolo daca vrei mai multe poze in galerie.
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'images');
const MANIFEST = join(ROOT, 'scripts', 'images.manifest.json');
const FORCE = process.argv.includes('--force');

const UA = 'Mozilla/5.0 (X11; Linux x86_64) BluemarinSiteMigration/1.0';
const QUALITY = 80;

const stats = { downloaded: 0, skipped: 0, failed: [] };

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function download(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 800 * attempt));
      return download(url, attempt + 1);
    }
    throw err;
  }
}

/** Converteste bufferul si il scrie pe disc. */
async function convert(buf, outPath, { width, height, format }) {
  let img = sharp(buf, { failOn: 'none' }).rotate();

  if (width || height) {
    img = img.resize({
      width,
      height,
      // Portretele (cu height) se decupeaza patrat; fundalurile doar se micsoreaza.
      fit: height ? 'cover' : 'inside',
      position: 'centre',
      withoutEnlargement: true,
    });
  }

  img = format === 'png' ? img.png({ compressionLevel: 9 }) : img.webp({ quality: QUALITY });

  await mkdir(dirname(outPath), { recursive: true });
  await img.toFile(outPath);
}

async function handle(base, entry) {
  const { src, out, width, height, format } = entry;
  const outPath = join(OUT_DIR, out);

  if (!FORCE && (await exists(outPath))) {
    stats.skipped++;
    return;
  }

  const url = base + src;
  try {
    const buf = await download(url);
    await convert(buf, outPath, { width, height, format });
    const { size } = await stat(outPath);
    stats.downloaded++;
    console.log(`  ✓ ${out}  (${(size / 1024).toFixed(0)} kB)`);
  } catch (err) {
    stats.failed.push({ src, out, reason: err.message });
    console.warn(`  ✗ ${out}  — ${err.message}`);
  }
}

/** Ruleaza task-urile in grupuri mici ca sa nu suprasolicitam serverul vechi. */
async function runPool(items, worker, size = 5) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) await worker(queue.shift());
  });
  await Promise.all(runners);
}

/** Transforma "2020/03/DSC_0132-min.jpg" in "galerie/dsc-0132.webp". */
function galleryName(src) {
  const file = src.split('/').pop().replace(/\.[a-z]+$/i, '');
  const slug = file
    .toLowerCase()
    .replace(/-?min$/, '')
    .replace(/-\d{3,4}x\d{3,4}/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `galerie/${slug}.webp`;
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const { base } = manifest;

  const jobs = [
    ...manifest.branding,
    ...manifest.backgrounds,
    ...manifest.team,
    ...manifest.gallery.map((src) => ({ src, out: galleryName(src), width: 1600 })),
  ];

  // Doua poze pot avea aceeasi sursa (ex. bazin-rapid-3 e si hero si in galerie) — e in regula,
  // dar nu descarcam de doua ori acelasi fisier de iesire.
  const unique = [...new Map(jobs.map((j) => [j.out, j])).values()];

  console.log(`Descarc ${unique.length} imagini din ${base}\n`);
  await runPool(unique, (job) => handle(base, job));

  // Scrie galerie.json cu pozele care au ajuns efectiv pe disc.
  const failedOuts = new Set(stats.failed.map((f) => f.out));
  const gallery = manifest.gallery
    .map(galleryName)
    .filter((out, i, arr) => arr.indexOf(out) === i && !failedOuts.has(out));

  const present = [];
  for (const out of gallery) {
    if (await exists(join(OUT_DIR, out))) present.push(`/images/${out}`);
  }

  await writeFile(
    join(ROOT, 'content', 'gallery.json'),
    JSON.stringify(
      {
        _comment:
          'Generat de npm run images. Poti edita manual: adauga caile pozelor din public/images/galerie/.',
        title: 'Galerie',
        lead: 'Momente din bazin, de la primele sedinte de acomodare pana la competitii.',
        images: present.map((src) => ({ src, alt: 'Bluemarin Sport Club — cursuri de inot' })),
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  console.log(
    `\nGata: ${stats.downloaded} descarcate, ${stats.skipped} existente deja, ${stats.failed.length} esuate.`,
  );
  console.log(`Galerie: ${present.length} poze scrise in content/gallery.json`);

  if (stats.failed.length) {
    console.log('\nNu s-au putut descarca:');
    for (const f of stats.failed) console.log(`  ${f.src} — ${f.reason}`);
    console.log('Verifica adresele in scripts/images.manifest.json.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
