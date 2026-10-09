/** Iconite SVG inline — fara librarie externa, ca sa nu incarcam nimic in plus. */

type Props = { name: IconName; className?: string };

export type IconName =
  | 'phone'
  | 'mail'
  | 'pin'
  | 'clock'
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'award'
  | 'swimmer'
  | 'medal'
  | 'trophy'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'menu'
  | 'arrow-right'
  | 'ruler'
  | 'thumbs-up'
  | 'heart'
  | 'users'
  | 'calendar'
  | 'file-text'
  | 'shield'
  | 'sparkles'
  | 'quote'
  | 'arrow-down'
  | 'external';

const PATHS: Record<IconName, React.ReactNode> = {
  phone: <path d="M4 3h3.5l2 5-2.2 1.6a12 12 0 0 0 6.1 6.1L15 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" />,
  mail: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3.5 2" />
    </>
  ),
  facebook: <path d="M14.5 8.5h2.5V5.2h-2.6c-2.4 0-4 1.6-4 4.1v1.9H8v3.3h2.4V21h3.4v-6.5h2.4l.5-3.3h-2.9V9.6c0-.7.3-1.1 1.3-1.1Z" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
      <path d="m10.5 9.5 5 2.5-5 2.5Z" fill="currentColor" stroke="none" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.5 13.8 7 21l5-2.4L17 21l-1.5-7.2" />
    </>
  ),
  swimmer: (
    <>
      <circle cx="17" cy="7" r="1.8" />
      <path d="M4 11.5c1.6-1.4 3.2-1.4 4.8 0 1.6 1.4 3.2 1.4 4.8 0 1.6-1.4 3.2-1.4 4.8 0" />
      <path d="M4 16.5c1.6-1.4 3.2-1.4 4.8 0 1.6 1.4 3.2 1.4 4.8 0 1.6-1.4 3.2-1.4 4.8 0" />
      <path d="m8 10 4-2.5 3 2" />
    </>
  ),
  medal: (
    <>
      <path d="m8 3 2.5 5M16 3l-2.5 5" />
      <circle cx="12" cy="14.5" r="6" />
      <path d="m12 11.5 1 2 2.2.3-1.6 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.6 2.2-.3Z" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5.5H4.5V8a3 3 0 0 0 3 3M17 5.5h2.5V8a3 3 0 0 1-3 3" />
      <path d="M12 14v3.5M8.5 21h7l-.8-3.5H9.3Z" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  'chevron-down': <path d="m6 9.5 6 6 6-6" />,
  'chevron-left': <path d="m15 5-7 7 7 7" />,
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  close: <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />,
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  'arrow-right': <path d="M4 12h15M13 6l6 6-6 6" />,
  ruler: (
    <>
      <rect x="2.5" y="8.5" width="19" height="7" rx="1.5" />
      <path d="M7 8.5v3M11 8.5v3M15 8.5v3M19 8.5v3" />
    </>
  ),
  'thumbs-up': (
    <>
      <path d="M7 21V10l4-7 1.2.6c.9.5 1.3 1.6 1 2.6L12.2 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7Z" />
      <rect x="2.5" y="10" width="4.5" height="11" rx="1" />
    </>
  ),
  heart: (
    <path d="M12 20.3 4.6 13a4.7 4.7 0 0 1 0-6.7 4.7 4.7 0 0 1 6.7 0l.7.7.7-.7a4.7 4.7 0 0 1 6.7 0 4.7 4.7 0 0 1 0 6.7L12 20.3Z" />
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M3 20c0-3.3 2.7-5.4 6-5.4s6 2.1 6 5.4" />
      <path d="M16 4.6a3.4 3.4 0 0 1 0 6.8M17.5 14.9c2.1.7 3.5 2.4 3.5 5.1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3.2v3.6M16 3.2v3.6" />
    </>
  ),
  'file-text': (
    <>
      <path d="M14 3.2H7a2 2 0 0 0-2 2v13.6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.2L14 3.2Z" />
      <path d="M13.8 3.4v5h5M8.6 13h6.8M8.6 16.6h4.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 21s7.2-3.3 7.2-9V5.9L12 3.2 4.8 5.9V12c0 5.7 7.2 9 7.2 9Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3.5 1.7 4.4 4.4 1.7-4.4 1.7L12 15.7l-1.7-4.4L5.9 9.6l4.4-1.7L12 3.5Z" />
      <path d="m18.5 15.5.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </>
  ),
  quote: (
    <path
      d="M9.4 5.6c-3 1.4-4.9 4-4.9 7.4V19h6.4v-6H7.3c0-2.3.9-3.8 2.9-4.8l-.8-2.6Zm9.6 0c-3 1.4-4.9 4-4.9 7.4V19h6.4v-6h-3.6c0-2.3.9-3.8 2.9-4.8L19 5.6Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  'arrow-down': <path d="M12 4.5v15M6 13.5l6 6 6-6" />,
  external: (
    <>
      <path d="M13.5 4.5H19.5v6" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18 14.2v4.3a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6h4.3" />
    </>
  ),
};

export default function Icon({ name, className = 'h-5 w-5' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
