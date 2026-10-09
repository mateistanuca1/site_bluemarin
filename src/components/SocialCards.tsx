import Icon from './Icon';
import Section from './Section';
import SectionTitle from './SectionTitle';
import type { Site } from '@/lib/types';

/** Banda cu cele 3 carduri de social media, prezenta pe fiecare pagina veche. */
export default function SocialCards({ site }: { site: Site }) {
  return (
    <Section tone="deep" size="sm" pattern className="bg-deep-alt">
      <SectionTitle className="mb-12">Social media</SectionTitle>
      <div className="grid gap-5 sm:grid-cols-3">
        {site.socialCards.map((card) => (
          <a
            key={card.network}
            href={site.social[card.network]}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 border border-white/25 px-6 py-10 text-center
                       transition-colors hover:border-white hover:bg-white/10"
          >
            <Icon
              name={card.network}
              className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-[14px] font-semibold uppercase tracking-headline">
              {card.label}
            </span>
            <span className="text-[13px] font-light text-white/75">{card.caption}</span>
          </a>
        ))}
      </div>
    </Section>
  );
}
