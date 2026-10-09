import Icon from './Icon';
import Section from './Section';
import type { Site } from '@/lib/types';

/** Banda cu cele 3 carduri de social media, prezenta la finalul paginilor. */
export default function SocialCards({ site }: { site: Site }) {
  return (
    <Section tone="night" size="sm">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14">
        <div>
          <p className="label mb-3 text-brand-light">Rămâi aproape</p>
          <h2 className="text-[clamp(1.3rem,2.6vw,1.8rem)] font-bold uppercase leading-tight tracking-headline">
            Urmărește-ne
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
            Poveștile din bazin, rezultatele de la competiții și anunțurile despre grupe noi
            ajung mai întâi pe canalele noastre.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {site.socialCards.map((card) => (
            <a
              key={card.network}
              href={site.social[card.network]}
              target="_blank"
              rel="noopener noreferrer"
              className="card-dark card-dark-hover group flex flex-col items-start gap-3 p-6"
            >
              <Icon
                name={card.network}
                className="h-7 w-7 text-brand-light transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-[14px] font-bold uppercase tracking-wide2">{card.label}</span>
              <span className="text-[13px] leading-relaxed text-white/65">{card.caption}</span>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[11px] font-bold uppercase tracking-wide2 text-white/80">
                Deschide
                <Icon name="external" className="h-3.5 w-3.5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}
