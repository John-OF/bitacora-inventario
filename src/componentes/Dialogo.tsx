import type { ReactNode } from 'react'
import { Boton } from './Boton'

interface Props {
  titulo: string
  children?: ReactNode
  textoConfirmar?: string
  textoCancelar?: string
  varianteConfirmar?: 'primario' | 'peligro'
  onConfirmar: () => void
  onCancelar: () => void
  cargando?: boolean
}

/** Diálogo de confirmación (modal). En móvil aparece anclado abajo; en pantallas grandes, centrado. */
export function Dialogo({
  titulo,
  children,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  varianteConfirmar = 'primario',
  onConfirmar,
  onCancelar,
  cargando = false,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{titulo}</h2>
        {children && <div className="mt-2 text-base text-slate-600 dark:text-slate-300">{children}</div>}
        <div className="mt-5 flex flex-col gap-3">
          <Boton variante={varianteConfirmar} onClick={onConfirmar} cargando={cargando} ancho>
            {textoConfirmar}
          </Boton>
          <Boton variante="secundario" onClick={onCancelar} disabled={cargando} ancho>
            {textoCancelar}
          </Boton>
        </div>
      </div>
    </div>
  )
}
