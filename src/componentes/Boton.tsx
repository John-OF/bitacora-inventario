import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variante?: Variante
  cargando?: boolean
  ancho?: boolean
}

const estilos: Record<Variante, string> = {
  primario: 'bg-marca text-white active:bg-marca-oscuro disabled:bg-marca/50',
  secundario:
    'bg-white text-marca border-2 border-marca active:bg-marca-claro disabled:opacity-50 dark:bg-slate-800 dark:text-teal-300 dark:border-teal-500 dark:active:bg-slate-700',
  peligro: 'bg-red-600 text-white active:bg-red-700 disabled:bg-red-300',
}

export function Boton({
  children,
  variante = 'primario',
  cargando = false,
  ancho = false,
  className = '',
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={`min-h-[52px] rounded-xl px-5 py-3 text-lg font-semibold shadow-sm transition-colors disabled:cursor-not-allowed ${estilos[variante]} ${ancho ? 'w-full' : ''} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando ? 'Un momento…' : children}
    </button>
  )
}
