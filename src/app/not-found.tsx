import Link from 'next/link';

import Section from '@/components/Section';

export default function NotFound() {
  return (
    <Section className="pt-36 lg:pt-44" size="lg">
      <div className="mx-auto max-w-lg text-center">
        <p aria-hidden="true" className="text-[72px] font-semibold leading-none text-brand/25">
          404
        </p>
        <h1 className="mt-6 text-[24px] font-semibold uppercase tracking-headline sm:text-[30px]">
          Pagina nu a fost gasita
        </h1>
        <p className="mt-5 text-[15px] font-light leading-relaxed text-ink/75">
          Se pare ca linkul pe care ai venit nu mai exista. Incearca din meniu sau intoarce-te la
          prima pagina.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn btn-primary">
            Prima pagina
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Contact
          </Link>
        </div>
      </div>
    </Section>
  );
}
