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

const DURATION = 1600;

/** Cifra care numara crescator cand intra in ecran. */
export default function Counter({ to, label, icon, separator }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Pornim de la valoarea finala: asa apare corect si in HTML-ul de pe server,
  // chiar daca JavaScript-ul nu ruleaza. Animatia o aducem la zero abia cand
  // stim ca cifra e sub ecran si chiar poate fi vazuta cum creste.
  const [value, setValue] = useState(to);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Daca utilizatorul a cerut mai putina animatie, lasam valoarea finala.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Daca cifra e deja pe ecran la incarcare, o lasam asa: n-ar avea cine sa
    // vada animatia, iar o resetare la zero ar parea o eroare.
    if (el.getBoundingClientRect().top <= window.innerHeight) return;

    // Nu ducem valoarea la zero acum, ci lasam animatia sa porneasca de acolo.
    // Asa, daca observatorul nu se declanseaza niciodata, pe ecran ramane
    // numarul real, nu un zero.
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
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10">
        <Icon name={icon as IconName} className="h-6 w-6 text-brand-light" />
      </span>

      <div className="text-[clamp(2.4rem,5.5vw,3.4rem)] font-bold leading-none text-accent">
        {shown}
        {to >= 1000 && <span aria-hidden="true">+</span>}
      </div>

      <div className="mt-3 text-[13px] font-medium uppercase tracking-wide2 text-white/80 sm:text-[14px]">
        {label}
      </div>
    </div>
  );
}
