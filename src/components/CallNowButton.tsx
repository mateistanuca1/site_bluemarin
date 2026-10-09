import Link from 'next/link';

import Icon from './Icon';

type Props = { phoneHref: string; phone: string };

/** Bara fixa de jos, pe mobil: suna sau inscrie-te, din orice pagina. */
export default function CallNowButton({ phoneHref, phone }: Props) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-white/15
                 bg-deep-800/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <a
        href={`tel:${phoneHref}`}
        className="flex items-center justify-center gap-2 py-3.5 text-[12.5px] font-bold
                   uppercase tracking-wide2 text-white"
        aria-label={`Sună la ${phone}`}
      >
        <Icon name="phone" className="h-4 w-4" />
        Sună acum
      </a>

      <Link
        href="/inscriere/bazin-cs-rapid"
        className="flex items-center justify-center gap-2 bg-brand py-3.5 text-[12.5px] font-bold
                   uppercase tracking-wide2 text-white"
      >
        <Icon name="file-text" className="h-4 w-4" />
        Înscrie-te
      </Link>
    </div>
  );
}
