'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import { CheckboxField, FileField, FormStatus, SubmitButton, TextArea, TextField } from './Field';
import { useFormPost } from './useFormPost';

const MAX_CV_MB = 8;

export default function CareerForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [fileError, setFileError] = useState<string>();
  const { submit, pending, state } = useFormPost('/cariere');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFileError(undefined);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const cv = fd.get('cv');

    if (!(cv instanceof File) || cv.size === 0) {
      setFileError('Ataseaza CV-ul tau (PDF, DOC sau imagine).');
      return;
    }
    if (cv.size > MAX_CV_MB * 1024 * 1024) {
      setFileError(`Fisierul e prea mare. Maxim ${MAX_CV_MB} MB.`);
      return;
    }

    const ok = await submit(fd, 'Am primit CV-ul tau. Te contactam in cel mai scurt timp!');
    if (ok) form.reset();
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <TextField label="Nume si prenume" name="name" required autoComplete="name" />
      <TextField label="Email" name="email" type="email" inputMode="email" required autoComplete="email" />
      <TextField
        label="Telefon"
        name="phone"
        type="tel"
        inputMode="tel"
        required
        autoComplete="tel"
        placeholder="07xx xxx xxx"
      />
      <TextArea
        label="Cateva cuvinte despre tine"
        name="message"
        rows={4}
        placeholder="Experienta, atestate, disponibilitate…"
      />
      <FileField
        label="CV-ul tau"
        name="cv"
        required
        accept=".pdf,.doc,.docx,image/*"
        hint={`PDF, DOC sau imagine, maxim ${MAX_CV_MB} MB.`}
        error={fileError}
      />

      <CheckboxField name="gdpr" required>
        Sunt de acord cu prelucrarea datelor conform{' '}
        <Link href="/politica-de-confidentialitate" className="text-brand underline">
          Politicii de confidentialitate
        </Link>
      </CheckboxField>

      <FormStatus state={state} />
      <SubmitButton pending={pending}>Trimite CV-ul</SubmitButton>
    </form>
  );
}
