import Icon from './Icon';

/** Butonul fix de telefon pe mobil — inlocuieste pluginul Call Now Button. */
export default function CallNowButton({ phoneHref, phone }: { phoneHref: string; phone: string }) {
  return (
    <a
      href={`tel:${phoneHref}`}
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 bg-brand
                 py-3.5 text-[13px] font-semibold uppercase tracking-wide2 text-white shadow-lg md:hidden"
      aria-label={`Suna la ${phone}`}
    >
      <Icon name="phone" className="h-4 w-4" />
      Suna acum — {phone}
    </a>
  );
}
