'use client';

import Icon from '../Icon';
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
  'w-full rounded border border-line bg-white px-4 py-3 text-[14.5px] text-ink ' +
  'placeholder:text-ink-muted/60 transition-colors ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-200 ' +
  'disabled:cursor-not-allowed disabled:bg-black/[0.03]';

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
        className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide2 text-ink-soft"
      >
        {label}
        {required && (
          <span className="ml-1 text-accent" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && <p className="mt-1.5 text-[12.5px] text-ink-muted">{hint}</p>}

      {error && error.trim() && (
        <p
          id={`${name}-error`}
          className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium text-accent-dark"
        >
          <Icon name="close" className="mt-[3px] h-3 w-3 shrink-0" />
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
        className={cx(base, rest.error && 'border-accent focus:ring-accent/25')}
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
        className={cx(base, 'resize-y', rest.error && 'border-accent focus:ring-accent/25')}
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
        className={cx(
          base,
          'appearance-none bg-no-repeat pr-10',
          rest.error && 'border-accent focus:ring-accent/25',
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7490' stroke-width='1.8' stroke-linecap='round'%3E%3Cpath d='m6 9.5 6 6 6-6'/%3E%3C/svg%3E\")",
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

export function FileField({ accept, ...rest }: Common & { accept?: string }) {
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
          'w-full cursor-pointer rounded border border-line bg-white text-[13.5px] text-ink-soft',
          'transition-colors hover:border-brand-300',
          'file:mr-4 file:cursor-pointer file:border-0 file:border-r file:border-line',
          'file:bg-brand-50 file:px-4 file:py-3 file:text-[12px] file:font-bold',
          'file:uppercase file:tracking-wide2 file:text-brand-700',
          'hover:file:bg-brand hover:file:text-white',
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
      <label
        htmlFor={name}
        className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-white p-4
                   transition-colors hover:border-brand-300"
      >
        <input
          id={name}
          name={name}
          type="checkbox"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-brand"
        />
        <span className="text-[13.5px] leading-relaxed text-ink-soft">
          {children}
          {required && (
            <span className="ml-1 text-accent" aria-hidden="true">
              *
            </span>
          )}
        </span>
      </label>

      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-[12.5px] font-medium text-accent-dark">
          {error}
        </p>
      )}
    </div>
  );
}

/** Comutator intre doua variante (ex. minor / adult). */
export function ToggleGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide2 text-ink-soft">
        {label}
      </span>
      <div className="grid grid-cols-2 gap-2 rounded-card border border-line bg-brand-50 p-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={cx(
              'rounded px-4 py-2.5 text-[13px] font-bold uppercase tracking-wide2 transition-colors',
              o.value === value
                ? 'bg-brand text-white shadow-sm'
                : 'text-ink-soft hover:bg-white hover:text-brand',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
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
        'flex items-start gap-2.5 rounded border-l-[3px] px-4 py-3 text-[13.5px] leading-relaxed',
        state.ok
          ? 'border-brand bg-brand-50 text-deep-700'
          : 'border-accent bg-accent-soft text-ink',
      )}
    >
      <Icon
        name={state.ok ? 'check' : 'close'}
        className="mt-[3px] h-3.5 w-3.5 shrink-0"
      />
      {state.message}
    </p>
  );
}
