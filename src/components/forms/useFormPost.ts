'use client';

import { useCallback, useState } from 'react';

import { publicApiBase } from '@/lib/public-api';

export type PostState = { ok: boolean; message: string } | null;

const GENERIC_ERROR =
  'Nu am putut trimite formularul. Te rugam sa incerci din nou sau sa ne suni la 0744 258 258.';

/**
 * Trimite un formular catre backend si tine minte starea (in curs / reusit / eroare).
 * Accepta fie un obiect simplu (trimis ca JSON), fie FormData (pentru fisiere).
 */
export function useFormPost(path: string) {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<PostState>(null);

  const reset = useCallback(() => setState(null), []);

  const submit = useCallback(
    async (payload: Record<string, unknown> | FormData, successMessage: string) => {
      setPending(true);
      setState(null);

      try {
        const isForm = payload instanceof FormData;
        const res = await fetch(`${publicApiBase()}${path}`, {
          method: 'POST',
          headers: isForm ? undefined : { 'Content-Type': 'application/json' },
          body: isForm ? payload : JSON.stringify(payload),
        });

        // Backend-ul poate raspunde cu HTML daca ceva e prost configurat.
        let data: { error?: string; message?: string } = {};
        try {
          data = await res.json();
        } catch {
          /* ignoram — folosim mesajul generic */
        }

        if (!res.ok) {
          setState({ ok: false, message: data.error ?? GENERIC_ERROR });
          return false;
        }

        setState({ ok: true, message: data.message ?? successMessage });
        return true;
      } catch {
        setState({ ok: false, message: GENERIC_ERROR });
        return false;
      } finally {
        setPending(false);
      }
    },
    [path],
  );

  return { submit, pending, state, reset };
}
