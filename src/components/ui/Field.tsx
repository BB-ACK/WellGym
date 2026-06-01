import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  suffix?: ReactNode
}

export function Field({ label, suffix, className = '', ...props }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span>{label}</span>
      <span className="flex min-h-12 items-center rounded-lg border border-ink/10 bg-white px-3 focus-within:border-mint">
        <input className={`w-full bg-transparent py-3 outline-none ${className}`} {...props} />
        {suffix ? <span className="ml-2 text-xs text-ink/50">{suffix}</span> : null}
      </span>
    </label>
  )
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
}

export function TextAreaField({ label, className = '', ...props }: TextAreaFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span>{label}</span>
      <textarea
        className={`min-h-24 resize-none rounded-lg border border-ink/10 bg-white p-3 outline-none focus:border-mint ${className}`}
        {...props}
      />
    </label>
  )
}
