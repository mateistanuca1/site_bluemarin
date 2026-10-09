'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import Icon from './Icon';

type Img = { src: string; alt: string };

const PAGE = 18;

export default function GalleryGrid({ images }: { images: Img[] }) {
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (delta: number) =>
      setOpen((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length],
  );

  // Navigare cu tastatura in lightbox.
  useEffect(() => {
    if (open === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, go]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.slice(0, shown).map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative aspect-square overflow-hidden bg-brand-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={`Deschide imaginea ${i + 1} din ${images.length}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 32vw, 48vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-deep/0 transition-colors duration-300 group-hover:bg-deep/30"
            />
          </button>
        ))}
      </div>

      {shown < images.length && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setShown((s) => s + PAGE)}
            className="btn btn-outline"
          >
            Mai multe poze ({images.length - shown})
          </button>
        </div>
      )}

      {open !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/92 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Vizualizare imagine"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Inchide"
            className="absolute right-4 top-4 z-10 p-2 text-white/80 transition-colors hover:text-white"
          >
            <Icon name="close" className="h-7 w-7" />
          </button>

          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Imaginea anterioara"
            className="absolute left-2 z-10 p-3 text-white/70 transition-colors hover:text-white sm:left-6"
          >
            <Icon name="chevron-left" className="h-8 w-8" />
          </button>

          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={images[open].src}
              alt={images[open].alt}
              fill
              sizes="100vw"
              priority
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Imaginea urmatoare"
            className="absolute right-2 z-10 p-3 text-white/70 transition-colors hover:text-white sm:right-6"
          >
            <Icon name="chevron-right" className="h-8 w-8" />
          </button>

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[13px] tracking-wide2 text-white/60">
            {open + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
