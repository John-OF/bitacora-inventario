import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId, useState } from 'react'
import { IconoOjo, IconoOjoTachado } from './iconos'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  ayuda?: ReactNode
}

export function Campo({ etiqueta, ayuda, className = '', id, type, ...props }: Props) {
  const generado = useId()
  const inputId = id ?? generado

  // Para campos de contraseña ofrecemos un botón "ojito" que alterna mostrar/ocultar.
  const esContrasena = type === 'password'
  const [mostrar, setMostrar] = useState(false)
  const tipoEfectivo = esContrasena && mostrar ? 'text' : type

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-base font-semibold text-slate-700 dark:text-slate-200">
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={tipoEfectivo}
          className={`min-h-[52px] w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none focus:border-marca dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-400 ${esContrasena ? 'pr-14' : ''} ${className}`}
          {...props}
        />
        {esContrasena && (
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 active:text-marca dark:text-slate-400 dark:active:text-teal-300"
          >
            {mostrar ? (
              <IconoOjoTachado className="h-6 w-6" aria-hidden />
            ) : (
              <IconoOjo className="h-6 w-6" aria-hidden />
            )}
          </button>
        )}
      </div>
      {ayuda && <p className="text-sm text-slate-500 dark:text-slate-400">{ayuda}</p>}
    </div>
  )
}
