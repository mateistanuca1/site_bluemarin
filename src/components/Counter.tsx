'use client';

import { useEffect, useRef, useState } from 'react';

import Icon, { type IconName } from './Icon';

type Props = {
  to: number;
  label: string;
  icon: string;
  /** Separator de mii, ex. "." pentru 7.000. */
  separator?: string;
};

const DURATION = 1800;

/** Cifra care numara crescator cand intra in ecran — ca pe site-ul vechi. */
export default function Counter({ to, label, icon, separator }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Daca utilizatorul a cerut mai putina animatie, arata direct valoarea finala.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }

    const run = () => {
      if (started.current) return;
      started.current = true;

      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / DURATION, 1);
        // easeOutCubic — porneste repede, incetineste la final
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  const shown = separator ? value.toLocaleString('ro-RO') : String(value);

  return (
    <div ref={ref} className="text-center">
      <Icon name={icon as IconName} className="mx-auto mb-4 h-9 w-9 text-white/70" />
      <div className="text-[40px] font-semibold leading-none text-accent sm:text-[52px]">
        {shown}
      </div>
      <div className="mt-3 text-[13px] font-light uppercase tracking-wide2 text-white/85 sm:text-[15px]">
        {label}
      </div>
    </div>
  );
}
