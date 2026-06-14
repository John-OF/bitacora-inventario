import type { ReactNode } from 'react'

type Tipo = 'error' | 'exito' | 'info'

const estilos: Record<Tipo, string> = {
  error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900',
  exito: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-200 dark:border-green-900',
  info: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-900',
}

export function Aviso({ tipo = 'info', children }: { tipo?: Tipo; children: ReactNode }) {
  return <div className={`rounded-xl border px-4 py-3 text-base ${estilos[tipo]}`}>{children}</div>
}
