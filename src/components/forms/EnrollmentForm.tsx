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
  ToggleGroup,
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

type Field =
  | 'firstName'
  | 'birthDate'
  | 'nameLegalParent'
  | 'phone'
  | 'email'
  | 'photo'
  | 'medical'
  | 'signature'
  | 'terms';

type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/;
type Who = 'minor' | 'adult';

/** Antetul numerotat al unei sectiuni din formular. */
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-5 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
          {n}
        </span>
        <span className="text-[13px] font-bold uppercase tracking-label text-ink">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

/**
 * Formularul complet de inscriere: date cursant, parinte/tutore (doar pentru
 * minori), cele doua documente medicale si semnatura. Backend-ul genereaza
 * PDF-ul, il trimite pe email si il arhiveaza.
 */
export default function EnrollmentForm({ locationSlug, locationName }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const sigRef = useRef<SignaturePadHandle>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [who, setWho] = useState<Who>('minor');
  const { submit, pending, state } = useFormPost('/inscriere');

  function validateFile(value: FormDataEntryValue | null): string | undefined {
    if (!(value instanceof File) || value.size === 0) return 'Atașează un fișier.';
    if (value.size > MAX_MB * 1024 * 1024) return `Fișierul e prea mare. Maximum ${MAX_MB} MB.`;
    const ok = value.type.startsWith('image/') || value.type === 'application/pdf';
    return ok ? undefined : 'Acceptăm doar imagini (JPG, PNG) sau PDF.';
  }

  function text(fd: FormData, name: string): string {
    return String(fd.get(name) ?? '').trim();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);
    const next: Errors = {};

    if (text(fd, 'firstName').length < 3) {
      next.firstName = 'Scrie numele și prenumele cursantului.';
    }

    const day = String(fd.get('birthDay') ?? '');
    const month = String(fd.get('birthMonth') ?? '');
    const year = String(fd.get('birthYear') ?? '');

    if (!day || !month || !year) {
      next.birthDate = 'Alege ziua, luna și anul nașterii.';
    } else {
      // Respinge date inexistente, ex. 31 februarie.
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      if (d.getDate() !== Number(day) || d.getMonth() !== Number(month) - 1) {
        next.birthDate = 'Data nașterii nu este validă.';
      }
    }

    if (who === 'minor' && text(fd, 'nameLegalParent').length < 3) {
      next.nameLegalParent = 'Scrie numele părintelui sau al tutorelui.';
    }

    if (text(fd, 'phone').replace(/\D/g, '').length < 10) {
      next.phone = 'Scrie un număr de telefon valid, cu cel puțin 10 cifre.';
    }

    if (!EMAIL_RE.test(text(fd, 'email'))) {
      next.email = 'Scrie o adresă de e-mail validă.';
    }

    next.photo = validateFile(fd.get('photo'));
    next.medical = validateFile(fd.get('medical'));

    const signature = sigRef.current?.toBase64() ?? null;
    if (!signature) next.signature = 'Te rugăm să semnezi înainte de a trimite formularul.';

    if (!fd.get('terms')) {
      next.terms = 'Trebuie să accepți regulamentul și politicile ca să te poți înscrie.';
    }

    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v)) as Errors;
    setErrors(clean);

    if (Object.keys(clean).length > 0) {
      // Du utilizatorul la prima problema si pune cursorul acolo.
      const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first?.focus?.({ preventScroll: true });
      return;
    }

    fd.set('birthDate', `${day}/${month}/${year}`);
    fd.delete('birthDay');
    fd.delete('birthMonth');
    fd.delete('birthYear');
    fd.set('signature', signature!);
    fd.set('locationSlug', locationSlug);
    fd.set('locationName', locationName);
    fd.set('enrolleeType', who);

    // Pentru adulti, semnatarul este cursantul insusi.
    if (who === 'adult') fd.set('nameLegalParent', String(fd.get('firstName') ?? ''));

    const ok = await submit(
      fd,
      'Felicitări! Înscrierea a fost trimisă. Verifică e-mailul — ai primit o copie a fișei în format PDF.',
    );

    if (ok) {
      form.reset();
      sigRef.current?.clear();
    }
  }

  if (state?.ok) {
    return (
      <div className="rounded-card border border-brand-200 bg-brand-50 px-6 py-12 text-center">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand shadow-card">
          <Icon name="check" className="h-8 w-8" />
        </span>
        <h2 className="text-[19px] font-bold uppercase tracking-wide2 text-deep-700">
          Înscriere trimisă
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          {state.message}
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Înapoi la prima pagină
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-10">
      <Step n={1} title="Date cursant">
        <ToggleGroup<Who>
          label="Cursantul este"
          value={who}
          onChange={setWho}
          options={[
            { value: 'minor', label: 'Copil (sub 18 ani)' },
            { value: 'adult', label: 'Adult' },
          ]}
        />

        <TextField
          label="Nume și prenume cursant"
          name="firstName"
          required
          autoComplete="name"
          placeholder="Nume și prenume"
          error={errors.firstName}
        />

        <div>
          <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide2 text-ink-soft">
            Data nașterii
            <span className="ml-1 text-accent" aria-hidden="true">
              *
            </span>
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            <SelectField
              label="Ziua"
              name="birthDay"
              options={days}
              placeholder="Zi"
              required
              error={errors.birthDate ? ' ' : undefined}
              className="[&>label]:sr-only"
            />
            <SelectField
              label="Luna"
              name="birthMonth"
              options={months}
              placeholder="Luna"
              required
              error={errors.birthDate ? ' ' : undefined}
              className="[&>label]:sr-only"
            />
            <SelectField
              label="Anul"
              name="birthYear"
              options={years}
              placeholder="An"
              required
              error={errors.birthDate ? ' ' : undefined}
              className="[&>label]:sr-only"
            />
          </div>
          {errors.birthDate && (
            <p className="mt-1.5 text-[12.5px] font-medium text-accent-dark">{errors.birthDate}</p>
          )}
        </div>
      </Step>

      <Step n={2} title={who === 'minor' ? 'Părinte / reprezentant legal' : 'Date de contact'}>
        {who === 'minor' && (
          <TextField
            label="Nume și prenume părinte / tutore"
            name="nameLegalParent"
            required
            autoComplete="name"
            placeholder="Numele părintelui sau al tutorelui"
            hint="Persoana care semnează fișa de înscriere."
            error={errors.nameLegalParent}
          />
        )}

        <TextField
          label="Telefon"
          name="phone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="07xx xxx xxx"
          error={errors.phone}
        />

        <TextField
          label="E-mail"
          name="email"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          placeholder="nume@exemplu.ro"
          hint="Aici primești fișa de înscriere în format PDF."
          error={errors.email}
        />
      </Step>

      <Step n={3} title="Documente medicale">
        <FileField
          label="Aviz epidemiologic"
          name="photo"
          required
          accept={ACCEPT}
          hint={`De la medicul de familie. Fotografie clară sau PDF, maximum ${MAX_MB} MB.`}
          error={errors.photo}
        />
        <FileField
          label="Adeverință „apt efort fizic”"
          name="medical"
          required
          accept={ACCEPT}
          hint="Adeverința care atestă că cursantul este apt pentru efort fizic."
          error={errors.medical}
        />
      </Step>

      <Step n={4} title="Semnătură și acord">
        <SignaturePad ref={sigRef} />
        {errors.signature && (
          <p className="text-[12.5px] font-medium text-accent-dark">{errors.signature}</p>
        )}

        <div className="pt-2">
          <CheckboxField name="terms" required error={errors.terms}>
            Am citit și accept{' '}
            <Link href="/regulament" className="font-medium text-brand underline underline-offset-2">
              Regulamentul intern
            </Link>
            ,{' '}
            <Link
              href="/termeni-si-conditii"
              className="font-medium text-brand underline underline-offset-2"
            >
              Termenii și condițiile
            </Link>
            ,{' '}
            <Link
              href="/politica-de-confidentialitate"
              className="font-medium text-brand underline underline-offset-2"
            >
              Politica de confidențialitate
            </Link>{' '}
            și{' '}
            <Link
              href="/politica-de-cookies"
              className="font-medium text-brand underline underline-offset-2"
            >
              Politica de cookies
            </Link>
          </CheckboxField>
        </div>
      </Step>

      <div className="space-y-4 border-t border-line pt-7">
        <FormStatus state={state} />

        <SubmitButton pending={pending}>Trimite înscrierea</SubmitButton>

        <p className="text-center text-[12.5px] leading-relaxed text-ink-muted">
          La final primești pe e-mail un PDF cu toate informațiile completate, iar un exemplar
          rămâne arhivat la noi.
        </p>
      </div>
    </form>
  );
}
