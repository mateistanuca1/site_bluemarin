'use client';

import { cx } from '@/lib/utils';

type Common = {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
};

const base =
  'w-full border border-black/15 bg-white px-4 py-3 text-[14px] text-ink placeholder:text-muted/70 ' +
  'transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand ' +
  'disabled:cursor-not-allowed disabled:bg-black/5';

function Wrap({
  label,
  name,
  required,
  hint,
  error,
  className,
  children,
}: Common & { children: React.ReactNode }) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide2 text-ink/75"
      >
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[12px] text-muted">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-[12px] font-medium text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  defaultValue,
  ...rest
}: Common & {
  type?: 'text' | 'email' | 'tel' | 'number';
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  defaultValue?: string;
}) {
  return (
    <Wrap {...rest}>
      <input
        id={rest.name}
        name={rest.name}
        type={type}
        required={rest.required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        defaultValue={defaultValue}
        aria-invalid={rest.error ? true : undefined}
        aria-describedby={rest.error ? `${rest.name}-error` : undefined}
        className={cx(base, rest.error && 'border-accent')}
      />
    </Wrap>
  );
}

export function TextArea({
  placeholder,
  rows = 4,
  ...rest
}: Common & { placeholder?: string; rows?: number }) {
  return (
    <Wrap {...rest}>
      <textarea
        id={rest.name}
        name={rest.name}
        rows={rows}
        required={rest.required}
        placeholder={placeholder}
        aria-invalid={rest.error ? true : undefined}
        aria-describedby={rest.error ? `${rest.name}-error` : undefined}
        className={cx(base, 'resize-y', rest.error && 'border-accent')}
      />
    </Wrap>
  );
}

export function SelectField({
  options,
  placeholder,
  ...rest
}: Common & { options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <Wrap {...rest}>
      <select
        id={rest.name}
        name={rest.name}
        required={rest.required}
        defaultValue=""
        aria-invalid={rest.error ? true : undefined}
        aria-describedby={rest.error ? `${rest.name}-error` : undefined}
        className={cx(base, 'appearance-none bg-no-repeat pr-10', rest.error && 'border-accent')}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237a7a7a' stroke-width='1.8'%3E%3Cpath d='m6 9.5 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.1rem',
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrap>
  );
}

export function FileField({
  accept,
  ...rest
}: Common & { accept?: string }) {
  return (
    <Wrap {...rest}>
      <input
        id={rest.name}
        name={rest.name}
        type="file"
        accept={accept}
        required={rest.required}
        aria-invalid={rest.error ? true : undefined}
        aria-describedby={rest.error ? `${rest.name}-error` : undefined}
        className={cx(
          'w-full border border-black/15 bg-white text-[13px] text-ink/80',
          'file:mr-4 file:cursor-pointer file:border-0 file:border-r file:border-black/10',
          'file:bg-brand-soft file:px-4 file:py-3 file:text-[12px] file:font-semibold',
          'file:uppercase file:tracking-wide2 file:text-brand hover:file:bg-brand hover:file:text-white',
          rest.error && 'border-accent',
        )}
      />
    </Wrap>
  );
}

export function CheckboxField({
  name,
  required,
  error,
  children,
}: {
  name: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="flex cursor-pointer items-start gap-3">
        <input
          id={name}
          name={name}
          type="checkbox"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand"
        />
        <span className="text-[13px] font-light leading-relaxed text-ink/80">
          {children}
          {required && <span className="ml-1 text-accent">*</span>}
        </span>
      </label>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-[12px] font-medium text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
  variant = 'primary',
}: {
  pending: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'light';
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cx(
        'btn w-full disabled:cursor-wait disabled:opacity-60',
        variant === 'light' ? 'btn-light' : 'btn-primary',
      )}
    >
      {pending && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {pending ? 'Se trimite…' : children}
    </button>
  );
}

export function FormStatus({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={cx(
        'border-l-4 px-4 py-3 text-[13px] leading-relaxed',
        state.ok
          ? 'border-brand bg-brand-soft text-deep-dark'
          : 'border-accent bg-accent/10 text-ink',
      )}
    >
      {state.message}
    </p>
  );
}
