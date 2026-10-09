'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import Icon from '../Icon';
import {
  CheckboxField,
  FileField,
  FormStatus,
  SelectField,
  SubmitButton,
  TextField,
} from './Field';
import SignaturePad, { type SignaturePadHandle } from './SignaturePad';
import { useFormPost } from './useFormPost';

type Props = {
  /** Slug-ul locatiei, ex. "bazin-cs-rapid". */
  locationSlug: string;
  locationName: string;
};

const MAX_MB = 8;
const ACCEPT = 'image/*,.pdf';

const MONTHS = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
];

const CURRENT_YEAR = new Date().getFullYear();

const days = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: String(i + 1),
}));
const months = MONTHS.map((m, i) => ({ value: String(i + 1).padStart(2, '0'), label: m }));
const years = Array.from({ length: 90 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: String(y), label: String(y) };
});

type Errors = Partial<Record<'birthDate' | 'photo' | 'medical' | 'signature', string>>;

/**
 * Formularul complet de inscriere: date cursant, parinte/tutore, doua documente
 * si semnatura. Backend-ul genereaza PDF-ul si il trimite pe email.
 *
 * Inlocuieste scriptul Google Apps Script de pe site-ul vechi.
 */
export default function EnrollmentForm({ locationSlug, locationName }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const sigRef = useRef<SignaturePadHandle>(null);
  const [errors, setErrors] = useState<Errors>({});
  const { submit, pending, state } = useFormPost('/inscriere');

  function validateFile(value: FormDataEntryValue | null): string | undefined {
    if (!(value instanceof File) || value.size === 0) return 'Ataseaza un fisier.';
    if (value.size > MAX_MB * 1024 * 1024) return `Fisierul e prea mare. Maxim ${MAX_MB} MB.`;
    const ok = value.type.startsWith('image/') || value.type === 'application/pdf';
    return ok ? undefined : 'Accceptam doar imagini (JPG, PNG) sau PDF.';
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);
    const next: Errors = {};

    const day = String(fd.get('birthDay') ?? '');
    const month = String(fd.get('birthMonth') ?? '');
    const year = String(fd.get('birthYear') ?? '');

    if (!day || !month || !year) {
      next.birthDate = 'Alege ziua, luna si anul nasterii.';
    } else {
      // Respinge date inexistente, ex. 31 februarie.
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      if (d.getDate() !== Number(day) || d.getMonth() !== Number(month) - 1) {
        next.birthDate = 'Data nasterii nu este valida.';
      }
    }

    next.photo = validateFile(fd.get('photo'));
    next.medical = validateFile(fd.get('medical'));

    const signature = sigRef.current?.toBase64() ?? null;
    if (!signature) next.signature = 'Te rugam sa semnezi inainte de a trimite formularul.';

    const clean = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v),
    ) as Errors;
    setErrors(clean);

    if (Object.keys(clean).length > 0) {
      // Du utilizatorul la prima problema.
      formRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    fd.set('birthDate', `${day}/${month}/${year}`);
    fd.delete('birthDay');
    fd.delete('birthMonth');
    fd.delete('birthYear');
    fd.set('signature', signature!);
    fd.set('locationSlug', locationSlug);
    fd.set('locationName', locationName);

    const ok = await submit(
      fd,
      'Felicitari! Inscrierea a fost trimisa. Verifica emailul — ai primit o copie a fisei in format PDF.',
    );

    if (ok) {
      form.reset();
      sigRef.current?.clear();
    }
  }

  if (state?.ok) {
    return (
      <div className="border border-brand/30 bg-brand-soft px-6 py-12 text-center">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand">
          <Icon name="check" className="h-8 w-8" />
        </span>
        <h2 className="text-[19px] font-semibold uppercase tracking-wide2 text-deep-dark">
          Inscriere trimisa
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] font-light leading-relaxed text-ink/80">
          {state.message}
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Inapoi la prima pagina
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-8">
      <fieldset className="space-y-4" disabled={pending}>
        <legend className="mb-4 text-[13px] font-semibold uppercase tracking-headline text-brand">
          Date cursant
        </legend>

        <TextField
          label="Nume si prenume cursant"
          name="firstName"
          required
          autoComplete="name"
          placeholder="Nume si prenume"
        />

        <div>
          <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide2 text-ink/75">
            Data nasterii<span className="ml-1 text-accent">*</span>
          </span>
          <div className="grid grid-cols-3 gap-3">
            <SelectField label="Ziua" name="birthDay" options={days} placeholder="Zi" required
              error={errors.birthDate ? ' ' : undefined} className="[&>label]:sr-only" />
            <SelectField label="Luna" name="birthMonth" options={months} placeholder="Luna" required
              error={errors.birthDate ? ' ' : undefined} className="[&>label]:sr-only" />
            <SelectField label="Anul" name="birthYear" options={years} placeholder="An" required
              error={errors.birthDate ? ' ' : undefined} className="[&>label]:sr-only" />
          </div>
          {errors.birthDate && (
            <p className="mt-1.5 text-[12px] font-medium text-accent">{errors.birthDate}</p>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4" disabled={pending}>
        <legend className="mb-4 text-[13px] font-semibold uppercase tracking-headline text-brand">
          Parinte / reprezentant legal
        </legend>

        <TextField
          label="Nume si prenume"
          name="nameLegalParent"
          required
          placeholder="Numele parintelui sau tutorelui"
          hint="Daca cursantul este adult, scrie propriul nume."
        />
        <TextField
          label="Telefon"
          name="phone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="07xx xxx xxx"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          placeholder="nume@exemplu.ro"
          hint="Aici primesti fisa de inscriere in format PDF."
        />
      </fieldset>

      <fieldset className="space-y-4" disabled={pending}>
        <legend className="mb-4 text-[13px] font-semibold uppercase tracking-headline text-brand">
          Documente
        </legend>

        <FileField
          label="Certificat de nastere sau carte de identitate"
          name="photo"
          required
          accept={ACCEPT}
          hint={`Fotografie clara sau PDF, maxim ${MAX_MB} MB.`}
          error={errors.photo}
        />
        <FileField
          label="Aviz medical"
          name="medical"
          required
          accept={ACCEPT}
          hint="Adeverinta de la medicul de familie care atesta ca cursantul este apt pentru inot."
          error={errors.medical}
        />
      </fieldset>

      <fieldset disabled={pending}>
        <legend className="mb-4 text-[13px] font-semibold uppercase tracking-headline text-brand">
          Semnatura si acord
        </legend>

        <SignaturePad ref={sigRef} />
        {errors.signature && (
          <p className="mt-1.5 text-[12px] font-medium text-accent">{errors.signature}</p>
        )}

        <div className="mt-6">
          <CheckboxField name="terms" required>
            Am citit si accept{' '}
            <Link href="/regulament" className="text-brand underline">
              Regulamentul intern
            </Link>
            ,{' '}
            <Link href="/termeni-si-conditii" className="text-brand underline">
              Termenii si conditiile
            </Link>
            ,{' '}
            <Link href="/politica-de-confidentialitate" className="text-brand underline">
              Politica de confidentialitate
            </Link>{' '}
            si{' '}
            <Link href="/politica-de-cookies" className="text-brand underline">
              Politica de cookies
            </Link>
          </CheckboxField>
        </div>
      </fieldset>

      <FormStatus state={state} />

      <SubmitButton pending={pending}>Trimite inscrierea</SubmitButton>

      <p className="text-center text-[12px] leading-relaxed text-muted">
        La final primesti pe email un PDF cu toate informatiile completate, iar un exemplar este
        salvat in sistemul nostru intern.
      </p>
    </form>
  );
}
