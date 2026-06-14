import type { ReactNode, SelectHTMLAttributes } from 'react'
import { useId } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string
  children: ReactNode
}

export function Select({ etiqueta, children, className = '', id, ...props }: Props) {
  const generado = useId()
  const selectId = id ?? generado
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-base font-semibold text-slate-700 dark:text-slate-200">
        {etiqueta}
      </label>
      <select
        id={selectId}
        className={`min-h-[52px] rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none focus:border-marca dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-400 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
