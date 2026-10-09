'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import Icon from '../Icon';
import { CheckboxField, FormStatus, SubmitButton, TextArea, TextField } from './Field';
import { useFormPost } from './useFormPost';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Ex. "Grup — 8 ședințe (480 lei)" */
  packageLabel: string;
  /** Ex. "Bazin C.S. Rapid" */
  locationName: string;
};

/**
 * Popup-ul de pe cardul de abonament — echivalentul Contact Form 7 + Popup Maker
 * de pe site-ul vechi. Pachetul si locatia merg la backend ca valori ascunse.
 */
export default function PackageDialog({ open, onClose, packageLabel, locationName }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { submit, pending, state, reset } = useFormPost('/cerere-pachet');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Curata starea cand se redeschide pentru alt pachet.
  useEffect(() => {
    if (open) {
      reset();
      formRef.current?.reset();
    }
  }, [open, packageLabel, reset]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    await submit(
      {
        name: String(fd.get('name') ?? '').trim(),
        email: String(fd.get('email') ?? '').trim(),
        phone: String(fd.get('phone') ?? '').trim(),
        age: String(fd.get('age') ?? '').trim(),
        message: String(fd.get('message') ?? '').trim(),
        package: packageLabel,
        location: locationName,
      },
      'Cererea a fost trimisă! Te contactăm pentru a stabili programul.',
    );
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      // Click pe fundalul intunecat inchide dialogul.
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="max-h-[90dvh] w-[min(560px,92vw)] overflow-y-auto rounded-card border-t-4 border-brand
                 bg-white p-0 shadow-card-hover backdrop:bg-deep-900/70 backdrop:backdrop-blur-sm
                 open:animate-scale-in"
      aria-labelledby="titlu-pachet"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white px-6 py-5">
        <div>
          <p className="label text-brand">
            Cerere abonament
          </p>
          <h2 id="titlu-pachet" className="mt-2 text-[17px] font-bold uppercase tracking-wide2">
            {packageLabel}
          </h2>
          <p className="mt-1 text-[13px] text-ink-muted">{locationName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Închide"
          className="-mr-2 -mt-1 rounded p-2 text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>

      {state?.ok ? (
        <div className="px-6 py-10 text-center">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand">
            <Icon name="check" className="h-7 w-7" />
          </span>
          <p className="text-[15px] leading-relaxed text-ink-soft">{state.message}</p>
          <button type="button" onClick={onClose} className="btn btn-outline mt-8">
            Închide
          </button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4 px-6 py-6">
          <TextField label="Nume" name="name" required autoComplete="name" placeholder="Nume și prenume" />
          <TextField
            label="E-mail"
            name="email"
            type="email"
            inputMode="email"
            required
            autoComplete="email"
            placeholder="nume@exemplu.ro"
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
            label="Vârsta cursantului (ani)"
            name="age"
            inputMode="numeric"
            placeholder="ex. 7"
          />
          <TextArea
            label="Preferințe oră / zi"
            name="message"
            rows={3}
            placeholder="ex. luni și miercuri, după ora 17:00"
          />

          <CheckboxField name="gdpr" required>
            Sunt de acord cu{' '}
            <Link
              href="/politica-de-confidentialitate"
              className="font-medium text-brand underline underline-offset-2"
            >
              Politica de confidențialitate
            </Link>
          </CheckboxField>

          <FormStatus state={state} />
          <SubmitButton pending={pending}>Trimite cererea</SubmitButton>
        </form>
      )}
    </dialog>
  );
}
