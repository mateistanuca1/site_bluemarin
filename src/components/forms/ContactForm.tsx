'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { CheckboxField, FormStatus, SubmitButton, TextArea, TextField } from './Field';
import { useFormPost } from './useFormPost';

type Props = { onDark?: boolean };

export default function ContactForm({ onDark = false }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const { submit, pending, state } = useFormPost('/contact');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const ok = await submit(
      {
        name: String(fd.get('name') ?? '').trim(),
        email: String(fd.get('email') ?? '').trim(),
        subject: String(fd.get('subject') ?? '').trim(),
        message: String(fd.get('message') ?? '').trim(),
      },
      'Mesajul a fost trimis. Te contactam in cel mai scurt timp!',
    );

    if (ok) formRef.current?.reset();
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate={false}>
      <TextField label="Numele tau" name="name" required autoComplete="name" placeholder="Nume si prenume" />
      <TextField
        label="Emailul tau"
        name="email"
        type="email"
        inputMode="email"
        required
        autoComplete="email"
        placeholder="nume@exemplu.ro"
      />
      <TextField label="Subiect" name="subject" placeholder="Despre ce vrei sa vorbim?" />
      <TextArea label="Mesajul tau" name="message" required rows={5} placeholder="Scrie-ne aici…" />

      <CheckboxField name="gdpr" required>
        Sunt de acord cu{' '}
        <Link href="/politica-de-confidentialitate" className="text-brand underline">
          Politica de confidentialitate
        </Link>
      </CheckboxField>

      <FormStatus state={state} />
      <SubmitButton pending={pending} variant={onDark ? 'light' : 'primary'}>
        Trimite mesajul
      </SubmitButton>
    </form>
  );
}
