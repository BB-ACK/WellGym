import type { ButtonHTMLAttributes, ReactNode } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
  active?: boolean
}

export function IconButton({ label, children, active, className = '', ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`grid h-11 w-11 place-items-center rounded-full border text-ink transition active:scale-95 ${
        active ? 'border-mint bg-mint text-white' : 'border-ink/10 bg-white'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
