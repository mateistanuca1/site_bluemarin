/** Tipurile pentru tot conținutul site-ului. Oglindesc fișierele din content/. */

export type Link = { label: string; href: string };

export type NavItem = Link & { children?: Link[] };

export type Site = {
  name: string;
  legalName: string;
  tagline: string;
  quote: string;
  logo: string;
  seo: { title: string; description: string; keywords: string[] };
  company: { legalName: string; cif: string; registeredOffice: string };
  contact: {
    phone: string;
    phoneHref: string;
    phoneLabel?: string;
    phoneSecondary?: string;
    phoneSecondaryHref?: string;
    phoneSecondaryLabel?: string;
    email: string;
    address: string;
    mapEmbed: string;
  };
  social: { facebook: string; instagram: string; youtube: string };
  socialCards: { network: 'facebook' | 'instagram' | 'youtube'; label: string; caption: string }[];
  nav: NavItem[];
  headerCta?: Link;
  footerLinks: Link[];
  schedule: { label: string; lines: string[] }[];
};

export type Home = {
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    image: string;
    /** Ex. "50% 32%" — ce parte din fotografie ramane vizibila. */
    imagePosition?: string;
    primaryCta: Link;
    secondaryCta: Link;
    highlights?: string[];
  };
  intro: { title: string; paragraphs: string[] };
  values: {
    title: string;
    lead?: string;
    items: { title: string; text: string; icon?: string }[];
  };
  philosophy: { title: string; text: string; quote: string; cite: string; image: string };
  academy: {
    title: string;
    text: string;
    image: string;
    cards: { title: string; text: string; href: string }[];
  };
  team: { title: string; lead: string; featured: string[]; cta: Link };
  experience: {
    title: string;
    lead: string;
    counters: { to: number; label: string; icon: string; separator?: string }[];
  };
  testimonials: { title: string; lead: string; items: { author: string; text: string }[] };
  contactSection: { title: string; formTitle: string; formLead: string; image: string };
};

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  shortRole: string;
  quote: string;
  photo: string;
  bio: string[];
};

export type Team = { title: string; lead: string; members: TeamMember[] };

export type Package = {
  sessions: number;
  label: string;
  price: number;
  /** Pachetul evidentiat ca "cel mai ales" in lista de tarife. */
  featured?: boolean;
};

export type PricingCategory = {
  id: string;
  name: string;
  note: string;
  packages: Package[];
};

export type PricingLocation = {
  slug: string;
  name: string;
  address: string;
  schedule: string[];
  categories: PricingCategory[];
};

export type Pricing = {
  title: string;
  lead: string;
  currency: string;
  commonConditions: string[];
  locations: PricingLocation[];
};

export type LocationItem = {
  slug: string;
  name: string;
  shortName: string;
  address: string;
  mapEmbed: string;
  hero: string;
  intro: string;
  specs: { label: string; value: string }[];
  schedule: string[];
  sections: { title: string; text: string }[];
  galleryNote: string;
};

export type Locations = { title: string; lead: string; items: LocationItem[] };

export type Courses = {
  title: string;
  quote: string;
  hero: string;
  intro: string[];
  credentials: { title: string; items: { title: string; text: string }[] };
  stages: { title: string; items: { title: string; text: string }[] };
  materials: { title: string; groups: { label: string; items: string[] }[] };
  formats: { title: string; items: { title: string; subtitle: string; text: string }[] };
  instructors: { title: string; text: string };
  enrollment: { title: string; steps: { title: string; text: string }[] };
};

export type Kids = {
  title: string;
  quote: string;
  hero: string;
  subtitle: string;
  intro: string[];
  acclimatisation: {
    title: string;
    text: string;
    materials: string[];
    closing: string;
    image?: string;
  };
  levels: { title: string; items: { title: string; subtitle: string; text: string }[] };
  formats: { title: string; items: { title: string; text: string }[] };
};

export type Careers = {
  title: string;
  hero: string;
  lead: string;
  criteria: string[];
  formTitle: string;
  formLead: string;
};

export type Contact = {
  title: string;
  hero: string;
  formTitle: string;
  formLead: string;
  cards: { label: string; value: string; icon: string; href: string }[];
};

export type RulesSection = {
  title: string;
  intro?: string;
  items?: string[];
  groups?: { label: string; items: string[] }[];
  closing?: string;
};

export type Rules = {
  title: string;
  subtitle: string;
  hero: string;
  lead: string;
  sections: RulesSection[];
};

export type Gallery = {
  title: string;
  lead: string;
  images: { src: string; alt: string }[];
};

export type LegalPage = { slug: string; title: string; html: string };
export type Legal = { pages: LegalPage[] };

/** Toate colecțiile de conținut, pe nume de fișier. */
export type ContentMap = {
  site: Site;
  home: Home;
  team: Team;
  pricing: Pricing;
  locations: Locations;
  courses: Courses;
  kids: Kids;
  careers: Careers;
  contact: Contact;
  rules: Rules;
  gallery: Gallery;
  legal: Legal;
};

export type ContentKey = keyof ContentMap;
