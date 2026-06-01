import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  suffix?: ReactNode
}

export function Field({ label, suffix, className = '', ...props }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink">
      <span>{label}</span>
      <span className="flex min-h-12 items-center rounded-xl bg-white px-3 shadow-line focus-within:shadow-[inset_0_0_0_2px_rgba(15,118,110,0.35)]">
        <input className={`w-full bg-transparent py-3 outline-none ${className}`} {...props} />
        {suffix ? <span className="ml-2 whitespace-nowrap text-xs text-ink/45">{suffix}</span> : null}
      </span>
    </label>
  )
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
}

export function TextAreaField({ label, className = '', ...props }: TextAreaFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink">
      <span>{label}</span>
      <textarea
        className={`min-h-24 resize-none rounded-xl bg-white p-3 shadow-line outline-none focus:shadow-[inset_0_0_0_2px_rgba(15,118,110,0.35)] ${className}`}
        {...props}
      />
    </label>
  )
}
