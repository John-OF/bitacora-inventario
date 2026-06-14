import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  ayuda?: ReactNode
}

export function Campo({ etiqueta, ayuda, className = '', id, ...props }: Props) {
  const generado = useId()
  const inputId = id ?? generado
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-base font-semibold text-slate-700 dark:text-slate-200">
        {etiqueta}
      </label>
      <input
        id={inputId}
        className={`min-h-[52px] rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none focus:border-marca dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-400 ${className}`}
        {...props}
      />
      {ayuda && <p className="text-sm text-slate-500 dark:text-slate-400">{ayuda}</p>}
    </div>
  )
}
