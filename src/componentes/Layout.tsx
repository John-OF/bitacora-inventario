import type { ComponentType, ReactNode, SVGProps } from 'react'
import { NavLink } from 'react-router-dom'
import { IconoCaja, IconoLapiz, IconoLista } from './iconos'
import { BotonTema } from './BotonTema'

const enlaces: { a: string; etiqueta: string; Icono: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { a: '/productos', etiqueta: 'Productos', Icono: IconoCaja },
  { a: '/registrar', etiqueta: 'Registrar', Icono: IconoLapiz },
  { a: '/historial', etiqueta: 'Historial', Icono: IconoLista },
]

interface Props {
  children: ReactNode
  titulo: string
  accion?: ReactNode
}

/** Estructura común: cabecera + contenido + barra de navegación inferior (móvil-primero). */
export function Layout({ children, titulo, accion }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-slate-100 dark:bg-slate-950">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-marca px-4 py-3 text-white shadow">
        <h1 className="truncate text-lg font-bold">{titulo}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <BotonTema className="rounded-lg bg-white/15 p-2 text-white active:bg-white/25" />
          {accion}
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {enlaces.map(({ a, etiqueta, Icono }) => (
          <NavLink
            key={a}
            to={a}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'text-marca dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Icono className="h-6 w-6" aria-hidden />
            {etiqueta}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
